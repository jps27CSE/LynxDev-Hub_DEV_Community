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

/**
 * Count the *leaf* nodes of a roadmap tree. Leaves are the completable topics;
 * internal nodes are section headers. Progress is measured against this count.
 */
export function countNodes(node: Roadmap["root"]): number {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((acc, c) => acc + countNodes(c), 0);
}

/**
 * Collect all leaf node ids in DFS order.
 */
export function collectLeafIds(
  node: Roadmap["root"],
  out: string[] = [],
): string[] {
  if (!node.children || node.children.length === 0) {
    out.push(node.id);
    return out;
  }
  for (const c of node.children) collectLeafIds(c, out);
  return out;
}

/**
 * Find a node by id anywhere in the tree (DFS). Returns null if not found.
 */
export function findNode(
  node: Roadmap["root"],
  id: string,
): Roadmap["root"] | null {
  if (node.id === id) return node;
  if (!node.children) return null;
  for (const c of node.children) {
    const found = findNode(c, id);
    if (found) return found;
  }
  return null;
}
