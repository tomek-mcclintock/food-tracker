// src/components/WelcomeModal.js
"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

const steps = [
  {
    title: "Welcome to Food Tracker",
    content: "Track your meals and understand your food sensitivities",
    highlight: null,
    position: "center"
  },
  {
    title: "Add Food",
    content: "Press the + button to add foods. Take photos or describe your meals - our AI will analyze ingredients and potential sensitivities.",
    highlight: ".add-button",
    position: "bottom"
  },
  {
    title: "Track Wellness",
    content: "Log how you feel after meals by using the Check In option in the + menu. This helps identify patterns and sensitivities.",
    highlight: ".wellness-button",
    position: "bottom",
    shouldExpandMenu: true
  },
  {
    title: "View Insights",
    content: "See patterns between foods and symptoms in the Insights tab to understand your sensitivities better.",
    highlight: ".insights-tab",
    position: "bottom"
  },
  {
    title: "Try Example Data",
    content: "Before adding your own data, you can explore the app with example data. This will add 2 weeks of food and wellness entries to help you understand how the analysis works.",
    highlight: ".example-data-button",
    position: "center"
  },
  {
    title: "Reset When Ready",
    content: "Once you're done exploring, press Reset Data to clear the example data and start tracking your own meals.",
    highlight: ".reset-data-button",
    position: "center"
  }
];

export default function WelcomeModal({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();

  // Toggle menu expansion when needed
  useEffect(() => {
    const currentStepData = steps[currentStep];
    if (currentStepData?.shouldExpandMenu) {
      // Find and click the add button to expand menu
      const addButton = document.querySelector('.add-button');
      addButton?.click();
    }
    
    // Add overlay styling
    const overlay = document.createElement('div');
    overlay.className = 'fixed inset-0 bg-black/60 transition-opacity z-40';
    document.body.appendChild(overlay);

    // Highlight the target element
    if (currentStepData?.highlight) {
      const target = document.querySelector(currentStepData.highlight);
      if (target) {
        target.style.position = 'relative';
        target.style.zIndex = '50';
        target.style.filter = 'brightness(1)';
      }
    }

    return () => {
      overlay.remove();
      // Clean up any styles we added
      const target = document.querySelector(currentStepData?.highlight);
      if (target) {
        target.style.position = '';
        target.style.zIndex = '';
        target.style.filter = '';
      }
    };
  }, [currentStep]);

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

  const handleFinish = () => {
    setShowModal(false);
    router.push('/profile');
    onClose?.();
  };

  if (!showModal) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ pointerEvents: 'none' }}
    >
      <div 
        className={`bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl
          ${currentStepData.position === 'bottom' ? 'self-end mb-24' : 'self-center'}`}
        style={{ pointerEvents: 'auto' }}
      >
        <h2 className="text-xl font-bold">{currentStepData.title}</h2>
        <p className="text-gray-600">{currentStepData.content}</p>
        
        <div className="flex justify-between pt-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Back
          </Button>
          <Button 
            onClick={isLastStep ? handleFinish : handleNext}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}