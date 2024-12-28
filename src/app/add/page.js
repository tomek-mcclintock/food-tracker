"use client"

import React, { useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const AddFood = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [showWellnessCheck, setShowWellnessCheck] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [selectedStomach, setSelectedStomach] = useState(null);
  const [selectedEnergy, setSelectedEnergy] = useState(null);
  
  const webcamRef = React.useRef(null);

  const handleFileUpload = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Please choose an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
      setShowCamera(false);
    }
  };

  const submitWellnessCheck = () => {
    if (!selectedStomach || !selectedEnergy) {
      return;
    }

    const wellnessEntry = {
      date: new Date().toLocaleString(),
      type: 'wellness',
      stomach: selectedStomach,
      energy: selectedEnergy
    };
    
    const history = JSON.parse(localStorage.getItem('foodHistory') || '[]');
    history.unshift(wellnessEntry);
    localStorage.setItem('foodHistory', JSON.stringify(history));
    
    setShowWellnessCheck(false);
    setSelectedStomach(null);
    setSelectedEnergy(null);
  };

  const analyzeFood = async (description, imageSrc) => {
    setAnalyzing(true);
    setError(null);
    
    try {
      const content = [{
        type: "text",
        text: description 
          ? `Analyze this food: ${description}`
          : "Analyze this food."
      }];

      if (imageSrc) {
        const base64Data = imageSrc.split('base64,')[1];
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: base64Data
          }
        });
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: content
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Analysis failed');
      }

      const data = await response.json();
      const parsedResults = JSON.parse(data.content[0].text);
      setResults(parsedResults);

    } catch (err) {
      console.error('Error in analyzeFood:', err);
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="pb-20">
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <Button 
              onClick={() => setShowWellnessCheck(true)}
              className="w-full bg-green-500 hover:bg-green-600 text-white mb-4"
            >
              How I'm Feeling
            </Button>

            {showWellnessCheck && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h2 className="text-xl font-bold mb-4">How are you feeling?</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium mb-2">Stomach Comfort:</p>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          'Very Poor',
                          'Poor',
                          'Okay',
                          'Good',
                          'Excellent'
                        ].map(rating => (
                          <Button
                            key={rating}
                            variant={selectedStomach === rating ? "default" : "outline"}
                            onClick={() => setSelectedStomach(rating)}
                            className="w-full text-sm"
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="font-medium mb-2">Energy Levels:</p>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          'Very Low',
                          'Low',
                          'Moderate',
                          'High',
                          'Very High'
                        ].map(rating => (
                          <Button
                            key={rating}
                            variant={selectedEnergy === rating ? "default" : "outline"}
                            onClick={() => setSelectedEnergy(rating)}
                            className="w-full text-sm"
                          >
                            {rating}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Button 
                      onClick={submitWellnessCheck}
                      disabled={!selectedStomach || !selectedEnergy}
                      className="w-full bg-green-500 hover:bg-green-600 text-white"
                    >
                      Submit
                    </Button>

                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowWellnessCheck(false);
                        setSelectedStomach(null);
                        setSelectedEnergy(null);
                      }}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <textarea
                id="food-description"
                placeholder="Describe the food (optional)"
                className="w-full p-2 border rounded-lg resize-none"
                rows="2"
              />
              
              {!showCamera && !photo && (
                <>
                  <Button 
                    onClick={() => {
                      const description = document.getElementById('food-description')?.value?.trim();
                      if (!description) {
                        setError('Please provide a description');
                        return;
                      }
                      analyzeFood(description, null);
                    }} 
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    Analyze Description
                  </Button>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">or take a photo</span>
                    </div>
                  </div>
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
                </>
              )}
            </div>

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
                  <Button onClick={handlePhotoCapture}>Take Photo</Button>
                  <Button variant="destructive" onClick={() => setShowCamera(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {photo && !analyzing && !results && (
              <div className="space-y-4">
                <img src={photo} alt="Food" className="w-full rounded-lg" />
                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => {
                      const description = document.getElementById('food-description')?.value?.trim();
                      analyzeFood(description, photo);
                    }}
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    Confirm & Analyze Photo
                  </Button>
                  <Button 
                    onClick={() => {
                      setPhoto(null);
                    }} 
                    variant="outline"
                    className="w-full"
                  >
                    Retake Photo
                  </Button>
                </div>
              </div>
            )}

            {analyzing ? (
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" /> Analyzing...
              </div>
            ) : results && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><strong>Food:</strong> {results.mainItem}</p>
                  <p><strong>Ingredients:</strong></p>
                  <ul className="list-disc pl-5">
                    {results.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                  {results.sensitivities && results.sensitivities.length > 0 && (
                    <div className="mt-2">
                      <p><strong>Contains:</strong></p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {results.sensitivities.map((item, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Button 
                    onClick={() => {
                      const newEntry = {
                        date: new Date().toLocaleString(),
                        food: results.mainItem,
                        ingredients: results.ingredients.join(", "),
                        sensitivities: results.sensitivities || [],
                        type: 'food'
                      };
                      
                      const history = JSON.parse(localStorage.getItem('foodHistory') || '[]');
                      history.unshift(newEntry);
                      localStorage.setItem('foodHistory', JSON.stringify(history));

                      setPhoto(null);
                      setResults(null);
                      if (document.getElementById('food-description')) {
                        document.getElementById('food-description').value = '';
                      }
                    }} 
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    Confirm & Save
                  </Button>

                  <Button 
                    onClick={() => {
                      setPhoto(null);
                      setResults(null);
                      if (document.getElementById('food-description')) {
                        document.getElementById('food-description').value = '';
                      }
                    }} 
                    variant="outline"
                    className="w-full"
                  >
                    Take New Photo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddFood;