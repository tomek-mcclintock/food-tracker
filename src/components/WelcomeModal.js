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
    content: "See patterns between foods and symptoms in the Insights tab to better understand your sensitivities.",
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

  useEffect(() => {
    const currentStepData = steps[currentStep];
    let addButton = null;

    // Handle menu expansion/collapse
    if (currentStepData?.shouldExpandMenu) {
      addButton = document.querySelector('.add-button');
      addButton?.click();
    } else if (steps[currentStep - 1]?.shouldExpandMenu) {
      addButton = document.querySelector('.add-button');
      addButton?.click();
    }
    
    // Remove any existing overlays first
    const existingOverlay = document.querySelector('.welcome-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create single overlay
    const overlay = document.createElement('div');
    overlay.className = 'welcome-overlay fixed inset-0 transition-opacity duration-200';
    document.body.appendChild(overlay);

    // Add a class to the target element
    if (currentStepData?.highlight) {
      const target = document.querySelector(currentStepData.highlight);
      if (target) {
        target.classList.add('welcome-highlight');
      }
    }

    return () => {
      // Cleanup
      const overlayToRemove = document.querySelector('.welcome-overlay');
      if (overlayToRemove) {
        overlayToRemove.remove();
      }
      const target = document.querySelector(currentStepData?.highlight);
      if (target) {
        target.classList.remove('welcome-highlight');
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div 
        className={`bg-white rounded-xl max-w-sm w-full p-6 space-y-4 shadow-xl relative z-[70]
          ${currentStepData.position === 'bottom' ? 'self-end mb-24' : 'self-center'}`}
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