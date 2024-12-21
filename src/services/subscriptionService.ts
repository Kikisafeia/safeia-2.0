import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Subscription {
  userId: string;
  planId: string;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate: Date;
  trialEndsAt?: Date;
  paypalOrderId?: string;
  paypalSubscriptionId?: string;
  tokensUsed: number;
  tokensLimit: number;
}

export async function createSubscription(userId: string, planDetails: any): Promise<void> {
  const subscriptionRef = doc(db, 'subscriptions', userId);
  
  // Calcular las fechas basadas en el plan
  const startDate = new Date();
  const endDate = new Date();
  const trialEndsAt = new Date();
  
  // Si es plan mensual o trimestral, agregar los días correspondientes
  if (planDetails.period === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (planDetails.period === 'quarterly') {
    endDate.setMonth(endDate.getMonth() + 3);
  }
  
  // Agregar 2 días de prueba
  trialEndsAt.setDate(trialEndsAt.getDate() + 2);

  // Determinar el límite de tokens basado en el plan
  let tokensLimit = 0;
  if (planDetails.id === 'free') {
    tokensLimit = 10000;
  } else if (planDetails.id === 'pro-monthly') {
    tokensLimit = 55000;
  } else if (planDetails.id === 'pro-quarterly') {
    tokensLimit = 165000;
  } else if (planDetails.id === 'enterprise') {
    tokensLimit = -1; // ilimitado
  }

  const subscription: Subscription = {
    userId,
    planId: planDetails.id,
    status: 'active',
    startDate,
    endDate,
    trialEndsAt,
    tokensUsed: 0,
    tokensLimit,
  };

  await setDoc(subscriptionRef, subscription);
}

export async function updateSubscriptionPayment(userId: string, paymentDetails: any): Promise<void> {
  const subscriptionRef = doc(db, 'subscriptions', userId);
  
  await updateDoc(subscriptionRef, {
    paypalOrderId: paymentDetails.id,
    paypalSubscriptionId: paymentDetails.subscriptionID,
    status: 'active'
  });
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const subscriptionRef = doc(db, 'subscriptions', userId);
  const subscriptionSnap = await getDoc(subscriptionRef);
  
  if (subscriptionSnap.exists()) {
    return subscriptionSnap.data() as Subscription;
  }
  
  return null;
}

export async function updateTokensUsed(userId: string, tokensUsed: number): Promise<void> {
  const subscriptionRef = doc(db, 'subscriptions', userId);
  
  await updateDoc(subscriptionRef, {
    tokensUsed
  });
}

export async function cancelSubscription(userId: string): Promise<void> {
  const subscriptionRef = doc(db, 'subscriptions', userId);
  
  await updateDoc(subscriptionRef, {
    status: 'cancelled'
  });
}
