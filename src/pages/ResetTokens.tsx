import React, { useState } from 'react';
import { resetUserTokens } from '../utils/resetTokens';
import { useAuth } from '../contexts/AuthContext';

export default function ResetTokens() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { currentUser } = useAuth();

  const handleReset = async () => {
    if (!currentUser) {
      setMessage('Usuario no autenticado');
      return;
    }

    setLoading(true);
    try {
      await resetUserTokens(currentUser.uid);
      setMessage('Tokens restablecidos exitosamente a 10,000');
    } catch (error) {
      console.error('Error:', error);
      setMessage('Error al restablecer tokens');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-4">Restablecer Tokens</h1>
          
          {message && (
            <div className={`p-4 mb-4 rounded-md ${
              message.includes('error') 
                ? 'bg-red-50 text-red-700' 
                : 'bg-green-50 text-green-700'
            }`}>
              {message}
            </div>
          )}

          <button
            onClick={handleReset}
            disabled={loading}
            className={`
              w-full px-4 py-2 rounded-md text-white
              ${loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-safeia-yellow hover:bg-safeia-yellow/90'}
            `}
          >
            {loading ? 'Restableciendo...' : 'Restablecer Tokens'}
          </button>
        </div>
      </div>
    </div>
  );
}
