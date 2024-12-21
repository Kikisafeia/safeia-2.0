import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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
      '10,000 tokens para usar en cualquier herramienta',
      'Acceso a todas las herramientas',
      'Marca de agua "Creado con SAFEIA"',
      'Hasta 2 usuarios'
    ]
  },
  {
    name: 'Plan PRO Mes',
    duration: '1 mes',
    price: '$9.99',
    period: 'mes',
    description: 'Acceso a todas las características de la web y chats. Ofrecemos 2 días de prueba, no se te cobrará nada hasta el cuarto día en caso que no canceles la suscripción.',
    buttonText: 'Comenzar prueba gratis',
    buttonLink: '#',
    features: [
      '55,000 tokens mensuales',
      'Acceso a todas las herramientas',
      'Sin marca de agua',
      'Soporte por email',
      '2 días de prueba gratis',
      'Cancela cuando quieras'
    ]
  },
  {
    name: 'Plan PRO 3 Meses',
    duration: '3 meses',
    price: '$24.99',
    period: 'mes',
    description: 'Acceso a todas las características de la web y chats. Ofrecemos 2 días de prueba, no se te cobrará nada hasta el cuarto día en caso que no canceles la suscripción.',
    buttonText: 'Comenzar prueba gratis',
    buttonLink: '#',
    isPopular: true,
    features: [
      '165,000 tokens (55,000 por mes)',
      'Acceso a todas las herramientas',
      'Sin marca de agua',
      'Soporte prioritario',
      '2 días de prueba gratis',
      'Cancela cuando quieras',
      'Ahorra 25% vs plan mensual'
    ]
  },
  {
    name: 'Plan EMPRESAS',
    duration: 'Personalizado',
    price: 'Contacta por interno',
    period: 'mes',
    description: 'Transforma la seguridad laboral con personalizadas. Aprovecha SAFEIA vision para una gestión de riesgos inteligente, accesible desde cualquier lugar. Automatización, eficiencia y soporte continuo para tu negocio.',
    buttonText: 'CONTÁCTANOS',
    buttonLink: '#',
    features: [
      'Tokens ilimitados',
      'Usuarios ilimitados',
      'Todas las características premium',
      'Sin marca de agua',
      'Soporte 24/7',
      'API personalizada',
      'Integración personalizada',
      'Personalización de herramientas',
      'Gestión de riesgos avanzada',
      'Acceso desde cualquier lugar'
    ]
  }
];

export default function Pricing() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleSubscription = (planType: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    // Aquí puedes agregar lógica temporal para manejar las suscripciones
    console.log(`Suscripción seleccionada: ${planType}`);
  };

  return (
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
                <button
                  onClick={() => handleSubscription(plan.name.toLowerCase().replace(' ', '-'))}
                  className="block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors bg-gray-900 hover:bg-gray-800 text-white"
                >
                  {plan.buttonText}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
