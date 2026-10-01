import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import {
  validationError,
  badJson,
  unauthorized,
  forbidden,
  serverError,
} from "@/lib/api-error";
import { isAdmin } from "@/lib/admin-auth";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";
import { createLogger } from "@/lib/logger";
import {
  SITE_NOTICE_CACHE_TAG,
  updateSiteNotice,
  type UpdateSiteNoticeInput,
} from "@/lib/site-notice";
import {
  SITE_NOTICE_DISPLAYS,
  SITE_NOTICE_MESSAGE_MAX,
  SITE_NOTICE_SEVERITIES,
  SITE_NOTICE_TITLE_MAX,
} from "@/config/site-notice";

const log = createLogger("admin-site-notice");

/**
 * Every field is required and none are `.optional()`: `updateSiteNotice` passes
 * these straight into a Drizzle upsert, and Drizzle omits `undefined` keys from
 * the SET clause. A partial or renamed field would therefore produce a 200 that
 * reports success while silently persisting the old value. Full-replacement
 * semantics, validated strictly, is the whole defence.
 *
 * `expiresAt` must be a full ISO 8601 datetime with an offset. A
 * `datetime-local` value (`2026-09-30T06:22`) is rejected here, so the client
 * must convert with `new Date(localValue).toISOString()` before sending.
 */
const SiteNoticeSchema = z.object({
  isEnabled: z.boolean(),
  severity: z.enum(SITE_NOTICE_SEVERITIES),
  display: z.enum(SITE_NOTICE_DISPLAYS),
  title: z.string().trim().min(1).max(SITE_NOTICE_TITLE_MAX),
  message: z.string().trim().min(1).max(SITE_NOTICE_MESSAGE_MAX),
  expiresAt: z.iso.datetime({ offset: true }).nullable(),
});

export async function PATCH(req: NextRequest) {
  return withRequestLog("PATCH /api/admin/site-notice", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const admin = await isAdmin(userId);
    if (!admin) return forbidden();

    try {
      const rateLimitedResponse = await enforceDbRateLimit(
        userId,
        "admin-site-notice",
        "/api/admin/site-notice",
        "PATCH",
      );
      if (rateLimitedResponse) return rateLimitedResponse;
    } catch (error) {
      log.error("rate limit check failed", error, { userId });
      return serverError("Failed to check rate limit");
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badJson();
    }

    const parsed = SiteNoticeSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const input: UpdateSiteNoticeInput = {
      isEnabled: parsed.data.isEnabled,
      severity: parsed.data.severity,
      display: parsed.data.display,
      title: parsed.data.title,
      message: parsed.data.message,
      expiresAt:
        parsed.data.expiresAt === null ? null : new Date(parsed.data.expiresAt),
    };

    let record;
    try {
      record = await updateSiteNotice(input, userId);
    } catch (error) {
      log.error("update failed", error, { userId });
      return serverError("Failed to update site notice");
    }

    // Deliberately not in the try above. The row is already committed, so a
    // throw here must not surface as a 500 — the admin would retry, bump
    // updated_at again, and re-announce a notice people had already
    // dismissed. Report the successful write and let the 1h TTL backstop
    // cover a missed invalidation.
    try {
      revalidateTag(SITE_NOTICE_CACHE_TAG, { expire: 0 });
    } catch (error) {
      log.error("cache invalidation failed", error, { userId });
    }

    return NextResponse.json(record);
  });
}
