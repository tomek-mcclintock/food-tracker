"use client"

import React, { useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, X, Loader2, PlusCircle, Info, ImagePlus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WellnessCheck from '@/components/WellnessCheck';
import { useFoodHistory } from '@/hooks/useFoodHistory';
import { useAnalysis } from '@/hooks/useAnalysis';

const AddFood = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [showWellnessCheck, setShowWellnessCheck] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  
  const webcamRef = React.useRef(null);
  const { addEntry } = useFoodHistory();
  const { analyzing, results, analyzeFood, setResults } = useAnalysis();

  const resetForm = () => {
    setPhoto(null);
    setResults(null);
    if (document.getElementById('food-description')) {
      document.getElementById('food-description').value = '';
    }
  };

  const handleFileUpload = (file) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('Image too large. Please choose an image under 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPhoto(reader.result);
    reader.readAsDataURL(file);
  };

  const handlePhotoCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
      setShowCamera(false);
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
    resetForm();
  };

  return (
    <div className="max-w-lg mx-auto pb-24 px-4">
      {/* Wellness Button - Floating at top */}
      <Button 
        onClick={() => setShowWellnessCheck(true)}
        size="lg"
        className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white shadow-lg mb-6 py-6 text-lg font-medium rounded-2xl transition-all duration-200 hover:shadow-xl"
      >
        <Info className="w-6 h-6 mr-2" />
        How am I feeling today?
      </Button>

      {!photo && !analyzing && !results && (
        <div className="space-y-4">
          {/* Description Input */}
          <Card className="shadow-lg border-0">
            <CardContent className="p-4 pt-4">
              <textarea
                id="food-description"
                placeholder="What did you eat? 🍽️"
                className="w-full p-4 text-lg border-none resize-none focus:ring-0 focus:outline-none"
                rows="3"
              />
              <Button 
                onClick={() => {
                  const description = document.getElementById('food-description')?.value?.trim();
                  if (!description) {
                    setError('Please describe what you ate');
                    return;
                  }
                  analyzeFood(description, null);
                }}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 text-lg mt-2 rounded-xl"
              >
                <PlusCircle className="w-5 h-5 mr-2" />
                Add Food
              </Button>
            </CardContent>
          </Card>

          {/* Photo Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => setShowCamera(true)}
              className="py-8 flex flex-col items-center gap-2 hover:bg-gray-50 border-2"
            >
              <Camera className="w-8 h-8" />
              <span>Take Photo</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => document.getElementById('file-upload').click()}
              className="py-8 flex flex-col items-center gap-2 hover:bg-gray-50 border-2"
            >
              <ImagePlus className="w-8 h-8" />
              <span>Upload Photo</span>
            </Button>
            <input
              id="file-upload"
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            />
          </div>
        </div>
      )}

      {/* Camera View */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50">
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              facingMode: { exact: "environment" }
            }}
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 px-4">
            <Button 
              onClick={handlePhotoCapture}
              size="lg"
              className="w-32 h-32 rounded-full bg-white text-black hover:bg-gray-100"
            >
              <Camera className="w-8 h-8" />
            </Button>
            <Button 
              onClick={() => setShowCamera(false)}
              size="lg"
              className="absolute top-4 right-4 rounded-full w-12 h-12 bg-black/50 hover:bg-black/70"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {/* Photo Review */}
      {photo && !analyzing && !results && (
        <Card className="shadow-xl border-0 overflow-hidden">
          <CardContent className="p-0">
            <img src={photo} alt="Food" className="w-full aspect-square object-cover" />
            <div className="p-4 space-y-4">
              <textarea
                id="food-description"
                placeholder="Add any details about the food..."
                className="w-full p-4 border rounded-xl resize-none text-lg"
                rows="2"
              />
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => {
                    const description = document.getElementById('food-description')?.value?.trim();
                    analyzeFood(description, photo);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-6 text-lg rounded-xl"
                >
                  Analyze
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setPhoto(null)}
                  className="py-6 text-lg rounded-xl border-2"
                >
                  Retake
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {analyzing && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
              <div className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>
          </div>
          <p className="text-lg text-gray-600">Analyzing your food...</p>
        </div>
      )}

      {/* Results View */}
      {results && (
        <Card className="shadow-xl border-0">
          <CardContent className="p-6">
            <h3 className="text-2xl font-semibold mb-6">{results.mainItem}</h3>
            
            <div className="space-y-6">
              <div>
                <p className="font-medium text-gray-600 mb-3">Ingredients</p>
                <ul className="space-y-2">
                  {results.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {results.sensitivities?.length > 0 && (
                <div>
                  <p className="font-medium text-gray-600 mb-3">Contains</p>
                  <div className="flex flex-wrap gap-2">
                    {results.sensitivities.map((item, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-4">
                <Button 
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white py-6 text-lg rounded-xl"
                >
                  Save
                </Button>
                <Button 
                  variant="outline"
                  onClick={resetForm}
                  className="py-6 text-lg rounded-xl border-2"
                >
                  Start Over
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-20 left-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl shadow-lg">
          {error}
        </div>
      )}

      {/* Wellness Check Modal */}
      {showWellnessCheck && (
        <WellnessCheck
          onClose={() => setShowWellnessCheck(false)}
          onSubmit={(entry) => {
            addEntry(entry);
            setShowWellnessCheck(false);
          }}
        />
      )}
    </div>
  );
};

export default AddFood;