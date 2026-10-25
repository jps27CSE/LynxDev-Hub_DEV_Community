/**
 * @file
 *
 * Pins `resolveActiveNotice` (`lib/site-notice.ts:129`).
 *
 * This is the **pure eligibility + projection** logic for the site notice
 * feature, extracted from I/O specifically to be testable without a Next.js
 * request context (`unstable_cache` throws "incrementalCache missing" outside
 * a render).
 *
 * The function takes a raw DB row (or null) and the current time, and returns
 * either an `ActiveSiteNotice` (five primitive fields safe for client
 * components) or `null` (nothing to show).
 *
 * Decision logic (in order):
 *   1. SITE_NOTICE_DISABLED env var = true → null
 *   2. No row in DB → null
 *   3. is_enabled = false → null
 *   4. expires_at in the past → null
 *   5. Otherwise → projected ActiveSiteNotice
 *
 * This is a security boundary in the sense that `updated_by` (a Clerk user ID)
 * must NEVER reach a client component — the projection is an explicit allowlist
 * of five primitive fields.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveActiveNotice } from "../lib/site-notice";
import type {
  SiteNoticeSeverity,
  SiteNoticeDisplay,
} from "../config/site-notice";

type DbRow = {
  id: number;
  is_enabled: boolean;
  severity: string;
  display: string;
  title: string;
  message: string;
  expires_at: Date | null;
  updated_at: Date;
  updated_by: string | null;
};

function makeRow(overrides: Partial<DbRow> = {}): DbRow {
  const now = new Date();
  return {
    id: 1,
    is_enabled: true,
    severity: "info",
    display: "banner",
    title: "Heads up",
    message: "Welcome to LynxDEV",
    expires_at: new Date(now.getTime() + 3600_000), // 1 hour from now
    updated_at: new Date(now.getTime() - 60_000), // 1 min ago
    updated_by: "user_123",
    ...overrides,
  };
}

describe("resolveActiveNotice", () => {
  describe("SITE_NOTICE_DISABLED env var", () => {
    it("returns null when SITE_NOTICE_DISABLED=true", () => {
      process.env.SITE_NOTICE_DISABLED = "true";
      const row = makeRow();
      const result = resolveActiveNotice(row);
      assert.equal(result, null);
      delete process.env.SITE_NOTICE_DISABLED;
    });

    it("returns null when SITE_NOTICE_DISABLED=TRUE (case insensitive)", () => {
      process.env.SITE_NOTICE_DISABLED = "TRUE";
      const row = makeRow();
      const result = resolveActiveNotice(row);
      assert.equal(result, null);
      delete process.env.SITE_NOTICE_DISABLED;
    });

    it("does not disable when SITE_NOTICE_DISABLED=false", () => {
      process.env.SITE_NOTICE_DISABLED = "false";
      const row = makeRow();
      const result = resolveActiveNotice(row);
      assert.notEqual(result, null);
      delete process.env.SITE_NOTICE_DISABLED;
    });

    it("does not disable when SITE_NOTICE_DISABLED is unset", () => {
      delete process.env.SITE_NOTICE_DISABLED;
      const row = makeRow();
      const result = resolveActiveNotice(row);
      assert.notEqual(result, null);
    });

    it("does not disable when SITE_NOTICE_DISABLED=random", () => {
      process.env.SITE_NOTICE_DISABLED = "random";
      const row = makeRow();
      const result = resolveActiveNotice(row);
      assert.notEqual(result, null);
      delete process.env.SITE_NOTICE_DISABLED;
    });
  });

  describe("no row (null input)", () => {
    it("returns null for null row", () => {
      const result = resolveActiveNotice(null);
      assert.equal(result, null);
    });

    it("returns null for undefined row", () => {
      // @ts-expect-error testing null/undefined handling
      const result = resolveActiveNotice(undefined);
      assert.equal(result, null);
    });
  });

  describe("is_enabled flag", () => {
    it("returns null when is_enabled=false", () => {
      const row = makeRow({ is_enabled: false });
      const result = resolveActiveNotice(row);
      assert.equal(result, null);
    });

    it("proceeds when is_enabled=true", () => {
      const row = makeRow({ is_enabled: true });
      const result = resolveActiveNotice(row);
      assert.notEqual(result, null);
    });
  });

  describe("expiry check", () => {
    it("returns null when expires_at is in the past", () => {
      const past = new Date(Date.now() - 1000);
      const row = makeRow({ expires_at: past });
      const result = resolveActiveNotice(row);
      assert.equal(result, null);
    });

    it("returns null when expires_at is exactly now", () => {
      const now = new Date();
      const row = makeRow({ expires_at: now });
      const result = resolveActiveNotice(row, now.getTime());
      assert.equal(result, null);
    });

    it("proceeds when expires_at is in the future", () => {
      const future = new Date(Date.now() + 1000);
      const row = makeRow({ expires_at: future });
      const result = resolveActiveNotice(row);
      assert.notEqual(result, null);
    });

    it("proceeds when expires_at is null (no expiry)", () => {
      const row = makeRow({ expires_at: null });
      const result = resolveActiveNotice(row);
      assert.notEqual(result, null);
    });

    it("uses provided 'now' parameter for expiry check (testability)", () => {
      const future = new Date(Date.now() + 86400_000); // tomorrow
      const row = makeRow({ expires_at: future });
      // Pass a 'now' that is AFTER the expiry
      const result = resolveActiveNotice(row, future.getTime() + 1000);
      assert.equal(result, null);
    });
  });

  describe("successful projection", () => {
    it("returns ActiveSiteNotice with correct fields", () => {
      const row = makeRow({
        severity: "warning",
        display: "modal",
        title: "Maintenance",
        message: "Scheduled downtime tonight",
      });
      const result = resolveActiveNotice(row);

      assert.notEqual(result, null);
      if (result) {
        assert.equal(result.severity, "warning");
        assert.equal(result.display, "modal");
        assert.equal(result.title, "Maintenance");
        assert.equal(result.message, "Scheduled downtime tonight");
        // version is the ISO string of updated_at
        assert.equal(result.version, row.updated_at.toISOString());
      }
    });

    it("returns only the five allowed primitive fields (no updated_by)", () => {
      const row = makeRow({ updated_by: "user_admin_456" });
      const result = resolveActiveNotice(row);

      assert.notEqual(result, null);
      if (result) {
        // These are the ONLY fields in ActiveSiteNotice
        const keys = Object.keys(result).sort();
        assert.deepEqual(keys, [
          "display",
          "message",
          "severity",
          "title",
          "version",
        ]);
        // updated_by must NOT be present
        assert.equal("updated_by" in result, false);
      }
    });

    it("normalizes severity to allowed values", () => {
      const validSeverities: SiteNoticeSeverity[] = [
        "info",
        "warning",
        "critical",
      ];
      for (const sev of validSeverities) {
        const row = makeRow({ severity: sev });
        const result = resolveActiveNotice(row);
        assert.notEqual(result, null);
        if (result) assert.equal(result.severity, sev);
      }
    });

    it("defaults unknown severity to 'info'", () => {
      const row = makeRow({ severity: "unknown_severity" });
      const result = resolveActiveNotice(row);
      assert.notEqual(result, null);
      if (result) assert.equal(result.severity, "info");
    });

    it("normalizes display to allowed values", () => {
      const validDisplays: SiteNoticeDisplay[] = ["banner", "modal"];
      for (const disp of validDisplays) {
        const row = makeRow({ display: disp });
        const result = resolveActiveNotice(row);
        assert.notEqual(result, null);
        if (result) assert.equal(result.display, disp);
      }
    });

    it("defaults unknown display to 'banner'", () => {
      const row = makeRow({ display: "unknown_display" });
      const result = resolveActiveNotice(row);
      assert.notEqual(result, null);
      if (result) assert.equal(result.display, "banner");
    });

    it("preserves title and message exactly", () => {
      const title = "Custom Title";
      const message = 'Custom message with\nnewlines and "quotes"';
      const row = makeRow({ title, message });
      const result = resolveActiveNotice(row);
      assert.notEqual(result, null);
      if (result) {
        assert.equal(result.title, title);
        assert.equal(result.message, message);
      }
    });

    it("version is always a valid ISO string", () => {
      const row = makeRow();
      const result = resolveActiveNotice(row);
      assert.notEqual(result, null);
      if (result) {
        // Should not throw and should parse back to same time
        const parsed = new Date(result.version);
        assert.equal(parsed.toISOString(), result.version);
        assert.equal(parsed.getTime(), row.updated_at.getTime());
      }
    });
  });

  describe("combined conditions (priority order)", () => {
    it("env disable wins over enabled row", () => {
      process.env.SITE_NOTICE_DISABLED = "true";
      const row = makeRow({ is_enabled: true, expires_at: null });
      const result = resolveActiveNotice(row);
      assert.equal(result, null);
      delete process.env.SITE_NOTICE_DISABLED;
    });

    it("is_enabled=false wins over future expiry", () => {
      const row = makeRow({
        is_enabled: false,
        expires_at: new Date(Date.now() + 86400_000),
      });
      const result = resolveActiveNotice(row);
      assert.equal(result, null);
    });

    it("past expiry wins over is_enabled=true", () => {
      const row = makeRow({
        is_enabled: true,
        expires_at: new Date(Date.now() - 1000),
      });
      const result = resolveActiveNotice(row);
      assert.equal(result, null);
    });
  });

  describe("edge cases", () => {
    it("handles row with minimal valid data", () => {
      const row = makeRow({
        severity: "info",
        display: "banner",
        title: "T",
        message: "M",
        expires_at: new Date(Date.now() + 1000),
      });
      const result = resolveActiveNotice(row);
      assert.notEqual(result, null);
    });

    it("handles very long title and message (within DB limits)", () => {
      const row = makeRow({
        title: "x".repeat(120), // SITE_NOTICE_TITLE_MAX
        message: "x".repeat(2000), // SITE_NOTICE_MESSAGE_MAX
      });
      const result = resolveActiveNotice(row);
      assert.notEqual(result, null);
      if (result) {
        assert.equal(result.title.length, 120);
        assert.equal(result.message.length, 2000);
      }
    });

    it("does not mutate input row", () => {
      const row = makeRow();
      const originalUpdatedAt = row.updated_at;
      resolveActiveNotice(row);
      // Row should be unchanged
      assert.equal(row.updated_at, originalUpdatedAt);
    });
  });
});
