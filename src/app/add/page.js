"use client"

import React, { useState, useRef } from 'react';
import { Info, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFoodHistory } from '@/hooks/useFoodHistory';
import { useAnalysis } from '@/hooks/useAnalysis';
import SuccessToast from '@/components/SuccessToast';
import InputSection from '@/components/food/InputSection';
import CameraSection from '@/components/food/CameraSection';
import ResultsSection from '@/components/food/ResultsSection';

// Add the helper function here
const getMealType = (date) => {
  const hour = date.getHours();
  if (hour < 11) return 'Breakfast';
  if (hour < 15) return 'Lunch';
  if (hour < 20) return 'Dinner';
  return 'Snack';
};

const AddFood = () => {
  const [showCamera, setShowCamera] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  
  const webcamRef = useRef(null);
  const { addEntry } = useFoodHistory();
  const { analyzing, results, analyzeFood, setResults } = useAnalysis();

  const handlePhotoCapture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setPhoto(imageSrc);
      setShowCamera(false);
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

  const handleSave = (resultsToSave) => {
    const now = new Date();
    const newEntry = {
      date: now.toISOString(), // Use ISO format instead of toLocaleString
      food: resultsToSave.mainItem,
      ingredients: resultsToSave.ingredients.join(", "),
      sensitivities: resultsToSave.sensitivities || [],
      type: 'food',
      mealType: getMealType(now) // Add this helper function
    };
    
    const success = addEntry(newEntry);
    
    if (success) {
      setShowSaveSuccess(true);
      setTimeout(() => {
        setShowSaveSuccess(false);
        resetForm();
      }, 1500); // Increased from 1000 to 1500 to make the feedback more visible
    } else {
      setError('Failed to save entry. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const resetForm = () => {
    setPhoto(null);
    setResults(null);
    if (document.getElementById('food-description')) {
      document.getElementById('food-description').value = '';
    }
  };

  return (
    <div className="max-w-lg mx-auto pb-24 px-4">
      {showSaveSuccess && <SuccessToast message="Saved!" />}

      {!photo && !analyzing && !results && (
        <InputSection 
          onAnalyze={(description) => analyzeFood(description, null)}
          onCameraOpen={() => setShowCamera(true)}
          onFileSelect={() => document.getElementById('file-upload').click()}
        />
      )}

      {showCamera && (
        <CameraSection
          webcamRef={webcamRef}
          onCapture={handlePhotoCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {photo && !analyzing && !results && (
        <div className="space-y-4">
          <img src={photo} alt="Food" className="w-full rounded-lg shadow" />
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
      )}

      {analyzing && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-lg text-gray-600">Analyzing your food...</p>
        </div>
      )}

      {results && (
        <ResultsSection
          results={results}
          onEdit={() => {}} // Add edit functionality if needed
          onSave={handleSave}
          onStartOver={resetForm}
        />
      )}

      <input
        id="file-upload"
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
      />


      {error && (
        <div className="fixed bottom-20 left-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default AddFood;