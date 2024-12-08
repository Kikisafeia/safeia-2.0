import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  increment
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface User {
  email: string;
  subscription: 'free' | 'pro-weekly' | 'pro-monthly' | 'pro-3months' | 'pro-plus';
  subscriptionID: string | null;
  createdAt: Date;
  lastUpdated: Date;
  tokenCount: number;
  tokenLimit: number;
  company?: string;
  name?: string;
  usageHistory: {
    date: Date;
    tokensUsed: number;
    feature: string;
  }[];
}

// Crear un nuevo usuario en la base de datos
export async function createUser(userId: string, email: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const userData: User = {
    email,
    subscription: 'free',
    subscriptionID: null,
    createdAt: new Date(),
    lastUpdated: new Date(),
    tokenCount: 0,
    tokenLimit: 5, // Límite para plan gratuito
    usageHistory: []
  };

  await setDoc(userRef, userData);
}

// Obtener datos del usuario
export async function getUser(userId: string): Promise<User | null> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    return userSnap.data() as User;
  }
  return null;
}

// Actualizar suscripción del usuario
export async function updateUserSubscription(
  userId: string,
  subscription: User['subscription'],
  subscriptionID: string
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  const tokenLimits: { [key: string]: number } = {
    'free': 5,
    'pro-weekly': 10,
    'pro-monthly': 10000,
    'pro-3months': 11000,
    'pro-plus': 25000
  };

  await updateDoc(userRef, {
    subscription,
    subscriptionID,
    lastUpdated: new Date(),
    tokenLimit: tokenLimits[subscription]
  });
}

// Registrar uso de tokens
export async function recordTokenUsage(
  userId: string,
  tokensUsed: number,
  feature: string
): Promise<boolean> {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return false;
  }

  const userData = userSnap.data() as User;
  const newTokenCount = userData.tokenCount + tokensUsed;

  if (newTokenCount > userData.tokenLimit) {
    return false; // Límite de tokens excedido
  }

  const usageRecord = {
    date: new Date(),
    tokensUsed,
    feature
  };

  await updateDoc(userRef, {
    tokenCount: increment(tokensUsed),
    lastUpdated: new Date(),
    usageHistory: [...userData.usageHistory, usageRecord]
  });

  return true;
}

// Reiniciar contador de tokens (para planes mensuales)
export async function resetTokenCount(userId: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    tokenCount: 0,
    lastUpdated: new Date()
  });
}

// Actualizar perfil de usuario
export async function updateUserProfile(
  userId: string,
  data: Partial<Pick<User, 'name' | 'company'>>
): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...data,
    lastUpdated: new Date()
  });
}

// Obtener historial de uso
export async function getUserUsageHistory(
  userId: string,
  startDate?: Date,
  endDate?: Date
) {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return [];
  }

  const userData = userSnap.data() as User;
  let history = userData.usageHistory;

  if (startDate) {
    history = history.filter(record => record.date >= startDate);
  }
  if (endDate) {
    history = history.filter(record => record.date <= endDate);
  }

  return history;
}

// Verificar si el usuario puede usar más tokens
export async function canUseTokens(userId: string, tokensNeeded: number): Promise<boolean> {
  const user = await getUser(userId);
  if (!user) return false;

  return (user.tokenCount + tokensNeeded) <= user.tokenLimit;
}
