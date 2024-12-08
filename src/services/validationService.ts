import { z } from 'zod';

// Esquemas de validación para diferentes tipos de datos
export const userInputSchema = z.object({
  prompt: z
    .string()
    .min(1, 'El prompt no puede estar vacío')
    .max(1000, 'El prompt es demasiado largo')
    .trim(),
  temperature: z
    .number()
    .min(0, 'La temperatura debe ser mayor o igual a 0')
    .max(1, 'La temperatura debe ser menor o igual a 1')
    .optional(),
  maxTokens: z
    .number()
    .int()
    .min(1, 'El número de tokens debe ser mayor a 0')
    .max(2048, 'El número de tokens debe ser menor a 2048')
    .optional(),
});

export const fileSchema = z.object({
  name: z.string().min(1, 'El nombre del archivo es requerido'),
  type: z.string().refine((val) => {
    const allowedTypes = ['text/plain', 'application/json', 'text/markdown'];
    return allowedTypes.includes(val);
  }, 'Tipo de archivo no permitido'),
  size: z.number().max(5 * 1024 * 1024, 'El archivo no debe exceder 5MB'),
});

// Función para sanitizar strings
export const sanitizeString = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Elimina tags HTML
    .replace(/[&]/g, '&amp;') // Escapa caracteres especiales
    .replace(/["']/g, '') // Elimina comillas
    .trim();
};

// Función para validar URLs
export const validateUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Función para validar y sanitizar entradas de usuario
export const validateAndSanitizeInput = (input: unknown) => {
  try {
    const result = userInputSchema.parse(input);
    return {
      isValid: true,
      data: {
        ...result,
        prompt: sanitizeString(result.prompt),
      },
      error: null,
    };
  } catch (error) {
    return {
      isValid: false,
      data: null,
      error: error instanceof Error ? error.message : 'Error de validación',
    };
  }
};

// Función para validar archivos
export const validateFile = (file: File) => {
  try {
    fileSchema.parse({
      name: file.name,
      type: file.type,
      size: file.size,
    });
    return true;
  } catch {
    return false;
  }
};

// Función para validar y sanitizar parámetros de consulta
export const validateQueryParams = (params: Record<string, unknown>) => {
  const sanitizedParams: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(params)) {
    if (typeof value === 'string') {
      sanitizedParams[sanitizeString(key)] = sanitizeString(value);
    }
  }
  
  return sanitizedParams;
};
