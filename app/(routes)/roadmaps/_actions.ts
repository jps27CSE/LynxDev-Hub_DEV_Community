"use server";

import { auth } from "@clerk/nextjs/server";
import { getRoadmapBySlug } from "@/lib/roadmaps";
import { findNode } from "@/config/roadmaps/utils";
import type { RoadmapResource } from "@/config/roadmaps/types";

/**
 * Lazy-loads the external resource list for a single roadmap node.
 *
 * Resources are deliberately NOT shipped in the initial page payload (see
 * production review §7.4): the roadmap tree only needs titles/structure to
 * render, and resources are only read when a node's panel is opened. Fetching
 * on demand keeps the initial RSC payload ~30% smaller.
 *
 * Returns `[]` for unknown slugs/nodes or unauthenticated callers so the
 * client never has to distinguish "empty" from "failed".
 */
export async function getRoadmapNodeResources(
  slug: string,
  nodeId: string,
): Promise<RoadmapResource[]> {
  const { userId } = await auth();
  if (!userId) return [];

  if (typeof slug !== "string" || slug.length === 0) return [];
  if (typeof nodeId !== "string" || nodeId.length === 0) return [];

  const roadmap = await getRoadmapBySlug(slug);
  if (!roadmap) return [];

  const node = findNode(roadmap.root, nodeId);
  if (!node) return [];

  return node.resources ?? [];
}
