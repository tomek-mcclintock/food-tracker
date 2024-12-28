// src/hooks/useAnalysis.js
import { useState, useCallback } from 'react';

const CACHE_KEY = 'analysisCache';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export function useAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const analyzeFood = useCallback(async (description, imageSrc) => {
    setAnalyzing(true);
    setError(null);

    try {
      // Check cache for description-only requests
      if (!imageSrc && description) {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        const cached = cache[description];
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          setResults(cached.results);
          setAnalyzing(false);
          return;
        }
      }

      const content = [{
        type: "text",
        text: description ? `Analyze this food: ${description}` : "Analyze this food."
      }];

      if (imageSrc) {
        const base64Data = imageSrc.split('base64,')[1];
        content.push({
          type: "image",
          source: { type: "base64", media_type: "image/jpeg", data: base64Data }
        });
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 1024,
          messages: [{ role: "user", content }]
        })
      });

      if (!response.ok) {
        throw new Error((await response.json()).error?.message || 'Analysis failed');
      }

      const data = await response.json();
      const parsedResults = JSON.parse(data.content[0].text);
      
      // Cache description-only results
      if (!imageSrc && description) {
        const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
        cache[description] = { results: parsedResults, timestamp: Date.now() };
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
      }

      setResults(parsedResults);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return { analyzing, results, error, analyzeFood };
}