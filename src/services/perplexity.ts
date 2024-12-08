const PERPLEXITY_API_KEY = import.meta.env.VITE_PERPLEXITY_API_KEY;

if (!PERPLEXITY_API_KEY) {
  console.error('VITE_PERPLEXITY_API_KEY no está definida en las variables de entorno');
}

export { PERPLEXITY_API_KEY };

interface PerplexityResponse {
  id: string;
  choices: {
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }[];
}

export async function searchLegalInformation(country: string, workplaceType: string): Promise<string> {
  const prompt = `Busca y proporciona información detallada sobre las leyes y regulaciones de seguridad y salud ocupacional en ${country}, específicamente relacionadas con ${workplaceType}. Incluye:
1. Leyes principales que regulan la seguridad laboral
2. Normativas específicas para este tipo de lugar de trabajo
3. Requisitos legales de seguridad
4. Referencias a documentos oficiales
Por favor, proporciona la información más actualizada posible con referencias específicas a artículos y decretos.`;

  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'Eres un experto legal especializado en legislación de seguridad y salud ocupacional en Latinoamérica. Sé preciso y conciso en tus respuestas, citando siempre las fuentes legales específicas.'
          },
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error de Perplexity:', errorData);
      throw new Error(`Error en la búsqueda de información legal: ${response.status}`);
    }

    const data: PerplexityResponse = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error al consultar Perplexity:', error);
    // Si hay un error, devolvemos un mensaje genérico para no interrumpir el flujo
    return "No se pudo obtener información legal específica. Por favor, consulte la normativa local vigente.";
  }
}
