/**
 * Registry for DSA modules.
 *
 * Mirrors `config/system-design/registry.ts`. Content modules register
 * themselves here via static imports; `loadAllDsaModules` returns them sorted
 * by `order`. `getModule` is guarded against prototype-chain access so
 * `getModule("__proto__")` returns `undefined` instead of leaking Object's
 * prototype.
 *
 * KEEP THIS FILE DEPENDENCY-FREE — no React, no `config/db`. It is imported
 * by `"use client"` components and by tests that must not drag mysql2 into
 * the browser bundle (I.9).
 */

import type { DsaModule, DsaLesson } from "./types";

// Static imports of every module file. Empty until Task 5 adds content.
// Each new module appends one line here AND a corresponding file under
// `config/dsa/modules/`.
const MODULE_LOADERS: Record<string, () => DsaModule> = {};

/**
 * Returns all DSA modules sorted by `order`. Pure — no DB, no side effects.
 */
export function loadAllDsaModules(): DsaModule[] {
  return Object.keys(MODULE_LOADERS)
    .map((slug) => MODULE_LOADERS[slug]())
    .sort((a, b) => a.order - b.order);
}

/**
 * Returns a module by slug, or `undefined` if it does not exist or the slug
 * is a prototype-chain key (`__proto__`, `constructor`, `toString`, …).
 */
export function getModule(slug: string): DsaModule | undefined {
  if (!Object.hasOwn(MODULE_LOADERS, slug)) return undefined;
  return MODULE_LOADERS[slug]();
}

/**
 * Returns a lesson by module slug + lesson slug, or `undefined`.
 */
export function getLesson(moduleSlug: string, lessonSlug: string): DsaLesson | undefined {
  const mod = getModule(moduleSlug);
  if (!mod) return undefined;
  return mod.lessons.find((lesson) => lesson.slug === lessonSlug);
}

/**
 * Returns the slugs of all registered modules, sorted by `order`.
 */
export function getAllModuleSlugs(): string[] {
  return loadAllDsaModules().map((m) => m.slug);
}