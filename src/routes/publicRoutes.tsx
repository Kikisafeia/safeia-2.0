import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import AuthComponent from '../components/auth/AuthComponent';

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (currentUser) {
    console.log('Usuario autenticado intentando acceder a ruta pública, redirigiendo...');
    return <Navigate to="/herramientas-sst" replace />;
  }
  
  return <>{children}</>;
};

export const publicRoutes = [
  {
    path: '/',
    element: (
      <PublicRoute>
        <Layout>
          <Hero />
        </Layout>
      </PublicRoute>
    )
  },
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Layout>
          <AuthComponent type="login" />
        </Layout>
      </PublicRoute>
    )
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <Layout>
          <AuthComponent type="register" />
        </Layout>
      </PublicRoute>
    )
  },
  {
    path: '/pricing',
    element: (
      <Layout>
        <AuthComponent type="pricing" />
      </Layout>
    )
  }
];
