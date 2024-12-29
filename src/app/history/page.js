// src/app/history/page.js
"use client"

import React, { useEffect, useState } from 'react';
import { useFoodHistory } from '@/hooks/useFoodHistory';
import DaySection from '@/components/history/DaySection';
import EditEntry from '@/components/history/EditEntry';

const groupEntriesByDay = (entries) => {
  if (!Array.isArray(entries)) return [];  // Defensive check
  
  const dayMap = new Map();

  entries.forEach(entry => {
    // Add more defensive checks
    if (!entry || !entry.date) return;

    try {
      // Wrap date parsing in try-catch
      const entryDate = new Date(entry.date);
      if (isNaN(entryDate.getTime())) return; // Skip invalid dates
      
      const dateKey = entryDate.toISOString().split('T')[0];

      if (!dayMap.has(dateKey)) {
        dayMap.set(dateKey, {
          date: entryDate,
          wellness: null,
          foods: []
        });
      }

      const dayData = dayMap.get(dateKey);

      if (entry.type === 'wellness') {
        if (!dayData.wellness || new Date(entry.date) > new Date(dayData.wellness.date)) {
          dayData.wellness = { ...entry };
        }
      } else if (entry.type === 'food') {
        // Ensure mealType is always set
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
      return; // Skip problematic entries
    }
  });

  return Array.from(dayMap.values())
    .sort((a, b) => b.date - a.date);
};

export default function History() {
  const { history, editEntry, deleteEntry, initialized } = useFoodHistory();
  const [groupedEntries, setGroupedEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      if (initialized && history) {
        const processed = groupEntriesByDay(history);
        setGroupedEntries(processed);
        setError(null);
      }
    } catch (err) {
      console.error('Error processing history:', err);
      setError('Error loading history. Please try refreshing the page.');
    }
  }, [history, initialized]);

  const handleSave = (updatedEntry) => {
    try {
      if (!editingEntry) return;
      
      const index = history.findIndex(entry => 
        entry.date === editingEntry.date && entry.type === editingEntry.type
      );
      if (index !== -1) {
        editEntry(index, { ...updatedEntry, date: editingEntry.date });
      }
      setEditingEntry(null);
    } catch (err) {
      console.error('Error saving entry:', err);
      setError('Error saving changes. Please try again.');
    }
  };

  if (error) {
    return (
      <div className="max-w-2xl mx-auto pb-24 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
          {error}
        </div>
      </div>
    );
  }

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
            onEditWellness={() => setEditingEntry(dayData.wellness)}
            onEditFood={(food) => setEditingEntry(food)}
            onDeleteFood={(food) => {
              try {
                const index = history.findIndex(entry => 
                  entry.date === food.date && entry.food === food.food
                );
                if (index !== -1) {
                  deleteEntry(index);
                }
              } catch (err) {
                console.error('Error deleting entry:', err);
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