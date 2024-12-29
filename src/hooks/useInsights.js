"use client"

import { useState, useCallback, useEffect } from 'react';

export function useInsights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);

  // Load saved insights when component mounts
  useEffect(() => {
    try {
      const savedInsights = localStorage.getItem('foodInsights');
      if (savedInsights) {
        setInsights(JSON.parse(savedInsights));
      }
    } catch (error) {
      console.error('Error loading saved insights:', error);
    }
  }, []);

  const generateInsights = useCallback(async (history) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ history })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate insights');
      }

      const data = await response.json();
      setInsights(data);
      // Save insights to localStorage
      localStorage.setItem('foodInsights', JSON.stringify(data));
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { insights, loading, error, generateInsights };
}