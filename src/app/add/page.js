// src/app/add/page.js
"use client"

import React, { useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WellnessCheck from '@/components/WellnessCheck';
import { useFoodHistory } from '@/hooks/useFoodHistory';
import { useAnalysis } from '@/hooks/useAnalysis';

const AddFood = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [showWellnessCheck, setShowWellnessCheck] = useState(false);
  const [photo, setPhoto] = useState(null);
  const webcamRef = React.useRef(null);

  // Use our custom hooks
  const { addEntry } = useFoodHistory();
  const { analyzing, results, error, analyzeFood } = useAnalysis();

  const handleFileUpload = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image too large. Please choose an image under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhoto(reader.result);
      const description = document.getElementById('food-description')?.value?.trim();
      analyzeFood(description, reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDescriptionAnalysis = () => {
    const description = document.getElementById('food-description')?.value?.trim();
    if (!description) return;
    analyzeFood(description, null);
  };

  const handlePhotoCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
      setShowCamera(false);
      const description = document.getElementById('food-description')?.value?.trim();
      analyzeFood(description, imageSrc);
    }
  };

  const handleSave = () => {
    const newEntry = {
      date: new Date().toLocaleString(),
      food: results.mainItem,
      ingredients: results.ingredients.join(", "),
      sensitivities: results.sensitivities || [],
      type: 'food'
    };
    
    addEntry(newEntry);
    setPhoto(null);
    if (document.getElementById('food-description')) {
      document.getElementById('food-description').value = '';
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
              <WellnessCheck 
                onClose={() => setShowWellnessCheck(false)}
                onSubmit={(entry) => {
                  addEntry(entry);
                  setShowWellnessCheck(false);
                }}
              />
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
                    onClick={handleDescriptionAnalysis} 
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

            {(analyzing || results) && (
              <div className="space-y-4">
                {photo && <img src={photo} alt="Food" className="w-full rounded-lg" />}
                
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
                        onClick={handleSave}
                        className="w-full bg-green-500 hover:bg-green-600 text-white"
                      >
                        Confirm & Save
                      </Button>

                      <Button 
                        onClick={() => analyzeFood(
                          document.getElementById('food-description')?.value?.trim(),
                          photo
                        )}
                        variant="outline"
                        className="w-full"
                      >
                        Reanalyze Photo
                      </Button>

                      <Button 
                        onClick={() => {
                          setPhoto(null);
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
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddFood;