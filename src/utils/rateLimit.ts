interface RateLimitRecord {
  count: number;
  timestamp: number;
}

const rateLimits: Map<string, RateLimitRecord> = new Map();

/**
 * Implementa rate limiting para prevenir abuso de la API
 */
export async function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number = 60000
): Promise<void> {
  const now = Date.now();
  const record = rateLimits.get(key) || { count: 0, timestamp: now };

  // Resetear el contador si ha pasado la ventana de tiempo
  if (now - record.timestamp >= windowMs) {
    record.count = 0;
    record.timestamp = now;
  }

  // Verificar límite
  if (record.count >= maxRequests) {
    const waitTime = windowMs - (now - record.timestamp);
    throw new Error(
      `Límite de velocidad excedido. Por favor, espere ${Math.ceil(
        waitTime / 1000
      )} segundos.`
    );
  }

  // Incrementar contador
  record.count++;
  rateLimits.set(key, record);
}

/**
 * Limpia registros antiguos de rate limiting
 */
export function cleanupRateLimits(maxAge: number = 3600000): void {
  const now = Date.now();
  for (const [key, record] of rateLimits.entries()) {
    if (now - record.timestamp > maxAge) {
      rateLimits.delete(key);
    }
  }
}

// Limpiar registros antiguos cada hora
setInterval(() => cleanupRateLimits(), 3600000);
