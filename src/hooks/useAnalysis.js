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
  
      console.log('Sending request with content:', content);
  
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
  
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Analysis failed with response:', data);
        throw new Error(data.error || 'Analysis failed');
      }
  
      console.log('Analysis results:', data);
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