import { saveAs } from 'file-saver';

export interface Documento {
  id: string;
  nombre: string;
  descripcion: string;
  plantilla: string;
  categoria: string;
  formato: 'docx' | 'xlsx' | 'pdf';
  requerido: boolean;
}

export const documentosSGSST: Record<string, Documento[]> = {
  'evaluacion-inicial': [
    {
      id: 'eval-inicial',
      nombre: 'Formato de evaluación inicial',
      descripcion: 'Documento para evaluar el cumplimiento de los estándares mínimos del SG-SST',
      plantilla: '/templates/sgsst/evaluacion_inicial.docx',
      categoria: 'Evaluación',
      formato: 'docx',
      requerido: true
    },
    {
      id: 'checklist',
      nombre: 'Lista de verificación',
      descripcion: 'Checklist de requisitos básicos del sistema de gestión',
      plantilla: '/templates/sgsst/checklist_requisitos.xlsx',
      categoria: 'Evaluación',
      formato: 'xlsx',
      requerido: true
    }
  ],
  'politica': [
    {
      id: 'politica-sst',
      nombre: 'Modelo de política SST',
      descripcion: 'Plantilla para elaborar la política de seguridad y salud en el trabajo',
      plantilla: '/templates/sgsst/politica_sst.docx',
      categoria: 'Política',
      formato: 'docx',
      requerido: true
    }
  ],
  'planificacion': [
    {
      id: 'matriz-iperc',
      nombre: 'Matriz IPERC',
      descripcion: 'Formato para identificación de peligros y evaluación de riesgos',
      plantilla: '/templates/sgsst/matriz_iperc.xlsx',
      categoria: 'Planificación',
      formato: 'xlsx',
      requerido: true
    },
    {
      id: 'plan-anual',
      nombre: 'Plan anual de trabajo',
      descripcion: 'Plantilla para programar las actividades del año',
      plantilla: '/templates/sgsst/plan_anual.xlsx',
      categoria: 'Planificación',
      formato: 'xlsx',
      requerido: true
    }
  ],
  'implementacion': [
    {
      id: 'manual-sgsst',
      nombre: 'Manual del SG-SST',
      descripcion: 'Documento base del sistema de gestión',
      plantilla: '/templates/sgsst/manual_sgsst.docx',
      categoria: 'Implementación',
      formato: 'docx',
      requerido: true
    },
    {
      id: 'procedimientos',
      nombre: 'Procedimientos básicos',
      descripcion: 'Conjunto de procedimientos esenciales',
      plantilla: '/templates/sgsst/procedimientos_basicos.docx',
      categoria: 'Implementación',
      formato: 'docx',
      requerido: true
    }
  ],
  'verificacion': [
    {
      id: 'indicadores',
      nombre: 'Indicadores de gestión',
      descripcion: 'Formato para seguimiento de indicadores',
      plantilla: '/templates/sgsst/indicadores_gestion.xlsx',
      categoria: 'Verificación',
      formato: 'xlsx',
      requerido: true
    },
    {
      id: 'auditoria',
      nombre: 'Formato de auditoría interna',
      descripcion: 'Guía para realizar auditorías internas',
      plantilla: '/templates/sgsst/auditoria_interna.docx',
      categoria: 'Verificación',
      formato: 'docx',
      requerido: true
    }
  ],
  'mejora': [
    {
      id: 'plan-accion',
      nombre: 'Plan de acción',
      descripcion: 'Formato para documentar acciones de mejora',
      plantilla: '/templates/sgsst/plan_accion.xlsx',
      categoria: 'Mejora',
      formato: 'xlsx',
      requerido: true
    },
    {
      id: 'revision-direccion',
      nombre: 'Revisión por la dirección',
      descripcion: 'Guía para la revisión gerencial',
      plantilla: '/templates/sgsst/revision_direccion.docx',
      categoria: 'Mejora',
      formato: 'docx',
      requerido: true
    }
  ]
};

export function getDocumentosPorEtapa(etapaId: string): Documento[] {
  const documentos = documentosSGSST[etapaId];
  if (!documentos) {
    console.warn(`No se encontraron documentos para la etapa: ${etapaId}`);
    return [];
  }
  return documentos;
}

export async function descargarDocumento(documento: Documento): Promise<void> {
  try {
    const response = await fetch(documento.plantilla);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const blob = await response.blob();
    const fileName = documento.plantilla.split('/').pop() || 'documento';
    saveAs(blob, fileName);
  } catch (error) {
    console.error('Error al descargar el documento:', error);
    throw new Error('No se pudo descargar el documento. Por favor, intente nuevamente.');
  }
}

export function getDocumentosRequeridos(etapaId: string): Documento[] {
  return getDocumentosPorEtapa(etapaId).filter(doc => doc.requerido);
}

export function validarDocumentoCompletado(documento: Documento): boolean {
  try {
    return localStorage.getItem(`documento_${documento.id}`) === 'completado';
  } catch (error) {
    console.error('Error al validar documento:', error);
    return false;
  }
}

export function marcarDocumentoCompletado(documento: Documento): void {
  try {
    localStorage.setItem(`documento_${documento.id}`, 'completado');
  } catch (error) {
    console.error('Error al marcar documento como completado:', error);
    throw new Error('No se pudo guardar el estado del documento');
  }
}
