// src/components/history/EditEntry.js
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function EditEntry({ entry, onSave, onClose }) {
  const [formData, setFormData] = useState(entry);

  if (entry.type === 'wellness') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Wellness Check</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="font-medium mb-2">Stomach Comfort:</p>
              <div className="grid grid-cols-5 gap-2">
                {['Very Poor', 'Poor', 'Okay', 'Good', 'Excellent'].map(rating => (
                  <Button
                    key={rating}
                    variant={formData.stomach === rating ? "default" : "outline"}
                    onClick={() => setFormData({...formData, stomach: rating})}
                    className="w-full text-sm"
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <p className="font-medium mb-2">Energy Level:</p>
              <div className="grid grid-cols-5 gap-2">
                {['Very Low', 'Low', 'Moderate', 'High', 'Very High'].map(rating => (
                  <Button
                    key={rating}
                    variant={formData.energy === rating ? "default" : "outline"}
                    onClick={() => setFormData({...formData, energy: rating})}
                    className="w-full text-sm"
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              onClick={() => onSave(formData)}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Food Entry</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Food Name</label>
            <input
              type="text"
              value={formData.food}
              onChange={(e) => setFormData({...formData, food: e.target.value})}
              className="w-full p-3 border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Ingredients</label>
            <textarea
              value={formData.ingredients}
              onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
              className="w-full p-3 border rounded-xl"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Sensitivities</label>
            <div className="flex flex-wrap gap-2">
              {['dairy', 'gluten', 'nuts', 'soy', 'eggs', 'fish', 'shellfish', 'spicy', 'citrus', 'nightshades'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    const currentSensitivities = formData.sensitivities || [];
                    const newSensitivities = currentSensitivities.includes(item)
                      ? currentSensitivities.filter(s => s !== item)
                      : [...currentSensitivities, item];
                    setFormData({...formData, sensitivities: newSensitivities});
                  }}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    (formData.sensitivities || []).includes(item)
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <Button 
            onClick={() => onSave(formData)}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}