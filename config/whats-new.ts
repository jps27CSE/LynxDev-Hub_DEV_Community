import { APP_VERSION } from "@/lib/app-version";

export type WhatsNewFeature = {
  title: string;
  description: string;
  icon: string;
};

export type WhatsNewData = {
  version: string;
  /**
   * Version fragment highlighted in the headline. Optional — defaults to the
   * major.minor of `version`. Set it explicitly so the gradient stays correct
   * if the headline wording changes.
   */
  highlight?: string;
  headline: string;
  summary: string;
  features: WhatsNewFeature[];
  fixesSummary: string[];
};

export const WHATS_NEW: WhatsNewData = {
  version: APP_VERSION,
  highlight: "2.3",
  headline: "LynxDEV 2.3 is here",
  summary:
    "New: an interactive SQL & Databases course — 12 hands-on lessons where you write real SQL in the browser and watch result tables appear instantly. Plus the full course catalog (HTML, CSS, JavaScript, TypeScript, React, Node, Git, Linux) and the system design learning path. Everything stays free.",
  features: [
    {
      title: "SQL & Databases Course",
      description:
        "12 interactive lessons — SELECT, WHERE, JOINs, GROUP BY, subqueries, CTEs, INSERT/UPDATE/DELETE, schema design, indexes, normalization, transactions. Write real SQL in the browser, hit Run, and watch result tables appear. Powered by WebAssembly SQLite — no install, no server, zero cost.",
      icon: "Database",
    },
    {
      title: "System Design Learning Path",
      description:
        "15 modules from mindset to chaos engineering — capacity planning, caching, sharding, rate limiting, CDNs, failures, retries, idempotency. Each module has a build task on an interactive canvas with a real traffic simulator.",
      icon: "Network",
    },
    {
      title: "Interactive Canvas",
      description:
        "Drag-and-drop components (clients, load balancers, app servers, caches, databases, queues, workers, CDNs), connect them, and run real traffic through your design. See utilisation, p95 latency, error rates and bottleneck detection.",
      icon: "Workflow",
    },
    {
      title: "Build Tasks & Criteria",
      description:
        "14 hands-on build tasks with pass criteria — size the API for a lost third, fix a cache stampede, shard a hot key, rate-limit a bot. Earn criteria by proving your design works.",
      icon: "Target",
    },
    {
      title: "Production Review",
      description:
        "The system design module went through a full production review: faster simulations, lower resource usage, and a more reliable save system. Every number measured, not estimated.",
      icon: "ShieldCheck",
    },
  ],
  fixesSummary: [
    "New: SQL & Databases course — 12 interactive lessons with in-browser query runner",
    "New: Course catalog expanded — 9 courses, 115 chapters (HTML, CSS, JS, TS, React, Node, Git, Linux, SQL)",
    "New: System Design learning path — 15 modules, 79 lessons, 14 build tasks",
    "New: Interactive canvas with real traffic simulation",
    "New: Build tasks with pass criteria and server-verified results",
    "New: System Design feature card on homepage and login page",
    "New: 15 system design modules covering capacity, caching, sharding, rate limiting, CDNs, failures, retries, idempotency",
    "Improved: Canvas drag is smoother on mobile (batched frame updates)",
    "Improved: Panel re-renders reduced (memoized components)",
    "Improved: Saves are more reliable (conflict detection, merge, retry)",
    "Improved: Saves flush automatically when you close the tab or go offline",
    "Improved: Network reconnect triggers pending save flush",
    "Improved: Task pages load faster (lighter payload, no prose shipped)",
    "Improved: Build is more reliable (no database needed at build time)",
    "Fix: Percentile calculations were off by one rank — now correct",
    "Fix: Simulation results are now fully deterministic",
    "Fix: Node placement on canvas no longer affects simulation output",
  ],
};
