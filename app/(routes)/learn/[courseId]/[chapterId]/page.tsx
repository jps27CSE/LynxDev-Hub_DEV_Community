import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCourseById, getChaptersByCourseId } from "@/lib/course-data";
import LessonClient from "./LessonClient";
import { PageHeader } from "@/components/PageHeader";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; chapterId: string }>;
}) {
  const { courseId, chapterId } = await params;
  const course = await getCourseById(parseInt(courseId));
  const chapters = await getChaptersByCourseId(parseInt(courseId));
  const chapter = chapters.find((c) => c.id === parseInt(chapterId));

  if (!course || !chapter) {
    notFound();
  }

  const currentIndex = chapters.findIndex((c) => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <PageHeader>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/courses/${course.id}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; {course.title}
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium truncate max-w-[300px]">
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

      <LessonClient chapter={chapter} courseId={course.id} />
    </div>
  );
}
