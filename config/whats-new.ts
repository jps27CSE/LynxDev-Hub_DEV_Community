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
  highlight: "1.1",
  headline: "LynxDEV 1.1 is here",
  summary:
    "The interview prep rebuild — 1,000+ questions across 38 chapters, including two new chapters on production incidents and distributed systems. Everything stays free.",
  features: [
    {
      title: "Interactive Courses",
      description:
        "Three courses, 42 chapters, real exercises and an embedded editor per chapter — structured learning, not just videos.",
      icon: "BookOpen",
    },
    {
      title: "Code Editor",
      description:
        "A dedicated browser workspace — write and run JavaScript instantly, save your code as a file, and import it back.",
      icon: "Code2",
    },
    {
      title: "DSA Problems",
      description:
        "Practice 220+ DSA problems — beginner drills to LeetCode classics — statement and editor side by side, mark solved as you go.",
      icon: "BrainCircuit",
    },
    {
      title: "Interview Prep",
      description:
        "1,000+ questions across 38 chapters — now including Production Engineering and Distributed Systems in Production, built around real incidents.",
      icon: "Target",
    },
  ],
  fixesSummary: [
    "New chapter: Production Engineering & Incident Patterns — 28 real production failures, from SELECT * to connection-pool exhaustion to a nightly memory leak",
    "New chapter: Distributed Systems in Production — 26 questions on idempotency, sagas, cache stampedes, Kafka partitions and replication lag",
    "New TypeScript chapter — 40 junior-level questions, shared by Software Engineer and Frontend Engineer with a single source of truth",
    "Interview bank rebuilt to 1,000+ questions; Software Engineer now has 11 chapters",
    "Ten new question tags — http-methods, two-pointers, sliding-window, hash-map, in-place, bit-manipulation, linked-list, interval-merging, cherry-pick, force-push — so tag-based practice can actually reach algorithm questions",
  ],
};
