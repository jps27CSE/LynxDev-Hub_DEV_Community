/**
 * Verifies the DSA module wiring in both directions.
 *
 * Run: `npm run check:dsa`
 * Requires a completed `npm run build`.
 */
import fs from "node:fs";
import path from "node:path";
import { getAllModuleSlugs, getModule } from "../config/dsa/registry";
import {
  inspectModuleContent,
  inspectModuleOrder,
} from "../lib/dsa/content-rules";

const MANIFEST = path.join(process.cwd(), ".next", "prerender-manifest.json");
const MODULES_DIR = path.join(process.cwd(), "config", "dsa", "modules");

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
type PrerenderManifest = { routes: Record<string, PrerenderRoute> };

async function main(): Promise<void> {
  const slugs = getAllModuleSlugs();

  if (slugs.length === 0) {
    console.log("registry.ts has no modules yet. Nothing to check.");
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

  const modules = [];
  for (const slug of slugs) {
    let mod;
    try {
      mod = getModule(slug);
    } catch (error) {
      fail(`${slug}: getModule() threw: ${String(error)}`);
      continue;
    }
    if (!mod) {
      fail(`${slug}: registered but getModule() returned undefined`);
      continue;
    }
    modules.push(mod);
  }
  modules.sort((a, b) => a.order - b.order);

  // ---- slug integrity ----
  console.log("\n--- slug integrity ---");
  const registered = new Set(slugs);
  const onDisk = fs.existsSync(MODULES_DIR)
    ? fs
        .readdirSync(MODULES_DIR)
        .filter((f) => f.endsWith(".ts"))
        .map((f) => f.replace(/\.ts$/, ""))
    : [];

  for (const mod of modules) {
    if (!onDisk.includes(mod.slug)) {
      fail(`${mod.slug}: no file at config/dsa/modules/${mod.slug}.ts`);
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
    if (mod.kind === "lesson+task" && !mod.task) {
      fail(`${mod.slug}: kind is "lesson+task" but no task is defined`);
    }
    if (mod.kind === "lesson" && mod.task) {
      fail(`${mod.slug}: kind is "lesson" but a task is defined`);
    }
  }

  for (const fileName of onDisk) {
    if (!registered.has(fileName)) {
      fail(
        `config/dsa/modules/${fileName}.ts exists but is not in registry.ts MODULES`,
      );
    }
  }
  ok(`${modules.length} module(s) registered and on disk`);

  // ---- content model ----
  console.log("\n--- content model ---");
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
  ok("content model checked");

  // ---- config -> route (static) ----
  console.log("\n--- config -> route (must be STATIC) ---");
  const expectedRoutes = new Set<string>(["/dsa"]);
  for (const mod of modules) {
    expectedRoutes.add(`/dsa/${mod.slug}`);
    if (mod.task) expectedRoutes.add(`/dsa/${mod.slug}/task`);
    for (const lesson of mod.lessons) {
      expectedRoutes.add(`/dsa/${mod.slug}/lesson/${lesson.slug}`);
    }
  }

  for (const route of expectedRoutes) {
    const entry = manifest.routes[route];
    if (!entry) {
      fail(`${route}: not in the prerender manifest`);
      continue;
    }
    if (entry.compute !== "static") {
      fail(`${route}: compute="${entry.compute}", not "static"`);
    }
  }
  ok(`${expectedRoutes.size} route(s) checked for static prerender`);

  // ---- route -> config ----
  console.log("\n--- route -> config ---");
  const builtRoutes = Object.keys(manifest.routes).filter(
    (route) =>
      route.startsWith("/dsa/") && manifest.routes[route].routeType === "page",
  );
  for (const route of builtRoutes) {
    const slug = route.split("/")[2];
    if (!registered.has(slug)) {
      fail(`${route}: prerendered but "${slug}" is not registered`);
    }
  }
  ok(`${builtRoutes.length} page route(s) resolve against the registry`);

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
