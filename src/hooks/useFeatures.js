import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';

const initialFeatures = [
  {
    title: "Recipe Import & Analysis",
    description: "Import recipes from popular cooking websites and automatically analyze them for potential trigger ingredients.",
    votes: 3,
    votedBy: []
  },
  {
    title: "Shopping List Generator",
    description: "Create shopping lists based on your safe foods and get warnings about products that might contain trigger ingredients.",
    votes: 7,
    votedBy: []
  },
  {
    title: "Cross-Contamination Warnings",
    description: "Get alerts about potential cross-contamination risks when logging meals, especially useful for severe allergies.",
    votes: 5,
    votedBy: []
  },
  {
    title: "Share Food Diary with Healthcare Provider",
    description: "Export or directly share your food diary and sensitivity patterns with your doctor, nutritionist, or other healthcare providers.",
    votes: 9,
    votedBy: []
  },
  {
    title: "Meal Planning Based on Sensitivities",
    description: "Get personalized meal suggestions based on your identified food sensitivities and preferences. Including recipe alternatives and ingredient substitutions.",
    votes: 10,
    votedBy: []
  }
];

export function useFeatures() {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const initializeFeatures = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const querySnapshot = await getDocs(collection(db, 'features'));
        
        if (querySnapshot.empty) {
          const batch = initialFeatures.map(async (feature) => {
            await addDoc(collection(db, 'features'), {
              ...feature,
              createdAt: new Date().toISOString()
            });
          });
          await Promise.all(batch);
          
          const newSnapshot = await getDocs(collection(db, 'features'));
          const featuresData = newSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            hasVoted: doc.data().votedBy?.includes(user.uid)
          }));
          setFeatures(featuresData);
        } else {
          const featuresData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            hasVoted: doc.data().votedBy?.includes(user.uid)
          }));
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

  const handleVote = async (featureId) => {
    if (!user) return;

    try {
      const featureRef = doc(db, 'features', featureId);
      const feature = features.find(f => f.id === featureId);
      
      const currentVoters = feature.votedBy || [];
      const hasVoted = currentVoters.includes(user.uid);
      
      const newVoters = hasVoted
        ? currentVoters.filter(id => id !== user.uid)
        : [...currentVoters, user.uid];
      
      const newVotes = hasVoted ? feature.votes - 1 : feature.votes + 1;
      
      await updateDoc(featureRef, {
        votes: newVotes,
        votedBy: newVoters
      });

      setFeatures(features.map(f =>
        f.id === featureId
          ? { ...f, votes: newVotes, votedBy: newVoters, hasVoted: !hasVoted }
          : f
      ));
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