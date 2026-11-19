import type { RoadmapNode } from "./types";

/**
 * Dependency-free tree helpers. Lives in `config/` (no `lib/`, no logger) so it
 * can be imported by Client Components without dragging Node builtins into the
 * browser bundle (see I.9).
 */

export function countNodes(node: RoadmapNode): number {
  if (!node.children || node.children.length === 0) return 1;
  return node.children.reduce((acc, c) => acc + countNodes(c), 0);
}

export function isSection(node: RoadmapNode): boolean {
  return !!node.children && node.children.length > 0;
}

export function collectLeafIds(
  node: RoadmapNode,
  out: string[] = [],
): string[] {
  if (!isSection(node)) {
    out.push(node.id);
    return out;
  }
  for (const c of node.children!) collectLeafIds(c, out);
  return out;
}

export function findNode(node: RoadmapNode, id: string): RoadmapNode | null {
  if (node.id === id) return node;
  if (!node.children) return null;
  for (const c of node.children) {
    const found = findNode(c, id);
    if (found) return found;
  }
  return null;
}

/** Path from the root down to `id`, or `null` when the id is not in the tree. */
export function findPath(
  node: RoadmapNode,
  id: string,
  trail: RoadmapNode[] = [],
): RoadmapNode[] | null {
  const next = [...trail, node];
  if (node.id === id) return next;
  if (!node.children) return null;
  for (const c of node.children) {
    const found = findPath(c, id, next);
    if (found) return found;
  }
  return null;
}
