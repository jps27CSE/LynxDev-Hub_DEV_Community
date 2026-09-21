import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { unauthorized, forbidden, serverError } from "@/lib/api-error";
import { getAllFeedback, clampPage } from "@/lib/feedback-data";
import { isAdmin } from "@/lib/admin-auth";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";

export async function GET(req: NextRequest) {
  return withRequestLog("GET /api/admin/feedback", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const admin = await isAdmin(userId);
    if (!admin) return forbidden();

    try {
      const limited = await enforceDbRateLimit(
        userId,
        "admin-feedback",
        "/api/admin/feedback",
        "GET",
      );
      if (limited) return limited;
    } catch {
      return serverError("Failed to check rate limit");
    }

    const params = req.nextUrl.searchParams;

    const rawPage = params.get("page");
    const requestedPage =
      rawPage !== null && /^\d+$/.test(rawPage) ? parseInt(rawPage, 10) : 1;
    const page = clampPage(requestedPage);

    const status = params.get("status") ?? undefined;
    const category = params.get("category") ?? undefined;
    const q = params.get("q") ?? undefined;

    const { data, total, hasMore } = await getAllFeedback({
      status,
      category,
      q,
      page,
    });

    return NextResponse.json({ data, total, hasMore });
  });
}
