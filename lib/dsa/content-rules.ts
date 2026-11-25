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

export function inspectModuleContent(module: DsaModule): ContentFinding[] {
  const findings: ContentFinding[] = [];
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
