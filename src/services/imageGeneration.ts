import { ImageGenerationConfig, ImageGenerationResponse, IdealScenario } from '../types/riskMap';
import OpenAI from 'openai';
import { encryptData, decryptData } from '../utils/encryption';
import { rateLimit } from '../utils/rateLimit';
import { sanitizeInput } from '../utils/security';
import { logger } from '../utils/logger';

// Constantes de seguridad
const MAX_REQUESTS_PER_MINUTE = 10;
const MAX_PROMPT_LENGTH = 1000;
const ALLOWED_IMAGE_SIZES = ['1024x1024', '1792x1024', '1024x1792'] as const;
const ALLOWED_QUALITIES = ['standard', 'hd'] as const;

// Configuración de OpenAI con manejo seguro de credenciales
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_AZURE_DALLE_API_KEY,
  baseURL: `${import.meta.env.VITE_AZURE_DALLE_ENDPOINT}/openai/deployments/${import.meta.env.VITE_AZURE_DALLE_DEPLOYMENT}`,
  defaultQuery: { 'api-version': import.meta.env.VITE_AZURE_DALLE_API_VERSION },
  defaultHeaders: {
    'api-key': import.meta.env.VITE_AZURE_DALLE_API_KEY,
    'X-Security-Headers': 'enabled',
    'Content-Security-Policy': "default-src 'self'",
  },
  dangerouslyAllowBrowser: true,
  timeout: 30000, // 30 segundos timeout
  maxRetries: 3,
});

// Validación robusta de configuración
const validateConfig = () => {
  const requiredEnvVars = [
    'VITE_AZURE_DALLE_API_KEY',
    'VITE_AZURE_DALLE_ENDPOINT',
    'VITE_AZURE_DALLE_DEPLOYMENT',
    'VITE_AZURE_DALLE_API_VERSION'
  ];

  const missingVars = requiredEnvVars.filter(
    varName => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    logger.error('Configuración incompleta', { missingVars });
    throw new Error(
      `Error de configuración: Variables de entorno faltantes: ${missingVars.join(', ')}`
    );
  }

  // Validar formato de las variables
  const endpointUrl = new URL(import.meta.env.VITE_AZURE_DALLE_ENDPOINT);
  if (!endpointUrl.protocol.startsWith('https')) {
    throw new Error('El endpoint debe usar HTTPS');
  }
};

// Validación de parámetros de entrada
const validateGenerationParams = (
  description: string,
  improvements: string[],
  config: Partial<ImageGenerationConfig>
) => {
  // Sanitizar y validar descripción
  if (!description || description.length > MAX_PROMPT_LENGTH) {
    throw new Error(`La descripción debe tener entre 1 y ${MAX_PROMPT_LENGTH} caracteres`);
  }

  // Sanitizar y validar mejoras
  if (!Array.isArray(improvements) || improvements.length === 0) {
    throw new Error('Se requiere al menos una mejora');
  }

  improvements.forEach((improvement, index) => {
    if (!improvement || improvement.length > MAX_PROMPT_LENGTH) {
      throw new Error(`Mejora ${index + 1} inválida`);
    }
  });

  // Validar configuración
  if (config.size && !ALLOWED_IMAGE_SIZES.includes(config.size as any)) {
    throw new Error('Tamaño de imagen no válido');
  }

  if (config.quality && !ALLOWED_QUALITIES.includes(config.quality as any)) {
    throw new Error('Calidad de imagen no válida');
  }
};

export async function generateIdealScenario(
  description: string,
  improvements: string[],
  config: Partial<ImageGenerationConfig> = {}
): Promise<IdealScenario> {
  try {
    // Validaciones de seguridad
    validateConfig();
    validateGenerationParams(description, improvements, config);

    // Rate limiting
    await rateLimit('generateImage', MAX_REQUESTS_PER_MINUTE);

    // Sanitizar inputs
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedImprovements = improvements.map(sanitizeInput);

    // Crear prompt seguro
    const prompt = `Generate a photorealistic image of an ideal workplace scenario that shows:
    
    Original situation: ${sanitizedDescription}
    
    With the following safety improvements implemented:
    ${sanitizedImprovements.map(imp => `- ${imp}`).join('\n')}
    
    The image should be well-lit, clear, and demonstrate professional safety standards in a realistic work environment.
    Focus on showing the improvements in a way that clearly contrasts with the original situation.`;

    // Configuración segura
    const defaultConfig: ImageGenerationConfig = {
      model: 'dall-e-3',
      quality: 'standard',
      style: 'natural',
      size: '1024x1024'
    };

    const finalConfig = { ...defaultConfig, ...config };

    logger.info('Iniciando generación de imagen', {
      configHash: encryptData(JSON.stringify(finalConfig))
    });

    // Generar imagen con manejo de errores
    const response = await openai.images.generate({
      model: finalConfig.model,
      prompt: prompt,
      n: 1,
      size: finalConfig.size,
      quality: finalConfig.quality,
      style: finalConfig.style
    }).catch(error => {
      logger.error('Error en la generación de imagen', { error });
      throw error;
    });

    if (!response.data?.[0]?.url) {
      throw new Error('Respuesta inválida del servicio de generación de imágenes');
    }

    // Crear escenario ideal con datos sanitizados
    const idealScenario: IdealScenario = {
      imageUrl: response.data[0].url,
      description: sanitizeInput(`Escenario mejorado que implementa: ${sanitizedImprovements.join(', ')}`),
      improvements: sanitizedImprovements,
      generatedDate: new Date().toISOString()
    };

    logger.info('Imagen generada exitosamente', {
      scenarioId: encryptData(idealScenario.imageUrl)
    });

    return idealScenario;
  } catch (error) {
    logger.error('Error en generateIdealScenario', { error });
    throw new Error(
      error instanceof Error 
        ? `Error de seguridad: ${error.message}`
        : 'Error de seguridad desconocido'
    );
  }
}

export async function generateIdealScenarios(
  risks: Array<{ description: string; improvements: string[] }>,
  config?: Partial<ImageGenerationConfig>
): Promise<IdealScenario[]> {
  // Validación inicial
  validateConfig();

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
        risk.improvements,
        config
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
