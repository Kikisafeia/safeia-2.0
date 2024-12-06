export interface RiskPoint {
  id: string;
  x: number;
  y: number;
  type: RiskType;
  description: string;
  severity: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  controls: string[];
  radius: number; // Radio de influencia del riesgo
}

export type RiskType = 
  | 'Mecánico'
  | 'Eléctrico'
  | 'Químico'
  | 'Biológico'
  | 'Ergonómico'
  | 'Físico'
  | 'Psicosocial'
  | 'Locativo';

export interface RiskZone {
  id: string;
  points: [number, number][]; // Polígono que define la zona
  type: RiskType;
  description: string;
  severity: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
  controls: string[];
}

export interface RiskMap {
  id: string;
  name: string;
  imageUrl: string;
  width: number;
  height: number;
  points: RiskPoint[];
  zones: RiskZone[];
  scale: number; // escala en metros por pixel
  lastUpdated: string;
}
