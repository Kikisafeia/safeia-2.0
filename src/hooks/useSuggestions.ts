import { useState, useCallback } from 'react';
import {
  suggestActivitiesForChecklist,
  suggestRisksForChecklist,
  suggestNormsForChecklist,
} from '../services/aiService'; // Updated import path

interface SuggestionParams {
  tipo: string;
  area: string;
  pais: string;
  actividades?: string[]; // Opcional para sugerencia de actividades y riesgos
}

interface UseSuggestionsOutput {
  // The hook itself will return the array, simplifying component usage
  suggestActivities: () => Promise<string[]>; 
  suggestRisks: () => Promise<string[]>;
  suggestNorms: () => Promise<string[]>;
  isLoadingActivities: boolean;
  isLoadingRisks: boolean;
  isLoadingNorms: boolean;
  error: string | null;
  clearError: () => void;
}

const useSuggestions = (params: SuggestionParams): UseSuggestionsOutput => {
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);
  const [isLoadingRisks, setIsLoadingRisks] = useState(false);
  const [isLoadingNorms, setIsLoadingNorms] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  // Updated to return string[] after extracting from SuggestionResponse
  const suggestActivities = useCallback(async (): Promise<string[]> => {
    if (!params.tipo || !params.area) {
      setError("Tipo y Área son requeridos para sugerir actividades.");
      return [];
    }
    setIsLoadingActivities(true);
    setError(null);
    try {
      const response = await suggestActivitiesForChecklist(params.tipo, params.area);
      return response.suggestions || []; // Extract suggestions array
    } catch (err) {
      console.error('Error sugiriendo actividades:', err);
      setError('Error al sugerir actividades. Intente nuevamente.');
      return [];
    } finally {
      setIsLoadingActivities(false);
    }
  }, [params]);

  // Updated to return string[] after extracting from SuggestionResponse
  const suggestRisks = useCallback(async (): Promise<string[]> => {
    if (!params.tipo || !params.area || !params.actividades) {
      setError("Tipo, Área y Actividades son requeridos para sugerir riesgos.");
      return [];
    }
    setIsLoadingRisks(true);
    setError(null);
    try {
      const response = await suggestRisksForChecklist(params.tipo, params.area, params.actividades);
      return response.suggestions || []; // Extract suggestions array
    } catch (err) {
      console.error('Error sugiriendo riesgos:', err);
      setError('Error al sugerir riesgos. Intente nuevamente.');
      return [];
    } finally {
      setIsLoadingRisks(false);
    }
  }, [params]);

  // Updated to return string[] after extracting from SuggestionResponse
  const suggestNorms = useCallback(async (): Promise<string[]> => {
    if (!params.tipo || !params.area || !params.pais) {
      setError("Tipo, Área y País son requeridos para sugerir normativas.");
      return [];
    }
    setIsLoadingNorms(true);
    setError(null);
    try {
      const response = await suggestNormsForChecklist(params.tipo, params.area, params.pais);
      return response.suggestions || []; // Extract suggestions array
    } catch (err) {
      console.error('Error sugiriendo normativas:', err);
      setError('Error al sugerir normativas. Intente nuevamente.');
      return [];
    } finally {
      setIsLoadingNorms(false);
    }
  }, [params]);

  return {
    suggestActivities,
    suggestRisks,
    suggestNorms,
    isLoadingActivities,
    isLoadingRisks,
    isLoadingNorms,
    error,
    clearError,
  };
};

export default useSuggestions;
