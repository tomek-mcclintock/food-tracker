"use client"

import { format } from 'date-fns';
import { Pencil, Trash2, CheckCircle2, Coffee, UtensilsCrossed } from 'lucide-react';

// Component to show the appropriate icon for each meal type
const MealIcon = ({ mealType }) => {
  switch (mealType) {
    case 'Breakfast':
      return <Coffee className="w-4 h-4 text-orange-500" />;
    case 'Lunch':
    case 'Dinner':
      return <UtensilsCrossed className="w-4 h-4 text-blue-500" />;
    default: // Snack
      return <Coffee className="w-4 h-4 text-purple-500" />;
  }
};

// Component for individual entries (both food and wellness)
const Entry = ({ entry, onEdit, onDelete }) => {
  const time = format(new Date(entry.date), 'h:mm a');

  // Wellness entry display
  if (entry.type === 'wellness') {
    return (
      <div className="ml-4 mb-6">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
          <span className="text-sm text-gray-600">{time} Check-in</span>
          <div className="ml-auto flex gap-1">
            <button
              onClick={() => onEdit(entry)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <Pencil className="w-3.5 h-3.5 text-gray-500" />
            </button>
            <button
              onClick={() => onDelete(entry)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <Trash2 className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="ml-6 space-y-1">
          <p className="text-sm">Stomach: {entry.stomach}</p>
          <p className="text-sm">Energy: {entry.energy}</p>
        </div>
      </div>
    );
  }

  // Food entry display
  return (
    <div className="ml-4 mb-6">
      <div className="flex items-center gap-2 mb-2">
        <MealIcon mealType={entry.mealType} />
        <span className="text-sm text-gray-600">{time} {entry.mealType}</span>
        <div className="ml-auto flex gap-1">
          <button
            onClick={() => onEdit(entry)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <Pencil className="w-3.5 h-3.5 text-gray-500" />
          </button>
          <button
            onClick={() => onDelete(entry)}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <Trash2 className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="ml-6 space-y-1">
        <p className="text-sm font-medium">{entry.food}</p>
        <p className="text-sm text-gray-600">{entry.ingredients}</p>
        {entry.sensitivities?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.sensitivities.map((item, index) => (
              <span
                key={index}
                className="px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-full text-xs"
              >
                {item}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Main component that displays all entries for a single day
export default function DaySection({ date, wellness, foods, onEditWellness, onEditFood, onDeleteFood, onDeleteWellness }) {
  const formattedDate = format(date, 'EEE d MMM yyyy');
  
  // Combine and sort all entries for the day chronologically
  const allEntries = [
    ...(wellness || []),
    ...foods
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="mb-8">
      <h3 className="font-semibold text-lg mb-4">{formattedDate}</h3>
      {allEntries.map((entry, index) => (
        <Entry
          key={index}
          entry={entry}
          onEdit={entry.type === 'wellness' ? onEditWellness : onEditFood}
          onDelete={entry.type === 'wellness' ? () => onDeleteWellness(entry) : () => onDeleteFood(entry)}
        />
      ))}
      <div className="border-b border-gray-200 mt-6"></div>
    </div>
  );
}