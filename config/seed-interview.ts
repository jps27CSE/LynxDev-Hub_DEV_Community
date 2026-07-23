import "dotenv/config";
import { db } from "./db";
import { interviewCategories, interviewQuestions } from "./schema";
import { categoriesData, questionsData } from "./interview/seed-data";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding interview data...");

  for (const cat of categoriesData) {
    await db.insert(interviewCategories).values(cat);

    const [category] = await db
      .select()
      .from(interviewCategories)
      .where(eq(interviewCategories.slug, cat.slug));

    console.log(`Created category: ${cat.name} (id: ${category.id})`);

    const questions = questionsData[cat.slug] || [];
    for (const q of questions) {
      await db.insert(interviewQuestions).values({
        category_id: category.id,
        question: q.question,
        answer: q.answer,
        difficulty: q.difficulty,
        tags: q.tags,
        is_top50: q.is_top50,
      });
      console.log(`  Added question: ${q.question.substring(0, 50)}...`);
    }
  }

  console.log("Interview seeding complete!");
}

main().catch(console.error);
