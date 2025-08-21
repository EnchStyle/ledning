/**
 * Logger Service
 * Centralized logging for production-ready error tracking
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogContext {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private logs: LogContext[] = [];
  private maxLogs = 1000;

  private formatLog(level: LogLevel, message: string, error?: Error, context?: string, metadata?: Record<string, unknown>): LogContext {
    const errorObj = error as Error & { code?: string };
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? {
        name: errorObj.name || 'Unknown',
        message: errorObj.message || String(error),
        stack: errorObj.stack,
        code: errorObj.code,
      } : undefined,
      metadata,
    };
  }

  private output(log: LogContext): void {
    // Store log
    this.logs.push(log);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output in development
    if (this.isDevelopment) {
      const prefix = `[${log.timestamp}] [${log.level.toUpperCase()}]${log.context ? ` [${log.context}]` : ''}`;
      
      switch (log.level) {
        case LogLevel.ERROR:
          console.error(prefix, log.message, log.error || '', log.metadata || '');
          break;
        case LogLevel.WARN:
          console.warn(prefix, log.message, log.metadata || '');
          break;
        case LogLevel.INFO:
          console.info(prefix, log.message, log.metadata || '');
          break;
        case LogLevel.DEBUG:
          console.log(prefix, log.message, log.metadata || '');
          break;
      }
    }

    // In production, this would send to external service (Sentry, LogRocket, etc.)
    if (!this.isDevelopment && log.level === LogLevel.ERROR) {
      // Example: Sentry integration
      // if (window.Sentry) {
      //   window.Sentry.captureException(log.error || new Error(log.message), {
      //     contexts: {
      //       custom: {
      //         context: log.context,
      //         metadata: log.metadata,
      //       },
      //     },
      //   });
      // }
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    const log = this.formatLog(LogLevel.DEBUG, message, undefined, undefined, metadata);
    this.output(log);
  }

  info(message: string, context?: string, metadata?: Record<string, unknown>): void {
    const log = this.formatLog(LogLevel.INFO, message, undefined, context, metadata);
    this.output(log);
  }

  warn(message: string, context?: string, metadata?: Record<string, unknown>): void {
    const log = this.formatLog(LogLevel.WARN, message, undefined, context, metadata);
    this.output(log);
  }

  error(message: string, error?: unknown, context?: string, metadata?: Record<string, unknown>): void {
    const log = this.formatLog(
      LogLevel.ERROR, 
      message, 
      error as Error, 
      context, 
      metadata
    );
    this.output(log);
  }

  // Get recent logs for debugging
  getLogs(level?: LogLevel, limit: number = 100): LogContext[] {
    let filtered = this.logs;
    if (level) {
      filtered = this.logs.filter(log => log.level === level);
    }
    return filtered.slice(-limit);
  }

  // Clear logs
  clearLogs(): void {
    this.logs = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const logger = new Logger();

// Re-export for backward compatibility
export const logError = (error: unknown, context: string, details?: Record<string, unknown>): void => {
  logger.error(
    error instanceof Error ? error.message : String(error),
    error,
    context,
    details
  );
};