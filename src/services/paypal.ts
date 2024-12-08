import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface PayPalSubscriptionData {
  subscriptionID: string;
  planType: 'pro-weekly' | 'pro-monthly' | 'pro-3months' | 'pro-plus';
  userID: string;
}

export const handlePayPalSubscription = async (data: PayPalSubscriptionData) => {
  const { subscriptionID, planType, userID } = data;
  
  try {
    const userRef = doc(db, 'users', userID);
    await updateDoc(userRef, {
      subscription: planType,
      subscriptionID,
      lastUpdated: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (userID: string) => {
  try {
    const userRef = doc(db, 'users', userID);
    await updateDoc(userRef, {
      subscription: 'free',
      subscriptionID: null,
      lastUpdated: new Date().toISOString(),
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};
