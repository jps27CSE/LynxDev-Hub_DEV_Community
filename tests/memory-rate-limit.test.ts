/**
 * @file
 *
 * Pins `lib/memory-rate-limit.ts` — the counter that replaced the shared TiDB
 * one on `app/api/system-design/state`.
 *
 * Why it needs its own test: the swap traded a global, cold-start-surviving
 * counter for a per-instance one, and the *only* thing that makes that
 * acceptable is that the per-instance counter still counts correctly. If the
 * window maths drifts, the route either lets a burst through (the CPU cost the
 * production review §2.3 measured) or starts rejecting honest autosaves at 429.
 *
 * `now` is injectable precisely so these are deterministic — the alternative is
 * a test that sleeps for a minute to cross a window boundary.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createMemoryRateLimiter } from "../lib/memory-rate-limit";

const WINDOW_MS = 60_000;
const START = 1_700_000_000_000; // deliberately mid-window, not a boundary

describe("createMemoryRateLimiter", () => {
  it("allows exactly `limit` calls in a window", () => {
    const check = createMemoryRateLimiter({ limit: 3, windowMs: WINDOW_MS });

    assert.equal(check("user-a", START).allowed, true);
    assert.equal(check("user-a", START + 1).allowed, true);
    assert.equal(check("user-a", START + 2).allowed, true);
    assert.equal(check("user-a", START + 3).allowed, false);
  });

  it("reports the remaining budget counting down to zero, never below", () => {
    const check = createMemoryRateLimiter({ limit: 2, windowMs: WINDOW_MS });

    assert.equal(check("user-a", START).remaining, 1);
    assert.equal(check("user-a", START).remaining, 0);
    // A fourth call in the same window must not report -2.
    assert.equal(check("user-a", START).remaining, 0);
  });

  it("resets when the window rolls over", () => {
    const check = createMemoryRateLimiter({ limit: 1, windowMs: WINDOW_MS });

    assert.equal(check("user-a", START).allowed, true);
    assert.equal(check("user-a", START + 1).allowed, false);
    assert.equal(check("user-a", START + WINDOW_MS).allowed, true);
  });

  it("counts windows from the epoch, not from the first call", () => {
    // A limiter that started its window at the first request would let a
    // caller who arrives just before a boundary spend a full limit, then
    // another full limit a millisecond later.
    const check = createMemoryRateLimiter({ limit: 1, windowMs: WINDOW_MS });
    const boundary = Math.ceil(START / WINDOW_MS) * WINDOW_MS;

    assert.equal(check("user-a", boundary - 1).allowed, true);
    assert.equal(check("user-a", boundary - 1).allowed, false);
    assert.equal(check("user-a", boundary).allowed, true);
  });

  it("reports the reset instant as the end of the current window", () => {
    const check = createMemoryRateLimiter({ limit: 1, windowMs: WINDOW_MS });
    const decision = check("user-a", START);
    const boundary = Math.ceil(START / WINDOW_MS) * WINDOW_MS;

    assert.equal(decision.resetMs, boundary);
    assert.ok(decision.resetMs > START);
  });

  it("keeps users independent", () => {
    const check = createMemoryRateLimiter({ limit: 1, windowMs: WINDOW_MS });

    assert.equal(check("user-a", START).allowed, true);
    assert.equal(check("user-b", START).allowed, true);
    assert.equal(check("user-a", START).allowed, false);
    assert.equal(check("user-b", START).allowed, false);
  });

  it("keeps separate limiter instances independent", () => {
    // The route builds one limiter for GET and one for POST. Sharing a map
    // would make a burst of autosaves exhaust the page-load budget.
    const getLimiter = createMemoryRateLimiter({
      limit: 1,
      windowMs: WINDOW_MS,
    });
    const postLimiter = createMemoryRateLimiter({
      limit: 1,
      windowMs: WINDOW_MS,
    });

    assert.equal(postLimiter("user-a", START).allowed, true);
    assert.equal(postLimiter("user-a", START).allowed, false);
    assert.equal(getLimiter("user-a", START).allowed, true);
  });

  it("evicts the coldest key instead of growing without bound", () => {
    // A limiter keyed by user id is unbounded on a long-lived instance unless
    // something removes entries. Eviction must drop the least recently used
    // key, not the one that happens to be first in insertion order — those
    // differ once a key is used again.
    const check = createMemoryRateLimiter({
      limit: 5,
      windowMs: WINDOW_MS,
      maxKeys: 2,
    });

    check("user-a", START);
    check("user-b", START);
    // Touch `a` so `b` is the coldest, then add a third key to force eviction.
    check("user-a", START);
    check("user-c", START);

    // `a` and `c` survived and are still counting...
    assert.equal(check("user-a", START).remaining, 2);
    assert.equal(check("user-c", START).remaining, 3);
    // ...while `b` was the one evicted, so it starts over at a full budget.
    assert.equal(check("user-b", START).remaining, 4);
  });

  it("stays bounded by distinct keys, not by request volume", () => {
    const check = createMemoryRateLimiter({
      limit: 1_000,
      windowMs: WINDOW_MS,
      maxKeys: 3,
    });

    for (let i = 0; i < 1_000; i += 1) check("user-a", START + i);

    // Hammering one key must not evict the others.
    assert.equal(check("user-b", START).remaining, 999);
  });
});
