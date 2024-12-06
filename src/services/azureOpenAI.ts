import { OpenAIClient, AzureKeyCredential } from "@azure/openai";

const extractSection = (content: string, sectionTitle: string): string => {
  const sectionRegex = new RegExp(`${sectionTitle}:\\s*([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
  const match = content.match(sectionRegex);
  if (!match || !match[1]) return '';
  
  return match[1].trim();
};

const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT; // Corregido

const client = new OpenAIClient(
  endpoint,
  new AzureKeyCredential(apiKey)
);

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const systemMessage: Message = {
  role: 'system',
  content: `Eres un asistente virtual experto en prevención de riesgos y seguridad laboral, 
  representando a SAFEIA. Proporciona respuestas precisas y profesionales, manteniendo un tono 
  amable y servicial. Usa terminología técnica cuando sea apropiado, pero asegúrate de que tus 
  explicaciones sean comprensibles. Si no estás seguro de algo, indícalo claramente y sugiere 
  consultar con un experto humano.`
};

interface OpenAIResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

export async function generateImage(prompt: string): Promise<string> {
  const endpoint = import.meta.env.VITE_AZURE_DALLE_ENDPOINT;
  const apiKey = import.meta.env.VITE_AZURE_DALLE_API_KEY;
  const apiVersion = import.meta.env.VITE_AZURE_DALLE_API_VERSION;

  try {
    console.log('Generando imagen con DALL-E 3...');
    const url = `${endpoint}/openai/deployments/dall-e-3/images/generations?api-version=${apiVersion}`;
    console.log('URL:', url);
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey
        },
        body: JSON.stringify({
          prompt: `Genera una imagen profesional, clara y detallada para un procedimiento de trabajo seguro: ${prompt}. 
          El estilo debe ser ultrarealista, con énfasis en la seguridad laboral y buenas prácticas. 
          Incluye elementos de seguridad relevantes y señalización adecuada. 
          La imagen debe ser fácil de entender y seguir los estándares de seguridad industrial.`,
          n: 1,
          size: '1024x1024',
          quality: 'hd'
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Error Response:', {
        status: response.status,
        statusText: response.statusText,
        data: errorData
      });
      throw new Error(`Error en la API de DALL-E 3: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data = await response.json();
    console.log('Respuesta de DALL-E 3:', data);

    if (!data.data || !data.data[0] || !data.data[0].url) {
      console.error('Respuesta inesperada:', data);
      throw new Error('Formato de respuesta inválido de DALL-E 3');
    }

    return data.data[0].url;
  } catch (error) {
    console.error('Error completo generando imagen:', error);
    throw error;
  }
}

export async function generatePTS(
  activity: string,
  riskLevel: string,
  equipment: string,
  location: string
): Promise<{ content: string; images: { section: string; url: string }[] }> {
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  const systemPrompt = `Eres un experto en seguridad y salud ocupacional con más de 15 años de experiencia en la elaboración de procedimientos de trabajo seguro.
Tu objetivo es crear PTS detallados y prácticos que cumplan con las normativas internacionales de seguridad (ISO 45001, OHSAS) y la legislación local.
Debes ser minucioso en la identificación de riesgos y específico en las medidas de control.
Usa terminología técnica apropiada pero mantén las instrucciones claras y fáciles de seguir.
El formato debe ser estructurado y profesional, utilizando markdown para mejor legibilidad.`;

  const userPrompt = `Genera un Procedimiento de Trabajo Seguro (PTS) completo y detallado para la siguiente actividad:

INFORMACIÓN GENERAL:
- Actividad: ${activity}
- Nivel de Riesgo: ${riskLevel}
- Equipos/Herramientas: ${equipment}
- Ubicación: ${location}

El PTS debe seguir esta estructura específica:

# Procedimiento de Trabajo Seguro
## 1. Objetivo
- Definir el propósito específico del procedimiento
- Establecer el resultado esperado de la actividad

## 2. Alcance
- Delimitar las áreas y personal involucrado
- Especificar las limitaciones y exclusiones

## 3. Responsables
- Supervisor/Jefe directo: responsabilidades específicas
- Trabajadores: obligaciones y competencias requeridas
- Personal de apoyo: funciones complementarias
- Departamento de SST: rol en la supervisión

## 4. Equipos de Protección Personal (EPP)
- Lista detallada de EPP requerido
- Especificaciones técnicas de cada elemento
- Criterios de inspección y rechazo
- Vida útil y mantenimiento

## 5. Identificación de Peligros y Evaluación de Riesgos
- Peligros específicos de la actividad
- Evaluación de riesgos (probabilidad x consecuencia)
- Clasificación de riesgos
- Controles existentes

## 6. Medidas de Control
- Jerarquía de controles (eliminación, sustitución, controles de ingeniería, administrativos, EPP)
- Medidas preventivas específicas
- Puntos de verificación críticos

## 7. Procedimiento Paso a Paso
- Preparación previa
- Verificaciones iniciales
- Secuencia detallada de pasos
- Puntos de control y verificación
- Consideraciones especiales

## 8. Medidas de Emergencia
- Procedimientos de emergencia específicos
- Contactos de emergencia
- Rutas de evacuación
- Ubicación de equipos de emergencia
- Primeros auxilios específicos

## 9. Referencias Normativas
- Normativas aplicables (ISO, OHSAS)
- Legislación local relevante
- Estándares internos de la empresa
- Documentos relacionados

## 10. Control de Cambios y Aprobaciones
- Fecha de elaboración
- Responsable de la elaboración
- Fecha de revisión
- Próxima fecha de actualización

Asegúrate de:
1. Ser específico y detallado en cada sección
2. Incluir medidas preventivas concretas
3. Usar lenguaje claro y directo
4. Mantener un formato consistente
5. Incluir advertencias y notas importantes cuando sea necesario`;

  try {
    // Primero generamos el contenido del PTS
    const response = await fetch(
      `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: systemPrompt,
            },
            {
              role: 'user',
              content: userPrompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Error en la API de Chat: ${response.status} ${response.statusText} - ${errorData}`);
    }

    const data: OpenAIResponse = await response.json();
    const content = data.choices[0].message.content;

    try {
      // Generamos imágenes para las secciones clave
      const imageSections = [
        {
          section: "EPP",
          prompt: `Equipos de Protección Personal necesarios para: ${activity}. Incluir: ${equipment}`,
        },
        {
          section: "Procedimiento",
          prompt: `Trabajador realizando de manera segura: ${activity} en ${location}, usando ${equipment}`,
        },
        {
          section: "Emergencia",
          prompt: `Procedimiento de emergencia y evacuación para: ${activity} en ${location}`,
        },
      ];

      console.log('Iniciando generación de imágenes...');
      const images = await Promise.all(
        imageSections.map(async (section) => {
          try {
            const url = await generateImage(section.prompt);
            return { section: section.section, url };
          } catch (imgError) {
            console.error(`Error generando imagen para sección ${section.section}:`, imgError);
            return { section: section.section, url: '' };
          }
        })
      );

      return { content, images: images.filter(img => img.url !== '') };
    } catch (imageError) {
      console.error('Error en la generación de imágenes:', imageError);
      // Si hay error en las imágenes, devolvemos solo el contenido
      return { content, images: [] };
    }
  } catch (error) {
    console.error('Error completo generando PTS:', error);
    throw error;
  }
}

export async function generateInvestigation(
  methodology: string,
  details: {
    accidentDescription: string;
    date: string;
    location: string;
    involvedPersons: string;
    injuries: string;
    damages: string;
  }
): Promise<{
  analysis: string;
  causes: string[];
  recommendations: string[];
  preventiveMeasures: string[];
}> {
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  if (!apiKey || !endpoint || !deployment || !apiVersion) {
    console.error('Missing configuration:', { apiKey: !!apiKey, endpoint: !!endpoint, deployment: !!deployment, apiVersion: !!apiVersion });
    throw new Error('Azure OpenAI configuration is missing');
  }

  // Remove trailing slash from endpoint if present
  const baseEndpoint = endpoint.replace(/\/$/, '');

  const prompt = `
    Actúa como un experto en seguridad ocupacional realizando una investigación de accidente.
    Utiliza la metodología "${methodology}" para analizar el siguiente accidente:

    Descripción: ${details.accidentDescription}
    Fecha: ${details.date}
    Ubicación: ${details.location}
    Personas involucradas: ${details.involvedPersons}
    Lesiones: ${details.injuries}
    Daños materiales: ${details.damages}

    Por favor, proporciona tu respuesta en el siguiente formato:

    ANÁLISIS:
    [Proporciona un análisis detallado siguiendo la metodología especificada]

    CAUSAS:
    - [Lista de causas identificadas]

    RECOMENDACIONES:
    - [Lista de recomendaciones específicas]

    MEDIDAS PREVENTIVAS:
    - [Lista de medidas preventivas propuestas]
  `;

  try {
    console.log('Sending request to:', `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`);
    
    const response = await fetch(
      `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en seguridad ocupacional especializado en investigación de accidentes. Proporciona análisis detallados y recomendaciones prácticas basadas en metodologías establecidas.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: response.url
      });
      throw new Error(`Error en la API de Azure OpenAI: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API response:', data);
      throw new Error('Respuesta inválida de la API');
    }

    const content = data.choices[0].message.content;
    
    // Dividir el contenido en secciones
    const sections = content.split('\n\n');
    
    // Procesar cada sección
    const analysis = sections.find(s => s.startsWith('ANÁLISIS:'))?.replace('ANÁLISIS:', '').trim() || '';
    const causes = extractSection(content, 'CAUSAS:');
    const recommendations = extractSection(content, 'RECOMENDACIONES:');
    const preventiveMeasures = extractSection(content, 'MEDIDAS PREVENTIVAS:');
    
    return {
      analysis,
      causes,
      recommendations,
      preventiveMeasures,
    };
  } catch (error) {
    console.error('Error completo en generateInvestigation:', error);
    throw error;
  }
};

export async function generatePTSActivitySuggestions(sector: string): Promise<{ activities: string[]; description: string }> {
  const messages: Message[] = [
    systemMessage,
    {
      role: 'user',
      content: `Eres un experto en seguridad laboral. Para el sector "${sector}", genera exactamente 5 actividades diferentes que requieren un Procedimiento de Trabajo Seguro (PTS).

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido, sin markdown ni formato adicional.

El JSON debe tener esta estructura exacta:
{
  "activities": ["actividad 1", "actividad 2", "actividad 3", "actividad 4", "actividad 5"],
  "description": "descripción del sector"
}

Las actividades deben ser:
1. Específicas y detalladas
2. Variadas y no repetitivas
3. Incluir diferentes niveles de riesgo
4. Evitar generalidades
5. Relevantes para el sector`
    }
  ];

  try {
    const response = await client.getChatCompletions(deployment, messages, {
      temperature: 0.8,
      maxTokens: 800,
      topP: 0.9,
      frequencyPenalty: 0.5,
      presencePenalty: 0.5
    });
    
    const content = response.choices[0].message?.content || '';
    
    try {
      // Intentamos limpiar la respuesta de cualquier formato markdown
      const cleanContent = content
        .replace(/```json\s*/g, '')
        .replace(/```\s*$/g, '')
        .trim();
      
      const parsedContent = JSON.parse(cleanContent);
      
      // Validamos la estructura de la respuesta
      if (!parsedContent.activities || !Array.isArray(parsedContent.activities) || !parsedContent.description) {
        throw new Error('Formato de respuesta inválido');
      }
      
      return parsedContent;
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      throw new Error('Error al procesar la respuesta del servicio');
    }
  } catch (error) {
    console.error('Error generating PTS activity suggestions:', error);
    throw error;
  }
}

export async function generateDAS(input: DASInput): Promise<DASResponse> {
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT; // Corregido
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  if (!apiKey || !endpoint || !deployment || !apiVersion) {
    console.error('Missing configuration:', { apiKey: !!apiKey, endpoint: !!endpoint, deployment: !!deployment, apiVersion: !!apiVersion });
    throw new Error('Azure OpenAI configuration is missing');
  }

  const baseEndpoint = endpoint.replace(/\/$/, '');

  const messages = [
    {
      role: 'system',
      content: `Eres un experto en Seguridad y Salud en el Trabajo (SST). Tu tarea es generar un Derecho a Saber (DAS) detallado y profesional que incluya:
      1. Una introducción personalizada
      2. Identificación y análisis de riesgos laborales específicos
      3. Normativa SST aplicable según el país (${input.pais})
      4. Medidas preventivas concretas
      5. Conclusiones y recomendaciones
      
      El formato de tu respuesta debe ser EXACTAMENTE:
      
      INTRODUCCIÓN:
      [Texto de introducción]
      
      RIESGOS:
      - NOMBRE: [Nombre del riesgo]
      DESCRIPCIÓN: [Descripción del riesgo]
      CONSECUENCIAS: [Consecuencias del riesgo]
      MEDIDAS PREVENTIVAS:
      * [Medida 1]
      * [Medida 2]
      * [Medida 3]
      
      - NOMBRE: [Siguiente riesgo...]
      [...]
      
      CONCLUSIONES:
      [Texto de conclusiones]`
    },
    {
      role: 'user',
      content: `Por favor, genera un DAS completo para:
      - Empresa: ${input.empresa}
      - Cargo: ${input.cargo}
      - Área: ${input.area}
      - País: ${input.pais}
      - Actividades principales: ${input.actividades}
      - Equipos y herramientas: ${input.equipos}
      - Materiales y sustancias: ${input.materiales}
      
      Incluye la normativa SST aplicable en ${input.pais} y asegúrate de que las medidas preventivas cumplan con la legislación local.`
    }
  ];

  try {
    console.log('Enviando solicitud a Azure OpenAI:', {
      endpoint: baseEndpoint,
      deployment,
      apiVersion,
      messages
    });

    const response = await fetch(
      `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages,
          temperature: 0.7,
          max_tokens: 2500,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: response.url
      });
      throw new Error(`Error en la API de Azure OpenAI: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Respuesta de Azure OpenAI:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API response:', data);
      throw new Error('Respuesta inválida de la API');
    }

    const content = data.choices[0].message.content;

    // Extraer secciones
    const introduccionMatch = content.match(/INTRODUCCIÓN:\s*([\s\S]*?)(?=\n\s*RIESGOS:)/);
    const riesgosMatch = content.match(/RIESGOS:\s*([\s\S]*?)(?=\n\s*CONCLUSIONES:)/);
    const conclusionesMatch = content.match(/CONCLUSIONES:\s*([\s\S]*?)$/);

    if (!introduccionMatch || !riesgosMatch || !conclusionesMatch) {
      console.error('No se pudieron extraer todas las secciones:', { content });
      throw new Error('El formato de la respuesta no es válido');
    }

    // Procesar riesgos
    const riesgosText = riesgosMatch[1];
    const riesgos: RiesgoLaboral[] = [];
    
    // Dividir los riesgos individuales
    const riesgosIndividuales = riesgosText.split(/(?=\s*-\s*NOMBRE:)/);
    
    for (const riesgoText of riesgosIndividuales) {
      if (!riesgoText.trim()) continue;

      const nombreMatch = riesgoText.match(/NOMBRE:\s*([^\n]*)/);
      const descripcionMatch = riesgoText.match(/DESCRIPCIÓN:\s*([^\n]*)/);
      const consecuenciasMatch = riesgoText.match(/CONSECUENCIAS:\s*([^\n]*)/);
      const medidasMatch = riesgoText.match(/MEDIDAS PREVENTIVAS:\s*([\s\S]*?)(?=\s*$|\s*-\s*NOMBRE:)/);

      if (nombreMatch && descripcionMatch && consecuenciasMatch && medidasMatch) {
        const medidas = medidasMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('*'))
          .map(line => line.replace(/^\s*\*\s*/, '').trim());

        riesgos.push({
          nombre: nombreMatch[1].trim(),
          descripcion: descripcionMatch[1].trim(),
          consecuencias: consecuenciasMatch[1].trim(),
          medidasPreventivas: medidas,
        });
      }
    }

    return {
      introduccion: introduccionMatch[1].trim(),
      riesgos,
      conclusiones: conclusionesMatch[1].trim(),
    };
  } catch (error) {
    console.error('Error completo en generateDAS:', error);
    throw error;
  }
};

interface JobSuggestions {
  actividades: string;
  equipos: string;
  materiales: string;
}

export const generateJobSuggestions = async (cargo: string): Promise<JobSuggestions> => {
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  if (!apiKey || !endpoint || !deployment || !apiVersion) {
    console.error('Missing configuration:', { apiKey: !!apiKey, endpoint: !!endpoint, deployment: !!deployment, apiVersion: !!apiVersion });
    throw new Error('Azure OpenAI configuration is missing');
  }

  const baseEndpoint = endpoint.replace(/\/$/, '');

  const prompt = `
    Actúa como un experto en seguridad y salud ocupacional. Para el siguiente cargo:
    "${cargo}"

    Por favor, proporciona información detallada sobre:

    1. ACTIVIDADES PRINCIPALES:
    Lista las principales actividades y responsabilidades típicas de este puesto.

    2. EQUIPOS Y HERRAMIENTAS:
    Lista los equipos, herramientas y maquinaria comúnmente utilizados en este puesto.

    3. MATERIALES Y SUSTANCIAS:
    Lista los materiales, sustancias y productos químicos que típicamente se manejan en este puesto.

    Proporciona la información en un formato claro y conciso, enfocándote en los aspectos más relevantes para la seguridad ocupacional.
  `;

  try {
    const response = await fetch(
      `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'Eres un experto en seguridad y salud ocupacional con amplio conocimiento en diferentes industrias y puestos de trabajo.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: response.url
      });
      throw new Error(`Error en la API de Azure OpenAI: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API response:', data);
      throw new Error('Respuesta inválida de la API');
    }

    const content = data.choices[0].message.content;

    // Extraer las secciones
    const actividadesMatch = content.match(/ACTIVIDADES PRINCIPALES:([\s\S]*?)(?=EQUIPOS Y HERRAMIENTAS:|$)/i);
    const equiposMatch = content.match(/EQUIPOS Y HERRAMIENTAS:([\s\S]*?)(?=MATERIALES Y SUSTANCIAS:|$)/i);
    const materialesMatch = content.match(/MATERIALES Y SUSTANCIAS:([\s\S]*?)$/i);

    return {
      actividades: actividadesMatch ? actividadesMatch[1].trim() : '',
      equipos: equiposMatch ? equiposMatch[1].trim() : '',
      materiales: materialesMatch ? materialesMatch[1].trim() : ''
    };
  } catch (error) {
    console.error('Error completo en generateJobSuggestions:', error);
    throw error;
  }
};

export interface PoliticaInput {
  tipoPolitica: string;
  empresa: string;
  pais: string;
  sector: string;
  actividades: string;
  trabajadores: number;
  alcance: string;
  objetivos: string;
}

export interface PoliticaResponse {
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

const getPoliticaPrompt = (tipoPolitica: string): string => {
  const prompts = {
    sst: `Eres un experto en Seguridad y Salud en el Trabajo (SST) especializado en la creación de políticas de SST.
      Tu tarea es generar una política de SST completa y profesional que cumpla con los estándares internacionales (ISO 45001) 
      y la legislación local.`,
    
    medioambiente: `Eres un experto en Gestión Ambiental especializado en la creación de políticas ambientales.
      Tu tarea es generar una política ambiental completa y profesional que cumpla con los estándares internacionales (ISO 14001) 
      y la legislación local. Enfócate en la protección del medio ambiente, prevención de la contaminación y uso sostenible de recursos.`,
    
    calidad: `Eres un experto en Gestión de Calidad especializado en la creación de políticas de calidad.
      Tu tarea es generar una política de calidad completa y profesional que cumpla con los estándares internacionales (ISO 9001) 
      y mejores prácticas. Enfócate en la mejora continua, satisfacción del cliente y excelencia operacional.`,
    
    security: `Eres un experto en Seguridad de la Información especializado en la creación de políticas de seguridad informática.
      Tu tarea es generar una política de seguridad de la información completa y profesional que cumpla con los estándares internacionales (ISO 27001) 
      y mejores prácticas. Enfócate en la confidencialidad, integridad y disponibilidad de la información.`,
    
    integrado: `Eres un experto en Sistemas Integrados de Gestión especializado en la creación de políticas integradas.
      Tu tarea es generar una política integrada que cubra Calidad (ISO 9001), Medio Ambiente (ISO 14001), y Seguridad y Salud en el Trabajo (ISO 45001).
      La política debe ser completa, profesional y alineada con los requisitos de las tres normas.`
  };

  return prompts[tipoPolitica as keyof typeof prompts] || prompts.sst;
};

export const generatePolitica = async (input: PoliticaInput): Promise<PoliticaResponse> => {
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT; // Corregido
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  if (!apiKey || !endpoint || !deployment || !apiVersion) {
    console.error('Missing configuration:', { apiKey: !!apiKey, endpoint: !!endpoint, deployment: !!deployment, apiVersion: !!apiVersion });
    throw new Error('Azure OpenAI configuration is missing');
  }

  const baseEndpoint = endpoint.replace(/\/$/, '');
  const systemPrompt = getPoliticaPrompt(input.tipoPolitica);

  const messages = [
    {
      role: 'system',
      content: `${systemPrompt}
      El formato de tu respuesta debe ser EXACTAMENTE:

      TITULO:
      [Título formal del documento]

      INTRODUCCION:
      [Texto de introducción]

      PROPOSITO:
      [Texto del propósito]

      ALCANCE:
      [Texto del alcance]

      OBJETIVOS:
      * [Objetivo 1]
      * [Objetivo 2]
      * [...]

      COMPROMISOS:
      * [Compromiso 1]
      * [Compromiso 2]
      * [...]

      RESPONSABILIDADES:
      GERENCIA:
      * [Responsabilidad 1]
      * [Responsabilidad 2]
      * [...]

      SUPERVISORES:
      * [Responsabilidad 1]
      * [Responsabilidad 2]
      * [...]

      TRABAJADORES:
      * [Responsabilidad 1]
      * [Responsabilidad 2]
      * [...]

      MARCO_LEGAL:
      * [Referencia legal 1]
      * [Referencia legal 2]
      * [...]

      REVISION_ACTUALIZACION:
      [Texto sobre revisión y actualización]

      FIRMA:
      CARGO: [Cargo del firmante]
      FECHA: [Fecha de emisión]`
    },
    {
      role: 'user',
      content: `Por favor, genera una política completa para:
      - Tipo de Política: ${input.tipoPolitica}
      - Empresa: ${input.empresa}
      - País: ${input.pais}
      - Sector: ${input.sector}
      - Actividades principales: ${input.actividades}
      - Número de trabajadores: ${input.trabajadores}
      - Alcance deseado: ${input.alcance}
      - Objetivos específicos: ${input.objetivos}`
    }
  ];

  try {
    console.log('Enviando solicitud a Azure OpenAI:', {
      endpoint: baseEndpoint,
      deployment,
      apiVersion,
      messages
    });

    const response = await fetch(
      `${baseEndpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages,
          temperature: 0.7,
          max_tokens: 2500,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error response:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: response.url
      });
      throw new Error(`Error en la API de Azure OpenAI: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Respuesta de Azure OpenAI:', data);

    if (!data.choices?.[0]?.message?.content) {
      console.error('Invalid API response:', data);
      throw new Error('Respuesta inválida de la API');
    }

    const content = data.choices[0].message.content;

    // Extraer secciones
    const tituloMatch = content.match(/TITULO:\s*([\s\S]*?)(?=\n\s*INTRODUCCION:)/);
    const introduccionMatch = content.match(/INTRODUCCION:\s*([\s\S]*?)(?=\n\s*PROPOSITO:)/);
    const propositoMatch = content.match(/PROPOSITO:\s*([\s\S]*?)(?=\n\s*ALCANCE:)/);
    const alcanceMatch = content.match(/ALCANCE:\s*([\s\S]*?)(?=\n\s*OBJETIVOS:)/);
    const objetivosMatch = content.match(/OBJETIVOS:\s*([\s\S]*?)(?=\n\s*COMPROMISOS:)/);
    const compromisosMatch = content.match(/COMPROMISOS:\s*([\s\S]*?)(?=\n\s*RESPONSABILIDADES:)/);
    const responsabilidadesMatch = content.match(/RESPONSABILIDADES:\s*([\s\S]*?)(?=\n\s*MARCO_LEGAL:)/);
    const marcoLegalMatch = content.match(/MARCO_LEGAL:\s*([\s\S]*?)(?=\n\s*REVISION_ACTUALIZACION:)/);
    const revisionMatch = content.match(/REVISION_ACTUALIZACION:\s*([\s\S]*?)(?=\n\s*FIRMA:)/);
    const firmaMatch = content.match(/FIRMA:\s*([\s\S]*?)$/);

    if (!tituloMatch || !introduccionMatch || !propositoMatch || !alcanceMatch || !objetivosMatch || 
        !compromisosMatch || !responsabilidadesMatch || !marcoLegalMatch || !revisionMatch || !firmaMatch) {
      console.error('No se pudieron extraer todas las secciones:', { content });
      throw new Error('El formato de la respuesta no es válido');
    }

    // Procesar listas
    const extractList = (text: string) => text
      .split('\n')
      .filter(line => line.trim().startsWith('*'))
      .map(line => line.replace(/^\s*\*\s*/, '').trim());

    // Procesar responsabilidades
    const respText = responsabilidadesMatch[1];
    const gerenciaMatch = respText.match(/GERENCIA:\s*([\s\S]*?)(?=\n\s*SUPERVISORES:)/);
    const supervisoresMatch = respText.match(/SUPERVISORES:\s*([\s\S]*?)(?=\n\s*TRABAJADORES:)/);
    const trabajadoresMatch = respText.match(/TRABAJADORES:\s*([\s\S]*?)$/);

    // Procesar firma
    const firmaText = firmaMatch[1];
    const cargoMatch = firmaText.match(/CARGO:\s*([^\n]*)/);
    const fechaMatch = firmaText.match(/FECHA:\s*([^\n]*)/);

    return {
      titulo: tituloMatch[1].trim(),
      introduccion: introduccionMatch[1].trim(),
      proposito: propositoMatch[1].trim(),
      alcance: alcanceMatch[1].trim(),
      objetivos: extractList(objetivosMatch[1]),
      compromisos: extractList(compromisosMatch[1]),
      responsabilidades: {
        gerencia: extractList(gerenciaMatch ? gerenciaMatch[1] : ''),
        supervisores: extractList(supervisoresMatch ? supervisoresMatch[1] : ''),
        trabajadores: extractList(trabajadoresMatch ? trabajadoresMatch[1] : ''),
      },
      marco_legal: extractList(marcoLegalMatch[1]),
      revision_actualizacion: revisionMatch[1].trim(),
      firma: {
        cargo: cargoMatch ? cargoMatch[1].trim() : '',
        fecha: fechaMatch ? fechaMatch[1].trim() : '',
      },
    };
  } catch (error) {
    console.error('Error completo en generatePolitica:', error);
    throw error;
  }
};

export interface PoliticaSuggestions {
  actividades: string;
  alcance: string;
  objetivos: string;
}

export const generatePoliticaSuggestions = async (
  tipoPolitica: string,
  sector: string,
  pais: string
): Promise<PoliticaSuggestions> => {
  if (!endpoint || !apiKey || !deployment) {
    throw new Error('Faltan variables de entorno necesarias para Azure OpenAI');
  }

  const messages = [
    {
      role: 'system',
      content: `Eres un experto en sistemas de gestión y políticas empresariales. 
      Tu tarea es sugerir contenido relevante para una política ${tipoPolitica === 'sst' ? 'de SST' : 
      tipoPolitica === 'medioambiente' ? 'ambiental' : 
      tipoPolitica === 'calidad' ? 'de calidad' : 
      tipoPolitica === 'security' ? 'de seguridad de la información' : 
      'integrada'} en el sector ${sector} para ${pais}.
      
      Proporciona sugerencias específicas y relevantes para:
      1. Actividades principales típicas del sector
      2. Alcance común de la política
      3. Objetivos específicos recomendados
      
      Las sugerencias deben ser realistas, prácticas y alineadas con las normativas locales y estándares internacionales.
      
      IMPORTANTE: Tu respuesta debe seguir EXACTAMENTE este formato:
      
      ACTIVIDADES:
      [Texto sugerido para las actividades principales]

      ALCANCE:
      [Texto sugerido para el alcance]

      OBJETIVOS:
      [Texto sugerido para los objetivos]`
    },
    {
      role: 'user',
      content: `Por favor, genera sugerencias para una política ${tipoPolitica} en el sector ${sector} para ${pais}.`
    }
  ];

  try {
    const client = new OpenAIClient(endpoint, new AzureKeyCredential(apiKey));
    const response = await client.getChatCompletions(deployment, messages, {
      temperature: 0.7,
      maxTokens: 1000,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No se recibió respuesta del servicio de Azure OpenAI');
    }

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('La respuesta no contiene contenido válido');
    }

    console.log('Respuesta completa:', content);

    // Extraer las secciones del contenido
    const actividades = extractSection(content, 'ACTIVIDADES');
    const alcance = extractSection(content, 'ALCANCE');
    const objetivos = extractSection(content, 'OBJETIVOS');

    // Verificar que tenemos todas las secciones
    if (!actividades || !alcance || !objetivos) {
      console.error('Secciones extraídas:', { actividades, alcance, objetivos });
      throw new Error('No se pudieron extraer todas las secciones necesarias de la respuesta');
    }

    return {
      actividades,
      alcance,
      objetivos
    };
  } catch (error) {
    console.error('Error generando sugerencias:', error);
    if (error instanceof Error) {
      throw new Error(`Error al generar sugerencias: ${error.message}`);
    } else {
      throw new Error('Error desconocido al generar sugerencias');
    }
  }
};