"use client";

import { useCallback, useEffect, useState } from "react";
import {
  type RoadmapNodeStatus,
  type RoadmapProgress,
  loadProgress,
  saveProgress,
  clearProgress,
} from "@/lib/roadmap-progress";

/**
 * Client hook for roadmap progress backed by localStorage.
 *
 * SSR-safe: starts empty on the server, hydrates from localStorage on mount.
 * `setStatus(nodeId, null)` clears a node's status.
 */
export function useRoadmapProgress(slug: string) {
  const [statuses, setStatuses] = useState<RoadmapProgress>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStatuses(loadProgress(slug));
    setHydrated(true);
    return () => setHydrated(false);
  }, [slug]);

  // Persist after hydration. Kept out of the state updater so React can call
  // the updater more than once in StrictMode without duplicating writes.
  useEffect(() => {
    if (!hydrated) return;
    saveProgress(slug, statuses);
  }, [hydrated, slug, statuses]);

  const setStatus = useCallback((nodeId: string, status: RoadmapNodeStatus | null) => {
    setStatuses((prev) => {
      const next = { ...prev };
      if (status === null) delete next[nodeId];
      else next[nodeId] = status;
      return next;
    });
  }, []);

  const getStatus = useCallback((nodeId: string) => statuses[nodeId], [statuses]);

  const reset = useCallback(() => {
    clearProgress(slug);
    setStatuses({});
  }, [slug]);

  return { statuses, hydrated, setStatus, getStatus, reset };
}
