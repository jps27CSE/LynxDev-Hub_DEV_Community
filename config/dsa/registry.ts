/**
 * Registry for DSA modules.
 *
 * Mirrors `config/system-design/registry.ts`. Content modules register
 * themselves here via static imports; `loadAllDsaModules` returns them sorted
 * by `order`. `getModule` is guarded against prototype-chain access so
 * `getModule("__proto__")` returns `undefined` instead of leaking Object's
 * prototype.
 *
 * MVP uses synchronous static imports (5 modules). Code-splitting via dynamic
 * `import()` (as system design does) is a later optimization once module count
 * grows; the public API stays the same.
 *
 * KEEP THIS FILE DEPENDENCY-FREE — see the I.9 note at the top of `types.ts`.
 */

import type { DsaModule, DsaLesson } from "./types";
import { foundationsModule } from "./modules/foundations";
import { complexityAndMathsModule } from "./modules/complexity-and-maths";
import { arraysAndStringsModule } from "./modules/arrays-and-strings";
import { searchingModule } from "./modules/searching";
import { binaryTreesModule } from "./modules/binary-trees";

const MODULES: DsaModule[] = [
  foundationsModule,
  complexityAndMathsModule,
  arraysAndStringsModule,
  searchingModule,
  binaryTreesModule,
];

/**
 * Returns all DSA modules sorted by `order`. Pure — no DB, no side effects.
 */
export function loadAllDsaModules(): DsaModule[] {
  return [...MODULES].sort((a, b) => a.order - b.order);
}

/**
 * Returns a module by slug, or `undefined` if it does not exist or the slug is
 * a prototype-chain key. Uses `Object.hasOwn` on a freshly built lookup so
 * inherited keys (`__proto__`, `constructor`, …) never resolve.
 */
export function getModule(slug: string): DsaModule | undefined {
  const lookup: Record<string, DsaModule> = Object.create(null);
  for (const m of MODULES) lookup[m.slug] = m;
  if (!Object.hasOwn(lookup, slug)) return undefined;
  return lookup[slug];
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
