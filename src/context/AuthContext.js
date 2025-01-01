"use client"

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Cookies from 'js-cookie';  // We'll need to install this

export const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get the token and set it in cookies
        const token = await user.getIdToken();
        Cookies.set('auth-token', token);
        setUser(user);
      } else {
        Cookies.remove('auth-token');
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const googleProvider = new GoogleAuthProvider();

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      // Add these lines to customize the mobile experience
      provider.setCustomParameters({
        prompt: 'select_account',
        // Use relative path for redirect
        redirect_uri: `${window.location.origin}/history`
      });
      
      const result = await signInWithPopup(auth, provider);
      
      // Use Next.js router instead of window.location
      window.location.replace('/history');
      return result;
    } catch (error) {
      console.error('Google Sign In Error:', error);
      throw error;
    }
  };

  const signup = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return result;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout, signInWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};