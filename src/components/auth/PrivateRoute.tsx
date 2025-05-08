import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner'; // Moved import to top

// Corrected interface definition
interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { currentUser, initialLoading } = useAuth(); // Get initialLoading state

  if (initialLoading) {
    // Show a loading indicator while checking auth state
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner /> 
      </div>
    );
  }

  if (!currentUser) {
    // Redirect to login if not authenticated after initial check
    return <Navigate to="/login" replace />;
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default PrivateRoute;
