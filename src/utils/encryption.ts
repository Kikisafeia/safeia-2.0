import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-do-not-use-in-production';

/**
 * Encripta datos sensibles
 */
export function encryptData(data: string): string {
  try {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Error al encriptar datos:', error);
    return '';
  }
}

/**
 * Desencripta datos
 */
export function decryptData(encryptedData: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Error al desencriptar datos:', error);
    return '';
  }
}

/**
 * Genera un hash seguro
 */
export function generateHash(data: string): string {
  return CryptoJS.SHA256(data).toString();
}

/**
 * Verifica un hash
 */
export function verifyHash(data: string, hash: string): boolean {
  const computedHash = generateHash(data);
  return computedHash === hash;
}
