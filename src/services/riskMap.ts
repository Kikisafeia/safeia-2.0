import { RiskMap, RiskPoint, RiskZone, RiskType, RiskSeverity, RiskCategory } from '../types/riskMap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { generateIdealScenarios } from './imageGeneration';

// Logger personalizado para el navegador
const logger = {
  info: (...args: any[]) => {
    console.log('%c[INFO]', 'color: #2196F3', ...args);
  },
  warn: (...args: any[]) => {
    console.warn('%c[WARN]', 'color: #FFC107', ...args);
  },
  error: (...args: any[]) => {
    console.error('%c[ERROR]', 'color: #F44336', ...args);
  }
};

export async function analyzeWorkplaceImage(
  imageFile: File,
  context: {
    workplaceType: string;
    activities: string[];
    existingHazards?: string[];
  }
): Promise<RiskMap & { reportPdfBlob?: Blob; error?: string; idealScenarios?: string[] }> {
  try {
    logger.info('Iniciando análisis de imagen...');
    
    // 1. Crear URL de la imagen para visualización
    const imageUrl = URL.createObjectURL(imageFile);
    logger.info('URL de la imagen creada:', imageUrl);

    // 2. Optimizar la imagen para el análisis
    logger.info('Optimizando imagen...');
    const optimizedImageBase64 = await optimizeImage(imageFile);
    
    // 3. Preparar el prompt inicial para descripción de la imagen
    const initialPrompt = `Eres un experto en seguridad laboral analizando una imagen. Por favor, identifica y lista los riesgos y condiciones inseguras que observes, siguiendo exactamente este formato:

#### 1. [Nombre del Riesgo]
- Descripción: [Descripción detallada]
- Coordenadas: (X: [número], Y: [número])
- Riesgo: [bajo/medio/alto]
- Categoría: [EPP/procedimientos/herramientas/ergonomia/orden_limpieza/señalizacion/instalaciones/electrico/quimico/otros]
- Recomendaciones:
  * [Recomendación 1]
  * [Recomendación 2]

#### 2. [Siguiente Riesgo...]
[Continuar con el mismo formato]

Asegúrate de:
1. Incluir coordenadas específicas para cada punto
2. Usar solo las categorías mencionadas
3. Clasificar el nivel de riesgo como bajo, medio o alto
4. Proporcionar al menos una recomendación por riesgo`;

    // 4. Obtener análisis directo
    logger.info('Solicitando análisis de la imagen...');
    const analysisResult = await callAzureOpenAI(optimizedImageBase64, initialPrompt);
    
    if (analysisResult.error) {
      return {
        id: generateUniqueId(),
        name: `Análisis ${context.workplaceType} - ${new Date().toISOString().split('T')[0]}`,
        imageUrl,
        imageSource: 'upload',
        width: 800,
        height: 800,
        points: [],
        zones: [],
        scale: 1,
        lastUpdated: new Date().toISOString(),
        analysisDate: new Date(),
        status: 'borrador',
        location: context.workplaceType,
        totalRisks: 0,
        byType: {},
        bySeverity: {},
        byCategory: {},
        byStatus: {},
        error: analysisResult.error
      };
    }

    const analysisText = analysisResult.analysisText;
    const points = analysisResult.points;
    
    logger.info('Analizando texto para extraer zonas:', analysisText);
    const zones = extractRiskZones(analysisText);

    // Generar escenarios ideales para cada riesgo identificado
    const risksForImageGeneration = [...points, ...zones].map(risk => ({
      description: risk.description,
      improvements: risk.recommendations
    }));

    const idealScenarios = await generateIdealScenarios(risksForImageGeneration, {
      quality: 'hd',
      style: 'natural'
    });

    // Asignar escenarios ideales a los riesgos correspondientes
    const updatedPoints = points.map((point, index) => ({
      ...point,
      idealScenario: idealScenarios[index]
    }));
    const updatedZones = zones.map((zone, index) => ({
      ...zone,
      idealScenario: idealScenarios[points.length + index]
    }));

    // 6. Crear y retornar el mapa de riesgos
    const riskMap: RiskMap = {
      id: generateUniqueId(),
      name: `Análisis ${context.workplaceType} - ${new Date().toISOString().split('T')[0]}`,
      imageUrl,
      imageSource: 'upload',
      width: 800,
      height: 800,
      points: updatedPoints,
      zones: updatedZones,
      scale: 1,
      lastUpdated: new Date().toISOString(),
      analysisDate: new Date(),
      status: 'borrador',
      location: context.workplaceType,
      totalRisks: points.length + zones.length,
      byType: calculateRisksByType(updatedPoints, updatedZones),
      bySeverity: calculateRisksBySeverity(updatedPoints, updatedZones),
      byCategory: calculateRisksByCategory(updatedPoints, updatedZones),
      byStatus: calculateRisksByStatus(updatedPoints, updatedZones)
    };

    // Generar el reporte PDF
    const reportPdfBlob = await generateRiskReport(riskMap, imageUrl, context);

    return {
      ...riskMap,
      reportPdfBlob,
      idealScenarios,
      error: points.length === 0 ? 'No se identificaron puntos de riesgo específicos' : undefined
    };

  } catch (error) {
    logger.error('Error en el análisis de la imagen:', error);
    return {
      id: generateUniqueId(),
      name: `Análisis ${context.workplaceType} - ${new Date().toISOString().split('T')[0]}`,
      imageUrl: '',
      imageSource: 'upload',
      width: 800,
      height: 800,
      points: [],
      zones: [],
      scale: 1,
      lastUpdated: new Date().toISOString(),
      analysisDate: new Date(),
      status: 'borrador',
      location: context.workplaceType,
      totalRisks: 0,
      byType: {},
      bySeverity: {},
      byCategory: {},
      byStatus: {},
      error: error instanceof Error ? error.message : 'Error desconocido al analizar la imagen'
    };
  }
}

// Funciones auxiliares para calcular estadísticas
function calculateRisksByType(points: RiskPoint[], zones: RiskZone[]): Record<RiskType, number> {
  const byType: Record<RiskType, number> = {
    accion_insegura: 0,
    condicion_insegura: 0
  };
  
  points.forEach(p => byType[p.type]++);
  zones.forEach(z => byType[z.type]++);
  
  return byType;
}

function calculateRisksBySeverity(points: RiskPoint[], zones: RiskZone[]): Record<RiskSeverity, number> {
  const bySeverity: Record<RiskSeverity, number> = {
    bajo: 0,
    medio: 0,
    alto: 0
  };
  
  points.forEach(p => bySeverity[p.severity]++);
  zones.forEach(z => bySeverity[z.severity]++);
  
  return bySeverity;
}

function calculateRisksByCategory(points: RiskPoint[], zones: RiskZone[]): Record<RiskCategory, number> {
  const byCategory: Record<RiskCategory, number> = {
    EPP: 0,
    procedimientos: 0,
    herramientas: 0,
    ergonomia: 0,
    orden_limpieza: 0,
    señalizacion: 0,
    instalaciones: 0,
    electrico: 0,
    quimico: 0,
    otros: 0
  };
  
  points.forEach(p => byCategory[p.category]++);
  zones.forEach(z => byCategory[z.category]++);
  
  return byCategory;
}

function calculateRisksByStatus(points: RiskPoint[], zones: RiskZone[]): Record<string, number> {
  const byStatus: Record<string, number> = {
    pendiente: 0,
    en_progreso: 0,
    completado: 0
  };
  
  points.forEach(p => byStatus[p.status]++);
  zones.forEach(z => byStatus[z.status]++);
  
  return byStatus;
}

function createConversation(context: any, base64Data: string) {
  return {
    messages: [
      {
        role: 'system',
        content: [
          {
            type: 'text',
            text: `Actúa como un experto en HSE (Salud, Seguridad y Medio Ambiente) y analiza las acciones o condiciones inseguras identificadas en imágenes. Genera un reporte claro, estructurado y fácil de consultar, que describa las principales acciones o condiciones inseguras presentes.
            
            ... [resto del contenido omitido por brevedad] ...
            ` // Mantén el contenido original aquí
          }
        ]
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analiza esta imagen y genera un reporte HSE siguiendo exactamente el formato especificado. Identifica y clasifica todas las acciones y condiciones inseguras, proporcionando coordenadas específicas para cada hallazgo. Asegúrate de que las recomendaciones sean prácticas y específicas.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Data}`
            }
          }
        ]
      }
    ],
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 800,
    frequency_penalty: 0,
    presence_penalty: 0,
    stream: false
  };
}

function constructApiUrl() {
  const endpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT?.replace(/\/$/, '');
  const deployment = import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT;
  const apiVersion = import.meta.env.VITE_AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

  if (!endpoint || !deployment) {
    throw new Error('Faltan variables de entorno de Azure OpenAI');
  }

  // Asegurarnos de que la URL tenga el formato correcto
  return `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;
}

// Función para extraer puntos de riesgo
function extractRiskPoints(analysisText: string): RiskPoint[] {
  const points: RiskPoint[] = [];
  const sections = analysisText.split('####').filter(section => section.trim());

  sections.forEach(section => {
    const lines = section.trim().split('\n');
    const name = lines[0].trim();
    
    let description = '';
    let coordinates = { x: 0, y: 0 };
    let severity: RiskSeverity = 'medio';
    let category: RiskCategory = 'otros';
    const recommendations: string[] = [];

    lines.forEach(line => {
      const trimmedLine = line.trim().toLowerCase();
      
      if (trimmedLine.startsWith('descripción:')) {
        description = line.split(':')[1].trim();
      }
      else if (trimmedLine.startsWith('coordenadas:')) {
        const coords = line.match(/x:\s*(\d+)\s*,\s*y:\s*(\d+)/i);
        if (coords) {
          coordinates = {
            x: parseInt(coords[1]),
            y: parseInt(coords[2])
          };
        }
      }
      else if (trimmedLine.startsWith('riesgo:')) {
        const riskLevel = line.split(':')[1].trim().toLowerCase();
        if (['bajo', 'medio', 'alto'].includes(riskLevel)) {
          severity = riskLevel as RiskSeverity;
        }
      }
      else if (trimmedLine.startsWith('categoría:')) {
        const cat = line.split(':')[1].trim().toLowerCase();
        if (isValidCategory(cat)) {
          category = cat as RiskCategory;
        }
      }
      else if (trimmedLine.includes('*')) {
        const recommendation = line.replace('*', '').trim();
        if (recommendation) {
          recommendations.push(recommendation);
        }
      }
    });

    if (description && (coordinates.x > 0 || coordinates.y > 0)) {
      points.push(createRiskPoint(
        coordinates.x,
        coordinates.y,
        'accion_insegura',
        category,
        name,
        description,
        severity,
        recommendations
      ));
    }
  });

  return points;
}

function extractRiskZones(analysisText: string): RiskZone[] {
  const zones: RiskZone[] = [];
  logger.info('Analizando texto para extraer zonas:', analysisText);
  
  if (!analysisText) {
    logger.warn('El texto de análisis está vacío');
    return zones;
  }

  try {
    // Buscar secciones que describan áreas o zonas
    const zoneSections = analysisText.match(/(?:####?\s*\d+\.|[-*]\s+)([^#]+?)(?=####?\s*\d+\.|$)/g) || [];

    zoneSections.forEach(section => {
      if (section.toLowerCase().includes('área') || section.toLowerCase().includes('zona')) {
        // Extraer información básica
        const description = section.match(/(?:####?\s*\d+\.|[-*]\s+)(.*?)(?:\n|$)/)?.[1]?.trim();
        if (!description) return;

        // Buscar coordenadas múltiples
        const coordMatches = Array.from(section.matchAll(/[Cc]oordenadas?:?\s*\(?[XxYy]?\s*:?\s*(\d+)\s*,\s*[XxYy]?\s*:?\s*(\d+)\)?/g));
        if (coordMatches.length < 3) return; // Necesitamos al menos 3 puntos para una zona

        const coordinates: [number, number][] = coordMatches.map(match => [
          parseInt(match[1]),
          parseInt(match[2])
        ]);

        // Buscar nivel de riesgo
        let severity: RiskSeverity = 'medio';
        const riskMatch = section.toLowerCase().match(/riesgo:?\s*(bajo|medio|alto)/);
        if (riskMatch) {
          severity = riskMatch[1] as RiskSeverity;
        }

        // Buscar categoría
        let category: RiskCategory = 'otros';
        const categoryMatch = section.toLowerCase().match(/(?:categoría|tipo|clase):?\s*(\w+)/);
        if (categoryMatch) {
          const foundCategory = categoryMatch[1];
          if (isValidCategory(foundCategory)) {
            category = foundCategory as RiskCategory;
          }
        }

        // Extraer recomendaciones
        const recommendations: string[] = [];
        const recomMatch = section.match(/[Rr]ecomendac(?:ión|iones):?\s*((?:[-*]\s*[^#\n]+\n*)+)/);
        if (recomMatch) {
          recommendations.push(...recomMatch[1].split('\n')
            .map(r => r.replace(/^[-*]\s*/, '').trim())
            .filter(r => r.length > 0));
        }

        // Crear zona de riesgo
        zones.push({
          id: generateUniqueId(),
          type: 'condicion_insegura',
          category,
          severity,
          name: description.substring(0, 50),
          description,
          coordinates,
          status: 'pendiente',
          recommendations: recommendations.length > 0 ? recommendations : ['Implementar medidas correctivas']
        });
      }
    });

  } catch (err) {
    logger.error('Error al extraer zonas de riesgo:', err);
  }
  
  logger.info('Zonas extraídas:', zones);
  return zones;
}

// Función auxiliar para validar categorías
function isValidCategory(category: string): boolean {
  const validCategories: RiskCategory[] = [
    'EPP',
    'procedimientos',
    'herramientas',
    'ergonomia',
    'orden_limpieza',
    'señalizacion',
    'instalaciones',
    'electrico',
    'quimico',
    'otros'
  ];
  return validCategories.includes(category as RiskCategory);
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
  const width = riskMap.width || 800; // Valor por defecto si no hay ancho
  const height = riskMap.height || 600; // Valor por defecto si no hay alto

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;

  // Limpiar el canvas
  ctx.clearRect(0, 0, width, height);

  // Dibujar puntos de riesgo
  if (riskMap.points) {
    riskMap.points.forEach(point => {
      if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
        logger.warn('Punto inválido en el mapa de riesgo:', point);
        return;
      }

      const radius = 20;
      const color = getSeverityColor(point.severity); // Color basado en la severidad

      // Convertir coordenadas de porcentaje a píxeles
      const x = (point.x / 100) * width;
      const y = (point.y / 100) * height;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      
      // Agregar borde
      ctx.strokeStyle = 'rgba(0,0,0,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  // Dibujar zonas de riesgo
  if (riskMap.zones) {
    riskMap.zones.forEach(zone => {
      if (!zone.coordinates || zone.coordinates.length < 3) {
        logger.warn('Zona inválida en el mapa de riesgo:', zone);
        return;
      }

      const color = getSeverityColor(zone.severity);
      
      ctx.beginPath();
      // Convertir primera coordenada de porcentaje a píxeles
      const startX = (zone.coordinates[0][0] / 100) * width;
      const startY = (zone.coordinates[0][1] / 100) * height;
      ctx.moveTo(startX, startY);

      // Convertir resto de coordenadas
      for (let i = 1; i < zone.coordinates.length; i++) {
        const x = (zone.coordinates[i][0] / 100) * width;
        const y = (zone.coordinates[i][1] / 100) * height;
        ctx.lineTo(x, y);
      }

      ctx.closePath();
      ctx.fillStyle = `${color}80`; // 50% de transparencia
      ctx.fill();
      
      // Agregar borde
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }

  return canvas;
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'bajo':
      return 'rgba(76, 175, 80, 0.3)'; // Verde
    case 'medio':
      return 'rgba(255, 193, 7, 0.3)'; // Amarillo
    case 'alto':
      return 'rgba(255, 87, 34, 0.3)'; // Rojo
    case 'crítico':
      return 'rgba(244, 67, 54, 0.3)'; // Rojo crítico
    default:
      return 'rgba(158, 158, 158, 0.3)'; // Gris para no clasificado
  }
}

function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9);
}

// Función para optimizar la imagen
async function optimizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const maxWidth = 800; // Reducido para mejor compatibilidad
    const maxHeight = 800; // Reducido para mejor compatibilidad
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcular las nuevas dimensiones manteniendo la proporción
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Configurar el canvas con las nuevas dimensiones
        canvas.width = width;
        canvas.height = height;

        // Limpiar el canvas antes de dibujar
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0, 0, width, height);
        
        // Dibujar la imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a JPEG con calidad reducida
        const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        logger.info('Dimensiones de la imagen optimizada:', { width, height });
        
        // Extraer solo la parte base64 sin el prefijo
        const base64Data = optimizedBase64.split(',')[1];
        resolve(base64Data);
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsDataURL(file);
  });
}

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // Extraer solo la parte base64 sin el prefijo
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = error => reject(error);
  });
}

async function callAzureOpenAI(base64Data: string, prompt: string): Promise<{
  analysisText: string;
  points: RiskPoint[];
  error?: string;
}> {
  try {
    const apiUrl = constructApiUrl();
    const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('Falta la clave de API de Azure OpenAI');
    }

    logger.info('Iniciando llamada a Azure OpenAI');

    const tools = [
      {
        "type": "function",
        "function": {
          "name": "analyzeWorkplaceRisks",
          "description": "Analiza una imagen del lugar de trabajo para identificar riesgos de seguridad y salud ocupacional",
          "parameters": {
            "type": "object",
            "properties": {
              "risks": {
                "type": "array",
                "description": "Lista de riesgos identificados",
                "items": {
                  "type": "object",
                  "properties": {
                    "name": {
                      "type": "string",
                      "description": "Nombre descriptivo del riesgo"
                    },
                    "description": {
                      "type": "string",
                      "description": "Descripción detallada del riesgo"
                    },
                    "coordinates": {
                      "type": "object",
                      "properties": {
                        "x": {
                          "type": "number",
                          "description": "Coordenada X (0-100)"
                        },
                        "y": {
                          "type": "number",
                          "description": "Coordenada Y (0-100)"
                        }
                      },
                      "required": ["x", "y"]
                    },
                    "severity": {
                      "type": "string",
                      "enum": ["bajo", "medio", "alto"],
                      "description": "Nivel de severidad del riesgo"
                    },
                    "category": {
                      "type": "string",
                      "enum": ["EPP", "procedimientos", "herramientas", "ergonomia", "orden_limpieza", "señalizacion", "instalaciones", "electrico", "quimico", "otros"],
                      "description": "Categoría del riesgo"
                    },
                    "recommendations": {
                      "type": "array",
                      "items": {
                        "type": "string"
                      },
                      "description": "Lista de recomendaciones para mitigar el riesgo",
                      "minItems": 2
                    }
                  },
                  "required": ["name", "description", "coordinates", "severity", "category", "recommendations"]
                }
              }
            },
            "required": ["risks"]
          }
        }
      }
    ];

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: `Actúa como un experto en HSE (Salud, Seguridad y Medio Ambiente) y analiza las acciones o condiciones inseguras identificadas en imágenes.
            
            IMPORTANTE: DEBES usar la función proporcionada para estructurar tu respuesta. La función se llama 'analyzeWorkplaceRisks' y espera un objeto JSON con un array de riesgos.
            
            Para cada riesgo identificado, debes proporcionar:
            1. Nombre descriptivo y claro
            2. Descripción detallada del riesgo y su contexto
            3. Coordenadas precisas (X,Y) en un rango de 0 a 100
            4. Nivel de severidad: bajo, medio o alto
            5. Categoría específica usando las opciones permitidas
            6. Al menos dos recomendaciones específicas y accionables
            
            Asegúrate de:
            - Identificar TODOS los riesgos visibles
            - Ser específico en la descripción de la ubicación
            - No hacer suposiciones sobre elementos no visibles
            - Usar SOLO las categorías permitidas
            - Proporcionar coordenadas precisas para cada riesgo`
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
                  url: `data:image/jpeg;base64,${base64Data}`,
                  detail: "high"
                }
              }
            ]
          }
        ],
        tools: tools,
        tool_choice: {
          type: "function",
          function: { name: "analyzeWorkplaceRisks" }
        },
        temperature: 0.7,
        top_p: 0.95,
        max_tokens: 4000,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      logger.error('Error en la respuesta de Azure:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Error en la API: ${response.statusText} ${errorData ? JSON.stringify(errorData) : ''}`);
    }

    const data = await response.json();
    logger.info('Respuesta recibida de Azure OpenAI:', {
      choices: data.choices?.length,
      message: data.choices?.[0]?.message,
      toolCalls: data.choices?.[0]?.message?.tool_calls?.length
    });
    
    const toolCalls = data.choices?.[0]?.message?.tool_calls;
    
    if (!toolCalls || toolCalls.length === 0) {
      // Si no hay tool_calls pero hay contenido en el mensaje, intentamos procesarlo
      const content = data.choices?.[0]?.message?.content;
      if (content) {
        logger.info('Procesando respuesta como contenido directo');
        try {
          // Intentamos extraer los puntos del texto
          const points = extractRiskPoints(content);
          return {
            analysisText: content,
            points
          };
        } catch (e) {
          logger.error('Error al procesar el contenido directo:', e);
          throw new Error('No se pudo procesar la respuesta del análisis');
        }
      } else {
        throw new Error('No se recibió respuesta del análisis');
      }
    }

    // Procesamos la respuesta de la función
    const analysisResults = toolCalls.map(call => {
      if (call.function.name === 'analyzeWorkplaceRisks') {
        try {
          const result = JSON.parse(call.function.arguments);
          logger.info('Resultado del análisis:', result);
          return result;
        } catch (e) {
          logger.error('Error al parsear la respuesta:', e);
          return null;
        }
      }
      return null;
    }).filter(Boolean);

    if (analysisResults.length === 0) {
      throw new Error('No se pudo procesar la respuesta del análisis');
    }

    // Convertimos los resultados al formato esperado
    const points = analysisResults.flatMap(result => 
      result.risks.map(risk => {
        logger.info('Procesando riesgo:', risk);
        return {
          id: generateUniqueId(),
          x: risk.coordinates.x,
          y: risk.coordinates.y,
          type: 'point',
          category: risk.category,
          name: risk.name,
          description: risk.description,
          severity: risk.severity,
          recommendations: risk.recommendations,
          status: 'pending'
        };
      })
    );

    logger.info('Puntos generados:', points);

    return {
      analysisText: JSON.stringify(analysisResults, null, 2),
      points
    };

  } catch (error) {
    logger.error('Error al llamar a Azure OpenAI:', error);
    return {
      analysisText: '',
      points: [],
      error: error instanceof Error ? error.message : 'Error desconocido al analizar la imagen'
    };
  }
}

export const createRiskPoint = (
  x: number,
  y: number,
  type: RiskType,
  category: RiskCategory,
  name: string,
  description: string,
  severity: RiskSeverity,
  recommendations: string[]
): RiskPoint => {
  return {
    id: generateUniqueId(),
    coordinates: { x, y },
    type,
    category,
    name,
    description,
    severity,
    recommendations,
    status: 'pendiente',
    comments: [],
    images: []
  };
};

export const updateRiskPoint = (point: RiskPoint, updates: Partial<RiskPoint>): RiskPoint => {
  return {
    ...point,
    ...updates,
    coordinates: updates.coordinates || point.coordinates
  };
};

export async function generateRiskReport(
  riskMap: RiskMap, 
  imageUrl: string, 
  context: {
    workplaceType: string;
    activities: string[];
    existingHazards?: string[];
  }
): Promise<Blob> {
  try {
    logger.info('Generando reporte PDF...');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    // Título
    pdf.setFontSize(20);
    pdf.text('Reporte de Análisis de Riesgos', margin, 20);
    pdf.setFontSize(12);

    // Fecha
    const date = new Date().toLocaleDateString();
    pdf.text(`Fecha de análisis: ${date}`, margin, 30);

    // Información del contexto
    let yPos = 40;
    pdf.setFontSize(16);
    pdf.text('Contexto del Análisis', margin, yPos);
    yPos += 10;
    pdf.setFontSize(12);
    
    pdf.text(`Tipo de lugar de trabajo: ${context.workplaceType}`, margin, yPos);
    yPos += 7;
    
    pdf.text('Actividades:', margin, yPos);
    yPos += 7;
    context.activities.forEach(activity => {
      pdf.text(`• ${activity}`, margin + 5, yPos);
      yPos += 7;
    });
    
    if (context.existingHazards && context.existingHazards.length > 0) {
      yPos += 3;
      pdf.text('Riesgos previamente identificados:', margin, yPos);
      yPos += 7;
      context.existingHazards.forEach(hazard => {
        pdf.text(`• ${hazard}`, margin + 5, yPos);
        yPos += 7;
      });
    }
    
    yPos += 10;

    // Imagen analizada
    const img = new Image();
    img.src = imageUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });
    const imgAspectRatio = img.height / img.width;
    const imgWidth = contentWidth;
    const imgHeight = imgWidth * imgAspectRatio;
    
    if (yPos + imgHeight > pdf.internal.pageSize.height - margin) {
      pdf.addPage();
      yPos = margin;
    }
    
    pdf.addImage(img, 'JPEG', margin, yPos, imgWidth, imgHeight);
    yPos += imgHeight + 10;

    // Estadísticas de riesgos
    if (yPos > pdf.internal.pageSize.height - 40) {
      pdf.addPage();
      yPos = margin;
    }
    
    pdf.setFontSize(16);
    pdf.text('Resumen de Riesgos', margin, yPos);
    yPos += 10;
    pdf.setFontSize(12);

    const risksByType = calculateRisksByType(riskMap.points, riskMap.zones);
    const risksBySeverity = calculateRisksBySeverity(riskMap.points, riskMap.zones);
    const risksByCategory = calculateRisksByCategory(riskMap.points, riskMap.zones);

    // Agregar estadísticas
    pdf.text('Por Severidad:', margin, yPos);
    yPos += 7;
    Object.entries(risksBySeverity).forEach(([severity, count]) => {
      pdf.text(`- ${severity}: ${count}`, margin + 5, yPos);
      yPos += 7;
    });

    yPos += 5;
    pdf.text('Por Categoría:', margin, yPos);
    yPos += 7;
    Object.entries(risksByCategory).forEach(([category, count]) => {
      pdf.text(`- ${category}: ${count}`, margin + 5, yPos);
      yPos += 7;
    });

    // Detalles de los puntos de riesgo
    yPos += 10;
    if (yPos > pdf.internal.pageSize.height - 40) {
      pdf.addPage();
      yPos = margin;
    }
    
    pdf.setFontSize(16);
    pdf.text('Puntos de Riesgo Identificados', margin, yPos);
    yPos += 10;
    pdf.setFontSize(12);

    riskMap.points.forEach((point, index) => {
      if (yPos > pdf.internal.pageSize.height - 40) {
        pdf.addPage();
        yPos = margin;
      }

      pdf.text(`${index + 1}. ${point.name}`, margin, yPos);
      yPos += 7;
      pdf.text(`   Severidad: ${point.severity}`, margin, yPos);
      yPos += 7;
      pdf.text(`   Categoría: ${point.category}`, margin, yPos);
      yPos += 7;
      pdf.text(`   Descripción: ${point.description}`, margin, yPos);
      yPos += 7;
      if (point.coordinates) {
        pdf.text(`   Ubicación: (X: ${point.coordinates.x}, Y: ${point.coordinates.y})`, margin, yPos);
        yPos += 7;
      }
      
      if (point.recommendations && point.recommendations.length > 0) {
        pdf.text('   Recomendaciones:', margin, yPos);
        yPos += 7;
        point.recommendations.forEach(rec => {
          if (yPos > pdf.internal.pageSize.height - 20) {
            pdf.addPage();
            yPos = margin;
          }
          pdf.text(`   - ${rec}`, margin + 5, yPos);
          yPos += 7;
        });
      }
      yPos += 5;
    });

    // Agregar zonas de riesgo si existen
    if (riskMap.zones && riskMap.zones.length > 0) {
      if (yPos > pdf.internal.pageSize.height - 40) {
        pdf.addPage();
        yPos = margin;
      }
      
      pdf.setFontSize(16);
      pdf.text('Zonas de Riesgo', margin, yPos);
      yPos += 10;
      pdf.setFontSize(12);

      riskMap.zones.forEach((zone, index) => {
        if (yPos > pdf.internal.pageSize.height - 40) {
          pdf.addPage();
          yPos = margin;
        }

        pdf.text(`${index + 1}. ${zone.name}`, margin, yPos);
        yPos += 7;
        pdf.text(`   Severidad: ${zone.severity}`, margin, yPos);
        yPos += 7;
        pdf.text(`   Descripción: ${zone.description}`, margin, yPos);
        yPos += 7;
        if (zone.recommendations && zone.recommendations.length > 0) {
          pdf.text('   Recomendaciones:', margin, yPos);
          yPos += 7;
          zone.recommendations.forEach(rec => {
            pdf.text(`   - ${rec}`, margin + 5, yPos);
            yPos += 7;
          });
        }
        yPos += 5;
      });
    }

    return pdf.output('blob');
  } catch (error) {
    logger.error('Error al generar el reporte PDF:', error);
    throw error;
  }
}

export function cleanupRiskMap(riskMap: RiskMap) {
  if (riskMap.imageUrl) {
    URL.revokeObjectURL(riskMap.imageUrl);
  }
}
