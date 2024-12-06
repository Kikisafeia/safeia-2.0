import { openai } from './openai';

export interface AuditResponse {
  informe_auditoria: {
    empresa: string;
    area: string;
    tipo_auditoria: string;
    alcance: string;
    auditor: string;
    fecha: string;
    lista_verificacion: {
      documentacion: Array<{
        item: string;
        cumple: boolean;
        observacion: string;
      }>;
      instalaciones: Array<{
        item: string;
        cumple: boolean;
        observacion: string;
      }>;
      capacitacion: Array<{
        item: string;
        cumple: boolean;
        observacion: string;
      }>;
      epp: Array<{
        item: string;
        cumple: boolean;
        observacion: string;
      }>;
    };
    hallazgos_criticos: Array<{
      descripcion: string;
      accion_requerida: string;
    }>;
    recomendaciones: Array<{
      categoria: string;
      recomendacion: string;
    }>;
    resumen: {
      total_items_verificados: number;
      items_cumplen: number;
      items_no_cumplen: number;
      porcentaje_cumplimiento: number;
    };
  };
}

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
      tipo: 'No Conformidad Mayor' | 'No Conformidad Menor' | 'Observación' | 'Oportunidad de Mejora';
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
        tipo: 'Correctiva' | 'Preventiva';
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
      estado: 'Abierto' | 'En Proceso' | 'Cerrado';
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

export async function generateAudit(
  companyName: string,
  area: string,
  auditType: string,
  scope: string,
  auditor: string,
  date: string
): Promise<AuditResponse> {
  const prompt = `Actúa como un experto auditor de seguridad y salud en el trabajo. Genera un informe de auditoría detallado usando EXACTAMENTE la siguiente estructura JSON, sin añadir campos adicionales ni modificar los nombres de los campos:

{
  "informe_auditoria": {
    "empresa": "${companyName}",
    "area": "${area}",
    "tipo_auditoria": "${auditType}",
    "alcance": "${scope}",
    "auditor": "${auditor}",
    "fecha": "${date}",
    "lista_verificacion": {
      "documentacion": [
        {
          "item": "string",
          "cumple": boolean,
          "observacion": "string"
        }
      ],
      "instalaciones": [
        {
          "item": "string",
          "cumple": boolean,
          "observacion": "string"
        }
      ],
      "capacitacion": [
        {
          "item": "string",
          "cumple": boolean,
          "observacion": "string"
        }
      ],
      "epp": [
        {
          "item": "string",
          "cumple": boolean,
          "observacion": "string"
        }
      ]
    },
    "hallazgos_criticos": [
      {
        "descripcion": "string",
        "accion_requerida": "string"
      }
    ],
    "recomendaciones": [
      {
        "categoria": "string",
        "recomendacion": "string"
      }
    ],
    "resumen": {
      "total_items_verificados": number,
      "items_cumplen": number,
      "items_no_cumplen": number,
      "porcentaje_cumplimiento": number
    }
  }
}

Instrucciones específicas:
1. Usa EXACTAMENTE los nombres de campos mostrados arriba
2. Los valores booleanos deben ser true o false (no "true" o "false" como strings)
3. Los números deben ser números (no strings)
4. Genera al menos 3 items para cada categoría en lista_verificacion
5. Los hallazgos críticos deben basarse en los items que no cumplen
6. Las recomendaciones deben estar organizadas por categoría
7. El resumen debe calcular correctamente los totales basados en la lista de verificación

IMPORTANTE: Asegúrate de que el JSON resultante sea válido y pueda ser parseado por JSON.parse().`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT,
      temperature: 0.5, // Reducido para mayor consistencia
      max_tokens: 2500,
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No se pudo generar el informe de auditoría');

    try {
      // Intenta parsear la respuesta
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        console.error('Respuesta no válida del modelo:', response);
        throw new Error('La respuesta del modelo no es un JSON válido');
      }

      // Verifica la estructura del JSON
      if (!parsedResponse.informe_auditoria) {
        console.error('Estructura JSON incorrecta:', parsedResponse);
        throw new Error('La respuesta no tiene la estructura correcta');
      }

      // Verifica que todas las propiedades requeridas existen
      const audit = parsedResponse.informe_auditoria;
      const requiredProps = [
        'empresa', 'area', 'tipo_auditoria', 'alcance', 'auditor', 'fecha',
        'lista_verificacion', 'hallazgos_criticos', 'recomendaciones', 'resumen'
      ];

      for (const prop of requiredProps) {
        if (!(prop in audit)) {
          console.error(`Falta la propiedad ${prop} en el informe`);
          throw new Error(`La respuesta no incluye la propiedad requerida: ${prop}`);
        }
      }

      // Verifica la estructura de lista_verificacion
      const requiredCategories = ['documentacion', 'instalaciones', 'capacitacion', 'epp'];
      for (const category of requiredCategories) {
        if (!audit.lista_verificacion[category]) {
          console.error(`Falta la categoría ${category} en lista_verificacion`);
          throw new Error(`La lista de verificación no incluye la categoría: ${category}`);
        }
      }

      // Si todas las verificaciones pasan, retorna la respuesta parseada
      return parsedResponse as AuditResponse;
    } catch (error) {
      console.error('Error validando la respuesta:', error);
      throw new Error(`El formato de respuesta de la IA no es válido: ${error.message}`);
    }
  } catch (error) {
    console.error('Error generating audit:', error);
    if (error instanceof Error) {
      throw new Error(`Error al generar el informe de auditoría: ${error.message}`);
    } else {
      throw new Error('Error al generar el informe de auditoría');
    }
  }
}

export async function generateAuditFindings(
  companyName: string,
  area: string,
  auditType: string,
  auditor: string,
  date: string,
  isoStandard: string,
  hallazgos: { descripcion: string; proceso_afectado: string; evidencia_objetiva: string; }[]
): Promise<HallazgoAuditoria> {
  const prompt = `Actúa como un experto auditor de sistemas de gestión ISO. Analiza los siguientes hallazgos de auditoría:

${hallazgos.map((h, i) => `
Hallazgo #${i + 1}:
Descripción: ${h.descripcion}
Proceso Afectado: ${h.proceso_afectado}
Evidencia Objetiva: ${h.evidencia_objetiva}
`).join('\n')}

Para cada hallazgo, describe de manera clara y concisa:
- Los puntos específicos de la norma ${isoStandard} que no se están cumpliendo
- El análisis de causas raíces y los posibles impactos en la seguridad y salud en el trabajo
- Acciones correctivas y preventivas específicas, con responsabilidades y plazos
- Recursos necesarios y mecanismos de seguimiento
- Plan de comunicación interna y mejora continua

Genera un informe detallado siguiendo EXACTAMENTE esta estructura JSON. IMPORTANTE: La respuesta debe ser un JSON válido que pueda ser parseado por JSON.parse().

RESPONDE SOLAMENTE CON EL JSON, SIN TEXTO ADICIONAL ANTES O DESPUÉS.

{
  "informe_hallazgo": {
    "informacion_general": {
      "empresa": "${companyName}",
      "area_auditada": "${area}",
      "fecha_auditoria": "${date}",
      "tipo_auditoria": "${auditType}",
      "auditor": "${auditor}",
      "norma_referencia": "${isoStandard}"
    },
    "hallazgos": [
      {
        "id": "HAL-001",
        "tipo": "No Conformidad Mayor",
        "proceso_afectado": "string",
        "descripcion": "Descripción detallada del incumplimiento",
        "evidencia_objetiva": "Evidencia específica que sustenta el hallazgo",
        "clausula_norma": "Referencia específica a la cláusula de la norma",
        "requisito_incumplido": "Descripción del requisito específico que no se cumple",
        "analisis_causa_raiz": {
          "metodo": "5 Por qué",
          "causas_identificadas": [
            "Causa 1",
            "Causa 2",
            "Causa 3"
          ]
        },
        "acciones_propuestas": [
          {
            "tipo": "Correctiva",
            "descripcion": "Descripción detallada de la acción",
            "responsable": "Nombre y cargo del responsable",
            "fecha_implementacion": "YYYY-MM-DD",
            "recursos_necesarios": "Recursos humanos, materiales o financieros necesarios",
            "seguimiento": {
              "metodo_verificacion": "Método específico para verificar la eficacia",
              "frecuencia_seguimiento": "Periodicidad del seguimiento"
            }
          }
        ],
        "impacto": {
          "seguridad_salud": "Impacto específico en SST",
          "operacional": "Impacto en las operaciones",
          "economico": "Impacto económico estimado"
        },
        "estado": "Abierto",
        "comunicacion_interna": {
          "canales": ["Canal 1", "Canal 2"],
          "responsables_comunicacion": ["Responsable 1", "Responsable 2"],
          "frecuencia_actualizacion": "Periodicidad de las actualizaciones"
        },
        "mejora_continua": {
          "indicadores_seguimiento": ["Indicador 1", "Indicador 2"],
          "lecciones_aprendidas": ["Lección 1", "Lección 2"],
          "oportunidades_mejora": ["Oportunidad 1", "Oportunidad 2"]
        }
      }
    ],
    "conclusiones": {
      "resumen_hallazgos": {
        "total_hallazgos": ${hallazgos.length},
        "no_conformidades_mayores": 0,
        "no_conformidades_menores": 0,
        "observaciones": 0,
        "oportunidades_mejora": 0
      },
      "recomendaciones_generales": [
        "Recomendación 1",
        "Recomendación 2"
      ],
      "proximos_pasos": [
        "Paso 1",
        "Paso 2"
      ]
    }
  }
}

Instrucciones específicas:
1. Analiza cada uno de los ${hallazgos.length} hallazgos proporcionados
2. Para cada hallazgo:
   - Usa IDs secuenciales (HAL-001, HAL-002, etc.)
   - Determina el tipo de hallazgo basado en su severidad
   - Referencia la cláusula específica de la norma ${isoStandard} que aplique
   - Proporciona un análisis detallado de causas raíces usando el método de los 5 Por qué
   - Propone acciones correctivas y preventivas con responsables y plazos realistas
   - Detalla los impactos en seguridad, operaciones y aspectos económicos
   - Incluye plan de comunicación interna y elementos de mejora continua
3. Las fechas deben estar en formato YYYY-MM-DD
4. El estado debe ser "Abierto" para nuevos hallazgos
5. El resumen debe reflejar el conteo correcto de los hallazgos generados
6. Las recomendaciones y próximos pasos deben ser específicos y accionables`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT,
      temperature: 0.3,
      max_tokens: 3000,
      response_format: { type: "json_object" }
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No se pudo generar el informe de hallazgos');

    console.log('Respuesta del modelo:', response);

    try {
      const cleanResponse = response
        .trim()
        .replace(/^```json\s*/, '')
        .replace(/\s*```$/, '')
        .replace(/^\s*\{\s*/, '{')
        .replace(/\s*\}\s*$/, '}');

      const parsedResponse = JSON.parse(cleanResponse);

      if (!parsedResponse.informe_hallazgo) {
        console.error('Estructura JSON incorrecta:', parsedResponse);
        throw new Error('La respuesta no tiene la estructura correcta');
      }

      const informe = parsedResponse.informe_hallazgo;
      const requiredSections = ['informacion_general', 'hallazgos', 'conclusiones'];
      
      for (const section of requiredSections) {
        if (!(section in informe)) {
          console.error(`Falta la sección ${section}`);
          throw new Error(`La respuesta no incluye la sección requerida: ${section}`);
        }
      }

      if (!Array.isArray(informe.hallazgos) || informe.hallazgos.length !== hallazgos.length) {
        console.error(`Número incorrecto de hallazgos: ${informe.hallazgos?.length}`);
        throw new Error('El informe debe contener exactamente los hallazgos proporcionados');
      }

      const resumen = informe.conclusiones.resumen_hallazgos;
      const hallazgosGenerados = informe.hallazgos;
      
      const conteoReal = {
        total_hallazgos: hallazgosGenerados.length,
        no_conformidades_mayores: hallazgosGenerados.filter(h => h.tipo === 'No Conformidad Mayor').length,
        no_conformidades_menores: hallazgosGenerados.filter(h => h.tipo === 'No Conformidad Menor').length,
        observaciones: hallazgosGenerados.filter(h => h.tipo === 'Observación').length,
        oportunidades_mejora: hallazgosGenerados.filter(h => h.tipo === 'Oportunidad de Mejora').length
      };

      if (JSON.stringify(resumen) !== JSON.stringify(conteoReal)) {
        console.warn('Corrigiendo el resumen de hallazgos para que coincida con el conteo real');
        informe.conclusiones.resumen_hallazgos = conteoReal;
      }

      const expectedIds = hallazgosGenerados.map((_, i) => `HAL-${String(i + 1).padStart(3, '0')}`);
      const idsCorrectos = hallazgosGenerados.every((h, i) => h.id === expectedIds[i]);
      if (!idsCorrectos) {
        console.warn('Corrigiendo IDs de hallazgos');
        hallazgosGenerados.forEach((h, i) => {
          h.id = expectedIds[i];
        });
      }

      return parsedResponse as HallazgoAuditoria;
    } catch (error) {
      console.error('Error validando la respuesta:', error);
      throw new Error(`El formato de respuesta de la IA no es válido: ${error.message}`);
    }
  } catch (error) {
    console.error('Error generating audit findings:', error);
    if (error instanceof Error) {
      throw new Error(`Error al generar el informe de hallazgos: ${error.message}`);
    } else {
      throw new Error('Error al generar el informe de hallazgos');
    }
  }
}

export function generateMarkdownReport(auditData: AuditResponse | HallazgoAuditoria): string {
  // Determinar el tipo de informe
  if ('informe_auditoria' in auditData) {
    // Es un informe de auditoría regular
    const { informe_auditoria: audit } = auditData as AuditResponse;
    
    let markdown = `# Informe de Auditoría de Seguridad y Salud en el Trabajo\n\n`;
    
    markdown += `## Información General\n`;
    markdown += `- **Empresa:** ${audit.empresa}\n`;
    markdown += `- **Área:** ${audit.area}\n`;
    markdown += `- **Tipo de Auditoría:** ${audit.tipo_auditoria}\n`;
    markdown += `- **Alcance:** ${audit.alcance}\n`;
    markdown += `- **Auditor:** ${audit.auditor}\n`;
    markdown += `- **Fecha:** ${audit.fecha}\n\n`;

    markdown += `## Lista de Verificación\n\n`;
    
    // Documentación
    markdown += `### Documentación\n\n`;
    audit.lista_verificacion.documentacion.forEach(item => {
      markdown += `- **${item.item}**\n`;
      markdown += `  - Estado: ${item.cumple ? '✅ Cumple' : '❌ No Cumple'}\n`;
      markdown += `  - Observación: ${item.observacion}\n\n`;
    });

    // Instalaciones
    markdown += `### Instalaciones\n\n`;
    audit.lista_verificacion.instalaciones.forEach(item => {
      markdown += `- **${item.item}**\n`;
      markdown += `  - Estado: ${item.cumple ? '✅ Cumple' : '❌ No Cumple'}\n`;
      markdown += `  - Observación: ${item.observacion}\n\n`;
    });

    // Capacitación
    markdown += `### Capacitación\n\n`;
    audit.lista_verificacion.capacitacion.forEach(item => {
      markdown += `- **${item.item}**\n`;
      markdown += `  - Estado: ${item.cumple ? '✅ Cumple' : '❌ No Cumple'}\n`;
      markdown += `  - Observación: ${item.observacion}\n\n`;
    });

    // EPP
    markdown += `### EPP\n\n`;
    audit.lista_verificacion.epp.forEach(item => {
      markdown += `- **${item.item}**\n`;
      markdown += `  - Estado: ${item.cumple ? '✅ Cumple' : '❌ No Cumple'}\n`;
      markdown += `  - Observación: ${item.observacion}\n\n`;
    });

    markdown += `## Hallazgos Críticos\n\n`;
    audit.hallazgos_criticos.forEach(hallazgo => {
      markdown += `- **${hallazgo.descripcion}**\n`;
      markdown += `  - Acción Requerida: ${hallazgo.accion_requerida}\n\n`;
    });

    markdown += `## Recomendaciones\n\n`;
    audit.recomendaciones.forEach(rec => {
      markdown += `### ${rec.categoria}\n`;
      markdown += `- ${rec.recomendacion}\n\n`;
    });

    markdown += `## Resumen\n\n`;
    markdown += `- Total de ítems evaluados: ${audit.resumen.total_items_verificados}\n`;
    markdown += `- Ítems que cumplen: ${audit.resumen.items_cumplen}\n`;
    markdown += `- Ítems que no cumplen: ${audit.resumen.items_no_cumplen}\n`;
    markdown += `- Porcentaje de cumplimiento: ${audit.resumen.porcentaje_cumplimiento}%\n`;

    return markdown;
  } else {
    // Es un informe de hallazgos ISO
    const { informe_hallazgo: informe } = auditData as HallazgoAuditoria;
    
    let markdown = `# Informe de Hallazgos de Auditoría\n\n`;
    
    markdown += `## Información General\n\n`;
    markdown += `- **Empresa:** ${informe.informacion_general.empresa}\n`;
    markdown += `- **Área Auditada:** ${informe.informacion_general.area_auditada}\n`;
    markdown += `- **Fecha de Auditoría:** ${informe.informacion_general.fecha_auditoria}\n`;
    markdown += `- **Tipo de Auditoría:** ${informe.informacion_general.tipo_auditoria}\n`;
    markdown += `- **Auditor:** ${informe.informacion_general.auditor}\n`;
    markdown += `- **Norma de Referencia:** ${informe.informacion_general.norma_referencia}\n\n`;

    markdown += `## Hallazgos\n\n`;
    informe.hallazgos.forEach(hallazgo => {
      markdown += `### ${hallazgo.id} - ${hallazgo.tipo}\n\n`;
      markdown += `**Proceso Afectado:** ${hallazgo.proceso_afectado}\n\n`;
      markdown += `**Descripción:**\n${hallazgo.descripcion}\n\n`;
      markdown += `**Evidencia Objetiva:**\n${hallazgo.evidencia_objetiva}\n\n`;
      markdown += `**Cláusula de la Norma:** ${hallazgo.clausula_norma}\n`;
      markdown += `**Requisito Incumplido:** ${hallazgo.requisito_incumplido}\n\n`;
      
      markdown += `#### Análisis de Causa Raíz\n`;
      markdown += `**Método:** ${hallazgo.analisis_causa_raiz.metodo}\n\n`;
      markdown += `**Causas Identificadas:**\n`;
      hallazgo.analisis_causa_raiz.causas_identificadas.forEach(causa => {
        markdown += `- ${causa}\n`;
      });
      markdown += '\n';

      markdown += `#### Acciones Propuestas\n\n`;
      hallazgo.acciones_propuestas.forEach((accion, index) => {
        markdown += `##### Acción ${index + 1} (${accion.tipo})\n`;
        markdown += `- **Descripción:** ${accion.descripcion}\n`;
        markdown += `- **Responsable:** ${accion.responsable}\n`;
        markdown += `- **Fecha de Implementación:** ${accion.fecha_implementacion}\n`;
        markdown += `- **Recursos Necesarios:** ${accion.recursos_necesarios}\n`;
        markdown += `- **Seguimiento:**\n`;
        markdown += `  - Método de Verificación: ${accion.seguimiento.metodo_verificacion}\n`;
        markdown += `  - Frecuencia: ${accion.seguimiento.frecuencia_seguimiento}\n\n`;
      });

      markdown += `#### Impacto\n`;
      markdown += `- **Seguridad y Salud:** ${hallazgo.impacto.seguridad_salud}\n`;
      markdown += `- **Operacional:** ${hallazgo.impacto.operacional}\n`;
      markdown += `- **Económico:** ${hallazgo.impacto.economico}\n\n`;

      markdown += `**Estado:** ${hallazgo.estado}\n\n`;
      markdown += `---\n\n`;
    });

    markdown += `## Conclusiones\n\n`;
    markdown += `### Resumen de Hallazgos\n\n`;
    markdown += `- Total de Hallazgos: ${informe.conclusiones.resumen_hallazgos.total_hallazgos}\n`;
    markdown += `- No Conformidades Mayores: ${informe.conclusiones.resumen_hallazgos.no_conformidades_mayores}\n`;
    markdown += `- No Conformidades Menores: ${informe.conclusiones.resumen_hallazgos.no_conformidades_menores}\n`;
    markdown += `- Observaciones: ${informe.conclusiones.resumen_hallazgos.observaciones}\n`;
    markdown += `- Oportunidades de Mejora: ${informe.conclusiones.resumen_hallazgos.oportunidades_mejora}\n\n`;

    markdown += `### Recomendaciones Generales\n\n`;
    informe.conclusiones.recomendaciones_generales.forEach(rec => {
      markdown += `- ${rec}\n`;
    });
    markdown += '\n';

    markdown += `### Próximos Pasos\n\n`;
    informe.conclusiones.proximos_pasos.forEach(paso => {
      markdown += `- ${paso}\n`;
    });

    return markdown;
  }
}
