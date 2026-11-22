import type { CourseKey } from "@/config/courses/types";
import type { PlatformCourseRef, RoadmapPlatformLink } from "./types";

/**
 * Pure key → course resolution for roadmap links.
 *
 * Kept out of `lib/` on purpose: `tests/` imports this file, and anything reached
 * from `lib/` here would pull `config/db` (mysql2) into a suite that must run
 * before `Build` with no `DATABASE_URL`.
 */

export type PlatformCourseSource = {
  key: CourseKey;
  title: string;
  order_index: number;
};

export type PlatformCourseRow = {
  id: number;
  title: string;
  order_index: number | null;
  chapter_count: number;
};

function normaliseTitle(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, " ");
}

function groupBy<T>(
  items: ReadonlyArray<T>,
  keyOf: (item: T) => string | number | null,
) {
  const groups = new Map<string | number, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    if (key === null) continue;
    const bucket = groups.get(key);
    if (bucket) bucket.push(item);
    else groups.set(key, [item]);
  }
  return groups;
}

/**
 * Match config courses to database rows, by title first and `order_index` second.
 *
 * A match is only used when it is *unique*. Duplicate titles or duplicate
 * order indexes mean more than one course could own the link, and a roadmap
 * that guesses points at the wrong course with no visible symptom — an omitted
 * link is the safer failure.
 */
export function buildPlatformCourseMap(
  configCourses: ReadonlyArray<PlatformCourseSource>,
  dbCourses: ReadonlyArray<PlatformCourseRow>,
): Partial<Record<CourseKey, PlatformCourseRef>> {
  const byTitle = groupBy(dbCourses, (row) => normaliseTitle(row.title));
  const byOrder = groupBy(dbCourses, (row) => row.order_index);

  const map: Partial<Record<CourseKey, PlatformCourseRef>> = {};

  for (const course of configCourses) {
    const titleMatches = byTitle.get(normaliseTitle(course.title)) ?? [];
    const orderMatches = byOrder.get(course.order_index) ?? [];
    const match =
      titleMatches.length === 1
        ? titleMatches[0]
        : orderMatches.length === 1
          ? orderMatches[0]
          : undefined;

    if (!match) continue;

    map[course.key] = {
      id: match.id,
      title: match.title,
      chapterCount: match.chapter_count,
    };
  }

  return map;
}

/**
 * Keys from `configCourses` that did not resolve to a database row. Surfaced
 * as a runtime warning so seed/DB drift is visible between deploys (the build
 * gate catches it at build time; this catches it in production).
 */
export function findUnresolvedCourseKeys(
  configCourses: ReadonlyArray<PlatformCourseSource>,
  resolved: Partial<Record<CourseKey, PlatformCourseRef>>,
): CourseKey[] {
  return configCourses
    .map((course) => course.key)
    .filter((key) => !resolved[key]);
}

/** One renderable row in the "Learn it on LynxDEV" block. */
export type PlatformEntry = {
  /** Stable React key — a course key or the route href. */
  key: string;
  href: string;
  title: string;
  kind: "course" | "lesson" | "task";
  /** Course rows only: the database's chapter count, e.g. "14 chapters". */
  detail?: string;
  note?: string;
};

/**
 * Resolve a node's declared platform links into rows the panel can render.
 *
 * A course whose key has no database row is **dropped**, not guessed at: the id
 * only exists in the database, so an unresolved key cannot become a link
 * without inventing one. Lesson and task links carry their own href, which is
 * why they survive a database outage — the DB-down state is "courses hidden,
 * lessons visible", never "empty block" or "dead link".
 */
export function resolvePlatformEntries(
  links: ReadonlyArray<RoadmapPlatformLink>,
  platformCourses: Partial<Record<CourseKey, PlatformCourseRef>>,
): PlatformEntry[] {
  const entries: PlatformEntry[] = [];

  for (const link of links) {
    if (link.kind === "course") {
      const ref = platformCourses[link.courseKey];
      if (!ref) continue;
      entries.push({
        key: `course:${link.courseKey}`,
        href: `/courses/${ref.id}`,
        title: ref.title,
        kind: "course",
        detail: `${ref.chapterCount} ${ref.chapterCount === 1 ? "chapter" : "chapters"}`,
        note: link.note,
      });
      continue;
    }

    entries.push({
      key: `${link.kind}:${link.href}`,
      href: link.href,
      title: link.title,
      kind: link.kind,
      note: link.note,
    });
  }

  return entries;
}
