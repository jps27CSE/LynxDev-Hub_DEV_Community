import "dotenv/config";
import { db } from "./db";
import {
  interviewCategories,
  interviewCategoryChapters,
  interviewChapters,
  interviewQuestions,
  interviewQuestionChapters,
} from "./schema";
import { categoriesData, questionsData } from "./interview/seed-data";
import {
  chaptersData,
  crossCategoryChapters,
} from "./interview/chapters-seed-data";
import { eq, sql } from "drizzle-orm";

async function main() {
  console.log("Clearing existing interview data...");
  await db.execute(sql.raw("SET FOREIGN_KEY_CHECKS = 0"));
  await db.delete(interviewQuestionChapters);
  await db.delete(interviewCategoryChapters);
  await db.delete(interviewChapters);
  await db.delete(interviewQuestions);
  await db.delete(interviewCategories);
  await db.execute(sql.raw("SET FOREIGN_KEY_CHECKS = 1"));
  console.log("Cleared. Seeding interview data...\n");

  // Insert categories
  for (const cat of categoriesData) {
    await db.insert(interviewCategories).values(cat);
  }
  const allCategories = await db.select().from(interviewCategories);
  console.log(`✓ Created ${allCategories.length} categories`);

  // Collect all unique questions (deduplicated by question text)
  const seen = new Set<string>();
  const allQuestions: {
    question: string;
    answer: string;
    difficulty: string;
    tags: string[];
    is_top50: boolean;
  }[] = [];

  for (const cat of allCategories) {
    const catQuestions = questionsData[cat.slug] || [];
    for (const q of catQuestions) {
      if (!seen.has(q.question)) {
        seen.add(q.question);
        allQuestions.push(q);
      }
    }
  }
  console.log(`✓ Found ${allQuestions.length} unique questions (deduplicated)`);

  // Insert questions and keep ID map
  for (const q of allQuestions) {
    await db.insert(interviewQuestions).values({
      question: q.question,
      answer: q.answer,
      difficulty: q.difficulty,
      tags: q.tags,
      is_top50: q.is_top50,
    });
  }

  // Fetch all inserted questions to build the map
  const insertedQuestions = await db.select().from(interviewQuestions);
  const questionMap = new Map<string, number>();
  for (const q of insertedQuestions) {
    questionMap.set(q.question, q.id);
  }
  console.log(`✓ Inserted ${insertedQuestions.length} questions`);

  // Insert chapters (deduplicated by title) and create category-chapter links + question-chapter links
  const createdChapters = new Map<string, number>(); // title -> chapter id

  for (const cat of allCategories) {
    const chapters = chaptersData[cat.slug];
    if (!chapters) continue;

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
        const qId = questionMap.get(sq);
        if (qId !== undefined) {
          try {
            await db.insert(interviewQuestionChapters).values({
              question_id: qId,
              chapter_id: chapterId,
            });
            linked++;
          } catch {
            // Skip if duplicate
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

  console.log("\n✅ Interview seeding complete!");
}

main().catch(console.error);
