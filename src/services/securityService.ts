import DOMPurify from 'dompurify';
import { rateLimit } from 'express-rate-limit';

// Configuración de sanitización HTML
const sanitizerConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  ALLOWED_ATTR: ['href', 'target'],
  ALLOW_DATA_ATTR: false,
};

// Sanitizar contenido HTML
export const sanitizeHtml = (content: string): string => {
  return DOMPurify.sanitize(content, sanitizerConfig);
};

// Sanitizar objetos JSON
export const sanitizeJson = (data: unknown): unknown => {
  if (typeof data === 'string') {
    return sanitizeHtml(data);
  }
  
  if (Array.isArray(data)) {
    return data.map(item => sanitizeJson(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeJson(value);
    }
    return sanitized;
  }
  
  return data;
};

// Configuración de rate limiting
export const createRateLimiter = (
  windowMs = 15 * 60 * 1000, // 15 minutos por defecto
  max = 100 // 100 solicitudes por ventana por defecto
) => {
  return rateLimit({
    windowMs,
    max,
    message: 'Demasiadas solicitudes desde esta IP, por favor intente más tarde',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Validar y sanitizar headers
export const sanitizeHeaders = (headers: Record<string, string>): Record<string, string> => {
  const sanitizedHeaders: Record<string, string> = {};
  const allowedHeaders = [
    'content-type',
    'accept',
    'authorization',
    'user-agent',
  ];

  for (const [key, value] of Object.entries(headers)) {
    if (allowedHeaders.includes(key.toLowerCase())) {
      sanitizedHeaders[key] = sanitizeHtml(value);
    }
  }

  return sanitizedHeaders;
};

// Generar nonce para CSP
export const generateNonce = (): string => {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(16))).toString('base64');
};

// Configuración de Content Security Policy
export const getCSPDirectives = (nonce: string): string => {
  return `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim();
};

// Validar origen de las solicitudes
export const validateOrigin = (origin: string | undefined, allowedOrigins: string[]): boolean => {
  if (!origin) return false;
  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true;
    if (allowed.startsWith('*.')) {
      const domain = allowed.slice(2);
      return origin.endsWith(domain);
    }
    return origin === allowed;
  });
};

// Configuración de seguridad para cookies
export const getSecureCookieOptions = (isProd = false) => ({
  httpOnly: true,
  secure: isProd,
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 24 * 60 * 60 * 1000, // 24 horas
});
