import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, addDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const initialFeatures = [
  {
    title: "Meal Planning Based on Sensitivities",
    description: "Get personalized meal suggestions based on your identified food sensitivities and preferences. Including recipe alternatives and ingredient substitutions.",
    votes: 42,
    hasVoted: false
  },
  {
    title: "Share Food Diary with Healthcare Provider",
    description: "Export or directly share your food diary and sensitivity patterns with your doctor, nutritionist, or other healthcare providers.",
    votes: 38,
    hasVoted: false
  },
  {
    title: "Restaurant Menu Scanner",
    description: "Scan restaurant menus to instantly identify dishes that match your sensitivity profile, with warnings for potentially problematic ingredients.",
    votes: 35,
    hasVoted: false
  },
  {
    title: "Symptom Severity Tracking",
    description: "Add detailed symptom tracking with customizable severity scales and the ability to note duration and specific symptoms.",
    votes: 31,
    hasVoted: false
  },
  {
    title: "Barcode Scanner for Packaged Foods",
    description: "Scan product barcodes to instantly check ingredients against your sensitivity profile and get alternatives suggestions.",
    votes: 29,
    hasVoted: false
  },
  {
    title: "Cross-Contamination Warnings",
    description: "Get alerts about potential cross-contamination risks when logging meals, especially useful for severe allergies.",
    votes: 27,
    hasVoted: false
  },
  {
    title: "Weekly/Monthly Sensitivity Reports",
    description: "Receive detailed reports showing patterns in your sensitivities, including most problematic ingredients and improvement trends.",
    votes: 24,
    hasVoted: false
  },
  {
    title: "Shopping List Generator",
    description: "Create shopping lists based on your safe foods and get warnings about products that might contain trigger ingredients.",
    votes: 22,
    hasVoted: false
  },
  {
    title: "Multiple Profiles for Family Members",
    description: "Add multiple profiles to track sensitivities for different family members, with separate logs and analyses.",
    votes: 19,
    hasVoted: false
  },
  {
    title: "Recipe Import & Analysis",
    description: "Import recipes from popular cooking websites and automatically analyze them for potential trigger ingredients.",
    votes: 17,
    hasVoted: false
  }
];

export const useFeatures = () => {
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch features from Firestore
  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'features'));
        
        // If no features exist, seed with initial data
        if (querySnapshot.empty) {
          const batch = initialFeatures.map(async (feature, index) => {
            const docRef = doc(db, 'features', `feature_${index + 1}`);
            await setDoc(docRef, feature);
          });
          await Promise.all(batch);
        }

        const featuresData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeatures(featuresData);
      } catch (error) {
        console.error('Error fetching features:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  // Handle voting
  const handleVote = async (featureId, hasVoted) => {
    try {
      const featureRef = doc(db, 'features', featureId);
      const feature = features.find(f => f.id === featureId);
      
      const newVotes = hasVoted ? feature.votes - 1 : feature.votes + 1;
      
      await updateDoc(featureRef, {
        votes: newVotes,
        hasVoted: !hasVoted
      });

      setFeatures(features.map(f => 
        f.id === featureId ? { ...f, votes: newVotes, hasVoted: !hasVoted } : f
      ));
    } catch (error) {
      console.error('Error updating vote:', error);
    }
  };

  // Add new feature
  const addFeature = async (newFeature) => {
    try {
      const docRef = await addDoc(collection(db, 'features'), {
        ...newFeature,
        votes: 0,
        hasVoted: false,
        createdAt: new Date()
      });
      
      setFeatures([...features, { id: docRef.id, ...newFeature }]);
    } catch (error) {
      console.error('Error adding feature:', error);
    }
  };

  return { features, loading, handleVote, addFeature };
};
