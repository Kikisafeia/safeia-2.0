interface LegalReference {
  name: string;
  description: string;
  url?: string;
}

export async function getLegalFramework(
  country: string,
  processType: string,
  activities: string
): Promise<LegalReference[]> {
  const apiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
  const apiUrl = 'https://api.perplexity.ai/chat/completions';

  const prompt = `Actúa como un experto legal en seguridad y salud ocupacional. Necesito que identifiques las principales leyes, decretos, resoluciones y normas técnicas que aplican al siguiente caso en ${country}:

Tipo de Proceso: ${processType}
Actividades: ${activities}

Por favor, proporciona la información en formato JSON con la siguiente estructura (sin usar comillas invertidas ni markdown):
{
  "legalFramework": [
    {
      "name": "Nombre de la ley/norma",
      "description": "Breve descripción de qué aspectos específicos aplican",
      "url": "URL oficial o fuente confiable donde se puede consultar (si está disponible)"
    }
  ]
}

Asegúrate de:
1. Incluir solo normativas vigentes y aplicables específicamente a ${country}
2. Priorizar las normativas más relevantes para el tipo de proceso y actividades descritas
3. Proporcionar URLs oficiales o de fuentes confiables cuando estén disponibles
4. Describir específicamente qué aspectos de cada normativa aplican al caso

La respuesta debe ser ÚNICAMENTE el objeto JSON, sin texto adicional ni formato markdown.`;

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: 'system',
            content: 'Eres un experto legal en seguridad y salud ocupacional con amplio conocimiento de la normativa en Latinoamérica. Responde siempre en español y sé preciso y conciso.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        top_p: 0.9,
        frequency_penalty: 1,
        presence_penalty: 0,
        stream: false,
        return_images: false,
        return_related_questions: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error('Error de Perplexity:', errorData);
      throw new Error(`Error en la API de Perplexity: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      throw new Error('Respuesta inválida de la API');
    }

    let result;
    const content = data.choices[0].message.content;
    
    try {
      // Intenta parsear directamente
      result = JSON.parse(content.trim());
    } catch (parseError) {
      console.error('Error al parsear JSON inicial:', parseError);
      
      // Intenta limpiar el contenido de markdown y volver a parsear
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      try {
        result = JSON.parse(cleanContent);
      } catch (secondParseError) {
        console.error('Error al parsear JSON limpio:', secondParseError);
        console.error('Contenido recibido:', content);
        throw new Error('No se pudo procesar la respuesta del servicio');
      }
    }

    if (!Array.isArray(result?.legalFramework)) {
      console.error('Estructura inesperada:', result);
      throw new Error('La respuesta no tiene el formato esperado');
    }

    return result.legalFramework;
  } catch (error) {
    console.error('Error al obtener marco legal:', error);
    throw error;
  }
}
