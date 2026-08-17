export type LogContext = Record<string, unknown>;

export type Logger = {
  error(message: string, error?: unknown, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  timed<T>(label: string, fn: () => Promise<T>): Promise<T>;
};

const SLOW_DB_THRESHOLD_MS = 250;

export function createLogger(scope: string): Logger {
  const warn = (message: string, context?: LogContext) => {
    console.warn(`[${scope}] ${message}`, context);
  };

  return {
    error(message, error, context) {
      if (error === undefined) {
        console.error(`[${scope}] ${message}`, context);
      } else if (context === undefined) {
        console.error(`[${scope}] ${message}`, error);
      } else {
        console.error(`[${scope}] ${message}`, { ...context, error });
      }
    },
    warn(message, context) {
      warn(message, context);
    },
    async timed(label, fn) {
      const start = performance.now();
      try {
        return await fn();
      } finally {
        const ms = performance.now() - start;
        if (ms > SLOW_DB_THRESHOLD_MS) {
          warn(`slow db: ${label} (${ms.toFixed(0)}ms)`);
        }
      }
    },
  };
}
