import { NextResponse } from "next/server";
import { z } from "zod";
import {
  validationError,
  badJson,
  unauthorized,
  notFound,
} from "@/lib/api-error";
import { currentUser } from "@clerk/nextjs/server";
import { MENTOR_ENABLED } from "@/config/mentor";
import { enforceDbRateLimit } from "@/lib/db-rate-limit";
import { withRequestLog } from "@/lib/request-log";
import {
  getUserContext,
  buildSystemPrompt,
  callMistral,
  type Message,
} from "@/lib/mentor";

const MessageSchema = z.object({
  message: z.string().min(1).max(10000),
});

export async function GET() {
  return withRequestLog("GET /api/mentor/chat", async () => {
    if (!MENTOR_ENABLED) {
      return NextResponse.json(
        { error: "Mentor is currently unavailable" },
        { status: 503 },
      );
    }

    const clerkUser = await currentUser();
    if (!clerkUser) return unauthorized();

    const email = clerkUser.primaryEmailAddress?.emailAddress;
    if (!email) return notFound("Email");

    const ctx = await getUserContext(email);
    if (!ctx) return notFound("User");

    return NextResponse.json({ context: ctx, history: [] });
  });
}

export async function POST(req: Request) {
  return withRequestLog("POST /api/mentor/chat", async () => {
    if (!MENTOR_ENABLED) {
      return NextResponse.json(
        { error: "Mentor is currently unavailable" },
        { status: 503 },
      );
    }

    const clerkUser = await currentUser();
    if (!clerkUser) return unauthorized();

    const email = clerkUser.primaryEmailAddress?.emailAddress;
    if (!email) return notFound("Email");

    const limited = await enforceDbRateLimit(
      clerkUser.id,
      "mentor-chat",
      "/api/mentor/chat",
      "POST",
    );
    if (limited) return limited;

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badJson();
    }

    const parsed = MessageSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { message } = parsed.data;

    const ctx = await getUserContext(email);
    if (!ctx) return notFound("Context");

    const systemPrompt = buildSystemPrompt(ctx);

    const apiMessages: Message[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message },
    ];

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const mistralStream = await callMistral(apiMessages);
          const reader = mistralStream.getReader();
          const decoder = new TextDecoder();

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk
              .split("\n")
              .filter((l) => l.startsWith("data: "));

            for (const line of lines) {
              const data = line.slice(6).trim();
              if (data === "[DONE]") continue;
              try {
                const parsed = JSON.parse(data);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) {
                  const token = encoder.encode(
                    JSON.stringify({ token: delta }),
                  );
                  controller.enqueue(token);
                }
              } catch {
                // skip malformed JSON
              }
            }
          }

          controller.enqueue(encoder.encode(JSON.stringify({ done: true })));
          controller.close();
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : "Stream failed";
          controller.enqueue(encoder.encode(JSON.stringify({ error: msg })));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  });
}
