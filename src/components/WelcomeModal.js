"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Arrow } from '@/components/ui/arrow';

const steps = [
    {
      title: "Welcome to Food Tracker",
      content: "Track your meals and understand your food sensitivities",
      position: "center"
    },
    {
      title: "Add Food",
      content: "Press the + button to add foods. Take photos or describe your meals - our AI will analyze ingredients and potential sensitivities.",
      position: "bottom",
      targetSelector: '.add-button'
    },
    {
      title: "Track Wellness",
      content: "Log how you feel after meals by using the Check In option in the + menu. This helps identify patterns and sensitivities.",
      position: "center",
      shouldExpandMenu: true,
      targetSelector: '.wellness-button'
    },
    {
      title: "View Insights",
      content: "See patterns between foods and symptoms in the Insights tab to better understand your sensitivities.",
      position: "bottom",
      targetSelector: '.insights-tab'
    },
    {
      title: "Try Example Data",
      content: "Before adding your own data, you can explore the app with example data. This will add 2 weeks of food and wellness entries to help you understand how the analysis works.",
      position: "top",
      targetSelector: '.example-data-button'
    },
    {
      title: "Reset When Ready",
      content: "Once you're done exploring, press Reset Data to clear the example data and start tracking your own meals.",
      position: "top",
      targetSelector: '.reset-data-button'
    }
];

export default function WelcomeModal({ onClose }) {  
  const [currentStep, setCurrentStep] = useState(0);
  const [showModal, setShowModal] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    // Close menu if open
    const addButton = document.querySelector('.add-button');
    if (addButton?.classList.contains('rotate-45')) {
      addButton.click();
    }
    setShowModal(false);
    onClose?.();
  };

  const handleNext = () => {
    const currentStepData = steps[currentStep];
    const nextStepData = steps[currentStep + 1];

    // Handle menu state changes
    const addButton = document.querySelector('.add-button');
    if (currentStepData.shouldExpandMenu && !nextStepData?.shouldExpandMenu && addButton?.classList.contains('rotate-45')) {
      addButton.click();
    } else if (!currentStepData.shouldExpandMenu && nextStepData?.shouldExpandMenu && !addButton?.classList.contains('rotate-45')) {
      addButton.click();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    const currentStepData = steps[currentStep];
    const prevStepData = steps[currentStep - 1];

    // Handle menu state changes
    const addButton = document.querySelector('.add-button');
    if (currentStepData.shouldExpandMenu && !prevStepData?.shouldExpandMenu && addButton?.classList.contains('rotate-45')) {
      addButton.click();
    } else if (!currentStepData.shouldExpandMenu && prevStepData?.shouldExpandMenu && !addButton?.classList.contains('rotate-45')) {
      addButton.click();
    }

    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    handleClose();
    router.push('/profile');
  };

  if (!showModal) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {currentStepData.targetSelector && (
        <Arrow targetSelector={currentStepData.targetSelector} />
      )}

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
            onClick={handleClose}
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