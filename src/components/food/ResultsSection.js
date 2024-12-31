// src/components/food/ResultsSection.js
"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import EditEntry from '@/components/history/EditEntry';
import { useRouter } from 'next/navigation';

export default function ResultsSection({ results, onSave, onStartOver }) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentResults, setCurrentResults] = useState(results);
  const router = useRouter();

  if (isEditing) {
    // Create a food entry object in the same format as history entries
    const entry = {
      type: 'food',
      date: new Date().toISOString(),
      food: currentResults.mainItem,
      ingredients: currentResults.ingredients.join(', '),
      sensitivities: currentResults.sensitivities || [],
      mealType: (() => {
        const hour = new Date().getHours();
        if (hour < 11) return 'Breakfast';
        if (hour < 15) return 'Lunch';
        if (hour < 20) return 'Dinner';
        return 'Snack';
      })()
    };

    return (
      <EditEntry
        entry={entry}
        onSave={(updatedEntry) => {
          setCurrentResults({
            ...currentResults,
            mainItem: updatedEntry.food,
            ingredients: updatedEntry.ingredients.split(',').map(i => i.trim()),
            sensitivities: updatedEntry.sensitivities
          });
          setIsEditing(false);
        }}
        onClose={() => setIsEditing(false)}
      />
    );
  }

  const handleSave = () => {
    onSave(currentResults);
  };

  return (
    <Card className="shadow-xl border-0">
      <CardContent className="p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-2xl font-semibold mb-6">{currentResults.mainItem}</h3>
            
            <div className="space-y-6">
              <div>
                <p className="font-medium text-gray-600 mb-3">Ingredients</p>
                <ul className="space-y-2">
                  {currentResults.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {currentResults.sensitivities?.length > 0 && (
                <div>
                  <p className="font-medium text-gray-600 mb-3">Contains</p>
                  <div className="flex flex-wrap gap-2">
                    {currentResults.sensitivities.map((item, index) => (
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
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-6 text-lg rounded-xl"
                >
                  Edit
                </Button>
                <Button 
                  onClick={handleSave}
                  className="bg-green-500 hover:bg-green-600 text-white py-6 text-lg rounded-xl"
                >
                  Save
                </Button>
              </div>

              <Button 
                variant="outline"
                onClick={onStartOver}
                className="w-full py-6 text-lg rounded-xl border-2"
              >
                Start Over
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}