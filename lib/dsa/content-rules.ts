/**
 * @file
 *
 * Pure content rules for the DSA module. One implementation, two runners:
 * `scripts/check-dsa.ts` (post-build) and `tests/dsa-content.test.ts`
 * (pre-build, DB-free).
 *
 * KEEP THIS FILE DEPENDENCY-FREE apart from the type import (I.9).
 */

import type {
  DsaChapter,
  DsaFrame,
  DsaLesson,
  DsaLessonSection,
  DsaModule,
} from "@/config/dsa/types";

export type ContentFinding = {
  level: "fail" | "warn";
  code: string;
  message: string;
};

const VALID_VISUAL_KINDS = new Set<DsaFrame["kind"]>([
  "array",
  "tree",
  "graph",
  "linkedlist",
  "stack",
  "queue",
  "heap",
]);

/* -------------------------------------------------------------------------- */
/* Depth                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A word floor is a proxy, not a proof. It separates a 60-word definition from
 * a lesson that explains; it cannot separate an explanation from 900 words of
 * repetition. The slice review is the real gate. This floor exists to stop the
 * silent regression: a lesson rewritten down to four sentences in a later
 * "cleanup" gets caught here instead of shipping.
 */
export const DEPTH_FLOOR = 650;
export const DEPTH_TARGET = 900;

/**
 * The ratchet. A lesson listed here must meet the floor or the suite fails;
 * an unlisted lesson warns instead, so unfinished work never makes the tree
 * red. Keys are `<module>/<lesson>`.
 *
 * When this set contains every lesson, delete it and make the floor
 * unconditional — a ratchet that outlives its purpose is just a list to
 * forget.
 */
export const DEEPENED_LESSONS = new Set<string>([
  // slice 0
  "foundations/what-is-dsa",
  "foundations/measuring-cost",
  "foundations/recursion-basics",
  // slice 1
  "complexity-and-maths/counting-ops",
  "complexity-and-maths/recurrences",
  "complexity-and-maths/number-basics",
  "arrays-and-strings/array-basics",
  "arrays-and-strings/two-pointers",
  "arrays-and-strings/prefix-sums",
  "searching/linear-search",
  "searching/binary-search",
  "searching/search-on-answer",
]);

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

export function collectChapterLeaves(
  chapters: DsaChapter[] | undefined,
  into: DsaChapter[] = [],
): DsaChapter[] {
  for (const chapter of chapters ?? []) {
    if (chapter.children && chapter.children.length > 0) {
      collectChapterLeaves(chapter.children, into);
    } else {
      into.push(chapter);
    }
  }
  return into;
}

export function inspectModuleContent(
  module: DsaModule,
  deepened: ReadonlySet<string> = DEEPENED_LESSONS,
): ContentFinding[] {
  const findings: ContentFinding[] = [];
  const thin: string[] = [];
  const lessonSlugs = new Set(module.lessons.map((l) => l.slug));
  const leaves = collectChapterLeaves(module.chapters);
  const binding =
    leaves.length === 0
      ? "no-outline"
      : leaves.every((l) => l.lessonSlug)
        ? "bound"
        : leaves.some((l) => l.lessonSlug)
          ? "partial"
          : "unbound";

  if (binding === "partial") {
    findings.push({
      level: "fail",
      code: "outline-half-converted",
      message: `${module.slug}: some chapter leaves are bound and some are not`,
    });
  }

  if (binding === "bound") {
    const seen = new Map<string, string>();
    for (const leaf of leaves) {
      const slug = leaf.lessonSlug as string;
      if (!lessonSlugs.has(slug)) {
        findings.push({
          level: "fail",
          code: "outline-promises-missing-lesson",
          message: `${module.slug}: chapter "${leaf.slug}" binds "${slug}", which is not a lesson`,
        });
      }
      const prev = seen.get(slug);
      if (prev) {
        findings.push({
          level: "fail",
          code: "outline-duplicate-binding",
          message: `${module.slug}: chapters "${prev}" and "${leaf.slug}" both bind "${slug}"`,
        });
      }
      seen.set(slug, leaf.slug);
    }
    for (const lesson of module.lessons) {
      if (!seen.has(lesson.slug)) {
        findings.push({
          level: "fail",
          code: "lesson-not-in-outline",
          message: `${module.slug}: lesson "${lesson.slug}" has no leaf chapter`,
        });
      }
    }
  }

  if (module.lessons.length === 0) {
    findings.push({
      level: "fail",
      code: "no-lessons",
      message: `${module.slug}: module has no lessons`,
    });
  }

  const lessonSlugSet = new Set<string>();
  for (const lesson of module.lessons) {
    if (lessonSlugSet.has(lesson.slug)) {
      findings.push({
        level: "fail",
        code: "duplicate-lesson-slug",
        message: `${module.slug}: duplicate lesson slug "${lesson.slug}"`,
      });
    }
    lessonSlugSet.add(lesson.slug);

    for (const section of lesson.sections) {
      if (section.kind === "visual") {
        if (!section.frames || section.frames.length === 0) {
          findings.push({
            level: "fail",
            code: "visual-no-frames",
            message: `${module.slug}/${lesson.slug}: visual section "${section.title}" has no frames`,
          });
        }
        for (const frame of section.frames ?? []) {
          if (
            !VALID_VISUAL_KINDS.has(frame.kind) ||
            frame.state.kind !== frame.kind
          ) {
            findings.push({
              level: "fail",
              code: "visual-kind-mismatch",
              message: `${module.slug}/${lesson.slug}: frame "${frame.id}" kind/state mismatch`,
            });
          }
        }
      }
      if (section.kind === "code") {
        if (!section.starter.trim() || !section.solution.trim()) {
          findings.push({
            level: "fail",
            code: "code-empty",
            message: `${module.slug}/${lesson.slug}: code section "${section.title}" has empty starter or solution`,
          });
        }
      }
    }

    const sources = lesson.sources ?? [];
    if (sources.length === 0) {
      findings.push({
        level: "fail",
        code: "sources-missing",
        message: `${module.slug}/${lesson.slug}: no sources`,
      });
    }
    if (sources.length > 3) {
      findings.push({
        level: "fail",
        code: "sources-too-many",
        message: `${module.slug}/${lesson.slug}: ${sources.length} sources, max 3`,
      });
    }
    for (const source of sources) {
      if (!source.label.trim()) {
        findings.push({
          level: "fail",
          code: "source-label-empty",
          message: `${module.slug}/${lesson.slug}: a source has no label`,
        });
      }
      if (!/^https:\/\/\S+$/.test(source.url)) {
        findings.push({
          level: "fail",
          code: "source-not-https",
          message: `${module.slug}/${lesson.slug}: source "${source.url}" is not a plain https URL`,
        });
      }
    }

    // Depth is checked only for lessons already converted. An unconverted
    // lesson is collected for the module-level warning below instead, so a
    // half-finished content pass never turns the suite red.
    const key = `${module.slug}/${lesson.slug}`;
    const words = lessonWordCount(lesson);
    if (deepened.has(key)) {
      if (words < DEPTH_FLOOR) {
        findings.push({
          level: "fail",
          code: "lesson-depth",
          message: `${key}: ${words} prose words, floor is ${DEPTH_FLOOR}`,
        });
      }
      if (sources.length < 2) {
        findings.push({
          level: "fail",
          code: "lesson-sources-thin",
          message: `${key}: ${sources.length} source(s), a deep lesson needs at least 2`,
        });
      }
      const explanatory = lesson.sections.filter(
        (section) =>
          section.kind === "scenario" ||
          section.kind === "concept" ||
          section.kind === "compare",
      ).length;
      if (explanatory < 3) {
        findings.push({
          level: "fail",
          code: "lesson-theory-thin",
          message: `${key}: ${explanatory} explanatory section(s), a deep lesson needs at least 3`,
        });
      }
      const recap = lesson.sections.find((section) => section.kind === "recap");
      const recapPoints = recap?.kind === "recap" ? recap.points.length : 0;
      if (recapPoints < 3) {
        findings.push({
          level: "fail",
          code: "recap-thin",
          message: `${key}: recap has ${recapPoints} point(s), needs at least 3`,
        });
      }
    } else {
      thin.push(`${lesson.slug} (${words})`);
    }
  }

  if (thin.length > 0) {
    const done = module.lessons.length - thin.length;
    findings.push({
      level: "warn",
      code: "module-not-deepened",
      message: `${module.slug}: ${done} of ${module.lessons.length} lessons deepened; thin: ${thin.join(", ")}`,
    });
  }

  return findings;
}

/**
 * The ledger is only a gate if its keys still name real lessons. A renamed or
 * deleted lesson would otherwise leave the ledger guarding nothing, and the
 * suite would stay green while depth quietly regressed.
 */
export function inspectDepthLedger(
  modules: DsaModule[],
  deepened: ReadonlySet<string> = DEEPENED_LESSONS,
): ContentFinding[] {
  const present = new Set<string>();
  for (const module of modules) {
    for (const lesson of module.lessons) {
      present.add(`${module.slug}/${lesson.slug}`);
    }
  }

  const findings: ContentFinding[] = [];
  for (const key of deepened) {
    if (!present.has(key)) {
      findings.push({
        level: "fail",
        code: "depth-ledger-stale",
        message: `${key}: listed as deepened, but no such lesson exists`,
      });
    }
  }
  return findings;
}

export function inspectModuleOrder(modules: DsaModule[]): ContentFinding[] {
  const findings: ContentFinding[] = [];
  const seen = new Map<number, string>();
  for (const module of modules) {
    const previous = seen.get(module.order);
    if (previous) {
      findings.push({
        level: "fail",
        code: "order-duplicate",
        message: `modules "${previous}" and "${module.slug}" both claim order ${module.order}`,
      });
    }
    seen.set(module.order, module.slug);
  }
  for (let expected = 1; expected <= modules.length; expected += 1) {
    if (!seen.has(expected)) {
      findings.push({
        level: "fail",
        code: "order-gap",
        message: `no module has order ${expected}`,
      });
    }
  }

  // Part and order must agree. The syllabus renders part groups of globally
  // numbered rows, so a module whose `part` is out of step with its `order`
  // appears as a hole in one group (03, 04, 06) and as a stray number at the
  // top of the next — indistinguishable from deleted content to a reader, and
  // invisible to every other gate because both fields are valid on their own.
  // Binary Trees shipped as order 5 / part 2 exactly this way.
  const byOrder = [...modules].sort((a, b) => a.order - b.order);
  for (let i = 1; i < byOrder.length; i += 1) {
    const previous = byOrder[i - 1];
    const current = byOrder[i];
    if (current.part < previous.part) {
      findings.push({
        level: "fail",
        code: "part-order-inverted",
        message: `module "${current.slug}" is order ${current.order} in part ${current.part}, after "${previous.slug}" at order ${previous.order} in part ${previous.part}`,
      });
    }
  }

  // One part, one name. The index takes the heading from its first module, so a
  // renamed title in a single file would be silently overridden there and shown
  // verbatim on that module's own page — two names for the same group.
  const titleByPart = new Map<number, { title: string; slug: string }>();
  for (const module of modules) {
    const known = titleByPart.get(module.part);
    if (!known) {
      titleByPart.set(module.part, {
        title: module.partTitle,
        slug: module.slug,
      });
    } else if (known.title !== module.partTitle) {
      findings.push({
        level: "fail",
        code: "part-title-drift",
        message: `part ${module.part} is "${known.title}" in "${known.slug}" and "${module.partTitle}" in "${module.slug}"`,
      });
    }
  }

  return findings;
}
