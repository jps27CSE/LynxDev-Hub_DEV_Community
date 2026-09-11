import { db } from "@/config/db";
import { rateLimits } from "@/config/schema";
import { lt } from "drizzle-orm";
import { NextResponse } from "next/server";
import { withRequestLog } from "@/lib/request-log";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  return withRequestLog("GET /api/cron/cleanup", async () => {
    const secret = process.env.CRON_SECRET;
    if (!secret) {
      return NextResponse.json(
        { error: "CRON_SECRET not configured" },
        { status: 500 },
      );
    }

    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoff = Date.now() - SEVEN_DAYS_MS;

    const result = await db
      .delete(rateLimits)
      .where(lt(rateLimits.window_start, cutoff));

    return NextResponse.json({
      deleted: result[0]?.affectedRows ?? 0,
      cutoff: new Date(cutoff).toISOString(),
    });
  });
}
