export interface Plan {
  id: string;
  nombre: string;
  precio: number;
  duracion: {
    valor: number;
    unidad: 'semana' | 'mes' | 'meses';
  };
  periodoGratis: number; // días de prueba
  caracteristicas: string[];
  descripcion: string;
}

export const PLANES: Plan[] = [
  {
    id: 'pro-3-meses',
    nombre: 'Plan PRO 3 Meses',
    precio: 24.99,
    duracion: {
      valor: 3,
      unidad: 'meses'
    },
    periodoGratis: 2,
    descripcion: 'Acceso a todas las características de la web y chats. Ofrecemos 2 días de prueba, no se te cobrará nada hasta el cuarto día en caso que no canceles la suscripción.',
    caracteristicas: [
      'Acceso completo a todas las herramientas',
      'Chats ilimitados con IA',
      'Soporte prioritario 24/7',
      'Documentos personalizables',
      'Sin límite de tokens',
      'Exportación en todos los formatos'
    ]
  },
  {
    id: 'pro-1-mes',
    nombre: 'Plan PRO 1 Mes',
    precio: 9.99,
    duracion: {
      valor: 1,
      unidad: 'mes'
    },
    periodoGratis: 2,
    descripcion: 'Acceso a todas las características de la web y chats. Ofrecemos 2 días de prueba, no se te cobrará nada hasta el cuarto día en caso que no canceles la suscripción.',
    caracteristicas: [
      'Acceso completo a todas las herramientas',
      'Chats ilimitados con IA',
      'Soporte prioritario 24/7',
      'Documentos personalizables',
      'Sin límite de tokens',
      'Exportación en todos los formatos'
    ]
  },
  {
    id: 'pro-1-semana',
    nombre: 'Plan PRO 1 Semana',
    precio: 1.99,
    duracion: {
      valor: 1,
      unidad: 'semana'
    },
    periodoGratis: 2,
    descripcion: 'Acceso a todas las características de la web y chats. Ofrecemos 2 días de prueba, no se te cobrará nada hasta el cuarto día en caso que no canceles la suscripción.',
    caracteristicas: [
      'Acceso completo a todas las herramientas',
      'Chats ilimitados con IA',
      'Soporte prioritario 24/7',
      'Documentos personalizables',
      'Sin límite de tokens',
      'Exportación en todos los formatos'
    ]
  }
];
