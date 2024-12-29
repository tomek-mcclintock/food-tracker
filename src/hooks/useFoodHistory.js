"use client"

import { useState, useEffect, useCallback } from 'react';

export function useFoodHistory() {
  const [history, setHistory] = useState([]);
  const [initialized, setInitialized] = useState(false);
  
  // Load initial data
  useEffect(() => {
    try {
      const saved = localStorage.getItem('foodHistory');
      setHistory(saved ? JSON.parse(saved) : []);
    } catch (error) {
      console.error('Error loading history:', error);
      setHistory([]);
    } finally {
      setInitialized(true);
    }
  }, []);

  const addEntry = useCallback((entry) => {
    try {
      console.log('Adding entry:', entry); // Debug log
      const currentHistory = JSON.parse(localStorage.getItem('foodHistory') || '[]');
      console.log('Current history:', currentHistory); // Debug log
      const newHistory = [entry, ...currentHistory];
      localStorage.setItem('foodHistory', JSON.stringify(newHistory));
      console.log('New history saved:', newHistory); // Debug log
      setHistory(newHistory);
  
      // Add immediate visual feedback
      return true;
    } catch (error) {
      console.error('Error adding entry:', error);
      return false;
    }
  }, []);

  const editEntry = useCallback((index, updatedEntry) => {
    try {
      const currentHistory = JSON.parse(localStorage.getItem('foodHistory') || '[]');
      const newHistory = [...currentHistory];
      newHistory[index] = updatedEntry;
      localStorage.setItem('foodHistory', JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Error editing entry:', error);
    }
  }, []);

  const deleteEntry = useCallback((index) => {
    try {
      const currentHistory = JSON.parse(localStorage.getItem('foodHistory') || '[]');
      const newHistory = currentHistory.filter((_, i) => i !== index);
      localStorage.setItem('foodHistory', JSON.stringify(newHistory));
      setHistory(newHistory);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  }, []);

  return { 
    history, 
    addEntry, 
    editEntry, 
    deleteEntry,
    initialized // Add this to know when initial load is complete
  };
}