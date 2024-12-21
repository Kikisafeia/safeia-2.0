// Tipos básicos
export type RiskSeverity = 'bajo' | 'medio' | 'alto';

// Imagen ideal generada
export interface IdealScenario {
  imageUrl: string;
  description: string;
  improvements: string[];
  generatedDate: string;
}

// Riesgo identificado
export interface Risk {
  id: string;
  description: string;
  severity: RiskSeverity;
  location: string;
  consequences: string;
  controls: string[];
  idealScenario?: IdealScenario;  // Escenario ideal generado por DALL-E
  actionPlan: {
    action: string;
    responsible: string;
    deadline: string;
    status: 'pendiente' | 'en_progreso' | 'completado';
  }[];
}

// Análisis de riesgos
export interface RiskAnalysis {
  id: string;
  imageUrl: string;
  date: string;
  location: string;
  description: string;
  risks: Risk[];
  summary: string;
  idealScenarios?: IdealScenario[];  // Colección de escenarios ideales generados
}

// Captura de imagen
export interface ImageCapture {
  type: 'upload' | 'camera';
  data: string | File;
}

// Configuración para la generación de imágenes
export interface ImageGenerationConfig {
  model: 'dall-e-3';
  quality: 'standard' | 'hd';
  style: 'natural' | 'vivid';
  size: '1024x1024' | '1792x1024' | '1024x1792';
}

// Respuesta de la generación de imagen
export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}
