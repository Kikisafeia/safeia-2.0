import { openai } from './openai';

export interface LegalRequirement {
  id: string;
  category: string;
  title: string;
  description: string;
  applicability: string;
  compliance: {
    status: 'compliant' | 'partial' | 'non-compliant' | 'not-evaluated';
    evidence?: string;
    observations?: string;
  };
  actions: string[];
  references: string[];
}

export interface LegalResponse {
  content: string;
  requirements: LegalRequirement[];
  summary: {
    totalRequirements: number;
    compliantCount: number;
    partialCount: number;
    nonCompliantCount: number;
    notEvaluatedCount: number;
    compliancePercentage: number;
    criticalGaps: string[];
    recommendations: string[];
  };
}

export async function generateLegalRequirements(
  companyName: string,
  industry: string,
  location: string,
  scope: string,
  activities: string
): Promise<LegalResponse> {
  const prompt = `Genera un análisis detallado de requisitos legales en seguridad y salud en el trabajo para:
Empresa: ${companyName}
Sector Industrial: ${industry}
Ubicación: ${location}
Alcance: ${scope}
Actividades Principales: ${activities}

El análisis debe incluir:
1. Lista de requisitos legales aplicables organizados por categoría
2. Para cada requisito:
   - Título y descripción
   - Estado de cumplimiento (cumple, cumple parcialmente, no cumple, no evaluado)
   - Evidencias y observaciones cuando aplique
   - Acciones requeridas para cumplimiento
   - Referencias legales
3. Resumen con estadísticas de cumplimiento
4. Brechas críticas identificadas
5. Recomendaciones específicas

Genera una respuesta estructurada en formato JSON que incluya toda esta información.`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 2500,
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No se pudieron generar los requisitos legales');

    // Parse the JSON response
    const legalData = JSON.parse(response) as LegalResponse;

    // Generate the markdown content
    const markdownContent = generateMarkdownReport(legalData, {
      companyName,
      industry,
      location,
      scope,
      activities,
    });

    return {
      ...legalData,
      content: markdownContent,
    };
  } catch (error) {
    console.error('Error generating legal requirements:', error);
    throw new Error('Error al generar los requisitos legales');
  }
}

function generateMarkdownReport(
  legalData: LegalResponse,
  metadata: {
    companyName: string;
    industry: string;
    location: string;
    scope: string;
    activities: string;
  }
): string {
  const {
    companyName,
    industry,
    location,
    scope,
    activities,
  } = metadata;

  const getComplianceEmoji = (status: string) => {
    switch (status) {
      case 'compliant':
        return '✅';
      case 'partial':
        return '⚠️';
      case 'non-compliant':
        return '❌';
      default:
        return '❔';
    }
  };

  return `# Análisis de Requisitos Legales SST

## Información General
- **Empresa:** ${companyName}
- **Sector Industrial:** ${industry}
- **Ubicación:** ${location}
- **Alcance:** ${scope}
- **Actividades Principales:** ${activities}

## Resumen de Cumplimiento
- Total de Requisitos: ${legalData.summary.totalRequirements}
- Requisitos Cumplidos: ${legalData.summary.compliantCount}
- Cumplimiento Parcial: ${legalData.summary.partialCount}
- No Cumplidos: ${legalData.summary.nonCompliantCount}
- No Evaluados: ${legalData.summary.notEvaluatedCount}
- Porcentaje de Cumplimiento: ${legalData.summary.compliancePercentage}%

## Requisitos Legales por Categoría

${legalData.requirements
  .reduce((acc, req) => {
    if (!acc[req.category]) {
      acc[req.category] = [];
    }
    acc[req.category].push(req);
    return acc;
  }, {} as Record<string, LegalRequirement[]>)
  .map(
    (reqs, category) => `### ${category}

${reqs.map(
  (req) => `#### ${req.title} ${getComplianceEmoji(req.compliance.status)}

${req.description}

**Estado de Cumplimiento:** ${req.compliance.status}
${req.compliance.evidence ? `**Evidencia:** ${req.compliance.evidence}` : ''}
${req.compliance.observations ? `**Observaciones:** ${req.compliance.observations}` : ''}

${req.actions.length > 0 ? `**Acciones Requeridas:**
${req.actions.map((action) => `- ${action}`).join('\n')}` : ''}

**Referencias:** ${req.references.join(', ')}
`
).join('\n---\n')}`
  )
  .join('\n\n')}

## Brechas Críticas Identificadas
${legalData.summary.criticalGaps.map((gap) => `- 🚨 ${gap}`).join('\n')}

## Recomendaciones
${legalData.summary.recommendations.map((rec) => `- 💡 ${rec}`).join('\n')}

---
*Informe generado automáticamente por SAFEIA - Sistema de Gestión de SST*`;
}
