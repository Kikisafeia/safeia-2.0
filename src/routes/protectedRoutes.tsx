import React, { lazy, Suspense } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = lazy(() => import('../pages/Dashboard'));
const HerramientasSST = lazy(() => import('../pages/HerramientasSST'));
// Importar otros componentes con lazy loading...

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

export const ProtectedLayout: React.FC = () => {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
};

export const protectedRoutes = [
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <Dashboard />
      </PrivateRoute>
    )
  },
  {
    path: '/herramientas-sst',
    element: (
      <PrivateRoute>
        <HerramientasSST />
      </PrivateRoute>
    )
  }
  // Otras rutas protegidas...
];
