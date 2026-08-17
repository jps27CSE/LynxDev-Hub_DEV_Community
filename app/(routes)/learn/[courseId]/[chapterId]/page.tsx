import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  getCourseById,
  getChaptersByCourseId,
  getCourseLanguage,
} from "@/lib/course-data";
import LessonClient from "./LessonClient";
import { PageHeader } from "@/components/PageHeader";
import { parsePositiveInt } from "@/lib/parse-id";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const { courseId: rawCourseId, chapterId: rawChapterId } = await params;
  const courseId = parsePositiveInt(rawCourseId);
  const chapterId = parsePositiveInt(rawChapterId);
  if (!courseId || !chapterId) {
    notFound();
  }
  const course = await getCourseById(courseId);
  const chapters = await getChaptersByCourseId(courseId);
  const chapter = chapters.find((c) => c.id === chapterId);

  if (!course || !chapter) {
    notFound();
  }

  const currentIndex = chapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="flex flex-col lg:h-screen lg:overflow-hidden">
      <PageHeader>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/courses/${course.id}`}
              className="text-sm text-muted-foreground hover:text-emerald-500 transition-colors"
            >
              &larr; {course.title}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="inline-flex items-center gap-2 text-sm font-display font-semibold truncate max-w-[300px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
              {chapter.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {prevChapter && (
              <Link href={`/learn/${course.id}/${prevChapter.id}`}>
                <Button variant="outline" size="sm">
                  Previous
                </Button>
              </Link>
            )}
            {nextChapter && (
              <Link href={`/learn/${course.id}/${nextChapter.id}`}>
                <Button size="sm">Next</Button>
              </Link>
            )}
          </div>
        </div>
      </PageHeader>

      <LessonClient
        chapter={chapter}
        courseId={course.id}
        language={getCourseLanguage(course.title, chapter.content.type)}
      />
    </div>
  );
}
