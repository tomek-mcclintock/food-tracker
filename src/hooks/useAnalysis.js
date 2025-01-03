"use client"

import { useState, useCallback } from 'react';

export function useAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyzeFood = useCallback(async (description, imageSrc) => {
    setAnalyzing(true);
    setError(null);
    
    try {
      const content = [];

      content.push({
        type: "text",
        text: description || "Please analyze this food"
      });

      if (imageSrc) {
        const base64Data = imageSrc.split('base64,')[1];
        content.push({
          type: "image",
          source: {
            type: "base64",
            data: base64Data
          }
        });
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResults(data);

    } catch (err) {
      console.error('Error in analyzeFood:', err);
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return { analyzing, results, error, analyzeFood, setResults };
}