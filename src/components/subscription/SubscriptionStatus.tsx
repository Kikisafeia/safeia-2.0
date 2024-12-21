import React from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

export default function SubscriptionStatus() {
  const { features, loading, error } = useSubscription();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="animate-pulse p-4 bg-gray-50 rounded-lg">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-3 mt-4">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">Error al cargar el estado de la suscripción</p>
      </div>
    );
  }

  if (!features.hasAccess) {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-medium text-yellow-900">Sin Suscripción Activa</h3>
        <p className="mt-2 text-yellow-700">
          No tienes una suscripción activa. Para acceder a todas las funcionalidades,
          por favor selecciona un plan.
        </p>
        <button
          onClick={() => navigate('/planes')}
          className="mt-3 px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
        >
          Ver Planes
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 rounded-lg">
      <h3 className="text-lg font-medium text-green-900">
        {features.isInTrial ? 'Período de Prueba' : 'Suscripción Activa'}
      </h3>
      <div className="mt-2 text-green-700">
        <p>Plan actual: {features.currentPlan}</p>
        {features.isInTrial && (
          <p className="mt-1">
            Días restantes de prueba: {features.daysLeftInTrial}
          </p>
        )}
      </div>
      <button
        onClick={() => navigate('/planes')}
        className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
      >
        Gestionar Suscripción
      </button>
    </div>
  );
}
