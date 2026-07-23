import "dotenv/config";
import { db } from "./db";
import { interviewCategories, interviewChapters } from "./schema";
import { eq } from "drizzle-orm";
import { chaptersData } from "./interview/chapters-seed-data";

async function seedInterviewChapters() {
  console.log("Seeding interview chapters...");

  const allCategories = await db.select().from(interviewCategories);

  for (const cat of allCategories) {
    const chapters = chaptersData[cat.slug];
    if (!chapters) {
      console.log(`  - No chapters for ${cat.slug}, skipping`);
      continue;
    }

    const existing = await db
      .select()
      .from(interviewChapters)
      .where(eq(interviewChapters.category_id, cat.id));
    if (existing.length > 0) {
      console.log(`  ~ ${cat.name}: ${existing.length} chapters already exist, skipping`);
      continue;
    }

    for (let i = 0; i < chapters.length; i++) {
      const ch = chapters[i];
      await db.insert(interviewChapters).values({
        category_id: cat.id,
        title: ch.title,
        content: ch.content,
        order_index: i,
      });
      console.log(`  ✓ ${cat.name} → ${ch.title}`);
    }
  }

  console.log("\nDone! Interview chapters seeded.");
  process.exit(0);
}

seedInterviewChapters().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
