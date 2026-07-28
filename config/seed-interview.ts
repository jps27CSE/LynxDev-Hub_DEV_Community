import "dotenv/config";
import { db } from "./db";
import { interviewCategories, interviewChapters, interviewQuestions, interviewQuestionChapters } from "./schema";
import { categoriesData, questionsData } from "./interview/seed-data";
import { chaptersData } from "./interview/chapters-seed-data";
import { eq, sql } from "drizzle-orm";

async function main() {
  console.log("Clearing existing interview data...");
  await db.execute(sql.raw("SET FOREIGN_KEY_CHECKS = 0"));
  await db.delete(interviewQuestionChapters);
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
  const questionMap = new Map<string, number>();
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
  for (const q of insertedQuestions) {
    questionMap.set(q.question, q.id);
  }
  console.log(`✓ Inserted ${insertedQuestions.length} questions`);

  // Insert chapters and create question-chapter links
  for (const cat of allCategories) {
    const chapters = chaptersData[cat.slug];
    if (!chapters) continue;

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

    // Fetch inserted chapters for this category
    const catChapters = await db
      .select()
      .from(interviewChapters)
      .where(eq(interviewChapters.category_id, cat.id));

    // Link questions to chapters using sampleQuestions from the old seed data
    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      const chapter = catChapters.find((c) => c.order_index === i);
      if (!chapter) continue;

      const sampleQuestions = (ch.content as any).sampleQuestions || [];
      for (const sq of sampleQuestions) {
        // Find the matching question by exact text match
        const qId = questionMap.get(sq);
        if (qId !== undefined) {
          try {
            await db.insert(interviewQuestionChapters).values({
              question_id: qId,
              chapter_id: chapter.id,
            });
          } catch {
            // Skip if duplicate
          }
        }
      }
      console.log(`  ✓ ${cat.name} → ${ch.title} (${sampleQuestions.length} questions)`);
    }
  }

  console.log("\n✅ Interview seeding complete!");
}

main().catch(console.error);
