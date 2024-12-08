import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  indexedDBLocalPersistence
} from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  enableMultiTabIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED
} from 'firebase/firestore';

// Validate required environment variables
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (only if not already initialized)
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Firebase Authentication
const auth = getAuth(app);

// Set persistence with fallback
const initAuth = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('Firebase Auth: Using local persistence');
  } catch (error) {
    console.warn('Local persistence failed, falling back to session persistence:', error);
    try {
      await setPersistence(auth, browserSessionPersistence);
      console.log('Firebase Auth: Using session persistence');
    } catch (error) {
      console.error('Failed to set any persistence mode:', error);
    }
  }
};

// Initialize persistence
initAuth().catch(console.error);

// Initialize Firestore with offline persistence
const db = initializeFirestore(app, {
  cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  experimentalAutoDetectLongPolling: true,
  cache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Enable offline persistence
enableMultiTabIndexedDbPersistence(db)
  .then(() => {
    console.log('Firestore offline persistence enabled');
  })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support offline persistence');
    } else {
      console.error('Error enabling offline persistence:', err);
    }
  });

// Initialize Google Auth Provider with custom parameters
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  // Agregar estos parámetros para manejar el error COOP
  access_type: 'offline',
  display: 'popup'
});

// Log initialization success
console.info('Firebase initialized successfully');

export { app, auth, db, googleProvider };
