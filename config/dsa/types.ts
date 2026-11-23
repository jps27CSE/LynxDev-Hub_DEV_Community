/**
 * The shared contract for the DSA learning module.
 *
 * Every type that content, the visual player, the code runner and the progress
 * layer all agree on lives in this one dependency-free file. That is not
 * tidiness — it is the only arrangement that avoids a runtime import cycle:
 * content (`config/dsa/modules/*`) and the client components both import this
 * file, and this file imports nothing.
 *
 * KEEP THIS FILE DEPENDENCY-FREE — no React, no `config/db`, no imports at
 * all. Feature-tracker item I.9: a `"use client"` component reading a *value*
 * out of a module that reaches `config/db` drags mysql2 and the Node
 * `net`/`tls`/`timers` builtins into the browser bundle and fails the build
 * with `Can't resolve 'net'` — while `tsc` passes, because the violation is a
 * bundler concern and not a type error. `tsc` will not catch a mistake here.
 * `npm run build` will.
 */

/* -------------------------------------------------------------------------- */
/* Visual frames                                                              */
/* -------------------------------------------------------------------------- */

/** Which renderer a frame uses. One renderer per kind — no fallback. */
export type DsaVisualKind =
  | "array"
  | "tree"
  | "graph"
  | "linkedlist"
  | "stack"
  | "queue"
  | "heap";

export type DsaFrame = {
  /** Stable id within the animation. */
  id: string;
  /** Which renderer to use. */
  kind: DsaVisualKind;
  /** Caption shown under the visual (one sentence, beginner language). */
  caption: string;
  /** Renderer-specific payload. Discriminated union: a missed field is a compile error. */
  state:
    | {
        kind: "array";
        values: (number | string)[];
        pointers?: { index: number; label: string; color?: string }[];
        highlight?: number[];
        range?: [number, number];
      }
    | {
        kind: "tree";
        nodes: { id: string; value: number | string; left?: string; right?: string }[];
        root: string;
        highlight?: string[];
        pointers?: { nodeId: string; label: string }[];
      }
    | {
        kind: "graph";
        nodes: { id: string; label: string }[];
        edges: { from: string; to: string; weight?: number; directed?: boolean }[];
        highlightNodes?: string[];
        highlightEdges?: string[];
      }
    | {
        kind: "linkedlist";
        nodes: { value: number | string; next?: string }[];
        head: string;
        highlight?: string[];
        pointers?: { nodeId: string; label: string }[];
      }
    | { kind: "stack"; values: (number | string)[]; highlight?: number }
    | { kind: "queue"; values: (number | string)[]; highlight?: number }
    | { kind: "heap"; values: (number | string)[]; highlight?: number[] };
};

/* -------------------------------------------------------------------------- */
/* Lesson content                                                             */
/* -------------------------------------------------------------------------- */

export type DsaLessonSection =
  | { kind: "scenario"; title: string; body: string }
  | { kind: "concept"; title: string; body: string }
  /** Step-through animation. Frames are authored, not computed. */
  | { kind: "visual"; title: string; frames: DsaFrame[] }
  /** Runnable code with starter, solution and optional hidden tests. */
  | {
      kind: "code";
      title: string;
      language: "javascript" | "typescript";
      starter: string;
      solution: string;
      tests?: { input: string; expected: string }[];
    }
  /** Retrieval practice, before the answer is shown. */
  | { kind: "your_turn"; prompt: string }
  | { kind: "compare"; body: string }
  | { kind: "recap"; points: string[] }
  | { kind: "video"; videoId: string; title: string; caption?: string };

export type DsaSourceRef = {
  label: string;
  url: string;
};

export type DsaLesson = {
  slug: string;
  title: string;
  sections: DsaLessonSection[];
  /** Free reads for this lesson, 1-3 of them. */
  sources?: DsaSourceRef[];
  /** Synthesis is ours; the source we learned it from is not. */
  attribution: string;
};

/* -------------------------------------------------------------------------- */
/* Navigation (left rail)                                                     */
/* -------------------------------------------------------------------------- */

export type DsaChapter = {
  /** Unique identifier for the chapter. */
  slug: string;
  /** Display title for the chapter. */
  title: string;
  /** Description or summary of the chapter. */
  description?: string;
  /** Nested sub-chapters. An empty array still counts as a leaf. */
  children?: DsaChapter[];
} & (
  | {
      /** The lesson this leaf opens. Required: a leaf with no lesson is a broken link. */
      lessonSlug: string;
    }
  | {
      /** Absent on a group — a group opens nothing. */
      lessonSlug?: undefined;
      /** A group must have children. */
      children: DsaChapter[];
    }
);

/* -------------------------------------------------------------------------- */
/* Build task (interactive)                                                   */
/* -------------------------------------------------------------------------- */

export type DsaStep = {
  id: string;
  title: string;
  /** The ask, in beginner language. */
  brief: string;
  /** Tier 2 of the hint ladder. */
  hint: string;
  /** Tier 3 — the reasoning, not the answer. */
  reveal: string;
  check: (state: DsaTaskState) => { passed: boolean; progress: string };
};

export type DsaPassCriterion = {
  id: string;
  /** The number, written the way it will be shown. */
  label: string;
  /** `false` is advisory — displayed, never blocking. */
  required: boolean;
  assert: (state: DsaTaskState) => boolean;
  /** Why this number and not just what it is. */
  explain: string;
};

/**
 * Free-form task state. Each task's `data` shape is per-task (array + two
 * pointers, tree + target, …); steps and criteria are per-task code that
 * narrows internally. Kept generic here so the contract stays small.
 */
export type DsaTaskState = {
  data: unknown;
  completedSteps: string[];
  criteriaMet: string[];
  attempts: number;
  revealed: string[];
  updatedAt: string;
};

export type DsaTaskDef = {
  /** The break, in one line. */
  brief: string;
  /** Pre-wired and deliberately broken. Never a blank canvas. */
  startState: DsaTaskState;
  /** Reference solution state. */
  solutionState: DsaTaskState;
  steps: DsaStep[];
  passCriteria: DsaPassCriterion[];
};

/* -------------------------------------------------------------------------- */
/* Module                                                                     */
/* -------------------------------------------------------------------------- */

export type DsaModuleKind = "lesson" | "lesson+task";

export type DsaInterviewByte = {
  shape: string;
  strongAnswer: string;
  trap: string;
};

export type DsaModule = {
  /** Always identical to the filename under `config/dsa/modules/`. */
  slug: string;
  order: number;
  /** Difficulty tier: 0 Foundations, 1 Core, 2 Patterns, 3 Advanced. */
  part: 0 | 1 | 2 | 3;
  partTitle: string;
  title: string;
  description: string;
  /** Reading-only module, or one that ends in a Build Task. */
  kind: DsaModuleKind;
  /** Where our app is now, and what just broke. */
  story: string;
  /** Chapters organize the learning content into sections. */
  chapters?: DsaChapter[];
  lessons: DsaLesson[];
  interviewByte?: DsaInterviewByte;
  /** Absent on `lesson` modules. */
  task?: DsaTaskDef;
  recap: string[];
  attribution: string;
};

/* -------------------------------------------------------------------------- */
/* Progress                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Persisted, not recomputed. A passed gate is permanent — recomputing it
 * means a threshold tweak in a later deploy silently un-passes a completed
 * module and re-blocks the user.
 */
export type DsaUserState = {
  lessonsCompleted: string[];
  tasks?: Record<string, DsaTaskState>;
};