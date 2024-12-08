import React, { useState, useEffect } from 'react';
import { PLANES } from '../types/plans';
import { Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../config/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

export default function Planes() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPlanId, setCurrentPlanId] = useState<string>('gratuito');

  useEffect(() => {
    const loadCurrentPlan = async () => {
      if (!currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setCurrentPlanId(userDoc.data().plan || 'gratuito');
        }
      } catch (err) {
        console.error('Error al cargar plan actual:', err);
      }
    };

    loadCurrentPlan();
  }, [currentUser]);

  const handlePlanSelect = async (planId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (planId === currentPlanId) {
      return;
    }

    setLoading(planId);
    setError(null);

    try {
      const plan = PLANES.find(p => p.id === planId);
      if (!plan) throw new Error('Plan no encontrado');

      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        plan: planId,
        tokens: plan.tokens,
        lastTokenReset: new Date().toISOString()
      });

      setCurrentPlanId(planId);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error al seleccionar plan:', err);
      setError('Error al seleccionar el plan. Por favor intenta de nuevo.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Planes y Precios
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Elige el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-4">
          {PLANES.map((plan) => {
            const isCurrentPlan = plan.id === currentPlanId;
            return (
              <div
                key={plan.id}
                className={`border ${isCurrentPlan ? 'border-blue-500 ring-2 ring-blue-500' : 'border-gray-200'} rounded-lg shadow-sm divide-y divide-gray-200 bg-white`}
              >
                <div className="p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    {plan.nombre}
                    {isCurrentPlan && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Plan Actual
                      </span>
                    )}
                  </h3>
                  <p className="mt-4 text-sm text-gray-500">
                    {plan.tokens.toLocaleString()} tokens
                    {plan.duracion > 1 ? ' trimestrales' : ' mensuales'}
                  </p>
                  <p className="mt-8">
                    <span className="text-4xl font-extrabold text-gray-900">
                      ${plan.precio}
                    </span>
                    <span className="text-base font-medium text-gray-500">
                      {plan.duracion > 1 ? '/trimestre' : '/mes'}
                    </span>
                  </p>
                  <button
                    onClick={() => handlePlanSelect(plan.id)}
                    className={`mt-8 block w-full ${
                      isCurrentPlan
                        ? 'bg-gray-100 text-gray-500 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } font-medium py-2 px-4 rounded-md text-sm`}
                    disabled={loading === plan.id || isCurrentPlan}
                  >
                    {loading === plan.id
                      ? 'Cargando...'
                      : isCurrentPlan
                      ? 'Plan Actual'
                      : plan.precio === 0
                      ? 'Comenzar Gratis'
                      : 'Seleccionar Plan'}
                  </button>
                  {error && loading === plan.id && (
                    <p className="mt-2 text-sm text-red-500">{error}</p>
                  )}
                </div>
                <div className="px-6 pt-6 pb-8">
                  <h4 className="text-sm font-medium text-gray-900 tracking-wide uppercase">
                    Características
                  </h4>
                  <ul className="mt-6 space-y-4">
                    {plan.caracteristicas.map((caracteristica, index) => (
                      <li key={index} className="flex space-x-3">
                        <Check className="flex-shrink-0 h-5 w-5 text-green-500" />
                        <span className="text-sm text-gray-500">{caracteristica}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 max-w-3xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-gray-900">
            Preguntas Frecuentes
          </h3>
          <div className="mt-6 text-left space-y-6">
            <div>
              <h4 className="font-medium text-gray-900">¿Qué son los tokens?</h4>
              <p className="mt-2 text-gray-500">
                Los tokens son la unidad de medida que utilizamos para el uso de nuestras herramientas. 
                Cada vez que generas un documento o utilizas una herramienta, se consumen tokens de tu plan.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">¿Los tokens no utilizados se acumulan?</h4>
              <p className="mt-2 text-gray-500">
                Los tokens se renuevan cada mes (o trimestre en el plan avanzado) y no son acumulables. 
                Te recomendamos utilizar todos tus tokens antes de la renovación.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">¿Puedo cambiar de plan?</h4>
              <p className="mt-2 text-gray-500">
                Sí, puedes actualizar o cambiar tu plan en cualquier momento. 
                Los cambios se aplicarán en tu próximo ciclo de facturación.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">¿Qué pasa si me quedo sin tokens?</h4>
              <p className="mt-2 text-gray-500">
                Si te quedas sin tokens, puedes esperar a la renovación de tu plan o actualizar 
                a un plan superior para obtener más tokens inmediatamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
