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

const MAX_CAUSE_DEPTH = 3;

/**
 * Drizzle interpolates bound parameters into the error message, and an
 * ON DUPLICATE KEY UPDATE repeats them — so one failed write can inline a
 * row's contents several times over. Keep the query shape, drop the values.
 * Matches to the end of the message, or up to the first stack frame.
 */
const SQL_PARAMS = /params: [\s\S]*?(?=\n\s+at\s|$)/g;

/** Driver-level fields that identify the failure; they sit on `cause`. */
const DIAGNOSTIC_KEYS = ["code", "errno", "sqlState", "sqlMessage"] as const;

function redactParams(text: string): string {
  return text.replace(SQL_PARAMS, "params: [redacted]");
}

function serializeError(err: unknown, depth = 0): unknown {
  if (!(err instanceof Error)) return err;
  if (depth >= MAX_CAUSE_DEPTH) {
    return { name: err.name, message: "[cause chain truncated]" };
  }

  const serialized: Record<string, unknown> = {
    name: err.name,
    message: redactParams(err.message),
  };
  if (err.stack) serialized.stack = redactParams(err.stack);

  for (const key of DIAGNOSTIC_KEYS) {
    const value = (err as unknown as Record<string, unknown>)[key];
    if (value !== undefined) serialized[key] = value;
  }
  if (err.cause !== undefined) {
    serialized.cause = serializeError(err.cause, depth + 1);
  }

  return serialized;
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
