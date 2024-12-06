import { OpenAIClient, AzureKeyCredential } from '@azure/openai';

const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;

if (!apiKey || !endpoint || !deployment) {
  throw new Error('Azure OpenAI credentials not found in environment variables');
}

const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));

export interface AIResponse {
  content: string;
  error?: string;
}

export const generateSSTRecommendation = async (
  context: string,
  query: string
): Promise<AIResponse> => {
  try {
    const messages = [
      { role: 'system', content: 'Eres un experto en seguridad y salud en el trabajo, especializado en brindar recomendaciones prácticas y efectivas para mejorar la seguridad laboral en pequeñas y medianas empresas.' },
      { role: 'user', content: `Contexto: ${context}\n\nConsulta: ${query}` }
    ];

    const result = await client.getChatCompletions(deployment, messages);
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error('No se recibió respuesta del modelo');
    }

    return {
      content: result.choices[0].message?.content || 'No se pudo generar una recomendación'
    };
  } catch (error) {
    console.error('Error al generar recomendación:', error);
    return {
      content: '',
      error: 'Error al generar la recomendación. Por favor, intente nuevamente.'
    };
  }
};

export const generateSafetyProcedure = async (
  taskDescription: string,
  industry: string
): Promise<AIResponse> => {
  try {
    const messages = [
      { role: 'system', content: 'Eres un especialista en procedimientos de trabajo seguro, capaz de crear procedimientos detallados y efectivos que garanticen la seguridad de los trabajadores.' },
      { role: 'user', content: `Tarea: ${taskDescription}\nIndustria: ${industry}\n\nPor favor, genera un procedimiento de trabajo seguro detallado que incluya:\n1. Objetivo\n2. Alcance\n3. Responsabilidades\n4. EPP requerido\n5. Pasos del procedimiento\n6. Medidas de control\n7. Acciones en caso de emergencia` }
    ];

    const result = await client.getChatCompletions(deployment, messages);
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error('No se recibió respuesta del modelo');
    }

    return {
      content: result.choices[0].message?.content || 'No se pudo generar el procedimiento'
    };
  } catch (error) {
    console.error('Error al generar procedimiento:', error);
    return {
      content: '',
      error: 'Error al generar el procedimiento. Por favor, intente nuevamente.'
    };
  }
};

export const generateSafetyTalk = async (
  topic: string,
  duration: number,
  audience: string
): Promise<AIResponse> => {
  try {
    const messages = [
      { role: 'system', content: 'Eres un experto en capacitación de seguridad y salud ocupacional, especializado en crear charlas de seguridad efectivas y motivadoras.' },
      { role: 'user', content: `Tema: ${topic}\nDuración: ${duration} minutos\nAudiencia: ${audience}\n\nPor favor, genera una charla de seguridad que incluya:\n1. Introducción\n2. Objetivos\n3. Contenido principal\n4. Ejemplos prácticos\n5. Preguntas para discusión\n6. Conclusiones\n7. Evaluación de comprensión` }
    ];

    const result = await client.getChatCompletions(deployment, messages);
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error('No se recibió respuesta del modelo');
    }

    return {
      content: result.choices[0].message?.content || 'No se pudo generar la charla'
    };
  } catch (error) {
    console.error('Error al generar charla:', error);
    return {
      content: '',
      error: 'Error al generar la charla. Por favor, intente nuevamente.'
    };
  }
};

export const analyzeSafetyTask = async (
  taskDescription: string,
  environment: string,
  workers: number
): Promise<AIResponse> => {
  try {
    const messages = [
      { role: 'system', content: 'Eres un analista de seguridad especializado en identificar riesgos y establecer medidas de control para trabajos específicos.' },
      { role: 'user', content: `Tarea: ${taskDescription}\nEntorno: ${environment}\nTrabajadores involucrados: ${workers}\n\nPor favor, realiza un análisis de trabajo seguro que incluya:\n1. Descripción de la tarea\n2. Identificación de peligros\n3. Evaluación de riesgos\n4. Medidas de control\n5. EPP requerido\n6. Permisos necesarios\n7. Procedimientos de emergencia` }
    ];

    const result = await client.getChatCompletions(deployment, messages);
    
    if (!result.choices || result.choices.length === 0) {
      throw new Error('No se recibió respuesta del modelo');
    }

    return {
      content: result.choices[0].message?.content || 'No se pudo generar el análisis'
    };
  } catch (error) {
    console.error('Error al generar análisis:', error);
    return {
      content: '',
      error: 'Error al generar el análisis. Por favor, intente nuevamente.'
    };
  }
};
