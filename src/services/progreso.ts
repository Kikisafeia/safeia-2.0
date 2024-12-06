export interface EtapaProgreso {
  id: string;
  nombre: string;
  completada: boolean;
  documentosCompletados: string[];
  fechaInicio?: string;
  fechaCompletado?: string;
  observaciones?: string;
}

export interface ProgresoSGSST {
  etapas: Record<string, EtapaProgreso>;
  progreso: number;
  ultimaActualizacion: string;
}

const STORAGE_KEY = 'sgsst_progreso';

export const etapasIniciales: Record<string, EtapaProgreso> = {
  'evaluacion-inicial': {
    id: 'evaluacion-inicial',
    nombre: 'Evaluación Inicial',
    completada: false,
    documentosCompletados: [],
  },
  'politica': {
    id: 'politica',
    nombre: 'Política de SST',
    completada: false,
    documentosCompletados: [],
  },
  'planificacion': {
    id: 'planificacion',
    nombre: 'Planificación',
    completada: false,
    documentosCompletados: [],
  },
  'implementacion': {
    id: 'implementacion',
    nombre: 'Implementación y Operación',
    completada: false,
    documentosCompletados: [],
  },
  'verificacion': {
    id: 'verificacion',
    nombre: 'Verificación',
    completada: false,
    documentosCompletados: [],
  },
  'mejora': {
    id: 'mejora',
    nombre: 'Mejora Continua',
    completada: false,
    documentosCompletados: [],
  },
};

export function inicializarProgreso(): ProgresoSGSST {
  return {
    etapas: etapasIniciales,
    progreso: 0,
    ultimaActualizacion: new Date().toISOString(),
  };
}

export function cargarProgreso(): ProgresoSGSST {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    const inicial = inicializarProgreso();
    guardarProgreso(inicial);
    return inicial;
  }
  return JSON.parse(stored);
}

export function guardarProgreso(progreso: ProgresoSGSST): void {
  progreso.ultimaActualizacion = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progreso));
}

export function actualizarEtapa(
  progresoActual: ProgresoSGSST,
  etapaId: string,
  actualizacion: Partial<EtapaProgreso>
): ProgresoSGSST {
  const nuevaEtapa = {
    ...progresoActual.etapas[etapaId],
    ...actualizacion,
  };

  const nuevoProgreso = {
    ...progresoActual,
    etapas: {
      ...progresoActual.etapas,
      [etapaId]: nuevaEtapa,
    },
  };

  // Calcular progreso total
  const totalEtapas = Object.keys(nuevoProgreso.etapas).length;
  const etapasCompletadas = Object.values(nuevoProgreso.etapas).filter(
    (etapa) => etapa.completada
  ).length;
  nuevoProgreso.progreso = (etapasCompletadas / totalEtapas) * 100;

  guardarProgreso(nuevoProgreso);
  return nuevoProgreso;
}

export function marcarDocumentoCompletado(
  progresoActual: ProgresoSGSST,
  etapaId: string,
  documentoId: string
): ProgresoSGSST {
  const etapa = progresoActual.etapas[etapaId];
  if (!etapa.documentosCompletados.includes(documentoId)) {
    return actualizarEtapa(progresoActual, etapaId, {
      documentosCompletados: [...etapa.documentosCompletados, documentoId],
    });
  }
  return progresoActual;
}

export function verificarEtapaPrevia(
  progresoActual: ProgresoSGSST,
  etapaId: string
): boolean {
  const etapas = Object.keys(etapasIniciales);
  const indiceEtapaActual = etapas.indexOf(etapaId);
  
  if (indiceEtapaActual <= 0) return true;
  
  const etapaPrevia = etapas[indiceEtapaActual - 1];
  return progresoActual.etapas[etapaPrevia].completada;
}

export function obtenerSiguienteEtapa(
  progresoActual: ProgresoSGSST,
  etapaActual: string
): string | null {
  const etapas = Object.keys(etapasIniciales);
  const indiceActual = etapas.indexOf(etapaActual);
  
  if (indiceActual < etapas.length - 1) {
    return etapas[indiceActual + 1];
  }
  
  return null;
}
