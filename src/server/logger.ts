// Structured Logger for Production Backend (Section T)
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  requestId?: string;
  tenantId?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  error?: string;
  meta?: Record<string, any>;
}

class StructuredLogger {
  private formatLog(entry: LogEntry): string {
    return JSON.stringify(entry);
  }

  public info(message: string, context?: Partial<LogEntry>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      ...context
    };
    console.log(this.formatLog(entry));
  }

  public warn(message: string, context?: Partial<LogEntry>) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      ...context
    };
    console.warn(this.formatLog(entry));
  }

  public error(message: string, errorOrContext?: Error | Partial<LogEntry>, extraContext?: Partial<LogEntry>) {
    let errorMsg: string | undefined;
    let context: Partial<LogEntry> = {};

    if (errorOrContext instanceof Error) {
      errorMsg = errorOrContext.message;
      context = { error: errorOrContext.stack || errorOrContext.message, ...extraContext };
    } else if (errorOrContext) {
      context = errorOrContext;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      ...(errorMsg ? { error: errorMsg } : {}),
      ...context
    };
    console.error(this.formatLog(entry));
  }

  public debug(message: string, context?: Partial<LogEntry>) {
    if (process.env.DEBUG || process.env.NODE_ENV !== 'production') {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: 'DEBUG',
        message,
        ...context
      };
      console.debug(this.formatLog(entry));
    }
  }
}

export const logger = new StructuredLogger();
