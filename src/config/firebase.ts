import { initializeApp } from 'firebase/app';
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  connectAuthEmulator
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.error('Error al inicializar Firebase App:', error);
  throw error;
}

export const auth = getAuth(app);

if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    console.error('Error al conectar el emulador de Auth:', error);
  }
}

export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  cacheSizeBytes: CACHE_SIZE_UNLIMITED 
});

export const storage = getStorage(app);

const configurePersistence = async () => {
  const testLocalStorage = () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch (e) {
      console.error('Error al probar localStorage:', e);
      return false;
    }
  };

  try {
    if (testLocalStorage()) {
      await setPersistence(auth, browserLocalPersistence);
    } else {
      await setPersistence(auth, inMemoryPersistence);
    }
  } catch (error) {
    console.error('Error al configurar la persistencia:', error);
    try {
      await setPersistence(auth, inMemoryPersistence);
    } catch (fallbackError) {
      console.error('Error en fallback de persistencia:', fallbackError);
    }
  }
};

configurePersistence().catch(error => {
  console.error('Error en la configuración de persistencia:', error);
});

export default app;
