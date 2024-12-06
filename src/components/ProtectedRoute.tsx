import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// TODO: Implementar lógica real de autenticación
const isAuthenticated = () => {
  // Temporalmente retornamos true para permitir el acceso
  // mientras se implementa el sistema de autenticación
  return true;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    // Redirige al login si no está autenticado
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
