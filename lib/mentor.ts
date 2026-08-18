import { cache } from "react";
import { db } from "@/config/db";
import {
  usersTable,
  enrollments,
  courses,
  mentorConversations,
} from "@/config/schema";
import { eq, inArray } from "drizzle-orm";

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

export const getUserContext = cache(async (clerkId: string) => {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerk_id, clerkId))
    .limit(1);

  if (!users.length) return null;
  const user = users[0];

  const enrolled = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.user_id, user.id));

  const courseIds = enrolled.map((e) => e.course_id);

  const courseInfoByCourseId = new Map<
    number,
    { title: string; total: number }
  >();
  if (courseIds.length > 0) {
    const courseRows = await db
      .select({
        id: courses.id,
        title: courses.title,
        total: courses.chapter_count,
      })
      .from(courses)
      .where(inArray(courses.id, courseIds));

    for (const c of courseRows) {
      courseInfoByCourseId.set(c.id, {
        title: c.title,
        total: c.total,
      });
    }
  }

  const courseList = enrolled.map((e) => {
    const course = courseInfoByCourseId.get(e.course_id);
    if (!course) return null;
    const prog = (e.progress ?? {}) as { completedChapters?: number[] };
    return {
      title: course.title,
      progress: (prog.completedChapters || []).length,
      total: course.total,
    };
  });

  return {
    name: user.name,
    bio: user.bio,
    skills: (user.skills as string[]) || [],
    points: user.points || 0,
    courses: courseList.filter(Boolean) as {
      title: string;
      progress: number;
      total: number;
    }[],
  };
});

export async function getOrCreateConversation(userId: number) {
  const existing = await db
    .select()
    .from(mentorConversations)
    .where(eq(mentorConversations.user_id, userId))
    .limit(1);

  if (existing.length) return existing[0];

  await db.insert(mentorConversations).values({
    user_id: userId,
    messages: [],
  });

  const created = await db
    .select()
    .from(mentorConversations)
    .where(eq(mentorConversations.user_id, userId))
    .limit(1);

  return created[0];
}

export function buildSystemPrompt(user: {
  name: string;
  bio: string | null;
  skills: string[];
  points: number;
  courses: { title: string; progress: number; total: number }[];
}): string {
  const skillList = user.skills.length
    ? user.skills.join(", ")
    : "No skills added yet";
  const courseList = user.courses.length
    ? user.courses
        .map((c) => `- ${c.title}: ${c.progress}/${c.total} chapters`)
        .join("\n")
    : "No enrolled courses yet";

  return `You are Lynx — an encouraging, practical coding mentor on LynxDEV. Your tone is warm, direct, and developer-to-developer.

## User Profile
- Name: ${user.name}
- Bio: ${user.bio || "Not provided"}
- Skills: ${skillList}
- Points: ${user.points}
- Enrolled Courses:
${courseList}

## Your Role
1. **Assess their level** based on listed skills and course progress. Beginner = 0-2 skills / early chapters. Intermediate = 3-5 skills / mid courses. Advanced = 6+ skills / completed courses.
2. **Suggest what to learn next** — reference specific courses available on LynxDEV (HTML, CSS, JavaScript, Python, Java, C, C++, C#, DSA problems, interview prep).
3. **Answer coding questions** with clear explanations, code examples, and real-life analogies.
4. **Keep responses concise** — 3-5 paragraphs max unless they ask for depth.
5. **Be encouraging** — celebrate progress and make recommendations feel achievable.

If they ask something off-topic, gently steer back to coding. Never give generic advice — always tie it to their specific profile above.`;
}

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [500, 1000];
const MAX_RETRY_AFTER_MS = 5000;

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted)
      return reject(new DOMException("Aborted", "AbortError"));
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

function backoffMs(attempt: number, retryAfterHeader: string | null): number {
  if (retryAfterHeader) {
    const seconds = Number(retryAfterHeader);
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.min(seconds * 1000, MAX_RETRY_AFTER_MS);
    }
  }
  const base = BACKOFF_MS[attempt] ?? BACKOFF_MS[BACKOFF_MS.length - 1];
  return base * (0.8 + Math.random() * 0.4);
}

export async function callMistral(messages: Message[], signal?: AbortSignal) {
  const url = "https://api.mistral.ai/v1/chat/completions";
  const init: RequestInit = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
    },
    body: JSON.stringify({
      model: "mistral-large-latest",
      messages,
      stream: true,
      max_tokens: 2048,
      temperature: 0.7,
    }),
    signal,
  };

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let res: Response;

    try {
      res = await fetch(url, init);
    } catch (err) {
      if (signal?.aborted || attempt === MAX_ATTEMPTS - 1) throw err;
      await sleep(backoffMs(attempt, null), signal);
      continue;
    }

    if (res.ok) return res.body!;

    const errBody = await res.text();

    if (!RETRYABLE_STATUS_CODES.has(res.status)) {
      throw new Error(`Mistral API error ${res.status}: ${errBody}`);
    }

    if (attempt === MAX_ATTEMPTS - 1) {
      throw new Error(`Mistral API error ${res.status}: ${errBody}`);
    }

    await sleep(backoffMs(attempt, res.headers.get("retry-after")), signal);
  }

  throw new Error("Mistral API error: unreachable");
}
