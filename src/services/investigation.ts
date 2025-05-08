import { generateImage, fetchChatCompletions } from './aiService';

// --- Interfaces ---
// Updated Section to be more generic or potentially removed if JSON is directly used
interface Section {
  title: string;
  content: string; // Could be string or structured data depending on final use
  imageUrl?: string;
}

// Updated InvestigationResponse to reflect structured data possibility
// Removed 'content' as primary markdown is replaced by structured sections
interface InvestigationResponse {
  images: {
    section: string; // e.g., 'Diagrama', 'EPP', 'Señalización'
    url: string;
  }[];
  // Sections derived from the structured JSON response
  sections: Section[];
  // Optionally include the raw structured data from AI
  structuredData?: InvestigationAIResponse;
}

// Interface representing the expected JSON structure from the AI
interface InvestigationAIResponse {
  datosIncidente: {
    tipo: string;
    fecha: string;
    lugar: string;
    testigos: string;
  };
  descripcionDetallada: string;
  consecuencias: string;
  analisisCausas: {
    inmediatas: string[];
    basicas: string[];
    raiz: string[];
  };
  recomendaciones: string[];
}

// --- Helper Functions ---
// Removed parseMarkdownSections as it's no longer needed

// --- Main Service Function ---
export async function generateInvestigation(
  incident: string,
  date: string,
  location: string,
  description: string,
  consequences: string,
  witnesses: string
): Promise<InvestigationResponse> {

  // Updated prompt to request JSON output
  const prompt = `Como experto en seguridad industrial, genera un informe detallado de investigación de accidente usando el método de Árbol de Causas con estos datos. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional ni formato markdown, siguiendo la estructura especificada.

  Datos del Incidente a analizar:
  - Tipo: ${incident}
  - Fecha: ${date}
  - Lugar: ${location}
  - Testigos: ${witnesses || "No reportados"}
  - Descripción Detallada: ${description}
  - Consecuencias: ${consequences}

  Estructura JSON requerida:
  {
    "datosIncidente": {
      "tipo": "${incident}",
      "fecha": "${date}",
      "lugar": "${location}",
      "testigos": "${witnesses || "No reportados"}"
    },
    "descripcionDetallada": "${description.replace(/"/g, '\\"')}", // Escape quotes in description
    "consecuencias": "${consequences.replace(/"/g, '\\"')}", // Escape quotes
    "analisisCausas": {
      "inmediatas": ["Causa inmediata 1", "Causa inmediata 2", "..."],
      "basicas": ["Causa básica 1", "Causa básica 2", "..."],
      "raiz": ["Causa raíz 1", "Causa raíz 2", "..."]
    },
    "recomendaciones": ["Recomendación correctiva/preventiva 1", "Recomendación 2", "..."]
  }

  Instrucciones para el análisis de causas:
  - Identifica las causas inmediatas (actos y condiciones inseguras directas).
  - Identifica las causas básicas (factores personales y de trabajo subyacentes).
  - Identifica las causas raíz (fallos fundamentales del sistema de gestión).
  - Asegúrate de que las listas de causas y recomendaciones sean detalladas y específicas.`;

  try {
    const payload = {
      messages: [
        {
          role: 'system' as const,
          content: 'Eres un experto en seguridad industrial especializado en análisis de accidentes laborales usando metodologías como Árbol de Causas. Responde siempre ÚNICAMENTE con el objeto JSON solicitado.'
        },
        {
          role: 'user' as const,
          content: prompt
        }
      ],
      temperature: 0.5, // Slightly lower temp for more predictable JSON
      max_tokens: 2500,
      response_format: { type: "json_object" } // Explicitly request JSON
    };

    const data = await fetchChatCompletions(payload); // Call via proxy

    // Process the structured JSON response
    let structuredData: InvestigationAIResponse;
    if (data && data.analisisCausas) {
        // Assuming proxy returns the parsed JSON content directly
        structuredData = data;
    } else if (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        // Fallback if proxy returns the full Azure object
        const responseContent = data.choices[0].message.content;
        if (!responseContent) throw new Error('No se recibió contenido JSON del servicio de IA');
        try {
            // Attempt to parse, assuming it might still have ```json wrapper if AI ignored format instruction
             const cleanContent = responseContent
                .replace(/```json\n?/g, '')
                .replace(/```\n?/g, '')
                .trim();
            structuredData = JSON.parse(cleanContent);
        } catch (parseError) {
            console.error('Error al parsear JSON en generateInvestigation fallback:', parseError);
            console.log('Contenido recibido:', responseContent);
            throw new Error('No se pudo procesar la respuesta JSON del servicio de IA');
        }
    } else {
        throw new Error("Respuesta inesperada del servicio de IA para generateInvestigation.");
    }

    // Basic validation of the received structure
     if (!structuredData?.datosIncidente || !structuredData?.analisisCausas?.inmediatas || !structuredData?.recomendaciones) {
         console.error("Estructura JSON inválida recibida:", structuredData);
         throw new Error('La respuesta JSON de IA no tiene la estructura esperada.');
     }


    // --- Generate Images (remains the same for now) ---
    const images: string[] = await Promise.all([
      generateImage(`Diagrama de Árbol de Causas para incidente ${incident} en ${location}`),
      generateImage(`Equipos de protección personal recomendados para prevenir ${incident}`),
      generateImage(`Señalización de seguridad relevante para ${incident}`)
    ]);

    // --- Create sections array from structured data ---
    const sections: Section[] = [];
    sections.push({ title: "Datos del Incidente", content: JSON.stringify(structuredData.datosIncidente, null, 2) }); // Example: stringify object for display
    sections.push({ title: "Descripción Detallada", content: structuredData.descripcionDetallada });
    sections.push({ title: "Consecuencias", content: structuredData.consecuencias });
    sections.push({
        title: "Análisis de Causas",
        content: `**Inmediatas:**\n- ${structuredData.analisisCausas.inmediatas.join('\n- ')}\n\n**Básicas:**\n- ${structuredData.analisisCausas.basicas.join('\n- ')}\n\n**Raíz:**\n- ${structuredData.analisisCausas.raiz.join('\n- ')}`,
        imageUrl: images[0] || undefined // Assign Diagram image here
    });
     sections.push({
        title: "Recomendaciones",
        content: `- ${structuredData.recomendaciones.join('\n- ')}`,
        imageUrl: images[1] || undefined // Assign EPP image here (example)
     });
     // Note: The 3rd image (Signage) isn't explicitly assigned to a section here.

    const result: InvestigationResponse = {
      images: images.map((url, i) => ({
        section: i === 0 ? 'Diagrama' : i === 1 ? 'EPP' : 'Señalización',
        url
      })),
      sections: sections,
      structuredData: structuredData // Include the raw structured data if needed by UI
    };

    return result;

  } catch (error) {
    console.error('Error en generateInvestigation:', {
      error: error instanceof Error ? error.message : error,
      incident,
      location
    });
    // Throw more specific error if possible
    throw new Error(`Error al generar el informe de investigación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}
