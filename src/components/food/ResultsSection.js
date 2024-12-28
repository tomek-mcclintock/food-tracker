// src/components/food/ResultsSection.js
"use client"

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ResultsSection({ results, onSave, onStartOver }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedResults, setEditedResults] = useState(results);

  const handleSaveChanges = () => {
    onSave(editedResults);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Card className="shadow-xl border-0">
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Food Name</label>
              <input
                type="text"
                value={editedResults.mainItem}
                onChange={(e) => setEditedResults({...editedResults, mainItem: e.target.value})}
                className="w-full p-3 border rounded-xl"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Ingredients</label>
              <textarea
                value={editedResults.ingredients.join("\n")}
                onChange={(e) => setEditedResults({
                  ...editedResults,
                  ingredients: e.target.value.split("\n").filter(i => i.trim())
                })}
                className="w-full p-3 border rounded-xl"
                rows="4"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Sensitivities</label>
              <div className="flex flex-wrap gap-2">
                {['dairy', 'gluten', 'nuts', 'soy', 'eggs', 'fish', 'shellfish', 'spicy', 'citrus', 'nightshades'].map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      const currentSensitivities = editedResults.sensitivities || [];
                      const newSensitivities = currentSensitivities.includes(item)
                        ? currentSensitivities.filter(s => s !== item)
                        : [...currentSensitivities, item];
                      setEditedResults({...editedResults, sensitivities: newSensitivities});
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      (editedResults.sensitivities || []).includes(item)
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button 
                onClick={handleSaveChanges}
                className="bg-green-500 hover:bg-green-600 text-white py-6 text-lg rounded-xl"
              >
                Save Changes
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setEditedResults(results);
                  setIsEditing(false);
                }}
                className="py-6 text-lg rounded-xl border-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-xl border-0">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-semibold">{results.mainItem}</h3>
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
            <Pencil className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-6">
          <div>
            <p className="font-medium text-gray-600 mb-3">Ingredients</p>
            <ul className="space-y-2">
              {results.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {results.sensitivities?.length > 0 && (
            <div>
              <p className="font-medium text-gray-600 mb-3">Contains</p>
              <div className="flex flex-wrap gap-2">
                {results.sensitivities.map((item, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-4">
            <Button 
              onClick={() => onSave(results)}
              className="bg-green-500 hover:bg-green-600 text-white py-6 text-lg rounded-xl"
            >
              Save
            </Button>
            <Button 
              variant="outline"
              onClick={onStartOver}
              className="py-6 text-lg rounded-xl border-2"
            >
              Start Over
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}