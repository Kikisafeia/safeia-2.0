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

  const prompt = `Actúa como un experto legal en seguridad y salud ocupacional. Para el siguiente caso en ${country}, identifica SOLO las principales leyes y decretos que aplican, incluyendo los artículos específicos cuando sea posible:

Tipo de Proceso: ${processType}
Actividades: ${activities}

Proporciona ÚNICAMENTE los cuerpos legales aplicables (leyes, decretos, etc.) con sus artículos relevantes. NO incluyas recomendaciones ni explicaciones adicionales.

Por favor, proporciona la información en formato JSON con la siguiente estructura (sin usar comillas invertidas ni markdown):
{
  "legalFramework": [
    {
      "name": "Nombre de la ley o decreto (ejemplo: 'Ley 16.744' o 'Decreto Supremo 40')",
      "description": "Artículos específicos que aplican (ejemplo: 'Art. 184: Obligación del empleador de proteger la vida y salud de los trabajadores')",
      "url": "URL oficial donde se puede consultar el texto legal completo (si está disponible)"
    }
  ]
}

Asegúrate de:
1. Incluir SOLO leyes y decretos vigentes
2. Especificar los artículos relevantes cuando sea posible
3. Mantener las descripciones breves y enfocadas en los artículos aplicables
4. NO incluir interpretaciones ni recomendaciones
5. NO incluir normas técnicas ni guías, SOLO cuerpos legales`;

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
      // Primero limpiamos el contenido de markdown
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      // Luego intentamos parsear
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError);
      console.log('Contenido recibido:', content);
      throw new Error('No se pudo procesar la respuesta del servicio');
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
