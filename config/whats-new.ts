import { APP_VERSION } from "@/lib/app-version";

export type WhatsNewFeature = {
  title: string;
  description: string;
  icon: string;
};

export type WhatsNewData = {
  version: string;
  headline: string;
  summary: string;
  features: WhatsNewFeature[];
  fixesSummary: string[];
};

export const WHATS_NEW: WhatsNewData = {
  version: APP_VERSION,
  headline: "LynxDEV 1.0 is here",
  summary:
    "Our first major release — interactive courses, a browser code editor, 220+ DSA problems, and 900+ interview questions. Handcrafted, zero-cost, all in one place.",
  features: [
    {
      title: "Interactive Courses",
      description:
        "Hands-on courses with real exercises and an embedded editor per chapter — structured learning, not just videos.",
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
        "Practice with 900+ categorized questions and tag-based customization, built around real-world interview chapters.",
      icon: "Target",
    },
  ],
  fixesSummary: [
    "Faster page loads and a smoother experience across the platform",
    "More reliable progress saving in courses and problems",
    "General stability improvements throughout the app",
  ],
};
