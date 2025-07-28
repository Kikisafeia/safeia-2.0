import { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export const INITIAL_TOKENS = 20000;

export const useTokens = () => {
  const { currentUser } = useAuth();
  const [tokens, setTokens] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initializeUserTokens = useCallback(async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, {
      tokens: INITIAL_TOKENS,
      lastTokenUpdate: new Date().toISOString()
    }, { merge: true });
    return INITIAL_TOKENS;
  }, []);

  const getUserTokens = useCallback(async (uid: string): Promise<number> => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists() && typeof userDoc.data().tokens === 'number') {
      return userDoc.data().tokens;
    }
    return initializeUserTokens(uid);
  }, [initializeUserTokens]);

  const fetchTokens = useCallback(async () => {
    if (!currentUser) {
      setTokens(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const userTokens = await getUserTokens(currentUser.uid);
      setTokens(userTokens);
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('Error al obtener tokens');
    } finally {
      setLoading(false);
    }
  }, [currentUser, getUserTokens]);

  const checkTokens = useCallback(async (amount: number): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const currentTokens = await getUserTokens(currentUser.uid);
      return currentTokens >= amount;
    } catch (err) {
      console.error('Error checking tokens:', err);
      return false;
    }
  }, [currentUser, getUserTokens]);

  const consumeTokens = useCallback(async (amount: number): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const currentTokens = await getUserTokens(currentUser.uid);
      if (currentTokens < amount) return false;

      const userDocRef = doc(db, 'users', currentUser.uid);
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
  }, [currentUser, getUserTokens]);

  useEffect(() => {
    fetchTokens();
  }, [fetchTokens]);

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
