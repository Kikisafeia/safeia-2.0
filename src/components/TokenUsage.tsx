import React from 'react';
import { useSubscription } from '../hooks/useSubscription';

export default function TokenUsage() {
  const { userData, loading, error, getRemainingTokens, getFeatures } = useSubscription();

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  const remainingTokens = getRemainingTokens();
  const features = getFeatures();
  const usagePercentage = ((userData.tokenCount / userData.tokenLimit) * 100).toFixed(1);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Uso de Tokens
      </h3>
      
      <div className="space-y-4">
        {/* Barra de progreso */}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-safeia-yellow bg-safeia-yellow/10">
                {userData.subscription}
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold inline-block text-safeia-yellow">
                {usagePercentage}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-safeia-yellow/10">
            <div
              style={{ width: `${usagePercentage}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-safeia-yellow"
            ></div>
          </div>
        </div>

        {/* Información de tokens */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Tokens Disponibles</p>
            <p className="font-semibold text-gray-900">{remainingTokens}</p>
          </div>
          <div>
            <p className="text-gray-500">Límite Total</p>
            <p className="font-semibold text-gray-900">{userData.tokenLimit}</p>
          </div>
        </div>

        {/* Características del plan */}
        {features && (
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Características del Plan
            </h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-gray-700">
                <span className={features.hasWatermark ? 'text-red-500' : 'text-green-500'}>
                  {features.hasWatermark ? '•' : '✓'}
                </span>
                <span className="ml-2">
                  {features.hasWatermark ? 'Con marca de agua' : 'Sin marca de agua'}
                </span>
              </li>
              <li className="flex items-center text-gray-700">
                <span className={features.hasAdvancedFeatures ? 'text-green-500' : 'text-red-500'}>
                  {features.hasAdvancedFeatures ? '✓' : '•'}
                </span>
                <span className="ml-2">Características avanzadas</span>
              </li>
              <li className="flex items-center text-gray-700">
                <span className={features.hasCustomDomain ? 'text-green-500' : 'text-red-500'}>
                  {features.hasCustomDomain ? '✓' : '•'}
                </span>
                <span className="ml-2">Dominio personalizado</span>
              </li>
              <li className="flex items-center text-gray-700">
                <span className={features.hasAnalytics ? 'text-green-500' : 'text-red-500'}>
                  {features.hasAnalytics ? '✓' : '•'}
                </span>
                <span className="ml-2">Análisis detallado</span>
              </li>
              <li className="flex items-center text-gray-700">
                <span className={features.hasPrioritySupport ? 'text-green-500' : 'text-red-500'}>
                  {features.hasPrioritySupport ? '✓' : '•'}
                </span>
                <span className="ml-2">Soporte prioritario</span>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
