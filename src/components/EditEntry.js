// src/components/EditEntry.js
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function EditEntry({ entry, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    food: entry.food || '',
    ingredients: entry.ingredients || '',
    sensitivities: entry.sensitivities || [],
    stomach: entry.stomach || '',
    energy: entry.energy || ''
  });

  const handleSensitivityToggle = (sensitivity) => {
    setFormData(prev => ({
      ...prev,
      sensitivities: prev.sensitivities.includes(sensitivity)
        ? prev.sensitivities.filter(s => s !== sensitivity)
        : [...prev.sensitivities, sensitivity]
    }));
  };

  const commonSensitivities = [
    'dairy', 'gluten', 'nuts', 'soy', 'eggs', 
    'fish', 'shellfish', 'spicy', 'citrus', 'nightshades'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Entry</h2>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          {entry.type === 'food' ? (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Food Name</label>
                <input
                  type="text"
                  value={formData.food}
                  onChange={(e) => setFormData(prev => ({ ...prev, food: e.target.value }))}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Ingredients</label>
                <textarea
                  value={formData.ingredients}
                  onChange={(e) => setFormData(prev => ({ ...prev, ingredients: e.target.value }))}
                  rows="3"
                  className="w-full p-2 border rounded-lg resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sensitivities</label>
                <div className="flex flex-wrap gap-2">
                  {commonSensitivities.map((sensitivity) => (
                    <Button
                      key={sensitivity}
                      size="sm"
                      variant={formData.sensitivities.includes(sensitivity) ? "default" : "outline"}
                      onClick={() => handleSensitivityToggle(sensitivity)}
                      className="capitalize"
                    >
                      {sensitivity}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">Stomach Comfort</label>
                <div className="grid grid-cols-5 gap-2">
                  {['Very Poor', 'Poor', 'Okay', 'Good', 'Excellent'].map(rating => (
                    <Button
                      key={rating}
                      variant={formData.stomach === rating ? "default" : "outline"}
                      onClick={() => setFormData(prev => ({ ...prev, stomach: rating }))}
                      className="w-full text-sm"
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Energy Level</label>
                <div className="grid grid-cols-5 gap-2">
                  {['Very Low', 'Low', 'Moderate', 'High', 'Very High'].map(rating => (
                    <Button
                      key={rating}
                      variant={formData.energy === rating ? "default" : "outline"}
                      onClick={() => setFormData(prev => ({ ...prev, energy: rating }))}
                      className="w-full text-sm"
                    >
                      {rating}
                    </Button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="flex gap-2 mt-4">
            <Button 
              onClick={() => onSave({ ...entry, ...formData })}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
            >
              Save Changes
            </Button>
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}