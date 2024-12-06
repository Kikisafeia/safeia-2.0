import { generateImage } from './azureOpenAI';

interface InvestigationResponse {
  content: string;
  images: {
    section: string;
    url: string;
  }[];
  sections: {
    title: string;
    content: string;
    imageUrl?: string;
  }[];
}

export async function generateInvestigation(
  incident: string,
  date: string,
  location: string,
  description: string,
  consequences: string,
  witnesses: string
): Promise<InvestigationResponse> {
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
  const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION;

  const prompt = `
    Como experto en seguridad industrial, genera un informe detallado de investigación de accidente con los siguientes datos:

    Tipo de Incidente: ${incident}
    Fecha: ${date}
    Lugar: ${location}
    Descripción: ${description}
    Consecuencias: ${consequences}
    Testigos: ${witnesses}

    El informe debe incluir:
    1. Resumen del Incidente
    2. Análisis de Causas Inmediatas
    3. Análisis de Causas Básicas
    4. Análisis de Causas Raíz
    5. Evaluación de Controles Existentes
    6. Recomendaciones y Medidas Preventivas
    7. Plan de Acción
    8. Conclusiones

    Responde en formato markdown con títulos, subtítulos y listas donde sea apropiado.
    Incluye una descripción detallada para generar una imagen representativa del incidente que ayude a comprender mejor lo ocurrido.
  `;

  try {
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
              content: 'Eres un experto en seguridad industrial y análisis de accidentes laborales.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.95,
          frequency_penalty: 0,
          presence_penalty: 0,
          stop: null,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Error en la API de Azure OpenAI');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Extraer la descripción para la imagen del contenido
    const imagePrompt = `Genera una imagen profesional y clara que represente un accidente laboral de tipo: ${incident}. 
    La imagen debe mostrar el escenario ${location} y las circunstancias del accidente de manera educativa y profesional, 
    sin mostrar lesiones graves o sangre. Incluye elementos de seguridad y señalización relevantes.`;

    // Generar imagen para el incidente
    const imageUrl = await generateImage(imagePrompt);

    // Crear las secciones con la imagen
    const sections = [
      {
        title: "Resumen del Incidente",
        content: content,
        imageUrl: imageUrl
      }
    ];

    return {
      content,
      images: [{
        section: "Resumen del Incidente",
        url: imageUrl
      }],
      sections
    };
  } catch (error) {
    console.error('Error completo:', error);
    throw error;
  }
}
