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
      if (!user) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'userSettings', user.uid));
        
        if (!userDoc.exists() || !userDoc.data().hasSeenWelcome) {
          setShowWelcome(true);
          // Mark as seen
          await setDoc(doc(db, 'userSettings', user.uid), {
            hasSeenWelcome: true
          }, { merge: true });
        }
      } catch (error) {
        console.error('Error checking welcome status:', error);
      }
    };

    checkWelcomeStatus();
  }, [user]);

  if (!showWelcome) return null;

  return <WelcomeModal onClose={() => setShowWelcome(false)} />;
}