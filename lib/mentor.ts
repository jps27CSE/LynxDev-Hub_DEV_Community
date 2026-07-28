import { cache } from "react";
import { db } from "@/config/db";
import { usersTable, enrollments, courses, chapters, mentorConversations } from "@/config/schema";
import { eq } from "drizzle-orm";

type Message = { role: "user" | "assistant" | "system"; content: string };

export const getUserContext = cache(async (clerkEmail: string) => {
  const users = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, clerkEmail))
    .limit(1);

  if (!users.length) return null;
  const user = users[0];

  const enrolled = await db
    .select()
    .from(enrollments)
    .where(eq(enrollments.user_id, user.id));

  const courseList = await Promise.all(
    enrolled.map(async (e) => {
      const course = await db
        .select()
        .from(courses)
        .where(eq(courses.id, e.course_id))
        .limit(1);
      if (!course.length) return null;
      const chapterList = await db
        .select()
        .from(chapters)
        .where(eq(chapters.course_id, e.course_id));
      const prog = (e.progress as { completedChapters?: number[] }) || {};
      return {
        title: course[0].title,
        progress: (prog.completedChapters || []).length,
        total: chapterList.length,
      };
    })
  );

  return {
    name: user.name,
    bio: user.bio,
    skills: (user.skills as string[]) || [],
    points: user.points || 0,
    courses: courseList.filter(Boolean) as { title: string; progress: number; total: number }[],
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
  const skillList = user.skills.length ? user.skills.join(", ") : "No skills added yet";
  const courseList = user.courses.length
    ? user.courses.map((c) => `- ${c.title}: ${c.progress}/${c.total} chapters`).join("\n")
    : "No enrolled courses yet";

  return `You are Lynx — an encouraging, practical coding mentor on LynxDev Hub. Your tone is warm, direct, and developer-to-developer.

## User Profile
- Name: ${user.name}
- Bio: ${user.bio || "Not provided"}
- Skills: ${skillList}
- Points: ${user.points}
- Enrolled Courses:
${courseList}

## Your Role
1. **Assess their level** based on listed skills and course progress. Beginner = 0-2 skills / early chapters. Intermediate = 3-5 skills / mid courses. Advanced = 6+ skills / completed courses.
2. **Suggest what to learn next** — reference specific courses available on LynxDev Hub (HTML, CSS, JavaScript, Python, Java, C, C++, C#, DSA problems, interview prep).
3. **Answer coding questions** with clear explanations, code examples, and real-life analogies.
4. **Keep responses concise** — 3-5 paragraphs max unless they ask for depth.
5. **Be encouraging** — celebrate progress and make recommendations feel achievable.

If they ask something off-topic, gently steer back to coding. Never give generic advice — always tie it to their specific profile above.`;
}

export async function callMistral(messages: Message[], signal?: AbortSignal) {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
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
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Mistral API error ${res.status}: ${err}`);
  }

  return res.body!;
}
