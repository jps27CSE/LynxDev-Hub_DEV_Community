import { AsyncLocalStorage } from "node:async_hooks";

type RequestStore = {
  queryCount: number;
};

const storage = new AsyncLocalStorage<RequestStore>();

export function countQuery(): void {
  const store = storage.getStore();
  if (store) store.queryCount += 1;
}

export async function withRequestLog<T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  const store: RequestStore = { queryCount: 0 };
  const start = performance.now();
  let result: unknown;
  try {
    result = await storage.run(store, fn);
    return result as T;
  } finally {
    const ms = performance.now() - start;
    const status = result instanceof Response ? ` ${result.status}` : "";
    console.info(
      `[req] ${label}${status} ${ms.toFixed(0)}ms ${store.queryCount} queries`,
    );
  }
}
