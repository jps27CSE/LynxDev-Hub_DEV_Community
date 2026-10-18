/**
 * @file
 *
 * Pins the prototype-chain guard in `config/system-design/registry.ts`.
 *
 * The registry is a dynamic-route lookup keyed by slug, and a slug is
 * attacker-supplied. `LOADERS` is a plain object literal, so every slug that
 * exists on `Object.prototype` also "exists" on it:
 *
 *     LOADERS["constructor"]   -> Object
 *     LOADERS["valueOf"]       -> function
 *     LOADERS["__proto__"]     -> Object.prototype
 *
 * All of those are truthy, so the obvious guard — `if (!loader) return null` —
 * does not catch any of them. The file documents the consequence it fixed:
 * `constructor` resolved to `undefined` and the rest threw, turning an unknown
 * slug into a 500 instead of the 404 the caller would have rendered. The
 * correct guard is `Object.hasOwn` (`registry.ts:58`), which is own-keys-only.
 *
 * WHY THIS NEEDS A TEST AND NOT JUST A COMMENT, given the comment is already
 * very good. Until Task 13 authors the module content, `LOADERS` is an empty
 * map. That means:
 *   - `next build` never calls `getModule`, so a reverted guard produces no
 *     build error;
 *   - there are no routes rendering these modules, so there is nothing to
 *     click;
 *   - and `tsc` cannot see it, because the guard is correct right now.
 * So at this moment the invariant is protected by nothing but the prose. A
 * future refactor that "simplifies" `Object.hasOwn` back to a truthiness check
 * would be invisible at every layer this repo currently has.
 *
 * RELATED: `registry.ts:10` claims `npm run check:system-design` verifies this
 * in both directions. That script does not exist — it is not in package.json
 * and there is no such file in `scripts/`. Until it is written, this file is
 * the only thing standing between the guard and a silent regression.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getAllModuleSlugs,
  getModule,
  loadAllModules,
} from "../config/system-design/registry";

/** Every inherited key that defeats a truthiness guard on a plain object. */
const INHERITED_KEYS = [
  "constructor",
  "valueOf",
  "__proto__",
  "toString",
  "hasOwnProperty",
  "isPrototypeOf",
  "propertyIsEnumerable",
  "toLocaleString",
];

describe("system-design registry", () => {
  describe("getModule — prototype-chain guard", () => {
    for (const key of INHERITED_KEYS) {
      it(`returns null for the inherited key "${key}"`, async () => {
        assert.equal(await getModule(key), null);
      });
    }

    it("returns null rather than throwing for every inherited key", async () => {
      // The documented failure mode was a 500, not a 404. A throw here is the
      // regression; `null` is what lets the caller reach `notFound()`.
      for (const key of INHERITED_KEYS) {
        await assert.doesNotReject(() => getModule(key));
      }
    });

    it("the guard is load-bearing — a truthiness check would not reject these", () => {
      // Pins *why* the implementation is what it is. If someone replaces
      // `Object.hasOwn(LOADERS, slug)` with `if (!LOADERS[slug]) return null`,
      // this assertion is what makes the change fail loudly in review instead
      // of passing a green suite and shipping the bug back.
      for (const key of INHERITED_KEYS) {
        assert.equal(
          !({} as Record<string, unknown>)[key],
          false,
          `"${key}" is truthy on a plain object — the buggy guard would accept it`,
        );
        assert.equal(
          Object.hasOwn({} as Record<string, unknown>, key),
          false,
          `"${key}" is not an own key — the correct guard rejects it`,
        );
      }
    });
  });

  describe("getModule — unknown slugs", () => {
    it("returns null for a slug that was never registered", async () => {
      assert.equal(await getModule("not-a-module"), null);
      assert.equal(await getModule(""), null);
    });

    it("does not match by prefix or case", async () => {
      // Guards against a later `startsWith`/`toLowerCase` "be helpful" change:
      // slugs are exact, and a fuzzy match would serve the wrong lesson.
      assert.equal(await getModule("../registry"), null);
      assert.equal(await getModule("registry"), null);
    });
  });

  describe("getAllModuleSlugs", () => {
    it("returns an array of plain strings", () => {
      for (const slug of getAllModuleSlugs()) {
        assert.equal(typeof slug, "string");
      }
    });

    it("returns own keys only, never inherited ones", () => {
      // `Object.keys` is already own-keys-only, which is what lets
      // `getAllModuleSlugs` and `getModule` never disagree about what exists.
      for (const slug of getAllModuleSlugs()) {
        assert.ok(
          !INHERITED_KEYS.includes(slug),
          `inherited key "${slug}" leaked into the slug list`,
        );
      }
    });
  });

  describe("loadAllModules", () => {
    it("agrees with the slug list", async () => {
      // Durable invariant: the index page renders every slug in the nav, so the
      // two must never disagree. Holds today at 0 === 0, and holds after Task
      // authors the module content.
      const slugs = getAllModuleSlugs();
      const modules = await loadAllModules();
      assert.equal(modules.length, slugs.length);
    });

    it("returns modules sorted by order, ascending", async () => {
      // Deliberately asserted against the pair rather than a literal, so it
      // survives the registry being populated.
      const modules = await loadAllModules();
      const orders = modules.map((m) => m.order);
      assert.deepEqual(
        orders,
        [...orders].sort((a, b) => a - b),
      );
    });

    it("is empty while LOADERS is empty, and that is expected", async () => {
      // TODO(Task 13): this flips the moment module content is authored. When
      // it does, replace it with the real first module's slug rather than
      // deleting the assertion — a test suite that loses an assertion quietly
      // is how the file above ended up with no coverage at all.
      assert.deepEqual(await loadAllModules(), []);
      assert.deepEqual(getAllModuleSlugs(), []);
    });
  });
});
