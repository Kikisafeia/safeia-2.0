import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

interface UseTokensReturn {
  checkTokens: (requiredTokens: number) => Promise<boolean>;
  consumeTokens: (amount: number) => Promise<boolean>;
  getTokenBalance: () => Promise<number>;
  loading: boolean;
  error: string | null;
}

export const TOKEN_COSTS = {
  DOCUMENT_GENERATION: 100,
  CONTRACT_ANALYSIS: 200,
  LEGAL_ASSISTANT: 50,
  AGENT_CHAT: {
    SHORT_QUERY: 25,    // Consultas cortas y simples
    MEDIUM_QUERY: 50,   // Consultas que requieren análisis moderado
    LONG_QUERY: 100,    // Consultas complejas o que requieren análisis extenso
    DOCUMENT_REVIEW: 150 // Revisión de documentos
  }
} as const;

export function useTokens(): UseTokensReturn {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTokenBalance = async (): Promise<number> => {
    if (!currentUser) return 0;

    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        return userDoc.data().tokens || 0;
      }
      return 0;
    } catch (err) {
      console.error('Error al obtener balance de tokens:', err);
      setError('Error al verificar tokens disponibles');
      return 0;
    }
  };

  const checkTokens = async (requiredTokens: number): Promise<boolean> => {
    const balance = await getTokenBalance();
    return balance >= requiredTokens;
  };

  const consumeTokens = async (amount: number): Promise<boolean> => {
    if (!currentUser) return false;
    setLoading(true);
    setError(null);

    try {
      const balance = await getTokenBalance();
      if (balance < amount) {
        setError('No hay suficientes tokens disponibles');
        return false;
      }

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        tokens: balance - amount,
        tokenHistory: {
          timestamp: new Date().toISOString(),
          amount: -amount,
          balance: balance - amount
        }
      });

      return true;
    } catch (err) {
      console.error('Error al consumir tokens:', err);
      setError('Error al procesar tokens');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    checkTokens,
    consumeTokens,
    getTokenBalance,
    loading,
    error
  };
}
