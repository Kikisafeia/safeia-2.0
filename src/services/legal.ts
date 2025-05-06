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

export type Country = 'CL' | 'PE' | 'CO' | 'MX' | 'AR' | 'BR' | 'ES' | 'PT' | 'UY' | 'PY' | 'BO' | 'EC' | 'VE' | 'CR' | 'PA' | 'DO' | 'GT' | 'SV' | 'HN' | 'NI';

export async function generateLegalRequirements(
  companyName: string,
  industry: string,
  location: string,
  country: Country, // Now using Country type
  scope: string,
  activities: string
): Promise<LegalResponse> {
  const supportedCountries: Country[] = ['CL', 'PE', 'CO', 'MX', 'AR', 'BR', 'ES', 'PT', 'UY', 'PY', 'BO', 'EC', 'VE', 'CR', 'PA', 'DO', 'GT', 'SV', 'HN', 'NI'];
  
  if (!supportedCountries.includes(country)) {
    throw new Error(`País no soportado: ${country}. Los países soportados son: ${supportedCountries.join(', ')}`);
  }
  const prompt = `Genera un análisis detallado de requisitos legales en seguridad y salud en el trabajo para:
Empresa: ${companyName}
Sector Industrial: ${industry}
Ubicación: ${location}
País: ${country}
Alcance: ${scope}
Actividades Principales: ${activities}

DEBES responder EXCLUSIVAMENTE en formato JSON con la siguiente estructura exacta:
{
  "requirements": [
    {
      "id": "string",
      "category": "string",
      "title": "string",
      "description": "string",
      "applicability": "string",
      "compliance": {
        "status": "compliant|partial|non-compliant|not-evaluated",
        "evidence": "string?",
        "observations": "string?"
      },
      "actions": ["string"],
      "references": ["string"]
    }
  ],
  "summary": {
    "totalRequirements": "number",
    "compliantCount": "number",
    "partialCount": "number",
    "nonCompliantCount": "number",
    "notEvaluatedCount": "number",
    "compliancePercentage": "number",
    "criticalGaps": ["string"],
    "recommendations": ["string"]
  }
}

NO incluyas ningún texto adicional fuera del JSON. El JSON DEBE ser válido y contener todos los campos especificados.`;

  try {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: 0.7,
      max_tokens: 2500,
    });

    const response = completion.choices[0].message.content;
    if (!response) throw new Error('No se recibió respuesta del servicio');

    // Improved JSON extraction with multiple fallbacks
    let jsonString = response;
    
    // Try extracting from markdown code blocks
    const jsonMatch = response.match(/```(?:json)?\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
      jsonString = jsonMatch[1];
    } 
    // Try extracting raw JSON if no code blocks
    else if (response.trim().startsWith('{') && response.trim().endsWith('}')) {
      jsonString = response.trim();
    } 
    // Try finding first JSON object in text
    else {
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        jsonString = response.slice(jsonStart, jsonEnd + 1);
      }
    }

    // Parse and validate the JSON response
    let legalData: LegalResponse;
    try {
      legalData = JSON.parse(jsonString) as LegalResponse;
      
      // Validate required structure
      if (!legalData?.requirements || !Array.isArray(legalData.requirements)) {
        throw new Error('La respuesta no contiene la lista de requisitos');
      }
      if (!legalData?.summary || typeof legalData.summary !== 'object') {
        throw new Error('La respuesta no contiene el resumen de cumplimiento');
      }
      
      // Validate each requirement
      for (const req of legalData.requirements) {
        if (!req.id || !req.title || !req.category) {
          throw new Error('Faltan campos requeridos en los requisitos legales');
        }
      }
      
    } catch (err) {
      console.error('Error parsing JSON:', err);
      console.error('Original response:', response);
      console.error('Extracted JSON:', jsonString);
      throw new Error(`Error al procesar la respuesta: ${err instanceof Error ? err.message : 'Formato inválido'}`);
    }

    // Validate required fields
    if (!legalData.requirements || !legalData.summary) {
      throw new Error('La respuesta del servicio no contiene la estructura esperada');
    }

    // Generate the markdown content
    const markdownContent = generateMarkdownReport(legalData, {
      companyName,
      industry,
      location,
      country, // Pass country to markdown generator
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
    country: string; // Added country to metadata type
    scope: string;
    activities: string;
  }
): string {
  const {
    companyName,
    industry,
    location,
    country, // Destructure country
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
- **País:** ${country} // Display country
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

${Object.entries(
  legalData.requirements.reduce((acc: Record<string, LegalRequirement[]>, req) => {
    if (!acc[req.category]) {
      acc[req.category] = [];
    }
    acc[req.category].push(req);
    return acc;
  }, {})
).map(([category, reqs]) => `### ${category}

${reqs.map(
  (req: LegalRequirement) => `#### ${req.title} ${getComplianceEmoji(req.compliance.status)}

${req.description}

**Estado de Cumplimiento:** ${req.compliance.status}
${req.compliance.evidence ? `**Evidencia:** ${req.compliance.evidence}` : ''}
${req.compliance.observations ? `**Observaciones:** ${req.compliance.observations}` : ''}

${req.actions.length > 0 ? `**Acciones Requeridas:**
${req.actions.map((action: string) => `- ${action}`).join('\n')}` : ''}

**Referencias:** ${req.references.join(', ')}
`
).join('\n---\n')}`
).join('\n\n')}

## Brechas Críticas Identificadas
${legalData.summary.criticalGaps.map((gap) => `- 🚨 ${gap}`).join('\n')}

## Recomendaciones
${legalData.summary.recommendations.map((rec) => `- 💡 ${rec}`).join('\n')}

---
*Informe generado automáticamente por SAFEIA - Sistema de Gestión de SST*`;
}
