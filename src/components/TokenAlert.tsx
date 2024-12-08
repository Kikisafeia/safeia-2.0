import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TokenAlertProps {
  tokens: number;
  requiredTokens: number;
}

export default function TokenAlert({ tokens, requiredTokens }: TokenAlertProps) {
  const navigate = useNavigate();
  const isLow = tokens < requiredTokens;
  
  if (!isLow) return null;

  return (
    <div className="rounded-md bg-yellow-50 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Tokens Insuficientes
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Necesitas {requiredTokens} tokens para esta operación, pero solo tienes {tokens} disponibles.
            </p>
          </div>
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex">
              <button
                onClick={() => navigate('/planes')}
                className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              >
                Actualizar Plan →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
