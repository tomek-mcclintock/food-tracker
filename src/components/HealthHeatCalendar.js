'use client'

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const HealthHeatCalendar = ({ history = [] }) => {
  // Get the date range
  const today = new Date();
  const daysToShow = 31; // Show last 31 days

  // Generate array of dates
  const dates = Array.from({ length: daysToShow }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  // Process data for the calendar
  const processData = (data) => {
    const dailyData = new Map();
    
    data.forEach(entry => {
      const date = entry.date.split('T')[0];
      
      if (!dailyData.has(date)) {
        dailyData.set(date, {
          energy: null,
          stomach: null,
          sensitivities: new Map()
        });
      }
      
      const dayData = dailyData.get(date);
      
      if (entry.type === 'wellness') {
        dayData.energy = entry.energy;
        dayData.stomach = entry.stomach;
      } else if (entry.type === 'food' && Array.isArray(entry.sensitivities)) {
        entry.sensitivities.forEach(sensitivity => {
          dayData.sensitivities.set(
            sensitivity,
            (dayData.sensitivities.get(sensitivity) || 0) + 1
          );
        });
      }
    });

    return dailyData;
  };

  const getEnergyColor = (level) => {
    switch (level) {
      case 'Very Low': return 'bg-green-800';
      case 'Low': return 'bg-green-600';
      case 'Moderate': return 'bg-green-400';
      case 'High': return 'bg-green-300';
      case 'Very High': return 'bg-green-200';
      default: return 'bg-gray-100';
    }
  };

  const getStomachColor = (level) => {
    switch (level) {
      case 'Very Poor': return 'bg-orange-800';
      case 'Poor': return 'bg-orange-600';
      case 'Okay': return 'bg-orange-400';
      case 'Good': return 'bg-orange-300';
      case 'Excellent': return 'bg-orange-200';
      default: return 'bg-gray-100';
    }
  };

  const getFoodIntensity = (count) => {
    if (!count) return 'bg-gray-100';
    if (count === 1) return 'bg-blue-200';
    if (count === 2) return 'bg-blue-400';
    if (count === 3) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  const formatDateLabel = (date, index) => {
    if (index === 0) return 'Today';
    if (index % 7 === 0) {
      return new Date(date).toLocaleDateString('en-US', { 
        day: 'numeric',
        month: 'short'
      });
    }
    return '';
  };

  // Get all unique sensitivities from the data
  const sensitivities = Array.from(new Set(
    history
      .filter(entry => entry.type === 'food' && Array.isArray(entry.sensitivities))
      .flatMap(entry => entry.sensitivities)
  )).sort();

  const dailyData = processData(history);

  return (
    <Card>
      <CardContent className="pt-6 pb-4">
        <div className="flex">
          {/* Fixed labels column */}
          <div className="flex-none w-16 pr-2">
            <div className="h-7 flex items-center pt-5">
              <span className="text-xs font-medium text-gray-600">Energy</span>
            </div>
            <div className="h-7 flex items-center pt-1">
              <span className="text-xs font-medium text-gray-600">Stomach</span>
            </div>
            {sensitivities.map(sensitivity => (
              <div key={sensitivity} className="h-7 flex items-center pt-1">
                <span className="text-xs font-medium text-gray-600 capitalize">{sensitivity}</span>
              </div>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-x-auto">
            <div className="inline-flex min-w-full">
              {/* Date labels and boxes */}
              <div className="flex">
                {dates.map((date, index) => (
                  <div key={date} className="flex flex-col w-7">
                    <div className="h-5 flex items-center justify-center whitespace-nowrap px-1">
                      <span className="text-[10px] text-gray-500">
                        {formatDateLabel(date, index)}
                      </span>
                    </div>
                    {/* Energy row */}
                    <div className="h-7 px-0.5">
                      <div className={`w-6 h-6 rounded-sm ${getEnergyColor(dailyData.get(date)?.energy)}`} />
                    </div>
                    {/* Stomach row */}
                    <div className="h-7 px-0.5">
                      <div className={`w-6 h-6 rounded-sm ${getStomachColor(dailyData.get(date)?.stomach)}`} />
                    </div>
                    {/* Sensitivity rows */}
                    {sensitivities.map(sensitivity => (
                      <div key={sensitivity} className="h-7 px-0.5">
                        <div className={`w-6 h-6 rounded-sm ${
                          getFoodIntensity(dailyData.get(date)?.sensitivities.get(sensitivity))
                        }`} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 space-y-3 text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-800 rounded-sm"></div>
              <span>Low Energy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-200 rounded-sm"></div>
              <span>High Energy</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-800 rounded-sm"></div>
              <span>Poor Stomach</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-200 rounded-sm"></div>
              <span>Good Stomach</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-200 rounded-sm"></div>
              <span>1 occurrence</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
              <span>2-3 occurrences</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-800 rounded-sm"></div>
              <span>3+ occurrences</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthHeatCalendar;