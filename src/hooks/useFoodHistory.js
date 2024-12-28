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

  return { history, addEntry };
}