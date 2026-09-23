import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  validationError,
  unauthorized,
  forbidden,
  serverError,
} from "@/lib/api-error";
import {
  getUsersPaginated,
  clampAdminUsersPage,
  ADMIN_USERS_MAX_PAGE,
} from "@/lib/admin-users";
import { isAdmin } from "@/lib/admin-auth";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";

const AdminUsersQuerySchema = z.object({
  q: z.string().max(100).optional(),
  sort: z.enum(["newest", "points", "name"]).default("newest"),
  subscription: z.string().max(50).optional(),
  page: z.coerce.number().int().min(1).max(ADMIN_USERS_MAX_PAGE).default(1),
});

export async function GET(req: NextRequest) {
  return withRequestLog("GET /api/admin/users", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const admin = await isAdmin(userId);
    if (!admin) return forbidden();

    try {
      const limited = await enforceDbRateLimit(
        userId,
        "admin-users",
        "/api/admin/users",
        "GET",
      );
      if (limited) return limited;
    } catch {
      return serverError("Failed to check rate limit");
    }

    const params = req.nextUrl.searchParams;
    const parsed = AdminUsersQuerySchema.safeParse({
      q: params.get("q") ?? undefined,
      sort: params.get("sort") ?? undefined,
      subscription: params.get("subscription") ?? undefined,
      page: params.get("page") ?? undefined,
    });

    if (!parsed.success) return validationError(parsed.error);

    const { q, sort, subscription } = parsed.data;
    const page = clampAdminUsersPage(parsed.data.page);

    const { data, total, hasMore } = await getUsersPaginated({
      q,
      sort,
      subscription,
      page,
    });

    return NextResponse.json({
      data,
      total,
      page,
      hasMore,
    });
  });
}
