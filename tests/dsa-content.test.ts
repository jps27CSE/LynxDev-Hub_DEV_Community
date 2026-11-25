import { test } from "node:test";
import assert from "node:assert/strict";

import { loadAllDsaModules } from "../config/dsa/registry";
import {
  inspectModuleContent,
  inspectModuleOrder,
} from "../lib/dsa/content-rules";
import type { DsaModule } from "../config/dsa/types";

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
  const findings = loadAllDsaModules().flatMap(inspectModuleContent);
  const fails = findings.filter((f) => f.level === "fail");
  assert.deepEqual(fails, [], fails.map((f) => f.message).join("\n"));
});
