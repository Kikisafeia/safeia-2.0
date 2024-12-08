const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc } = require('firebase/firestore');

const firebaseConfig = {
  // Tu configuración de Firebase aquí
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllAntecedentes() {
  try {
    const antecedentesRef = collection(db, 'antecedentes');
    const snapshot = await getDocs(antecedentesRef);
    
    const deletePromises = [];
    snapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    console.log('Todos los antecedentes han sido eliminados');
  } catch (error) {
    console.error('Error al eliminar antecedentes:', error);
  }
}

deleteAllAntecedentes();
