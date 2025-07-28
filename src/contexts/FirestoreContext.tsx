import React, { createContext, useContext } from 'react';
import { Firestore } from 'firebase/firestore';
import { db } from '../config/firebase'; // Import the initialized db instance

interface FirestoreContextType {
  db: Firestore | null;
}

// Create the context with a default value (can be null initially)
const FirestoreContext = createContext<FirestoreContextType>({ db: null });

// Custom hook to use the Firestore context
export function useFirestore() {
  const context = useContext(FirestoreContext);
  if (context === undefined) {
    throw new Error('useFirestore must be used within a FirestoreProvider');
  }
  // You might want to add a check here if context.db is null and throw an error
  // or handle it depending on your application's needs.
  if (!context.db) {
     console.warn("Firestore context was accessed before db was initialized or db is null.");
     // Depending on strictness, you could throw an error:
     // throw new Error('Firestore instance is not available in context');
  }
  return context;
}

// Provider component
export function FirestoreProvider({ children }: { children: React.ReactNode }) {
  // The value provided is the imported db instance
  // Ensure db is correctly initialized in firebase.ts before this provider renders
  const value = { db }; 

  return (
    <FirestoreContext.Provider value={value}>
      {children}
    </FirestoreContext.Provider>
  );
}
