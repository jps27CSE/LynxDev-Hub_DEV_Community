"use client";

import { useCallback, useEffect, useState } from "react";
import {
  loadCompleted,
  saveCompleted,
  clearCompleted,
} from "@/lib/roadmap-progress";

/**
 * Client hook for roadmap progress backed by localStorage.
 *
 * SSR-safe: starts empty on the server, hydrates from localStorage on mount.
 * Returns a stable toggle function.
 */
export function useRoadmapProgress(slug: string) {
  const [completed, setCompleted] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCompleted(loadCompleted(slug));
    setHydrated(true);
    return () => setHydrated(false);
  }, [slug]);

  // Persist whenever the completed set changes after hydration. Keeping this
  // out of the state updater avoids running side effects inside an updater
  // (which React may invoke more than once in StrictMode).
  useEffect(() => {
    if (!hydrated) return;
    saveCompleted(slug, completed);
  }, [hydrated, slug, completed]);

  const toggle = useCallback((nodeId: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const isCompleted = useCallback(
    (nodeId: string) => completed.has(nodeId),
    [completed],
  );

  const reset = useCallback(() => {
    clearCompleted(slug);
    setCompleted(new Set());
  }, [slug]);

  return { completed, hydrated, toggle, isCompleted, reset };
}
