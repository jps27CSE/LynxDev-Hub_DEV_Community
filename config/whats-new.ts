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
  highlight: "2.0",
  headline: "LynxDEV 2.0 is here",
  summary:
    "The system design learning path — 15 modules, 79 lessons, 14 hands-on build tasks with a real traffic simulator. Plus a smoother, more reliable platform across the board. Everything stays free.",
  features: [
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
    "New: System Design learning path — 15 modules, 79 lessons, 14 build tasks",
    "New: Interactive canvas with real traffic simulation",
    "New: Build tasks with pass criteria and server-verified results",
    "New: System Design added to homepage and login page",
    "Improved: Faster canvas drag on mobile (smoother interactions)",
    "Improved: More reliable saves (conflict detection, retry, online flush)",
    "Improved: Faster task page loads (lighter payload)",
    "Improved: Build reliability (no database needed at build time)",
    "Fix: Percentile calculations corrected",
    "Fix: Deterministic simulation results",
  ],
};
