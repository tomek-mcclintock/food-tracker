// src/components/WellnessCheck.js
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function WellnessCheck({ onClose, onSubmit }) {
  const [selectedStomach, setSelectedStomach] = useState(null);
  const [selectedEnergy, setSelectedEnergy] = useState(null);

  const handleSubmit = () => {
    if (!selectedStomach || !selectedEnergy) return;
    
    onSubmit({
      date: new Date().toLocaleString(),
      type: 'wellness',
      stomach: selectedStomach,
      energy: selectedEnergy
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">How are you feeling?</h2>
        
        <div className="space-y-4">
          <div>
            <p className="font-medium mb-2">Stomach Comfort:</p>
            <div className="grid grid-cols-5 gap-2">
              {['Very Poor', 'Poor', 'Okay', 'Good', 'Excellent'].map(rating => (
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
              {['Very Low', 'Low', 'Moderate', 'High', 'Very High'].map(rating => (
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
            onClick={handleSubmit}
            disabled={!selectedStomach || !selectedEnergy}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            Submit
          </Button>

          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}