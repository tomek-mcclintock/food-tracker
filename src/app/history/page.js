"use client"

import React, { useEffect, useState } from 'react';
import { useFoodHistory } from '@/hooks/useFoodHistory';
import DaySection from '@/components/history/DaySection';
import EditEntry from '@/components/history/EditEntry';

// Takes an array of entries and groups them by day
// Each day contains wellness entries and food entries
const groupEntriesByDay = (entries) => {
  // Guard against invalid input
  if (!Array.isArray(entries)) return [];
  
  // Use a Map to group entries by date
  const dayMap = new Map();

  entries.forEach(entry => {
    if (!entry || !entry.date) return;

    try {
      // Convert entry date string to Date object
      const entryDate = new Date(entry.date);
      if (isNaN(entryDate.getTime())) return; // Skip invalid dates
      
      // Create a key for this day (YYYY-MM-DD format)
      const dateKey = entryDate.toISOString().split('T')[0];

      // If this is the first entry for this day, create the day's data structure
      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, {
          date: entryDate,
          wellness: [], // Array of wellness check-ins
          foods: []     // Array of food entries
        });
      }

      const dayData = dayMap.get(dateKey);

      // Add entry to appropriate array based on type
      if (entry.type === 'wellness') {
        dayData.wellness.push({ ...entry });
      } else if (entry.type === 'food') {
        // If mealType isn't set, guess based on time of day
        if (!entry.mealType) {
          const hour = entryDate.getHours();
          if (hour < 11) entry.mealType = 'Breakfast';
          else if (hour < 15) entry.mealType = 'Lunch';
          else if (hour < 20) entry.mealType = 'Dinner';
          else entry.mealType = 'Snack';
        }
        dayData.foods.push({ ...entry });
      }
    } catch (error) {
      console.error('Error processing entry:', error);
    }
  });

  // Convert Map to array and sort by date (newest first)
  return Array.from(dayMap.values())
    .sort((a, b) => b.date - a.date);
};

export default function History() {
  const { history, editEntry, deleteEntry } = useFoodHistory();
  const [groupedEntries, setGroupedEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [error, setError] = useState(null);

  // When history changes, regroup the entries by day
  useEffect(() => {
    try {
      if (history) {
        const processed = groupEntriesByDay(history);
        setGroupedEntries(processed);
        setError(null);
      }
    } catch (err) {
      console.error('Error processing history:', err);
      setError('Error loading history. Please try refreshing the page.');
    }
  }, [history]);

  // Handle saving edited entries
  const handleSave = (updatedEntry) => {
    try {
      if (!editingEntry) return;
      
      if (editingEntry.id) {
        editEntry(editingEntry.id, updatedEntry);
      }
      setEditingEntry(null);
    } catch (err) {
      console.error('Error saving entry:', err);
      setError('Error saving changes. Please try again.');
    }
  };

  // Show error state
  if (error) {
    return (
      <div className="max-w-2xl mx-auto pb-24 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  // Show loading state
  if (!history) {
    return (
      <div className="max-w-2xl mx-auto pb-24 px-4">
        <div className="text-center py-12 text-gray-500">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-24 px-4">
      <div className="space-y-2">
        {groupedEntries.map((dayData, index) => (
          <DaySection
            key={dayData.date.toISOString()}
            date={dayData.date}
            wellness={dayData.wellness}
            foods={dayData.foods}
            onEditWellness={(entry) => setEditingEntry(entry)}
            onEditFood={(food) => setEditingEntry(food)}
            onDeleteFood={(food) => {
              try {
                if (food.id) {
                  deleteEntry(food.id);
                }
              } catch (err) {
                console.error('Error deleting food entry:', err);
                setError('Error deleting entry. Please try again.');
              }
            }}
            onDeleteWellness={(wellness) => {
              try {
                if (wellness.id) {
                  deleteEntry(wellness.id);
                }
              } catch (err) {
                console.error('Error deleting wellness entry:', err);
                setError('Error deleting entry. Please try again.');
              }
            }}
          />
        ))}

        {(!groupedEntries || groupedEntries.length === 0) && (
          <div className="text-center py-12 text-gray-500">
            <p>No entries yet</p>
          </div>
        )}
      </div>

      {editingEntry && (
        <EditEntry
          entry={editingEntry}
          onSave={handleSave}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
}