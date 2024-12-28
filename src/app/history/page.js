// src/app/history/page.js
"use client"

import React, { useEffect, useState } from 'react';
import { useFoodHistory } from '@/hooks/useFoodHistory';
import DaySummary from '@/components/history/DaySummary';

const groupEntriesByDay = (entries) => {
  // Create a map to store entries by date
  const dayMap = new Map();

  entries.forEach(entry => {
    // Get just the date part (remove time)
    const entryDate = new Date(entry.date);
    const dateKey = entryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, {
        date: dateKey,
        wellness: null,
        foods: []
      });
    }

    const dayData = dayMap.get(dateKey);

    if (entry.type === 'wellness') {
      // Only keep the latest wellness check for the day
      if (!dayData.wellness || new Date(entry.date) > new Date(dayData.wellness.date)) {
        dayData.wellness = {
          date: entry.date,
          stomach: entry.stomach,
          energy: entry.energy
        };
      }
    } else {
      // Add food entry
      dayData.foods.push({
        time: entryDate.toLocaleTimeString('en-US', { 
          hour: 'numeric',
          minute: 'numeric'
        }),
        food: entry.food,
        ingredients: entry.ingredients,
        sensitivities: entry.sensitivities
      });
    }
  });

  // Convert map to array and sort by date (most recent first)
  return Array.from(dayMap.values())
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

export default function History() {
  const { history } = useFoodHistory();
  const [groupedEntries, setGroupedEntries] = useState([]);

  useEffect(() => {
    setGroupedEntries(groupEntriesByDay(history));
  }, [history]);

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4">
      <div className="space-y-2">
        {groupedEntries.map((dayData, index) => (
          <DaySummary
            key={index}
            date={dayData.date}
            wellness={dayData.wellness}
            foods={dayData.foods}
          />
        ))}

        {groupedEntries.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No entries yet</p>
          </div>
        )}
      </div>
    </div>
  );
}