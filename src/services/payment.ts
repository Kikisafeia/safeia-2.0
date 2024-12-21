import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export interface PaymentPlan {
  id: string;
  name: string;
  price: number | null;
  description: string;
  features: string[];
  period: 'monthly' | 'quarterly' | 'yearly';
}

export const paymentPlans: PaymentPlan[] = [
  {
    id: 'free',
    name: 'Plan FREE',
    price: 0,
    description: 'Ideal para usuarios que quieren probar el sistema sin compromisos.',
    features: [
      '10,000 tokens para usar en cualquier herramienta',
      'Acceso a todas las herramientas',
      'Marca de agua "Creado con SAFEIA"',
      'Hasta 2 usuarios'
    ],
    period: 'monthly'
  },
  {
    id: 'pro-monthly',
    name: 'Plan PRO Mes',
    price: 9.99,
    description: 'Acceso a todas las características de la web y chats. Ofrecemos 2 días de prueba, no se te cobrará nada hasta el cuarto día en caso que no canceles la suscripción.',
    features: [
      '55,000 tokens mensuales',
      'Acceso a todas las herramientas',
      'Sin marca de agua',
      'Soporte por email',
      '2 días de prueba gratis',
      'Cancela cuando quieras'
    ],
    period: 'monthly'
  },
  {
    id: 'pro-quarterly',
    name: 'Plan PRO 3 Meses',
    price: 24.99,
    description: 'Acceso a todas las características de la web y chats. Ofrecemos 2 días de prueba, no se te cobrará nada hasta el cuarto día en caso que no canceles la suscripción.',
    features: [
      '165,000 tokens (55,000 por mes)',
      'Acceso a todas las herramientas',
      'Sin marca de agua',
      'Soporte prioritario',
      '2 días de prueba gratis',
      'Cancela cuando quieras',
      'Ahorra 25% vs plan mensual'
    ],
    period: 'quarterly'
  },
  {
    id: 'enterprise',
    name: 'Plan EMPRESAS',
    price: null,
    description: 'Transforma la seguridad laboral con personalizadas. Aprovecha SAFEIA vision para una gestión de riesgos inteligente, accesible desde cualquier lugar. Automatización, eficiencia y soporte continuo para tu negocio.',
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
    ],
    period: 'monthly'
  }
];
