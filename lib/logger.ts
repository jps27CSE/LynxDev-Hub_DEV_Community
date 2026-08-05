export type LogContext = Record<string, unknown>;

export type Logger = {
  error(message: string, error?: unknown, context?: LogContext): void;
};

export function createLogger(scope: string): Logger {
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
  };
}
