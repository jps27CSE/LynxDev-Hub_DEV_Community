import { test } from "node:test";
import assert from "node:assert/strict";

import {
  PROBE_MARKER,
  buildProbeSource,
  extractProbeValue,
  judge,
  normalizeExpected,
} from "../lib/dsa/judge";
import {
  countWords,
  lessonNeighbours,
  lessonOrder,
  lessonWordCount,
  nextIncompleteLesson,
  progressRatio,
  readingMinutes,
  toLessonSummary,
  toModuleOverview,
} from "../lib/dsa/view-model";
import { loadAllDsaModules } from "../config/dsa/registry";

/* -------------------------------------------------------------------------- */
/* Judge: the two defects this module exists to close                         */
/* -------------------------------------------------------------------------- */

test("judge: canonical form of every expected string shipped in content", () => {
  // The exact set authored across `config/dsa/modules/*`. Pinned so a fixture
  // spelling that the normaliser cannot read fails here instead of turning a
  // correct learner answer into a red row at runtime.
  const expecteds = [
    "''",
    "[]",
    "0",
    "[0,3]",
    "-1",
    "[-1]",
    "[1]",
    "1",
    "10",
    "[1,2]",
    "[1,2,3]",
    "15",
    "16",
    "2",
    "3",
    "[3,2,1]",
    "4",
    "5",
    "6",
    "6765",
    "[7]",
    "720",
    "89",
    "'a'",
    "false",
    "null",
    "true",
  ];

  const canonical = Object.fromEntries(
    expecteds.map((value) => [value, normalizeExpected(value)]),
  );

  assert.deepEqual(canonical, {
    "''": '""',
    "[]": "[]",
    "0": "0",
    "[0,3]": "[0,3]",
    "-1": "-1",
    "[-1]": "[-1]",
    "[1]": "[1]",
    "1": "1",
    "10": "10",
    "[1,2]": "[1,2]",
    "[1,2,3]": "[1,2,3]",
    "15": "15",
    "16": "16",
    "2": "2",
    "3": "3",
    "[3,2,1]": "[3,2,1]",
    "4": "4",
    "5": "5",
    "6": "6",
    "6765": "6765",
    "[7]": "[7]",
    "720": "720",
    "89": "89",
    "'a'": '"a"',
    false: "false",
    null: "null",
    true: "true",
  });
});

test("judge: an array answer passes now — it could not before the probe", () => {
  // `String([1,2,3])` is "1,2,3". This is the assertion that would have been
  // red for every array fixture in the module before `normalizeExpected`.
  const output = `${PROBE_MARKER}[1,2,3]`;
  const verdict = judge(output, "[1,2,3]");
  assert.equal(verdict.pass, true);
  assert.equal(verdict.actual, "[1,2,3]");
});

test("judge: demo logs printed before the probe do not poison the comparison", () => {
  // Exactly the shape the old runner compared in full: the starter's own
  // `console.log(insertionSort([5,2,4,6,1,3]))` plus the test line.
  const output = [
    "1,2,3,4,5,6",
    "some other demo output",
    `${PROBE_MARKER}[]`,
  ].join("\n");
  const verdict = judge(output, "[]");
  assert.equal(verdict.actual, "[]");
  assert.equal(verdict.pass, true);
});

test("judge: a string answer keeps its quotes and matches a single-quoted fixture", () => {
  assert.equal(judge(`${PROBE_MARKER}"a"`, "'a'").pass, true);
  assert.equal(judge(`${PROBE_MARKER}""`, "''").pass, true);
  assert.equal(judge(`${PROBE_MARKER}"b"`, "'a'").pass, false);
});

test("judge: null and false are not the same verdict", () => {
  assert.equal(judge(`${PROBE_MARKER}null`, "null").pass, true);
  assert.equal(judge(`${PROBE_MARKER}false`, "false").pass, true);
  assert.equal(judge(`${PROBE_MARKER}null`, "false").pass, false);
  assert.equal(judge(`${PROBE_MARKER}undefined`, "null").pass, false);
});

test("judge: a thrown fixture reports the reason, not a bare false", () => {
  const output = `${PROBE_MARKER}{"__cpThrown":"s is not defined"}`;
  const verdict = judge(output, "5");
  assert.equal(verdict.pass, false);
  assert.equal(verdict.errored, true);
  assert.match(verdict.actual, /s is not defined/);
});

test("judge: a runner error is a failure carrying the runner's message", () => {
  const verdict = judge("", "5", "Execution timed out — infinite loop?");
  assert.equal(verdict.pass, false);
  assert.equal(verdict.errored, true);
  assert.match(verdict.actual, /timed out/);
});

test("judge: no marker at all is a failure, never a silent pass", () => {
  const verdict = judge("hello", "hello");
  assert.equal(verdict.pass, false);
  assert.equal(verdict.actual, "hello");
});

test("judge: a learner printing the marker themselves loses to the probe", () => {
  const output = [`${PROBE_MARKER}999`, `${PROBE_MARKER}5`].join("\n");
  assert.equal(judge(output, "5").pass, true);
  assert.equal(extractProbeValue(output), "5");
});

test("judge: probe evaluates a statement list to its completion value", () => {
  // `const s = new MinStack(); s.push(5); s.getMin()` is a real fixture shape.
  // Only a direct eval yields 5 for it; wrapping it in `console.log(...)` is a
  // syntax error, which is why the probe is not a template literal around input.
  const probe = buildProbeSource("const a = 2; a * 3");
  assert.match(probe, /eval\("const a = 2; a \* 3"\)/);
  assert.match(probe, /__CP_PROBE__/);
  assert.doesNotMatch(probe, /console\.log\(const a/);
});

test("judge: probe source quotes the input so it cannot break out of the string", () => {
  const probe = buildProbeSource('say("hi"); 1');
  assert.match(probe, /eval\("say\(\\"hi\\"\); 1"\)/);
});

test("judge: every shipped test case passes against its own solution", () => {
  // A fixture the reference solution cannot answer is a lesson nobody can
  // finish, and nothing else in the pipeline notices: `tsc` sees two strings,
  // the build renders them, and `check:dsa` only counts routes. `graphs`
  // shipped `dsdu.union(0, 1)` in both the starter and the solution, so the
  // section threw a ReferenceError before the probe ran — "Load solution" made
  // its one test fail faster.
  //
  // `new Function` is the cheapest faithful host: the solution's own bindings
  // must be visible to the probe's direct `eval`, which is exactly what a
  // single function body gives. The console shim mirrors `lib/editor.ts`
  // (`args.map(String)`), so a capture bug there would surface here too.
  const failures: string[] = [];
  let cases = 0;

  for (const module of loadAllDsaModules()) {
    for (const lesson of module.lessons) {
      for (const section of lesson.sections) {
        if (section.kind !== "code") continue;

        for (const testCase of section.tests ?? []) {
          cases += 1;
          const lines: string[] = [];
          const capture = (...args: unknown[]) =>
            lines.push(args.map(String).join(" "));

          let verdict;
          try {
            new Function(
              "console",
              `${section.solution}\n${buildProbeSource(testCase.input)}`,
            )({ log: capture, error: capture, warn: capture });
            verdict = judge(lines.join("\n"), testCase.expected);
          } catch (error) {
            verdict = judge(
              lines.join("\n"),
              testCase.expected,
              String((error as Error)?.message ?? error),
            );
          }

          if (!verdict.pass) {
            failures.push(
              `${module.slug}/${lesson.slug} · ${testCase.input} → expected ${testCase.expected}, got ${verdict.actual}`,
            );
          }
        }
      }
    }
  }

  // Guard the loop itself: a registry that stopped exposing sections would
  // otherwise pass this test by iterating nothing.
  assert.ok(cases > 0, "no code sections with test cases were found");
  assert.deepEqual(failures, [], failures.join("\n"));
});

/* -------------------------------------------------------------------------- */
/* View model                                                                 */
/* -------------------------------------------------------------------------- */

test("view-model: word count ignores markup and entities", () => {
  assert.equal(countWords("<p>one <strong>two</strong> three</p>"), 3);
  // An entity is a character, not a word: `&amp;` must not inflate the count.
  assert.equal(countWords("a &amp; b"), 2);
  assert.equal(countWords("a&nbsp;b"), 2);
  assert.equal(countWords(""), 0);
});

test("view-model: reading time is never zero", () => {
  assert.equal(readingMinutes(0), 1);
  assert.equal(readingMinutes(200), 1);
  assert.equal(readingMinutes(400), 2);
});

test("view-model: every shipped lesson reports a positive reading time", () => {
  for (const module of loadAllDsaModules()) {
    for (const lesson of module.lessons) {
      const summary = toLessonSummary(lesson);
      assert.ok(
        summary.readMinutes >= 1,
        `${module.slug}/${lesson.slug} reports ${summary.readMinutes} minutes`,
      );
      assert.ok(
        lessonWordCount(lesson) > 0,
        `${module.slug}/${lesson.slug} has no prose to read`,
      );
    }
  }
});

test("view-model: overview never carries task functions across the client boundary", () => {
  // The build error this prevents: "Functions cannot be passed directly to
  // Client Components". `toModuleOverview` is the only path a page has to a
  // client component, so it must be JSON-clean.
  for (const module of loadAllDsaModules()) {
    const overview = toModuleOverview(module);
    assert.doesNotThrow(() => JSON.stringify(overview));
    assert.equal(
      typeof overview.taskBrief,
      overview.hasTask ? "string" : "object",
    );
  }
});

test("view-model: lesson order matches the lesson set in both directions", () => {
  for (const module of loadAllDsaModules()) {
    const order = lessonOrder(module)
      .map((entry) => entry.slug)
      .sort();
    const lessons = module.lessons.map((lesson) => lesson.slug).sort();
    assert.deepEqual(
      order,
      lessons,
      `${module.slug}: outline and lessons disagree`,
    );
  }
});

test("view-model: neighbours are empty at the ends and populated in between", () => {
  const module = loadAllDsaModules()[0];
  const order = lessonOrder(module);

  const first = lessonNeighbours(module, order[0].slug);
  assert.equal(first.prev, null);
  assert.equal(first.position, 1);
  assert.equal(first.next?.slug, order[1].slug);

  const last = lessonNeighbours(module, order[order.length - 1].slug);
  assert.equal(last.next, null);
  assert.equal(last.prev?.slug, order[order.length - 2].slug);

  if (order.length > 2) {
    const middle = lessonNeighbours(module, order[1].slug);
    assert.equal(middle.prev?.slug, order[0].slug);
    assert.equal(middle.next?.slug, order[2].slug);
  }
});

test("view-model: next incomplete lesson walks the syllabus and stops at none", () => {
  const modules = loadAllDsaModules().map(toModuleOverview);
  const allKeys = modules.flatMap((module) =>
    module.sequence.map((entry) => `${module.slug}/${entry.slug}`),
  );

  const fresh = nextIncompleteLesson(modules, []);
  assert.equal(fresh?.moduleSlug, modules[0].slug);
  assert.equal(fresh?.lessonSlug, modules[0].sequence[0].slug);

  const finished = nextIncompleteLesson(modules, allKeys);
  assert.equal(finished, null);

  const oneLeft = nextIncompleteLesson(modules, allKeys.slice(1));
  assert.equal(`${oneLeft?.moduleSlug}/${oneLeft?.lessonSlug}`, allKeys[0]);
});

test("view-model: progress ratio is clamped and survives an empty syllabus", () => {
  assert.equal(progressRatio(0, 0), 0);
  assert.equal(progressRatio(5, 0), 0);
  assert.equal(progressRatio(5, 10), 0.5);
  assert.equal(progressRatio(20, 10), 1);
  assert.equal(progressRatio(-1, 10), 0);
});
