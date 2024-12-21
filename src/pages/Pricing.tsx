import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentPlans, PaymentPlan } from '../services/payment';
import PayPalPayment from '../components/PayPalPayment';
import { useAuth } from '../contexts/AuthContext';

export default function Pricing() {
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSuccess = async (details: any) => {
    try {
      // Aquí puedes implementar la lógica para actualizar el plan del usuario en tu backend
      console.log('Payment successful:', details);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error updating subscription:', error);
      setError('Error al actualizar la suscripción. Por favor, contacta a soporte.');
    }
  };

  const handleError = (error: any) => {
    console.error('Payment error:', error);
    setError('Error en el proceso de pago. Por favor, intenta nuevamente.');
  };

  return (
    <div className="bg-gray-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Planes y Precios
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Elige el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {paymentPlans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 bg-white
                ${selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div className="p-6">
                <h2 className="text-2xl font-semibold text-gray-900">{plan.name}</h2>
                <p className="mt-4 text-gray-500">{plan.description}</p>
                <p className="mt-8">
                  <span className="text-4xl font-extrabold text-gray-900">${plan.price}</span>
                  <span className="text-base font-medium text-gray-500">/mes</span>
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <svg
                        className="flex-shrink-0 w-6 h-6 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setSelectedPlan(plan)}
                  className={`mt-8 block w-full bg-blue-600 hover:bg-blue-700 
                    text-white font-semibold py-2 px-4 rounded-md text-center
                    ${selectedPlan?.id === plan.id ? 'bg-blue-700' : ''}`}
                >
                  Seleccionar Plan
                </button>
              </div>

              {selectedPlan?.id === plan.id && (
                <div className="p-6 bg-gray-50">
                  <PayPalPayment
                    plan={plan}
                    onSuccess={handleSuccess}
                    onError={handleError}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mt-8 text-center text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
