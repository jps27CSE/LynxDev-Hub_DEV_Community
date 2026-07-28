import { NextResponse } from "next/server";
import { type ZodError, flattenError } from "zod";

export function validationError(error: ZodError) {
  return NextResponse.json(
    { error: "Validation failed", details: flattenError(error).fieldErrors },
    { status: 400 }
  );
}

export function badJson() {
  return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function notFound(entity?: string) {
  return NextResponse.json(
    { error: entity ? `${entity} not found` : "Not found" },
    { status: 404 }
  );
}
