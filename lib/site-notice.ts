import { cache } from "react";
import { eq, sql } from "drizzle-orm";
import { db } from "@/config/db";
import { siteNotices } from "@/config/schema";
import { createContentCache } from "@/lib/content-cache";
import { withConnectRetry } from "@/lib/db-retry";
import { createLogger } from "@/lib/logger";

const log = createLogger("site-notice");

export const SITE_NOTICE_SINGLETON_ID = 1;
export const SITE_NOTICE_CACHE_TAG = "site-notice";
/**
 * 1 hour, not 60 seconds. This value is not just a cache lifetime — it
 * propagates up to the enclosing route and becomes the page's ISR window.
 * Measured with `npm run build`: at 60s, /problems, /profile, /whats-new,
 * /interview/stack and /_not-found dropped from fully static to 1-minute
 * revalidation, and /interview + /interview/customize went 1h -> 1m. That is
 * ~257k extra page regenerations/month, about 26% of the Vercel Hobby
 * function budget burned on revalidation before any real traffic.
 *
 * 1h keeps those routes at or near their pre-existing cost (~0.4% of the
 * budget) while still bounding staleness if a `revalidateTag` ever fails.
 * Admin saves invalidate immediately via revalidateTag, so this TTL only
 * governs the worst case, not normal operation.
 */
const SITE_NOTICE_CACHE_TTL = 3600;

const withNoticeCache = createContentCache({
  tag: SITE_NOTICE_CACHE_TAG,
  version: 1,
  ttl: SITE_NOTICE_CACHE_TTL,
});

export const SITE_NOTICE_SEVERITIES = ["info", "warning", "critical"] as const;
export const SITE_NOTICE_DISPLAYS = ["banner", "modal"] as const;

export type SiteNoticeSeverity = (typeof SITE_NOTICE_SEVERITIES)[number];
export type SiteNoticeDisplay = (typeof SITE_NOTICE_DISPLAYS)[number];

/**
 * Public projection. Deliberately an allowlist of five primitive fields —
 * the row also carries `updated_by` (a Clerk user ID), which must never
 * reach a client component. Never spread the raw row into props.
 */
export type ActiveSiteNotice = {
  version: string;
  severity: SiteNoticeSeverity;
  display: SiteNoticeDisplay;
  title: string;
  message: string;
};

export type SiteNoticeRecord = {
  isEnabled: boolean;
  severity: SiteNoticeSeverity;
  display: SiteNoticeDisplay;
  title: string;
  message: string;
  expiresAt: Date | null;
  updatedAt: Date;
  updatedBy: string | null;
};

export type UpdateSiteNoticeInput = {
  isEnabled: boolean;
  severity: SiteNoticeSeverity;
  display: SiteNoticeDisplay;
  title: string;
  message: string;
  expiresAt: Date | null;
};

function noticeDisabledByEnv(): boolean {
  return process.env.SITE_NOTICE_DISABLED?.trim().toLowerCase() === "true";
}

function toSeverity(value: string): SiteNoticeSeverity {
  return (SITE_NOTICE_SEVERITIES as readonly string[]).includes(value)
    ? (value as SiteNoticeSeverity)
    : "info";
}

function toDisplay(value: string): SiteNoticeDisplay {
  return (SITE_NOTICE_DISPLAYS as readonly string[]).includes(value)
    ? (value as SiteNoticeDisplay)
    : "banner";
}

function readRow(row: typeof siteNotices.$inferSelect): SiteNoticeRecord {
  return {
    isEnabled: row.is_enabled,
    severity: toSeverity(row.severity),
    display: toDisplay(row.display),
    title: row.title,
    message: row.message,
    expiresAt: row.expires_at,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}

async function fetchRow(): Promise<typeof siteNotices.$inferSelect | null> {
  try {
    return await withConnectRetry(async () => {
      const rows = await db
        .select()
        .from(siteNotices)
        .where(eq(siteNotices.id, SITE_NOTICE_SINGLETON_ID))
        .limit(1);
      return rows[0] ?? null;
    });
  } catch (error) {
    log.error("fetchRow failed", error);
    return null;
  }
}

/**
 * Pure eligibility + projection. Split out from the I/O so the expiry boundary
 * and the disabled/expired cases are testable without a Next request context
 * (`unstable_cache` throws "incrementalCache missing" outside a render).
 */
export function resolveActiveNotice(
  row: typeof siteNotices.$inferSelect | null,
  now: number = Date.now(),
): ActiveSiteNotice | null {
  if (noticeDisabledByEnv()) return null;
  if (!row) return null;
  if (!row.is_enabled) return null;
  if (row.expires_at && row.expires_at.getTime() <= now) return null;

  return {
    version: row.updated_at.toISOString(),
    severity: toSeverity(row.severity),
    display: toDisplay(row.display),
    title: row.title,
    message: row.message,
  };
}

async function readActiveNotice(): Promise<ActiveSiteNotice | null> {
  return resolveActiveNotice(await fetchRow());
}

/**
 * Cached for SITE_NOTICE_CACHE_TTL seconds so this costs one query per
 * region per hour instead of one per page load. Callers must invalidate
 * with `revalidateTag(SITE_NOTICE_CACHE_TAG)` after a write; the TTL is
 * only a backstop for a failed revalidation, and is deliberately long
 * because it also sets the ISR window for every route in the tree.
 *
 * Returns a plain object of primitives — safe to pass to a client component.
 * Returns null when there is nothing to show, so callers can render nothing
 * without branching on the reason.
 */
export const getActiveSiteNotice = cache(
  async (): Promise<ActiveSiteNotice | null> =>
    withNoticeCache("active", readActiveNotice),
);

/**
 * Uncached raw read for the admin form. Deliberately does not apply the
 * is_enabled / expires_at filters, so an admin can see and re-enable a
 * notice that is currently disabled or already expired. Returns null when
 * the table is unseeded (e.g. a database bootstrapped with `drizzle-kit
 * push`, which does not execute migration SQL) — callers must handle it.
 */
export const getSiteNoticeRecord = cache(
  async (): Promise<SiteNoticeRecord | null> => {
    const row = await fetchRow();
    return row ? readRow(row) : null;
  },
);

/**
 * Idempotent upsert on the singleton id. `updated_by` is nullable so a
 * system-originated write (seeding, a script) does not need a fake Clerk ID.
 *
 * `updated_at` is set explicitly rather than relying on the column's ON UPDATE
 * CURRENT_TIMESTAMP default, which MySQL fires only when a value actually
 * changes. Without this, saving an unchanged notice would leave the version key
 * untouched and users who had already dismissed it would never see the
 * re-announcement.
 */
export async function updateSiteNotice(
  input: UpdateSiteNoticeInput,
  updatedBy: string | null,
): Promise<SiteNoticeRecord> {
  const row = await withConnectRetry(() =>
    db
      .insert(siteNotices)
      .values({
        id: SITE_NOTICE_SINGLETON_ID,
        is_enabled: input.isEnabled,
        severity: input.severity,
        display: input.display,
        title: input.title,
        message: input.message,
        expires_at: input.expiresAt,
        updated_at: sql`CURRENT_TIMESTAMP`,
        updated_by: updatedBy,
      })
      .onDuplicateKeyUpdate({
        set: {
          is_enabled: input.isEnabled,
          severity: input.severity,
          display: input.display,
          title: input.title,
          message: input.message,
          expires_at: input.expiresAt,
          updated_at: sql`CURRENT_TIMESTAMP`,
          updated_by: updatedBy,
        },
      }),
  );

  log.info("site notice updated", {
    enabled: input.isEnabled,
    severity: input.severity,
    display: input.display,
    expiresAt: input.expiresAt?.toISOString() ?? null,
  });

  const fresh = await fetchRow();
  if (!fresh) throw new Error("site notice row missing after upsert");
  return readRow(fresh);
}
