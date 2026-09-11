import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";

const isProd = process.env.NODE_ENV === "production";

type RequestStore = {
  requestId: string;
  queryCount: number;
};

const storage = new AsyncLocalStorage<RequestStore>();

export function countQuery(): void {
  const store = storage.getStore();
  if (store) store.queryCount += 1;
}

export function getRequestId(): string | undefined {
  return storage.getStore()?.requestId;
}

export async function withRequestLog<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  const requestId = randomUUID();
  const store: RequestStore = { requestId, queryCount: 0 };
  const start = performance.now();
  let result: unknown;
  try {
    result = await storage.run(store, fn);
    return result as T;
  } finally {
    const ms = performance.now() - start;
    const status = result instanceof Response ? result.status : 0;
    if (isProd) {
      console.log(
        JSON.stringify({
          level: "info",
          msg: label,
          requestId,
          status,
          duration: Math.round(ms),
          queries: store.queryCount,
          time: new Date().toISOString(),
        }),
      );
    } else {
      console.info(
        `[req] ${label} ${status} ${ms.toFixed(0)}ms ${store.queryCount} queries ${requestId.slice(0, 8)}`,
      );
    }
  }
}
