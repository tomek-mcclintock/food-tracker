// src/components/WelcomeModal.js
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFoodHistory } from '@/hooks/useFoodHistory';

const steps = [
  {
    title: "Welcome to Food Tracker",
    content: "Track your meals and understand your food sensitivities",
    highlight: null
  },
  {
    title: "Add Food",
    content: "Take photos of your meals or describe them in text. The AI will analyze ingredients and potential sensitivities.",
    highlight: ".add-button"
  },
  {
    title: "Track Wellness",
    content: "Log how you feel after meals. This helps identify patterns and sensitivities.",
    highlight: ".wellness-button"
  },
  {
    title: "View Insights",
    content: "See patterns between foods and symptoms in the Insights tab.",
    highlight: ".insights-tab"
  }
];

export default function WelcomeModal({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const { addExampleData } = useFoodHistory();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async (addExample) => {
    if (addExample) {
      await addExampleData();
    }
    setShowModal(false);
    onClose?.();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6 space-y-4">
        {currentStep < steps.length ? (
          <>
            <h2 className="text-xl font-bold">{steps[currentStep].title}</h2>
            <p className="text-gray-600">{steps[currentStep].content}</p>
            
            <div className="flex justify-between pt-4">
              <Button
                variant="ghost"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button onClick={handleNext}>Next</Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-xl font-bold">Ready to start?</h2>
            <p className="text-gray-600">Would you like to add example data to test the analysis features?</p>
            
            <div className="grid gap-3 pt-4">
              <Button 
                onClick={() => handleComplete(true)}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Add Example Data
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleComplete(false)}
              >
                Start Fresh
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}