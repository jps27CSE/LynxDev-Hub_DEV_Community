import { test } from "node:test";
import assert from "node:assert/strict";

import { loadAllDsaModules } from "../config/dsa/registry";
import {
  inspectModuleContent,
  inspectModuleOrder,
} from "../lib/dsa/content-rules";

test("dsa-content: module order is contiguous 1..N", () => {
  const findings = inspectModuleOrder(loadAllDsaModules());
  const fails = findings.filter((f) => f.level === "fail");
  assert.deepEqual(fails, [], fails.map((f) => f.message).join("\n"));
});

test("dsa-content: every module passes content rules", () => {
  const findings = loadAllDsaModules().flatMap(inspectModuleContent);
  const fails = findings.filter((f) => f.level === "fail");
  assert.deepEqual(fails, [], fails.map((f) => f.message).join("\n"));
});
