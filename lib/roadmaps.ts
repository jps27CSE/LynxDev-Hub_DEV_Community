import { cache } from "react";
import { createLogger } from "@/lib/logger";
import {
  getAllRoadmaps as getConfigRoadmaps,
  getRoadmapBySlug as getConfigRoadmapBySlug,
  getAllRoadmapSlugs as getConfigSlugs,
} from "@/config/roadmaps";
import type { Roadmap } from "@/config/roadmaps/types";

const log = createLogger("roadmaps");

/**
 * All roadmaps (static config, no DB). Wrapped in `cache` for per-request
 * deduplication, consistent with `lib/course-data.ts`.
 *
 * Cached values are shared references across requests — treat as read-only.
 */
export const getAllRoadmaps = cache(async (): Promise<Roadmap[]> => {
  try {
    return getConfigRoadmaps();
  } catch (error) {
    log.error("getAllRoadmaps failed", error);
    throw error;
  }
});

export const getRoadmapBySlug = cache(
  async (slug: string): Promise<Roadmap | null> => {
    if (typeof slug !== "string" || slug.length === 0) {
      log.warn("getRoadmapBySlug called with invalid slug", { slug });
      return null;
    }
    try {
      return getConfigRoadmapBySlug(slug) ?? null;
    } catch (error) {
      log.error("getRoadmapBySlug failed", error, { slug });
      throw error;
    }
  },
);

export const getAllRoadmapSlugs = getConfigSlugs;

// Re-export tree helpers from the dependency-free module so server callers can
// keep importing from `@/lib/roadmaps`. Client Components must import directly
// from `@/config/roadmaps/utils` to avoid pulling Node builtins.
export {
  countNodes,
  collectLeafIds,
  findNode,
} from "@/config/roadmaps/utils";
