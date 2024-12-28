// src/app/history/page.js
"use client"

import React, { useEffect, useState } from 'react';
import { useFoodHistory } from '@/hooks/useFoodHistory';
import DaySummary from '@/components/history/DaySummary';
import EditEntry from '@/components/history/EditEntry';

const groupEntriesByDay = (entries) => {
  if (!Array.isArray(entries)) return [];
  
  const dayMap = new Map();

  entries.forEach(entry => {
    if (!entry || !entry.date) return;

    // Safely parse the date
    let entryDate;
    try {
      entryDate = new Date(entry.date);
      // Check if date is valid
      if (isNaN(entryDate.getTime())) {
        console.error('Invalid date:', entry.date);
        return;
      }
    } catch (e) {
      console.error('Error parsing date:', entry.date);
      return;
    }

    // Format the date for display
    const dateKey = entryDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Initialize the day entry if it doesn't exist
    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, {
        date: dateKey,
        dateObj: entryDate, // Store the date object for sorting
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
      dayData.foods.push({ ...entry });
    }
  });

  // Sort by date in descending order
  return Array.from(dayMap.values())
    .sort((a, b) => b.dateObj - a.dateObj);
}

export default function History() {
  const { history, editEntry, deleteEntry } = useFoodHistory();
  const [groupedEntries, setGroupedEntries] = useState([]);
  const [editingEntry, setEditingEntry] = useState(null);

  useEffect(() => {
    if (history) {  // Add this check
      setGroupedEntries(groupEntriesByDay(history));
    }
  }, [history]);

  const handleSave = (updatedEntry) => {
    if (!editingEntry) return;  // Add this safety check
    
    const index = history.findIndex(entry => 
      entry.date === editingEntry.date && entry.type === editingEntry.type
    );
    if (index !== -1) {
      editEntry(index, { ...updatedEntry, date: editingEntry.date });
    }
    setEditingEntry(null);
  };

  // Add loading state
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
          <DaySummary
            key={index}
            date={dayData.date}
            wellness={dayData.wellness}
            foods={dayData.foods || []}  // Add default empty array
            onEditWellness={() => dayData.wellness && setEditingEntry(dayData.wellness)}
            onEditFood={(food) => food && setEditingEntry(food)}
            onDeleteFood={(food) => {
              if (!food) return;  // Add safety check
              const index = history.findIndex(entry => 
                entry.date === food.date && entry.food === food.food
              );
              if (index !== -1) {
                deleteEntry(index);
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