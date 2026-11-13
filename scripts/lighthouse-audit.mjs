// Lighthouse desktop audit runner.
//
// Usage:
//   1. Start the app:  npm run build && npm run start   (port 3000)
//   2. Run:            npm run lighthouse
//
// Reads routes from scripts/lighthouse-routes.txt (one path per line, # comments).
// Writes per-route JSON to .lhr/ (gitignored) and a summary Markdown to
// docs/lighthouse-<date>.md.
//
// Auth-gated routes are audited as their signed-out shell (that is what
// crawlers and anonymous visitors see). To audit a logged-in view, pass
// --auth-cookie="session=..." and the cookie is forwarded to Lighthouse.
//
// Cold starts: TiDB serverless scale-to-zero inflates LCP on the first hit.
// The script warms up /interview before auditing and flags suspects.
//
// Budget: lighthouse-budget.json is a SOFT gate (warn only) for the first
// month. Tighten to a hard gate once a stable baseline exists.

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PORT = process.env.PORT || "3000";
const BASE = `http://localhost:${PORT}`;
const LH = "npx";
const LH_ARGS_BASE = ["lighthouse"];

const args = process.argv.slice(2);
const authCookie = args.find((a) => a.startsWith("--auth-cookie="))?.split("=").slice(1).join("=");
const soft = !args.includes("--hard");

// ---- helpers ----
function log(msg) {
  process.stdout.write(msg + "\n");
}

function fetchOk(url) {
  try {
    execFileSync("curl", ["-sS", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "30", url], {
      stdio: ["ignore", "pipe", "ignore"],
    });
    return true;
  } catch {
    return false;
  }
}

function runLighthouse(route, outPath) {
  const url = BASE + route;
  const lhArgs = [
    url,
    "--preset=desktop",
    "--output=json",
    `--output-path=${outPath}`,
    "--chrome-flags=--headless --no-sandbox --disable-gpu",
    "--quiet",
    "--max-wait-for-load=45000",
  ];
  if (authCookie) {
    lhArgs.push(`--extra-headers=${JSON.stringify({ Cookie: authCookie })}`);
  }
  execFileSync("npx", ["lighthouse", ...lhArgs], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 180_000,
  });
}

function readJson(p) {
  return JSON.parse(readFileSync(p, "utf8"));
}

function score(lhr, key) {
  const c = lhr.categories?.[key];
  return c && typeof c.score === "number" ? Math.round(c.score * 100) : null;
}

function auditVal(lhr, id) {
  const a = lhr.audits?.[id];
  if (!a) return null;
  return typeof a.numericValue === "number" ? a.numericValue : a.displayValue ?? null;
}

function topAudits(lhr, n = 5) {
  const out = [];
  for (const [id, a] of Object.entries(lhr.audits || {})) {
    if (!a || a.score === null || a.score === 1 || a.score === undefined) continue;
    if (a.scoreDisplayMode === "notApplicable" || a.scoreDisplayMode === "manual") continue;
    out.push({
      id,
      title: a.title,
      score: Math.round((a.score || 0) * 100),
      displayValue: a.displayValue || "",
      savingsMs: a.details?.overallSavingsMs || 0,
    });
  }
  out.sort((a, b) => (b.savingsMs - a.savingsMs) || (a.score - b.score));
  return out.slice(0, n);
}

function routeSlug(route) {
  return route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-").replace(/[^a-z0-9-]/gi, "");
}

// ---- main ----
const routesFile = join(ROOT, "scripts", "lighthouse-routes.txt");
const routes = readFileSync(routesFile, "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith("#"));

if (routes.length === 0) {
  log("No routes found in scripts/lighthouse-routes.txt");
  process.exit(1);
}

// check server
log(`Checking ${BASE} ...`);
try {
  execFileSync("curl", ["-sS", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "10", BASE + "/"], {
    stdio: ["ignore", "pipe", "ignore"],
  });
} catch {
  log(`\nERROR: nothing is serving on ${BASE}.`);
  log("Start the app first:  npm run build && npm run start");
  log("Then re-run:          npm run lighthouse");
  process.exit(1);
}
log("Server is up.");

// warm up TiDB cold start
log("Warming up /interview (TiDB cold start) ...");
try {
  execFileSync("curl", ["-sS", "-o", "/dev/null", "--max-time", "60", BASE + "/interview"], {
    stdio: ["ignore", "pipe", "ignore"],
  });
} catch {
  /* ignore */
}
log("Warm-up done.\n");

const lhrDir = join(ROOT, ".lhr");
mkdirSync(lhrDir, { recursive: true });

const budget = existsSync(join(ROOT, "lighthouse-budget.json"))
  ? readJson(join(ROOT, "lighthouse-budget.json"))
  : null;

const results = [];
let violations = 0;

for (let i = 0; i < routes.length; i++) {
  const route = routes[i];
  const slug = routeSlug(route);
  const outPath = join(lhrDir, `${slug}.json`);
  log(`[${i + 1}/${routes.length}] ${route} ...`);
  try {
    runLighthouse(route, outPath);
  } catch (e) {
    log(`   FAILED: ${e.message?.split("\n")[0] || e}`);
    results.push({ route, error: String(e.message || e).slice(0, 200) });
    continue;
  }
  const lhr = readJson(outPath);
  const perf = score(lhr, "performance");
  const a11y = score(lhr, "accessibility");
  const bp = score(lhr, "best-practices");
  const seo = score(lhr, "seo");
  const lcp = auditVal(lhr, "largest-contentful-paint");
  const cls = auditVal(lhr, "cumulative-layout-shift");
  const tbt = auditVal(lhr, "total-blocking-time");
  const fcp = auditVal(lhr, "first-contentful-paint");
  const coldSuspect = typeof lcp === "number" && lcp > (budget?.maxLCP_ms || 2500) * 2;

  const r = {
    route,
    perf,
    a11y,
    bp,
    seo,
    lcp: typeof lcp === "number" ? Math.round(lcp) : lcp,
    cls: typeof cls === "number" ? Number(cls.toFixed(3)) : cls,
    tbt: typeof tbt === "number" ? Math.round(tbt) : tbt,
    fcp: typeof fcp === "number" ? Math.round(fcp) : fcp,
    coldSuspect,
    top: topAudits(lhr),
  };
  results.push(r);

  // soft budget check
  if (budget) {
    const checks = [];
    if (perf !== null && perf < budget.performance) checks.push(`Perf ${perf} < ${budget.performance}`);
    if (a11y !== null && a11y < budget.accessibility) checks.push(`A11y ${a11y} < ${budget.accessibility}`);
    if (bp !== null && bp < budget.bestPractices) checks.push(`BP ${bp} < ${budget.bestPractices}`);
    if (seo !== null && seo < budget.seo) checks.push(`SEO ${seo} < ${budget.seo}`);
    if (typeof lcp === "number" && lcp > budget.maxLCP_ms) checks.push(`LCP ${Math.round(lcp)}ms > ${budget.maxLCP_ms}ms`);
    if (typeof cls === "number" && cls > budget.maxCLS) checks.push(`CLS ${cls.toFixed(3)} > ${budget.maxCLS}`);
    if (typeof tbt === "number" && tbt > budget.maxTBT_ms) checks.push(`TBT ${Math.round(tbt)}ms > ${budget.maxTBT_ms}ms`);
    if (checks.length) {
      violations++;
      log(`   ⚠ budget: ${checks.join("; ")}`);
    } else {
      log(`   ✓ Perf ${perf} A11y ${a11y} BP ${bp} SEO ${seo} | LCP ${Math.round(lcp)}ms CLS ${cls.toFixed(3)} TBT ${Math.round(tbt)}ms`);
    }
  } else {
    log(`   Perf ${perf} A11y ${a11y} BP ${bp} SEO ${seo} | LCP ${Math.round(lcp)}ms CLS ${cls.toFixed(3)} TBT ${Math.round(tbt)}ms`);
  }
}

// ---- write markdown report ----
const date = new Date().toISOString().slice(0, 10);
const reportPath = join(ROOT, "docs", `lighthouse-${date}.md`);
const lines = [];
lines.push(`# Lighthouse Desktop Audit — ${date}`);
lines.push("");
lines.push(`Routes audited: ${results.filter((r) => !r.error).length} ok, ${results.filter((r) => r.error).length} failed.`);
lines.push(`Preset: desktop (no mobile throttling). Run locally against ${BASE}.`);
lines.push("");
lines.push("## Summary");
lines.push("");
lines.push("| Route | Perf | A11y | BP | SEO | LCP (ms) | CLS | TBT (ms) |");
lines.push("|-------|------|------|----|-----|----------|-----|----------|");
for (const r of results) {
  if (r.error) {
    lines.push(`| ${r.route} | ERROR | - | - | - | - | - | - |`);
    continue;
  }
  lines.push(
    `| ${r.route} | ${r.perf ?? "-"} | ${r.a11y ?? "-"} | ${r.bp ?? "-"} | ${r.seo ?? "-"} | ${r.lcp ?? "-"} | ${r.cls ?? "-"} | ${r.tbt ?? "-"} |`
  );
}
lines.push("");
if (budget) {
  lines.push(`Budget violations: ${violations} route(s) (soft gate — warn only).`);
  lines.push("");
}
lines.push("## Per-route details");
lines.push("");
for (const r of results) {
  lines.push(`### ${r.route}`);
  if (r.error) {
    lines.push(`- ERROR: ${r.error}`);
    lines.push("");
    continue;
  }
  lines.push(`- Scores: Perf ${r.perf}, A11y ${r.a11y}, BP ${r.bp}, SEO ${r.seo}`);
  lines.push(`- Web Vitals: LCP ${r.lcp}ms, CLS ${r.cls}, TBT ${r.tbt}ms, FCP ${r.fcp}ms`);
  if (r.coldSuspect) lines.push("- ⚠ LCP is unusually high — possible TiDB cold start; re-run after warm-up.");
  if (r.top && r.top.length) {
    lines.push("- Top audits to fix:");
    for (const a of r.top) {
      const sav = a.savingsMs ? ` (save ~${Math.round(a.savingsMs)}ms)` : "";
      lines.push(`  - [${a.score}] ${a.title}${a.displayValue ? " — " + a.displayValue : ""}${sav}`);
    }
  }
  lines.push("");
}
lines.push("## Notes");
lines.push("");
lines.push("- Localhost Lighthouse scores are relative, not production. Validate against the deployed preview URL for real numbers.");
lines.push("- Auth-gated routes are audited as their signed-out shell.");
lines.push("- TiDB cold starts inflate LCP on cold routes; warm up with a request to /interview first (the script does this).");
lines.push("- Raw per-route JSON: `.lhr/<slug>.json` (gitignored).");
lines.push("");
lines.push("## Free-tier reminder");
lines.push("");
lines.push("- Vercel bandwidth 100 GB/mo, CPU 4 hr/mo, build minutes 6000/mo.");
lines.push("- TiDB: ~50 RU/1M reads, 500 RU/1M writes, 0.5 GB storage, 5-conn pool.");
lines.push("- A Lighthouse fix that increases SSR/DB work is NOT a win — classify with the plan's 🟢/🟡/🔴 rubric before applying.");
writeFileSync(reportPath, lines.join("\n"));
log(`\nReport written: ${reportPath}`);
log(`Violations (soft): ${violations}`);

if (!soft && violations > 0) process.exit(1);