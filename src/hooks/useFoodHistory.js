"use client"

import { useState, useEffect, useCallback } from 'react';
import { useFirestore } from './useFirestore';
import { useAuth } from '@/context/AuthContext';

export function useFoodHistory() {
  const [history, setHistory] = useState([]);
  const { user } = useAuth();
  const { addEntry: addToFirestore, getEntries, updateEntry: updateInFirestore, deleteEntry: deleteFromFirestore } = useFirestore();

  // Load entries when component mounts or user changes
  useEffect(() => {
    if (user) {
      const loadEntries = async () => {
        try {
          const entries = await getEntries();
          setHistory(entries);
        } catch (error) {
          console.error('Error loading entries:', error);
        }
      };
      loadEntries();
    } else {
      setHistory([]); // Clear history when user logs out
    }
  }, [user, getEntries]);

  const editEntry = useCallback(async (id, updatedEntry) => {
    try {
      await updateInFirestore(id, updatedEntry);
      // Immediately update local state
      const updatedEntries = await getEntries();
      setHistory(updatedEntries);
      console.log('Updated history after edit:', updatedEntries); // Debug log
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  }, [updateInFirestore, getEntries]);

  const editEntry = useCallback(async (id, updatedEntry) => {
    try {
      await updateInFirestore(id, updatedEntry);
      // Refresh the history after updating
      const updatedEntries = await getEntries();
      setHistory(updatedEntries);
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  }, [updateInFirestore, getEntries]);

  const deleteEntry = useCallback(async (id) => {
    try {
      await deleteFromFirestore(id);
      // Refresh the history after deleting
      const updatedEntries = await getEntries();
      setHistory(updatedEntries);
    } catch (error) {
      console.error('Error deleting entry:', error);
    }
  }, [deleteFromFirestore, getEntries]);

  return { history, addEntry, editEntry, deleteEntry };
}