import "dotenv/config";
import { db } from "./db";
import { courses, chapters, enrollments } from "./schema";

async function main() {
  console.log("Resetting courses module data...");

  const chapterCount = await db.delete(chapters);
  console.log(`Deleted chapters: ${chapterCount[0]?.affectedRows ?? 0}`);

  const enrollmentCount = await db.delete(enrollments);
  console.log(`Deleted enrollments: ${enrollmentCount[0]?.affectedRows ?? 0}`);

  const courseCount = await db.delete(courses);
  console.log(`Deleted courses: ${courseCount[0]?.affectedRows ?? 0}`);

  console.log("Courses module data reset complete!");
}

main().catch((error) => {
  console.error("Reset failed:", error);
  process.exit(1);
});
