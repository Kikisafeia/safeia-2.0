export interface ISOStandard {
  id: string;
  name: string;
  description: string;
  category: string;
}

export const ISO_STANDARDS: ISOStandard[] = [
  {
    id: "ISO_9001",
    name: "ISO 9001:2015",
    description: "Sistema de Gestión de Calidad",
    category: "Calidad"
  },
  {
    id: "ISO_14001",
    name: "ISO 14001:2015",
    description: "Sistema de Gestión Ambiental",
    category: "Medio Ambiente"
  },
  {
    id: "ISO_45001",
    name: "ISO 45001:2018",
    description: "Sistema de Gestión de Seguridad y Salud en el Trabajo",
    category: "Seguridad y Salud"
  },
  {
    id: "ISO_27001",
    name: "ISO 27001:2013",
    description: "Sistema de Gestión de Seguridad de la Información",
    category: "Seguridad de la Información"
  },
  {
    id: "ISO_22000",
    name: "ISO 22000:2018",
    description: "Sistema de Gestión de Seguridad Alimentaria",
    category: "Seguridad Alimentaria"
  },
  {
    id: "ISO_50001",
    name: "ISO 50001:2018",
    description: "Sistema de Gestión de la Energía",
    category: "Energía"
  },
  {
    id: "ISO_13485",
    name: "ISO 13485:2016",
    description: "Sistema de Gestión de Calidad para Dispositivos Médicos",
    category: "Dispositivos Médicos"
  },
  {
    id: "ISO_20000",
    name: "ISO 20000-1:2018",
    description: "Sistema de Gestión de Servicios de TI",
    category: "Tecnología"
  },
  {
    id: "ISO_37001",
    name: "ISO 37001:2016",
    description: "Sistema de Gestión Antisoborno",
    category: "Cumplimiento"
  },
  {
    id: "ISO_31000",
    name: "ISO 31000:2018",
    description: "Gestión de Riesgos",
    category: "Riesgos"
  }
];

export interface HallazgoAuditoria {
  informe_hallazgo: {
    informacion_general: {
      empresa: string;
      area_auditada: string;
      fecha_auditoria: string;
      tipo_auditoria: string;
      auditor: string;
      norma_referencia: string;
    };
    hallazgos: Array<{
      id: string;
      tipo: string;
      proceso_afectado: string;
      descripcion: string;
      evidencia_objetiva: string;
      clausula_norma: string;
      requisito_incumplido: string;
      analisis_causa_raiz: {
        metodo: string;
        causas_identificadas: string[];
      };
      acciones_propuestas: Array<{
        tipo: string;
        descripcion: string;
        responsable: string;
        fecha_implementacion: string;
        recursos_necesarios: string;
        seguimiento: {
          metodo_verificacion: string;
          frecuencia_seguimiento: string;
        };
      }>;
      impacto: {
        seguridad_salud: string;
        operacional: string;
        economico: string;
      };
      estado: string;
      comunicacion_interna: {
        canales: string[];
        responsables_comunicacion: string[];
        frecuencia_actualizacion: string;
      };
      mejora_continua: {
        indicadores_seguimiento: string[];
        lecciones_aprendidas: string[];
        oportunidades_mejora: string[];
      };
    }>;
    conclusiones: {
      resumen_hallazgos: {
        total_hallazgos: number;
        no_conformidades_mayores: number;
        no_conformidades_menores: number;
        observaciones: number;
        oportunidades_mejora: number;
      };
      recomendaciones_generales: string[];
      proximos_pasos: string[];
    };
  };
}
