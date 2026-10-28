/**
 * Verifies the system-design module wiring in both directions.
 *
 * Mirrors `check-blog-toc.ts`. That script's lesson was that a checker which
 * validates only one direction reports "all clear" for a page that was never
 * registered, so this one runs:
 *
 *   1. config -> route   every registered module, lesson and task page is a
 *                        concrete STATIC route in the prerender manifest
 *   2. route  -> config  every prerendered /system-design/... route resolves
 *                        in registry.ts
 *   3. slug integrity    module.slug === filename === registry key
 *   4. graph integrity   startGraph/solutionGraph parse; step and criterion ids
 *                        are unique within a module
 *   5. orphan check      every step's `check` is satisfiable — it must pass on
 *                        the module's own solutionGraph. A step that fails on
 *                        the solution is reachable in the type system but dead
 *                        in practice: nobody can ever pass it.
 *   6. criteria sanity   solutionGraph passes every `required` criterion and
 *                        startGraph fails at least one. A module whose own
 *                        solution fails its own gate is unpassable; a module
 *                        whose broken start already passes is not a task.
 *   7. cumulative chain  the growing app does not lose components between
 *                        modules (warn only — see below)
 *   8. content model     1 leaf chapter = 1 lesson, both directions; `order` is
 *                        exactly 1..N; converted modules meet the 700–900 word
 *                        depth bar and carry 1–3 https sources. Rules live in
 *                        `lib/system-design/content-rules.ts` so `npm test` can
 *                        run the same ones before Build.
 *
 * Why the prerender manifest and not the HTML files: `compute: "static"` on a
 * route entry IS the proof that the `●` route table promise holds. Checking for
 * `<slug>.html` on disk instead would pass for a route that Next decided to
 * render on demand, which is the exact failure I.11 records (560-870 ms CPU per
 * origin hit on an "obviously static" route).
 *
 * Run: `npm run check:system-design`
 * Requires a completed `npm run build`.
 */
import fs from "node:fs";
import path from "node:path";
import { getAllModuleSlugs, getModule } from "../config/system-design/registry";
import { SdGraphSchema } from "../lib/system-design/validation";
import { simulate } from "../lib/system-design/engine";
import { runStepCheck } from "../lib/system-design/rubric";
import {
  inspectChapterBinding,
  inspectModuleContent,
  inspectModuleOrder,
} from "../lib/system-design/content-rules";
import type { SdModule } from "../config/system-design/types";

type SimModule = SdModule & { task: NonNullable<SdModule["task"]> };

const MANIFEST = path.join(process.cwd(), ".next", "prerender-manifest.json");
const MODULES_DIR = path.join(
  process.cwd(),
  "config",
  "system-design",
  "modules",
);

let failures = 0;
let warnings = 0;

function fail(message: string): void {
  console.error(`FAIL ${message}`);
  failures++;
}

function warn(message: string): void {
  console.warn(`WARN ${message}`);
  warnings++;
}

function ok(message: string): void {
  console.log(`OK   ${message}`);
}

type PrerenderRoute = {
  routeType?: string;
  compute?: string;
  srcRoute?: string;
};

type PrerenderManifest = {
  routes: Record<string, PrerenderRoute>;
};

/**
 * The empty-registry case is a legitimate state (decision 34: content lands in
 * Task 13), so it must exit 0 — otherwise CI is red for the whole of Tasks 1-12
 * and a red gate stops being information.
 */
async function main(): Promise<void> {
  const slugs = getAllModuleSlugs();

  if (slugs.length === 0) {
    console.log("registry.ts has no modules yet (Task 13). Nothing to check.");
    return;
  }

  if (!fs.existsSync(MANIFEST)) {
    console.error(
      `No build output at ${MANIFEST}. Run \`npm run build\` first.`,
    );
    process.exit(1);
  }

  const manifest = JSON.parse(
    fs.readFileSync(MANIFEST, "utf-8"),
  ) as PrerenderManifest;

  // ---- load modules ---------------------------------------------------------

  const modules: SdModule[] = [];
  for (const slug of slugs) {
    let mod: SdModule | null = null;
    try {
      mod = await getModule(slug);
    } catch (error) {
      fail(`${slug}: getModule() threw: ${String(error)}`);
      continue;
    }
    if (!mod) {
      // Prototype-key guard (decision 36) makes this unreachable unless the two
      // exported functions disagree — which is exactly what to assert.
      fail(
        `${slug}: registered in getAllModuleSlugs() but getModule() returned null`,
      );
      continue;
    }
    modules.push(mod);
  }
  modules.sort((a, b) => a.order - b.order);

  // ---- 1. slug integrity ----------------------------------------------------

  console.log("\n--- slug integrity ---");
  const registered = new Set(slugs);
  const onDisk = fs.existsSync(MODULES_DIR)
    ? fs
        .readdirSync(MODULES_DIR)
        .filter((f) => f.endsWith(".ts"))
        .map((f) => f.replace(/\.ts$/, ""))
    : [];

  for (const mod of modules) {
    if (mod.slug !== path.basename(mod.slug)) {
      fail(`${mod.slug}: module.slug is not a bare filename`);
    }
    if (!registered.has(mod.slug)) {
      fail(`${mod.slug}: module.slug does not match its registry key`);
    }
    if (!onDisk.includes(mod.slug)) {
      fail(
        `${mod.slug}: no file at config/system-design/modules/${mod.slug}.ts`,
      );
    }
    if (mod.lessons.length === 0) {
      fail(`${mod.slug}: module has no lessons`);
    }
    const lessonSlugs = new Set<string>();
    for (const lesson of mod.lessons) {
      if (lessonSlugs.has(lesson.slug)) {
        fail(`${mod.slug}: duplicate lesson slug "${lesson.slug}"`);
      }
      lessonSlugs.add(lesson.slug);
    }
  }

  for (const mod of modules) {
    if (mod.kind === "sim" && !mod.task) {
      fail(
        `${mod.slug}: kind is "sim" but no task is defined — a simulated module must have a build task`,
      );
    }
    if (mod.kind === "prose" && mod.task) {
      fail(
        `${mod.slug}: kind is "prose" but a task is defined — prose modules have no build task`,
      );
    }
  }

  for (const fileName of onDisk) {
    if (!registered.has(fileName)) {
      fail(
        `config/system-design/modules/${fileName}.ts exists but is not in registry.ts LOADERS. ` +
          `It builds and lints but is unreachable — add the loader entry.`,
      );
    }
  }
  ok(`${modules.length} module(s) registered and on disk`);

  // ---- 1b. content model ---------------------------------------------------
  //
  // Leaf chapter ↔ lesson equality, contiguous order, and (for converted
  // modules) the depth bar and source URLs. The rules live in
  // `lib/system-design/content-rules.ts` so `npm test` can assert the same
  // things before `Build` — this runner adds them to the post-build gate.
  //
  // 9 of 15 modules are not converted yet, so they report as warnings with
  // counts. That is deliberate: a gate that is red for planned work is not
  // information. See the header of content-rules.ts.

  console.log("\n--- content model (1 leaf chapter = 1 lesson) ---");

  for (const finding of [
    ...inspectModuleOrder(modules),
    ...modules.flatMap(inspectModuleContent),
  ]) {
    if (finding.level === "fail") {
      fail(`[${finding.code}] ${finding.message}`);
    } else {
      warn(`[${finding.code}] ${finding.message}`);
    }
  }

  const converted = modules.filter(
    (mod) => inspectChapterBinding(mod).status === "bound",
  );
  ok(
    `${converted.length}/${modules.length} module(s) converted to the leaf model` +
      (converted.length > 0
        ? ` (${converted.map((m) => m.slug).join(", ")})`
        : ""),
  );

  // ---- 2. config -> route (static) -----------------------------------------

  console.log("\n--- config -> route (must be STATIC) ---");

  const expectedRoutes = new Set<string>(["/system-design"]);
  for (const mod of modules) {
    expectedRoutes.add(`/system-design/${mod.slug}`);
    if (mod.task) {
      expectedRoutes.add(`/system-design/${mod.slug}/task`);
    }
    for (const lesson of mod.lessons) {
      expectedRoutes.add(`/system-design/${mod.slug}/lesson/${lesson.slug}`);
    }
  }

  for (const route of expectedRoutes) {
    const entry = manifest.routes[route];
    if (!entry) {
      fail(
        `${route}: not in the prerender manifest. Either generateStaticParams ` +
          `missed it or the page rendered dynamically (I.11).`,
      );
      continue;
    }
    if (entry.compute !== "static") {
      fail(
        `${route}: prerendered but compute="${entry.compute}", not "static"`,
      );
    }
  }
  ok(`${expectedRoutes.size} route(s) checked for static prerender`);

  // ---- 3. route -> config --------------------------------------------------

  console.log("\n--- route -> config ---");

  const builtModuleRoutes = Object.keys(manifest.routes).filter(
    (route) =>
      route.startsWith("/system-design/") &&
      manifest.routes[route].routeType === "page",
  );

  for (const route of builtModuleRoutes) {
    // /system-design/<slug>[/task|/lesson/<lesson>]
    const slug = route.split("/")[2];
    if (!registered.has(slug)) {
      fail(
        `${route}: prerendered but "${slug}" is not registered in registry.ts`,
      );
    }
  }
  ok(`${builtModuleRoutes.length} page route(s) resolve against the registry`);

  // ---- 4. graph integrity --------------------------------------------------

  console.log("\n--- graph integrity ---");

  for (const mod of modules.filter((m): m is SimModule => !!m.task)) {
    const solution = SdGraphSchema.safeParse(mod.task.solutionGraph);
    if (!solution.success) {
      fail(
        `${mod.slug}: solutionGraph fails SdGraphSchema — ${solution.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")}`,
      );
    }

    const start = SdGraphSchema.safeParse(mod.task.startGraph);
    if (!start.success) {
      fail(
        `${mod.slug}: startGraph fails SdGraphSchema — ${start.error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join("; ")}`,
      );
    }

    const stepIds = new Set<string>();
    for (const step of mod.task.steps) {
      if (stepIds.has(step.id))
        fail(`${mod.slug}: duplicate step id "${step.id}"`);
      stepIds.add(step.id);
    }

    const criterionIds = new Set<string>();
    for (const criterion of mod.task.passCriteria) {
      if (criterionIds.has(criterion.id)) {
        fail(`${mod.slug}: duplicate criterion id "${criterion.id}"`);
      }
      criterionIds.add(criterion.id);
    }

    if (mod.task.passCriteria.filter((c) => c.required).length === 0) {
      fail(
        `${mod.slug}: no required pass criterion — the gate cannot ever hold`,
      );
    }

    ok(
      `${mod.slug}: ${mod.task.steps.length} steps, ` +
        `${mod.task.passCriteria.length} criteria (${
          mod.task.passCriteria.filter((c) => c.required).length
        } required)`,
    );
  }

  // ---- 5. orphan check -----------------------------------------------------

  console.log("\n--- orphan check (steps must be passable) ---");

  for (const mod of modules.filter((m): m is SimModule => !!m.task)) {
    for (const step of mod.task.steps) {
      const result = runStepCheck(step, mod.task.solutionGraph);
      if (!result.passed) {
        fail(
          `${mod.slug}: step "${step.id}" fails on the module's own solutionGraph ` +
            `("${result.progress}") — no learner can ever pass this step`,
        );
      }
    }
    if (mod.task.steps.length > 0) {
      ok(
        `${mod.slug}: all ${mod.task.steps.length} step(s) pass on the solution`,
      );
    }
  }

  // ---- 6. criteria sanity --------------------------------------------------

  console.log("\n--- criteria sanity ---");

  for (const mod of modules.filter((m): m is SimModule => !!m.task)) {
    const required = mod.task.passCriteria.filter((c) => c.required);
    if (required.length === 0) continue;

    let solutionResult;
    try {
      solutionResult = simulate(mod.task.solutionGraph);
    } catch (error) {
      fail(`${mod.slug}: simulate(solutionGraph) threw: ${String(error)}`);
      continue;
    }

    if (!solutionResult.valid) {
      fail(
        `${mod.slug}: solutionGraph is not simulatable — ${solutionResult.invalidReason}`,
      );
    }

    for (const criterion of required) {
      if (!criterion.assert(solutionResult)) {
        fail(
          `${mod.slug}: the module's own solution fails required criterion ` +
            `"${criterion.id}" (${criterion.label}) at p95=${solutionResult.latency.p95.toFixed(
              1,
            )}ms throughput=${solutionResult.throughput.toFixed(0)}r/s — ` +
            `the module is unpassable`,
        );
      }
    }

    let startResult;
    try {
      startResult = simulate(mod.task.startGraph);
    } catch (error) {
      fail(`${mod.slug}: simulate(startGraph) threw: ${String(error)}`);
      continue;
    }

    const startPasses = required.every((c) => c.assert(startResult));
    if (startPasses) {
      fail(
        `${mod.slug}: startGraph already passes every required criterion — ` +
          `the pre-wired design is supposed to be broken`,
      );
    } else {
      ok(
        `${mod.slug}: start fails the gate, solution passes it ` +
          `(p95 ${startResult.latency.p95.toFixed(0)}ms → ${solutionResult.latency.p95.toFixed(0)}ms)`,
      );
    }
  }

  // ---- 7. cumulative chain -------------------------------------------------

  console.log("\n--- cumulative chain (one growing app) ---");

  for (let i = 1; i < modules.length; i++) {
    const previous = modules[i - 1];
    const current = modules[i];
    if (!previous.task || !current.task) continue; // prose modules have no task
    if (previous.part !== current.part) continue; // Part 0 -> Part 1 changes task kind

    const previousTypes = new Set(
      previous.task!.solutionGraph.nodes.map((n) => n.type),
    );
    const currentTypes = new Set(
      current.task!.startGraph.nodes.map((n) => n.type),
    );
    const lost = [...previousTypes].filter(
      (t) => t !== "client" && !currentTypes.has(t),
    );

    if (lost.length > 0) {
      // Warn, not fail: a module may legitimately remove a node it just taught
      // the learner to delete (e.g. a cache that caused stale reads). The point
      // is to make the decision visible in review, not to forbid it.
      warn(
        `${current.slug}: startGraph drops node type(s) ${lost.join(", ")} ` +
          `that ${previous.slug}'s solution had — intentional?`,
      );
    } else {
      ok(`${current.slug}: starts from ${previous.slug}'s finished design`);
    }
  }

  // ---- report --------------------------------------------------------------

  console.log("");
  if (failures > 0) {
    console.error(`${failures} problem(s) found, ${warnings} warning(s).`);
    process.exit(1);
  }
  console.log(
    `All checks passed for ${modules.length} module(s)${warnings > 0 ? `, ${warnings} warning(s)` : ""}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
