import "dotenv/config";
import { db } from "./db";
import {
  interviewCategories,
  interviewCategoryChapters,
  interviewChapters,
  interviewQuestions,
  interviewQuestionChapters,
} from "./schema";
import { eq, sql } from "drizzle-orm";
import {
  chaptersData,
  crossCategoryChapters,
} from "./interview/chapters-seed-data";

async function seedInterviewChapters() {
  console.log("Clearing existing chapters...");
  await db.delete(interviewQuestionChapters);
  await db.delete(interviewCategoryChapters);
  await db.delete(interviewChapters);
  console.log("Cleared. Seeding interview chapters...\n");

  const allCategories = await db.select().from(interviewCategories);
  const allQuestions = await db.select().from(interviewQuestions);
  const questionMap = new Map<string, number>();
  for (const q of allQuestions) {
    questionMap.set(q.question, q.id);
  }

  const createdChapters = new Map<string, number>(); // title -> chapter id

  for (const cat of allCategories) {
    const chapters = chaptersData[cat.slug];
    if (!chapters) {
      console.log(`  - No chapters for ${cat.slug}, skipping`);
      continue;
    }

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      let chapterId = createdChapters.get(ch.title);

      if (!chapterId) {
        // Create the chapter only once (deduplicated by title)
        await db.insert(interviewChapters).values({
          title: ch.title,
          content: {
            keyPoints: ch.content.keyPoints,
            tips: ch.content.tips,
          },
        });

        const inserted = await db
          .select()
          .from(interviewChapters)
          .where(eq(interviewChapters.title, ch.title))
          .orderBy(sql`id DESC`)
          .limit(1);

        if (!inserted[0]) continue;
        chapterId = inserted[0].id;
        createdChapters.set(ch.title, chapterId);
      }

      // Link chapter to category via join table
      await db.insert(interviewCategoryChapters).values({
        category_id: cat.id,
        chapter_id: chapterId,
        order_index: i,
      });

      // Link questions to chapter using sampleQuestions
      const sampleQuestions = (ch.content as any).sampleQuestions || [];
      let linked = 0;
      for (const sq of sampleQuestions) {
        for (const [qText, qId] of questionMap.entries()) {
          if (
            qText === sq ||
            qText.toLowerCase().includes(sq.toLowerCase()) ||
            sq.toLowerCase().includes(qText.toLowerCase())
          ) {
            try {
              await db.insert(interviewQuestionChapters).values({
                question_id: qId,
                chapter_id: chapterId,
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

  // Process cross-category chapter links (borrowed chapters)
  for (const cat of allCategories) {
    const crossLinks = crossCategoryChapters[cat.slug];
    if (!crossLinks) continue;

    for (const link of crossLinks) {
      const chapterId = createdChapters.get(link.title);
      if (!chapterId) {
        console.log(
          `  ⚠ ${cat.name}: cross-referenced chapter "${link.title}" not found — skipping`,
        );
        continue;
      }

      try {
        await db.insert(interviewCategoryChapters).values({
          category_id: cat.id,
          chapter_id: chapterId,
          order_index: link.order_index,
        });
        console.log(`  ✓ ${cat.name} ← "${link.title}" (borrowed)`);
      } catch {
        // Skip if duplicate
      }
    }
  }

  console.log("\n✅ Done! Interview chapters seeded.");

  console.log(
    "\n⚠️  Interview data is cached cross-request. Bump INTERVIEW_DATA_CACHE_VERSION in lib/interview-data.ts to invalidate.",
  );
  process.exit(0);
}

seedInterviewChapters().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
