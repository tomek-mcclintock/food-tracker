// src/components/WelcomeWrapper.js
"use client"

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from '@/context/AuthContext';
import WelcomeModal from './WelcomeModal';

export default function WelcomeWrapper() {
  const [showWelcome, setShowWelcome] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkWelcomeStatus = async () => {
      if (!user) {
        console.log('No user found, skipping welcome check');
        return;
      }
      
      console.log('Checking welcome status for user:', user.uid);
      
      try {
        const userSettingsRef = doc(db, 'userSettings', user.uid);
        const userDoc = await getDoc(userSettingsRef);
        
        console.log('User settings doc exists:', userDoc.exists());
        console.log('User settings data:', userDoc.data());
        
        if (!userDoc.exists()) {
          console.log('Setting showWelcome to true - new user');
          setShowWelcome(true);
          await setDoc(userSettingsRef, {
            hasSeenWelcome: true,
            createdAt: new Date().toISOString()
          });
        } else if (!userDoc.data().hasSeenWelcome) {
          console.log('Setting showWelcome to true - existing user but hasnt seen welcome');
          setShowWelcome(true);
          await setDoc(userSettingsRef, {
            hasSeenWelcome: true,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } else {
          console.log('User has already seen welcome');
        }
      } catch (error) {
        console.error('Error in checkWelcomeStatus:', error);
      }
    };

    // Add a small delay to ensure auth is fully initialized
    const timer = setTimeout(() => {
      checkWelcomeStatus();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user]);

  if (!showWelcome) return null;

  return <WelcomeModal onClose={() => setShowWelcome(false)} />;
}