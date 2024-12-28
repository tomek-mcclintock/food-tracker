// src/hooks/useAnalysis.js
import { useState, useCallback, useMemo } from 'react';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const SUPPORTED_FORMATS = ['image/jpeg', 'image/png'];

export function useAnalysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const validateImage = useCallback((imageSrc) => {
    if (!imageSrc) return null;
    
    // Check if base64 image exceeds size limit
    const base64Data = imageSrc.split('base64,')[1];
    const sizeInBytes = (base64Data.length * 3) / 4;
    if (sizeInBytes > MAX_IMAGE_SIZE) {
      throw new Error('Image size exceeds 5MB limit');
    }

    // Validate image format
    const format = imageSrc.split(';')[0].split('/')[1];
    if (!SUPPORTED_FORMATS.includes(`image/${format}`)) {
      throw new Error('Unsupported image format. Please use JPEG or PNG');
    }

    return base64Data;
  }, []);

  const analyzeFood = useCallback(async (description, imageSrc) => {
    setAnalyzing(true);
    setError(null);
    
    try {
      let base64Data = null;
      if (imageSrc) {
        try {
          base64Data = validateImage(imageSrc);
        } catch (e) {
          setError(e.message);
          setAnalyzing(false);
          return;
        }
      }
      if (!description && !base64Data) {
        throw new Error('Please provide either a description or an image');
      }

      const content = [];
      
      if (description?.trim()) {
        content.push({
          type: "text",
          text: `Analyze this food: ${description.trim()}`
        });
      } else {
        content.push({
          type: "text",
          text: "Analyze this food."
        });
      }

      if (base64Data) {
        content.push({
          type: "image",
          source: {
            type: "base64",
            media_type: "image/jpeg",
            data: base64Data
          }
        });
      }

      try {
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
        
        try {
          const parsedResults = JSON.parse(data.content[0].text);
          
          // Validate response structure
          if (!parsedResults.mainItem || !Array.isArray(parsedResults.ingredients)) {
            throw new Error('Invalid analysis results format');
          }
          
          setResults(parsedResults);
        } catch (parseError) {
          throw new Error('Failed to parse analysis results');
        }
      } catch (apiError) {
        throw new Error(`API Error: ${apiError.message}`);
      }

    } catch (err) {
      console.error('Error in analyzeFood:', err);
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }, [validateImage]);

  // Memoize the return object to prevent unnecessary re-renders
  const returnValue = useMemo(() => ({
    analyzing,
    results,
    error,
    analyzeFood,
    setResults
  }), [analyzing, results, error, analyzeFood]);

  return returnValue;
};
