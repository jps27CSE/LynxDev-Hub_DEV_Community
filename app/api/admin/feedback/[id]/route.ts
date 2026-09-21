import { z } from "zod";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import {
  validationError,
  badJson,
  unauthorized,
  forbidden,
  notFound,
} from "@/lib/api-error";
import { updateFeedbackStatus, deleteFeedback } from "@/lib/feedback-data";
import { isAdmin } from "@/lib/admin-auth";
import { withRequestLog } from "@/lib/request-log";

const ParamsSchema = z.object({
  id: z.string().regex(/^\d+$/, "ID must be a positive integer"),
});

const UpdateFeedbackSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved", "closed"]),
  adminNotes: z.string().max(2000).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRequestLog("PATCH /api/admin/feedback/[id]", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const admin = await isAdmin(userId);
    if (!admin) return forbidden();

    const { id: rawId } = await params;
    const idParsed = ParamsSchema.safeParse({ id: rawId });
    if (!idParsed.success) return validationError(idParsed.error);
    const id = Number(rawId);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badJson();
    }

    const parsed = UpdateFeedbackSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const updated = await updateFeedbackStatus(
      id,
      parsed.data.status,
      parsed.data.adminNotes,
    );

    if (!updated) return notFound("Feedback ticket");

    return NextResponse.json(updated);
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRequestLog("DELETE /api/admin/feedback/[id]", async () => {
    const { userId } = await auth();
    if (!userId) return unauthorized();

    const admin = await isAdmin(userId);
    if (!admin) return forbidden();

    const { id: rawId } = await params;
    const idParsed = ParamsSchema.safeParse({ id: rawId });
    if (!idParsed.success) return validationError(idParsed.error);
    const id = Number(rawId);

    const success = await deleteFeedback(id);

    if (!success) return forbidden();

    return NextResponse.json({ success });
  });
}
