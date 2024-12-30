// src/components/food/modes/TextMode.js
"use client"

import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const TextMode = ({ onAnalyze }) => {
  return (
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
  );
};

export default TextMode;