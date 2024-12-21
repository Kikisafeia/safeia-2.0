import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Subscription } from '../types/subscription';

interface PayPalSubscriptionData {
  subscriptionID: string;
  planId: 'pro-1-semana' | 'pro-1-mes' | 'pro-3-meses';
  userID: string;
}

const TRIAL_DAYS = 2;

export const createSubscription = async (data: PayPalSubscriptionData): Promise<Subscription> => {
  const { subscriptionID, planId, userID } = data;
  const now = new Date();
  const trialEnd = new Date(now.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
  
  const subscription: Subscription = {
    id: subscriptionID,
    userId: userID,
    planId: planId,
    status: 'trial',
    startDate: now.toISOString(),
    trialEndsAt: trialEnd.toISOString(),
    currentPeriodEnd: trialEnd.toISOString(), // Se actualizará cuando se procese el primer pago
    paypalSubscriptionId: subscriptionID,
    cancelAtPeriodEnd: false
  };

  try {
    // Actualizar la suscripción en Firestore
    const subscriptionRef = doc(db, 'subscriptions', subscriptionID);
    await setDoc(subscriptionRef, subscription);

    // Actualizar el usuario con la referencia a la suscripción
    const userRef = doc(db, 'users', userID);
    await updateDoc(userRef, {
      subscriptionId: subscriptionID,
      planId: planId,
      trialEndsAt: trialEnd.toISOString(),
      lastUpdated: now.toISOString()
    });
    
    return subscription;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const updateSubscriptionStatus = async (subscriptionId: string, status: Subscription['status'], currentPeriodEnd?: string) => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
    const subscription = await getDoc(subscriptionRef);
    
    if (!subscription.exists()) {
      throw new Error('Subscription not found');
    }

    const updates: Partial<Subscription> = {
      status,
      lastUpdated: new Date().toISOString()
    };

    if (currentPeriodEnd) {
      updates.currentPeriodEnd = currentPeriodEnd;
    }

    await updateDoc(subscriptionRef, updates);

    // Actualizar también el usuario
    const subscriptionData = subscription.data() as Subscription;
    const userRef = doc(db, 'users', subscriptionData.userId);
    await updateDoc(userRef, {
      subscriptionStatus: status,
      lastUpdated: new Date().toISOString()
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId: string) => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
    const subscription = await getDoc(subscriptionRef);
    
    if (!subscription.exists()) {
      throw new Error('Subscription not found');
    }

    const subscriptionData = subscription.data() as Subscription;

    // Marcar la suscripción para cancelación al final del período
    await updateDoc(subscriptionRef, {
      cancelAtPeriodEnd: true,
      lastUpdated: new Date().toISOString()
    });

    // Actualizar el usuario
    const userRef = doc(db, 'users', subscriptionData.userId);
    await updateDoc(userRef, {
      cancelAtPeriodEnd: true,
      lastUpdated: new Date().toISOString()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};

export const checkSubscriptionStatus = async (userId: string): Promise<boolean> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return false;
    }

    const userData = userDoc.data();
    
    // Si no hay suscripción, no tiene acceso
    if (!userData.subscriptionId) {
      return false;
    }

    const subscriptionRef = doc(db, 'subscriptions', userData.subscriptionId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (!subscriptionDoc.exists()) {
      return false;
    }

    const subscription = subscriptionDoc.data() as Subscription;
    const now = new Date();

    // Si está en período de prueba
    if (subscription.status === 'trial') {
      return new Date(subscription.trialEndsAt) > now;
    }

    // Si la suscripción está activa
    if (subscription.status === 'active') {
      return new Date(subscription.currentPeriodEnd) > now;
    }

    return false;
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
};
