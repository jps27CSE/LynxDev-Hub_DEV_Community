import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { withConnectRetry } from "@/lib/db-retry";
import { createLogger } from "@/lib/logger";

const log = createLogger("admin-auth");

export type AdminConfig = {
  emails: string[];
  clerkIds: string[];
};

export function parseAdminConfig(
  env: Record<string, string | undefined> = process.env,
): AdminConfig {
  const adminEmails = (env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const adminClerkIds = (env.ADMIN_CLERK_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  return { emails: adminEmails, clerkIds: adminClerkIds };
}

export function isAdminDecision(
  userId: string,
  userEmail: string | null | undefined,
  config: AdminConfig,
): boolean {
  // AND policy: BOTH allowlists must be configured and BOTH must match the
  // login user. An empty list means "no admin" (fail-closed), and a missing
  // clerk-id or email match denies access.
  if (config.emails.length === 0 || config.clerkIds.length === 0) return false;

  if (!config.clerkIds.includes(userId)) return false;

  if (!userEmail) return false;

  return config.emails.includes(userEmail.toLowerCase());
}

export const isAdmin = cache(async (userId: string): Promise<boolean> => {
  const config = parseAdminConfig();
  // AND policy: both allowlists must be configured.
  if (config.emails.length === 0 || config.clerkIds.length === 0) return false;

  // Clerk id must match; otherwise deny without a DB round-trip.
  if (!config.clerkIds.includes(userId)) return false;

  try {
    const users = await withConnectRetry(() =>
      db
        .select({ email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.clerk_id, userId))
        .limit(1),
    );

    if (users.length === 0) return false;
    return isAdminDecision(userId, users[0].email, config);
  } catch (error) {
    log.error("isAdmin DB lookup failed", error);
    return false;
  }
});

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
