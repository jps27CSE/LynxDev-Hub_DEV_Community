/**
 * @file
 *
 * Pins the course manifest's stable keys (`CourseData.key`).
 *
 * Why this exists: roadmap nodes link to platform courses by key, never by
 * title. The first attempt used titles (`platformCourseTitle: "HTML"` compared
 * against `"Learn HTML — Build Websites From Scratch"`) and the card silently
 * never rendered for two releases. A key that can't drift is the fix; this test
 * is what keeps the fix from drifting instead.
 *
 * Both directions matter:
 *   - a course without a key fails (the roadmap can't link to it)
 *   - a key that disappears or is renamed fails (every roadmap link to it dies)
 * so the expected set is written out, not derived from the same array the
 * implementation reads.
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { allCourses } from "../config/courses";

const EXPECTED_KEYS = [
  "css",
  "git",
  "html",
  "javascript",
  "linux",
  "node",
  "react",
  "sql",
  "typescript",
];

test("every shipped course exposes a course key", () => {
  for (const course of allCourses) {
    assert.equal(
      typeof course.key,
      "string",
      `course ${JSON.stringify(course.title)} has no key — roadmaps cannot link to it`,
    );
    assert.ok(
      course.key.length > 0,
      `course ${JSON.stringify(course.title)} has an empty key`,
    );
  }
});

test("course keys are unique", () => {
  const keys = allCourses.map((course) => course.key);
  assert.equal(
    new Set(keys).size,
    keys.length,
    `duplicate course key in ${JSON.stringify(keys)} — two courses would resolve to one roadmap link`,
  );
});

test("the key set matches the shipped course manifest", () => {
  const actual = [...new Set(allCourses.map((course) => course.key))].sort();
  assert.deepEqual(
    actual,
    EXPECTED_KEYS,
    "course keys changed — update the roadmaps that link to them, then update this list",
  );
});
