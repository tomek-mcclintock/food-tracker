'use client'

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function SensitivityCorrelation({ history = [] }) {
  const calculateSensitivityCorrelations = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return [];
    }

    const dailySensitivities = new Map();
    const wellnessScores = new Map();
    
    data.forEach(entry => {
      if (!entry || !entry.date) return;
      
      const date = entry.date.split('T')[0];
      
      if (entry.type === 'food' && Array.isArray(entry.sensitivities)) {
        if (!dailySensitivities.has(date)) {
          dailySensitivities.set(date, new Set());
        }
        entry.sensitivities.forEach(s => 
          dailySensitivities.get(date).add(s)
        );
      } else if (entry.type === 'wellness' && entry.stomach) {
        wellnessScores.set(date, entry.stomach);
      }
    });

    const stats = new Map();

    dailySensitivities.forEach((sensitivities, date) => {
      sensitivities.forEach(sensitivity => {
        if (!stats.has(sensitivity)) {
          stats.set(sensitivity, { total: 0, lowScores: 0 });
        }
        
        stats.get(sensitivity).total++;
        
        const dateObj = new Date(date);
        let hasLowScore = false;
        
        for (let i = 0; i < 2; i++) {
          dateObj.setDate(dateObj.getDate() + 1);
          const checkDate = dateObj.toISOString().split('T')[0];
          const score = wellnessScores.get(checkDate);
          if (score === 'Poor' || score === 'Very Poor') {
            hasLowScore = true;
            break;
          }
        }
        
        if (hasLowScore) {
          stats.get(sensitivity).lowScores++;
        }
      });
    });

    return Array.from(stats.entries())
      .map(([sensitivity, counts]) => ({
        name: sensitivity,
        percentage: Math.round((counts.lowScores / counts.total) * 100),
        total: counts.total,
        lowScores: counts.lowScores
      }))
      .filter(item => item.lowScores > 0)  // Only include items that have caused low scores
      .sort((a, b) => b.percentage - a.percentage);
  };

  const data = calculateSensitivityCorrelations(history);

  if (data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-gray-500">
            No correlations found between sensitivities and low stomach comfort
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-gray-600 mb-6">
          Percentage of times a food type was followed by low stomach comfort within 48 hours
        </p>
        <div className="space-y-6">
          {data.map(item => (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium capitalize">{item.name}</span>
                <span className="text-sm text-gray-600">
                  {item.lowScores} of {item.total} times
                </span>
              </div>
              <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-500 rounded-lg"
                  style={{ width: `${item.percentage}%` }}
                >
                  <div className="h-full flex items-center justify-end px-3">
                    <span className="text-white text-sm font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}