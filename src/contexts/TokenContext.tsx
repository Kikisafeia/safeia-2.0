import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface TokenContextType {
  availableTokens: number;
  loading: boolean;
  error: string | null;
  consumeTokens: (amount: number) => Promise<boolean>;
  refreshTokens: () => Promise<void>;
  updatePlan: (planType: string) => Promise<void>;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function useTokens() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useTokens debe ser usado dentro de un TokenProvider');
  }
  return context;
}

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const [availableTokens, setAvailableTokens] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const refreshTokens = async () => {
    if (!currentUser) {
      setAvailableTokens(0);
      return;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setAvailableTokens(userDoc.data().tokens || 0);
      }
    } catch (err) {
      setError('Error al cargar los tokens');
      console.error('Error al cargar tokens:', err);
    }
  };

  const consumeTokens = async (amount: number): Promise<boolean> => {
    if (!currentUser) return false;
    if (availableTokens < amount) return false;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        tokens: availableTokens - amount
      });
      setAvailableTokens(prev => prev - amount);
      return true;
    } catch (err) {
      setError('Error al consumir tokens');
      console.error('Error al consumir tokens:', err);
      return false;
    }
  };

  const updatePlan = async (planType: string) => {
    if (!currentUser) return;

    const planTokens = {
      free: 10000,
      basic: 20000,
      standard: 50000,
      advanced: 100000
    }[planType] || 0;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        plan: planType,
        tokens: planTokens
      });
      setAvailableTokens(planTokens);
    } catch (err) {
      setError('Error al actualizar el plan');
      console.error('Error al actualizar plan:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      refreshTokens();
    } else {
      setAvailableTokens(0);
    }
    setLoading(false);
  }, [currentUser]);

  const value = {
    availableTokens,
    loading,
    error,
    consumeTokens,
    refreshTokens,
    updatePlan
  };

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
}
