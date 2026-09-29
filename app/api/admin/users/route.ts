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
  MAX_SEARCH_LENGTH,
  ADMIN_USERS_MAX_PAGE,
} from "@/lib/admin-users";
import { isAdmin } from "@/lib/admin-auth";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";

const AdminUsersQuerySchema = z.object({
  q: z.string().max(MAX_SEARCH_LENGTH).optional(),
  sort: z.enum(["newest", "points", "name"]).default("newest"),
  subscription: z.string().max(50).optional(),
  page: z.coerce.number().int().min(1).max(ADMIN_USERS_MAX_PAGE).default(1),
});

function emptyToUndefined(v: string | null): string | undefined {
  if (v === null) return undefined;
  const t = v.trim();
  return t === "" ? undefined : t;
}

export async function GET(req: NextRequest) {
  return withRequestLog("GET /api/admin/users", async () => {
    // Validate first — avoids burning rate-limit quota on 400s
    const params = req.nextUrl.searchParams;
    const parsed = AdminUsersQuerySchema.safeParse({
      q: emptyToUndefined(params.get("q")),
      sort: emptyToUndefined(params.get("sort")),
      subscription: emptyToUndefined(params.get("subscription")),
      page: emptyToUndefined(params.get("page")),
    });

    if (!parsed.success) return validationError(parsed.error);

    const { userId } = await auth();
    if (!userId) return unauthorized();

    const admin = await isAdmin(userId);
    if (!admin) return forbidden();

    try {
      const rateLimitedResponse = await enforceDbRateLimit(
        userId,
        "admin-users",
        "/api/admin/users",
        "GET",
      );
      if (rateLimitedResponse) return rateLimitedResponse;
    } catch {
      return serverError("Failed to check rate limit");
    }

    const { q, sort, subscription, page } = parsed.data;

    try {
      const { data, total, hasMore } = await getUsersPaginated(q, sort, subscription, page);
      return NextResponse.json({ data, total, page, hasMore });
    } catch {
      return serverError("Failed to fetch users");
    }
  });
}
