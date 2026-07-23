import "dotenv/config";
import { db } from "./db";
import { interviewCategories, interviewQuestions } from "./schema";
import { categoriesData, questionsData } from "./interview/seed-data";

async function main() {
  console.log("Seeding interview data...");

  for (const cat of categoriesData) {
    const [category] = await db
      .insert(interviewCategories)
      .values(cat)
      .returning({ id: interviewCategories.id });

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
