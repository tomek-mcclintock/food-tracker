"use client"

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

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
      position: "centre",
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
      position: "top"
    },
    {
      title: "Reset When Ready",
      content: "Once you're done exploring, press Reset Data to clear the example data and start tracking your own meals.",
      highlight: ".reset-data-button",
      position: "top"
    }
];

export default function WelcomeModal({ onClose }) {  
  const [currentStep, setCurrentStep] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const currentStepData = steps[currentStep];
    let prevHighlight = steps[currentStep - 1]?.highlight;
    
    // Clear previous highlights first
    document.querySelectorAll('.welcome-highlight').forEach(el => {
      el.classList.remove('welcome-highlight', 'z-[55]');
    });

    // Remove any existing overlays
    const existingOverlay = document.querySelector('.welcome-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'welcome-overlay fixed inset-0 transition-opacity duration-200';
    document.body.appendChild(overlay);

    // Handle menu expansion/collapse
    const addButton = document.querySelector('.add-button');
    if (currentStepData?.shouldExpandMenu && addButton && !addButton.classList.contains('rotate-45')) {
      addButton.click();
    } else if (!currentStepData?.shouldExpandMenu && prevHighlight === '.wellness-button' && addButton) {
      addButton.click();
    }

    // Add highlight to current target
    if (currentStepData?.highlight) {
      const target = document.querySelector(currentStepData.highlight);
      if (target) {
        target.classList.add('welcome-highlight', 'z-[55]');
      }
    }

    return () => {
      if (currentStepData?.highlight) {
        const target = document.querySelector(currentStepData.highlight);
        if (target) {
          target.classList.remove('welcome-highlight', 'z-[55]');
        }
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
        className={`bg-white rounded-xl max-w-sm w-full p-4 space-y-3 shadow-xl relative z-[70]
          ${currentStepData.position === 'bottom' ? 'self-end mb-24' : 
            currentStepData.position === 'top' ? 'self-start mt-4' : 
            'self-center'}`}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">{currentStepData.title}</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-gray-600 text-sm">{currentStepData.content}</p>
        
        <div className="flex justify-between pt-2">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
            size="sm"
          >
            Back
          </Button>
          <Button 
            onClick={isLastStep ? handleFinish : handleNext}
            size="sm"
          >
            {isLastStep ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
}