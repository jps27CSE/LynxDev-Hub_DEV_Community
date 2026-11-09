/**
 * @file
 *
 * Pins `parsePositiveInt`, which gates every dynamic route param in the app
 * (`/learn/[courseId]/[chapterId]`, `/courses/[id]`, `/problems/[slug]`, and
 * the admin routes). A route that hands this function junk gets a `null` and
 * renders 404; a route that hands it a *valid* wrong-looking value gets a
 * silently wrong record.
 *
 * Two kinds of test live here, and the distinction matters.
 *
 * 1. REJECTIONS the doc comment promises (`lib/parse-id.ts:3`): `"1.5"`,
 *    `"1abc"` and `""`. These are the contract, and `Number()` rather than
 *    `parseInt()` is what makes them work — `parseInt("1abc")` is `1`, which
 *    would pass a request for chapter 1 instead of 404ing it.
 *
 * 2. ACCEPTANCES nobody chose. `Number()` is a general parser, so it also
 *    accepts hex, scientific notation, signs and surrounding whitespace. This
 *    is harmless today — no row has id `0x10` — but it was undiscovered
 *    behaviour sitting behind a doc comment that implies none of it exists.
 *    These assertions are what turn that accident into a decision: they fail
 *    loudly if someone tightens the parser, so the change gets made on purpose
 *    and reviewed, rather than arriving as a side effect of a refactor.
 *
 * If tightening IS wanted, `/^\d+$/` is the correct rule. That changes
 * behaviour across every route at once and belongs in its own commit — not as
 * a quiet edit to this file, where the diff would read as a test fix.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parsePositiveInt } from "../lib/parse-id";

describe("parsePositiveInt", () => {
  it("accepts a plain positive integer", () => {
    assert.equal(parsePositiveInt("1"), 1);
    assert.equal(parsePositiveInt("42"), 42);
    assert.equal(parsePositiveInt("9007199254740991"), 9007199254740991);
  });

  describe("rejections the doc comment promises", () => {
    it("rejects a decimal, which parseInt would have truncated to 1", () => {
      // parseInt("1.5") === 1. Accepting this would serve chapter 1 for a
      // request that asked for chapter 1.5.
      assert.equal(parsePositiveInt("1.5"), null);
      assert.equal(parsePositiveInt("0.9"), null);
    });

    it("rejects trailing garbage, which parseInt would have stopped at", () => {
      // parseInt("1abc") === 1, so this is the same failure as above wearing
      // a different hat.
      assert.equal(parsePositiveInt("1abc"), null);
      assert.equal(parsePositiveInt("12px"), null);
      assert.equal(parsePositiveInt("1e"), null);
    });

    it("rejects empty and whitespace-only input", () => {
      // Number("") is 0 and Number("  ") is 0, so both are excluded by the
      // `> 0` half of the guard rather than by the integer half.
      assert.equal(parsePositiveInt(""), null);
      assert.equal(parsePositiveInt("   "), null);
    });
  });

  describe("rejections the integer guard handles", () => {
    it("rejects zero and negatives", () => {
      assert.equal(parsePositiveInt("0"), null);
      assert.equal(parsePositiveInt("-1"), null);
      assert.equal(parsePositiveInt("-0"), null);
    });

    it("rejects non-finite and NaN-producing input", () => {
      assert.equal(parsePositiveInt("Infinity"), null);
      assert.equal(parsePositiveInt("NaN"), null);
      assert.equal(parsePositiveInt("undefined"), null);
    });

    it("rejects non-ASCII digits rather than transliterating them", () => {
      // The Arabic-Indic digit three. A normalising parser would turn this
      // into 3; Number() does not, which is the safer failure.
      assert.equal(parsePositiveInt("٣"), null);
      assert.equal(parsePositiveInt("１２"), null);
    });
  });

  describe("accepted by Number(), never chosen — pinned so any change is deliberate", () => {
    it("accepts hexadecimal notation", () => {
      assert.equal(parsePositiveInt("0x10"), 16);
      assert.equal(parsePositiveInt("0X10"), 16);
    });

    it("accepts scientific notation", () => {
      assert.equal(parsePositiveInt("1e3"), 1000);
      assert.equal(parsePositiveInt("1E3"), 1000);
    });

    it("accepts a leading plus sign", () => {
      assert.equal(parsePositiveInt("+12"), 12);
    });

    it("accepts surrounding whitespace", () => {
      assert.equal(parsePositiveInt(" 12 "), 12);
      assert.equal(parsePositiveInt("\t7\n"), 7);
    });

    it("accepts a trailing zero fraction, since it is mathematically an integer", () => {
      assert.equal(parsePositiveInt("12.0"), 12);
      assert.equal(parsePositiveInt("12.00"), 12);
      // ...but a non-zero fraction is still rejected by Number.isInteger.
      assert.equal(parsePositiveInt("12.5"), null);
    });

    it("accepts binary and octal literals", () => {
      assert.equal(parsePositiveInt("0b101"), 5);
      assert.equal(parsePositiveInt("0o17"), 15);
    });
  });

  it("round-trips through String() for every id a real route could hold", () => {
    // The property that actually matters: whatever the DB hands out as a
    // primary key must survive the round trip unchanged.
    for (const id of [1, 7, 99, 1234, 1000000]) {
      assert.equal(parsePositiveInt(String(id)), id);
    }
  });
});
