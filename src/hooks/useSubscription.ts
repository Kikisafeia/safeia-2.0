import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUser, canUseTokens, recordTokenUsage } from '../services/database';
import type { User } from '../services/database';

interface SubscriptionFeatures {
  maxTokensPerGeneration: number;
  hasWatermark: boolean;
  hasAdvancedFeatures: boolean;
  hasCustomDomain: boolean;
  hasAnalytics: boolean;
  hasPrioritySupport: boolean;
}

const SUBSCRIPTION_FEATURES: Record<User['subscription'], SubscriptionFeatures> = {
  'free': {
    maxTokensPerGeneration: 5,
    hasWatermark: true,
    hasAdvancedFeatures: false,
    hasCustomDomain: false,
    hasAnalytics: false,
    hasPrioritySupport: false
  },
  'pro-weekly': {
    maxTokensPerGeneration: 10,
    hasWatermark: false,
    hasAdvancedFeatures: true,
    hasCustomDomain: false,
    hasAnalytics: false,
    hasPrioritySupport: false
  },
  'pro-monthly': {
    maxTokensPerGeneration: 10000,
    hasWatermark: false,
    hasAdvancedFeatures: true,
    hasCustomDomain: false,
    hasAnalytics: true,
    hasPrioritySupport: true
  },
  'pro-3months': {
    maxTokensPerGeneration: 11000,
    hasWatermark: false,
    hasAdvancedFeatures: true,
    hasCustomDomain: false,
    hasAnalytics: true,
    hasPrioritySupport: true
  },
  'pro-plus': {
    maxTokensPerGeneration: 25000,
    hasWatermark: false,
    hasAdvancedFeatures: true,
    hasCustomDomain: true,
    hasAnalytics: true,
    hasPrioritySupport: true
  }
};

export function useSubscription() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUserData() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const user = await getUser(currentUser.uid);
        setUserData(user);
      } catch (err) {
        setError('Error al cargar los datos del usuario');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [currentUser]);

  const checkFeatureAccess = (feature: keyof SubscriptionFeatures): boolean => {
    if (!userData) return false;
    return SUBSCRIPTION_FEATURES[userData.subscription][feature];
  };

  const useTokens = async (amount: number, feature: string): Promise<boolean> => {
    if (!currentUser || !userData) return false;

    try {
      const canUse = await canUseTokens(currentUser.uid, amount);
      if (!canUse) {
        setError('Has alcanzado tu límite de tokens');
        return false;
      }

      await recordTokenUsage(currentUser.uid, amount, feature);
      const updatedUser = await getUser(currentUser.uid);
      setUserData(updatedUser);
      return true;
    } catch (err) {
      setError('Error al usar tokens');
      console.error(err);
      return false;
    }
  };

  const getRemainingTokens = (): number => {
    if (!userData) return 0;
    return userData.tokenLimit - userData.tokenCount;
  };

  const getFeatures = (): SubscriptionFeatures | null => {
    if (!userData) return null;
    return SUBSCRIPTION_FEATURES[userData.subscription];
  };

  return {
    userData,
    loading,
    error,
    checkFeatureAccess,
    useTokens,
    getRemainingTokens,
    getFeatures
  };
}
