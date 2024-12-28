// src/components/history/MealEntry.js
"use client"

import { useState } from 'react';
import { Pencil, Trash2, ChevronRight, ChevronDown } from 'lucide-react';

const mealTypeStyles = {
  Breakfast: 'text-orange-600',
  Lunch: 'text-green-600',
  Dinner: 'text-blue-600',
  Snack: 'text-purple-600'
};

export default function MealEntry({ meal, mealType, onEdit, onDelete }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg hover:bg-gray-50 transition-colors">
      <div 
        className="p-3 flex items-start justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex-1">
          <div className="flex items-center gap-2">
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <span className={`font-medium ${mealTypeStyles[mealType]}`}>
              {meal.food}
            </span>
          </div>
          
          {meal.sensitivities?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1 ml-6">
              {meal.sensitivities.map((item, index) => (
                <span
                  key={index}
                  className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs"
                >
                  {item}
                </span>
              ))}
            </div>
          )}

          {isExpanded && meal.ingredients && (
            <div className="mt-2 ml-6 text-sm text-gray-600">
              {meal.ingredients}
            </div>
          )}
        </div>

        <div className="flex gap-1 ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-gray-200 rounded-full"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}