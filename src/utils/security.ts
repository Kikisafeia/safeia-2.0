/**
 * Utilidades de seguridad para la aplicación
 */

/**
 * Sanitiza el input para prevenir XSS y otros ataques
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  // Eliminar caracteres potencialmente peligrosos
  let sanitized = input
    .replace(/[<>]/g, '') // Eliminar < y >
    .replace(/javascript:/gi, '') // Eliminar javascript:
    .replace(/on\w+=/gi, '') // Eliminar eventos inline
    .replace(/\b(alert|confirm|prompt|exec|eval|Function)\b/gi, ''); // Eliminar funciones peligrosas
  
  // Escapar caracteres especiales
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
  
  return sanitized.trim();
}

/**
 * Valida una URL para asegurarse de que es segura
 */
export function validateUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    // Verificar protocolo
    if (!parsedUrl.protocol.startsWith('https')) {
      return false;
    }
    // Verificar dominio permitido
    return SECURITY_CONSTANTS.ALLOWED_DOMAINS.some(domain => 
      parsedUrl.hostname.endsWith(domain)
    );
  } catch {
    return false;
  }
}

/**
 * Valida un objeto JSON para asegurarse de que es seguro
 */
export function validateJSON(json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    // Verificar profundidad máxima para prevenir ataques DoS
    const maxDepth = 10;
    
    function checkDepth(obj: any, depth = 0): boolean {
      if (depth > maxDepth) return false;
      if (typeof obj !== 'object' || obj === null) return true;
      
      return Object.values(obj).every(value => checkDepth(value, depth + 1));
    }
    
    return checkDepth(parsed);
  } catch {
    return false;
  }
}

/**
 * Constantes de seguridad
 */
export const SECURITY_CONSTANTS = {
  MAX_STRING_LENGTH: 1000,
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_DOMAINS: [
    'safeiavision.openai.azure.com',
    'chat-tecnova.openai.azure.com'
  ],
  MAX_REQUEST_SIZE: 10 * 1024 * 1024, // 10MB
  RATE_LIMIT: {
    MAX_REQUESTS: 100,
    WINDOW_MS: 60000 // 1 minuto
  },
  SECURITY_HEADERS: {
    'Content-Security-Policy': "default-src 'self'; img-src 'self' https:; script-src 'self'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }
};

/**
 * Valida el tamaño y tipo de un archivo
 */
export function validateFile(file: File): boolean {
  return (
    file.size <= SECURITY_CONSTANTS.MAX_FILE_SIZE &&
    SECURITY_CONSTANTS.ALLOWED_MIME_TYPES.includes(file.type)
  );
}

/**
 * Genera un ID seguro
 */
export function generateSecureId(): string {
  const array = new Uint32Array(2);
  crypto.getRandomValues(array);
  return Array.from(array, x => x.toString(16)).join('');
}

/**
 * Sanitiza los datos de entrada para una solicitud API
 */
export function sanitizeApiInput(data: any): any {
  if (typeof data !== 'object' || data === null) {
    return sanitizeInput(String(data));
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeApiInput(value);
    } else {
      sanitized[key] = sanitizeInput(String(value));
    }
  }
  return sanitized;
}
