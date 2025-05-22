import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
// Import initializeFirestore instead of getFirestore to apply settings
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore'; 
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
console.log('[firebase.ts] Firebase Config:', firebaseConfig); // Log the config
const app = initializeApp(firebaseConfig);
console.log('[firebase.ts] Firebase App Initialized:', app); // Log the initialized app object
if (app && app.name) {
  console.log('[firebase.ts] Firebase App Name:', app.name);
} else {
  console.error('[firebase.ts] Firebase App initialization might have failed or app object is not as expected.');
}

// Initialize services
export const auth = getAuth(app);
// Initialize Firestore with long-polling enabled and potentially unlimited cache
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  cacheSizeBytes: CACHE_SIZE_UNLIMITED 
});
console.log('[firebase.ts] Firestore DB Instance (with long-polling & cache settings):', db); 
export const storage = getStorage(app);


export default app;
