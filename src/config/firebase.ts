import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence,
  browserSessionPersistence,
  inMemoryPersistence,
  connectAuthEmulator
} from 'firebase/auth';

// Configuración de Firebase con soporte para dominio personalizado
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  // Usar el dominio personalizado como authDomain si está disponible
  authDomain: import.meta.env.VITE_AUTH_DOMAIN || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase App inicializado correctamente');
} catch (error) {
  console.error('Error al inicializar Firebase App:', error);
  throw error;
}

// Inicializar Auth
const auth = getAuth(app);
console.log('Firebase Auth inicializado correctamente');

// Configurar el emulador si está habilitado
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099');
    console.log('Emulador de Auth conectado correctamente');
  } catch (error) {
    console.error('Error al conectar el emulador de Auth:', error);
  }
}

// Inicializar Firestore con manejo de errores
let db;
try {
  db = getFirestore(app);
  console.log('Firestore inicializado correctamente');
} catch (error) {
  console.error('Error al inicializar Firestore:', error);
  throw error;
}

// Configurar persistencia con fallback
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
      console.log('Persistencia local configurada correctamente');
    } else {
      await setPersistence(auth, inMemoryPersistence);
      console.log('Persistencia en memoria configurada como fallback');
    }
  } catch (error) {
    console.error('Error al configurar la persistencia:', error);
    // Intentar fallback a persistencia en memoria
    try {
      await setPersistence(auth, inMemoryPersistence);
      console.log('Fallback a persistencia en memoria configurado correctamente');
    } catch (fallbackError) {
      console.error('Error en fallback de persistencia:', fallbackError);
    }
  }
};

// Configurar persistencia inmediatamente
configurePersistence().catch(error => {
  console.error('Error en la configuración de persistencia:', error);
});

export { app, auth, db };
