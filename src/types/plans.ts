export interface Plan {
  id: string;
  nombre: string;
  tokens: number;
  precio: number;
  duracion: number; // en meses
  caracteristicas: string[];
}

export const PLANES: Plan[] = [
  {
    id: 'gratuito',
    nombre: 'Plan Gratuito',
    tokens: 10000,
    precio: 0,
    duracion: 1,
    caracteristicas: [
      'Acceso a herramientas básicas',
      '10,000 tokens mensuales',
      'Soporte por correo electrónico',
      'Documentos en formato PDF'
    ]
  },
  {
    id: 'basico',
    nombre: 'Plan Básico',
    tokens: 20000,
    precio: 1.99,
    duracion: 1,
    caracteristicas: [
      'Todas las herramientas básicas',
      '20,000 tokens mensuales',
      'Soporte prioritario',
      'Documentos en múltiples formatos',
      'Plantillas personalizables'
    ]
  },
  {
    id: 'estandar',
    nombre: 'Plan Estándar',
    tokens: 50000,
    precio: 9.99,
    duracion: 1,
    caracteristicas: [
      'Todas las herramientas avanzadas',
      '50,000 tokens mensuales',
      'Soporte prioritario 24/7',
      'Documentos personalizables',
      'Análisis detallados',
      'Exportación en todos los formatos'
    ]
  },
  {
    id: 'avanzado',
    nombre: 'Plan Avanzado',
    tokens: 100000,
    precio: 24.99,
    duracion: 3,
    caracteristicas: [
      'Acceso completo a todas las herramientas',
      '100,000 tokens trimestrales',
      'Soporte prioritario dedicado',
      'Personalización completa',
      'Análisis avanzados',
      'API de integración',
      'Dashboard personalizado'
    ]
  }
];
