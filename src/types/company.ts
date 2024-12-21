export interface CompanyProfile {
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  email: string;
  numEmpleados: number;
  sectorEconomico: string;
  nivelRiesgo: string;
  actividadPrincipal: string;
  representanteLegal: string;
  responsableSGSST: string;
  fechaCreacion?: string;
  ultimaActualizacion?: string;
}

export interface CompanyStats {
  documentosCompletados: number;
  etapasCompletadas: number;
  porcentajeProgreso: number;
  ultimaActividad?: string;
  proximasAcciones: string[];
}

export type NivelRiesgo = 'I' | 'II' | 'III' | 'IV' | 'V';

export interface RequisitosSGSST {
  nivelRiesgo: NivelRiesgo;
  requisitosMinimos: string[];
  documentosObligatorios: string[];
  capacitacionesRequeridas: string[];
  frecuenciaActualizacion: string;
}
