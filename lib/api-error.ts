import { NextResponse } from "next/server";
import { type ZodError, flattenError } from "zod";

export function validationError(error: ZodError) {
  return NextResponse.json(
    { error: "Validation failed", details: flattenError(error).fieldErrors },
    { status: 400 },
  );
}

export function badJson() {
  return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function notFound(entity?: string) {
  return NextResponse.json(
    { error: entity ? `${entity} not found` : "Not found" },
    { status: 404 },
  );
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function rateLimited(
  retryAfterSeconds: number,
  limit: number,
  remaining: number,
  resetMs: number,
) {
  return NextResponse.json(
    { error: "Too many requests. Please slow down." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.ceil(retryAfterSeconds))),
        "X-RateLimit-Limit": String(limit),
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(Math.ceil(resetMs / 1000)),
      },
    },
  );
}
