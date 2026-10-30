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
import type { SdChapter, SdModule } from "../config/system-design/types";
import { getNodeTypeSpec } from "../lib/system-design/nodes";
import { simulate } from "../lib/system-design/engine";

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
    // `caching` was the fixture until slice B4 converted it, then
    // `read-replicas` until B5 converted it. The assertion has to name a module
    // that is still unconverted, or it starts testing the converted case and
    // quietly stops covering the one it was written for. `rate-limiting` is the
    // next module in line, so it is the last fixture that will survive B6.
    const mod = bySlug("rate-limiting");
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
