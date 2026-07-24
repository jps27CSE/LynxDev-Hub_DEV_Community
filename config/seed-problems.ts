import "dotenv/config";
import { db } from "./db";
import { problems } from "./schema";
import { problemsData } from "./problems/seed-data";

async function seedProblems() {
  console.log("Seeding problems...");

  for (let i = 0; i < problemsData.length; i++) {
    const data = problemsData[i];
    await db.insert(problems).values({
      title: data.title,
      description: data.description,
      difficulty: data.difficulty,
      category: data.category,
      tags: data.tags,
      starter_code: data.starter_code,
      solution_code: data.solution_code,
      test_cases: data.test_cases,
      order_index: i,
    });
    console.log(`  ✓ ${data.title}`);
  }

  console.log(`\nDone! Seeded ${problemsData.length} problems.`);
  process.exit(0);
}

seedProblems().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
