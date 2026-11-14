import "dotenv/config";
import { db } from "./db";
import { courses, chapters } from "./schema";
import { coursesData } from "./seed-data";
import { eq, desc } from "drizzle-orm";

async function main() {
  console.log("Seeding courses...");

  for (const courseData of coursesData) {
    const { chapters: chapterData, ...courseFields } = courseData;

    // Idempotent: reuse an existing course row with the same title instead of
    // inserting a duplicate. This keeps course ids (and any enrollments/progress)
    // stable across re-seeds.
    const [existing] = await db
      .select()
      .from(courses)
      .where(eq(courses.title, courseData.title))
      .limit(1);

    let courseId: number;
    if (existing) {
      courseId = existing.id;
      await db
        .update(courses)
        .set({ ...courseFields, chapter_count: chapterData.length })
        .where(eq(courses.id, courseId));
      // Replace chapters for this course.
      await db.delete(chapters).where(eq(chapters.course_id, courseId));
      console.log(`Updated course: ${courseData.title} (id: ${courseId})`);
    } else {
      await db
        .insert(courses)
        .values({ ...courseFields, chapter_count: chapterData.length });
      const [newest] = await db
        .select()
        .from(courses)
        .where(eq(courses.title, courseData.title))
        .orderBy(desc(courses.id))
        .limit(1);
      courseId = newest.id;
      console.log(`Created course: ${courseData.title} (id: ${courseId})`);
    }

    for (let i = 0; i < chapterData.length; i++) {
      const ch = chapterData[i];
      await db.insert(chapters).values({
        course_id: courseId,
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