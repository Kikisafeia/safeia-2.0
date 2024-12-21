import { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Constante para tokens iniciales (20,000 para plan gratuito)
export const INITIAL_TOKENS = 20000;

export const useTokens = () => {
  const [tokens, setTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeUserTokens = async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      tokens: INITIAL_TOKENS,
      lastTokenUpdate: new Date().toISOString()
    }, { merge: true });
    return INITIAL_TOKENS;
  };

  const fetchTokens = async () => {
    if (!auth.currentUser) {
      setTokens(null);
      setLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const currentTokens = userDoc.data().tokens;
        if (typeof currentTokens === 'number') {
          setTokens(currentTokens);
        } else {
          // Si tokens no existe o no es un número, inicializar
          const newTokens = await initializeUserTokens(auth.currentUser.uid);
          setTokens(newTokens);
        }
      } else {
        // Si el documento no existe, crear uno nuevo
        const newTokens = await initializeUserTokens(auth.currentUser.uid);
        setTokens(newTokens);
      }
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('Error al obtener tokens');
    } finally {
      setLoading(false);
    }
  };

  const checkTokens = async (amount: number): Promise<boolean> => {
    if (!auth.currentUser) return false;
    
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let currentTokens: number;
      
      if (userDoc.exists()) {
        currentTokens = userDoc.data().tokens;
        if (typeof currentTokens !== 'number') {
          currentTokens = await initializeUserTokens(auth.currentUser.uid);
        }
      } else {
        currentTokens = await initializeUserTokens(auth.currentUser.uid);
      }
      
      return currentTokens >= amount;
    } catch (err) {
      console.error('Error checking tokens:', err);
      return false;
    }
  };

  const consumeTokens = async (amount: number): Promise<boolean> => {
    if (!auth.currentUser) return false;

    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      let currentTokens: number;
      
      if (userDoc.exists()) {
        currentTokens = userDoc.data().tokens;
        if (typeof currentTokens !== 'number') {
          currentTokens = await initializeUserTokens(auth.currentUser.uid);
        }
      } else {
        currentTokens = await initializeUserTokens(auth.currentUser.uid);
      }

      if (currentTokens < amount) return false;

      await updateDoc(userDocRef, {
        tokens: currentTokens - amount,
        lastTokenUpdate: new Date().toISOString()
      });

      setTokens(currentTokens - amount);
      return true;
    } catch (err) {
      console.error('Error consuming tokens:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchTokens();
    const unsubscribe = auth.onAuthStateChanged(() => {
      fetchTokens();
    });
    return () => unsubscribe();
  }, []);

  return {
    tokens,
    loading,
    error,
    checkTokens,
    consumeTokens,
    refreshTokens: fetchTokens,
    getTokenBalance: fetchTokens
  };
};
