import "dotenv/config";
import { db } from "./db";
import { courses, chapters } from "./schema";
import { coursesData } from "./seed-data";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding courses...");

  for (const courseData of coursesData) {
    const { chapters: chapterData, ...courseFields } = courseData;

    await db.insert(courses).values(courseFields);

    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.title, courseData.title))
      .orderBy(courses.id)
      .limit(1);

    console.log(`Created course: ${courseData.title} (id: ${course.id})`);

    for (let i = 0; i < chapterData.length; i++) {
      const ch = chapterData[i];
      await db.insert(chapters).values({
        course_id: course.id,
        title: ch.title,
        content: ch.content as unknown as Record<string, unknown>,
        points_reward: ch.points_reward ?? 10,
        order_index: i + 1,
      });
      console.log(`  Added chapter: ${ch.title}`);
    }
  }

  console.log("Courses seeding complete!");
}

main().catch(console.error);
