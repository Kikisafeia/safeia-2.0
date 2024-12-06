import { AnalisisTrabajoSeguro, RiesgoIdentificado, MedidaControl } from '../types/ats';
import { RiskMap, RiskPoint, RiskZone } from '../types/riskMap';

export async function generateATSAnalysis(
  activityData: {
    actividad: string;
    descripcion: string;
    area: string;
    pasos: string[];
  },
  riskMap?: RiskMap
): Promise<AnalisisTrabajoSeguro> {
  try {
    // Preparar el prompt incluyendo información del mapa de riesgos si está disponible
    let riskMapInfo = '';
    if (riskMap) {
      const riskPoints = riskMap.points.map(point => 
        `- ${point.type} en (${point.x}, ${point.y}): ${point.description} (Severidad: ${point.severity})`
      ).join('\n');
      
      const riskZones = riskMap.zones.map(zone =>
        `- Zona de ${zone.type}: ${zone.description} (Severidad: ${zone.severity})`
      ).join('\n');

      riskMapInfo = `
Riesgos identificados en el mapa:
Puntos de riesgo:
${riskPoints}

Zonas de riesgo:
${riskZones}
`;
    }

    const prompt = `Genera un análisis de trabajo seguro (ATS) para la siguiente actividad:
Actividad: ${activityData.actividad}
Descripción: ${activityData.descripcion}
Área de trabajo: ${activityData.area}

Pasos de la actividad:
${activityData.pasos.map((paso, index) => `${index + 1}. ${paso}`).join('\n')}

${riskMapInfo}

Genera un análisis en formato tabla con las siguientes columnas:
1. Etapas del trabajo (usar los pasos proporcionados)
2. Riesgos asociados a cada etapa
3. Medidas preventivas para cada riesgo
4. Legislación aplicable

La respuesta debe estar en formato JSON con la siguiente estructura:
{
  "actividad": string,
  "area": string,
  "fecha": string (fecha actual),
  "etapas": [
    {
      "etapa": string,
      "riesgos": string[],
      "medidasPreventivas": string[],
      "legislacionAplicable": string[]
    }
  ],
  "equiposProteccion": string[],
  "condicionesAmbientales": string[]
}`;

    // Llamar a Azure OpenAI
    const response = await fetch(`${import.meta.env.VITE_AZURE_OPENAI_ENDPOINT}/openai/deployments/${import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=${import.meta.env.VITE_AZURE_OPENAI_API_VERSION}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': import.meta.env.VITE_AZURE_OPENAI_API_KEY
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "Eres un experto en seguridad y salud ocupacional especializado en análisis de trabajo seguro."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error('Error al generar el análisis');
    }

    const data = await response.json();
    
    // Extraer el JSON del contenido markdown
    let content = data.choices[0].message.content;
    
    // Remover los delimitadores de markdown si existen
    if (content.includes('```json')) {
      content = content.replace(/```json\n|\n```/g, '');
    } else if (content.includes('```')) {
      content = content.replace(/```\n|\n```/g, '');
    }
    
    // Intentar parsear el JSON
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (error) {
      console.error('Error al parsear la respuesta:', content);
      throw new Error('La respuesta no tiene un formato JSON válido');
    }

    // Integrar el mapa de riesgos si está disponible
    if (riskMap) {
      analysis.mapaRiesgos = riskMap;

      // Convertir los puntos y zonas de riesgo en riesgos identificados
      const riesgosDelMapa: RiesgoIdentificado[] = [
        ...riskMap.points.map(point => ({
          id: point.id,
          tipo: point.type,
          descripcion: point.description,
          severidad: point.severity,
          probabilidad: 'Medio', // Valor por defecto, ajustar según el análisis
          coordenadas: { x: point.x, y: point.y }
        })),
        ...riskMap.zones.map(zone => ({
          id: zone.id,
          tipo: zone.type,
          descripcion: zone.description,
          severidad: zone.severity,
          probabilidad: 'Medio', // Valor por defecto, ajustar según el análisis
          zona: zone.points
        }))
      ];

      // Agregar los riesgos del mapa al análisis
      analysis.riesgosIdentificados = [
        ...(analysis.riesgosIdentificados || []),
        ...riesgosDelMapa
      ];
    }

    return analysis;
  } catch (error) {
    console.error('Error en generateATSAnalysis:', error);
    throw error;
  }
}

// Función auxiliar para generar un ID único
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}
