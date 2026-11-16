/**
 * Client-side progress helpers for roadmaps.
 *
 * Progress is stored in localStorage (zero DB cost for v1). All functions are
 * SSR-safe: they no-op / return empty on the server.
 */

const STORAGE_PREFIX = "lynxdev:roadmap:";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function keyFor(slug: string): string {
  return `${STORAGE_PREFIX}${slug}`;
}

export function loadCompleted(slug: string): Set<string> {
  if (!isBrowser()) return new Set();
  try {
    const raw = window.localStorage.getItem(keyFor(slug));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export function saveCompleted(slug: string, completed: Set<string>): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(keyFor(slug), JSON.stringify(Array.from(completed)));
  } catch {
    // Quota / privacy mode — fail silently; in-memory state still works.
  }
}

export function clearCompleted(slug: string): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(keyFor(slug));
  } catch {
    // ignore
  }
}
