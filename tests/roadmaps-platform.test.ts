/**
 * @file
 *
 * Pins `buildPlatformCourseMap` — the key → course-id resolver behind the
 * "Learn it on LynxDEV" block.
 *
 * The failure this guards against is not "wrong link", it is "no link and no
 * error": roadmap config links to a course by key, the DB is the only place the
 * id exists, and every mismatch (title drift, an unseeded course, a database
 * outage) has to degrade to a *hidden* row rather than a wrong `/courses/<id>`
 * or a 500. These tests fix that degradation policy.
 *
 * The function is pure on purpose: tests run before `Build` in CI with no
 * `DATABASE_URL`, and a resolver that queries the DB inside itself can only be
 * tested by mocking the DB.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildPlatformCourseMap,
  findUnresolvedCourseKeys,
  resolvePlatformEntries,
} from "../config/roadmaps/platform";
import type { CourseKey } from "../config/courses/types";

type ConfigCourse = { key: CourseKey; title: string; order_index: number };
type DbCourse = {
  id: number;
  title: string;
  order_index: number | null;
  chapter_count: number;
};

const config: ConfigCourse[] = [
  {
    key: "html",
    title: "Learn HTML — Build Websites From Scratch",
    order_index: 1,
  },
];

const db: DbCourse[] = [
  {
    id: 42,
    title: "Learn HTML — Build Websites From Scratch",
    order_index: 1,
    chapter_count: 14,
  },
];

test("matches a config course to its database row by title", () => {
  const map = buildPlatformCourseMap(config, db);
  assert.deepEqual(map.html, {
    id: 42,
    title: "Learn HTML — Build Websites From Scratch",
    chapterCount: 14,
  });
});

test("matches despite whitespace and casing differences", () => {
  const map = buildPlatformCourseMap(config, [
    { ...db[0], title: "  learn html — build   websites from scratch " },
  ]);
  assert.equal(map.html?.id, 42);
});

test("falls back to order_index when the database title drifted", () => {
  const map = buildPlatformCourseMap(config, [
    { ...db[0], title: "HTML (2024 edition)" },
  ]);
  assert.equal(map.html?.id, 42);
  assert.equal(map.html?.title, "HTML (2024 edition)");
});

test("omits a course the database does not have — the DB-down state", () => {
  const map = buildPlatformCourseMap(config, []);
  assert.equal(map.html, undefined);
  assert.doesNotThrow(() => buildPlatformCourseMap(config, []));
});

test("omits a course whose order_index is ambiguous rather than guessing", () => {
  const map = buildPlatformCourseMap(config, [
    { id: 1, title: "Something else", order_index: 1, chapter_count: 3 },
    { id: 2, title: "Another thing", order_index: 1, chapter_count: 5 },
  ]);
  assert.equal(map.html, undefined);
});

test("reports the database chapter count, not the config one", () => {
  const map = buildPlatformCourseMap(
    [{ ...config[0], title: "Drifted" }],
    [{ ...db[0], chapter_count: 9 }],
  );
  assert.equal(map.html?.chapterCount, 9);
});

test("ignores database courses that no roadmap key points at", () => {
  const map = buildPlatformCourseMap(config, [
    ...db,
    { id: 99, title: "Redux Toolkit", order_index: 9, chapter_count: 4 },
  ]);
  assert.deepEqual(Object.keys(map), ["html"]);
});

/**
 * The panel renders from `resolvePlatformEntries`. Its failure mode is the one
 * that shipped for two releases: a row that looks fine in the code and never
 * appears. These assertions cover the *visible* contract — which rows survive
 * a database outage, and what they say.
 */
test("keeps lesson links when course resolution failed — the DB-down state", () => {
  const entries = resolvePlatformEntries(
    [
      { kind: "course", courseKey: "html" },
      {
        kind: "lesson",
        title: "The contract before the code",
        href: "/system-design/api-and-contracts/lesson/the-contract-before-the-code",
      },
    ],
    {},
  );

  assert.deepEqual(
    entries.map((entry) => entry.kind),
    ["lesson"],
    "an unresolvable course must be dropped, and it must not take the lesson links with it",
  );
});

test("resolves a course row to its database id, title and chapter count", () => {
  const [entry] = resolvePlatformEntries(
    [{ kind: "course", courseKey: "html", note: "Start here" }],
    {
      html: {
        id: 150010,
        title: "Learn HTML — Build Websites From Scratch",
        chapterCount: 14,
      },
    },
  );

  assert.equal(entry.href, "/courses/150010");
  assert.equal(entry.title, "Learn HTML — Build Websites From Scratch");
  assert.equal(entry.detail, "14 chapters");
  assert.equal(entry.note, "Start here");
});

test("says 'chapter' for a single-chapter course", () => {
  const [entry] = resolvePlatformEntries(
    [{ kind: "course", courseKey: "git" }],
    { git: { id: 7, title: "Git", chapterCount: 1 } },
  );
  assert.equal(entry.detail, "1 chapter");
});

test("preserves declaration order and keeps internal hrefs exactly as configured", () => {
  const entries = resolvePlatformEntries(
    [
      {
        kind: "task",
        title: "Chaos capstone",
        href: "/system-design/chaos-capstone/task",
      },
      {
        kind: "lesson",
        title: "Cache-aside",
        href: "/system-design/caching/lesson/cache-aside",
      },
    ],
    {},
  );

  assert.deepEqual(
    entries.map((entry) => entry.href),
    [
      "/system-design/chaos-capstone/task",
      "/system-design/caching/lesson/cache-aside",
    ],
  );
});

test("returns nothing for a node with no platform links — the block stays hidden", () => {
  assert.deepEqual(resolvePlatformEntries([], {}), []);
});

test("findUnresolvedCourseKeys names exactly the keys with no database row", () => {
  const resolved = buildPlatformCourseMap(
    [
      { key: "html", title: "Learn HTML", order_index: 1 },
      { key: "css", title: "CSS Essentials", order_index: 2 },
    ],
    [{ id: 1, title: "Learn HTML", order_index: 1, chapter_count: 14 }],
  );

  assert.deepEqual(
    findUnresolvedCourseKeys(
      [
        { key: "html", title: "Learn HTML", order_index: 1 },
        { key: "css", title: "CSS Essentials", order_index: 2 },
      ],
      resolved,
    ),
    ["css"],
  );

  assert.deepEqual(
    findUnresolvedCourseKeys(
      [{ key: "html", title: "Learn HTML", order_index: 1 }],
      resolved,
    ),
    [],
  );
});
