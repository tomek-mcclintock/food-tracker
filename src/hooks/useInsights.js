"use client"

import { useState, useCallback, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit 
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

export function useInsights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const { user } = useAuth();

  // Load the most recent insights when component mounts
  useEffect(() => {
    const loadLatestInsights = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'insights'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          limit(1)
        );
        
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const latestInsight = querySnapshot.docs[0].data();
          setInsights(latestInsight.insights);
        }
      } catch (err) {
        console.error('Error loading insights:', err);
      }
    };

    loadLatestInsights();
  }, [user]);

  const generateInsights = useCallback(async (history) => {
    if (!user) return;
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
      
      // Store insights in Firestore with timestamp
      await addDoc(collection(db, 'insights'), {
        userId: user.uid,
        insights: data,
        createdAt: new Date().toISOString()
      });

    } catch (err) {
      console.error('Error generating insights:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { insights, loading, error, generateInsights };
}