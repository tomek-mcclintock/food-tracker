import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

// Initial features data
const initialFeatures = [
  {
    title: "Meal Planning Based on Sensitivities",
    description: "Get personalized meal suggestions based on your identified food sensitivities and preferences. Including recipe alternatives and ingredient substitutions.",
    votes: 42,
    votedBy: []
  },
  {
    title: "Share Food Diary with Healthcare Provider",
    description: "Export or directly share your food diary and sensitivity patterns with your doctor, nutritionist, or other healthcare providers.",
    votes: 38,
    votedBy: []
  },
  // ... add the rest of your initial features here
];

export function useFeatures() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Initialize and fetch features
  useEffect(() => {
    const initializeFeatures = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get existing features
        const querySnapshot = await getDocs(collection(db, 'features'));
        
        // If no features exist, initialize with default data
        if (querySnapshot.empty) {
          console.log('Initializing features...');
          const batch = initialFeatures.map(async (feature) => {
            await addDoc(collection(db, 'features'), {
              ...feature,
              createdAt: new Date().toISOString()
            });
          });
          await Promise.all(batch);
          
          // Fetch again after initialization
          const newSnapshot = await getDocs(collection(db, 'features'));
          const featuresData = newSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            hasVoted: doc.data().votedBy?.includes(user.uid)
          }));
          console.log('Initialized features:', featuresData);
          setFeatures(featuresData);
        } else {
          // Use existing features
          const featuresData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            hasVoted: doc.data().votedBy?.includes(user.uid)
          }));
          console.log('Loaded existing features:', featuresData);
          setFeatures(featuresData);
        }
      } catch (error) {
        console.error('Error initializing features:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeFeatures();
  }, [user]);

  // Handle voting with debug logs
  const handleVote = async (featureId) => {
    if (!user) {
      console.log('No user logged in');
      return;
    }

    try {
      console.log('Handling vote for feature:', featureId);
      const featureRef = doc(db, 'features', featureId);
      const feature = features.find(f => f.id === featureId);
      
      if (!feature) {
        console.error('Feature not found:', featureId);
        return;
      }

      const currentVoters = feature.votedBy || [];
      const hasVoted = currentVoters.includes(user.uid);
      
      console.log('Current voters:', currentVoters);
      console.log('User has voted:', hasVoted);

      const newVoters = hasVoted
        ? currentVoters.filter(id => id !== user.uid)
        : [...currentVoters, user.uid];
      
      const newVotes = hasVoted ? feature.votes - 1 : feature.votes + 1;
      
      console.log('Updating Firebase with:', {
        votes: newVotes,
        votedBy: newVoters
      });

      // Update in Firebase
      await updateDoc(featureRef, {
        votes: newVotes,
        votedBy: newVoters
      });

      // Update local state
      const updatedFeatures = features.map(f =>
        f.id === featureId
          ? {
              ...f,
              votes: newVotes,
              votedBy: newVoters,
              hasVoted: !hasVoted
            }
          : f
      );

      console.log('Updated features:', updatedFeatures);
      setFeatures(updatedFeatures);
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };

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