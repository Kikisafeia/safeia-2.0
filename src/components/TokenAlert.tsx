import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TokenAlert() {
  const navigate = useNavigate();

  return (
    <div className="rounded-md bg-yellow-50 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-yellow-800">
            Tokens Bajos
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Tus tokens están bajos. Para continuar usando todas las funcionalidades,
              considera actualizar tu plan.
            </p>
          </div>
          <div className="mt-4">
            <div className="-mx-2 -my-1.5 flex">
              <button
                onClick={() => navigate('/pricing')}
                className="bg-yellow-50 px-2 py-1.5 rounded-md text-sm font-medium text-yellow-800 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
              >
                Ver Planes →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
