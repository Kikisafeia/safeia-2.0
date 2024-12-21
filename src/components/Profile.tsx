import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import TokenUsage from './TokenUsage';
import { useSubscription } from '../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, logout } = useAuth();
  const { userData, loading, error } = useSubscription();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-red-50 p-4 rounded-lg text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Encabezado del perfil */}
        <div className="mb-8">
          <img class="h-8 w-auto" src="/logo-footer.png" alt="SAFEIA"/>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Mi Perfil
          </h2>
          <p className="text-gray-600">
            {user?.email}
          </p>
        </div>

        {/* Información de la suscripción */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Plan Actual
            </h3>
            <button
              onClick={handleUpgrade}
              className="bg-safeia-yellow hover:bg-safeia-yellow/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cambiar Plan
            </button>
          </div>
          <div className="text-gray-600">
            <p className="capitalize mb-2">
              {userData?.subscription || 'Plan Gratuito'}
            </p>
            {userData?.subscriptionEndDate && (
              <p className="text-sm">
                Próxima renovación: {new Date(userData.subscriptionEndDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        {/* Componente de uso de tokens */}
        <div className="mb-6">
          <TokenUsage />
        </div>

        {/* Acciones de la cuenta */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones de la Cuenta
          </h3>
          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
