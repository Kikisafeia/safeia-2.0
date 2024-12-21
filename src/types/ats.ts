import { RiskMap } from './riskMap';

export interface Paso {
  id: string;
  descripcion: string;
  riesgos: Riesgo[];
  medidas_preventivas: string[];
  responsable: string;
  epp_requerido: string[];
}

export interface Riesgo {
  tipo: string;
  descripcion: string;
  nivel_riesgo: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  probabilidad: 'Baja' | 'Media' | 'Alta';
  consecuencia: 'Leve' | 'Moderada' | 'Grave' | 'Muy Grave';
}

export interface PasoAnalisis {
  id: string;
  descripcion: string;
  riesgos: RiesgoIdentificado[];
  controles: MedidaControl[];
}

export interface RiesgoIdentificado {
  id: string;
  tipo: string;
  descripcion: string;
  severidad: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  probabilidad: 'Bajo' | 'Medio' | 'Alto';
  coordenadas?: { x: number; y: number }; // Ubicación en el mapa de riesgos
  zona?: number[][]; // Polígono que define una zona de riesgo
}

export interface MedidaControl {
  id: string;
  tipo: string;
  descripcion: string;
  responsable: string;
  frecuencia: string;
}

export interface EquipoProteccion {
  id: string;
  nombre: string;
  especificaciones: string;
  obligatorio: boolean;
}

export interface AnalisisTrabajoSeguro {
  id: string;
  fecha: string;
  actividad: string;
  descripcion: string;
  imagenInicial?: string; // URL de la imagen del trabajo
  descripcionInicial: string; // Descripción inicial del trabajo
  area: string;
  responsable: string;
  pasos: PasoAnalisis[];
  riesgosIdentificados: RiesgoIdentificado[];
  medidasControl: MedidaControl[];
  epp: EquipoProteccion[];
  mapaRiesgos?: RiskMap; // Mapa de riesgos asociado al análisis
  informacion_general: {
    empresa: string;
    area: string;
    fecha: string;
    actividad: string;
    ubicacion: string;
    supervisor: string;
    duracion_estimada: string;
  };
  permisos_requeridos: string[];
  equipo_trabajo: Array<{
    nombre: string;
    cargo: string;
    capacitaciones: string[];
  }>;
  herramientas_equipos: Array<{
    nombre: string;
    estado: 'Bueno' | 'Regular' | 'Malo';
    observaciones?: string;
  }>;
  condiciones_ambientales: {
    temperatura: string;
    iluminacion: string;
    ruido: string;
    ventilacion: string;
    otros: string;
  };
  servicios_emergencia: {
    contactos: Array<{
      servicio: string;
      telefono: string;
    }>;
    punto_encuentro: string;
    ruta_evacuacion: string;
  };
  aprobaciones: Array<{
    rol: string;
    nombre: string;
    firma: boolean;
    fecha: string;
    comentarios?: string;
  }>;
  observaciones_adicionales: string;
}
