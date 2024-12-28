// src/hooks/useAnalysis.js
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
      const content = [{
        type: "text",
        text: description 
          ? `Analyze this food: ${description}`
          : "Analyze this food."
      }];

      if (imageSrc) {
        const base64Data = imageSrc.split('base64,')[1];
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: base64Data
          }
        });
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1024,
          messages: [{
            role: "user",
            content: content
          }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Analysis failed');
      }

      const data = await response.json();
      const parsedResults = JSON.parse(data.content[0].text);
      setResults(parsedResults);

    } catch (err) {
      console.error('Error in analyzeFood:', err);
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return { analyzing, results, error, analyzeFood, setResults };  // Added setResults here
};