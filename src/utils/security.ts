/**
 * Utilidades de seguridad para la aplicación
 */

/**
 * @module securityUtils
 */

/**
 * Sanitiza una cadena de texto para reducir el riesgo de XSS.
 * 
 * **Importante sobre la prevención de XSS en React:**
 * - **JSX es la primera línea de defensa:** React (cuando se usa JSX) automáticamente escapa
 *   los valores insertados en el DOM. Por ejemplo, `<div>{userInput}</div>` es seguro
 *   contra XSS porque React convierte caracteres especiales como `<` y `>` en sus
 *   entidades HTML (`&lt;` y `&gt;`). Esta es la forma principal y más efectiva
 *   de prevenir XSS en componentes React.
 * 
 * - **Este sanitizador es un enfoque de lista negra:** La función `sanitizeInput` a continuación
 *   intenta eliminar o escapar patrones conocidos como peligrosos. Sin embargo, las listas negras
 *   son inherentemente imperfectas y podrían no cubrir todas las posibles vulnerabilidades XSS.
 *   Debe usarse con precaución y principalmente para:
 *     a) Contextos que no son HTML (por ejemplo, si el input se usa en atributos `href` de forma insegura,
 *        o en logs del lado del servidor donde el HTML no se interpreta directamente pero podría
 *        serlo en otro sistema).
 *     b) Como una medida de defensa en profundidad, no como la única protección.
 * 
 * - **Para renderizar HTML de fuentes no confiables:** Si necesitas renderizar HTML que proviene
 *   de una fuente no confiable (por ejemplo, un editor WYSIWYG donde los usuarios pueden ingresar
 *   HTML enriquecido), NO confíes solo en esta función. En su lugar, usa una biblioteca robusta
 *   diseñada específicamente para la sanitización de HTML, como DOMPurify. DOMPurify analiza
 *   el HTML, elimina cualquier contenido malicioso y devuelve HTML seguro.
 * 
 * @param {string} input - La cadena de texto a sanitizar.
 * @returns {string} La cadena de texto sanitizada.
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
    // El hostname debe ser exactamente uno de los dominios permitidos o un subdominio directo.
    return SECURITY_CONSTANTS.ALLOWED_DOMAINS.some(domain =>
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
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
