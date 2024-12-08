import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

class TokenService {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  // Almacena el token con httpOnly cookie en producción
  static setToken(token: string): void {
    if (import.meta.env.PROD) {
      // En producción, el token debe ser manejado por el servidor con httpOnly cookies
      console.warn('Token storage should be handled by the server in production');
    } else {
      // Solo para desarrollo
      sessionStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  static getToken(): string | null {
    if (import.meta.env.PROD) {
      // En producción, el token debe ser manejado por el servidor
      return null;
    }
    return sessionStorage.getItem(this.TOKEN_KEY);
  }

  static removeToken(): void {
    sessionStorage.removeItem(this.TOKEN_KEY);
    sessionStorage.removeItem(this.REFRESH_TOKEN_KEY);
  }

  static isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      
      return decoded.exp > currentTime;
    } catch {
      return false;
    }
  }

  static setRefreshToken(token: string): void {
    if (import.meta.env.PROD) {
      console.warn('Refresh token storage should be handled by the server in production');
    } else {
      sessionStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    }
  }

  static getRefreshToken(): string | null {
    if (import.meta.env.PROD) return null;
    return sessionStorage.getItem(this.REFRESH_TOKEN_KEY);
  }
}

export default TokenService;
