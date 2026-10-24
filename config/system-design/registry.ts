import type { SdModule } from "./types";

/**
 * @file
 *
 * Single source of truth for the system-design path.
 *
 * A lesson exists if and only if it is exported from a file in `modules/` and
 * registered below — there is no database and no admin UI where a row could
 * become unreachable. `npm run check:system-design` verifies that in both
 * directions, config → route and route → config, for the same reason
 * `check:blog-toc` does: a hand-maintained list drifts silently, and a checker
 * that only validates one direction reports "all clear" for a page that was
 * never registered.
 *
 * **Why dynamic `import()` and not a barrel.** `[module]/page.tsx` is a dynamic
 * segment. A static import of every module would ship all 14 modules' prose in
 * the bundle of any single lesson page. Keying the loaders on slug splits each
 * module into its own chunk, so opening module 6 downloads module 6.
 *
 * The map is empty until Task 13 authors the content. It is built as an empty
 * map rather than with placeholder entries so that `tsc` stays meaningful:
 * pointing `import()` at files that do not exist yet fails the typecheck at
 * Task 1 and keeps it red until Task 13.
 *
 * KEEP THIS FILE DEPENDENCY-FREE — see the I.9 note at the top of `types.ts`.
 */
type SdModuleLoader = () => Promise<{ default: SdModule }>;

/**
 * Own keys only. `Object.keys` is already own-keys-only, which is why the two
 * functions cannot disagree about what is registered.
 */
const LOADERS: Record<string, SdModuleLoader> = {
  "what-is-system-design": () => import("./modules/what-is-system-design"),
  requirements: () => import("./modules/requirements"),
  "constraints-and-design-process": () => import("./modules/constraints-and-design-process"),
  "back-of-the-envelope": () => import("./modules/back-of-the-envelope"),
  "load-balancers-and-stateless-services": () => import("./modules/load-balancers-and-stateless-services"),
  caching: () => import("./modules/caching"),
  "read-replicas": () => import("./modules/read-replicas"),
};

/**
 * Synchronous, so `generateStaticParams` can consume it in all three dynamic
 * routes without awaiting inside a framework API that wants a plain array.
 */
export function getAllModuleSlugs(): string[] {
  return Object.keys(LOADERS);
}

/**
 * `null` on a miss, never a stub. The caller calls `notFound()` — a route that
 * renders an empty shell for an unknown slug teaches the learner the site is
 * broken, and hides the mistake that produced the bad URL.
 */
export async function getModule(slug: string): Promise<SdModule | null> {
  // `Object.hasOwn`, not a truthiness check on `LOADERS[slug]`. `LOADERS` is a
  // plain object literal, so inherited keys resolve instead of missing:
  // `LOADERS["constructor"]` is `Object`, `["valueOf"]` is a function, and
  // `["__proto__"]` is `Object.prototype`. Every one of those is truthy, so
  // `if (!loader) return null` does not catch them — `constructor` returned
  // `undefined` and the rest threw, turning an unknown slug into a 500 instead
  // of the 404 the caller would have rendered. A slug is attacker-supplied
  // whenever the segment is a dynamic route.
  if (!Object.hasOwn(LOADERS, slug)) return null;
  return (await LOADERS[slug]()).default;
}

/**
 * For the path index only, which needs every module's title and description.
 * That page is statically generated, so this pulls all 14 chunks at *build*
 * time and never at request time — the bundle-size argument for the dynamic
 * imports above does not apply to a page that runs once during `next build`.
 *
 * Deliberately not fault-tolerant. One module with a broken import fails the
 * build and takes the index with it, which is the correct outcome here: a
 * `Promise.allSettled` would silently publish a path missing a module, and the
 * only symptom would be a card that never appears.
 */
export async function loadAllModules(): Promise<SdModule[]> {
  const modules = await Promise.all(
    Object.values(LOADERS).map((load) => load()),
  );
  return modules.map((m) => m.default).sort((a, b) => a.order - b.order);
}
