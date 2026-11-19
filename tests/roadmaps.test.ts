/**
 * @file
 *
 * Pins the in-platform links on every roadmap (`RoadmapNode.platform`).
 *
 * Why this exists: the first version of this feature linked roadmaps to courses
 * with a free-text title (`platformCourseTitle: "HTML"`) compared against
 * `"Learn HTML — Build Websites From Scratch"` at render time. It never
 * matched, so the card never rendered — for two releases, silently. `tsc` was
 * green (the field was typed), the build was green (the page rendered), and
 * every page that existed resolved. Nothing was checking that a declared link
 * pointed anywhere.
 *
 * So this file checks the two things a type cannot:
 *
 *   1. every declared link resolves — a course key exists in the manifest, a
 *      lesson href names a real lesson, a task href names a module that has one;
 *   2. the mapping is complete in the other direction — no course is declared
 *      and then linked from nowhere, which would be an invisible feature rather
 *      than a missing one.
 *
 * Titles are compared to the System Design registry verbatim. That is the
 * point: the link text a learner reads is the lesson's own title, so a rename
 * in `modules/*.ts` fails here instead of shipping a stale label.
 *
 * Readings invoked in comments (`module.kind`) are from `SdModule`, where
 * `kind === "sim"` is what makes a Build Task legal (an absent task on a `sim`
 * module is a content bug the module checker reports).
 */

import { test } from "node:test";
import assert from "node:assert/strict";
import { getAllRoadmaps } from "../config/roadmaps";
import { allCourses } from "../config/courses";
import { loadAllModules } from "../config/system-design/registry";
import type { RoadmapNode } from "../config/roadmaps/types";

type Located = { roadmap: string; node: RoadmapNode };

function walkAllNodes(): Located[] {
  const out: Located[] = [];

  const walk = (roadmapSlug: string, node: RoadmapNode) => {
    out.push({ roadmap: roadmapSlug, node });
    for (const child of node.children ?? []) walk(roadmapSlug, child);
  };

  for (const roadmap of getAllRoadmaps()) walk(roadmap.slug, roadmap.root);
  return out;
}

function location({ roadmap, node }: Located) {
  return `${roadmap}/${node.id}`;
}

const LESSON_HREF = /^\/system-design\/([^/]+)\/lesson\/([^/]+)$/;
const TASK_HREF = /^\/system-design\/([^/]+)\/task$/;

test("every platform course key exists in the course manifest", () => {
  const known = new Set(allCourses.map((course) => course.key));

  for (const located of walkAllNodes()) {
    for (const link of located.node.platform ?? []) {
      if (link.kind !== "course") continue;
      assert.ok(
        known.has(link.courseKey),
        `${location(located)} links course key ${JSON.stringify(
          link.courseKey,
        )}, which no shipped course declares`,
      );
    }
  }
});

test("every shipped course is linked from at least one roadmap node", () => {
  const used = new Set<string>();

  for (const located of walkAllNodes()) {
    for (const link of located.node.platform ?? []) {
      if (link.kind === "course") used.add(link.courseKey);
    }
  }

  const missing = allCourses
    .filter((course) => !used.has(course.key))
    .map((course) => course.key);
  assert.deepEqual(
    missing,
    [],
    "these courses are never linked from a roadmap — either link them or stop shipping them",
  );
});

test("every lesson link resolves to a real lesson and matches its title", async () => {
  const modules = await loadAllModules();
  const bySlug = new Map(modules.map((module) => [module.slug, module]));

  for (const located of walkAllNodes()) {
    for (const link of located.node.platform ?? []) {
      if (link.kind !== "lesson") continue;

      const match = LESSON_HREF.exec(link.href);
      assert.ok(
        match,
        `${location(located)} has a malformed lesson href ${JSON.stringify(link.href)} — expected /system-design/<module>/lesson/<slug>`,
      );

      const [, moduleSlug, lessonSlug] = match;
      const module = bySlug.get(moduleSlug);
      assert.ok(
        module,
        `${location(located)} points at unknown System Design module ${JSON.stringify(moduleSlug)}`,
      );

      const lesson = module!.lessons.find(
        (candidate) => candidate.slug === lessonSlug,
      );
      assert.ok(
        lesson,
        `${location(located)} points at ${lessonSlug}, which module ${moduleSlug} does not publish (it has: ${module!.lessons
          .map((candidate) => candidate.slug)
          .join(", ")})`,
      );
      assert.equal(
        link.title,
        lesson!.title,
        `${location(located)} labels ${lessonSlug} ${JSON.stringify(link.title)} but the lesson is titled ${JSON.stringify(
          lesson!.title,
        )} — copy the registry title verbatim so the link text cannot drift`,
      );
    }
  }
});

test("every task link resolves to a module that has a task", async () => {
  const modules = await loadAllModules();
  const bySlug = new Map(modules.map((module) => [module.slug, module]));

  for (const located of walkAllNodes()) {
    for (const link of located.node.platform ?? []) {
      if (link.kind !== "task") continue;

      const match = TASK_HREF.exec(link.href);
      assert.ok(
        match,
        `${location(located)} has a malformed task href ${JSON.stringify(link.href)} — expected /system-design/<module>/task`,
      );

      const module = bySlug.get(match[1]);
      assert.ok(
        module,
        `${location(located)} points at unknown System Design module ${JSON.stringify(match[1])}`,
      );
      assert.equal(
        module!.kind,
        "sim",
        `${location(located)} links a task on ${match[1]}, which is a ${module!.kind} module and has no task`,
      );
    }
  }
});

test("no node declares the same course key or href twice", () => {
  for (const located of walkAllNodes()) {
    const seen: string[] = [];

    for (const link of located.node.platform ?? []) {
      const identity =
        link.kind === "course" ? `course:${link.courseKey}` : link.href;
      assert.ok(
        !seen.includes(identity),
        `${location(located)} declares ${identity} twice — React would warn about the duplicate key, and the second row is dead`,
      );
      seen.push(identity);
    }
  }
});

test("platform link arrays are never declared empty", () => {
  for (const located of walkAllNodes()) {
    const platform = located.node.platform;
    if (!platform) continue;
    assert.ok(
      platform.length > 0,
      `${location(located)} declares platform: [] — delete the key instead, an empty array is a typo waiting to hide`,
    );
  }
});
