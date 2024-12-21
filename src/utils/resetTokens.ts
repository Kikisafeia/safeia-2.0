import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const resetUserTokens = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      throw new Error('Usuario no encontrado');
    }

    await updateDoc(userDocRef, {
      tokens: 10000,
      lastTokenReset: new Date().toISOString()
    });

    console.log('Tokens restablecidos a 10,000');
    return true;
  } catch (error) {
    console.error('Error al restablecer tokens:', error);
    throw error;
  }
};
