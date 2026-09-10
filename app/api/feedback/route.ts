import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  validationError,
  badJson,
  unauthorized,
  notFound,
  serverError,
} from "@/lib/api-error";
import {
  createFeedback,
  getMyFeedback,
  clampPage,
} from "@/lib/feedback-data";
import { getDbUserIdByClerkId } from "@/lib/user-lookup";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";

const FeedbackSchema = z.object({
  category: z.enum(["bug", "feature", "feedback", "other"]).default("other"),
  title: z.string().min(5, "Title must be at least 5 characters").max(120),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(5000),
});

export async function POST(req: NextRequest) {
  return withRequestLog("POST /api/feedback", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    try {
      const limited = await enforceDbRateLimit(
        userId,
        "feedback-create",
        "/api/feedback",
        "POST",
      );
      if (limited) return limited;
    } catch {
      return serverError("Failed to check rate limit");
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badJson();
    }

    const parsed = FeedbackSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    let dbUserId: number | null;
    try {
      dbUserId = await getDbUserIdByClerkId(userId);
    } catch {
      return serverError("Failed to load user");
    }

    if (dbUserId === null) return notFound("User");

    const created = await createFeedback(dbUserId, parsed.data);
    if (!created) return serverError("Failed to create feedback");

    return NextResponse.json(created, { status: 201 });
  });
}

export async function GET(req: NextRequest) {
  return withRequestLog("GET /api/feedback", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    try {
      const limited = await enforceDbRateLimit(
        userId,
        "feedback-list",
        "/api/feedback",
        "GET",
      );
      if (limited) return limited;
    } catch {
      return serverError("Failed to check rate limit");
    }

    // Strict digits-only parse: rejects hex (0x10), scientific (1e3),
    // Infinity, and empty strings that Number() would coerce. Single source
    // of bounds truth is clampPage() in lib/feedback-data.ts.
    const rawPage = req.nextUrl.searchParams.get("page");
    const requestedPage =
      rawPage !== null && /^\d+$/.test(rawPage) ? parseInt(rawPage, 10) : 1;
    const page = clampPage(requestedPage);

    let dbUserId: number | null;
    try {
      dbUserId = await getDbUserIdByClerkId(userId);
    } catch {
      return serverError("Failed to load user");
    }

    if (dbUserId === null) return notFound("User");

    const { data, total, hasMore } = await getMyFeedback(dbUserId, page);

    // admin_notes + metadata are internal: the admin dialog (Task 13) edits
    // notes, the user list (Task 14) shows Title/Category/Status/Created only.
    // Stripping here guarantees the user-facing API never leaks internal notes
    // even though getMyFeedback returns full rows.
    const visible = data.map(
      ({ admin_notes: _adminNotes, metadata: _metadata, ...rest }) => rest,
    );

    return NextResponse.json(
      { data: visible, total, page, hasMore },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  });
}
