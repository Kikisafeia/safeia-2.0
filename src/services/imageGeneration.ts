import { ImageGenerationConfig, IdealScenario } from '../types/riskMap'; // ImageGenerationResponse might not be needed
// import OpenAI from 'openai'; // No longer needed
import { generateImage as generateImageViaProxy } from './aiService'; // Import the proxy function
import { encryptData } from '../utils/encryption'; // decryptData might not be needed
import { rateLimit } from '../utils/rateLimit';
import { sanitizeInput } from '../utils/security';
import { logger } from '../utils/logger';

// Constantes de seguridad
const MAX_REQUESTS_PER_MINUTE = 10; // This client-side rate limit might still be useful
const MAX_PROMPT_LENGTH = 1000;
// ALLOWED_IMAGE_SIZES and ALLOWED_QUALITIES might be irrelevant if proxy fixes them
// const ALLOWED_IMAGE_SIZES = ['1024x1024', '1792x1024', '1024x1792'] as const;
// const ALLOWED_QUALITIES = ['standard', 'hd'] as const;

// No direct OpenAI client instantiation
// const openai = new OpenAI({ ... }); // REMOVED

// validateConfig is no longer needed as we don't use direct env vars for OpenAI client here
// const validateConfig = () => { ... }; // REMOVED

// Validación de parámetros de entrada (can be kept for prompt construction)
const validateGenerationParams = (
  description: string,
  improvements: string[]
  // config: Partial<ImageGenerationConfig> // Config for size/quality might not be passable to proxy
) => {
  if (!description || description.length > MAX_PROMPT_LENGTH) {
    throw new Error(`La descripción debe tener entre 1 y ${MAX_PROMPT_LENGTH} caracteres`);
  }

  if (!Array.isArray(improvements) || improvements.length === 0) {
    throw new Error('Se requiere al menos una mejora');
  }

  improvements.forEach((improvement, index) => {
    if (!improvement || improvement.length > MAX_PROMPT_LENGTH) {
      throw new Error(`Mejora ${index + 1} inválida`);
    }
  });

  // Validation for config.size and config.quality removed as they might not be used
};

export async function generateIdealScenario(
  description: string,
  improvements: string[],
  // config: Partial<ImageGenerationConfig> = {} // Config might be mostly ignored
): Promise<IdealScenario> {
  try {
    // Validaciones de seguridad
    // validateConfig(); // REMOVED
    validateGenerationParams(description, improvements);

    // Rate limiting (client-side, consider if still needed/effective)
    await rateLimit('generateImage', MAX_REQUESTS_PER_MINUTE);

    // Sanitizar inputs
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedImprovements = improvements.map(sanitizeInput);

    // Crear prompt seguro
    // The generateImageViaProxy in aiService prepends "Imagen profesional sobre seguridad laboral: "
    // So we adjust the prompt here.
    const specificPromptContent = `un escenario ideal de lugar de trabajo que muestra:
    
    Situación original: ${sanitizedDescription}
    
    Con las siguientes mejoras de seguridad implementadas:
    ${sanitizedImprovements.map(imp => `- ${imp}`).join('\n')}
    
    La imagen debe estar bien iluminada, ser clara y demostrar estándares de seguridad profesionales en un entorno de trabajo realista.
    Enfóquese en mostrar las mejoras de una manera que contraste claramente con la situación original.`;

    // Configuración de tamaño/calidad no se pasa al proxy directamente por aiService.generateImage
    // const defaultConfig: ImageGenerationConfig = { ... }; // REMOVED
    // const finalConfig = { ...defaultConfig, ...config }; // REMOVED

    logger.info('Iniciando generación de imagen via proxy');

    // Generar imagen con manejo de errores usando el proxy
    const imageUrl = await generateImageViaProxy(specificPromptContent).catch(error => {
      logger.error('Error en la generación de imagen via proxy', { error });
      throw error;
    });

    if (!imageUrl) {
      throw new Error('Respuesta inválida del servicio de generación de imágenes (URL vacía)');
    }

    // Crear escenario ideal con datos sanitizados
    const idealScenario: IdealScenario = {
      imageUrl: imageUrl,
      description: sanitizeInput(`Escenario mejorado que implementa: ${sanitizedImprovements.join(', ')}`),
      improvements: sanitizedImprovements,
      generatedDate: new Date().toISOString()
    };

    logger.info('Imagen generada exitosamente via proxy', {
      scenarioId: encryptData(idealScenario.imageUrl) // Encrypting URL might not be necessary if it's just for logging
    });

    return idealScenario;
  } catch (error) {
    logger.error('Error en generateIdealScenario', { error });
    // Preserve original error type if possible, otherwise wrap
    if (error instanceof Error) {
        throw new Error(`Error al generar escenario ideal: ${error.message}`);
    }
    throw new Error('Error desconocido al generar escenario ideal');
  }
}

export async function generateIdealScenarios(
  risks: Array<{ description: string; improvements: string[] }>,
  // config?: Partial<ImageGenerationConfig> // Config might be mostly ignored
): Promise<IdealScenario[]> {
  // validateConfig(); // REMOVED

  const scenarios: IdealScenario[] = [];
  const errors: string[] = [];
  let processedCount = 0;

  for (const risk of risks) {
    try {
      // Rate limiting por lote
      if (processedCount >= MAX_REQUESTS_PER_MINUTE) {
        await new Promise(resolve => setTimeout(resolve, 60000));
        processedCount = 0;
      }

      const scenario = await generateIdealScenario(
        risk.description,
        risk.improvements
        // config // Removed as generateIdealScenario no longer accepts it
      );

      scenarios.push(scenario);
      processedCount++;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error procesando escenario', {
        riskDescription: encryptData(risk.description),
        error: errorMessage
      });
      errors.push(`Riesgo: ${sanitizeInput(risk.description)} - Error: ${errorMessage}`);
      continue;
    }
  }

  if (errors.length > 0) {
    logger.warn('Algunos escenarios no se generaron', { errorCount: errors.length });
    if (scenarios.length === 0) {
      throw new Error('No se pudo generar ningún escenario ideal');
    }
  }

  return scenarios;
}
