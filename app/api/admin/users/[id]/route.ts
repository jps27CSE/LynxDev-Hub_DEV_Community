import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  validationError,
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from "@/lib/api-error";
import { getUserWithStats } from "@/lib/admin-users";
import { isAdmin } from "@/lib/admin-auth";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";

const AdminUserIdParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a positive integer"),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRequestLog("GET /api/admin/users/[id]", async () => {
    const { id: rawId } = await params;
    const idParsed = AdminUserIdParamsSchema.safeParse({ id: rawId });
    if (!idParsed.success) return validationError(idParsed.error);

    const { userId } = await auth();
    if (!userId) return unauthorized();

    const admin = await isAdmin(userId);
    if (!admin) return forbidden();

    try {
      const rateLimitedResponse = await enforceDbRateLimit(
        userId,
        "admin-users-detail",
        "/api/admin/users/[id]",
        "GET",
      );
      if (rateLimitedResponse) return rateLimitedResponse;
    } catch {
      return serverError("Failed to check rate limit");
    }

    const id = Number(idParsed.data.id);

    try {
      const user = await getUserWithStats(id);
      if (!user) return notFound("User");
      return NextResponse.json(user);
    } catch {
      return serverError("Failed to fetch user");
    }
  });
}
