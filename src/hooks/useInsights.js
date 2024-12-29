"use client"

import { useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';

export function useInsights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState(null);
  const { user } = useAuth();

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
      
      // Store insights in Firestore
      const insightsRef = collection(db, 'insights');
      await addDoc(insightsRef, {
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

  // Load latest insights for user
  const loadInsights = useCallback(async () => {
    if (!user) return;
    try {
      const q = query(
        collection(db, 'insights'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const latestInsight = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

      if (latestInsight) {
        setInsights(latestInsight.insights);
      }
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  }, [user]);

  return { insights, loading, error, generateInsights, loadInsights };
}