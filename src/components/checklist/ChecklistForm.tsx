import React, { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, Sparkles } from 'lucide-react';
import SuggestionButton from './SuggestionButton';
import ActivityChips from './ActivityChips';
import useSuggestions from '../../hooks/useSuggestions';

interface ChecklistFormData {
  tipo: string;
  area: string;
  pais: string;
  actividades: string[];
  riesgosEspecificos: string;
  normativasAplicables: string;
}

const schema = yup.object().shape({
  tipo: yup.string().required('El tipo es obligatorio'),
  area: yup.string().required('El área es obligatoria'),
  pais: yup.string().required('El país es obligatorio'),
  actividades: yup.array().of(yup.string().required()).min(1, 'Debe agregar al menos una actividad').required('Debe agregar al menos una actividad'),
  riesgosEspecificos: yup.string().ensure(),
  normativasAplicables: yup.string().ensure(),
});

interface ChecklistFormProps {
  onSubmit: (formData: ChecklistFormData) => Promise<void>;
  isGenerating: boolean;
  initialFormData?: Partial<ChecklistFormData>;
}

const ChecklistForm: React.FC<ChecklistFormProps> = ({ onSubmit, isGenerating, initialFormData }) => {
  const { register, handleSubmit, control, formState: { errors }, watch, setValue, getValues } = useForm<ChecklistFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      tipo: initialFormData?.tipo || '',
      area: initialFormData?.area || '',
      pais: initialFormData?.pais || '',
      actividades: initialFormData?.actividades || [],
      riesgosEspecificos: initialFormData?.riesgosEspecificos || '',
      normativasAplicables: initialFormData?.normativasAplicables || '',
    }
  });

  const [currentActivity, setCurrentActivity] = useState('');
  
  const watchedTipo = watch('tipo');
  const watchedArea = watch('area');
  const watchedPais = watch('pais');
  const watchedActivities = watch('actividades', []);

  const { 
    suggestActivities, 
    suggestRisks, 
    suggestNorms, 
    isLoadingActivities, 
    isLoadingRisks, 
    isLoadingNorms, 
    error: suggestionHookError, 
    clearError: clearSuggestionHookError 
  } = useSuggestions({ 
    tipo: watchedTipo, 
    area: watchedArea, 
    pais: watchedPais, 
    actividades: watchedActivities 
  });

  // Memoize handlers with useCallback
  const addActivity = useCallback(() => {
    if (currentActivity.trim() && !watchedActivities.includes(currentActivity.trim())) {
      setValue('actividades', [...watchedActivities, currentActivity.trim()], { shouldValidate: true });
      setCurrentActivity('');
    }
  }, [currentActivity, watchedActivities, setValue]);

  const removeActivity = useCallback((index: number) => {
    setValue('actividades', watchedActivities.filter((_, i) => i !== index), { shouldValidate: true });
  }, [watchedActivities, setValue]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addActivity(); // Call the memoized addActivity
    }
  }, [addActivity]);

  const handleSuggestActivitiesWrapper = useCallback(async () => {
    const suggestions = await suggestActivities();
    if (suggestions.length > 0) {
      const currentActs = getValues('actividades') || [];
      const newActivities = suggestions.filter(sugg => !currentActs.includes(sugg));
      setValue('actividades', [...currentActs, ...newActivities], { shouldValidate: true });
    }
  }, [suggestActivities, getValues, setValue]);

  const handleSuggestRisksWrapper = useCallback(async () => {
    const suggestions = await suggestRisks();
    if (suggestions.length > 0) {
      const currentRisks = getValues('riesgosEspecificos');
      setValue('riesgosEspecificos', currentRisks
          ? `${currentRisks}\n${suggestions.join('\n')}`
          : suggestions.join('\n'), { shouldValidate: true });
    }
  }, [suggestRisks, getValues, setValue]);

  const handleSuggestNormsWrapper = useCallback(async () => {
    const suggestions = await suggestNorms();
    if (suggestions.length > 0) {
      const currentNorms = getValues('normativasAplicables');
      setValue('normativasAplicables', currentNorms
          ? `${currentNorms}\n${suggestions.join('\n')}`
          : suggestions.join('\n'), { shouldValidate: true });
    }
  }, [suggestNorms, getValues, setValue]);
  
  const anySuggestionLoading = isLoadingActivities || isLoadingRisks || isLoadingNorms;
  const formHasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (watchedTipo && watchedArea && watchedPais) {
      clearSuggestionHookError();
    }
  }, [watchedTipo, watchedArea, watchedPais, clearSuggestionHookError]);

  const FADE_IN_OUT_VARIANTS = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-md p-6 mb-8">
      <AnimatePresence>
        {suggestionHookError && (
          <motion.div
            variants={FADE_IN_OUT_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            role="alert"
          >
            {suggestionHookError}
          </motion.div>
        )}
        {formHasErrors && !suggestionHookError && (
           <motion.div
            variants={FADE_IN_OUT_VARIANTS}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
            role="alert"
           >
             Por favor, corrija los errores en el formulario.
           </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Lista de Verificación
          </label>
          <select
            id="tipo"
            {...register('tipo')}
            className={`w-full px-3 py-2 border rounded-md ${errors.tipo ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Seleccione un tipo</option>
            <option value="Inspección General">Inspección General</option>
            <option value="Equipos y Herramientas">Equipos y Herramientas</option>
            <option value="EPP">Elementos de Protección Personal</option>
            <option value="Orden y Limpieza">Orden y Limpieza</option>
            <option value="Ergonomía">Ergonomía</option>
            <option value="Riesgos Específicos">Riesgos Específicos</option>
          </select>
          {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo.message}</p>}
        </div>
        <div>
          <label htmlFor="area" className="block text-sm font-medium text-gray-700 mb-1">
            Área o Proceso
          </label>
          <input
            type="text"
            id="area"
            {...register('area')}
            className={`w-full px-3 py-2 border rounded-md ${errors.area ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Ej: Producción, Almacén, Oficinas"
          />
          {errors.area && <p className="text-red-500 text-xs mt-1">{errors.area.message}</p>}
        </div>
        <div>
          <label htmlFor="pais" className="block text-sm font-medium text-gray-700 mb-1">
            País
          </label>
          <select
            id="pais"
            {...register('pais')}
            className={`w-full px-3 py-2 border rounded-md ${errors.pais ? 'border-red-500' : 'border-gray-300'}`}
          >
            <option value="">Seleccione un país</option>
            <option value="Argentina">Argentina</option>
            <option value="Bolivia">Bolivia</option>
            <option value="Chile">Chile</option>
            <option value="Colombia">Colombia</option>
            <option value="Ecuador">Ecuador</option>
            <option value="España">España</option>
            <option value="Mexico">México</option>
            <option value="Peru">Perú</option>
            <option value="Uruguay">Uruguay</option>
            <option value="Venezuela">Venezuela</option>
          </select>
          {errors.pais && <p className="text-red-500 text-xs mt-1">{errors.pais.message}</p>}
        </div>
      </div>

      <div className="mt-6">
        <label htmlFor="currentActivity" className="block text-sm font-medium text-gray-700 mb-2">
          Actividades a Evaluar
        </label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            id="currentActivity"
            value={currentActivity}
            onChange={(e) => setCurrentActivity(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Ingrese una actividad y presione Enter"
          />
          <button
            type="button"
            onClick={addActivity}
            className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            aria-label="Añadir actividad"
          >
            <Plus className="w-5 h-5" />
          </button>
          <SuggestionButton
            onClick={handleSuggestActivitiesWrapper}
            isLoading={isLoadingActivities}
            disabled={!watchedTipo || !watchedArea || !watchedPais || isLoadingActivities}
            title="Sugerir actividades con IA (requiere Tipo, Área y País)"
            buttonText=""
            icon={<Sparkles className="w-5 h-5" />}
            aria-busy={isLoadingActivities} // Add aria-busy
            aria-disabled={!watchedTipo || !watchedArea || !watchedPais || isLoadingActivities} // Add aria-disabled
          />
        </div>
        <Controller
            name="actividades"
            control={control}
            render={({ field }) => (
              <AnimatePresence mode="popLayout">
                <motion.div layout>
                  <ActivityChips activities={field.value || []} onRemoveActivity={removeActivity} />
                </motion.div>
              </AnimatePresence>
            )}
        />
        {errors.actividades && <p className="text-red-500 text-xs mt-1">{errors.actividades.message}</p>}
        <AnimatePresence>
        { (isLoadingActivities && watchedActivities.length === 0) && 
            <motion.p 
              variants={FADE_IN_OUT_VARIANTS} 
              initial="hidden" 
              animate="visible" 
              exit="exit" 
              className="text-sm text-gray-500"
            >
              Buscando sugerencias de actividades...
            </motion.p> 
        }
        </AnimatePresence>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="riesgosEspecificos" className="block text-sm font-medium text-gray-700">
            Riesgos Específicos
          </label>
          <SuggestionButton
            onClick={handleSuggestRisksWrapper}
            isLoading={isLoadingRisks}
            disabled={!watchedTipo || !watchedArea || !watchedPais || isLoadingRisks}
            title="Sugerir riesgos con IA (requiere Tipo, Área y País)"
            buttonText="Sugerir"
            icon={<Sparkles className="w-4 h-4" />}
            aria-busy={isLoadingRisks} // Add aria-busy
            aria-disabled={!watchedTipo || !watchedArea || !watchedPais || isLoadingRisks} // Add aria-disabled
          />
        </div>
        <textarea
          id="riesgosEspecificos"
          {...register('riesgosEspecificos')}
          className={`w-full px-3 py-2 border rounded-md ${errors.riesgosEspecificos ? 'border-red-500' : 'border-gray-300'}`}
          rows={3}
          placeholder="Liste los riesgos específicos o use el botón de sugerencias IA"
          inputMode="text"
        />
        {errors.riesgosEspecificos && <p className="text-red-500 text-xs mt-1">{errors.riesgosEspecificos.message}</p>}
        <AnimatePresence>
        {isLoadingRisks && 
            <motion.p 
              variants={FADE_IN_OUT_VARIANTS} 
              initial="hidden" 
              animate="visible" 
              exit="exit" 
              className="text-sm text-gray-500 mt-1"
            >
              Buscando sugerencias de riesgos...
            </motion.p>
        }
        </AnimatePresence>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <label htmlFor="normativasAplicables" className="block text-sm font-medium text-gray-700">
            Normativas Aplicables
          </label>
          <SuggestionButton
            onClick={handleSuggestNormsWrapper}
            isLoading={isLoadingNorms}
            disabled={!watchedTipo || !watchedArea || !watchedPais || isLoadingNorms}
            title="Sugerir normativas con IA (requiere Tipo, Área y País)"
            buttonText="Sugerir"
            icon={<Sparkles className="w-4 h-4" />}
            aria-busy={isLoadingNorms} // Add aria-busy
            aria-disabled={!watchedTipo || !watchedArea || !watchedPais || isLoadingNorms} // Add aria-disabled
          />
        </div>
        <textarea
          id="normativasAplicables"
          {...register('normativasAplicables')}
          className={`w-full px-3 py-2 border rounded-md ${errors.normativasAplicables ? 'border-red-500' : 'border-gray-300'}`}
          rows={3}
          placeholder="Especifique normativas o use el botón de sugerencias IA"
          inputMode="text"
        />
        {errors.normativasAplicables && <p className="text-red-500 text-xs mt-1">{errors.normativasAplicables.message}</p>}
        <AnimatePresence>
        {isLoadingNorms && 
            <motion.p 
              variants={FADE_IN_OUT_VARIANTS} 
              initial="hidden" 
              animate="visible" 
              exit="exit" 
              className="text-sm text-gray-500 mt-1"
            >
              Buscando sugerencias de normativas...
            </motion.p>
        }
        </AnimatePresence>
      </div>

      <button
        type="submit"
        disabled={isGenerating || anySuggestionLoading || formHasErrors}
        className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center"
      >
        {isGenerating ? (
          <>
            <Loader2 className="animate-spin mr-2" />
            Generando lista de verificación...
          </>
        ) : (
          'Generar Lista de Verificación'
        )}
      </button>
    </form>
  );
};

export default ChecklistForm;
