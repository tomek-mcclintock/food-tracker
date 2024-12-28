// src/components/food/InputSection.js
"use client"

import { PlusCircle, Camera, ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function InputSection({ onAnalyze, onCameraOpen, onFileSelect }) {
  return (
    <div className="space-y-4">
      <Card className="shadow-lg border-0">
        <CardContent className="p-4 pt-4">
          <textarea
            id="food-description"
            placeholder="What did you eat? 🍽️"
            className="w-full p-4 text-lg border-none resize-none focus:ring-0 focus:outline-none"
            rows="3"
          />
          <Button 
            onClick={() => {
              const description = document.getElementById('food-description')?.value?.trim();
              if (description) onAnalyze(description);
            }}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-6 text-lg mt-2 rounded-xl"
          >
            <PlusCircle className="w-5 h-5 mr-2" />
            Add Food
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          onClick={onCameraOpen}
          className="py-8 flex flex-col items-center gap-2 hover:bg-gray-50 border-2"
        >
          <Camera className="w-8 h-8" />
          <span>Take Photo</span>
        </Button>
        <Button
          variant="outline"
          onClick={onFileSelect}
          className="py-8 flex flex-col items-center gap-2 hover:bg-gray-50 border-2"
        >
          <ImagePlus className="w-8 h-8" />
          <span>Upload Photo</span>
        </Button>
      </div>
    </div>
  );
}