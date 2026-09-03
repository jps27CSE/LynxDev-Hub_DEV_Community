export type LogContext = Record<string, unknown>;

export type Logger = {
  error(message: string, error?: unknown, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  timed<T>(label: string, fn: () => Promise<T>): Promise<T>;
};

const isProd = process.env.NODE_ENV === "production";

function emit(
  level: "error" | "warn" | "info",
  scope: string,
  message: string,
  error?: unknown,
  context?: LogContext,
) {
  const fn =
    level === "error"
      ? console.error
      : level === "warn"
        ? console.warn
        : console.log;

  if (isProd) {
    const entry: Record<string, unknown> = {
      level,
      scope,
      msg: message,
      time: new Date().toISOString(),
    };
    if (error !== undefined) entry.error = serializeError(error);
    if (context !== undefined) Object.assign(entry, context);
    fn(JSON.stringify(entry));
  } else {
    const prefix = `[${scope}]`;
    const suffix = context ? ` ${JSON.stringify(context)}` : "";
    if (error !== undefined) {
      fn(`${prefix} ${message}`, error, suffix || undefined);
    } else {
      fn(`${prefix} ${message}${suffix}`);
    }
  }
}

function serializeError(err: unknown): unknown {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return err;
}

const SLOW_DB_THRESHOLD_MS = 250;

export function createLogger(scope: string): Logger {
  return {
    error(message, error, context) {
      emit("error", scope, message, error, context);
    },
    warn(message, context) {
      emit("warn", scope, message, undefined, context);
    },
    info(message, context) {
      emit("info", scope, message, undefined, context);
    },
    async timed(label, fn) {
      const start = performance.now();
      try {
        return await fn();
      } finally {
        const ms = performance.now() - start;
        if (ms > SLOW_DB_THRESHOLD_MS) {
          emit("warn", scope, `slow db: ${label} (${ms.toFixed(0)}ms)`);
        }
      }
    },
  };
}
