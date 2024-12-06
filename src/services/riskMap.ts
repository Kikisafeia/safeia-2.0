import { RiskMap, RiskPoint, RiskZone, RiskType } from '../types/riskMap';

export async function analyzeWorkplaceImage(
  imageFile: File,
  context: {
    workplaceType: string;
    activities: string[];
    existingHazards?: string[];
  }
): Promise<RiskMap> {
  try {
    // Convertir la imagen a base64
    const base64Image = await fileToBase64(imageFile);

    // Preparar el prompt para el análisis
    const prompt = `Analiza esta imagen de un lugar de trabajo y identifica posibles riesgos y zonas peligrosas.
    Tipo de lugar de trabajo: ${context.workplaceType}
    Actividades realizadas: ${context.activities.join(', ')}
    ${context.existingHazards ? `Peligros ya identificados: ${context.existingHazards.join(', ')}` : ''}

    Por favor identifica:
    1. Puntos específicos de riesgo
    2. Zonas de riesgo (áreas más amplias)
    3. Tipo de riesgo para cada punto/zona
    4. Severidad estimada
    5. Controles recomendados

    Responde en formato JSON siguiendo la estructura proporcionada.`;

    if (!import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT ||
        !import.meta.env.VITE_AZURE_OPENAI_ENDPOINT ||
        !import.meta.env.VITE_AZURE_OPENAI_API_KEY) {
      throw new Error('La configuración de Azure OpenAI no está completa');
    }

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
            content: "Eres un experto en seguridad ocupacional especializado en identificación visual de riesgos."
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:${imageFile.type};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 2500,
        temperature: 0.5
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en la respuesta de Azure OpenAI:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`Error al analizar la imagen: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Respuesta inesperada de Azure OpenAI:', data);
      throw new Error('Formato de respuesta inválido');
    }

    const analysis = JSON.parse(data.choices[0].message.content);

    // Crear el mapa de riesgos
    const riskMap: RiskMap = {
      imageData: base64Image,
      points: [],
      zones: [],
      scale: 1
    };

    return processAnalysis(riskMap, analysis);
  } catch (error) {
    console.error('Error en analyzeWorkplaceImage:', error);
    throw error;
  }
}

export async function updateRiskMap(
  riskMap: RiskMap,
  updates: {
    points?: RiskPoint[];
    zones?: RiskZone[];
    scale?: number;
  }
): Promise<RiskMap> {
  return {
    ...riskMap,
    ...updates,
    lastUpdated: new Date().toISOString()
  };
}

export function generateRiskHeatmap(riskMap: RiskMap): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = riskMap.width;
  canvas.height = riskMap.height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo obtener el contexto del canvas');
  }

  // Dibujar zonas de riesgo
  riskMap.zones.forEach(zone => {
    ctx.beginPath();
    zone.points.forEach(([x, y], index) => {
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.closePath();
    
    const color = getSeverityColor(zone.severity);
    ctx.fillStyle = `${color}40`; // 40 es la opacidad en hex
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.stroke();
  });

  // Dibujar puntos de riesgo
  riskMap.points.forEach(point => {
    const gradient = ctx.createRadialGradient(
      point.x, point.y, 0,
      point.x, point.y, point.radius
    );
    
    const color = getSeverityColor(point.severity);
    gradient.addColorStop(0, `${color}80`);
    gradient.addColorStop(1, `${color}00`);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  return canvas;
}

// Funciones auxiliares
function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'Bajo':
      return '#4CAF50';
    case 'Medio':
      return '#FFC107';
    case 'Alto':
      return '#FF5722';
    case 'Crítico':
      return '#F44336';
    default:
      return '#9E9E9E';
  }
}

function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

function processAnalysis(riskMap: RiskMap, analysis: any): RiskMap {
  // Procesar puntos de riesgo
  if (analysis.points) {
    riskMap.points = analysis.points.map((point: any) => ({
      id: generateId(),
      x: point.x,
      y: point.y,
      type: point.type as RiskType,
      description: point.description,
      severity: point.severity,
      controls: point.controls || [],
      radius: point.radius || 20
    }));
  }

  // Procesar zonas de riesgo
  if (analysis.zones) {
    riskMap.zones = analysis.zones.map((zone: any) => ({
      id: generateId(),
      points: zone.points,
      type: zone.type as RiskType,
      description: zone.description,
      severity: zone.severity,
      controls: zone.controls || []
    }));
  }

  return riskMap;
}
