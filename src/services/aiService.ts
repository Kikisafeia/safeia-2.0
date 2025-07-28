// [Previous content remains exactly the same...]

// New function for risk map image analysis
// Type for risk matrix generation input
export type RiskMatrixInput = {
  company: string;
  sector: string;
  processes: string;
  workers: number;
  history?: string;
};

// Generates a risk matrix based on workplace information
export async function generateRiskMatrix(input: RiskMatrixInput): Promise<{
  riesgos: Array<{
    peligro: string;
    riesgo: string;
    probabilidad: string;
    consecuencia: string;
    nivel: 'Alto' | 'Medio' | 'Bajo';
    medidas: string[];
  }>;
  resumen: {
    alto: number;
    medio: number;
    bajo: number;
  };
}> {
  try {
    const response = await fetch('/api/ai/risk-matrix', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error('Error generating risk matrix');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateRiskMatrix:', error);
    // Fallback mock data
    return {
      riesgos: [],
      resumen: {
        alto: 0,
        medio: 0,
        bajo: 0
      }
    };
  }
}

export async function generateSGSSTSuggestion(
  componentTitle: string,
  companyInfo: { sector: string; size: number }
): Promise<{ suggestion: string }> {
  try {
    const response = await fetch('/api/ai/sgsst-suggestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ componentTitle, companyInfo }),
    });

    if (!response.ok) {
      throw new Error('Error generating SGSST suggestion');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateSGSSTSuggestion:', error);
    return { suggestion: 'No se pudo generar la sugerencia.' };
  }
}

export async function generatePTSActivitySuggestions(
  sector: string,
  processType: string
): Promise<string[]> {
  try {
    const response = await fetch('/api/ai/pts-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sector,
        processType
      })
    });

    if (!response.ok) {
      throw new Error('Error generating PTS activity suggestions');
    }

    const result = await response.json();
    return result.suggestions || [];
  } catch (error) {
    console.error('Error in generatePTSActivitySuggestions:', error);
    return [];
  }
}

export async function generatePTS(
  activity: string,
  riskLevel: string,
  equipment: string,
  location: string
): Promise<{
  content: string;
  images?: Array<{
    url: string;
    section: string;
  }>;
}> {
  try {
    const response = await fetch('/api/ai/pts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activity,
        riskLevel,
        equipment,
        location
      })
    });

    if (!response.ok) {
      throw new Error('Error generating PTS');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generatePTS:', error);
    // Fallback mock data
    return {
      content: `<p>No se pudo generar el procedimiento. Error: ${error instanceof Error ? error.message : 'Desconocido'}</p>`
    };
  }
}

export async function fetchChatCompletions(payload: {
  messages: Array<{
    role: 'system' | 'user';
    content: string;
  }>;
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}): Promise<any> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Error fetching chat completions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in fetchChatCompletions:', error);
    throw error;
  }
}

// Types for ATS functionality
export interface DASInput {
  empresa: string;
  cargo: string;
  area: string;
  pais: string;
  sector: string;
  actividades: string;
  equipos: string;
  materiales: string;
  legislacionAplicable?: string;
}

export interface DASResponse {
  etapas: Array<{
    nombreEtapa: string;
    riesgosAspectosIncidentes: string[];
    medidasPreventivas: string[];
  }>;
  legislacionAplicableOriginal?: string;
}

export interface SuggestionResponse {
  suggestions: string[];
}

// Checklist suggestion functions
export async function suggestActivitiesForChecklist(
  tipo: string,
  area: string
): Promise<SuggestionResponse> {
  try {
    const response = await fetch('/api/ai/suggest-checklist-activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tipo, area })
    });

    if (!response.ok) {
      throw new Error('Error suggesting checklist activities');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in suggestActivitiesForChecklist:', error);
    return { suggestions: [] };
  }
}

export async function suggestRisksForChecklist(
  tipo: string,
  area: string,
  actividades: string[]
): Promise<SuggestionResponse> {
  try {
    const response = await fetch('/api/ai/suggest-checklist-risks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tipo, area, actividades })
    });

    if (!response.ok) {
      throw new Error('Error suggesting checklist risks');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in suggestRisksForChecklist:', error);
    return { suggestions: [] };
  }
}

export async function suggestNormsForChecklist(
  tipo: string,
  area: string,
  pais: string
): Promise<SuggestionResponse> {
  try {
    const response = await fetch('/api/ai/suggest-checklist-norms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tipo, area, pais })
    });

    if (!response.ok) {
      throw new Error('Error suggesting checklist norms');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in suggestNormsForChecklist:', error);
    return { suggestions: [] };
  }
}

// ATS Generation Functions
export async function generateDAS(input: DASInput): Promise<DASResponse> {
  try {
    const response = await fetch('/api/ai/das', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input)
    });

    if (!response.ok) {
      throw new Error('Error generating DAS');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateDAS:', error);
    return {
      etapas: [],
      legislacionAplicableOriginal: 'No se pudo generar el análisis'
    };
  }
}

export async function suggestActividadesATS(
  cargo: string,
  sector: string,
  empresa: string
): Promise<SuggestionResponse> {
  try {
    const response = await fetch('/api/ai/suggest-actividades', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cargo, sector, empresa })
    });

    if (!response.ok) {
      throw new Error('Error suggesting actividades');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in suggestActividadesATS:', error);
    return { suggestions: [] };
  }
}

export async function suggestEquiposATS(
  actividades: string,
  sector: string
): Promise<SuggestionResponse> {
  try {
    const response = await fetch('/api/ai/suggest-equipos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ actividades, sector })
    });

    if (!response.ok) {
      throw new Error('Error suggesting equipos');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in suggestEquiposATS:', error);
    return { suggestions: [] };
  }
}

export async function suggestMaterialesATS(
  actividades: string,
  sector: string
): Promise<SuggestionResponse> {
  try {
    const response = await fetch('/api/ai/suggest-materiales', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ actividades, sector })
    });

    if (!response.ok) {
      throw new Error('Error suggesting materiales');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in suggestMaterialesATS:', error);
    return { suggestions: [] };
  }
}

// Safety functions
export async function generateSafetyRecommendations(
  sector: string,
  risks: string[]
): Promise<{ recommendations: string[] }> {
  try {
    const response = await fetch('/api/ai/safety-recommendations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sector, risks })
    });

    if (!response.ok) {
      throw new Error('Error generating safety recommendations');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateSafetyRecommendations:', error);
    return { recommendations: [] };
  }
}

// FODA Analysis
export async function generateFODAAnalysis(
  company: string,
  sector: string
): Promise<{ fortalezas: string[]; oportunidades: string[]; debilidades: string[]; amenazas: string[] }> {
  try {
    const response = await fetch('/api/ai/foda-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ company, sector })
    });

    if (!response.ok) {
      throw new Error('Error generating FODA analysis');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateFODAAnalysis:', error);
    return { fortalezas: [], oportunidades: [], debilidades: [], amenazas: [] };
  }
}

// Checklist generation
export async function generateChecklist(
  tipo: string,
  area: string,
  pais: string
): Promise<{ items: Array<{ activity: string; norm: string }> }> {
  try {
    const response = await fetch('/api/ai/generate-checklist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tipo, area, pais })
    });

    if (!response.ok) {
      throw new Error('Error generating checklist');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateChecklist:', error);
    return { items: [] };
  }
}

// Inspection generation
export async function generateInspection(
  sector: string,
  area: string
): Promise<{ items: Array<{ point: string; criteria: string }> }> {
  try {
    const response = await fetch('/api/ai/generate-inspection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sector, area })
    });

    if (!response.ok) {
      throw new Error('Error generating inspection');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateInspection:', error);
    return { items: [] };
  }
}

// Policy generation
export async function generatePolitica(
  tipoPolitica: string,
  company: string,
  pais: string,
  sector: string,
  trabajadores: number,
  actividades: string,
  alcance: string,
  objetivos: string
): Promise<{ content: string }> {
  try {
    const response = await fetch('/api/ai/generate-policy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        tipoPolitica,
        company, 
        pais,
        sector,
        trabajadores,
        actividades,
        alcance,
        objetivos
      })
    });

    if (!response.ok) {
      throw new Error('Error generating policy');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generatePolitica:', error);
    return { content: '' };
  }
}

export interface PolicySuggestionInput {
  sector: string;
  actividad?: string;
  descripcion?: string;
  fieldToSuggest: 'actividades' | 'alcance' | 'objetivos';
}

export async function generatePoliticaSuggestions(
  input: PolicySuggestionInput
): Promise<{ suggestions: string[]; error?: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30-second timeout

  try {
    const response = await fetch('/api/ai/policy-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input), // Pass the whole input
      signal: controller.signal
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        suggestions: [], 
        error: errorData.message || `Error del servidor: ${response.status}`
      };
    }

    const result = await response.json();
    
    if (!result || !Array.isArray(result.suggestions)) {
      return { suggestions: [], error: 'Formato de respuesta inválido del servidor.' };
    }

    return { suggestions: result.suggestions };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { suggestions: [], error: 'La solicitud de sugerencias tardó demasiado.' };
      }
      return { suggestions: [], error: error.message };
    }
    return { suggestions: [], error: 'Error desconocido al generar sugerencias.' };
  } finally {
    clearTimeout(timeout);
  }
}

// Safety talk (moved from azure-ai.ts)
export async function generateSuggestions(
  context: string,
  topic: string
): Promise<{ suggestions: string[] }> {
  try {
    const response = await fetch('/api/ai/generate-suggestions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ context, topic })
    });

    if (!response.ok) {
      throw new Error('Error generating suggestions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateSuggestions:', error);
    return { suggestions: [] };
  }
}

export interface AIResponse {
  content: string;
  error?: string;
}

export async function generateSSTRecommendation(
  context: string,
  query: string
): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai/sst-recommendation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ context, query })
    });

    if (!response.ok) {
      throw new Error('Error generating SST recommendation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateSSTRecommendation:', error);
    return { content: '', error: 'Error al generar la recomendación. Por favor, intente nuevamente.' };
  }
}

export async function generateSafetyProcedure(
  taskDescription: string,
  industry: string
): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai/safety-procedure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskDescription, industry })
    });

    if (!response.ok) {
      throw new Error('Error generating safety procedure');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateSafetyProcedure:', error);
    return { content: '', error: 'Error al generar el procedimiento. Por favor, intente nuevamente.' };
  }
}

export async function generateSafetyTalk(
  topic: string,
  duration: number,
  audience: string
): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai/safety-talk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, duration, audience })
    });

    if (!response.ok) {
      throw new Error('Error generating safety talk');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateSafetyTalk:', error);
    return { content: '', error: 'Error al generar la charla. Por favor, intente nuevamente.' };
  }
}

export async function analyzeSafetyTask(
  taskDescription: string,
  environment: string,
  workers: number
): Promise<AIResponse> {
  try {
    const response = await fetch('/api/ai/analyze-safety-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ taskDescription, environment, workers })
    });

    if (!response.ok) {
      throw new Error('Error analyzing safety task');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in analyzeSafetyTask:', error);
    return { content: '', error: 'Error al generar el análisis. Por favor, intente nuevamente.' };
  }
}

export async function generateImage(
  prompt: string,
  options?: {
    style?: 'realistic' | 'illustration' | 'diagram';
    size?: '512x512' | '1024x1024';
  }
): Promise<{ url: string }> {
  try {
    const response = await fetch('/api/ai/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        style: options?.style || 'realistic',
        size: options?.size || '512x512'
      })
    });

    if (!response.ok) {
      throw new Error('Error generating image');
    }

    return await response.json();
  } catch (error) {
    console.error('Error in generateImage:', error);
    return { url: '' };
  }
}

export async function analyzeImage(
  imageFile: File,
  options: {
    features: string[];
    workplaceType: string;
  }
): Promise<{
  detections: Array<{
    type: string;
    confidence: number;
    position: {x: number; y: number};
    dimensions?: {width: number; height: number};
  }>;
  imageWidth: number;
  imageHeight: number;
}> {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('features', JSON.stringify(options.features));
    formData.append('workplaceType', options.workplaceType);

    const response = await fetch('/api/ai/image-analysis', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Error al analizar imagen');
    }

    const result = await response.json();
    
    return {
      detections: result.detections || [],
      imageWidth: result.width || 800,
      imageHeight: result.height || 600
    };
  } catch (error) {
    console.error('Error en analyzeImage:', error);
    return {
      detections: [],
      imageWidth: 800,
      imageHeight: 600
    };
  }
}
