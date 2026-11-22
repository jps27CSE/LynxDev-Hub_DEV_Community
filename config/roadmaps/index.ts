import type { Roadmap } from "./types";
import { frontendRoadmap } from "./frontend";
import { backendRoadmap } from "./backend";
import { fullStackRoadmap } from "./full-stack";
import { aiEngineerRoadmap } from "./ai-engineer";
import { systemDesignRoadmap } from "./system-design";

/**
 * Registry of all roadmaps. Single source of truth — add new roadmaps here.
 * Keep this list in sync with the files under `config/roadmaps/`.
 */
const ROADMAPS: Roadmap[] = [
  frontendRoadmap,
  backendRoadmap,
  fullStackRoadmap,
  aiEngineerRoadmap,
  systemDesignRoadmap,
];

export function getAllRoadmaps(): Roadmap[] {
  return ROADMAPS;
}

export function getRoadmapBySlug(slug: string): Roadmap | undefined {
  return ROADMAPS.find((r) => r.slug === slug);
}

export function getAllRoadmapSlugs(): string[] {
  return ROADMAPS.map((r) => r.slug);
}
