/**
 * @file
 *
 * The content model, asserted before `Build`.
 *
 * `check:system-design` can only run after a build (it reads the prerender
 * manifest), which means a content defect is discovered minutes into CI rather
 * than in seconds. Everything here is a pure data invariant, so it runs in
 * `npm test` — before the build, with no database and no `.next` directory.
 * The prerender direction (config → route, route → config) deliberately stays
 * in the script; it is the one thing a unit test cannot reach.
 *
 * WHAT THIS FILE DOES NOT COVER
 * - The prerendered HTML. A lesson that is 800 words in config and 40 words on
 *   screen is not a failure this file can see.
 * - The chapter tree's appearance on a phone. `ModuleLayout` renders it twice
 *   (rail above `lg`, `<details>` below); whether that reads correctly is a
 *   manual check, listed in plan 17 §8.
 *
 * A suite that has never been observed failing is an untested gate, so each
 * assertion below was mutation-tested once when it was written: removing a
 * `lessonSlug` fails `outline-half-converted`, deleting a lesson from a bound
 * outline fails `lesson-not-in-outline`, and trimming a lesson under 700 words
 * fails `lesson-depth`. Recorded in plan 17 §7 (B1).
 */
import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { loadAllModules } from "../config/system-design/registry";
import {
  DEPTH_MAX_WORDS,
  DEPTH_MIN_WORDS,
  collectChapterLeaves,
  countLessonWords,
  inspectChapterBinding,
  inspectModuleContent,
  inspectModuleOrder,
  lessonNav,
} from "../lib/system-design/content-rules";
import type { SdChapter, SdModule } from "../config/system-design/types";

/**
 * Loaded in a `before` hook, not at module scope: test files run as CommonJS
 * here, where a top-level `await` is a syntax error the runner reports as an
 * opaque `exitCode: 1` with no failing assertion.
 */
let modules: SdModule[] = [];

before(async () => {
  modules = await loadAllModules();
});

function bySlug(slug: string): SdModule {
  const found = modules.find((mod) => mod.slug === slug);
  assert.ok(found, `module "${slug}" is not registered`);
  return found;
}

describe("content rules — chapter leaves", () => {
  it("flattens depth-first, so the rail order is the reading order", () => {
    const tree: SdChapter[] = [
      {
        slug: "a",
        title: "A",
        children: [
          { slug: "a1", title: "A1", lessonSlug: "a1" },
          {
            slug: "a2",
            title: "A2",
            children: [{ slug: "a2x", title: "A2x", lessonSlug: "a2x" }],
          },
        ],
      },
      { slug: "b", title: "B", lessonSlug: "b" },
    ];
    assert.deepEqual(
      collectChapterLeaves(tree).map((leaf) => leaf.slug),
      ["a1", "a2x", "b"],
    );
  });

  it("treats an empty children array as a leaf", () => {
    // `children: []` is how "a group with nothing in it yet" gets spelled by
    // hand. If it counted as a group, it would vanish from both sides of the
    // equality check and a promised lesson would disappear silently.
    const tree: SdChapter[] = [
      { slug: "empty-group", title: "Empty", children: [], lessonSlug: "x" },
    ];
    assert.equal(collectChapterLeaves(tree).length, 1);
  });

  it("classifies an outline with no bindings as unbound, not as complete", () => {
    const mod = bySlug("caching");
    assert.equal(inspectChapterBinding(mod).status, "unbound");
  });
});

describe("content rules — word count", () => {
  it("counts prose the learner reads and ignores titles and captions", () => {
    const lesson = {
      slug: "w",
      title: "A title with plenty of words in it that must not be counted",
      attribution: "",
      sections: [
        { kind: "concept" as const, title: "Ignored", body: "one two three" },
        { kind: "your_turn" as const, prompt: "four five" },
        { kind: "recap" as const, points: ["six", "seven eight"] },
      ],
    };
    assert.equal(countLessonWords(lesson), 8);
  });
});

describe("content model — every module", () => {
  it("has module order exactly 1..N", () => {
    const findings = inspectModuleOrder(modules);
    assert.deepEqual(
      findings.map((finding) => finding.message),
      [],
      "module `order` must be contiguous and unique",
    );
    assert.deepEqual(
      modules.map((mod) => mod.order).sort((a, b) => a - b),
      Array.from({ length: modules.length }, (_, index) => index + 1),
    );
  });

  it("never reports a half-converted outline or a dead leaf", () => {
    // These are failures in `check:system-design` too. Asserting them here is
    // not duplication for its own sake: the build runner is the expensive one,
    // so the cheap runner has to catch the same class first.
    const failures = modules
      .flatMap(inspectModuleContent)
      .filter((finding) => finding.level === "fail");
    assert.deepEqual(failures, []);
  });

  it("binds every leaf and every lesson together once a module is converted", () => {
    for (const mod of modules) {
      if (inspectChapterBinding(mod).status !== "bound") continue;
      const leafSlugs = collectChapterLeaves(mod.chapters)
        .map((leaf) => leaf.lessonSlug)
        .sort();
      const lessonSlugs = mod.lessons.map((lesson) => lesson.slug).sort();
      assert.deepEqual(
        leafSlugs,
        lessonSlugs,
        `${mod.slug}: outline and lessons disagree`,
      );
    }
  });

  it("keeps every converted lesson inside the depth bar", () => {
    for (const mod of modules) {
      if (inspectChapterBinding(mod).status !== "bound") continue;
      for (const lesson of mod.lessons) {
        const words = countLessonWords(lesson);
        assert.ok(
          words >= DEPTH_MIN_WORDS && words <= DEPTH_MAX_WORDS,
          `${mod.slug}/${lesson.slug}: ${words} words, outside ${DEPTH_MIN_WORDS}–${DEPTH_MAX_WORDS}`,
        );
      }
    }
  });

  it("gives every converted lesson at least one https source", () => {
    for (const mod of modules) {
      if (inspectChapterBinding(mod).status !== "bound") continue;
      for (const lesson of mod.lessons) {
        assert.ok(
          lesson.sources && lesson.sources.length > 0,
          `${mod.slug}/${lesson.slug}: converted lessons carry free reads`,
        );
        for (const source of lesson.sources ?? []) {
          assert.match(source.url, /^https:\/\/\S+$/);
          assert.ok(source.label.trim().length > 0);
        }
      }
    }
  });
});

describe("content model — module 1 (the converted reference)", () => {
  // Resolved in a hook: a `describe` body runs while the file is being defined,
  // which is before the top-level `before` has loaded the registry.
  let mod: SdModule;
  before(() => {
    mod = bySlug("what-is-system-design");
  });

  it("is bound, with every promised lesson present", () => {
    assert.equal(inspectChapterBinding(mod).status, "bound");
    assert.equal(collectChapterLeaves(mod.chapters).length, mod.lessons.length);
    assert.deepEqual(
      lessonNav(mod).map((entry) => entry.slug),
      [
        "choices-not-boxes",
        "performance-vs-scalability",
        "latency-vs-throughput-vs-bandwidth",
        "scalability-patterns",
      ],
    );
  });

  it("ships the lesson the old outline promised but never had", () => {
    // The pre-B1 outline advertised a `Scalability Patterns` leaf with no
    // lesson behind it. Pinned so a later edit cannot quietly drop it again.
    assert.ok(
      mod.lessons.some((lesson) => lesson.slug === "scalability-patterns"),
    );
  });

  it("runs on a published case study, not this app", () => {
    // Decision D1 (revised): the running example is Netflix, whose outage,
    // migration and CDN are documented by the company itself. The first draft
    // of this module used this site — a case study nobody can check, which
    // turns every number into an assertion of trust. Pinned so the case study
    // cannot quietly drift back to a private system.
    const prose = JSON.stringify(mod);
    assert.ok(
      prose.includes("Netflix"),
      "module 1 must name its case study — D1 is Netflix",
    );
    for (const word of ["LynxDEV", "follower", "this site", "our app"]) {
      assert.ok(
        !prose.includes(word),
        `module 1 references "${word}" — the case study is Netflix, not this app or a social feed`,
      );
    }
  });

  it("keeps its progress key stable", () => {
    // `lessons_completed` stores "<module>/<lesson>" and cannot be migrated
    // after the fact. This is the one row that existed when B1 started.
    assert.ok(
      mod.lessons.some((lesson) => lesson.slug === "choices-not-boxes"),
    );
  });
});
