/**
 * @file
 *
 * Pins `lib/system-design/criteria.ts` — the decision that keeps the
 * simulation engine off the autosave path.
 *
 * Why this is worth a test of its own: the route calls `simulate()` only when
 * this function returns something. If it ever returns a claimed-but-already-
 * earned id, the ~200–500 ms verification runs on every 2 s autosave, which is
 * the exact cost the production review measured at 0.4–1.7 CPU-hours/month.
 * If it returns `[]` for a genuinely new criterion, a learner can never earn
 * it — the pass silently stops working.
 *
 * It is also the boundary between "client claims" and "server verifies": only
 * ids returned here are merged into `criteriaMet`, and the merge unions the
 * server's own stored set, so a client that lies about what it has earned
 * gains nothing.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { criteriaNeedingVerification } from "../lib/system-design/criteria";

describe("criteriaNeedingVerification", () => {
  it("returns nothing for an autosave that claims no criteria", () => {
    assert.deepEqual(criteriaNeedingVerification([], ["earned"]), []);
  });

  it("returns nothing when every claimed criterion is already earned", () => {
    // The replay case: a re-save, or the duplicate POST that
    // `acceptSimulationResult` produces when it re-arms the debounce effect.
    assert.deepEqual(
      criteriaNeedingVerification(["a", "b"], ["a", "b", "c"]),
      [],
    );
  });

  it("returns only the criteria that are new", () => {
    assert.deepEqual(criteriaNeedingVerification(["a", "b", "c"], ["a"]), [
      "b",
      "c",
    ]);
  });

  it("returns every claimed criterion when nothing is earned yet", () => {
    assert.deepEqual(criteriaNeedingVerification(["a", "b"], []), ["a", "b"]);
  });

  it("does not duplicate an id claimed twice", () => {
    // The client unions run results into `criteriaMet` without a Set in some
    // paths; a duplicate would otherwise verify the same id twice.
    assert.deepEqual(criteriaNeedingVerification(["a", "a"], []), ["a"]);
  });

  it("is order-stable so the verification list is reproducible", () => {
    assert.deepEqual(criteriaNeedingVerification(["c", "a", "b"], []), [
      "c",
      "a",
      "b",
    ]);
  });

  it("does not treat a stored id as earned under a different name", () => {
    // Pins exact matching. A prefix or substring match here would let
    // "zero-errors-v2" inherit "zero-errors".
    assert.deepEqual(
      criteriaNeedingVerification(["zero-errors-v2"], ["zero-errors"]),
      ["zero-errors-v2"],
    );
  });
});
