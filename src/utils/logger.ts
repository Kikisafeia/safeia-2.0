type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private readonly MAX_LOGS = 1000;

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: this.sanitizeLogData(data)
    };

    // Almacenar log
    this.logs.push(entry);

    // Mantener un límite de logs
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(-this.MAX_LOGS);
    }

    // Enviar a la consola
    const logMethod = level === 'error' ? console.error :
                     level === 'warn' ? console.warn :
                     level === 'debug' ? console.debug :
                     console.log;

    logMethod(`[${entry.timestamp}] [${level.toUpperCase()}] ${message}`, data || '');
  }

  private sanitizeLogData(data: any): any {
    if (!data) return undefined;

    // Eliminar información sensible
    const sensitiveKeys = ['apiKey', 'password', 'token', 'secret'];
    
    if (typeof data === 'object') {
      const sanitized = { ...data };
      for (const key of Object.keys(sanitized)) {
        if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeLogData(sanitized[key]);
        }
      }
      return sanitized;
    }

    return data;
  }

  public info(message: string, data?: any) {
    this.log('info', message, data);
  }

  public warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  public error(message: string, data?: any) {
    this.log('error', message, data);
  }

  public debug(message: string, data?: any) {
    if (import.meta.env.DEV) {
      this.log('debug', message, data);
    }
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }
}

export const logger = Logger.getInstance();
