/**
 * @file
 *
 * Pins the security-critical admin decision logic in `lib/admin-auth.ts`.
 *
 * Policy: AND — a user is admin only if their Clerk id is on ADMIN_CLERK_IDS
 * AND their DB email is on ADMIN_EMAILS. Both allowlists must be configured;
 * an empty list means "no admin" (fail-closed).
 *
 * The async `isAdmin` wrapper and `requireAdmin` are I/O (React `cache`, Clerk
 * `auth()`, Drizzle DB lookup) and are intentionally NOT asserted here.
 *
 * Unasserted boundaries (stated honestly):
 *   - The Drizzle lookup inside `isAdmin` (DB I/O).
 *   - `requireAdmin`'s Clerk `auth()` call and Response throwing.
 *   - The `cache()` deduplication wrapper.
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
    const cfg = parseAdminConfig();
    assert.ok(Array.isArray(cfg.emails));
    assert.ok(Array.isArray(cfg.clerkIds));
  });
});

describe("isAdminDecision — fail-closed", () => {
  it("returns false when both allowlists are empty", () => {
    assert.equal(isAdminDecision("any_user", "any@email.com", EMPTY), false);
    assert.equal(isAdminDecision("", "", EMPTY), false);
  });

  it("returns false when only emails configured (clerk ids empty)", () => {
    const cfg: AdminConfig = { emails: ["admin@x.com"], clerkIds: [] };
    assert.equal(isAdminDecision("user_123", "admin@x.com", cfg), false);
  });

  it("returns false when only clerk ids configured (emails empty)", () => {
    const cfg: AdminConfig = { emails: [], clerkIds: ["user_123"] };
    assert.equal(isAdminDecision("user_123", "admin@x.com", cfg), false);
  });

  it("returns false when email is missing", () => {
    const cfg: AdminConfig = {
      emails: ["admin@x.com"],
      clerkIds: ["user_123"],
    };
    assert.equal(isAdminDecision("user_123", null, cfg), false);
    assert.equal(isAdminDecision("user_123", undefined, cfg), false);
  });
});

describe("isAdminDecision — clerk-id must match", () => {
  it("returns false when clerk id is not on the allowlist, even if email matches", () => {
    const cfg: AdminConfig = {
      emails: ["admin@x.com"],
      clerkIds: ["other_user"],
    };
    assert.equal(isAdminDecision("user_123", "admin@x.com", cfg), false);
  });

  it("clerk ids are case-sensitive", () => {
    const cfg: AdminConfig = {
      emails: ["admin@x.com"],
      clerkIds: ["User_Admin"],
    };
    assert.equal(isAdminDecision("user_admin", "admin@x.com", cfg), false);
    assert.equal(isAdminDecision("User_Admin", "admin@x.com", cfg), true);
  });
});

describe("isAdminDecision — email must match", () => {
  it("returns false when email is not on the allowlist, even if clerk id matches", () => {
    const cfg: AdminConfig = {
      emails: ["admin@x.com"],
      clerkIds: ["user_123"],
    };
    assert.equal(isAdminDecision("user_123", "other@x.com", cfg), false);
  });

  it("returns true only when BOTH clerk id and email match", () => {
    const cfg: AdminConfig = {
      emails: ["admin@x.com"],
      clerkIds: ["user_123"],
    };
    assert.equal(isAdminDecision("user_123", "admin@x.com", cfg), true);
  });

  it("email match is case-insensitive on the user side", () => {
    const cfg: AdminConfig = {
      emails: ["admin@x.com"],
      clerkIds: ["user_123"],
    };
    assert.equal(isAdminDecision("user_123", "AdMiN@X.CoM", cfg), true);
  });
});

describe("isAdminDecision — edge cases", () => {
  it("does not mutate the config", () => {
    const cfg: AdminConfig = { emails: ["admin@x.com"], clerkIds: ["u1"] };
    const snapshot = JSON.stringify(cfg);
    isAdminDecision("u2", "nope@x.com", cfg);
    assert.equal(JSON.stringify(cfg), snapshot);
  });

  it("combined: both must match", () => {
    const cfg: AdminConfig = {
      emails: ["admin@x.com"],
      clerkIds: ["user_admin", "user_123"],
    };
    assert.equal(isAdminDecision("user_admin", "admin@x.com", cfg), true);
    assert.equal(isAdminDecision("user_123", "admin@x.com", cfg), true);
    assert.equal(isAdminDecision("user_admin", "other@x.com", cfg), false);
    assert.equal(isAdminDecision("stranger", "admin@x.com", cfg), false);
  });
});
