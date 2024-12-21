import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const initializeUserPlan = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    const initialData = {
      tokens: 10000,
      lastTokenReset: new Date().toISOString()
    };

    if (!userDoc.exists()) {
      // Create new user document if it doesn't exist
      await setDoc(userDocRef, {
        uid: userId,
        createdAt: new Date(),
        ...initialData
      });
      console.log('Usuario creado con 10,000 tokens iniciales');
      return initialData;
    }

    const userData = userDoc.data();
    
    // Initialize tokens if they don't exist
    if (typeof userData.tokens === 'undefined') {
      await updateDoc(userDocRef, initialData);
      console.log('Tokens inicializados: 10,000');
      return initialData;
    } else {
      console.log('El usuario ya tiene tokens:', userData.tokens);
      return userData;
    }
  } catch (error) {
    console.error('Error al inicializar tokens:', error);
    throw error;
  }
};
