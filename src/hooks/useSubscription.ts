import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { checkSubscriptionStatus } from '../services/paypal';
import type { Subscription } from '../types/subscription';

interface SubscriptionFeatures {
  hasAccess: boolean;
  isInTrial: boolean;
  daysLeftInTrial: number;
  currentPlan: string | null;
  isActive: boolean;
}

export function useSubscription() {
  const { currentUser } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<SubscriptionFeatures>({
    hasAccess: false,
    isInTrial: false,
    daysLeftInTrial: 0,
    currentPlan: null,
    isActive: false
  });

  useEffect(() => {
    async function loadSubscriptionData() {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        
        if (userData.subscriptionId) {
          const subscriptionRef = doc(db, 'subscriptions', userData.subscriptionId);
          const subscriptionDoc = await getDoc(subscriptionRef);
          
          if (subscriptionDoc.exists()) {
            const subscriptionData = subscriptionDoc.data() as Subscription;
            setSubscription(subscriptionData);
            
            const now = new Date();
            const trialEnd = new Date(subscriptionData.trialEndsAt);
            const daysLeft = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
            
            setFeatures({
              hasAccess: await checkSubscriptionStatus(currentUser.uid),
              isInTrial: subscriptionData.status === 'trial',
              daysLeftInTrial: daysLeft,
              currentPlan: subscriptionData.planId,
              isActive: subscriptionData.status === 'active' || subscriptionData.status === 'trial'
            });
          }
        }
      } catch (err) {
        console.error('Error loading subscription:', err);
        setError('Error al cargar los datos de la suscripción');
      } finally {
        setLoading(false);
      }
    }

    loadSubscriptionData();
  }, [currentUser]);

  const checkAccess = async (): Promise<boolean> => {
    if (!currentUser) return false;
    return checkSubscriptionStatus(currentUser.uid);
  };

  const getTrialDaysLeft = (): number => {
    if (!subscription || subscription.status !== 'trial') return 0;
    const now = new Date();
    const trialEnd = new Date(subscription.trialEndsAt);
    return Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  };

  return {
    subscription,
    features,
    loading,
    error,
    checkAccess,
    getTrialDaysLeft,
    isLoading: loading,
    isError: !!error
  };
}
