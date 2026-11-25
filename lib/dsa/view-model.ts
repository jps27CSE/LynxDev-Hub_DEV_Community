/**
 * @file
 *
 * View models for the DSA routes.
 *
 * A page loader has an `DsaModule`; a client component must not. Two reasons,
 * both learned the hard way in this repo:
 *
 * 1. `DsaTaskDef.steps[].check` and `passCriteria[].assert` are **functions**.
 *    Passing the module straight into a Client Component fails the build with
 *    "Functions cannot be passed directly to Client Components" — which `tsc`
 *    does not catch, because the type is honest and the boundary is not.
 * 2. Even where it type-checks, shipping a whole domain object to a component
 *    that reads three fields is a payload decision made by not deciding. The
 *    system design module measured 65 kB of HTML for a page that needed
 *    titles, counts and one brief.
 *
 * So the page converts once, here, and the components consume only what they
 * render. Keep this file dependency-free apart from the type import (I.9): a
 * client component imports it, so anything that reaches `config/db` would drag
 * mysql2 into the browser bundle.
 */

import type {
  DsaChapter,
  DsaLesson,
  DsaLessonSection,
  DsaModule,
} from "@/config/dsa/types";
import { collectChapterLeaves } from "./content-rules";

/* -------------------------------------------------------------------------- */
/* Reading cost                                                               */
/* -------------------------------------------------------------------------- */

/** Values chosen for prose, not for code — a code block is not 200 wpm of reading. */
const WORDS_PER_MINUTE = 200;

const PROSE_KINDS = new Set<DsaLessonSection["kind"]>([
  "scenario",
  "concept",
  "compare",
  "recap",
]);

/** Strips tags so a word count measures words and not markup. */
export function countWords(html: string): number {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;|&#\d+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length === 0) return 0;
  return text.split(" ").length;
}

function sectionProse(section: DsaLessonSection): string {
  switch (section.kind) {
    case "scenario":
    case "concept":
    case "compare":
      return section.body;
    case "recap":
      return section.points.join(" ");
    default:
      return "";
  }
}

export function lessonWordCount(lesson: DsaLesson): number {
  return lesson.sections.reduce(
    (total, section) =>
      PROSE_KINDS.has(section.kind)
        ? total + countWords(sectionProse(section))
        : total,
    0,
  );
}

/** Always at least 1: a lesson that says "1 min" is honest, "0 min" is broken. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

/* -------------------------------------------------------------------------- */
/* Lesson summary                                                             */
/* -------------------------------------------------------------------------- */

export type DsaSectionKind = DsaLessonSection["kind"];

export type DsaLessonSummary = {
  slug: string;
  title: string;
  sectionCount: number;
  /** How many of each section kind — the lesson's shape, in one glance. */
  kinds: Partial<Record<DsaSectionKind, number>>;
  readMinutes: number;
};

export function toLessonSummary(lesson: DsaLesson): DsaLessonSummary {
  const kinds: Partial<Record<DsaSectionKind, number>> = {};
  for (const section of lesson.sections) {
    kinds[section.kind] = (kinds[section.kind] ?? 0) + 1;
  }
  return {
    slug: lesson.slug,
    title: lesson.title,
    sectionCount: lesson.sections.length,
    kinds,
    readMinutes: readingMinutes(lessonWordCount(lesson)),
  };
}

/* -------------------------------------------------------------------------- */
/* Module overview                                                            */
/* -------------------------------------------------------------------------- */

export type DsaModuleOverview = {
  slug: string;
  order: number;
  part: number;
  partTitle: string;
  title: string;
  description: string;
  story: string;
  hasTask: boolean;
  taskBrief: string | null;
  /** Flattened reading order — what "next lesson" means. See `lessonOrder`. */
  sequence: LessonOrderEntry[];
  lessons: DsaLessonSummary[];
  recap: string[];
  attribution: string;
  interviewByte: DsaModule["interviewByte"] | null;
};

export function toModuleOverview(module: DsaModule): DsaModuleOverview {
  const lessons = module.lessons.map(toLessonSummary);
  return {
    slug: module.slug,
    order: module.order,
    part: module.part,
    partTitle: module.partTitle,
    title: module.title,
    description: module.description,
    story: module.story,
    hasTask: module.kind === "lesson+task" && Boolean(module.task),
    taskBrief:
      module.kind === "lesson+task" ? (module.task?.brief ?? null) : null,
    sequence: lessonOrder(module),
    lessons,
    recap: module.recap,
    attribution: module.attribution,
    interviewByte: module.interviewByte ?? null,
  };
}

/* -------------------------------------------------------------------------- */
/* Order                                                                      */
/* -------------------------------------------------------------------------- */

export type LessonOrderEntry = { slug: string; title: string };

/**
 * The order a learner walks the module in.
 *
 * Chapters win when they bind every lesson: they are the authored outline, they
 * carry shorter labels than lesson titles, and `check:dsa` already fails if a
 * leaf and a lesson disagree in either direction. Modules with no outline fall
 * back to their lesson array — visible, not silent, because the checker prints
 * them as warnings on every run.
 */
export function lessonOrder(module: DsaModule): LessonOrderEntry[] {
  const leaves = collectChapterLeaves(module.chapters).filter(
    (leaf): leaf is DsaChapter & { lessonSlug: string } =>
      typeof leaf.lessonSlug === "string" && leaf.lessonSlug.length > 0,
  );
  if (leaves.length > 0) {
    return leaves.map((leaf) => ({ slug: leaf.lessonSlug, title: leaf.title }));
  }
  return module.lessons.map((lesson) => ({
    slug: lesson.slug,
    title: lesson.title,
  }));
}

export type LessonNeighbours = {
  position: number;
  total: number;
  prev: LessonOrderEntry | null;
  next: LessonOrderEntry | null;
};

export function lessonNeighbours(
  module: DsaModule,
  lessonSlug: string,
): LessonNeighbours {
  const order = lessonOrder(module);
  const index = order.findIndex((entry) => entry.slug === lessonSlug);
  const safeIndex = index === -1 ? 0 : index;
  return {
    position: index === -1 ? 0 : index + 1,
    total: order.length,
    prev: safeIndex > 0 ? order[safeIndex - 1] : null,
    next: safeIndex < order.length - 1 ? order[safeIndex + 1] : null,
  };
}

/* -------------------------------------------------------------------------- */
/* Totals (index scoreboard)                                                  */
/* -------------------------------------------------------------------------- */

export type DsaTotals = {
  modules: number;
  lessons: number;
  tasks: number;
};

export function dsaTotals(modules: DsaModule[]): DsaTotals {
  const lessons = modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );
  return {
    modules: modules.length,
    lessons,
    tasks: modules.filter(
      (module) => module.kind === "lesson+task" && module.task,
    ).length,
  };
}

/* `DsaTotals` deliberately carries no aggregate reading time. It was accurate
   and actively misleading: 3,639 words across 59 lessons is 18 minutes, which
   on a hero line reads as a syllabus nobody has written yet. Reading time is a
   per-lesson pacing aid (`DsaLessonSummary.readMinutes`), not a scoreboard. */

/** `part` is a 0-based grouping key in content; readers count groups from 1. */
export function partNumber(part: number): number {
  return part + 1;
}

/** `"12 / 54"` and the fill ratio, kept out of JSX so it is testable. */
export function progressRatio(done: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(1, Math.max(0, done / total));
}

/** First lesson with no completion key, in syllabus order. Null when finished. */
export function nextIncompleteLesson(
  modules: DsaModuleOverview[],
  completedKeys: readonly string[],
): { moduleSlug: string; lessonSlug: string; title: string } | null {
  const done = new Set(completedKeys);
  for (const module of modules) {
    for (const entry of module.sequence) {
      if (!done.has(`${module.slug}/${entry.slug}`)) {
        return {
          moduleSlug: module.slug,
          lessonSlug: entry.slug,
          title: entry.title,
        };
      }
    }
  }
  return null;
}
