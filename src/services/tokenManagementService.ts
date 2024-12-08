import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { PLANES, Plan } from '../types/plans';

interface UserData {
  plan: string;
  tokens: number;
  lastTokenReset: string;
  displayName: string;
  email: string;
}

interface TokenTransaction {
  timestamp: string;
  amount: number;
  balance: number;
  description: string;
}

export class TokenManagementService {
  static async getUserData(userId: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;
      const data = userDoc.data();
      return {
        plan: data.plan || 'gratuito',
        tokens: data.tokens || 0,
        lastTokenReset: data.lastTokenReset || new Date().toISOString(),
        displayName: data.displayName || '',
        email: data.email || ''
      };
    } catch (err) {
      console.error('Error al obtener datos del usuario:', err);
      return null;
    }
  }

  static async checkAndRenewTokens(userId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return;

      const userData = userDoc.data();
      const lastReset = new Date(userData.lastTokenReset || 0);
      const now = new Date();
      const monthDiff = now.getMonth() - lastReset.getMonth() + 
        (now.getFullYear() - lastReset.getFullYear()) * 12;

      // Si ha pasado al menos un mes desde el último reset
      if (monthDiff > 0) {
        const plan = PLANES.find(p => p.id === userData.plan);
        if (!plan) return;

        // Registrar el historial antes de renovar
        const historyRef = collection(db, 'users', userId, 'tokenHistory');
        await addDoc(historyRef, {
          timestamp: now.toISOString(),
          amount: plan.tokens,
          balance: plan.tokens,
          description: 'Renovación mensual de tokens'
        });

        // Actualizar tokens y fecha de reset
        await updateDoc(userRef, {
          tokens: plan.tokens,
          lastTokenReset: now.toISOString()
        });
      }
    } catch (err) {
      console.error('Error al renovar tokens:', err);
    }
  }

  static async getTokenBalance(userId: string): Promise<number> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return 0;
      return userDoc.data().tokens || 0;
    } catch (err) {
      console.error('Error al obtener balance de tokens:', err);
      return 0;
    }
  }

  static async consumeTokens(userId: string, amount: number, description: string): Promise<boolean> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) return false;
      
      const currentTokens = userDoc.data().tokens || 0;
      if (currentTokens < amount) return false;

      const newBalance = currentTokens - amount;

      // Registrar la transacción en el historial
      const historyRef = collection(db, 'users', userId, 'tokenHistory');
      await addDoc(historyRef, {
        timestamp: new Date().toISOString(),
        amount: -amount,
        balance: newBalance,
        description
      });

      // Actualizar el balance de tokens
      await updateDoc(userRef, {
        tokens: newBalance
      });

      return true;
    } catch (err) {
      console.error('Error al consumir tokens:', err);
      return false;
    }
  }

  static async getCurrentPlan(userId: string): Promise<Plan | null> {
    try {
      const userData = await this.getUserData(userId);
      if (!userData) return null;
      
      const plan = PLANES.find(p => p.id === userData.plan);
      return plan || null;
    } catch (err) {
      console.error('Error al obtener plan actual:', err);
      return null;
    }
  }
}
