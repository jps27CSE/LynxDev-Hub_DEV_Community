import type { Roadmap } from "./types";
import { frontendRoadmap } from "./frontend";

/**
 * Registry of all roadmaps. Single source of truth — add new roadmaps here.
 * Keep this list in sync with the files under `config/roadmaps/`.
 */
const ROADMAPS: Roadmap[] = [frontendRoadmap];

export function getAllRoadmaps(): Roadmap[] {
  return ROADMAPS;
}

export function getRoadmapBySlug(slug: string): Roadmap | undefined {
  return ROADMAPS.find((r) => r.slug === slug);
}

export function getAllRoadmapSlugs(): string[] {
  return ROADMAPS.map((r) => r.slug);
}
