import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { unauthorized, forbidden, serverError } from "@/lib/api-error";
import { getAdminOverview } from "@/lib/feedback-data";
import { isAdmin } from "@/lib/admin-auth";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";

export async function GET(req: NextRequest) {
  return withRequestLog("GET /api/admin/overview", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const admin = await isAdmin(userId);
    if (!admin) return forbidden();

    try {
      const limited = await enforceDbRateLimit(
        userId,
        "admin-overview",
        "/api/admin/overview",
        "GET",
      );
      if (limited) return limited;
    } catch {
      return serverError("Failed to check rate limit");
    }

    const overview = await getAdminOverview();

    return NextResponse.json(overview);
  });
}
