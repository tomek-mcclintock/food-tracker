"use client"

import { useState, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  updateDoc,
  deleteDoc,
  doc 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export function useFirestore() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const addEntry = useCallback(async (entry) => {
    if (!user) return;
    setLoading(true);
    try {
      await addDoc(collection(db, 'entries'), {
        ...entry,
        userId: user.uid,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getEntries = useCallback(async () => {
    if (!user) return [];
    setLoading(true);
    try {
      const q = query(
        collection(db, 'entries'), 
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateEntry = useCallback(async (id, data) => {
    if (!user) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'entries', id);
      await updateDoc(docRef, data);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  const deleteEntry = useCallback(async (id) => {
    if (!user) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'entries', id);
      await deleteDoc(docRef);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    addEntry,
    getEntries,
    updateEntry,
    deleteEntry,
    loading,
    error
  };
}