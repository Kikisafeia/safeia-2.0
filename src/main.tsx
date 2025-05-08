import React from 'react';
import ReactDOM from 'react-dom/client';
import './firebase'; // Ensure Firebase initializes before rendering App
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider
import { FirestoreProvider } from './contexts/FirestoreContext'; // Import FirestoreProvider

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <FirestoreProvider> {/* Wrap with FirestoreProvider */}
        <App />
      </FirestoreProvider>
    </AuthProvider>
  </React.StrictMode>,
)
