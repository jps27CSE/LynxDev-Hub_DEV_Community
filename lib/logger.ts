import { getRequestId } from "./request-log";

export type LogContext = Record<string, unknown>;

export type Logger = {
  error(message: string, error?: unknown, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  timed<T>(label: string, fn: () => Promise<T>): Promise<T>;
};

const LOG_DRAIN_URL = process.env.LOG_DRAIN_URL;

const isProd = process.env.NODE_ENV === "production";

/**
 * Fire-and-forget POST to a durable log drain (e.g. Axiom, Datadog, or a
 * self-hosted endpoint). Only `error` and `warn` levels are drained to keep
 * volume low on the free tier. Never awaited — a slow drain must not block
 * the request that produced the log.
 *
 * If `LOG_DRAIN_URL` is unset (local dev, or no drain configured) this is a
 * no-op. The URL is read once at module load; changing it requires a restart.
 */
function drainLog(entry: Record<string, unknown>) {
  if (!LOG_DRAIN_URL) return;
  try {
    void fetch(LOG_DRAIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
      keepalive: true,
    }).catch(() => {
      // Drain failures are silent — the console log above is the fallback.
    });
  } catch {
    // Synchronous failure (e.g. invalid URL) — ignore.
  }
}

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

  const requestId = getRequestId();

  if (isProd) {
    const entry: Record<string, unknown> = {
      level,
      scope,
      msg: message,
      time: new Date().toISOString(),
    };
    if (requestId) entry.requestId = requestId;
    if (error !== undefined) entry.error = serializeError(error);
    if (context !== undefined) Object.assign(entry, context);
    fn(JSON.stringify(entry));
    // Durable copy for critical events. Fire-and-forget; never blocks.
    if (level === "error" || level === "warn") drainLog(entry);
  } else {
    const prefix = `[${scope}]`;
    const suffix = context ? ` ${JSON.stringify(context)}` : "";
    const reqSuffix = requestId ? ` req=${requestId.slice(0, 8)}` : "";
    if (error !== undefined) {
      fn(`${prefix} ${message}${reqSuffix}`, error, suffix || undefined);
    } else {
      fn(`${prefix} ${message}${reqSuffix}${suffix}`);
    }
  }
}

export const MAX_CAUSE_DEPTH = 3;

/**
 * Drizzle interpolates bound parameters into the error message, and an
 * ON DUPLICATE KEY UPDATE repeats them — so one failed write can inline a
 * row's contents several times over. Keep the query shape, drop the values.
 * Matches to the end of the message, or up to the first stack frame.
 */
export const SQL_PARAMS = /params: [\s\S]*?(?=\n\s+at\s|$)/g;

/** Driver-level fields that identify the failure; they sit on `cause`. */
export const DIAGNOSTIC_KEYS = [
  "code",
  "errno",
  "sqlState",
  "sqlMessage",
] as const;

export function redactParams(text: string): string {
  return text.replace(SQL_PARAMS, "params: [redacted]");
}

export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  errno?: number;
  sqlState?: string;
  sqlMessage?: string;
  cause?: SerializedError;
  [key: string]: unknown;
}

export function serializeError(err: unknown, depth = 0): SerializedError {
  if (!(err instanceof Error))
    return { name: "UnknownError", message: String(err) };
  if (depth >= MAX_CAUSE_DEPTH) {
    return { name: err.name, message: "[cause chain truncated]" };
  }

  const serialized: SerializedError = {
    name: err.name,
    message: redactParams(err.message),
  };
  if (err.stack) serialized.stack = redactParams(err.stack);

  for (const key of DIAGNOSTIC_KEYS) {
    const value = (err as unknown as Record<string, unknown>)[key];
    if (value !== undefined)
      (serialized as Record<string, unknown>)[key] = value;
  }
  if (err.cause !== undefined) {
    serialized.cause = serializeError(err.cause, depth + 1);
  }

  return serialized;
}

export const SLOW_DB_THRESHOLD_MS = 250;
export const SLOW_SIM_THRESHOLD_MS = 100;

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
