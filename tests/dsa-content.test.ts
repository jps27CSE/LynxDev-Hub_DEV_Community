import { test } from "node:test";
import assert from "node:assert/strict";

import { loadAllDsaModules } from "../config/dsa/registry";
import {
  DEEPENED_LESSONS,
  inspectDepthLedger,
  inspectModuleContent,
  inspectModuleOrder,
} from "../lib/dsa/content-rules";
import type { DsaLesson, DsaModule } from "../config/dsa/types";

/** Only the fields `inspectModuleOrder` reads; the rest is filler. */
function moduleAt(
  order: number,
  part: 0 | 1 | 2 | 3,
  partTitle: string,
): DsaModule {
  return {
    slug: `m${order}`,
    order,
    part,
    partTitle,
    title: `Module ${order}`,
    description: "",
    kind: "lesson",
    story: "",
    lessons: [],
    recap: [],
    attribution: "",
  };
}

/** A lesson fixture that already satisfies every non-depth rule. */
function lessonWith(
  slug: string,
  overrides: Partial<DsaLesson> = {},
): DsaLesson {
  return {
    slug,
    title: slug,
    sections: [
      { kind: "scenario", title: "Problem", body: "word ".repeat(10) },
      { kind: "concept", title: "How", body: "word ".repeat(10) },
      { kind: "concept", title: "Why", body: "word ".repeat(10) },
      { kind: "recap", points: ["one", "two", "three"] },
    ],
    sources: [
      { label: "A", url: "https://example.com/a" },
      { label: "B", url: "https://example.com/b" },
    ],
    attribution: "",
    ...overrides,
  };
}

test("dsa-content: module order is contiguous 1..N", () => {
  const findings = inspectModuleOrder(loadAllDsaModules());
  const fails = findings.filter((f) => f.level === "fail");
  assert.deepEqual(fails, [], fails.map((f) => f.message).join("\n"));
});

test("dsa-content: a part may not start before the previous part ended", () => {
  const ordered = [
    moduleAt(1, 0, "Foundations"),
    moduleAt(2, 1, "Core data structures"),
    moduleAt(3, 1, "Core data structures"),
  ];
  assert.deepEqual(
    inspectModuleOrder(ordered).filter((f) => f.level === "fail"),
    [],
  );

  // Binary Trees as it shipped: order 5, filed under part 2, between two part-1
  // modules. The index rendered Part 1 as 03, 04, 06 and put 05 at the head of
  // Part 2, which reads as a deleted lesson rather than a mis-filed one.
  const inverted = [
    moduleAt(1, 1, "Core data structures"),
    moduleAt(2, 2, "Patterns"),
    moduleAt(3, 1, "Core data structures"),
  ];
  const codes = inspectModuleOrder(inverted).map((f) => f.code);
  assert.deepEqual(codes, ["part-order-inverted"]);
});

test("dsa-content: one part cannot have two names", () => {
  const drifted = [
    moduleAt(1, 1, "Core data structures"),
    moduleAt(2, 1, "Patterns"),
  ];
  const codes = inspectModuleOrder(drifted).map((f) => f.code);
  assert.deepEqual(codes, ["part-title-drift"]);
});

test("dsa-content: every module passes content rules", () => {
  const findings = loadAllDsaModules().flatMap((mod) =>
    inspectModuleContent(mod),
  );
  const fails = findings.filter((f) => f.level === "fail");
  assert.deepEqual(fails, [], fails.map((f) => f.message).join("\n"));
});

test("dsa-content: a converted lesson below the depth floor fails", () => {
  const mod: DsaModule = {
    ...moduleAt(1, 0, "Foundations"),
    slug: "m1",
    lessons: [lessonWith("short")],
  };
  const codes = inspectModuleContent(mod, new Set(["m1/short"])).map(
    (f) => f.code,
  );
  assert.deepEqual(codes, ["lesson-depth"]);
});

test("dsa-content: a converted lesson with one source fails", () => {
  const mod: DsaModule = {
    ...moduleAt(1, 0, "Foundations"),
    slug: "m1",
    lessons: [
      lessonWith("one-source", {
        sections: [
          {
            kind: "scenario",
            title: "Problem",
            body: "word ".repeat(700),
          },
          { kind: "concept", title: "How", body: "word ".repeat(10) },
          { kind: "concept", title: "Why", body: "word ".repeat(10) },
          { kind: "recap", points: ["one", "two", "three"] },
        ],
        sources: [{ label: "A", url: "https://example.com/a" }],
      }),
    ],
  };
  const codes = inspectModuleContent(mod, new Set(["m1/one-source"])).map(
    (f) => f.code,
  );
  assert.deepEqual(codes, ["lesson-sources-thin"]);
});

test("dsa-content: a converted lesson that meets the floor has no failures", () => {
  const mod: DsaModule = {
    ...moduleAt(1, 0, "Foundations"),
    slug: "m1",
    lessons: [
      lessonWith("deep", {
        sections: [
          {
            kind: "scenario",
            title: "Problem",
            body: "word ".repeat(700),
          },
          { kind: "concept", title: "How", body: "word ".repeat(10) },
          { kind: "concept", title: "Why", body: "word ".repeat(10) },
          { kind: "recap", points: ["one", "two", "three"] },
        ],
      }),
    ],
  };
  const fails = inspectModuleContent(mod, new Set(["m1/deep"])).filter(
    (f) => f.level === "fail",
  );
  assert.deepEqual(fails, []);
});

test("dsa-content: an unconverted lesson warns instead of failing", () => {
  const mod: DsaModule = {
    ...moduleAt(1, 0, "Foundations"),
    slug: "m1",
    lessons: [lessonWith("short")],
  };
  const findings = inspectModuleContent(mod, new Set());
  assert.equal(findings.length, 1);
  assert.equal(findings[0].level, "warn");
  assert.equal(findings[0].code, "module-not-deepened");
  assert.match(findings[0].message, /0 of 1 lessons deepened/);
});

test("dsa-content: the depth ledger cannot name a missing lesson", () => {
  const findings = inspectDepthLedger([], new Set(["gone/lesson"]));
  assert.deepEqual(
    findings.map((f) => f.code),
    ["depth-ledger-stale"],
  );
});

test("dsa-content: every ledger key exists in the real content", () => {
  const findings = inspectDepthLedger(loadAllDsaModules());
  assert.deepEqual(findings, [], findings.map((f) => f.message).join("\n"));
  assert.ok(DEEPENED_LESSONS.size > 0);
});
