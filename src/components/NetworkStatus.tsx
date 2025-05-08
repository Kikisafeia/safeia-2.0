import { useEffect, useState } from 'react';
// import { db } from '../firebase'; // Remove direct import
import { useFirestore } from '../contexts/FirestoreContext'; // Import the hook
import { doc, onSnapshot, FirestoreError } from 'firebase/firestore'; // Remove Firestore type import

export default function NetworkStatus() {
  const { db } = useFirestore(); // Get db instance from context
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [firestoreConnected, setFirestoreConnected] = useState(false);

  // Enhanced Firestore initialization check with retry logic
  let retryCount = 0;
  const MAX_RETRIES = 3;

  const isFirestore = (db: unknown): db is import('firebase/firestore').Firestore => {
    return !!db && typeof db === 'object' && 
           typeof (db as any).collection === 'function' &&
           typeof (db as any).doc === 'function';
  };

  const monitorFirestoreConnection = () => {
    console.log('NetworkStatus: monitorFirestoreConnection called. Retry count:', retryCount);
    try {
      if (!isFirestore(db)) {
        console.error('NetworkStatus: Invalid Firestore instance -', {
          status: 'invalid',
          type: typeof db,
          isNull: db === null,
          isUndefined: db === undefined,
          dbInstance: db
        });
        
        if (db && typeof db === 'object') {
          const dbObj = db as { constructor?: { name?: string } };
          console.log('NetworkStatus: Firestore instance details:', {
            constructor: dbObj.constructor?.name,
            methods: ['collection', 'doc', 'runTransaction'].filter(
              method => typeof (db as any)[method] === 'function'
            )
          });
        }
        
        setFirestoreConnected(false);
        
        if (navigator.onLine && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`NetworkStatus: Retrying Firestore connection (attempt ${retryCount}/${MAX_RETRIES})`);
          setTimeout(monitorFirestoreConnection, 5000);
        } else if (retryCount >= MAX_RETRIES) {
          console.error('NetworkStatus: Max retries reached for Firestore connection');
        }
        return () => {};
      }
      
      // Verificar conexión con una operación simple
      console.log('NetworkStatus: Testing Firestore connection...');
      retryCount = 0; // Reset counter on successful validation
      console.log('NetworkStatus: monitorFirestoreConnection - db check passed. Attempting doc() with path app-status/heartbeat');
      
      const heartbeatDocRef = doc(db, 'app-status/heartbeat');
      if (!heartbeatDocRef) {
        throw new Error('Failed to create document reference');
      }
      console.log('NetworkStatus: Created valid heartbeatDocRef:', {
        path: heartbeatDocRef.path,
        id: heartbeatDocRef.id,
        parent: heartbeatDocRef.parent
      });

      const unsubscribe = onSnapshot(heartbeatDocRef, 
        (_docSnapshot) => {
          console.log('NetworkStatus: onSnapshot event received. Firestore connected.');
          setFirestoreConnected(true);
        }, 
        (err: FirestoreError) => {
          console.error('NetworkStatus: onSnapshot Firestore connection error. Message:', err.message, 'Code:', err.code, 'Error Object:', err);
          setFirestoreConnected(false);
          if (navigator.onLine) {
            console.log('NetworkStatus: Retrying Firestore connection in 5s due to onSnapshot error.');
            setTimeout(monitorFirestoreConnection, 5000);
          }
        }
      );
      console.log('NetworkStatus: onSnapshot listener attached.');
      return unsubscribe;
    } catch (e: any) {
      console.error('NetworkStatus: CRITICAL ERROR setting up Firestore listener. Message:', e.message, 'Stack:', e.stack, 'Error Object:', e);
      setFirestoreConnected(false);
      if (navigator.onLine) {
        console.log('NetworkStatus: Retrying Firestore connection setup in 5s due to critical error.');
        setTimeout(monitorFirestoreConnection, 5000);
      }
      return () => {};
    }
  };

  useEffect(() => {
    // Monitor browser online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Firestore initialization check
    if (!isFirestore(db)) {
      console.error('NetworkStatus: Firestore db is not properly initialized:', {
        isNull: db === null,
        isUndefined: db === undefined,
        type: typeof db,
        instance: db
      });
      if (navigator.onLine) {
        setTimeout(monitorFirestoreConnection, 5000);
      }
      return;
    }
    console.log('NetworkStatus: Firestore db is valid:', {
      type: typeof db,
      constructor: db?.constructor?.name,
      availableMethods: ['collection', 'doc', 'batch', 'runTransaction'].filter(
        method => typeof db[method as keyof typeof db] === 'function'
      )
    });


    let unsubscribeFirestoreListener: (() => void) | undefined;

    if (isOnline) {
      console.log('NetworkStatus: Browser is online. Initializing Firestore connection monitor.');
      unsubscribeFirestoreListener = monitorFirestoreConnection();
    } else {
      console.log('NetworkStatus: Browser is offline. Setting Firestore as disconnected.');
      setFirestoreConnected(false);
    }

    return () => {
      console.log('NetworkStatus: Cleaning up useEffect.');
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (unsubscribeFirestoreListener) {
        console.log('NetworkStatus: Unsubscribing from Firestore listener.');
        unsubscribeFirestoreListener();
      }
    };
  // Add `db` as a dependency to useEffect
  }, [isOnline, db]); 

  if (isOnline && firestoreConnected) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white shadow-lg rounded-lg p-4 flex items-center space-x-3">
        {!isOnline ? (
          <>
            <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-sm font-medium">Sin conexión a internet</span>
          </>
        ) : !firestoreConnected ? (
          <>
            <div className="h-3 w-3 rounded-full bg-yellow-500 animate-pulse"></div>
            <span className="text-sm font-medium">Problemas con el servidor</span>
          </>
        ) : null}
      </div>
    </div>
  );
}
