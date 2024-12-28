// src/app/history/page.tsx
"use client"

import React, { useMemo } from 'react';
import { useFoodHistory } from '../../hooks/useFoodHistory';
import DaySummary from '../../components/history/DaySummary';
import { HistoryEntry, DayData } from '../../lib/types';

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
};

const TIME_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  hour: 'numeric',
  minute: 'numeric'
};

const groupEntriesByDay = (entries: HistoryEntry[]): DayData[] => {
  // Create a map to store entries by date
  const dayMap = new Map<string, DayData>();

  entries.forEach(entry => {
    // Get just the date part (remove time)
    const entryDate = new Date(entry.date);
    const dateKey = entryDate.toLocaleDateString('en-US', DATE_FORMAT_OPTIONS);

    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, {
        date: dateKey,
        wellness: null,
        foods: []
      });
    }

    const dayData = dayMap.get(dateKey)!;

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
        time: entryDate.toLocaleTimeString('en-US', TIME_FORMAT_OPTIONS),
        food: entry.food,
        ingredients: entry.ingredients,
        sensitivities: entry.sensitivities
      });
    }
  });

  // Convert map to array and sort by date (most recent first)
  return Array.from(dayMap.values())
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export default function History() {
  const { history, error } = useFoodHistory();

  // Memoize grouped entries to prevent unnecessary recalculations
  const groupedEntries = useMemo(() => groupEntriesByDay(history), [history]);

  if (error) {
    return (
      <div className="max-w-2xl mx-auto pb-24 px-4">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4">
      <div className="space-y-2">
        {groupedEntries.map((dayData, index) => (
          <DaySummary
            key={dayData.date} // Use date instead of index for more stable keys
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
