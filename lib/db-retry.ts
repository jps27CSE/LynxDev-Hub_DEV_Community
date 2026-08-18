import { createLogger } from "@/lib/logger";

const log = createLogger("db-retry");

/**
 * Error codes that mean "the cluster wasn't reachable yet" — retrying is safe
 * and worthwhile. Anything else (SQL errors, auth failures, constraint
 * violations) must propagate immediately.
 */
const TRANSIENT_CONNECT_CODES = new Set([
  "ETIMEDOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "EPIPE",
  "EHOSTUNREACH",
  "ENETUNREACH",
  "POOL_CONNECTION_TIMEOUT",
  "PROTOCOL_CONNECTION_LOST",
]);

function extractCode(error: unknown): string | undefined {
  if (error === null || typeof error !== "object") return undefined;
  const err = error as { code?: unknown; cause?: unknown };
  if (typeof err.code === "string") return err.code;
  const cause = err.cause;
  if (cause !== null && typeof cause === "object") {
    const code = (cause as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return undefined;
}

export function isTransientConnectError(error: unknown): boolean {
  const code = extractCode(error);
  return code !== undefined && TRANSIENT_CONNECT_CODES.has(code);
}

/**
 * Retries a DB call once after a short delay when the failure is a transient
 * connect error — e.g. TiDB Serverless waking from scale-to-zero. The first
 * attempt triggers the wake; the retry succeeds, so users never see a dead
 * page after an idle gap.
 *
 * Non-transient errors (SQL, auth, validation) are re-thrown unchanged.
 * RU impact: one extra query only during a cold start — zero in steady state.
 */
export async function withConnectRetry<T>(
  fn: () => Promise<T>,
  options: { attempts?: number; delayMs?: number } = {},
): Promise<T> {
  const { attempts = 2, delayMs = 3_000 } = options;
  try {
    return await fn();
  } catch (error) {
    if (attempts <= 1 || !isTransientConnectError(error)) throw error;
    log.warn("transient DB connect error, retrying", {
      code: extractCode(error) ?? "unknown",
    });
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return fn();
  }
}