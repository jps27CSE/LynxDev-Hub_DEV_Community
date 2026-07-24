import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { getUserContext, buildSystemPrompt, callMistral } from "@/lib/mentor";

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "No email" }, { status: 400 });
  }

  const ctx = await getUserContext(email);
  if (!ctx) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ context: ctx, history: [] });
}

export async function POST(req: Request) {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const email = clerkUser.primaryEmailAddress?.emailAddress;
  if (!email) {
    return NextResponse.json({ error: "No email" }, { status: 400 });
  }

  const { message } = await req.json();
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!users.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const ctx = await getUserContext(email);
  if (!ctx) {
    return NextResponse.json({ error: "Context not found" }, { status: 404 });
  }

  const systemPrompt = buildSystemPrompt(ctx);

  const apiMessages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: message },
  ] as { role: "user" | "assistant" | "system"; content: string }[];

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
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content;
              if (delta) {
                const token = encoder.encode(JSON.stringify({ token: delta }));
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
}
