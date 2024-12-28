// src/components/history/DaySummary.js
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Heart, Plus } from 'lucide-react';

const WellnessIndicators = ({ stomach, energy }) => {
  const getStomachColor = () => {
    const scores = {
      'Very Poor': 'text-red-500',
      'Poor': 'text-orange-500',
      'Okay': 'text-yellow-500',
      'Good': 'text-green-500',
      'Excellent': 'text-emerald-500'
    };
    return scores[stomach] || 'text-gray-500';
  };

  const getEnergyColor = () => {
    const scores = {
      'Very Low': 'text-red-500',
      'Low': 'text-orange-500',
      'Moderate': 'text-yellow-500',
      'High': 'text-green-500',
      'Very High': 'text-emerald-500'
    };
    return scores[energy] || 'text-gray-500';
  };

  return (
    <div className="flex gap-4 items-center text-sm">
      <div className={`flex items-center gap-1 ${getStomachColor()}`}>
        <Heart className="w-4 h-4" />
        <span>Stomach: {stomach}</span>
      </div>
      <div className={`flex items-center gap-1 ${getEnergyColor()}`}>
        <ArrowUp className="w-4 h-4" />
        <span>Energy: {energy}</span>
      </div>
    </div>
  );
};

const FoodEntry = ({ food, ingredients, sensitivities }) => (
  <div className="pl-4 border-l-2 border-gray-100">
    <p className="font-medium">{food}</p>
    <p className="text-sm text-gray-600">{ingredients}</p>
    {sensitivities?.length > 0 && (
      <div className="flex flex-wrap gap-1 mt-1">
        {sensitivities.map((item, index) => (
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
);

export default function DaySummary({ date, wellness, foods }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg">{date}</h3>
          </div>

          {wellness && (
            <div className="bg-gray-50 rounded-lg p-3">
              <WellnessIndicators {...wellness} />
            </div>
          )}

          <div className="space-y-4">
            {foods.length > 0 ? (
              foods.map((food, index) => (
                <FoodEntry key={index} {...food} />
              ))
            ) : (
              <p className="text-gray-500 text-sm italic">No food entries for this day</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}