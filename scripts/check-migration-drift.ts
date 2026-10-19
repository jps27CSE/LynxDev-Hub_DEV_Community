/**
 * @file
 *
 * Fails the build when `config/schema.tsx` and `drizzle/` have drifted apart.
 *
 * WHY THIS EXISTS. Drizzle migrations are not applied automatically. Adding a
 * column to `config/schema.tsx` changes nothing in the database — the next
 * `next build` still succeeds, `tsc` still passes, the test suite still passes,
 * and the route table is unchanged. The app then fails at runtime, in
 * production, on the first query that touches the new column. Every other gate
 * in this repo is silent about that; only this one can catch it.
 *
 * WHAT IT DOES. Runs `drizzle-kit generate`, which diffs the schema against the
 * latest snapshot in `drizzle/meta/`. If they agree it writes nothing and exits
 * 0. If they disagree it emits a new migration and this script fails, naming the
 * file, so the fix (commit the migration) is obvious.
 *
 * WHY IT COMPARES BEFORE-AND-AFTER INSTEAD OF ASKING "IS THE TREE DIRTY".
 * `git status --porcelain drizzle/` alone is wrong, and wrong in the way that
 * punishes correctness: a developer who has *already* generated the migration
 * but has not committed it has a dirty `drizzle/` directory, so a
 * dirty-check reports drift when none exists and tells them to generate a
 * migration they already have. This captures the porcelain output before and
 * after, and only reports entries that are NEW. Pre-existing uncommitted
 * changes appear in both sets and are ignored, which is the behaviour someone
 * running it locally mid-task actually needs.
 *
 * WHY `git diff --exit-code` IS NOT USED HERE. A newly generated migration is
 * UNTRACKED. `git diff` only compares tracked files, so it would miss the
 * entire point of the check and pass on exactly the condition it exists to
 * catch. (It would incidentally catch the `_journal.json` edit that accompanies
 * a new migration, but that is a side effect, not the mechanism.)
 *
 * Run: `npm run check:migrations`
 * Requires: `DATABASE_URL` parseable (drizzle.config.ts does `new URL(...)` at
 * module load and throws without it). No live database connection is needed —
 * `generate` diffs schema against on-disk snapshots.
 *
 * Placement in CI: before `Build`. It is fast and needs no network.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";

// drizzle.config.ts loads this too. Without it the DATABASE_URL precheck below
// would fail locally while `drizzle-kit generate` itself succeeded, because that
// file is the one that loads .env. dotenv does not override an already-set
// variable, so CI (which exports DATABASE_URL) is unaffected.
import "dotenv/config";

const DRIZZLE_DIR = path.join(process.cwd(), "drizzle");
const BIN = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "drizzle-kit.cmd" : "drizzle-kit",
);

/** Newest set of lines `git status --porcelain` reports for drizzle/, or null if it fails. */
function drizzleStatus(): Set<string> | null {
  const res = spawnSync("git", ["status", "--porcelain", "--", DRIZZLE_DIR], {
    encoding: "utf-8",
  });
  if (res.status !== 0) return null;
  return new Set(res.stdout.split("\n").filter(Boolean));
}

if (!process.env.DATABASE_URL) {
  console.error(
    "DATABASE_URL is not set. drizzle.config.ts parses it at module load and throws without it.",
  );
  console.error(
    "A parseable value is enough — no database connection is made.",
  );
  process.exit(1);
}

const before = drizzleStatus();
if (before === null) {
  console.error(
    "`git status --porcelain drizzle/` failed. Run this from inside the repository.",
  );
  process.exit(1);
}

const generate = spawnSync(BIN, ["generate"], {
  encoding: "utf-8",
  stdio: ["ignore", "pipe", "pipe"],
});

if (generate.error) {
  console.error(`Failed to run drizzle-kit: ${generate.error.message}`);
  process.exit(1);
}

if (generate.status !== 0) {
  console.error("`drizzle-kit generate` exited non-zero:");
  console.error(generate.stderr || generate.stdout);
  process.exit(1);
}

const after = drizzleStatus();
if (after === null) {
  console.error("`git status --porcelain drizzle/` failed after generate.");
  process.exit(1);
}

// Only entries that appeared. Anything already present before this command ran
// was the developer's own in-progress work, not something this check created.
const introduced = [...after].filter((line) => !before.has(line));

if (introduced.length === 0) {
  console.log("OK   schema matches drizzle/ — no migration missing");
  process.exit(0);
}

console.error("");
console.error(
  "FAIL schema drift: config/schema.tsx has changes with no migration.",
);
console.error("");
for (const line of introduced) console.error(`  ${line}`);
console.error("");
console.error(
  "`drizzle-kit generate` wrote the migration above. Review it, then commit it",
);
console.error(
  "alongside the schema change. This check will pass once it is committed.",
);
process.exit(1);
