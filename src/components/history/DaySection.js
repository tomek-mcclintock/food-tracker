// src/components/history/DaySection.js
"use client"

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import MealEntry from './MealEntry';

export default function DaySection({ date, wellness, foods, onEditWellness, onEditFood, onDeleteFood }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format date as "Mon, 8 Dec 2024"
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Group foods by meal type
  const mealGroups = {
    Breakfast: foods.filter(f => f.mealType === 'Breakfast'),
    Lunch: foods.filter(f => f.mealType === 'Lunch'),
    Dinner: foods.filter(f => f.mealType === 'Dinner'),
    Snack: foods.filter(f => f.mealType === 'Snack')
  };

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div 
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <h3 className="font-semibold text-lg">{formattedDate}</h3>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>

          {wellness && (
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">Stomach: {wellness.stomach}</span>
                <span className="text-blue-600">Energy: {wellness.energy}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onEditWellness(wellness);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                Edit
              </button>
            </div>
          )}

          <div className={`space-y-2 ${isExpanded ? '' : 'hidden'}`}>
            {Object.entries(mealGroups).map(([mealType, meals]) => (
              meals.length > 0 && (
                <div key={mealType}>
                  <h4 className="font-medium text-sm text-gray-500 mb-2">{mealType}</h4>
                  <div className="space-y-2">
                    {meals.map((meal, index) => (
                      <MealEntry 
                        key={index}
                        meal={meal}
                        mealType={mealType}
                        onEdit={() => onEditFood(meal)}
                        onDelete={() => onDeleteFood(meal)}
                      />
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}