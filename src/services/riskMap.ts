import { RiskMap, RiskPoint, RiskZone, RiskCategory, RiskSeverity } from '../types/riskMap';
import { analyzeImage } from './aiService';

// Configuración según normativa ISP Chile
const RISK_CONFIG = {
  // Símbolos oficiales de riesgos
  symbols: {
    'caidas': '▲',
    'atrapamiento': '⛔',
    'electrico': '⚡',
    'incendio': '🔥',
    'quimico': '☣',
    'ruido': '🔊',
    'posturas': '🧘',
    'psicosocial': '🧠'
  },

  // Colores por severidad
  colors: {
    'bajo': '#4CAF50',
    'medio': '#FFC107', 
    'alto': '#FF5722',
    'critico': '#F44336'
  },

  // Mapeo actividades-riesgos
  activityRisks: {
    'trabajo_en_alturas': ['caidas', 'desequilibrios'],
    'manejo_quimicos': ['quimico', 'intoxicacion'],
    'operacion_maquinaria': ['atrapamiento', 'ruido'],
    'trabajo_administrativo': ['posturas', 'fatiga_visual']
  }
};

// Helper to get symbol for risk category
function getRiskSymbol(category: RiskCategory): string {
  const symbolMap: Record<RiskCategory, string> = {
    'seguridad': RISK_CONFIG.symbols.caidas,
    'higienico': RISK_CONFIG.symbols.quimico,
    'musculo_esqueletico': RISK_CONFIG.symbols.posturas,
    'psicosocial': RISK_CONFIG.symbols.psicosocial
  };
  return symbolMap[category] || '⚠';
}

export async function analyzeWorkplaceImage(
  imageFile: File,
  context: {
    workplaceType: string;
    activities: Array<keyof typeof RISK_CONFIG.activityRisks>;
    existingHazards?: string[];
  }
): Promise<RiskMap> {
  // 1. Analizar imagen con IA
  const analysis = await analyzeImage(imageFile, {
    features: ['objects', 'hazards', 'safety_issues'],
    workplaceType: context.workplaceType
  });

  // 2. Generar sugerencias de riesgos
  const suggestedPoints = analysis.detections.map(detection => ({
    type: detection.type,
    category: categorizeRisk(detection.type),
    description: `Riesgo de ${detection.type} detectado`,
    confidence: detection.confidence,
    recommendedPosition: detection.position
  }));

  // 3. Crear mapa base
  const baseMap: RiskMap = {
    id: generateUniqueId(),
    name: `Mapa de Riesgos - ${context.workplaceType}`,
    imageUrl: URL.createObjectURL(imageFile),
    width: analysis.imageWidth,
    height: analysis.imageHeight,
    points: [],
    zones: [],
    lastUpdated: new Date().toISOString(),
    status: 'borrador',
    imageAnalysis: {
      detectedElements: analysis.detections.map(d => ({
        type: d.type,
        coordinates: {
          x: d.position.x,
          y: d.position.y,
          width: d.dimensions?.width || 0,
          height: d.dimensions?.height || 0
        },
        confidence: d.confidence
      })),
      suggestedRisks: suggestedPoints
    }
  };

  // 4. Añadir riesgos basados en actividades
  context.activities.forEach((activity: keyof typeof RISK_CONFIG.activityRisks) => {
    const risks = RISK_CONFIG.activityRisks[activity] || [];
    risks.forEach((riskType: string) => {
      baseMap.points.push(createRiskPoint(riskType, activity));
    });
  });

  return baseMap;
}

function createRiskPoint(riskType: string, activity: string): RiskPoint {
  const probability = 3 + Math.random() * 4; // 3-7
  const impact = 3 + Math.random() * 4; // 3-7
  
  return {
    id: generateUniqueId(),
    name: `Riesgo ${riskType}`,
    category: categorizeRisk(riskType),
    description: `Riesgo de ${riskType} en ${activity}`,
    coordinates: {
      x: 10 + Math.random() * 80, // 10-90%
      y: 10 + Math.random() * 80
    },
    severity: determineSeverity(probability, impact),
    probability,
    impact,
    recommendations: [
      `Control según protocolo ISP para ${riskType}`,
      `Capacitación en ${activity}`
    ]
  };
}

// Funciones de ayuda (mantenidas de versión anterior)
export function generateRiskHeatmap(riskMap: RiskMap): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = riskMap.width;
  canvas.height = riskMap.height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return canvas;

  riskMap.points.forEach(point => {
    drawRiskPoint(ctx, point, riskMap.width, riskMap.height);
  });

  riskMap.zones.forEach(zone => {
    drawRiskZone(ctx, zone, riskMap.width, riskMap.height);
  });

  return canvas;
}

function drawRiskPoint(
  ctx: CanvasRenderingContext2D,
  point: RiskPoint,
  mapWidth: number,
  mapHeight: number
) {
  const x = (point.coordinates.x / 100) * mapWidth;
  const y = (point.coordinates.y / 100) * mapHeight;
  const radius = 15;

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = RISK_CONFIG.colors[point.severity];
  ctx.fill();
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#000';
  ctx.font = 'bold 12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(getRiskSymbol(point.category), x, y);
}

function drawRiskZone(
  ctx: CanvasRenderingContext2D,
  zone: RiskZone,
  mapWidth: number,
  mapHeight: number
) {
  if (zone.coordinates.length < 3) return;

  ctx.beginPath();
  const first = zone.coordinates[0];
  ctx.moveTo(
    (first[0] / 100) * mapWidth,
    (first[1] / 100) * mapHeight
  );

  zone.coordinates.slice(1).forEach(coord => {
    ctx.lineTo(
      (coord[0] / 100) * mapWidth,
      (coord[1] / 100) * mapHeight
    );
  });

  ctx.closePath();
  ctx.fillStyle = `${RISK_CONFIG.colors[zone.severity]}80`;
  ctx.fill();
  ctx.strokeStyle = RISK_CONFIG.colors[zone.severity];
  ctx.lineWidth = 2;
  ctx.stroke();

  const center = calculateZoneCenter(zone, mapWidth, mapHeight);
  ctx.fillStyle = '#000';
  ctx.font = 'bold 14px Arial';
  ctx.fillText(getRiskSymbol(zone.category), center.x, center.y);
}

function calculateZoneCenter(
  zone: RiskZone,
  mapWidth: number,
  mapHeight: number
): { x: number; y: number } {
  let xSum = 0;
  let ySum = 0;

  zone.coordinates.forEach(coord => {
    xSum += coord[0];
    ySum += coord[1];
  });

  return {
    x: (xSum / zone.coordinates.length / 100) * mapWidth,
    y: (ySum / zone.coordinates.length / 100) * mapHeight
  };
}

function generateUniqueId(): string {
  return Math.random().toString(36).substr(2, 9);
}

export function categorizeRisk(description: string): RiskCategory {
  if (description.includes('caída') || description.includes('choque')) {
    return 'seguridad';
  }
  if (description.includes('químico') || description.includes('ruido')) {
    return 'higienico';
  }
  if (description.includes('postura') || description.includes('carga')) {
    return 'musculo_esqueletico';
  }
  return 'psicosocial';
}

export function determineSeverity(probability: number, impact: number): RiskSeverity {
  const score = probability * impact;
  if (score > 8) return 'critico';
  if (score > 5) return 'alto';
  if (score > 2) return 'medio';
  return 'bajo';
}
