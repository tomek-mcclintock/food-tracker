"use client"

import { useState, useCallback } from 'react';

export function useInsights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);

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
    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { insights, loading, error, generateInsights };
}