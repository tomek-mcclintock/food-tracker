// src/components/food/ResultsSection.js
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function ResultsSection({ results, onEdit, onSave, onStartOver }) {
  return (
    <Card className="shadow-xl border-0">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h3 className="text-2xl font-semibold">{results.mainItem}</h3>
          <Button variant="ghost" size="sm" onClick={onEdit}>
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
              onClick={onSave}
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