import { NextResponse } from "next/server";
import { db } from "@/config/db";

const TIMEOUT_MS = 5000;

export async function GET() {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      db.execute("SELECT 1"),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("DB health check timed out")), TIMEOUT_MS);
      }),
    ]);
    return NextResponse.json({
      status: "ok",
      db: "ok",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[health] GET:", error);
    return NextResponse.json(
      {
        status: "degraded",
        db: "error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  } finally {
    clearTimeout(timer);
  }
}
