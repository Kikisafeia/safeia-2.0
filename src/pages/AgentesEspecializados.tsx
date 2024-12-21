import React from 'react';
import SafetyAgentChat from '../components/SafetyAgentChat';
import { useTokens } from '../hooks/useTokens';
import TokenAlert from '../components/TokenAlert';
import { useAuth } from '../contexts/AuthContext';

export default function AgentesEspecializados() {
  const { tokens, loading } = useTokens();
  const { currentUser } = useAuth();

  if (!currentUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acceso Denegado</h1>
          <p>Debes iniciar sesión para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Asistente de Seguridad y Salud en el Trabajo</h1>
      
      {/* Mostrar balance de tokens */}
      {!loading && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-lg">
            Balance de tokens: <span className="font-bold">{tokens}</span>
          </p>
        </div>
      )}

      {/* Mostrar alerta si no hay suficientes tokens */}
      {tokens !== null && tokens < 100 && (
        <TokenAlert />
      )}

      {/* Chat component */}
      <SafetyAgentChat />
    </div>
  );
}
