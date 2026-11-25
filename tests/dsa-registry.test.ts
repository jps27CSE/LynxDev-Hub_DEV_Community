import { test } from "node:test";
import assert from "node:assert/strict";

import {
  loadAllDsaModules,
  getModule,
  getLesson,
  getAllModuleSlugs,
} from "../config/dsa/registry";

test("dsa-registry: prototype-chain keys never resolve", () => {
  for (const key of [
    "__proto__",
    "constructor",
    "toString",
    "hasOwnProperty",
    "",
  ]) {
    assert.equal(
      getModule(key),
      undefined,
      `getModule(${JSON.stringify(key)}) should be undefined`,
    );
  }
});

test("dsa-registry: loadAllDsaModules returns an array", () => {
  const modules = loadAllDsaModules();
  assert.ok(Array.isArray(modules));
});

test("dsa-registry: every module has unique lesson slugs", () => {
  for (const mod of loadAllDsaModules()) {
    const slugs = mod.lessons.map((l) => l.slug);
    assert.equal(
      new Set(slugs).size,
      slugs.length,
      `duplicate lesson slug in ${mod.slug}`,
    );
  }
});

test("dsa-registry: getAllModuleSlugs matches module count and order", () => {
  const modules = loadAllDsaModules();
  const slugs = getAllModuleSlugs();
  assert.equal(slugs.length, modules.length);
  assert.deepEqual(
    slugs,
    modules.map((m) => m.slug),
  );
});

test("dsa-registry: getLesson round-trips for every registered lesson", () => {
  for (const mod of loadAllDsaModules()) {
    for (const lesson of mod.lessons) {
      const found = getLesson(mod.slug, lesson.slug);
      assert.equal(
        found,
        lesson,
        `getLesson(${mod.slug}, ${lesson.slug}) mismatch`,
      );
    }
  }
});

test("dsa-registry: getLesson returns undefined for unknown module or lesson", () => {
  assert.equal(getLesson("does-not-exist", "nope"), undefined);
});
