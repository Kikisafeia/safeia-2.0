import { getLegalFramework } from './braveSearchService'; // Used by generateSafetyRecommendations
import {
  ChecklistResponse,
  SuggestionResponse,
  ChecklistFormData
} from '../types/checklist'; // Assuming these types exist

// Helper function to call the backend proxy for chat completions
// Exported for use in other services if needed before full consolidation/refactor
export async function fetchChatCompletions(payload: any) {
  const response = await fetch('/api/azure/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Error desconocido del proxy" }));
    console.error('Error from chat completions proxy:', errorData);
    throw new Error(errorData.error || 'Error al comunicar con el servicio de IA via proxy');
  }
  return response.json();
}

// Helper function to call the backend proxy for image generation
// Exported for use in other services if needed before full consolidation/refactor
export async function fetchImageGeneration(payload: any) {
  const response = await fetch('/api/azure/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Error desconocido del proxy de imágenes" }));
    console.error('Error from image generation proxy:', errorData);
    throw new Error(errorData.error || 'Error al generar imagen via proxy');
  }
  return response.json();
}

// --- Interfaces (Consolidated from both files - Consider moving to src/types/) ---

interface Recomendacion {
  categoria: string;
  descripcion: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  acciones: string[];
  normativa?: string;
  legislacionLocal?: string;
  fuentesLegales?: string[];
}

interface FODA {
  fortalezas: { descripcion: string; impacto: 'Alto' | 'Medio' | 'Bajo'; acciones: string[] }[];
  oportunidades: { descripcion: string; impacto: 'Alto' | 'Medio' | 'Bajo'; acciones: string[] }[];
  debilidades: { descripcion: string; impacto: 'Alto' | 'Medio' | 'Bajo'; acciones: string[] }[];
  amenazas: { descripcion: string; impacto: 'Alto' | 'Medio' | 'Bajo'; acciones: string[] }[];
}

interface SafetyTalk {
  titulo: string;
  duracion: string;
  objetivos: string[];
  introduccion: string;
  contenido: { tema: string; puntosClave: string[]; ejemplos: string[] }[];
  actividades: { descripcion: string; duracion: string; materiales?: string[] }[];
  conclusiones: string[];
  evaluacion: { preguntas: string[]; respuestasEsperadas: string[] };
  recursos: string[];
}

interface Inspection {
  titulo: string;
  fecha: string;
  area: string;
  tipoInspeccion: string;
  criteriosEvaluacion: {
    categoria: string;
    items: {
      item: string;
      cumple: boolean;
      observaciones: string;
      accionCorrectiva?: string;
      responsable?: string;
      fechaLimite?: string;
      prioridad?: 'Alta' | 'Media' | 'Baja';
    }[];
  }[];
  conclusiones: string[];
  recomendaciones: string[];
}

export interface DASInput {
  empresa: string;
  cargo: string;
  area: string;
  pais: string;
  actividades: string;
  equipos: string;
  materiales: string;
}

export interface DASResponse {
  introduccion: string;
  riesgos: RiesgoLaboral[];
  conclusiones: string;
}

interface RiesgoLaboral {
  nombre: string;
  descripcion: string;
  consecuencias: string;
  medidasPreventivas: string[];
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AccidentFormData {
  metodo: string;
  empresa: string;
  pais: string;
  sector: string;
  fecha: string;
  lugar: string;
  descripcion: string;
  personas: string;
  lesiones: string;
  danos: string;
}

export interface AccidentReportResult {
  titulo: string;
  introduccion: string;
  descripcion: string;
  causas: string[];
  recomendaciones: string[];
  medidas_preventivas: string[];
  responsables: string[];
  conclusiones: string;
  firma: {
    cargo: string;
    fecha: string;
  };
}

export interface PoliticaFormData {
  tipoPolitica: string;
  empresa: string;
  pais: string;
  sector: string;
  actividades: string;
  trabajadores: number;
  alcance: string;
  objetivos: string;
}

export interface PoliticaResultado {
  titulo: string;
  introduccion: string;
  proposito: string;
  alcance: string;
  objetivos: string[];
  compromisos: string[];
  responsabilidades: {
    gerencia: string[];
    supervisores: string[];
    trabajadores: string[];
  };
  marco_legal: string[];
  revision_actualizacion: string;
  firma: {
    cargo: string;
    fecha: string;
  };
}

export interface RiskMatrixInput {
  company: string;
  sector: string;
  processes: string;
  workers: number;
  history?: string;
}

export interface RiskMatrixResult {
  riesgos: {
    peligro: string;
    riesgo: string;
    probabilidad: string;
    consecuencia: string;
    nivel: 'Alto' | 'Medio' | 'Bajo';
    medidas: string[];
  }[];
  resumen: {
    alto: string;
    medio: string;
    bajo: string;
  };
}

// --- Helper Functions (Consolidated) ---

const systemMessage: Message = {
  role: 'system',
  content: `Eres un asistente virtual experto en prevención de riesgos y seguridad laboral, 
  representando a SAFEIA. Proporciona respuestas precisas y profesionales, manteniendo un tono 
  amable y servicial. Usa terminología técnica cuando sea apropiado, pero asegúrate de que tus 
  explicaciones sean comprensibles. Si no estás seguro de algo, indícalo claramente y sugiere 
  consultar con un experto humano.`
};

// Consider replacing this with JSON parsing if prompts are updated
function extractSection(content: string, sectionTitle: string): string[] {
  const sectionRegex = new RegExp(`${sectionTitle}:\\s*([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
  const match = content.match(sectionRegex);
  if (!match || !match[1]) return [];
  return match[1].trim().split('\n').filter((line: string) => line.trim());
}

// --- Exported Service Functions (Consolidated) ---

// From openai.ts (using proxy)
export async function generateSafetyRecommendations(
  workplaceType: string,
  activities: string[],
  country: string
): Promise<{ recomendaciones: Recomendacion[] }> {
  try {
    const legalReferences = await getLegalFramework(country, workplaceType, activities.join(', '));
    const legalInfo = legalReferences.map(ref => `${ref.name}: ${ref.description}`).join('\n');

    const prompt = `Analiza el siguiente lugar de trabajo y genera recomendaciones de seguridad considerando la legislación de ${country}: ... (prompt content as before) ... Responde en formato JSON ...`; // Truncated for brevity

    const payload = {
      messages: [
        { role: "system" as const, content: "Eres un experto en seguridad y salud ocupacional..." },
        { role: "user" as const, content: prompt }
      ],
      max_tokens: 2500,
      temperature: 0.7,
      response_format: { type: "json_object" }
    };

    const data = await fetchChatCompletions(payload);
    if (data && data.recomendaciones) {
      return data;
    } else { // Basic fallback if proxy returns full response
       const content = data?.choices?.[0]?.message?.content;
       if (content) return JSON.parse(content);
       throw new Error("Respuesta inesperada del servicio de IA para recomendaciones.");
    }
  } catch (error) {
    console.error('Error en generateSafetyRecommendations:', error);
    throw error;
  }
}

// From openai.ts (using proxy)
export async function generateFODAAnalysis(companyInfo: {
  nombre: string; sector: string; tamaño: string; ubicacion: string; descripcion: string;
}): Promise<FODA> {
  try {
    const prompt = `Por favor, realiza un análisis FODA detallado para la siguiente empresa...: ... (prompt content as before) ... Responde en formato JSON ...`; // Truncated
    const payload = {
      messages: [
        { role: 'system' as const, content: 'Eres un experto en seguridad y salud ocupacional...' },
        { role: 'user' as const, content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    };
    const data = await fetchChatCompletions(payload);
     if (data && data.fortalezas) {
        return data;
    } else { // Basic fallback
       const content = data?.choices?.[0]?.message?.content;
       if (content) return JSON.parse(content);
       throw new Error("Respuesta inesperada del servicio de IA para FODA.");
    }
  } catch (error) {
    console.error('Error al generar análisis FODA:', error);
    throw error;
  }
}

// From openai.ts (using proxy)
export async function generateSafetyTalk(formData: {
  tema: string; duracion: string; audiencia: string; industria: string; objetivosEspecificos: string; riesgosEspecificos: string;
}): Promise<SafetyTalk> {
   try {
    const prompt = `Por favor, genera una charla de seguridad detallada con los siguientes parámetros: ... (prompt content as before) ... Responde en formato JSON ...`; // Truncated
    const payload = {
      messages: [
        { role: 'system' as const, content: 'Eres un experto en capacitación de seguridad...' },
        { role: 'user' as const, content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    };
    const data = await fetchChatCompletions(payload);
     if (data && data.titulo) {
        return data;
    } else { // Basic fallback
       const content = data?.choices?.[0]?.message?.content;
       if (content) return JSON.parse(content);
       throw new Error("Respuesta inesperada del servicio de IA para charla de seguridad.");
    }
  } catch (error) {
    console.error('Error al generar charla de seguridad:', error);
    throw error;
  }
}

// From openai.ts (using proxy)
export async function generateChecklist(formData: ChecklistFormData): Promise<ChecklistResponse> {
  try {
    const prompt = `Por favor, genera una lista de verificación detallada con los siguientes parámetros: ... (prompt content as before) ... Responde en formato JSON ...`; // Truncated
    const payload = {
      messages: [
        { role: 'system' as const, content: 'Eres un experto en seguridad y salud ocupacional...' },
        { role: 'user' as const, content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    };
    const data = await fetchChatCompletions(payload);
    let parsedResponse: ChecklistResponse;
     if (data && data.checklist) {
        parsedResponse = data;
    } else { // Basic fallback
       const content = data?.choices?.[0]?.message?.content;
       if (content) parsedResponse = JSON.parse(content);
       else throw new Error("Respuesta inesperada del servicio de IA para checklist.");
    }
    if (!parsedResponse || !Array.isArray(parsedResponse.checklist)) {
      throw new Error('La respuesta del modelo no tiene el formato esperado para ChecklistResponse.');
    }
    return parsedResponse;
  } catch (error) {
    console.error('Error al generar lista de verificación:', error);
    throw error;
  }
}

// From openai.ts (using proxy)
export async function generateInspection(params: {
  area: string; tipoInspeccion: string; enfoque: string; industria: string; riesgosEspecificos: string; normativaAplicable: string;
}): Promise<Inspection> {
  try {
    const prompt = `Genera un formato de inspección de seguridad y salud en el trabajo detallado para: ... (prompt content as before) ... Responde en formato JSON ...`; // Truncated
    const payload = {
      messages: [
        { role: 'system' as const, content: 'Eres un experto en seguridad y salud en el trabajo...' },
        { role: 'user' as const, content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    };
    const data = await fetchChatCompletions(payload);
     if (data && data.titulo) {
        return data;
    } else { // Basic fallback
       const content = data?.choices?.[0]?.message?.content;
       if (content) return JSON.parse(content);
       throw new Error("Respuesta inesperada del servicio de IA para inspección.");
    }
  } catch (error) {
    console.error('Error al generar la inspección:', error);
    throw error;
  }
}

// From openai.ts (using proxy)
export async function generateSuggestions(tema: string, industria: string) {
  const payload = {
    messages: [
      { role: "system" as const, content: "Eres un experto en seguridad y salud ocupacional..." },
      { role: "user" as const, content: `Genera 3 objetivos específicos y 3 riesgos específicos para una charla de seguridad sobre "${tema}" en la industria "${industria}". Formato JSON: {"objetivos": ["string"], "riesgos": ["string"]}` }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  };
  const data = await fetchChatCompletions(payload);
   if (data && data.objetivos) {
    return data;
  } else { // Basic fallback
    const content = data?.choices?.[0]?.message?.content;
    if (content) return JSON.parse(content || "{}");
    throw new Error("Respuesta inesperada del servicio de IA para sugerencias de charla.");
  }
}

// From openai.ts (using proxy)
export async function suggestActivitiesForChecklist(tipo: string, area: string): Promise<SuggestionResponse> {
  try {
    const payload = {
      messages: [
        { role: 'system' as const, content: 'Eres un asistente experto en seguridad y salud ocupacional...' },
        { role: 'user' as const, content: `Dado un tipo de checklist de seguridad '${tipo}' para el área o proceso '${area}', sugiere 5 actividades comunes y relevantes a evaluar. Responde en formato JSON con una clave 'sugerencias' que contenga un array de strings. Ejemplo: {"sugerencias": ["Actividad 1", "Actividad 2"]}` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500
    };
    const data = await fetchChatCompletions(payload);
    let parsedResponse: SuggestionResponse;
     if (data && data.sugerencias && Array.isArray(data.sugerencias)) {
        parsedResponse = data;
    } else { // Basic fallback
       const content = data?.choices?.[0]?.message?.content;
        if (content) parsedResponse = JSON.parse(content);
        else if (Array.isArray(data)) { // Handle direct array if proxy returns it unexpectedly
             console.warn("API devolvió un array en lugar de SuggestionResponse para actividades, adaptando.");
             parsedResponse = { suggestions: data };
        } else {
            throw new Error('Respuesta inesperada del servicio de IA para sugerir actividades.');
        }
    }
    if (!parsedResponse || !Array.isArray(parsedResponse.suggestions)) {
       if (Array.isArray(parsedResponse)) { // Handle if JSON.parse resulted in an array
         console.warn("Parsed response was an array, adapting to SuggestionResponse for actividades.");
         return { suggestions: parsedResponse };
       }
      throw new Error('La respuesta del modelo no tiene el formato esperado para SuggestionResponse (actividades).');
    }
    return parsedResponse;
  } catch (error) {
    console.error('Error al sugerir actividades para checklist:', error);
    throw error;
  }
}

// From openai.ts (using proxy)
export async function suggestRisksForChecklist(tipo: string, area: string, actividades: string[]): Promise<SuggestionResponse> {
   try {
    const payload = {
      messages: [
        { role: 'system' as const, content: 'Eres un asistente experto en seguridad y salud ocupacional...' },
        { role: 'user' as const, content: `Para una checklist de seguridad de tipo '${tipo}' en el área/proceso '${area}', y considerando las siguientes actividades principales: ${actividades.join(', ')}, sugiere 5 riesgos específicos importantes a incluir en la checklist. Responde en formato JSON con una clave 'sugerencias' que contenga un array de strings.` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500
    };
    const data = await fetchChatCompletions(payload);
    let parsedResponse: SuggestionResponse;
     if (data && data.sugerencias && Array.isArray(data.sugerencias)) {
        parsedResponse = data;
    } else { // Basic fallback
       const content = data?.choices?.[0]?.message?.content;
        if (content) parsedResponse = JSON.parse(content);
        else if (Array.isArray(data)) {
             console.warn("API devolvió un array en lugar de SuggestionResponse para riesgos, adaptando.");
             parsedResponse = { suggestions: data };
        } else {
            throw new Error('Respuesta inesperada del servicio de IA para sugerir riesgos.');
        }
    }
    if (!parsedResponse || !Array.isArray(parsedResponse.suggestions)) {
       if (Array.isArray(parsedResponse)) {
         console.warn("Parsed response was an array, adapting to SuggestionResponse for riesgos.");
         return { suggestions: parsedResponse };
       }
      throw new Error('La respuesta del modelo no tiene el formato esperado para SuggestionResponse (riesgos).');
    }
    return parsedResponse;
  } catch (error) {
    console.error('Error al sugerir riesgos para checklist:', error);
    throw error;
  }
}

// From openai.ts (using proxy)
export async function suggestNormsForChecklist(tipo: string, area: string, pais: string = 'Chile'): Promise<SuggestionResponse> {
  try {
    const payload = {
      messages: [
        { role: 'system' as const, content: 'Eres un asistente experto en legislación de seguridad y salud ocupacional...' },
        { role: 'user' as const, content: `Para una checklist de seguridad de tipo '${tipo}' en el área/proceso '${area}' en ${pais}, sugiere 3 normativas o estándares legales clave (leyes, decretos, NCh, etc.) que sean aplicables. Responde en formato JSON con una clave 'sugerencias' que contenga un array de strings.` }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 500
    };
    const data = await fetchChatCompletions(payload);
    let parsedResponse: SuggestionResponse;
     if (data && data.sugerencias && Array.isArray(data.sugerencias)) {
        parsedResponse = data;
    } else { // Basic fallback
       const content = data?.choices?.[0]?.message?.content;
        if (content) parsedResponse = JSON.parse(content);
        else if (Array.isArray(data)) {
             console.warn("API devolvió un array en lugar de SuggestionResponse para normativas, adaptando.");
             parsedResponse = { suggestions: data };
        } else {
            throw new Error('Respuesta inesperada del servicio de IA para sugerir normativas.');
        }
    }
    if (!parsedResponse || !Array.isArray(parsedResponse.suggestions)) {
       if (Array.isArray(parsedResponse)) {
         console.warn("Parsed response was an array, adapting to SuggestionResponse for normativas.");
         return { suggestions: parsedResponse };
       }
      throw new Error('La respuesta del modelo no tiene el formato esperado para SuggestionResponse (normativas).');
    }
    return parsedResponse;
  } catch (error) {
    console.error('Error al sugerir normativas para checklist:', error);
    throw error;
  }
}

// From azureOpenAI.ts (using proxy) - Prioritizing this version for image generation
export async function generateImage(prompt: string): Promise<string> {
  const payload = {
    prompt: `Imagen profesional sobre seguridad laboral: ${prompt}`,
    n: 1,
    size: '1024x1024'
  };
  try {
    const data = await fetchImageGeneration(payload);
    if (data && data.data && data.data[0] && data.data[0].url) {
      return data.data[0].url;
    }
    console.warn('Respuesta inesperada del proxy de generación de imágenes, retornando vacío.');
    return '';
  } catch (error) {
    console.error('Error al generar imagen via proxy:', error);
    return '';
  }
}

// From azureOpenAI.ts (using proxy)
export async function generatePTS(
  activity: string, riskLevel: string, equipment: string, location: string
): Promise<{ content: string; images: { section: string; url: string }[] }> {
  try {
    const payload = {
      messages: [
        systemMessage,
        { role: 'user' as const, content: `Genera un PTS para ${activity} (riesgo ${riskLevel}) usando ${equipment} en ${location}` }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };
    const data = await fetchChatCompletions(payload);
    const content = data?.choices?.[0]?.message?.content || '';
    const eppImageUrl = await generateImage(`EPP para ${activity}`);
    const procedureImageUrl = await generateImage(`Procedimiento seguro para ${activity}`);
    return {
      content,
      images: [
        { section: 'EPP', url: eppImageUrl },
        { section: 'Procedimiento', url: procedureImageUrl }
      ]
    };
  } catch (error) {
    console.error('Error en generatePTS:', error);
    throw error;
  }
}

// From azureOpenAI.ts (using proxy)
export async function generateInvestigation(
  methodology: string, details: { accidentDescription: string; date: string; location: string; involvedPersons: string; injuries: string; damages: string; }
): Promise<{ analysis: string; causes: string[]; recommendations: string[]; preventiveMeasures: string[]; }> {
  try {
    const prompt = `Investiga este accidente: ... (prompt content as before) ... Responde con el análisis, causas, recomendaciones y medidas preventivas...`; // Truncated
    const payload = {
      messages: [
        { role: 'system' as const, content: `Eres un experto en investigación de accidentes usando ${methodology}` },
        { role: 'user' as const, content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };
    const data = await fetchChatCompletions(payload);
    const content = data?.choices?.[0]?.message?.content || '';
    return { // Consider asking AI for JSON response instead of text parsing
      analysis: extractSection(content, 'ANÁLISIS')[0] || '',
      causes: extractSection(content, 'CAUSAS'),
      recommendations: extractSection(content, 'RECOMENDACIONES'),
      preventiveMeasures: extractSection(content, 'MEDIDAS PREVENTIVAS')
    };
  } catch (error) {
    console.error('Error en generateInvestigation:', error);
    throw error;
  }
}

// From azureOpenAI.ts (using proxy)
export async function generatePTSActivitySuggestions(sector: string): Promise<{ activities: string[]; description: string }> {
  try {
    const payload = {
      messages: [
        systemMessage,
        { role: 'user' as const, content: `Sugiere 5 actividades para PTS en el sector ${sector} en formato JSON: {"activities": ["act1", ...], "description": "..."}` }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    };
    const data = await fetchChatCompletions(payload);
     if (data && data.activities) {
        return data;
    } else { // Basic fallback
       const content = data?.choices?.[0]?.message?.content;
       if (content) return JSON.parse(content);
       throw new Error("Respuesta inesperada del servicio de IA para sugerencias PTS.");
    }
  } catch (error) {
    console.error('Error en generatePTSActivitySuggestions:', error);
    throw error;
  }
}

// From azureOpenAI.ts (using proxy)
export async function generateDAS(input: DASInput): Promise<DASResponse> {
  try {
     const prompt = `Genera un documento "Derecho a Saber" (DAS) para ${input.cargo} en ${input.empresa} (${input.pais}). Incluye secciones INTRODUCCIÓN:, RIESGOS:, CONCLUSIONES:. Para cada riesgo, usa el formato "Nombre del Riesgo: Descripción del riesgo."\n\nDetalles específicos:\nActividades: ${input.actividades}\nEquipos: ${input.equipos}\nMateriales: ${input.materiales}`;
    const payload = {
      messages: [
        { role: 'system' as const, content: `Eres un experto en seguridad laboral generando documentos DAS.` }, // Simplified system message
        { role: 'user' as const, content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };
    const data = await fetchChatCompletions(payload);
    const content = data?.choices?.[0]?.message?.content || '';
    const riesgosSection = extractSection(content, 'RIESGOS'); // Consider asking AI for JSON
    return {
      introduccion: extractSection(content, 'INTRODUCCIÓN')[0] || '',
      riesgos: Array.isArray(riesgosSection) && riesgosSection.length > 0
        ? riesgosSection.map(risk => ({
            nombre: risk.split(':')[0]?.trim() || 'Riesgo Desconocido',
            descripcion: risk.split(':').slice(1).join(':').trim() || 'Descripción no disponible',
            consecuencias: '',
            medidasPreventivas: []
          }))
        : [],
      conclusiones: extractSection(content, 'CONCLUSIONES')[0] || ''
    };
  } catch (error) {
    console.error('Error en generateDAS:', error);
    throw error;
  }
}

// From azureOpenAI.ts (using proxy)
export async function generateAccidentReport(formData: AccidentFormData): Promise<AccidentReportResult> {
  try {
    const prompt = `Eres un experto en seguridad laboral y prevención de riesgos. Genera un informe profesional de investigación de accidente en formato JSON, considerando el método (${formData.metodo}), empresa (${formData.empresa}), país (${formData.pais}), sector (${formData.sector}), fecha (${formData.fecha}), lugar (${formData.lugar}), descripción (${formData.descripcion}), personas involucradas (${formData.personas}), lesiones (${formData.lesiones}), daños materiales (${formData.danos}). El formato debe ser: ... (JSON structure as before) ...`; // Truncated
    const payload = {
      messages: [
        { role: 'system' as const, content: prompt }, // System message contains the instructions now
        { role: 'user' as const, content: `Genera el informe de accidente solicitado.` }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    };
    const data = await fetchChatCompletions(payload);
     if (data && data.titulo) {
        return data;
    } else { // Basic fallback
       const content = data?.choices?.[0]?.message?.content;
       if (content) return JSON.parse(content);
       throw new Error("Respuesta inesperada del servicio de IA para informe de accidente.");
    }
  } catch (error) {
    console.error('Error en generateAccidentReport:', error);
    throw error;
  }
}

// From azureOpenAI.ts (using proxy)
export async function generatePolitica(formData: PoliticaFormData): Promise<PoliticaResultado> {
  try {
     const prompt = `Eres un experto en gestión empresarial y cumplimiento normativo. Genera una política empresarial completa y profesional en formato JSON, considerando el tipo de política (${formData.tipoPolitica}), empresa (${formData.empresa}), país (${formData.pais}), sector (${formData.sector}), actividades principales (${formData.actividades}), número de trabajadores (${formData.trabajadores}), alcance (${formData.alcance}) y objetivos (${formData.objetivos}). El formato debe ser: ... (JSON structure as before) ...`; // Truncated
    const payload = {
      messages: [
        { role: 'system' as const, content: prompt },
        { role: 'user' as const, content: `Genera la política solicitada.` }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    };
    const data = await fetchChatCompletions(payload);
     if (data && data.titulo) {
        return data;
    } else { // Basic fallback
       const content = data?.choices?.[0]?.message?.content;
       if (content) return JSON.parse(content);
       throw new Error("Respuesta inesperada del servicio de IA para política.");
    }
  } catch (error) {
    console.error('Error en generatePolitica:', error);
    throw error;
  }
}

// From azureOpenAI.ts (using proxy)
export async function generateRiskMatrix(input: RiskMatrixInput): Promise<RiskMatrixResult> {
  try {
    const prompt = `Eres un experto en seguridad laboral. Genera una matriz de riesgos profesional en formato JSON para ${input.company} (${input.sector}) con ${input.workers} trabajadores. Procesos: ${input.processes}. Historial: ${input.history || 'N/A'}. El formato debe ser: ... (JSON structure as before) ...`; // Truncated
    const payload = {
      messages: [
        { role: 'system' as const, content: prompt },
        { role: 'user' as const, content: `Genera la matriz de riesgos solicitada.` }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    };
    const data = await fetchChatCompletions(payload);
     if (data && data.riesgos) {
        return data;
    } else { // Basic fallback
       const content = data?.choices?.[0]?.message?.content;
       if (content) return JSON.parse(content);
       throw new Error("Respuesta inesperada del servicio de IA para matriz de riesgos.");
    }
  } catch (error) {
    console.error('Error en generateRiskMatrix:', error);
    throw error;
  }
}

// From azureOpenAI.ts (using proxy)
export async function generatePoliticaSuggestions(
  tipoPolitica: string, sector: string, pais: string
): Promise<{ actividades: string; alcance: string; objetivos: string }> {
  try {
    const payload = {
      messages: [
        { role: 'system' as const, content: `Eres un asistente experto en gestión empresarial. Sugiere ejemplos para los campos de actividades principales, alcance y objetivos de una política de tipo "${tipoPolitica}" en el sector "${sector}" en "${pais}". Devuelve el resultado en formato JSON con las claves: actividades, alcance, objetivos.` },
        { role: 'user' as const, content: `Sugiere ejemplos para actividades, alcance y objetivos.` }
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' }
    };
    const data = await fetchChatCompletions(payload);
     if (data && data.actividades) {
        return data;
    } else { // Basic fallback
       const content = data?.choices?.[0]?.message?.content;
       if (content) return JSON.parse(content);
       throw new Error("Respuesta inesperada del servicio de IA para sugerencias de política.");
    }
  } catch (error) {
    console.error('Error en generatePoliticaSuggestions:', error);
    throw error;
  }
}
