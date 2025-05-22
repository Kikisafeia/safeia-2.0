// Risk categories according to Chilean regulations
export type RiskCategory = 
  | 'seguridad'       // Safety risks
  | 'higienico'       // Hygiene risks
  | 'musculo_esqueletico' // Musculoskeletal
  | 'psicosocial';    // Psychosocial

// Official severity levels  
export type RiskSeverity = 'bajo' | 'medio' | 'alto' | 'critico';

// Coordinates in percentage (0-100) of the map dimensions
interface Coordinates {
  x: number;
  y: number;
}

// Risk point definition
export interface RiskPoint {
  id: string;
  name: string;
  coordinates: Coordinates;
  category: 'seguridad' | 'higienico' | 'musculo_esqueletico' | 'psicosocial';
  severity: 'bajo' | 'medio' | 'alto' | 'critico';
  description: string;
  probability: number; // 1-10
  impact: number; // 1-10
  mitigation?: string;
  recommendations: string[];
}

// Risk zone definition (polygon area)
export interface RiskZone {
  id: string;
  coordinates: [number, number][]; // Array of [x,y] coordinates in percentage
  category: 'seguridad' | 'higienico' | 'musculo_esqueletico' | 'psicosocial';
  severity: 'bajo' | 'medio' | 'alto' | 'critico';
  description: string;
  probability: number; // 1-10
  impact: number; // 1-10
  mitigation?: string;
  recommendations: string[];
}

// Complete risk map definition
export interface RiskMap {
  id: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  points: RiskPoint[];
  zones: RiskZone[];
  lastUpdated: string;
  status: 'borrador' | 'revision' | 'aprobado';
  // New fields for image analysis
  imageAnalysis?: {
    detectedElements: {
      type: string;
      coordinates: {x: number; y: number; width: number; height: number};
      confidence: number;
    }[];
    suggestedRisks: Array<{
      type: string;
      category: RiskCategory;
      description: string;
      confidence: number;
      recommendedPosition: {x: number; y: number};
    }>;
  };
  // Editing metadata
  editorMetadata?: {
    lastEditor: string;
    editHistory: Array<{
      timestamp: string;
      action: string;
      details: string;
    }>;
  };
}

// Risk assessment result
export interface RiskAssessment {
  map: RiskMap;
  score: number;
  criticalRisks: number;
  highRisks: number;
  mediumRisks: number;
  lowRisks: number;
}
