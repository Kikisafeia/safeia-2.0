import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface PricingPlan {
  name: string;
  duration: string;
  price: string;
  period: string;
  description: string;
  isPopular?: boolean;
  buttonText: string;
  buttonLink: string;
}

const pricingPlans: PricingPlan[] = [
  {
    name: 'Plan PRO Semanal',
    duration: '7 días',
    price: '$1,99',
    period: '7 días',
    description: 'Acceso a todas las características de la web y chats. Ofrecemos 2 días de prueba, no se te cobrará nada hasta el cuarto día en caso que no canceles la suscripción.',
    buttonText: 'Suscríbete',
    buttonLink: '#'
  },
  {
    name: 'Plan PRO Mes',
    duration: '1 mes',
    price: '$9,99',
    period: 'Mes',
    description: 'Acceso a todas las características de la web y chats. Ofrecemos 2 días de prueba, no se te cobrará nada hasta el cuarto día en caso que no canceles la suscripción.',
    buttonText: 'Suscríbete',
    buttonLink: '#'
  },
  {
    name: 'Plan Pro 3 Meses',
    duration: '3 Meses',
    price: '$24,99',
    period: 'Mes',
    description: 'Acceso a todas las características de la web y chats. Ofrecemos 2 días de prueba, no se te cobrará nada hasta el cuarto día en caso que no canceles la suscripción.',
    isPopular: true,
    buttonText: 'Suscríbete',
    buttonLink: '#'
  },
  {
    name: 'Plan EMPRESAS',
    duration: 'Personalizado',
    price: 'Contacta',
    period: 'por interno',
    description: 'Transforma la seguridad laboral con soluciones personalizadas. Aprovecha SAFEIA vision para una gestión de riesgos inteligente, accesible desde cualquier lugar. Automatización, eficiencia y soporte continuo para tu negocio.',
    buttonText: 'CONTÁCTANOS',
    buttonLink: '#contacto'
  }
];

export default function Pricing() {
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

              <p className="mb-8 text-gray-600">{plan.description}</p>

              <div className="mt-auto">
                <a
                  href={plan.buttonLink}
                  className={`block w-full rounded-lg px-4 py-3 text-center text-sm font-semibold transition-colors ${
                    plan.isPopular
                      ? 'bg-safeia-yellow hover:bg-safeia-yellow/90 text-black'
                      : 'bg-gray-900 hover:bg-gray-800 text-white'
                  }`}
                >
                  {plan.buttonText}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
