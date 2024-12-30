import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

export function useFeatures() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();  // Get the current user

  // Fetch features when component mounts
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'features'));
        const featuresData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Check if this user has voted for this feature
          hasVoted: doc.data().votedBy?.includes(user?.uid)
        }));
        setFeatures(featuresData);
      } catch (error) {
        console.error('Error fetching features:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFeatures();
    }
  }, [user]);

  // Handle voting
  const handleVote = async (featureId) => {
    if (!user) return; // Don't allow voting if not logged in

    try {
      const featureRef = doc(db, 'features', featureId);
      const feature = features.find(f => f.id === featureId);
      
      // Get current voters list or empty array if none
      const currentVoters = feature.votedBy || [];
      const hasVoted = currentVoters.includes(user.uid);
      
      // Update voters list and vote count
      const newVoters = hasVoted
        ? currentVoters.filter(id => id !== user.uid)
        : [...currentVoters, user.uid];
      
      const newVotes = hasVoted ? feature.votes - 1 : feature.votes + 1;
      
      // Update in Firebase
      await updateDoc(featureRef, {
        votes: newVotes,
        votedBy: newVoters
      });

      // Update local state
      setFeatures(features.map(f => 
        f.id === featureId 
          ? { 
              ...f, 
              votes: newVotes, 
              votedBy: newVoters,
              hasVoted: !hasVoted 
            } 
          : f
      ));
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };

  // Add new feature
  const addFeature = async (newFeature) => {
    if (!user) return;

    try {
      const docRef = await addDoc(collection(db, 'features'), {
        ...newFeature,
        votes: 0,
        votedBy: [],
        createdBy: user.uid,
        createdAt: new Date().toISOString()
      });
      
      setFeatures([...features, { 
        id: docRef.id, 
        ...newFeature, 
        votes: 0,
        votedBy: [],
        hasVoted: false
      }]);
    } catch (error) {
      console.error('Error adding feature:', error);
    }
  };

  return { features, loading, handleVote, addFeature };
}