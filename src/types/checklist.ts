// Interface for the structure of a single checklist item within a category
export interface ChecklistSubItem {
  descripcion: string;
  criterios: string[];
  normativa?: string; // Optional based on original structure
  riesgoAsociado?: string; // Optional based on original structure
}

// Interface for a category within the checklist
export interface ChecklistCategory {
  categoria: string;
  items: ChecklistSubItem[];
}

// Interface for the expected response structure from the generateChecklist AI service
export interface ChecklistResponse {
  checklist: ChecklistCategory[];
  // Add other potential fields from the response if known
}

// Interface for the expected response structure from suggestion services
export interface SuggestionResponse {
  suggestions: string[];
  // Add other potential fields from the response if known
}

// Interface for the form data used in the Checklist component
export interface ChecklistFormData {
  tipo: string;
  area: string;
  pais: string;
  actividades: string[];
  riesgosEspecificos: string;
  normativasAplicables: string;
}
