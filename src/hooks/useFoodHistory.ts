// src/hooks/useFoodHistory.ts
import { useState, useEffect, useCallback, useMemo } from 'react';
import { HistoryEntry } from '../lib/types';

const STORAGE_KEY = 'foodHistory';
const MAX_ENTRIES = 1000; // Prevent localStorage from getting too full

// Helper functions for data persistence
const saveToStorage = (data: HistoryEntry[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
    return false;
  }
};

const loadFromStorage = (): HistoryEntry[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return [];
  }
};

export function useFoodHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Load data on mount
  useEffect(() => {
    const loadedHistory = loadFromStorage();
    setHistory(loadedHistory);
  }, []);

  const addEntry = useCallback((entry: HistoryEntry) => {
    setHistory(prevHistory => {
      // Ensure we don't exceed storage limits
      const newHistory = [entry, ...prevHistory].slice(0, MAX_ENTRIES);
      
      // Attempt to save
      if (!saveToStorage(newHistory)) {
        setError('Failed to save entry. Storage might be full.');
        return prevHistory;
      }
      
      return newHistory;
    });
  }, []);

  const editEntry = useCallback((index: number, updatedEntry: HistoryEntry) => {
    setHistory(prevHistory => {
      const newHistory = [...prevHistory];
      newHistory[index] = updatedEntry;
      
      if (!saveToStorage(newHistory)) {
        setError('Failed to save changes. Storage might be full.');
        return prevHistory;
      }
      
      return newHistory;
    });
  }, []);

  const deleteEntry = useCallback((index: number) => {
    setHistory(prevHistory => {
      const newHistory = prevHistory.filter((_, i) => i !== index);
      
      if (!saveToStorage(newHistory)) {
        setError('Failed to delete entry.');
        return prevHistory;
      }
      
      return newHistory;
    });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Export data as JSON
  const exportData = useCallback(() => {
    try {
      const dataStr = JSON.stringify(history, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const link = document.createElement('a');
      link.setAttribute('href', dataUri);
      link.setAttribute('download', `food-tracker-export-${new Date().toISOString()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Failed to export data');
      console.error('Export failed:', err);
    }
  }, [history]);

  // Import data from JSON file
  const importData = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text) as HistoryEntry[];
      
      // Validate imported data
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format');
      }
      
      // Merge with existing data, keeping most recent entries within limit
      const mergedHistory = [...data, ...history].slice(0, MAX_ENTRIES);
      
      if (!saveToStorage(mergedHistory)) {
        throw new Error('Failed to save imported data');
      }
      
      setHistory(mergedHistory);
    } catch (err) {
      setError('Failed to import data');
      console.error('Import failed:', err);
    }
  }, [history]);

  return useMemo(() => ({
    history,
    error,
    addEntry,
    editEntry,
    deleteEntry,
    clearError,
    exportData,
    importData
  }), [history, error, addEntry, editEntry, deleteEntry, clearError, exportData, importData]);
}
