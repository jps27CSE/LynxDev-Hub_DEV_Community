import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { withConnectRetry } from "@/lib/db-retry";
import { createLogger } from "@/lib/logger";

const log = createLogger("admin-auth");

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const adminClerkIds = (process.env.ADMIN_CLERK_IDS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

/**
 * Check if a Clerk userId belongs to an admin.
 * Fail-closed: empty env = no admin, missing user = not admin.
 * Fast-path: direct Clerk ID match avoids DB query.
 * Wrapped in React.cache() to deduplicate within a single request.
 */
export const isAdmin = cache(async (userId: string): Promise<boolean> => {
  if (adminEmails.length === 0 && adminClerkIds.length === 0) return false;

  if (adminClerkIds.includes(userId)) return true;

  try {
    const users = await withConnectRetry(() =>
      db
        .select({ email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.clerk_id, userId))
        .limit(1),
    );

    if (users.length === 0) return false;
    return adminEmails.includes(users[0].email.toLowerCase());
  } catch (error) {
    log.error("isAdmin DB lookup failed", error);
    return false;
  }
});

/**
 * Guard for Server Components and layout guards.
 * Throws Response on unauthenticated or non-admin — do NOT use in API routes.
 */
export async function requireAdmin(): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId)
    throw new Response(null, {
      status: 302,
      headers: { Location: "/sign-in" },
    });
  const admin = await isAdmin(userId);
  if (!admin) throw new Response("Forbidden", { status: 403 });
  return { userId };
}
