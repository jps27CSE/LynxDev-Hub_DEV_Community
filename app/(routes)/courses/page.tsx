import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getAllCourses } from "@/lib/course-data";

const difficultyColor: Record<string, string> = {
  Beginner: "bg-green-500/10 text-green-500 border-green-500/20",
  Intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Advanced: "bg-red-500/10 text-red-500 border-red-500/20",
};

export default async function CoursesPage() {
  const allCourses = await getAllCourses();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Available Courses
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose a course and start learning at your own pace. All courses are
            free and include hands-on coding exercises.
          </p>
        </div>

        {allCourses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              No courses available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allCourses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="group rounded-xl border border-border/50 bg-card p-6 hover:border-border transition-all hover:shadow-sm block"
              >
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 text-2xl">
                  {course.icon || "📁"}
                </div>
                <h2 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {course.title}
                </h2>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className={
                      difficultyColor[course.difficulty] ||
                      "bg-muted text-muted-foreground"
                    }
                  >
                    {course.difficulty}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {course.category || "General"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
