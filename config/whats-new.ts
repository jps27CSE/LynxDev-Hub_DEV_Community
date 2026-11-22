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
  highlight: "2.5",
  headline: "LynxDEV 2.5 is here",
  summary:
    "New: Developer Roadmaps — five step-by-step paths (Frontend, Backend, Full Stack, AI Engineer, System Design) covering 96 topics, each with hand-picked free resources and a direct link to the LynxDEV lesson that teaches it. Mark topics done as you go and the map shows what is next. Plus everything from 2.3 — the SQL course, the system design path and the full course catalog. Everything stays free.",
  features: [
    {
      title: "Developer Roadmaps",
      description:
        "Five maps — Frontend, Backend, Full Stack, AI Engineer and System Design — with 96 topics laid out in the order they make sense. Search by title or tag, filter by category and level, and open any topic for its description and resources.",
      icon: "Map",
    },
    {
      title: "Learn It on LynxDEV",
      description:
        "118 topics link straight to our own courses, System Design lessons and build tasks, so the next step after reading is doing. External links are free docs, articles and videos; in-platform links never leave the site.",
      icon: "BookOpen",
    },
    {
      title: "Progress Tracking",
      description:
        "Mark any topic done, learning or skipped. The progress bar, the “next up” shortcut and a per-roadmap reset keep the map honest about where you actually are — and it saves in your browser, no account setup needed.",
      icon: "ListChecks",
    },
    {
      title: "479 Curated Resources",
      description:
        "Every topic carries free, hand-checked material — official docs first, then articles, videos and practice. Roadmap resources load on demand, so opening a map stays fast even with 479 links behind it.",
      icon: "Sparkles",
    },
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
  ],
  fixesSummary: [
    "New: Developer Roadmaps — 5 paths (Frontend, Backend, Full Stack, AI Engineer, System Design), 96 topics",
    "New: 479 hand-picked free resources — docs, articles, videos and practice — across every roadmap topic",
    "New: “Learn it on LynxDEV” — 118 links from roadmap topics to our own courses, System Design lessons and build tasks",
    "New: Roadmap progress — mark topics done, learning or skipped; progress bar, next-up shortcut and reset, saved in your browser",
    "New: Every roadmap topic has its own shareable URL (?node=…), and resources load on demand",
    "New: Roadmap search plus category and level filters on /roadmaps",
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
