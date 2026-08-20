import "dotenv/config";
import { db } from "./db";
import { problems } from "./schema";
import { problemsData } from "./problems/seed-data";

async function seedProblems() {
  console.log("Seeding problems...");

  if (
    process.env.NODE_ENV === "production" &&
    !process.argv.includes("--force")
  ) {
    console.error(
      "Refusing to wipe the problems table in production. Re-run with --force to override.",
    );
    process.exit(1);
  }

  // Reset first — removes the previous in-house set (was 10 DSA clones).
  // Run only when you intend to replace the whole table.
  const before = await db.delete(problems);
  console.log(`Cleared ${before[0].affectedRows} existing problems`);

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
