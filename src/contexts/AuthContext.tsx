import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase'; // Corrected import path
import { CompanyProfile } from '../types/company';
import { getCompanyProfile } from '../services/company';

interface AuthContextType {
  currentUser: User | null;
  companyProfile: CompanyProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean; // General loading for login/signup actions
  initialLoading: boolean; // Specific loading for initial auth check
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [loading, setLoading] = useState(false); // Set general loading to false initially
  const [initialLoading, setInitialLoading] = useState(true); // Add initial loading state
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Intentar cargar el perfil de la empresa
          const profile = await getCompanyProfile(user.uid);
          setCompanyProfile(profile);
        } catch (error) {
          console.log('No se encontró perfil de empresa');
          setCompanyProfile(null);
        }
      } else {
        setCompanyProfile(null);
      }
      // setLoading(false); // Remove this, use initialLoading
      setInitialLoading(false); // Set initial loading to false after first check
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError('Error al crear la cuenta');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError('Error al iniciar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      await signOut(auth);
    } catch (error) {
      setError('Error al cerrar sesión');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    currentUser,
    companyProfile,
    login,
    signup,
    logout,
    loading, // Keep general loading
    initialLoading, // Add initial loading
    error
  };

  // Render children only after initial auth check is complete
  return (
    <AuthContext.Provider value={value}>
      {!initialLoading && children} 
    </AuthContext.Provider>
  );
}
