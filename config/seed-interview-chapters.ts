import "dotenv/config";
import { db } from "./db";
import { interviewCategories, interviewChapters, interviewQuestions, interviewQuestionChapters } from "./schema";
import { eq } from "drizzle-orm";
import { chaptersData } from "./interview/chapters-seed-data";

async function seedInterviewChapters() {
  console.log("Clearing existing chapters...");
  await db.delete(interviewQuestionChapters);
  await db.delete(interviewChapters);
  console.log("Cleared. Seeding interview chapters...\n");

  const allCategories = await db.select().from(interviewCategories);
  const allQuestions = await db.select().from(interviewQuestions);
  const questionMap = new Map<string, number>();
  for (const q of allQuestions) {
    questionMap.set(q.question, q.id);
  }

  for (const cat of allCategories) {
    const chapters = chaptersData[cat.slug];
    if (!chapters) {
      console.log(`  - No chapters for ${cat.slug}, skipping`);
      continue;
    }

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      await db.insert(interviewChapters).values({
        category_id: cat.id,
        title: ch.title,
        content: {
          keyPoints: ch.content.keyPoints,
          tips: ch.content.tips,
        },
        order_index: i,
      });
    }

    const catChapters = await db
      .select()
      .from(interviewChapters)
      .where(eq(interviewChapters.category_id, cat.id))
      .orderBy(interviewChapters.order_index);

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const chapter = catChapters[i];
      if (!chapter) continue;

      const sampleQuestions = (ch.content as any).sampleQuestions || [];
      let linked = 0;
      for (const sq of sampleQuestions) {
        for (const [qText, qId] of questionMap.entries()) {
          if (qText.toLowerCase().includes(sq.toLowerCase()) || sq.toLowerCase().includes(qText.toLowerCase())) {
            try {
              await db.insert(interviewQuestionChapters).values({
                question_id: qId,
                chapter_id: chapter.id,
              });
              linked++;
            } catch {
              // skip duplicate
            }
            break;
          }
        }
      }
      console.log(`  ✓ ${cat.name} → ${ch.title} (${linked} questions linked)`);
    }
  }

  console.log("\n✅ Done! Interview chapters seeded.");
  process.exit(0);
}

seedInterviewChapters().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
