// src/app/add/page.js
"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFoodHistory } from '@/hooks/useFoodHistory';
import { useAnalysis } from '@/hooks/useAnalysis';
import SuccessToast from '@/components/SuccessToast';
import ModeSelector from '@/components/food/modes/ModeSelector';
import ResultsSection from '@/components/food/ResultsSection';
import { formatDateForStorage, formatDateForDisplay, formatTimeForDisplay } from '@/lib/utils';
import { getMealType } from '@/lib/utils';



const AddFood = () => {
  const [photo, setPhoto] = useState(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  
  const { addEntry } = useFoodHistory();
  const { analyzing, results, analyzeFood, setResults } = useAnalysis();

  const handlePhotoCapture = (imageSrc) => {
    setPhoto(imageSrc);
  };

  const handleSave = (resultsToSave) => {
    const now = new Date();
    const newEntry = {
      date: formatDateForStorage(now),
      food: resultsToSave.mainItem,
      ingredients: resultsToSave.ingredients.join(", "),
      sensitivities: resultsToSave.sensitivities || [],
      type: 'food',
      mealType: getMealType(now)  // Using imported getMealType
    };
    
    try {
      addEntry(newEntry);
      setShowSaveSuccess(true);
      setTimeout(() => {
        router.push('/history');
      }, 500);
    } catch (err) {
      setError('Failed to save entry. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };
  

  const resetForm = () => {
    setPhoto(null);
    setResults(null);
  };

  return (
    <div className="max-w-lg mx-auto pb-24 px-4">
      {showSaveSuccess && <SuccessToast message="Saved!" />}
      
      {error && (
        <div className="fixed bottom-20 left-4 right-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl shadow-lg">
          {error}
        </div>
      )}

      {!photo && !analyzing && !results && (
        <ModeSelector 
          onImageCapture={handlePhotoCapture}
          onAnalyze={(description) => analyzeFood(description, null)}
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
          onSave={handleSave}
          onStartOver={resetForm}
        />
      )}
    </div>
  );
};

export default AddFood;