"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function EditEntry({ entry, onSave, onClose }) {
  const entryDate = new Date(entry.date);
  
  const [formData, setFormData] = useState({
    ...entry,
    date: format(entryDate, 'yyyy-MM-dd'), // Format date for date input
    time: format(entryDate, 'HH:mm') // Time for time input
  });

  const handleSave = () => {
    // Combine the date and time inputs into a single date object
    const [year, month, day] = formData.date.split('-');
    const [hours, minutes] = formData.time.split(':');
    const newDate = new Date(
      parseInt(year, 10),
      parseInt(month, 10) - 1, // Months are 0-based in JavaScript
      parseInt(day, 10),
      parseInt(hours, 10),
      parseInt(minutes, 10)
    );

    // Update the entry with the new date
    const updatedEntry = {
      ...formData,
      date: newDate.toISOString()
    };
    onSave(updatedEntry);
  };

  const DateTimeInputs = () => (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({...formData, date: e.target.value})}
          className="w-full p-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Time</label>
        <input
          type="time"
          value={formData.time}
          onChange={(e) => setFormData({...formData, time: e.target.value})}
          className="w-full p-2 border rounded-lg"
        />
      </div>
    </div>
  );

  if (entry.type === 'wellness') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Check-in</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-4">
            <DateTimeInputs />

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
              onClick={handleSave}
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
          <DateTimeInputs />

          <div>
            <label className="block text-sm font-medium mb-1">Meal Type</label>
            <div className="grid grid-cols-4 gap-2">
              {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFormData({...formData, mealType: type})}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-colors
                    ${formData.mealType === type 
                      ? 'bg-blue-50 text-blue-600 border-blue-200'
                      : 'border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Food Name</label>
            <input
              type="text"
              value={formData.food}
              onChange={(e) => setFormData({...formData, food: e.target.value})}
              className="w-full p-3 border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Ingredients</label>
            <textarea
              value={formData.ingredients}
              onChange={(e) => setFormData({...formData, ingredients: e.target.value})}
              className="w-full p-3 border rounded-xl"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Sensitivities</label>
            <div className="flex flex-wrap gap-2">
            {['dairy', 'gluten', 'nuts', 'soy', 'eggs', 'fish', 'shellfish', 
                'nightshades', 'caffeine', 'histamine', 'sulfites', 'fructose', 'fodmap', 
                'cruciferous', 'alliums', 'citrus', 'legumes', 'corn', 'salicylates', 'spicy'].map((item) => (
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
            onClick={handleSave}
            className="w-full bg-green-500 hover:bg-green-600 text-white"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}