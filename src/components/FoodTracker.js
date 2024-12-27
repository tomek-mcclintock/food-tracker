"use client"

import React, { useState, useEffect } from 'react';
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

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('foodHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('foodHistory', JSON.stringify(history));
  }, [history]);

  const handleFileUpload = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Please choose an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      analyzeFood(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const analyzeFood = async (imageSrc) => {
    setAnalyzing(true);
    setError(null);
    try {
      const base64Data = imageSrc.split('base64,')[1];
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "claude-3-opus-20240229",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: [{
              type: "text",
              text: "Analyze this food image. Return ONLY a JSON object with format {\"mainItem\": \"name of dish\", \"ingredients\": [\"ingredient1\", \"ingredient2\"]}"
            }, {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Data
              }
            }]
          }]
        })
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error?.message || 'Analysis failed');

      const parsedResults = JSON.parse(data.content[0].text);
      setResults(parsedResults);

      // Add to history
      const newEntry = {
        date: new Date().toLocaleString(),
        food: parsedResults.mainItem,
        ingredients: parsedResults.ingredients.join(", ")
      };
      setHistory(prev => [newEntry, ...prev]);

    } catch (err) {
      setError(err.message);
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
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {!showCamera && !photo && (
              <div className="space-y-2">
                <Button onClick={() => setShowCamera(true)} className="w-full">
                  <Camera className="w-4 h-4 mr-2" /> Open Camera
                </Button>
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
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                />
              </div>
            )}

            {showCamera && (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: { exact: "environment" }
                  }}
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                  <Button onClick={() => {
                    const imageSrc = webcamRef.current?.getScreenshot();
                    if (imageSrc) {
                      setPhoto(imageSrc);
                      setShowCamera(false);
                      analyzeFood(imageSrc);
                    }
                  }}>Take Photo</Button>
                  <Button variant="destructive" onClick={() => setShowCamera(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {photo && (
              <div className="space-y-4">
                <img src={photo} alt="Food" className="w-full rounded-lg" />
                
                {analyzing ? (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
                  </div>
                ) : results && (
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
                )}

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
              <div className="border rounded-lg">
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
                        <tr key={index} className="border-b">
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