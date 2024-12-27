"use client"

import React, { useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const FoodTracker = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const webcamRef = React.useRef(null);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('foodHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('foodHistory', JSON.stringify(history));
  }, [history]);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: { exact: "environment" }
  };

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
      setShowCamera(false);
      analyzeFood(imageSrc);
    }
  }, [webcamRef]);

  const analyzeFood = async (imageSrc) => {
    setAnalyzing(true);
    setError(null);
    try {
      console.log('Starting analysis...');
      
      const requestBody = {
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze this food image. Return ONLY a JSON object with format {\"mainItem\": \"name of dish\", \"ingredients\": [\"ingredient1\", \"ingredient2\"]}"
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: "image/jpeg",
                  data: imageSrc.replace(/^data:image\/[a-z]+;base64,/, '')
                }
              }
            ]
          }
        ]
      };

      console.log('Sending request to API...');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        throw new Error(`API Error: ${data.error || 'Unknown error'}`);
      }

      if (!data.messages || !data.messages[0]?.content[0]?.text) {
        throw new Error('Invalid response format from API');
      }

      const analysisText = data.messages[0].content[0].text;
      console.log('Analysis text:', analysisText);

      let parsedResults;
      try {
        // Find the JSON object in the text
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }
        parsedResults = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Parse error:', e);
        throw new Error('Failed to parse analysis results');
      }

      console.log('Final results:', parsedResults);
      setResults(parsedResults);
      
      // Add to history
      const newEntry = {
        date: new Date().toLocaleString(),
        food: mockResults.mainItem,
        ingredients: mockResults.ingredients.join(", "),
        image: imageSrc
      };
      
      setHistory(prev => [newEntry, ...prev]);
      
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Food Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {!showCamera && !photo && (
              <div className="space-y-2">
                <Button 
                  onClick={() => setShowCamera(true)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Camera className="w-4 h-4" />
                  Open Camera
                </Button>
                <div className="relative">
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => document.getElementById('file-upload').click()}
                  >
                    Choose from Library
                  </Button>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setPhoto(reader.result);
                          analyzeFood(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {showCamera && (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="w-full h-[400px] object-cover"
                  onUserMediaError={(err) => {
                    console.error('Webcam error:', err);
                    if (err.name === 'OverconstrainedError') {
                      videoConstraints.facingMode = "environment";
                    }
                  }}
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <Button onClick={capturePhoto}>
                    Take Photo
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => setShowCamera(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {photo && (
              <div className="space-y-4">
                <img 
                  src={photo} 
                  alt="Captured food" 
                  className="w-full rounded-lg"
                />
                {analyzing ? (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing food...
                  </div>
                ) : results ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">Analysis Results:</h3>
                    <p><strong>Food:</strong> {results.mainItem}</p>
                    <p><strong>Ingredients:</strong></p>
                    <ul className="list-disc pl-5">
                      {results.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                <Button 
                  onClick={() => {
                    setPhoto(null);
                    setResults(null);
                  }} 
                  variant="outline"
                  className="w-full"
                >
                  Take New Photo
                </Button>
              </div>
            )}

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">History</h3>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-left">Food</th>
                      <th className="p-2 text-left">Ingredients</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr className="border-b">
                        <td className="p-2" colSpan={3}>No entries yet</td>
                      </tr>
                    ) : (
                      history.map((entry, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-2">{entry.date}</td>
                          <td className="p-2">{entry.food}</td>
                          <td className="p-2">{entry.ingredients}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FoodTracker;