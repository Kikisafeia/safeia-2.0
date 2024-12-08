import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { PLANES } from '../types/plans';

interface TokenDisplayProps {
  tokens: number;
  planId: string;
}

export default function TokenDisplay({ tokens, planId }: TokenDisplayProps) {
  const navigate = useNavigate();
  const plan = PLANES.find(p => p.id === planId);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Coins className="h-8 w-8 text-yellow-500" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Tokens Disponibles</h3>
            <p className="text-sm text-gray-500">Plan {plan?.nombre || 'Gratuito'}</p>
          </div>
        </div>
        <span className="text-2xl font-bold text-gray-900">
          {tokens.toLocaleString()}
        </span>
      </div>
      <div className="mt-4">
        <button
          onClick={() => navigate('/planes')}
          className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Actualizar Plan →
        </button>
      </div>
    </div>
  );
}
