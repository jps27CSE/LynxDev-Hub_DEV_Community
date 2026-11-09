/**
 * @file
 *
 * The content rules, as pure functions — one implementation, three runners.
 *
 * `scripts/check-system-design.ts` (post-build), `tests/system-design-content.test.ts`
 * (pre-build, DB-free) and `LessonFlow`'s "N min read" label all have to agree
 * about what a lesson is. Two copies of "count the words" would drift, and the
 * drift would be invisible: the gate would pass a lesson that the reader is
 * told is 4 minutes long when it is 6.
 *
 * Why the rules are enforced here and not only in `npm test`: a gate is only
 * worth what it blocks. `check:system-design` runs in CI after `Build`, the
 * tests before it — and the prerender assertions can only run after a build.
 * Keeping the *rules* here means neither runner can hold a private opinion.
 *
 * KEEP THIS FILE DEPENDENCY-FREE apart from the type import — see the I.9 note
 * at the top of `config/system-design/types.ts`. It is imported by a
 * `"use client"` component.
 */
import type {
  SdChapter,
  SdLesson,
  SdModule,
} from "@/config/system-design/types";

/**
 * The depth bar (plan 17, decision D3).
 *
 * Today's path averages 259 words per lesson. A concept-per-page resource
 * cannot be built out of 250-word pages, and "make it deeper" is not a
 * checkable instruction — a range is. 700 is the floor where a lesson can hold
 * a scenario, three to five concepts, one worked number and a recap; 900 is
 * where it starts repeating itself.
 */
export const DEPTH_MIN_WORDS = 700;
export const DEPTH_MAX_WORDS = 900;

/** More than three and the block stops being a recommendation. */
export const MAX_SOURCES_PER_LESSON = 3;

export type ChapterBindingStatus =
  /** No outline authored at all. Nothing can be promised, nothing can drift. */
  | "no-outline"
  /** Outline exists, no leaf is bound yet — the pre-2.0 state. */
  | "unbound"
  /** Some leaves bound, some not. Always a defect: it cannot be intentional. */
  | "partial"
  /** Every leaf is bound. The set-equality rules apply. */
  | "bound";

export type ChapterBinding = {
  status: ChapterBindingStatus;
  leafCount: number;
  boundCount: number;
};

export type ContentFinding = {
  level: "fail" | "warn";
  code: string;
  message: string;
};

/**
 * Depth-first, so the tree reads top to bottom in the rail.
 *
 * A chapter with an empty `children` array counts as a leaf: `children: []` is
 * how "a group with no lessons yet" is spelled, and treating it as a group
 * would silently drop it from both sides of the equality check.
 */
export function collectChapterLeaves(
  chapters: SdChapter[] | undefined,
  into: SdChapter[] = [],
): SdChapter[] {
  for (const chapter of chapters ?? []) {
    if (chapter.children && chapter.children.length > 0) {
      collectChapterLeaves(chapter.children, into);
    } else {
      into.push(chapter);
    }
  }
  return into;
}

export function inspectChapterBinding(module: {
  chapters?: SdChapter[];
}): ChapterBinding {
  const leaves = collectChapterLeaves(module.chapters);
  const boundCount = leaves.filter((leaf) => leaf.lessonSlug).length;

  if (leaves.length === 0) {
    return { status: "no-outline", leafCount: 0, boundCount: 0 };
  }
  if (boundCount === 0) {
    return { status: "unbound", leafCount: leaves.length, boundCount };
  }
  if (boundCount < leaves.length) {
    return { status: "partial", leafCount: leaves.length, boundCount };
  }
  return { status: "bound", leafCount: leaves.length, boundCount };
}

/**
 * The word count the learner is shown, and the one the gate enforces.
 *
 * Deliberately the same sections `LessonFlow` used before this file existed:
 * prose the learner reads (`body`, `prompt`, `points`). Titles, captions and
 * the video label are excluded — counting them would let a lesson pass the
 * floor with a long title and nothing else.
 */
export function countLessonWords(lesson: SdLesson): number {
  let words = 0;
  for (const section of lesson.sections) {
    const text =
      "body" in section
        ? section.body
        : "prompt" in section
          ? section.prompt
          : "points" in section
            ? section.points.join(" ")
            : "";
    if (text) words += text.trim().split(/\s+/).length;
  }
  return words;
}

/**
 * Findings for one module.
 *
 * `fail` blocks CI. `warn` is a module that has not been converted yet: it is
 * printed with its counts so the remaining work is visible in every run rather
 * than being silently "covered" by a gate that skips it.
 */
export function inspectModuleContent(module: SdModule): ContentFinding[] {
  const findings: ContentFinding[] = [];
  const binding = inspectChapterBinding(module);
  const lessonSlugs = new Set(module.lessons.map((lesson) => lesson.slug));

  if (binding.status === "no-outline") {
    findings.push({
      level: "warn",
      code: "outline-missing",
      message: `${module.slug}: no chapter outline — the rail has no tree to render`,
    });
  }

  if (binding.status === "unbound") {
    findings.push({
      level: "warn",
      code: "outline-unbound",
      message:
        `${module.slug}: outline has ${binding.leafCount} leaf chapter(s), none bound to a lesson — ` +
        `the outline is decorative until this module is converted`,
    });
  }

  if (binding.status === "partial") {
    const unbound = collectChapterLeaves(module.chapters)
      .filter((leaf) => !leaf.lessonSlug)
      .map((leaf) => leaf.slug);
    findings.push({
      level: "fail",
      code: "outline-half-converted",
      message:
        `${module.slug}: ${binding.boundCount} of ${binding.leafCount} leaf chapters are bound — ` +
        `unbound: ${unbound.join(", ")}. Convert the whole tree or none of it; ` +
        `a half-bound outline renders lessons that the equality check cannot see`,
    });
  }

  if (binding.status === "bound") {
    const seen = new Map<string, string>();
    for (const leaf of collectChapterLeaves(module.chapters)) {
      const lessonSlug = leaf.lessonSlug as string;

      if (!lessonSlugs.has(lessonSlug)) {
        findings.push({
          level: "fail",
          code: "outline-promises-missing-lesson",
          message: `${module.slug}: chapter "${leaf.slug}" binds "${lessonSlug}", which is not a lesson — the link would 404`,
        });
      }

      const previous = seen.get(lessonSlug);
      if (previous) {
        findings.push({
          level: "fail",
          code: "outline-duplicate-binding",
          message: `${module.slug}: chapters "${previous}" and "${leaf.slug}" both bind "${lessonSlug}"`,
        });
      }
      seen.set(lessonSlug, leaf.slug);
    }

    for (const lesson of module.lessons) {
      if (!seen.has(lesson.slug)) {
        findings.push({
          level: "fail",
          code: "lesson-not-in-outline",
          message: `${module.slug}: lesson "${lesson.slug}" has no leaf chapter — it exists but cannot be reached from the rail`,
        });
      }
    }
  }

  // Depth and sources apply only to converted modules. Enforcing them on the
  // other 9 today would make the gate red for work that is planned, not done —
  // and a gate that is always red stops being information.
  if (binding.status === "bound") {
    for (const lesson of module.lessons) {
      const words = countLessonWords(lesson);
      if (words < DEPTH_MIN_WORDS || words > DEPTH_MAX_WORDS) {
        findings.push({
          level: "fail",
          code: "lesson-depth",
          message:
            `${module.slug}/${lesson.slug}: ${words} words, outside ${DEPTH_MIN_WORDS}–${DEPTH_MAX_WORDS} ` +
            `(D3 — the bar is checkable, not aspirational)`,
        });
      }

      const sources = lesson.sources ?? [];
      if (sources.length === 0) {
        findings.push({
          level: "fail",
          code: "sources-missing",
          message: `${module.slug}/${lesson.slug}: no "Go deeper" sources — every converted lesson carries at least one`,
        });
      }
      if (sources.length > MAX_SOURCES_PER_LESSON) {
        findings.push({
          level: "fail",
          code: "sources-too-many",
          message: `${module.slug}/${lesson.slug}: ${sources.length} sources, max ${MAX_SOURCES_PER_LESSON}`,
        });
      }
      for (const source of sources) {
        if (!source.label.trim()) {
          findings.push({
            level: "fail",
            code: "source-label-empty",
            message: `${module.slug}/${lesson.slug}: a source has no label — a bare URL gives no reason to click`,
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
  }

  return findings;
}

/**
 * The reading order, as the rail shows it: chapter leaves when the module is
 * converted, the lesson array otherwise.
 *
 * Prev/next must follow the same order the outline displays. Two orders that
 * agree by coincidence are two orders that will disagree later — and the
 * symptom is a "next" button that skips a lesson the learner can see in the
 * rail.
 */
export type LessonNavEntry = { slug: string; title: string };

/**
 * Takes the minimum shape it needs, not `SdModule`, so the module overview page
 * can call it with lesson *summaries*. Passing full lessons to a client
 * component ships every lesson's prose in the page payload, which is the P3
 * regression risk in plan 17 §6 — and it multiplies once caching goes from 4
 * lessons to 10.
 */
export function lessonNav(module: {
  chapters?: SdChapter[];
  lessons: LessonNavEntry[];
}): LessonNavEntry[] {
  const titleBySlug = new Map(
    module.lessons.map((lesson) => [lesson.slug, lesson.title]),
  );

  if (inspectChapterBinding(module).status === "bound") {
    return collectChapterLeaves(module.chapters).map((leaf) => ({
      slug: leaf.lessonSlug as string,
      title: titleBySlug.get(leaf.lessonSlug as string) ?? leaf.title,
    }));
  }

  return module.lessons.map((lesson) => ({
    slug: lesson.slug,
    title: lesson.title,
  }));
}

/**
 * `order` must be exactly `1..N`: contiguous, unique, ascending.
 *
 * Phase B inserts a module at position 5, so every later module renumbers. A
 * duplicate order renders two cards at the same position and sorts
 * unpredictably; a gap is the fingerprint of a module that was planned and
 * never registered. Both are invisible to `tsc` and to the build.
 */
export function inspectModuleOrder(modules: SdModule[]): ContentFinding[] {
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
        message: `no module has order ${expected} — the path is numbered 1..${modules.length}`,
      });
    }
  }

  return findings;
}
