import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseById, getChaptersByCourseId } from "@/lib/course-data";
import { ChevronRight } from "lucide-react";
import EnrollButton from "./EnrollButton";
import CourseIcon from "@/components/CourseIcon";

const difficultyColor: Record<string, string> = {
  Beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  Intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const courseId = parseInt(id);
  const course = await getCourseById(courseId);
  const chapterList = await getChaptersByCourseId(courseId);

  if (!course) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/courses"
        className="text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 inline-block"
      >
        &larr; Back to Courses
      </Link>

      <div className="rounded-xl border border-border/50 bg-card p-8 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
            <CourseIcon title={course.title} className="w-9 h-9" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
                {course.title}
              </h1>
              <Badge
                variant="outline"
                className={difficultyColor[course.difficulty]}
              >
                {course.difficulty}
              </Badge>
            </div>
            <p className="text-muted-foreground">{course.description}</p>
            <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
              <span>{chapterList.length} chapters</span>
              <span>{course.category || "General"}</span>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold tracking-tight mb-6">Course Content</h2>

      {chapterList.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-border/50">
          <p className="text-muted-foreground">No chapters available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chapterList.map((chapter, index) => (
            <Link
              key={chapter.id}
              href={`/learn/${course.id}/${chapter.id}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card hover:border-border transition-all hover:shadow-sm group"
            >
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                  {chapter.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {chapter.points_reward} points
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center gap-4">
        <EnrollButton courseId={course.id} />
        {chapterList.length > 0 && (
          <Link href={`/learn/${course.id}/${chapterList[0]?.id}`}>
            <Button size="lg" variant="outline">
              Start Learning
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
