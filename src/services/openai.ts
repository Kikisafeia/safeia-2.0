import OpenAI from 'openai';
import { searchLegalInformation } from './perplexity';

const openai = new OpenAI({
    apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY,
    baseURL: `${import.meta.env.VITE_AZURE_OPENAI_ENDPOINT}/openai/deployments/${import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT}`,
    defaultQuery: { 'api-version': import.meta.env.VITE_AZURE_OPENAI_API_VERSION },
    defaultHeaders: { 'api-key': import.meta.env.VITE_AZURE_OPENAI_API_KEY },
    dangerouslyAllowBrowser: true
});

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

interface Checklist {
  categoria: string;
  items: {
    descripcion: string;
    criterios: string[];
    normativa?: string;
    riesgoAsociado?: string;
  }[];
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

export async function generateSafetyRecommendations(
  workplaceType: string,
  activities: string[],
  country: string
): Promise<{ recomendaciones: Recomendacion[] }> {
  try {
    // Primero, obtener información legal específica del país
    const legalInfo = await searchLegalInformation(country, workplaceType);

    const prompt = `Analiza el siguiente lugar de trabajo y genera recomendaciones de seguridad considerando la legislación de ${country}:

Tipo de lugar: ${workplaceType}
País: ${country}
Actividades principales:
${activities.map((act, i) => `${i + 1}. ${act}`).join('\n')}

Información legal específica del país:
${legalInfo}

Proporciona recomendaciones detalladas considerando:
1. Riesgos específicos del lugar de trabajo
2. Medidas preventivas según la normativa local
3. EPP requerido según estándares nacionales
4. Normativa aplicable específica de ${country}
5. Mejores prácticas de seguridad adaptadas al contexto local

Responde en formato JSON con la siguiente estructura:
{
  "recomendaciones": [
    {
      "categoria": string,
      "descripcion": string,
      "prioridad": "Alta" | "Media" | "Baja",
      "acciones": string[],
      "normativa": string,
      "legislacionLocal": string,
      "fuentesLegales": string[]
    }
  ]
}

Asegúrate de incluir referencias específicas a la legislación y normativas de seguridad y salud ocupacional vigentes en ${country}, utilizando la información legal proporcionada.`;

    const response = await fetch(
      `${import.meta.env.VITE_AZURE_OPENAI_ENDPOINT}/openai/deployments/${
        import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT
      }/chat/completions?api-version=${import.meta.env.VITE_AZURE_OPENAI_API_VERSION}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': import.meta.env.VITE_AZURE_OPENAI_API_KEY
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: "Eres un experto en seguridad y salud ocupacional especializado en análisis de lugares de trabajo y recomendaciones de seguridad, con amplio conocimiento de la legislación y normativas de diferentes países."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 2500,
          temperature: 0.7
        })
      }
    );

    if (!response.ok) {
      throw new Error('Error al generar recomendaciones');
    }

    const data = await response.json();
    
    // Extraer el JSON de la respuesta
    let content = data.choices[0].message.content;
    if (content.includes('```json')) {
      content = content.replace(/```json\n|\n```/g, '');
    } else if (content.includes('```')) {
      content = content.replace(/```\n|\n```/g, '');
    }
    
    return JSON.parse(content);
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Error al generar las recomendaciones');
  }
}

export async function generateFODAAnalysis(companyInfo: {
  nombre: string;
  sector: string;
  tamaño: string;
  ubicacion: string;
  descripcion: string;
}): Promise<FODA> {
  try {
    const messages = [
      { role: 'system', content: 'Eres un experto en seguridad y salud ocupacional, especializado en análisis FODA para sistemas de gestión de SST.' },
      { role: 'user', content: `Por favor, realiza un análisis FODA detallado para la siguiente empresa en términos de seguridad y salud ocupacional:

Empresa: ${companyInfo.nombre}
Sector: ${companyInfo.sector}
Tamaño: ${companyInfo.tamaño}
Ubicación: ${companyInfo.ubicacion}
Actividades principales: ${companyInfo.descripcion}

Genera un análisis FODA que incluya:
1. Fortalezas: aspectos internos positivos en SST
2. Oportunidades: factores externos que pueden mejorar la SST
3. Debilidades: aspectos internos a mejorar en SST
4. Amenazas: factores externos que pueden afectar la SST

Para cada elemento, incluye:
- Descripción detallada
- Nivel de impacto (Alto, Medio, Bajo)
- Acciones recomendadas

Responde en formato JSON siguiendo esta estructura:
{
  "fortalezas": [{"descripcion": "", "impacto": "", "acciones": []}],
  "oportunidades": [{"descripcion": "", "impacto": "", "acciones": []}],
  "debilidades": [{"descripcion": "", "impacto": "", "acciones": []}],
  "amenazas": [{"descripcion": "", "impacto": "", "acciones": []}]
}` }
    ];

    const result = await openai.chat.completions.create({
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = result.choices[0]?.message?.content;
    if (!content) throw new Error('No se recibió respuesta del modelo');

    return JSON.parse(content);
  } catch (error) {
    console.error('Error al generar análisis FODA:', error);
    throw error;
  }
}

export async function generateSafetyTalk(formData: {
  tema: string;
  duracion: string;
  audiencia: string;
  industria: string;
  objetivosEspecificos: string;
  riesgosEspecificos: string;
}): Promise<SafetyTalk> {
  try {
    const messages = [
      { role: 'system', content: 'Eres un experto en capacitación de seguridad y salud ocupacional, especializado en crear charlas de seguridad efectivas y motivadoras.' },
      { role: 'user', content: `Por favor, genera una charla de seguridad detallada con los siguientes parámetros:

Tema: ${formData.tema}
Duración: ${formData.duracion} minutos
Audiencia: ${formData.audiencia}
Industria: ${formData.industria}
Objetivos específicos: ${formData.objetivosEspecificos}
Riesgos específicos: ${formData.riesgosEspecificos}

La charla debe incluir:
1. Título llamativo
2. Objetivos claros
3. Introducción motivadora
4. Contenido estructurado con puntos clave y ejemplos
5. Actividades prácticas
6. Conclusiones
7. Preguntas de evaluación con respuestas
8. Recursos adicionales

Responde en formato JSON siguiendo esta estructura:
{
  "titulo": "",
  "duracion": "",
  "objetivos": [],
  "introduccion": "",
  "contenido": [{"tema": "", "puntosClave": [], "ejemplos": []}],
  "actividades": [{"descripcion": "", "duracion": "", "materiales": []}],
  "conclusiones": [],
  "evaluacion": {"preguntas": [], "respuestasEsperadas": []},
  "recursos": []
}` }
    ];

    const result = await openai.chat.completions.create({
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = result.choices[0]?.message?.content;
    if (!content) throw new Error('No se recibió respuesta del modelo');

    return JSON.parse(content);
  } catch (error) {
    console.error('Error al generar charla de seguridad:', error);
    throw error;
  }
}

export async function generateChecklist(formData: {
  tipo: string;
  area: string;
  actividades: string[];
  riesgosEspecificos: string;
  normativasAplicables: string;
}): Promise<{
  checklist: Checklist[];
}> {
  try {
    const messages = [
      { role: 'system', content: 'Eres un experto en seguridad y salud ocupacional, especializado en crear listas de verificación detalladas y efectivas para evaluar condiciones de seguridad.' },
      { role: 'user', content: `Por favor, genera una lista de verificación detallada con los siguientes parámetros:

Tipo: ${formData.tipo}
Área: ${formData.area}
Actividades a evaluar:
${formData.actividades.map((act, i) => `${i + 1}. ${act}`).join('\n')}

Riesgos específicos:
${formData.riesgosEspecificos}

Normativas aplicables:
${formData.normativasAplicables}

La lista de verificación debe:
1. Estar organizada por categorías relevantes
2. Incluir criterios específicos de evaluación
3. Referenciar normativas cuando aplique
4. Identificar riesgos asociados
5. Ser práctica y fácil de usar

Responde en formato JSON siguiendo esta estructura:
{
  "checklist": [
    {
      "categoria": "",
      "items": [
        {
          "descripcion": "",
          "criterios": [],
          "normativa": "",
          "riesgoAsociado": ""
        }
      ]
    }
  ]
}` }
    ];

    const result = await openai.chat.completions.create({
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000
    });

    const content = result.choices[0]?.message?.content;
    if (!content) throw new Error('No se recibió respuesta del modelo');

    return JSON.parse(content);
  } catch (error) {
    console.error('Error al generar lista de verificación:', error);
    throw error;
  }
}

export async function generateInspection(params: {
  area: string;
  tipoInspeccion: string;
  enfoque: string;
  industria: string;
  riesgosEspecificos: string;
  normativaAplicable: string;
}) {
  try {
    const prompt = `Genera un formato de inspección de seguridad y salud en el trabajo detallado para:
    
Área: ${params.area}
Tipo de Inspección: ${params.tipoInspeccion}
Industria: ${params.industria}
Enfoque: ${params.enfoque}
Riesgos Específicos: ${params.riesgosEspecificos}
Normativa Aplicable: ${params.normativaAplicable}

El formato debe incluir:
1. Título descriptivo
2. Fecha actual
3. Criterios de evaluación organizados por categorías
4. Items específicos para cada categoría con:
   - Descripción del item
   - Estado de cumplimiento
   - Observaciones
   - Acciones correctivas (si aplica)
   - Responsable (si aplica)
   - Fecha límite (si aplica)
   - Prioridad (si aplica)
5. Conclusiones
6. Recomendaciones

Responde en formato JSON con la siguiente estructura:
{
  "titulo": string,
  "fecha": string,
  "area": string,
  "tipoInspeccion": string,
  "criteriosEvaluacion": [{
    "categoria": string,
    "items": [{
      "item": string,
      "cumple": boolean,
      "observaciones": string,
      "accionCorrectiva": string (opcional),
      "responsable": string (opcional),
      "fechaLimite": string (opcional),
      "prioridad": "Alta" | "Media" | "Baja" (opcional)
    }]
  }],
  "conclusiones": string[],
  "recomendaciones": string[]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en seguridad y salud en el trabajo, especializado en la creación de formatos de inspección detallados y profesionales.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No se recibió respuesta del modelo');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('Error al generar la inspección:', error);
    throw error;
  }
}

export { openai };
