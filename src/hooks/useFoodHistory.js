// src/hooks/useFoodHistory.js
import { useState, useEffect, useCallback } from 'react';

export function useFoodHistory() {
  const [history, setHistory] = useState([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('foodHistory');
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  const addEntry = useCallback((entry) => {
    const newHistory = [entry, ...history];
    localStorage.setItem('foodHistory', JSON.stringify(newHistory));
    setHistory(newHistory);
  }, [history]);

  const editEntry = useCallback((index, updatedEntry) => {
    const newHistory = [...history];
    newHistory[index] = updatedEntry;
    localStorage.setItem('foodHistory', JSON.stringify(newHistory));
    setHistory(newHistory);
  }, [history]);

  const deleteEntry = useCallback((index) => {
    const newHistory = history.filter((_, i) => i !== index);
    localStorage.setItem('foodHistory', JSON.stringify(newHistory));
    setHistory(newHistory);
  }, [history]);

  return { history, addEntry, editEntry, deleteEntry };
}