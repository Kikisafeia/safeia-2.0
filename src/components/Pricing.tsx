import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useAuth } from '../contexts/AuthContext';
import { handlePayPalSubscription } from '../services/paypal';
import { useNavigate } from 'react-router-dom';

interface PricingPlan {
  name: string;
  duration: string;
  price: string;
  period: string;
  description: string;
  isPopular?: boolean;
  buttonText: string;
  buttonLink: string;
  features: string[];
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Plan FREE',
    duration: 'Gratis',
    price: '$0',
    period: 'mes',
    description: 'Ideal para usuarios que quieren probar el sistema sin compromisos.',
    buttonText: 'Empieza Gratis',
    buttonLink: '#',
    features: [
      'Hasta 5 generaciones de IA al mes',
      'Marca de agua "Creado con SAFEIA"',
      'Acceso a funcionalidades básicas'
    ]
  },
  {
    name: 'Plan PRO Semanal',
    duration: '7 días',
    price: '$1,99',
    period: '7 días',
    description: 'Acceso completo con período de prueba incluido.',
    buttonText: 'Suscríbete',
    buttonLink: '#',
    features: [
      'Acceso a todas las características de la web y chats',
      '2 días de prueba sin costo',
      'Hasta 10 generaciones de IA con tokens',
      'Asistencia estándar'
    ]
  },
  {
    name: 'Plan PRO Mensual',
    duration: '1 mes',
    price: '$9,99',
    period: 'mes',
    description: 'Plan completo con acceso anticipado a nuevas funciones.',
    isPopular: true,
    buttonText: 'Suscríbete',
    buttonLink: '#',
    features: [
      'Acceso a todas las características de la web y chats',
      '10,000 tokens de IA por generación',
      'Sin marca de agua',
      'Acceso anticipado a nuevas funciones',
      'Soporte prioritario'
    ]
  },
  {
    name: 'Plan PRO 3 Meses',
    duration: '3 meses',
    price: '$24,99',
    period: '3 meses',
    description: 'Mayor ahorro con beneficios adicionales.',
    buttonText: 'Suscríbete',
    buttonLink: '#',
    features: [
      'Todo lo incluido en PRO Mensual',
      'Bonificación de 1,000 tokens adicionales cada mes',
      'Mejor precio por mes'
    ]
  },
  {
    name: 'Plan PRO Plus',
    duration: 'Mensual',
    price: '$15,99',
    period: 'mes',
    description: 'Características avanzadas para profesionales.',
    buttonText: 'Suscríbete',
    buttonLink: '#',
    features: [
      'Creación de IA ilimitada',
      'Generación avanzada de imágenes',
      'Dominios y URL personalizados',
      'Fuentes personalizadas para proyectos',
      'Protección con contraseña',
      '25,000 tokens de IA por generación',
      'Acceso a análisis detallados'
    ]
  },
  {
    name: 'Plan EMPRESAS',
    duration: 'Personalizado',
    price: 'Contacta',
    period: 'personalizado',
    description: 'Soluciones empresariales a medida.',
    buttonText: 'CONTÁCTANOS',
    buttonLink: '#contacto',
    features: [
      'Soluciones a medida para empresas',
      'Generación avanzada de contenido IA sin límites',
      'Integraciones API personalizadas',
      'Capacitación y soporte dedicado'
    ]
  }
];

export default function Pricing() {
  const { currentUser, userSubscription } = useAuth();
  const navigate = useNavigate();

  const handleSubscription = async (planType: string, price: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    // PayPal plan IDs - you'll need to create these in your PayPal business account
    const planIds: { [key: string]: string } = {
      'pro-weekly': import.meta.env.VITE_PAYPAL_WEEKLY_PLAN_ID,
      'pro-monthly': import.meta.env.VITE_PAYPAL_MONTHLY_PLAN_ID,
      'pro-3months': import.meta.env.VITE_PAYPAL_3MONTHS_PLAN_ID,
      'pro-plus': import.meta.env.VITE_PAYPAL_PLUS_PLAN_ID,
    };

    return planIds[planType];
  };

  return (
    <PayPalScriptProvider options={{ 
      'client-id': import.meta.env.VITE_PAYPAL_CLIENT_ID,
      vault: true,
      intent: 'subscription' 
    }}>
      <section id="precios" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl lg:text-5xl">
              Planes y Precios
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Elige el plan que mejor se adapte a tus necesidades
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative flex flex-col rounded-2xl border ${
                  plan.isPopular
                    ? 'border-safeia-yellow shadow-xl'
                    : 'border-gray-200'
                } bg-white p-8`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-safeia-yellow text-black">
                      Popular
                    </span>
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">{plan.duration}</p>
                </div>

                <div className="mb-8">
                  <p className="flex items-baseline">
                    <span className="text-4xl font-bold tracking-tight text-gray-900">
                      {plan.price}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">/{plan.period}</span>
                  </p>
                </div>

                <p className="mb-6 text-gray-600">{plan.description}</p>

                <div className="mb-8 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 flex-shrink-0 text-safeia-yellow" />
                      <span className="ml-3 text-gray-600">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-auto">
                  {plan.price === '$0' ? (
                    <a
                      href={plan.buttonLink}
                      className="block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      {plan.buttonText}
                    </a>
                  ) : plan.price === 'Contacta' ? (
                    <a
                      href={plan.buttonLink}
                      className="block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors bg-gray-900 hover:bg-gray-800 text-white"
                    >
                      {plan.buttonText}
                    </a>
                  ) : (
                    <div className="w-full">
                      <PayPalButtons
                        createSubscription={(data, actions) => {
                          const planId = handleSubscription(
                            plan.name.toLowerCase().replace(' ', '-'),
                            plan.price
                          );
                          return actions.subscription.create({
                            plan_id: planId,
                          });
                        }}
                        onApprove={async (data) => {
                          if (currentUser) {
                            await handlePayPalSubscription({
                              subscriptionID: data.subscriptionID,
                              planType: plan.name.toLowerCase().replace(' ', '-') as any,
                              userID: currentUser.uid,
                            });
                          }
                        }}
                        style={{ layout: 'horizontal' }}
                      />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PayPalScriptProvider>
  );
}
