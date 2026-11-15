/**
 * @file
 *
 * Pins the security-critical admin decision logic in `lib/admin-auth.ts`.
 *
 * This is the **entire auth boundary for `/admin`**. A regression here either
 * locks every admin out or, worse, lets a non-admin in. The async `isAdmin`
 * wrapper and `requireAdmin` are I/O (React `cache`, Clerk `auth()`, Drizzle
 * DB lookup) and are intentionally NOT asserted here — they cannot run in this
 * DB-free harness. What IS asserted is the pure decision core:
 *
 *   - `parseAdminConfig` (env parsing / normalization)
 *   - `isAdminDecision` (fail-closed + fast-path + email match)
 *
 * Unasserted boundaries (stated honestly, per the repo's testing rules):
 *   - The Drizzle lookup inside `isAdmin` (DB I/O) — covered only by the
 *     pure `isAdminDecision` branch it feeds.
 *   - `requireAdmin`'s Clerk `auth()` call and Response throwing — needs a
 *     Clerk session context; not reachable from a unit test.
 *   - The `cache()` deduplication wrapper — React runtime concern.
 *
 * Mutation-tested once: flipping `&&` -> `||` in the fail-closed guard, dropping
 * `.toLowerCase()` on the email, and replacing `includes` with a truthy check
 * all made this suite go red.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseAdminConfig, isAdminDecision } from "../lib/admin-auth";
import type { AdminConfig } from "../lib/admin-auth";

const EMPTY: AdminConfig = { emails: [], clerkIds: [] };

describe("parseAdminConfig", () => {
  it("returns empty lists when env is empty/undefined", () => {
    const cfg = parseAdminConfig({});
    assert.deepEqual(cfg, EMPTY);
  });

  it("returns empty lists for empty strings", () => {
    const cfg = parseAdminConfig({ ADMIN_EMAILS: "", ADMIN_CLERK_IDS: "" });
    assert.deepEqual(cfg, EMPTY);
  });

  it("splits, trims and lowercases emails", () => {
    const cfg = parseAdminConfig({
      ADMIN_EMAILS: "  Admin@Example.com , second@test.io  ",
      ADMIN_CLERK_IDS: "",
    });
    assert.deepEqual(cfg.emails, ["admin@example.com", "second@test.io"]);
    assert.deepEqual(cfg.clerkIds, []);
  });

  it("trims clerk ids but keeps their case", () => {
    const cfg = parseAdminConfig({
      ADMIN_EMAILS: "",
      ADMIN_CLERK_IDS: "  user_abc123 , User_XYZ  ",
    });
    assert.deepEqual(cfg.clerkIds, ["user_abc123", "User_XYZ"]);
    assert.deepEqual(cfg.emails, []);
  });

  it("filters empty entries from trailing/double commas", () => {
    const cfg = parseAdminConfig({
      ADMIN_EMAILS: "a@x.com,,b@x.com,",
      ADMIN_CLERK_IDS: ",,id1,,",
    });
    assert.deepEqual(cfg.emails, ["a@x.com", "b@x.com"]);
    assert.deepEqual(cfg.clerkIds, ["id1"]);
  });

  it("ignores whitespace-only entries", () => {
    const cfg = parseAdminConfig({
      ADMIN_EMAILS: "   ,  , real@x.com",
      ADMIN_CLERK_IDS: "   ",
    });
    assert.deepEqual(cfg.emails, ["real@x.com"]);
    assert.deepEqual(cfg.clerkIds, []);
  });

  it("defaults to process.env when no arg given", () => {
    // Smoke test: calling with no arg must not throw.
    const cfg = parseAdminConfig();
    assert.ok(Array.isArray(cfg.emails));
    assert.ok(Array.isArray(cfg.clerkIds));
  });
});

describe("isAdminDecision — fail-closed", () => {
  it("returns false when both allowlists are empty, regardless of userId/email", () => {
    assert.equal(isAdminDecision("any_user", "any@email.com", EMPTY), false);
    assert.equal(isAdminDecision("", "", EMPTY), false);
    assert.equal(isAdminDecision("user_123", null, EMPTY), false);
    assert.equal(isAdminDecision("user_123", undefined, EMPTY), false);
  });

  it("returns false when only emails configured but email missing", () => {
    const cfg: AdminConfig = { emails: ["admin@x.com"], clerkIds: [] };
    assert.equal(isAdminDecision("user_123", null, cfg), false);
    assert.equal(isAdminDecision("user_123", undefined, cfg), false);
  });

  it("returns false when only emails configured and email not on list", () => {
    const cfg: AdminConfig = { emails: ["admin@x.com"], clerkIds: [] };
    assert.equal(isAdminDecision("user_123", "other@x.com", cfg), false);
  });
});

describe("isAdminDecision — clerk-id fast path", () => {
  it("returns true when userId is on the clerk-id allowlist", () => {
    const cfg: AdminConfig = { emails: [], clerkIds: ["user_admin"] };
    assert.equal(isAdminDecision("user_admin", null, cfg), true);
  });

  it("clerk-id match wins even if email is absent or not on the email list", () => {
    const cfg: AdminConfig = {
      emails: ["other@x.com"],
      clerkIds: ["user_admin"],
    };
    assert.equal(isAdminDecision("user_admin", null, cfg), true);
    assert.equal(isAdminDecision("user_admin", "notlisted@x.com", cfg), true);
  });

  it("clerk ids are case-sensitive (no implicit lowercasing)", () => {
    const cfg: AdminConfig = { emails: [], clerkIds: ["User_Admin"] };
    assert.equal(isAdminDecision("user_admin", null, cfg), false);
    assert.equal(isAdminDecision("User_Admin", null, cfg), true);
  });
});

describe("isAdminDecision — email path", () => {
  it("returns true when userEmail (lowercased) is on the email allowlist", () => {
    const cfg: AdminConfig = { emails: ["admin@x.com"], clerkIds: [] };
    assert.equal(isAdminDecision("user_123", "admin@x.com", cfg), true);
    assert.equal(isAdminDecision("user_123", "ADMIN@X.COM", cfg), true);
    assert.equal(isAdminDecision("user_123", "  Admin@X.com  ", cfg), false);
  });

  it("returns false when userEmail is not on the email allowlist", () => {
    const cfg: AdminConfig = { emails: ["admin@x.com"], clerkIds: [] };
    assert.equal(isAdminDecision("user_123", "other@x.com", cfg), false);
  });

  it("email match is case-insensitive on the user side", () => {
    const cfg: AdminConfig = { emails: ["admin@x.com"], clerkIds: [] };
    assert.equal(isAdminDecision("user_123", "AdMiN@X.CoM", cfg), true);
  });

  it("combined allowlists: either path grants admin", () => {
    const cfg: AdminConfig = {
      emails: ["admin@x.com"],
      clerkIds: ["user_admin"],
    };
    assert.equal(isAdminDecision("user_admin", null, cfg), true);
    assert.equal(isAdminDecision("other_user", "admin@x.com", cfg), true);
    assert.equal(isAdminDecision("other_user", "nope@x.com", cfg), false);
  });
});

describe("isAdminDecision — edge cases", () => {
  it("empty userId with empty allowlists is not admin", () => {
    assert.equal(isAdminDecision("", "", EMPTY), false);
  });

  it("does not mutate the config", () => {
    const cfg: AdminConfig = { emails: ["admin@x.com"], clerkIds: ["u1"] };
    const snapshot = JSON.stringify(cfg);
    isAdminDecision("u2", "nope@x.com", cfg);
    assert.equal(JSON.stringify(cfg), snapshot);
  });
});
