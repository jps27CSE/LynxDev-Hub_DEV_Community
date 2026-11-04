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
 *
 * B2's assertions were broken the same way: swapping two entries of a `nav`
 * array failed `outline order and lesson order disagree`, and renaming a
 * heading to "Our app requirements" failed the pronoun check while the
 * substring checks stayed green — which is the point of the separate regex.
 *
 * B5 added the first assertion in this file that runs the engine rather than
 * reading config: module 6's task is asserted to fail at the start and pass at
 * the finish. Each new guard was mutated once and observed red — raising
 * `arrivalRate` from 4,000 to 15,000 (`solution fails "zero-errors"`, the store
 * becomes the bottleneck at that load), dropping `replicas` from 4 to 2 (same
 * criterion: two instances are exactly 4,000 of capacity for 4,000 of load),
 * deleting the `zero-errors` criterion (`too few criteria`), removing a
 * `lessonSlug` (two failures: `half-converted`, then outline/lesson mismatch),
 * reordering two chapters (`outline order and lesson order disagree`), renaming
 * Zuul/Eureka (`no Zuul reference`), and emptying one lesson's bodies (125
 * words, outside 700–900). Recorded in plan 17 §7.4.
 *
 * B5 part 2 (modules 8 and 9) added two guards that are not about arithmetic:
 * a module whose *control* tier is asserted to stay healthy, and — in module 9
 * — an assertion that pins a **limitation** of the model rather than a feature
 * of the content. Ten read replicas and no partitioning pass that task's
 * required criteria, because the engine has no dimension for bytes. The test
 * asserts that this is still true, so that if a later slice gives the engine a
 * storage dimension the test fails and the disclosure in the lesson has to be
 * rewritten instead of quietly becoming a lie.
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
import type {
  SdChapter,
  SdGraph,
  SdModule,
} from "../config/system-design/types";
import { defaultNode, getNodeTypeSpec } from "../lib/system-design/nodes";
import { simulate } from "../lib/system-design/engine";
import { SD_MAX_ARRIVAL_RATE } from "../lib/system-design/validation";

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
    // The fixture used to be a real module, named in turn as each one was
    // converted (`caching` → `read-replicas` → `rate-limiting` →
    // `cdns-and-static-content` → `how-systems-fail`). Slice B7 converted the
    // last of them, so there is no unconverted module left to point at — and the
    // assertion had already stopped covering what it was written for a slice
    // earlier, because it was testing whichever module happened to still be
    // behind rather than the rule.
    //
    // So the fixture is now local, and it has to step outside the type to exist:
    // `SdChapter` requires `lessonSlug` on a leaf (see the union in
    // `config/system-design/types.ts`), which is exactly the guarantee this
    // rule provides at runtime for outlines that arrive as data. A hand-authored
    // or CMS-authored chapter is not type-checked, so the status still has to be
    // reachable and still has to be correct.
    const unbound: SdChapter = {
      slug: "unbound-leaf",
      title: "Unbound",
      lessonSlug: undefined as unknown as string,
    };
    assert.equal(
      inspectChapterBinding({ chapters: [unbound] }).status,
      "unbound",
    );

    // `partial` is the state that must never be intentional: some leaves bound,
    // some not. It gets its own fixture for the same reason.
    const partial: SdChapter = {
      slug: "group",
      title: "Group",
      children: [
        unbound,
        { slug: "bound-leaf", title: "Bound", lessonSlug: "b" },
      ],
    };
    assert.equal(
      inspectChapterBinding({ chapters: [partial] }).status,
      "partial",
    );
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

  it("offers no converted module more traffic than its own balancer can route", () => {
    // A load balancer is one node with a fixed capacity in the teaching model,
    // and the engine sheds at utilisation ≥ 1. A task above that ceiling has no
    // possible solution: the request dies at the door before it ever reaches
    // the bottleneck the lesson is about.
    //
    // This is not hypothetical — slice B4 found the caching task at 50,000 r/s
    // against a 20,000 r/s balancer, with **96% shed in the start graph and 96%
    // in the "solution"**, while every pass criterion was green, because p95 is
    // computed over the requests that completed and only 4% did.
    //
    // Converted modules only: module 8 still carries 50,000 and fixing it is the
    // rest of slice B5. A gate that is red for planned work stops being
    // information, which is the rule the whole file runs on.
    for (const mod of modules) {
      if (inspectChapterBinding(mod).status !== "bound" || !mod.task) continue;
      for (const [name, graph] of [
        ["start", mod.task.startGraph],
        ["solution", mod.task.solutionGraph],
      ] as const) {
        const routed =
          graph.nodes.filter((n) => n.type === "load_balancer").length *
          getNodeTypeSpec("load_balancer").capacity;
        // No balancer is a legitimate graph — module 1 starts with a single
        // box, which is the point of that module. The rule only applies once
        // there is a door to route through.
        if (routed === 0) continue;
        assert.ok(
          graph.scenario.arrivalRate < routed,
          `${mod.slug} (${name} graph): ${graph.scenario.arrivalRate} r/s offered ` +
            `against ${routed} r/s of balancer capacity — every request is shed at the door`,
        );
      }
    }
  });

  it("keeps every authored task graph under the arrival-rate ceiling", () => {
    // `SD_MAX_ARRIVAL_RATE` is applied by `SdGraphSchema` to the POST body and
    // to share links, but a module's `startGraph`/`solutionGraph` is authored
    // TypeScript that never passes through Zod. So a content edit could set a
    // rate the schema would silently clamp — the learner would then see the
    // canvas disagree with the scenario they saved, and `simulate()` would pay
    // `arrivalRate × 10` on every Run.
    //
    // All modules, not just converted ones: this is a hard bound on engine
    // cost, not a content-quality bar. Content currently peaks at 16,000
    // (module 9), so the ceiling keeps every lesson reproducible.
    for (const mod of modules) {
      if (!mod.task) continue;
      for (const [name, graph] of [
        ["start", mod.task.startGraph],
        ["solution", mod.task.solutionGraph],
      ] as const) {
        assert.ok(
          graph.scenario.arrivalRate <= SD_MAX_ARRIVAL_RATE,
          `${mod.slug} (${name} graph): ${graph.scenario.arrivalRate} r/s exceeds ` +
            `SD_MAX_ARRIVAL_RATE (${SD_MAX_ARRIVAL_RATE}) and would be clamped on save`,
        );
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

/**
 * Modules 2–4, converted in slice B2.
 *
 * The `nav` arrays are the reading order *and* the progress keys. Slugs are
 * listed in the order the rail renders them rather than sorted, so a reordered
 * outline fails here too — prev/next follows this array, and a learner
 * mid-module would otherwise be sent to a lesson they already read.
 */
const B2_MODULES: { slug: string; nav: string[] }[] = [
  {
    slug: "requirements",
    nav: [
      "functional-vs-nonfunctional",
      "eliciting-requirements",
      "turning-fast-into-a-number",
      "what-youre-not-building",
    ],
  },
  {
    slug: "constraints-and-design-process",
    nav: [
      "the-45-min-structure",
      "tradeoffs",
      "anti-patterns",
      "saying-it-out-loud",
    ],
  },
  {
    slug: "back-of-the-envelope",
    nav: [
      "powers-of-two-and-latency-numbers",
      "qps-storage-bandwidth",
      "littles-law",
      "estimation-under-uncertainty",
    ],
  },
];

describe("content model — modules 2–4 (Netflix case study)", () => {
  for (const expected of B2_MODULES) {
    describe(expected.slug, () => {
      // Resolved in a hook, not in the `describe` body — the registry has not
      // loaded yet while the file is being defined.
      let mod: SdModule;
      before(() => {
        mod = bySlug(expected.slug);
      });

      it("is bound, and the rail order is the lesson order", () => {
        assert.equal(inspectChapterBinding(mod).status, "bound");
        assert.deepEqual(
          lessonNav(mod).map((entry) => entry.slug),
          expected.nav,
          `${expected.slug}: outline order and lesson order disagree`,
        );
        assert.deepEqual(
          mod.lessons.map((lesson) => lesson.slug).sort(),
          [...expected.nav].sort(),
          `${expected.slug}: a lesson exists that the outline does not promise`,
        );
      });

      it("runs on Netflix, not on this app or a social feed", () => {
        // The same guard module 1 carries (plan 17 §0, D1). These three
        // modules were written against the old LynxDEV/photo-feed draft, so
        // the failure mode being pinned is a regression to that draft, not a
        // hypothetical.
        const prose = JSON.stringify(mod.lessons);
        assert.ok(
          prose.includes("Netflix"),
          `${expected.slug}: no Netflix references — D1 is the published case study`,
        );
        for (const word of ["LynxDEV", "follower", "photo", "this site"]) {
          assert.ok(
            !prose.includes(word),
            `${expected.slug}: references "${word}" — the case study is Netflix`,
          );
        }
        // Separate pattern: `\bour app\b` rather than a substring, because
        // "Four app replicas" contains "ur app" and a plain `includes` would
        // fail on arithmetic instead of on a pronoun.
        assert.doesNotMatch(prose, /\bour app\b/i);
      });
    });
  }
});

/**
 * Module 5, converted in slice B3 — the first *prose* module.
 *
 * Prose modules carry no build task: `kind` (not task presence) decides that.
 * The guards below pin the discriminator so a future "prose module with a
 * task" or "sim module without one" fails in review instead of silently
 * rendering as the wrong kind of module.
 */
describe("content model — module 5 (prose module)", () => {
  let mod: SdModule;
  before(() => {
    mod = bySlug("api-and-contracts");
  });

  it("is bound, with 6 leaf chapters for 6 lessons", () => {
    assert.equal(inspectChapterBinding(mod).status, "bound");
    assert.equal(collectChapterLeaves(mod.chapters).length, 6);
    assert.equal(mod.lessons.length, 6);
    assert.deepEqual(
      lessonNav(mod).map((entry) => entry.slug),
      [
        "the-contract-before-the-code",
        "pagination-that-doesnt-lie",
        "who-are-you-vs-what-may-you-do",
        "idempotent-writes",
        "errors-and-status-codes",
        "the-gateway-as-one-door",
      ],
      "api-and-contracts: outline order and lesson order disagree",
    );
  });

  it("is a prose module with no build task", () => {
    assert.equal(mod.kind, "prose");
    assert.equal(mod.task, undefined);
  });

  it("runs on Netflix, not on this app or a social feed", () => {
    const prose = JSON.stringify(mod.lessons);
    assert.ok(
      prose.includes("Netflix"),
      "api-and-contracts: no Netflix references — D1 is the published case study",
    );
    for (const word of ["LynxDEV", "follower", "photo", "this site"]) {
      assert.ok(
        !prose.includes(word),
        `api-and-contracts: references "${word}" — the case study is Netflix`,
      );
    }
    assert.doesNotMatch(prose, /\bour app\b/i);
  });

  it("carries 1-3 https sources on every lesson", () => {
    for (const lesson of mod.lessons) {
      const sources = lesson.sources ?? [];
      assert.ok(sources.length >= 1 && sources.length <= 3, lesson.slug);
      for (const source of sources) {
        assert.match(source.url, /^https:\/\/\S+$/);
        assert.ok(source.label.trim().length > 0);
      }
    }
  });
});

/**
 * Module 7, converted in slice B4 — the largest conversion, and the one that
 * exposed two defects outside its own content.
 *
 * The old task ran at 50,000 r/s against a balancer that routes 20,000, so the
 * start graph and the "solution" both shed 96% of traffic while every criterion
 * passed. The guards below pin the two things that let it happen: a task with
 * no error-rate criterion, and a load the balancer cannot carry (the second is
 * asserted for every converted module, above).
 */
describe("content model — module 7 (caching)", () => {
  let mod: SdModule;
  before(() => {
    mod = bySlug("caching");
  });

  it("is bound, with 10 leaf chapters for 10 lessons", () => {
    assert.equal(inspectChapterBinding(mod).status, "bound");
    assert.equal(collectChapterLeaves(mod.chapters).length, 10);
    assert.equal(mod.lessons.length, 10);
    assert.deepEqual(
      lessonNav(mod).map((entry) => entry.slug),
      [
        "why-cache",
        "where-to-cache",
        "cache-aside",
        "write-through-and-behind",
        "refresh-ahead",
        "cache-keys-and-cardinality",
        "ttl-and-eviction",
        "invalidation",
        "cache-stampede",
        "cold-start-and-failure-modes",
      ],
      "caching: outline order and lesson order disagree",
    );
  });

  it("measures shedding, not only latency", () => {
    // The specific regression: `p95 < 150 ms` is computed over completed
    // requests, so a design that drops 96% of traffic can satisfy it easily.
    assert.ok(
      mod.task?.passCriteria.some((c) => c.id === "zero-errors" && c.required),
      "caching: no required error-rate criterion — this task once passed while shedding 96%",
    );
  });

  it("runs on Netflix's EVCache tier, not on a photo feed", () => {
    const prose = JSON.stringify(mod.lessons);
    assert.ok(
      prose.includes("EVCache"),
      "caching: the module must be anchored on Netflix's cache tier",
    );
    for (const word of ["LynxDEV", "follower", "photo", "this site"]) {
      assert.ok(
        !prose.includes(word),
        `caching: references "${word}" — remains from the pre-B4 photo-app draft`,
      );
    }
    assert.doesNotMatch(prose, /\bour app\b/i);
  });
});

/**
 * Module 6, converted in slice B5 — the module whose task was *impossible*, not
 * merely unfair.
 *
 * It offered 20,000 r/s to a load balancer whose capacity in `NODE_TYPES` is
 * exactly 20,000, so every request was shed at the door before reaching the
 * bottleneck the lesson was about; the only criterion was structural validity,
 * so it passed anyway (measured: 90% errors, 2,000 of 20,000 served).
 *
 * The guards below pin the two things that make a task teachable: the *numbers*
 * produce a solvable finish that fails at the start, and each criterion measures
 * a real quantity rather than `r.valid`.
 */
describe("content model — module 6 (load balancers)", () => {
  let mod: SdModule;
  before(() => {
    mod = bySlug("load-balancers-and-stateless-services");
  });

  it("is bound, with 5 leaf chapters for 5 lessons", () => {
    assert.equal(inspectChapterBinding(mod).status, "bound");
    assert.equal(collectChapterLeaves(mod.chapters).length, 5);
    assert.equal(mod.lessons.length, 5);
    assert.deepEqual(
      lessonNav(mod).map((entry) => entry.slug),
      [
        "vertical-vs-horizontal",
        "load-balancing",
        "autoscaling",
        "sessions-without-sticky",
        "stateless-services",
      ],
      "load-balancers: outline order and lesson order disagree",
    );
  });

  it("fails at the start and passes at the finish, on the real engine", () => {
    // The task's whole claim is arithmetic, and arithmetic is the one thing that
    // can be asserted without a browser. If a later edit raises `arrivalRate` or
    // drops `replicas`, the solution stops clearing its own gate here rather
    // than in a learner's canvas.
    const task = mod.task;
    assert.ok(task, "module 6 is a sim module and must carry a task");

    const start = simulate(task.startGraph);
    const solved = simulate(task.solutionGraph);

    const startPassed = task.passCriteria.filter((c) => c.assert(start));
    assert.deepEqual(
      startPassed.map((c) => c.id),
      [],
      `module 6: the start graph already satisfies ${startPassed.map((c) => c.id).join(", ")}`,
    );
    for (const criterion of task.passCriteria) {
      assert.ok(
        criterion.assert(solved),
        `module 6: solution fails "${criterion.id}" — the task has no reachable finish`,
      );
    }
  });

  it("grades shedding and headroom, never structural validity alone", () => {
    // `assert: (r) => r.valid` is how the previous version passed while 90% of
    // requests were refused. A criterion may still require validity, but it has
    // to measure something else as well, and every criterion must be required
    // so the gate cannot be satisfied by the optional ones.
    const criteria = mod.task?.passCriteria ?? [];
    assert.ok(
      criteria.length >= 3,
      "module 6: too few criteria to grade a task",
    );
    for (const criterion of criteria) {
      assert.ok(
        criterion.required,
        `module 6: "${criterion.id}" is not required`,
      );
    }
    assert.ok(
      criteria.some((c) => c.id === "zero-errors"),
      "module 6: no error-rate criterion — this is the exact defect B5 fixed",
    );
    assert.ok(
      criteria.some((c) => c.id === "app-headroom"),
      "module 6: sizing for the average is not graded without a utilisation bound",
    );
  });

  it("runs on Netflix's Zuul and Eureka, not on a photo feed", () => {
    const prose = JSON.stringify(mod.lessons);
    for (const anchor of ["Zuul", "Eureka"]) {
      assert.ok(
        prose.includes(anchor),
        `module 6: no ${anchor} reference — the module's anchor is Netflix's gateway and registry`,
      );
    }
    for (const word of ["LynxDEV", "follower", "photo", "this site"]) {
      assert.ok(
        !prose.includes(word),
        `module 6: references "${word}" — remains from the pre-B5 photo-app draft`,
      );
    }
    assert.doesNotMatch(prose, /\bour app\b/i);
  });
});

/**
 * Module 8, converted in slice B5 part 2 — the module whose task passed while
 * being unpassable.
 *
 * It offered 50,000 r/s to a 20,000 r/s balancer and a single 2,000 r/s app
 * replica: measured, the start graph and the "solution" both shed 96% of
 * traffic, and both graded green because the only criteria were `p95 < 200 ms`
 * and a store bound, and p95 is computed over the requests that completed.
 *
 * The guards below pin the shape that makes the lesson land: the failing tier
 * is the store *without* a cache, the tier with a cache is the control and must
 * stay healthy, and the start graph fails every required criterion.
 */
describe("content model — module 8 (read replicas)", () => {
  let mod: SdModule;
  before(() => {
    mod = bySlug("read-replicas");
  });

  it("is bound, with 6 leaf chapters for 6 lessons", () => {
    assert.equal(inspectChapterBinding(mod).status, "bound");
    assert.equal(collectChapterLeaves(mod.chapters).length, 6);
    assert.equal(mod.lessons.length, 6);
    assert.deepEqual(
      lessonNav(mod).map((entry) => entry.slug),
      [
        "scaling-reads-vs-writes",
        "replication-lag",
        "read-your-own-writes",
        "promoting-a-replica",
        "cqrs-and-read-models",
        "when-replicas-dont-help",
      ],
      "read-replicas: outline order and lesson order disagree",
    );
  });

  it("fails every criterion at the start and passes them all at the finish", () => {
    const task = mod.task;
    assert.ok(task, "module 8 is a sim module and must carry a task");

    const start = simulate(task.startGraph);
    const solved = simulate(task.solutionGraph);

    const startPassed = task.passCriteria.filter((c) => c.assert(start));
    assert.deepEqual(
      startPassed.map((c) => c.id),
      [],
      `module 8: the start graph already satisfies ${startPassed.map((c) => c.id).join(", ")} — ` +
        `the pre-wired design is supposed to be broken`,
    );
    for (const criterion of task.passCriteria) {
      assert.ok(
        criterion.assert(solved),
        `module 8: solution fails "${criterion.id}" — the task has no reachable finish`,
      );
    }
  });

  it("fails the store a cache cannot help, and leaves the control tier alone", () => {
    // The lesson is *which* tier is failing. If a later edit makes the title
    // store the bottleneck, the module starts teaching "add a replica" instead
    // of "find out which traffic the replica cannot serve" — and the graph, not
    // the prose, would be the thing lying.
    const start = simulate(mod.task!.startGraph);
    const member = start.perNode.find((n) => n.id === "db-member");
    const title = start.perNode.find((n) => n.id === "db-title");
    assert.ok(member && title, "module 8: both stores must be in the graph");
    assert.ok(
      member.utilisation > 1,
      `module 8: the member store is at ${(member.utilisation * 100).toFixed(0)}% — it must start over capacity`,
    );
    assert.ok(
      title.utilisation < 0.5,
      `module 8: the title store is at ${(title.utilisation * 100).toFixed(0)}% — the control tier must start healthy`,
    );
  });

  it("grades shedding and headroom, never latency over the survivors", () => {
    const criteria = mod.task?.passCriteria ?? [];
    for (const criterion of criteria) {
      assert.ok(
        criterion.required,
        `module 8: "${criterion.id}" is not required`,
      );
    }
    assert.ok(
      criteria.some((c) => c.id === "zero-errors"),
      "module 8: no error-rate criterion — the exact defect that let 96% of traffic be refused",
    );
    assert.ok(
      criteria.some((c) => c.id === "member-headroom"),
      "module 8: no utilisation bound on the member store — one replica (60%) would satisfy the task without surviving a replica",
    );
  });

  it("is anchored on Netflix's denormalisation, not on a photo feed", () => {
    const prose = JSON.stringify(mod.lessons) + JSON.stringify(mod.story ?? "");
    assert.ok(
      prose.includes("Netflix"),
      "read-replicas: no Netflix reference — D1 is the published case study",
    );
    for (const word of ["LynxDEV", "follower", "photo", "this site"]) {
      assert.ok(
        !prose.includes(word),
        `read-replicas: references "${word}" — remains from the pre-B5 draft`,
      );
    }
    assert.doesNotMatch(prose, /\bour app\b/i);
  });
});

/**
 * Module 9, converted in slice B5 part 2 — the module whose task the model
 * cannot fully grade.
 *
 * The engine multiplies a database node's whole capacity by `1 + readReplicas`
 * and has no dimension for bytes, so ten replicas reach 29% with no partitions
 * at all and satisfy every required criterion. Sharding's actual reason — a
 * table that no longer fits, a write path that must divide — is exactly what a
 * request-rate graph cannot see.
 *
 * Two guards follow from that. The task's *steps* grade the decision
 * (`partitions >= 16`, `hotKeyShare <= 0.2`), and the third criterion is
 * deliberately advisory: it passes on the broken start because the requests it
 * measures are the 93.7% that completed. The suite asserts the limitation
 * rather than describing it, so the disclosure in lesson 7 cannot rot into a
 * claim the code no longer supports.
 */
describe("content model — module 9 (partitioning and sharding)", () => {
  let mod: SdModule;
  before(() => {
    mod = bySlug("partitioning-and-sharding");
  });

  it("is bound, with 7 leaf chapters for 7 lessons", () => {
    assert.equal(inspectChapterBinding(mod).status, "bound");
    assert.equal(collectChapterLeaves(mod.chapters).length, 7);
    assert.equal(mod.lessons.length, 7);
    assert.deepEqual(
      lessonNav(mod).map((entry) => entry.slug),
      [
        "why-partition-data",
        "hash-and-range-sharding",
        "hot-keys-and-skew",
        "rebalancing-shards",
        "consistent-hashing",
        "cross-shard-queries",
        "when-not-to-shard",
      ],
      "partitioning-and-sharding: outline order and lesson order disagree",
    );
  });

  it("fails every required criterion at the start and passes them at the finish", () => {
    const task = mod.task;
    assert.ok(task, "module 9 is a sim module and must carry a task");

    const start = simulate(task.startGraph);
    const solved = simulate(task.solutionGraph);

    const required = task.passCriteria.filter((c) => c.required);
    const startPassed = required.filter((c) => c.assert(start));
    assert.deepEqual(
      startPassed.map((c) => c.id),
      [],
      `module 9: the start graph already satisfies ${startPassed.map((c) => c.id).join(", ")}`,
    );
    for (const criterion of task.passCriteria) {
      assert.ok(
        criterion.assert(solved),
        `module 9: solution fails "${criterion.id}" — the task has no reachable finish`,
      );
    }
  });

  it("makes the hot key, not the partition count, the reason the start fails", () => {
    // Partitioning alone takes the store from 107% to 83%: real capacity, zero
    // shed requests, and still no headroom. If that changed, the second step
    // would be decoration and the module's central number (1.29×) would be a
    // sentence rather than a measurement.
    const task = mod.task!;
    const partitionedOnly = {
      ...task.startGraph,
      nodes: task.startGraph.nodes.map((node) =>
        node.id === "db-member" && node.type === "database"
          ? { ...node, partitions: 16 }
          : node,
      ),
    };
    const result = simulate(partitionedOnly);
    const store = result.perNode.find((n) => n.id === "db-member");
    assert.ok(store, "module 9: the member store must be in the graph");
    assert.equal(
      result.errorRate,
      0,
      "module 9: sixteen partitions should stop the shedding",
    );
    assert.ok(
      store.utilisation > 0.6,
      `module 9: sixteen partitions with the hot key untouched land at ` +
        `${(store.utilisation * 100).toFixed(0)}% — the point is that they are still near the ceiling`,
    );
  });

  it("pins the limitation: replicas pass the gate without partitioning", () => {
    // Deliberate. `assert` receives a `SimulationResult`, never the graph, so no
    // capacity threshold can distinguish a shard from a copy — the engine has no
    // storage dimension to measure. This assertion is the disclosure's
    // tripwire: give the engine bytes and it fails, forcing lesson 7 and this
    // test to be rewritten together.
    const task = mod.task!;
    const replicaOnly = {
      ...task.startGraph,
      nodes: task.startGraph.nodes.map((node) =>
        node.id === "db-member" && node.type === "database"
          ? { ...node, readReplicas: 10 }
          : node,
      ),
    };
    const result = simulate(replicaOnly);
    assert.equal(result.errorRate, 0);
    for (const criterion of task.passCriteria.filter((c) => c.required)) {
      assert.ok(
        criterion.assert(result),
        `module 9: "${criterion.id}" now rejects the replica-only design — the engine ` +
          `gained a dimension the lesson does not describe; update lesson 7 and remove this test`,
      );
    }
    assert.ok(
      JSON.stringify(mod.lessons).includes("ten read replicas"),
      "module 9: the model limitation must be stated in the lesson, not only in this test",
    );
  });

  it("keeps exactly one advisory criterion, and says why", () => {
    const criteria = mod.task?.passCriteria ?? [];
    const advisory = criteria.filter((c) => !c.required);
    assert.deepEqual(
      advisory.map((c) => c.id),
      ["fast-queries"],
      "module 9: the advisory criterion is a deliberate exception — latency over the " +
        "requests that completed cannot fail on a shedding design",
    );
    assert.match(
      advisory[0].explain,
      /advisory/i,
      "module 9: the advisory criterion must explain that it is advisory",
    );
    assert.ok(
      criteria.filter((c) => c.required).length >= 2,
      "module 9: two required criteria are the minimum that can grade a design",
    );
  });

  it("drops the cache node deliberately, and says so", () => {
    // `check:system-design` warns about this by design: the canvas is the member
    // store, the tier no shared cache can help. The warning is answered in the
    // module header; this asserts the drop is intentional rather than an
    // omission, and that the next module does not inherit a diagram of a fix.
    assert.ok(
      !mod.task!.startGraph.nodes.some((node) => node.type === "cache"),
      "module 9: a cache node reappeared — the member store is the tier a cache cannot help",
    );
  });

  it("is anchored on Netflix's vertical ceiling, not on a photo feed", () => {
    const prose = JSON.stringify(mod.lessons) + JSON.stringify(mod.story ?? "");
    assert.ok(
      prose.includes("Netflix"),
      "partitioning-and-sharding: no Netflix reference — D1 is the published case study",
    );
    for (const word of ["LynxDEV", "follower", "photo", "this site"]) {
      assert.ok(
        !prose.includes(word),
        `partitioning-and-sharding: references "${word}" — remains from the pre-B5 draft`,
      );
    }
    assert.doesNotMatch(prose, /\bour app\b/i);
  });
});

/**
 * Module 10, converted in slice B6 — the first module whose task grades a
 * *rejection* rather than a capacity problem.
 *
 * The hazard here is the opposite of modules 6 and 8: a criterion that only
 * asks for errors to fall is satisfied by shedding the abusive client along
 * with everyone else. `real-users-complete` therefore counts every non-rejected
 * failure class, and `app-headroom` makes sure the throughput was *moved*, not
 * merely refused at the door. A limit set above the bot's own rate rejects
 * nothing, and that is pinned too: it is the difference between a rate limit and
 * a configuration field with a number in it.
 */
describe("content model — module 10 (rate limiting)", () => {
  let mod: SdModule;
  before(() => {
    mod = bySlug("rate-limiting");
  });

  it("is bound, with 6 leaf chapters for 6 lessons", () => {
    assert.equal(inspectChapterBinding(mod).status, "bound");
    assert.equal(collectChapterLeaves(mod.chapters).length, 6);
    assert.equal(mod.lessons.length, 6);
    assert.deepEqual(
      lessonNav(mod).map((entry) => entry.slug),
      [
        "the-bot-in-your-traffic",
        "algorithms",
        "distributed-rate-limiting",
        "quotas-and-tiers",
        "load-shedding",
        "429-and-retry-after",
      ],
      "rate-limiting: outline order and lesson order disagree",
    );
  });

  it("fails every required criterion at the start and passes them at the finish", () => {
    const task = mod.task;
    assert.ok(task, "module 10 is a sim module and must carry a task");

    const start = simulate(task.startGraph);
    const solved = simulate(task.solutionGraph);

    const required = task.passCriteria.filter((c) => c.required);
    const startPassed = required.filter((c) => c.assert(start));
    assert.deepEqual(
      startPassed.map((c) => c.id),
      [],
      `module 10: the start graph already satisfies ${startPassed.map((c) => c.id).join(", ")}`,
    );
    for (const criterion of task.passCriteria) {
      assert.ok(
        criterion.assert(solved),
        `module 10: solution fails "${criterion.id}" — the task has no reachable finish`,
      );
    }
  });

  it("makes the app tier, not the balancer, the thing the bot breaks", () => {
    // The lesson is that the limiter sits *in front of* the expensive tier.
    // If a later edit makes the balancer the bottleneck, the module starts
    // teaching "buy a bigger door" instead of "refuse the bot at the door".
    const start = simulate(mod.task!.startGraph);
    const app = start.perNode.find((n) => n.id === "app-1");
    const lb = start.perNode.find((n) => n.id === "lb-1");
    assert.ok(
      app && lb,
      "module 10: the app tier and the balancer must be in the graph",
    );
    assert.ok(
      app.utilisation > 1,
      `module 10: the app tier starts at ${(app.utilisation * 100).toFixed(0)}% — the bot must put it over capacity`,
    );
    assert.ok(
      lb.utilisation < 0.5,
      `module 10: the balancer starts at ${(lb.utilisation * 100).toFixed(0)}% — it is not the tier the bot exhausts`,
    );
    assert.equal(
      start.errorClasses.rejected ?? 0,
      0,
      "module 10: nothing can be rejected before a limit exists",
    );
  });

  it("rejects only the bot, and sheds nothing for anyone else", () => {
    const solved = simulate(mod.task!.solutionGraph);
    assert.ok(
      (solved.errorClasses.rejected ?? 0) > 0,
      "module 10: the bot must receive 429s at the solution",
    );
    assert.equal(
      solved.errorClasses.shed ?? 0,
      0,
      "module 10: real users are shed at the solution — the limit moved load instead of removing it",
    );
  });

  it("has no limit above the bot's rate, because that rejects nothing", () => {
    // `bot-gets-429s` can only pass when the allowance sits below the abusive
    // client's own rate. Pinned because a limit is a number that *looks*
    // configured even when it is too generous to do anything.
    const generous = {
      ...mod.task!.startGraph,
      nodes: mod.task!.startGraph.nodes.map((node) =>
        node.type === "load_balancer"
          ? { ...node, rateLimitPerMin: 200_000 }
          : node,
      ),
    };
    const result = simulate(generous);
    assert.equal(
      result.errorClasses.rejected ?? 0,
      0,
      "module 10: a 200,000 req/min allowance rejected traffic — the engine's comparison changed",
    );
    assert.ok(
      !mod
        .task!.passCriteria.filter((c) => c.required)
        .every((c) => c.assert(result)),
      "module 10: a limit too generous to reject the bot now passes the task",
    );
  });

  it("pins the criteria's blind spot: one request per minute passes all three", () => {
    // This is module 10's version of module 9's advisory-criterion problem, and
    // it is the defect the *previous* task shipped: a limit of 1 req/min rejects
    // the bot — and every real uploader with it — yet `bot-gets-429s`,
    // `real-users-complete` and `app-headroom` all pass, because the engine flags
    // only the *abusive* client as rejected and cannot model a real client's
    // rate. No criterion on `errorClasses` can see the difference.
    //
    // So the decision is graded by a step instead, and this test proves the
    // criteria alone cannot do it: if the engine ever gains per-client
    // modelling, `app-headroom` or a new criterion will start failing here and
    // the step can be relaxed to match.
    const starved = {
      ...mod.task!.startGraph,
      nodes: mod.task!.startGraph.nodes.map((node) =>
        node.type === "load_balancer" ? { ...node, rateLimitPerMin: 1 } : node,
      ),
    };
    const result = simulate(starved);
    for (const criterion of mod.task!.passCriteria) {
      assert.ok(
        criterion.assert(result),
        `module 10: a 1 req/min limit now fails "${criterion.id}" — the engine gained per-client ` +
          `modelling, so the criteria can grade this and \`leave-room-for-real-clients\` should be revisited`,
      );
    }
    const step = mod.task!.steps.find(
      (candidate) => candidate.id === "leave-room-for-real-clients",
    );
    assert.ok(
      step,
      "module 10: the step that rejects a starved allowance is missing",
    );
    assert.equal(
      step.check(starved).passed,
      false,
      "module 10: a 1 req/min allowance passes the step — nothing rejects it",
    );
    assert.equal(
      step.check(mod.task!.solutionGraph).passed,
      true,
      "module 10: the solution's allowance fails the step that defines the band",
    );
  });

  it("does not let lowering the arrival rate pass as a fix", () => {
    // The `keep-the-load` gate. Without it, "fixing" the incident by serving
    // 1,000 r/s passes every criterion — the same defect module 11's old task
    // had, found in module 10 while writing this suite.
    const quieter = {
      ...mod.task!.solutionGraph,
      scenario: { ...mod.task!.solutionGraph.scenario, arrivalRate: 1_000 },
    };
    const result = simulate(quieter);
    assert.ok(
      mod.task!.passCriteria.every((c) => c.assert(result)),
      "module 10: at 1,000 r/s the criteria should still pass — that is the shortcut being pinned",
    );
    const step = mod.task!.steps.find(
      (candidate) => candidate.id === "keep-the-load",
    );
    assert.ok(step, "module 10: the `keep-the-load` step is missing");
    assert.equal(
      step.check(quieter).passed,
      false,
      "module 10: lowering the arrival rate to 1,000 r/s passes the task",
    );
  });

  it("grades the bot's 429s and the app's headroom, not just the error count", () => {
    const criteria = mod.task?.passCriteria ?? [];
    for (const criterion of criteria) {
      assert.ok(
        criterion.required,
        `module 10: "${criterion.id}" is not required`,
      );
    }
    assert.ok(
      criteria.length >= 3,
      "module 10: rejecting the bot and protecting real users are two different claims",
    );
    assert.ok(
      criteria.some((c) => c.id === "bot-gets-429s"),
      "module 10: without a rejection criterion the task passes with no limit at all",
    );
    assert.ok(
      criteria.some((c) => c.id === "app-headroom"),
      "module 10: without a utilisation bound, shedding the bot and everyone else looks like a fix",
    );
  });

  it("is anchored on Netflix's adaptive limit, not on a photo feed", () => {
    const prose = JSON.stringify(mod.lessons) + JSON.stringify(mod.story ?? "");
    assert.ok(
      prose.includes("concurrency-limits"),
      "rate-limiting: no reference to Netflix's adaptive limit — that is the module's anchor",
    );
    for (const word of ["LynxDEV", "follower", "photo", "this site"]) {
      assert.ok(
        !prose.includes(word),
        `rate-limiting: references "${word}" — remains from the pre-B5 photo-app draft`,
      );
    }
    assert.doesNotMatch(prose, /\bour app\b/i);
  });
});

/**
 * Module 11, converted in slice B6 — the module whose interesting claim is an
 * economic one: the origin's *arrival rate* is what a CDN moves, not the bytes a
 * viewer receives.
 *
 * Two guards follow. A second origin store reaches full throughput with zero
 * errors and still fails `origin-headroom`, which is the difference between
 * buying capacity and moving traffic — the criterion's `explain` says so, and
 * this suite proves it. And `bandwidthMbps` is asserted to be identical at a 50%
 * and a 95% hit rate, because the lesson states that limitation out loud; if the
 * engine ever bills bytes per node, the lesson and this test have to change
 * together rather than the disclosure quietly becoming false.
 */
describe("content model — module 11 (CDNs and static content)", () => {
  let mod: SdModule;
  before(() => {
    mod = bySlug("cdns-and-static-content");
  });

  it("is bound, with 6 leaf chapters for 6 lessons", () => {
    assert.equal(inspectChapterBinding(mod).status, "bound");
    assert.equal(collectChapterLeaves(mod.chapters).length, 6);
    assert.equal(mod.lessons.length, 6);
    assert.deepEqual(
      lessonNav(mod).map((entry) => entry.slug),
      [
        "latency-numbers",
        "cache-keys-and-ttl",
        "what-a-cdn-cannot-cache",
        "purging-and-versioning",
        "edge-compute",
        "image-and-video-delivery",
      ],
      "cdns-and-static-content: outline order and lesson order disagree",
    );
  });

  it("fails every required criterion at the start and passes them at the finish", () => {
    const task = mod.task;
    assert.ok(task, "module 11 is a sim module and must carry a task");

    const start = simulate(task.startGraph);
    const solved = simulate(task.solutionGraph);

    const required = task.passCriteria.filter((c) => c.required);
    const startPassed = required.filter((c) => c.assert(start));
    assert.deepEqual(
      startPassed.map((c) => c.id),
      [],
      `module 11: the start graph already satisfies ${startPassed.map((c) => c.id).join(", ")}`,
    );
    for (const criterion of task.passCriteria) {
      assert.ok(
        criterion.assert(solved),
        `module 11: solution fails "${criterion.id}" — the task has no reachable finish`,
      );
    }
  });

  it("makes the origin, not the app tier, the thing that breaks", () => {
    // Which tier is failing is the lesson. If the app tier ever becomes the
    // bottleneck, the task teaches "add replicas" — and the graph, not the
    // prose, would be the thing lying.
    const start = simulate(mod.task!.startGraph);
    const origin = start.perNode.find((n) => n.id === "origin-1");
    const app = start.perNode.find((n) => n.id === "app-1");
    assert.ok(
      origin && app,
      "module 11: origin and app tier must be in the graph",
    );
    assert.ok(
      origin.utilisation > 1,
      `module 11: the origin starts at ${(origin.utilisation * 100).toFixed(0)}% — it must be over capacity`,
    );
    assert.ok(
      app.utilisation < 0.8,
      `module 11: the app tier starts at ${(app.utilisation * 100).toFixed(0)}% — the app is not what is on fire`,
    );
  });

  it("pins the distinction: more origin capacity is not a CDN", () => {
    // The cheap wrong answer. Two origin stores split the misses, serve every
    // request, and never touch the edge — 60% each. It passes the throughput and
    // error criteria because it *is* a working system; it fails the one that
    // names the goal. If this ever passes, `origin-headroom` has stopped grading
    // the decision and the module is teaching "buy a second store".
    const task = mod.task!;
    const secondStore = defaultNode("object_store", "origin-2", 820, 340);
    const twoOrigins: SdGraph = {
      ...task.startGraph,
      nodes: [...task.startGraph.nodes, secondStore],
      edges: [
        ...task.startGraph.edges,
        {
          id: "e5",
          from: "cdn-1",
          to: "origin-2",
          label: "misses",
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
    };
    const result = simulate(twoOrigins);
    assert.ok(
      result.valid,
      "module 11: two origin stores must be a valid topology",
    );
    assert.ok(
      result.errorRate < 0.001,
      "module 11: two stores should absorb the miss rate",
    );
    const criterion = (id: string) =>
      task.passCriteria.find((c) => c.id === id)!;
    assert.ok(
      criterion("zero-errors").assert(result),
      "module 11: two stores should stop the shedding — this is the control",
    );
    assert.ok(
      !criterion("origin-headroom").assert(result),
      "module 11: a second origin store now passes `origin-headroom` — the criterion has " +
        "stopped distinguishing capacity from caching",
    );
  });

  it("pins the limitation: bandwidth does not fall when the hit rate rises", () => {
    // `bandwidthMbps` counts bytes delivered to viewers, per completed request.
    // A CDN changes where the bytes come from, not how many arrive, so the
    // figure is identical at 50% and 95%. Lesson 5 says this out loud; give the
    // engine a per-node byte dimension and this assertion fails, forcing the
    // lesson and the test to be rewritten together.
    const task = mod.task!;
    const halfCache = {
      ...task.startGraph,
      nodes: task.startGraph.nodes.map((node) =>
        node.type === "cdn" ? { ...node, hitRate: 0.5 } : node,
      ),
    };
    const half = simulate(halfCache);
    const solved = simulate(task.solutionGraph);
    assert.ok(
      Math.abs(half.bandwidthMbps - solved.bandwidthMbps) < 1,
      `module 11: bandwidth is now a function of the hit rate ` +
        `(${half.bandwidthMbps.toFixed(0)} vs ${solved.bandwidthMbps.toFixed(0)} Mbit/s) — ` +
        `lesson 5's "what this simulator cannot show" is no longer true`,
    );
    assert.ok(
      JSON.stringify(mod.lessons).includes("bandwidthMbps"),
      "module 11: the limitation must be stated in the lesson, not only in this test",
    );
  });

  it("grades the origin's headroom and the load it kept", () => {
    const criteria = mod.task?.passCriteria ?? [];
    for (const criterion of criteria) {
      assert.ok(
        criterion.required,
        `module 11: "${criterion.id}" is not required`,
      );
    }
    assert.ok(
      criteria.some((c) => c.id === "origin-headroom"),
      "module 11: without a headroom bound the task is satisfied by a second origin store",
    );
    assert.ok(
      criteria.some((c) => c.id === "capacity-served"),
      "module 11: without a throughput floor, deleting the origin would pass",
    );
    assert.ok(
      criteria.some((c) => c.id === "zero-errors"),
      "module 11: the start graph sheds traffic and no criterion counts it",
    );
  });

  it("is anchored on Netflix's Open Connect, not on a photo feed", () => {
    const prose = JSON.stringify(mod.lessons) + JSON.stringify(mod.story ?? "");
    assert.ok(
      prose.includes("Open Connect"),
      "cdns-and-static-content: no Open Connect reference — that is the module's anchor",
    );
    for (const word of ["LynxDEV", "follower", "photo", "this site"]) {
      assert.ok(
        !prose.includes(word),
        `cdns-and-static-content: references "${word}" — remains from the pre-B6 draft`,
      );
    }
    assert.doesNotMatch(prose, /\bour app\b/i);
  });
});

describe("content model — module 12 (how systems fail)", () => {
  let mod: SdModule;
  before(() => {
    mod = bySlug("how-systems-fail");
  });

  const withFailures = (
    graph: SdGraph,
    kind: "degraded" | "node_down",
    ids: string[],
  ) =>
    simulate(
      graph,
      ids.map((nodeId, index) => ({
        id: `f${index}`,
        kind,
        nodeId,
        ...(kind === "degraded" ? { factor: 2 / 3 } : {}),
      })) as Parameters<typeof simulate>[1],
    );

  it("is bound, with 5 leaf chapters for 5 lessons", () => {
    assert.equal(inspectChapterBinding(mod).status, "bound");
    assert.equal(collectChapterLeaves(mod.chapters).length, 5);
    assert.equal(mod.lessons.length, 5);
    assert.deepEqual(
      lessonNav(mod).map((entry) => entry.slug),
      [
        "trace-your-own-design",
        "retry-storms",
        "cascades",
        "blast-radius-and-bulkheads",
        "logging-monitoring-and-traces",
      ],
      "how-systems-fail: outline order and lesson order disagree",
    );
  });

  it("fails every required criterion at the start and passes them at the finish", () => {
    const task = mod.task;
    assert.ok(task, "module 12 is a sim module and must carry a task");

    const start = simulate(task.startGraph);
    const solved = simulate(task.solutionGraph);

    const required = task.passCriteria.filter((c) => c.required);
    const startPassed = required.filter((c) => c.assert(start));
    assert.deepEqual(
      startPassed.map((c) => c.id),
      [],
      `module 12: the start graph already satisfies ${startPassed.map((c) => c.id).join(", ")}`,
    );
    for (const criterion of task.passCriteria) {
      assert.ok(
        criterion.assert(solved),
        `module 12: solution fails "${criterion.id}" — the task has no reachable finish`,
      );
    }
  });

  it("survives a tier degraded to two thirds, which is what the task claims", () => {
    // The acceptance test is capacity after loss, not instance death — see the
    // module header. `degraded` multiplies capacity, so this is the only failure
    // kind in the engine that can express "a third of this tier is gone".
    const task = mod.task!;
    const survived = withFailures(task.solutionGraph, "degraded", [
      "app-1",
      "db-1",
    ]);
    assert.equal(
      survived.errorRate,
      0,
      `module 12: the solution sheds ${(survived.errorRate * 100).toFixed(1)}% when both tiers lose a third`,
    );
    assert.ok(
      survived.throughput >= 11_900,
      `module 12: the degraded solution serves ${survived.throughput.toFixed(0)} r/s, not the offered 12,000`,
    );

    const broken = withFailures(task.startGraph, "degraded", ["app-1", "db-1"]);
    assert.ok(
      broken.errorRate > 0.4,
      `module 12: the start graph only sheds ${(broken.errorRate * 100).toFixed(1)}% when degraded — ` +
        "the criterion would pass on the design the module calls broken",
    );
  });

  it("pins the limitation: replicas are capacity, not redundancy", () => {
    // A `node_down` removes the node and every replica with it, so "one of ten
    // instances died" is not expressible. The module says so in its header; this
    // is the tripwire that fails if the engine ever gains per-replica failure,
    // forcing the lesson and this test to be rewritten together.
    const task = mod.task!;
    const appDown = withFailures(task.solutionGraph, "node_down", ["app-1"]);
    assert.ok(
      appDown.errorRate === 1 && appDown.throughput === 0,
      "module 12: taking the app node down no longer kills every replica — the " +
        "canvas can now express instance loss, and the header's limitation note is stale",
    );

    // And with the store gone there is no terminal at all, so the topology is
    // rejected rather than simulated. Two different kinds of blindness in one
    // failure kind, both worth naming.
    const storeDown = withFailures(task.solutionGraph, "node_down", ["db-1"]);
    assert.equal(storeDown.valid, false);
    assert.match(String(storeDown.invalidReason), /terminal/i);
  });

  it("makes the headroom criterion the arithmetic, not a taste for bigger numbers", () => {
    // 12,000 r/s, 2,000 per instance: nine instances are 66.7% and fail, ten are
    // 60% and pass. If the threshold ever drifts, the module starts teaching
    // "add one more" without a reason.
    const task = mod.task!;
    const criterion = task.passCriteria.find((c) => c.id === "api-headroom")!;
    const at = (replicas: number) => {
      const graph: SdGraph = {
        ...task.solutionGraph,
        nodes: task.solutionGraph.nodes.map((node) =>
          node.type === "app_server" && node.id === "app-1"
            ? { ...node, replicas }
            : node,
        ),
      };
      return simulate(graph);
    };
    assert.ok(
      !criterion.assert(at(9)),
      "module 12: nine instances now pass `api-headroom` — 9 × 2,000 is 18,000 and cannot lose a third",
    );
    assert.ok(
      criterion.assert(at(10)),
      "module 12: ten instances no longer pass `api-headroom` — the criterion is stricter than the module states",
    );
  });

  it("is anchored on Netflix's failure injectors, not a generic outage story", () => {
    const prose = JSON.stringify(mod.lessons) + JSON.stringify(mod.story ?? "");
    assert.ok(
      prose.includes("Simian Army") || prose.includes("Chaos Monkey"),
      "how-systems-fail: no Simian Army or Chaos Monkey reference — that is the module's anchor",
    );
    for (const word of ["LynxDEV", "follower", "photo", "this site"]) {
      assert.ok(
        !prose.includes(word),
        `how-systems-fail: references "${word}" — remains from the pre-B7 draft`,
      );
    }
    assert.doesNotMatch(prose, /\bour app\b/i);
  });
});

describe("content model — module 13 (timeouts, retries, circuit breakers)", () => {
  let mod: SdModule;
  before(() => {
    mod = bySlug("timeouts-retries-circuit-breakers");
  });

  it("is bound, with 5 leaf chapters for 5 lessons", () => {
    assert.equal(inspectChapterBinding(mod).status, "bound");
    assert.equal(collectChapterLeaves(mod.chapters).length, 5);
    assert.equal(mod.lessons.length, 5);
    assert.deepEqual(
      lessonNav(mod).map((entry) => entry.slug),
      [
        "no-timeout-is-worse",
        "retries-and-jitter",
        "breakers-and-bulkheads",
        "timeout-budgets",
        "fallbacks-and-degradation",
      ],
      "timeouts-retries-circuit-breakers: outline order and lesson order disagree",
    );
  });

  it("fails every required criterion at the start and passes them at the finish", () => {
    const task = mod.task;
    assert.ok(task, "module 13 is a sim module and must carry a task");

    const start = simulate(task.startGraph);
    const solved = simulate(task.solutionGraph);

    const required = task.passCriteria.filter((c) => c.required);
    const startPassed = required.filter((c) => c.assert(start));
    assert.deepEqual(
      startPassed.map((c) => c.id),
      [],
      `module 13: the start graph already satisfies ${startPassed.map((c) => c.id).join(", ")}`,
    );
    for (const criterion of task.passCriteria) {
      assert.ok(
        criterion.assert(solved),
        `module 13: solution fails "${criterion.id}" — the task has no reachable finish`,
      );
    }
  });

  it("makes the fallback's capacity the second half of the task", () => {
    // Deleting the resize edge and leaving the store at one node stops the
    // resize tier from shedding — and moves 100% of the traffic onto a store
    // that cannot carry it (measured 120%, 16.7% shed). If this ever passes, the
    // step that asks for a replica has become ceremony.
    const task = mod.task!;
    const fallbackOnly: SdGraph = {
      ...task.solutionGraph,
      nodes: task.solutionGraph.nodes.map((node) =>
        node.type === "database" && node.id === "db-1"
          ? { ...node, readReplicas: 0 }
          : node,
      ),
    };
    const result = simulate(fallbackOnly);
    assert.ok(
      result.errorRate > 0.1,
      `module 13: a fallback with one store node sheds ${(result.errorRate * 100).toFixed(1)}% — ` +
        "the lesson says it sheds 16.7%, so either the graph or the prose is wrong",
    );
    assert.ok(
      !task.passCriteria
        .filter((c) => c.required)
        .every((c) => c.assert(result)),
      "module 13: removing the dependency without sizing the fallback now passes every criterion",
    );
  });

  it("keeps the advisory criterion advisory, and says why", () => {
    // `metadata-headroom` is green at the start, because the resize tier absorbs
    // the damage and only half the traffic reaches the store. A criterion that
    // passes on the broken design can only be advisory; marking it required
    // would make the start graph pass a required criterion and fail the suite's
    // first assertion instead of documenting what the metric cannot see.
    const task = mod.task!;
    const advisory = task.passCriteria.filter((c) => !c.required);
    assert.deepEqual(
      advisory.map((c) => c.id),
      ["metadata-headroom"],
      "module 13: exactly one criterion may be advisory — it is the one that is green on the broken start",
    );
    const start = simulate(task.startGraph);
    assert.ok(
      advisory[0].assert(start),
      "module 13: the advisory criterion now fails at the start — it is no longer documenting a blind spot",
    );
  });

  it("pins the limitation: the breaker and bulkhead fields change no number", () => {
    // `breakerEnabled` and `maxConcurrency` are persisted with the graph and read
    // by nothing in the engine. The task grades the decision (the dependency is
    // out of the path) and lesson 3 says so; this assertion is what makes the
    // disclosure executable.
    const task = mod.task!;
    const toggled: SdGraph = {
      ...task.startGraph,
      nodes: task.startGraph.nodes.map((node) =>
        node.type === "app_server" && node.id === "api-1"
          ? { ...node, breakerEnabled: true, maxConcurrency: 50 }
          : node,
      ),
      edges: task.startGraph.edges.map((edge) => ({
        ...edge,
        retry: { attempts: 3, backoffMs: 100, jitter: true },
      })),
    };
    const plainRun = simulate(task.startGraph);
    const toggledRun = simulate(toggled);
    assert.equal(
      toggledRun.throughput,
      plainRun.throughput,
      "module 13: enabling the breaker now changes throughput — the engine reads it, " +
        "so lesson 3's disclosure is stale",
    );
    assert.equal(toggledRun.errorRate, plainRun.errorRate);
  });

  it("is anchored on Netflix's Hystrix, not a generic slow-service story", () => {
    const prose = JSON.stringify(mod.lessons) + JSON.stringify(mod.story ?? "");
    assert.ok(
      prose.includes("Hystrix"),
      "timeouts-retries-circuit-breakers: no Hystrix reference — that is the module's anchor",
    );
    for (const word of ["LynxDEV", "follower", "photo", "this site"]) {
      assert.ok(
        !prose.includes(word),
        `timeouts-retries-circuit-breakers: references "${word}" — remains from the pre-B7 draft`,
      );
    }
    assert.doesNotMatch(prose, /\bour app\b/i);
  });
});

describe("content model — module 14 (idempotency)", () => {
  let mod: SdModule;
  before(() => {
    mod = bySlug("idempotency");
  });

  const withTier = (
    graph: SdGraph,
    id: string,
    patch: Record<string, unknown>,
  ) =>
    ({
      ...graph,
      nodes: graph.nodes.map((node) =>
        node.id === id ? ({ ...node, ...patch } as typeof node) : node,
      ),
    }) as SdGraph;

  it("is bound, with 4 leaf chapters for 4 lessons", () => {
    assert.equal(inspectChapterBinding(mod).status, "bound");
    assert.equal(collectChapterLeaves(mod.chapters).length, 4);
    assert.equal(mod.lessons.length, 4);
    assert.deepEqual(
      lessonNav(mod).map((entry) => entry.slug),
      [
        "at-least-once-delivery",
        "idempotency-keys",
        "exactly-once-is-a-lie",
        "dead-letter-queues",
      ],
      "idempotency: outline order and lesson order disagree",
    );
  });

  it("fails every required criterion at the start and passes them at the finish", () => {
    const task = mod.task;
    assert.ok(task, "module 14 is a sim module and must carry a task");

    const start = simulate(task.startGraph);
    const solved = simulate(task.solutionGraph);

    const required = task.passCriteria.filter((c) => c.required);
    const startPassed = required.filter((c) => c.assert(start));
    assert.deepEqual(
      startPassed.map((c) => c.id),
      [],
      `module 14: the start graph already satisfies ${startPassed.map((c) => c.id).join(", ")}`,
    );
    for (const criterion of task.passCriteria) {
      assert.ok(
        criterion.assert(solved),
        `module 14: solution fails "${criterion.id}" — the task has no reachable finish`,
      );
    }
  });

  it("pins the cheat: workers scale the duplicates instead of absorbing them", () => {
    // The task's fourth step, in one measurement. Five workers with the
    // idempotency store at zero absorb nothing and still pass every criterion —
    // which is why `absorb-duplicates` is a step and not a pass criterion. The
    // criterion counts what the engine can see (shed requests, throughput,
    // headroom); only the step can see whether the duplicates were removed.
    const task = mod.task!;
    const scaledUp = withTier(task.startGraph, "worker-1", { replicas: 5 });
    const result = simulate(scaledUp);
    assert.equal(
      result.errorRate,
      0,
      "module 14: five workers should clear the shedding",
    );
    for (const criterion of task.passCriteria.filter((c) => c.required)) {
      assert.ok(
        criterion.assert(result),
        `module 14: "${criterion.id}" now rejects five workers — the cheat this test ` +
          "documents has been closed, so the step is no longer load-bearing",
      );
    }
    const absorbStep = task.steps.find(
      (step) => step.id === "absorb-duplicates",
    )!;
    assert.equal(
      absorbStep.check(scaledUp).passed,
      false,
      "module 14: five workers now pass `absorb-duplicates` — nothing grades the duplicate share",
    );

    // And at four workers the headroom criterion does the work on its own:
    // 4 × 1,000 against 4,000 arrivals is exactly 100%.
    const four = simulate(
      withTier(task.startGraph, "worker-1", { replicas: 4 }),
    );
    const headroom = task.passCriteria.find((c) => c.id === "worker-headroom")!;
    assert.ok(
      !headroom.assert(four),
      "module 14: four workers now pass `worker-headroom` at 100% utilisation",
    );
  });

  it("pins the limitation: the queue's retry limit and DLQ change no number", () => {
    // `maxDepth`, `retryLimit` and `dlqEnabled` are stored, rendered in the
    // inspector, and read by nothing in the engine. Lesson 4 says so and the
    // task grades the decision as a step; this assertion is what makes the
    // disclosure executable rather than a paragraph.
    const task = mod.task!;
    const start = simulate(task.startGraph);
    for (const patch of [
      { dlqEnabled: true, retryLimit: 0 },
      { dlqEnabled: true, retryLimit: 3 },
      { dlqEnabled: false, retryLimit: 100, maxDepth: 1 },
    ]) {
      const run = simulate(withTier(task.startGraph, "queue-1", patch));
      assert.equal(
        run.throughput,
        start.throughput,
        `module 14: queue ${JSON.stringify(patch)} changes throughput — the engine reads the ` +
          "queue's retry fields, so lesson 4's disclosure is stale",
      );
      assert.equal(run.errorRate, start.errorRate);
    }
  });

  it("is anchored on Netflix moving billing last, not on a generic upload story", () => {
    const prose = JSON.stringify(mod.lessons) + JSON.stringify(mod.story ?? "");
    assert.ok(
      prose.includes("billing"),
      "idempotency: no billing reference — that is the module's anchor",
    );
    for (const word of ["LynxDEV", "follower", "photo", "this site"]) {
      assert.ok(
        !prose.includes(word),
        `idempotency: references "${word}" — remains from the pre-B7 draft`,
      );
    }
    assert.doesNotMatch(prose, /\bour app\b/i);
  });
});

describe("content model — module 15 (chaos capstone)", () => {
  let mod: SdModule;
  before(() => {
    mod = bySlug("chaos-capstone");
  });

  const withTier = (
    graph: SdGraph,
    id: string,
    patch: Record<string, unknown>,
  ) =>
    ({
      ...graph,
      nodes: graph.nodes.map((node) =>
        node.id === id ? ({ ...node, ...patch } as typeof node) : node,
      ),
    }) as SdGraph;

  const degraded = (graph: SdGraph, ids: string[]) =>
    simulate(
      graph,
      ids.map(
        (nodeId, index) =>
          ({
            id: `f${index}`,
            kind: "degraded",
            nodeId,
            factor: 2 / 3,
          }) as Parameters<typeof simulate>[1] extends (infer T)[] | undefined
            ? T
            : never,
      ),
    );

  it("is bound, with 3 leaf chapters for 3 lessons", () => {
    assert.equal(inspectChapterBinding(mod).status, "bound");
    assert.equal(collectChapterLeaves(mod.chapters).length, 3);
    assert.equal(mod.lessons.length, 3);
    assert.deepEqual(
      lessonNav(mod).map((entry) => entry.slug),
      [
        "chaos-as-practice",
        "surviving-everything",
        "postmortems-without-blame",
      ],
      "chaos-capstone: outline order and lesson order disagree",
    );
  });

  it("fails every required criterion at the start and passes them at the finish", () => {
    const task = mod.task;
    assert.ok(task, "module 15 is a sim module and must carry a task");

    const start = simulate(task.startGraph);
    const solved = simulate(task.solutionGraph);

    const required = task.passCriteria.filter((c) => c.required);
    const startPassed = required.filter((c) => c.assert(start));
    assert.deepEqual(
      startPassed.map((c) => c.id),
      [],
      `module 15: the start graph already satisfies ${startPassed.map((c) => c.id).join(", ")}`,
    );
    for (const criterion of task.passCriteria) {
      assert.ok(
        criterion.assert(solved),
        `module 15: solution fails "${criterion.id}" — the task has no reachable finish`,
      );
    }
  });

  it("survives both compute tiers degraded to two thirds", () => {
    const task = mod.task!;
    const survived = degraded(task.solutionGraph, ["app-1", "db-1"]);
    assert.equal(
      survived.errorRate,
      0,
      `module 15: the degraded capstone sheds ${(survived.errorRate * 100).toFixed(1)}%`,
    );
    assert.ok(
      survived.throughput >= 11_900,
      `module 15: the degraded capstone serves ${survived.throughput.toFixed(0)} r/s, not 12,000`,
    );

    const broken = degraded(task.startGraph, ["app-1", "db-1"]);
    assert.ok(
      broken.errorRate > 0.4,
      `module 15: the start graph only sheds ${(broken.errorRate * 100).toFixed(1)}% when degraded — ` +
        "the capstone would be solvable without sizing anything",
    );
  });

  it("pins the reroute: a second terminal absorbs a node loss instead of failing", () => {
    // Both lesson 2 and the module header claim this, and both would be wrong if
    // the engine ever grew real terminal failure. Three of the five nodes can be
    // taken down without a single error, because their traffic reroutes to the
    // surviving terminal — and the API node, which has no alternative path,
    // takes everything with it. Both halves are asserted so neither the claim nor
    // its exception can rot.
    const task = mod.task!;
    for (const nodeId of ["cdn-1", "origin-1", "db-1"]) {
      const result = simulate(task.solutionGraph, [
        { id: "f", kind: "node_down", nodeId },
      ] as Parameters<typeof simulate>[1]);
      assert.equal(
        result.errorRate,
        0,
        `module 15: taking ${nodeId} down now sheds traffic — the reroute note is stale`,
      );
    }
    const apiDown = simulate(task.solutionGraph, [
      { id: "f", kind: "node_down", nodeId: "app-1" },
    ] as Parameters<typeof simulate>[1]);
    assert.ok(
      apiDown.errorRate === 1,
      "module 15: the API node can now be taken down without losing every request — " +
        "the header's 'no alternative path' claim is stale",
    );
  });

  it("makes each step earn its place: nine instances and one replica both fail", () => {
    // Steps that ask for more than the criteria need are ceremony. These three
    // measurements are why the numbers in the task are the numbers: nine
    // instances are 66.7% (over the 66% line), one read replica is 60% until the
    // cache path is taken away and it inherits everything (120%), and a hit rate
    // of zero leaves the origin at 60%.
    const task = mod.task!;
    const nine = simulate(
      withTier(task.solutionGraph, "app-1", { replicas: 9 }),
    );
    assert.ok(
      task.passCriteria.find((c) => c.id === "api-headroom")!.assert(nine) ===
        false,
      "module 15: nine instances now pass `api-headroom` — the step asks for a number the criteria do not need",
    );

    const oneReplica = withTier(task.solutionGraph, "db-1", {
      readReplicas: 1,
    });
    assert.ok(
      task.passCriteria.every((c) => c.assert(simulate(oneReplica))),
      "module 15: one read replica no longer passes at base load — the step's justification is stale",
    );
    const rerouted = simulate(oneReplica, [
      { id: "f", kind: "node_down", nodeId: "cdn-1" },
    ] as Parameters<typeof simulate>[1]);
    assert.ok(
      rerouted.errorRate > 0.1,
      `module 15: one replica absorbs the reroute (${(rerouted.errorRate * 100).toFixed(1)}% shed) — ` +
        "the second replica no longer has a measured reason",
    );

    const noCache = simulate(
      withTier(task.solutionGraph, "cdn-1", { hitRate: 0 }),
    );
    assert.ok(
      task.passCriteria
        .find((c) => c.id === "origin-headroom")!
        .assert(noCache) === false,
      "module 15: a 0% edge hit rate now passes `origin-headroom` — the cache is no longer graded",
    );
  });

  it("is anchored on Netflix's deliberate failure injectors, not a generic resilience story", () => {
    const prose = JSON.stringify(mod.lessons) + JSON.stringify(mod.story ?? "");
    assert.ok(
      prose.includes("Chaos Monkey") && prose.includes("Chaos Kong"),
      "chaos-capstone: the blast-radius ladder (instance → zone → region) is the anchor",
    );
    for (const word of ["LynxDEV", "follower", "photo", "this site"]) {
      assert.ok(
        !prose.includes(word),
        `chaos-capstone: references "${word}" — remains from the pre-B7 draft`,
      );
    }
    assert.doesNotMatch(prose, /\bour app\b/i);
  });
});

describe("content model — every task has a reachable finish", () => {
  // `check:system-design`'s orphan check asserts this after the build, and it
  // found the defect this test now prevents: module 14's solution passed every
  // pass criterion while failing its own `park-what-cannot-be-processed` step,
  // because the step graded a queue field the criteria cannot see. The gate
  // reported it as "no learner can ever pass this step" — which is exactly a
  // property, so it belongs here too, where it costs seconds instead of a build.
  //
  // The assertion is one-directional on purpose. A step that passes on the
  // *start* graph is legitimate — several modules open with a guard step
  // ("do not shrink the problem") whose whole job is to be green and stay green.
  // A step that fails on the *solution* is never legitimate: it is a task that
  // cannot be completed.
  it("passes every step on each module's own solution graph", () => {
    const sims = modules.filter((mod) => mod.task);
    assert.ok(
      sims.length >= 14,
      "expected at least 14 modules with a build task",
    );

    for (const mod of sims) {
      const task = mod.task!;
      const failed = task.steps
        .map((step) => ({
          id: step.id,
          result: step.check(task.solutionGraph),
        }))
        .filter((entry) => !entry.result.passed);
      assert.deepEqual(
        failed.map((entry) => `${entry.id}: ${entry.result.progress}`),
        [],
        `${mod.slug}: the solution graph fails its own steps — no learner can finish this task`,
      );
    }
  });
});
