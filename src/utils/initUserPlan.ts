import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

export const initializeUserPlan = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);

    const planInicial = {
      tipo: 'Básico',
      tokensUsados: 0,
      tokensDisponibles: 1000,
      fechaInicio: new Date(),
      fechaFin: new Date(new Date().setMonth(new Date().getMonth() + 1))
    };

    if (!userDoc.exists()) {
      // Create new user document if it doesn't exist
      await setDoc(userDocRef, {
        uid: userId,
        createdAt: new Date(),
        plan: planInicial
      });
      console.log('Usuario creado con plan inicial');
      return planInicial;
    }

    const userData = userDoc.data();
    
    // Initialize plan if it doesn't exist
    if (!userData.plan) {
      await updateDoc(userDocRef, {
        plan: planInicial
      });

      console.log('Plan inicializado correctamente');
      return planInicial;
    } else {
      console.log('El usuario ya tiene un plan');
      return userData.plan;
    }
  } catch (error) {
    console.error('Error al inicializar el plan:', error);
    throw error;
  }
};
