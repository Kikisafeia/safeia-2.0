import { fetchChatCompletions } from './aiService'; // Import the proxy helper

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
  content: string; // This will be generated markdown
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

// Consider moving this type to a shared types file if used elsewhere
export type Country = 'CL' | 'PE' | 'CO' | 'MX' | 'AR' | 'BR' | 'ES' | 'PT' | 'UY' | 'PY' | 'BO' | 'EC' | 'VE' | 'CR' | 'PA' | 'DO' | 'GT' | 'SV' | 'HN' | 'NI';

export async function generateLegalRequirements(
  companyName: string,
  industry: string,
  location: string,
  country: Country,
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
    const payload = {
       messages: [{ role: "user" as const, content: prompt }],
       // model: "gpt-4", // Model/deployment handled by proxy
       temperature: 0.7,
       max_tokens: 2500,
       response_format: { type: "json_object" } // Request JSON
    };

    const data = await fetchChatCompletions(payload); // Call via proxy

    // Process the response data
    let legalData: Omit<LegalResponse, 'content'>; // Type for the JSON part

    if (data && data.requirements && data.summary) {
        // Assuming proxy returns the parsed JSON content directly
        legalData = data;
    } else if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        // Fallback if proxy returns the full Azure object
        const responseContent = data.choices[0].message.content;
        if (!responseContent) throw new Error('No se recibió contenido del servicio de IA');

        // Use robust JSON extraction logic
        let jsonString = responseContent;
        const jsonMatch = responseContent.match(/```(?:json)?\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          jsonString = jsonMatch[1];
        } else if (responseContent.trim().startsWith('{') && responseContent.trim().endsWith('}')) {
          jsonString = responseContent.trim();
        } else {
          const jsonStart = responseContent.indexOf('{');
          const jsonEnd = responseContent.lastIndexOf('}');
          if (jsonStart >= 0 && jsonEnd > jsonStart) {
            jsonString = responseContent.slice(jsonStart, jsonEnd + 1);
          } else {
             throw new Error('No se pudo extraer JSON válido de la respuesta del servicio de IA');
          }
        }

        try {
            legalData = JSON.parse(jsonString);
        } catch (err) {
             console.error('Error parsing JSON from fallback:', err);
             console.error('Original response content:', responseContent);
             console.error('Attempted JSON string:', jsonString);
             throw new Error(`Error al procesar la respuesta: ${err instanceof Error ? err.message : 'Formato inválido'}`);
        }
    } else {
         throw new Error("Respuesta inesperada del servicio de IA para requisitos legales.");
    }

    // Validate the structure of the parsed data
    if (!legalData?.requirements || !Array.isArray(legalData.requirements)) {
      throw new Error('La respuesta no contiene la lista de requisitos');
    }
    if (!legalData?.summary || typeof legalData.summary !== 'object') {
      throw new Error('La respuesta no contiene el resumen de cumplimiento');
    }
    for (const req of legalData.requirements) {
      if (req.id === undefined || req.title === undefined || req.category === undefined) {
        console.error("Requisito legal inválido:", req);
        throw new Error('Faltan campos requeridos en los requisitos legales');
      }
    }

    // Generate the markdown content using the validated data
    const markdownContent = generateMarkdownReport(legalData, {
      companyName,
      industry,
      location,
      country,
      scope,
      activities,
    });

    // Combine JSON data and markdown content for the final response
    return {
      ...legalData,
      content: markdownContent,
    };

  } catch (error) {
    console.error('Error generating legal requirements:', error);
    // Throw a more specific error if possible, otherwise a generic one
    throw new Error(`Error al generar los requisitos legales: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

// Helper function to generate Markdown report (remains the same)
function generateMarkdownReport(
  legalData: Omit<LegalResponse, 'content'>, // Use the JSON part type
  metadata: {
    companyName: string;
    industry: string;
    location: string;
    country: string;
    scope: string;
    activities: string;
  }
): string {
  const {
    companyName,
    industry,
    location,
    country,
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
- **País:** ${country}
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
