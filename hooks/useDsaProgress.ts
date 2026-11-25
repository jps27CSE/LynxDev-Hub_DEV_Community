"use client";

import { useSyncExternalStore } from "react";

/**
 * Completion state for the DSA module, shared by every DSA surface.
 *
 * Why a store and not a fetch in each component: three pages need this (the
 * syllabus ticks, the lesson rail, the "mark complete" button initial state),
 * and they are navigated between constantly. Fetching per mount would spend a
 * TiDB round-trip every time a learner opens a lesson and goes back — the
 * exact cost the system-design review cut when it moved autosave off the
 * shared counter. One request per browser session is the budget here.
 *
 * `useSyncExternalStore` rather than context because the data is a `string[]`
 * that mutates from one place (`markLessonDone`) and is read in many: context
 * would re-render the whole subtree on every completion, including lesson prose
 * that cannot have changed.
 *
 * Signed-out behaviour is deliberately silent. `proxy.ts` 307s an
 * unauthenticated request to `/sign-in`, so a visitor who is not signed in gets
 * a redirect that `fetch` follows into HTML — not a JSON error. That is a normal
 * state on a public route, not a failure to report.
 */

const EMPTY: readonly string[] = Object.freeze([]);

let snapshot: string[] = EMPTY as string[];
let status: "idle" | "loading" | "ready" | "failed" = "idle";
const listeners = new Set<() => void>();

function notify(): void {
  for (const listener of listeners) listener();
}

async function load(): Promise<void> {
  if (status === "loading" || status === "ready") return;
  status = "loading";
  try {
    const res = await fetch("/api/dsa/progress", {
      headers: { accept: "application/json" },
      // The payload is per-user. A cached copy would be someone else's ticks,
      // and `auth()` in the handler is not a reason to assume the browser will
      // not reuse a response.
      cache: "no-store",
    });
    if (!res.ok) {
      status = "failed";
      return;
    }
    const data: unknown = await res.json();
    const raw =
      data && typeof data === "object" && "lessonsCompleted" in data
        ? (data as { lessonsCompleted?: unknown }).lessonsCompleted
        : null;
    // Union, not replace. Completions are monotonic, and this read may have
    // been issued *before* a completion the learner just made landed — a
    // plain assignment would untick it until reload.
    const fetched = Array.isArray(raw)
      ? raw.filter((key): key is string => typeof key === "string")
      : [];
    snapshot = [...new Set([...snapshot, ...fetched])];
    status = "ready";
    notify();
  } catch {
    // Network failure is not worth a toast on a passive read; the page still
    // works, it just cannot tick anything. `failed` lets the next mount retry.
    status = "failed";
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  void load();
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): string[] {
  return snapshot;
}

/** SSR and the hydration pass must agree, so the server says "nothing done". */
function getServerSnapshot(): string[] {
  return EMPTY as string[];
}

export function useCompletedLessons(): readonly string[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function lessonKey(moduleSlug: string, lessonSlug: string): string {
  return `${moduleSlug}/${lessonSlug}`;
}

/**
 * Records a completion locally so the rail and syllabus tick immediately.
 *
 * The server write has already succeeded when this is called, so this is a
 * cache update, not an optimistic guess — if it were a guess, a failed POST
 * would leave a false tick behind.
 */
export function markLessonDone(moduleSlug: string, lessonSlug: string): void {
  const key = lessonKey(moduleSlug, lessonSlug);
  if (snapshot.includes(key)) return;
  snapshot = [...snapshot, key];
  notify();
}
