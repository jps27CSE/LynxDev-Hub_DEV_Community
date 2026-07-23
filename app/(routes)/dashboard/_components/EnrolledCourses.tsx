"use client";
import { BookOpen, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";

type EnrolledCourse = {
  id: number;
  user_id: number;
  course_id: number;
  progress: { completedChapters: number[]; currentChapter: number };
  started_at: string;
  completed_at: string | null;
  course: {
    id: number;
    title: string;
    description: string;
    icon: string | null;
    difficulty: string;
    category: string | null;
  };
};

const EnrolledCourses = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);

  useEffect(() => {
    axios.get("/api/enroll").then((res) => setEnrolledCourses(res.data));
  }, []);

  if (enrolledCourses.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Your Enrolled Courses
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Pick up where you left off
            </p>
          </div>
          <Link href="/courses">
            <Button variant="outline" size="sm">
              Browse All
            </Button>
          </Link>
        </div>
        <div className="flex flex-col items-center gap-4 py-16 px-4 rounded-xl border border-border/50 bg-card">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-lg">No enrolled courses yet</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Start your learning journey by enrolling in a course that
              interests you.
            </p>
          </div>
          <Link href="/courses">
            <Button className="mt-2">Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">
            Your Enrolled Courses
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pick up where you left off
          </p>
        </div>
        <Link href="/courses">
          <Button variant="outline" size="sm">
            Browse All
          </Button>
        </Link>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {enrolledCourses.map((enrollment) => {
          const completedCount = enrollment.progress.completedChapters.length;
          const totalChapters = 0; // we don't have total from this query
          return (
            <Link
              key={enrollment.id}
              href={
                enrollment.completed_at
                  ? `/courses/${enrollment.course_id}`
                  : `/learn/${enrollment.course_id}/${enrollment.progress.currentChapter}`
              }
              className="group rounded-xl border border-border/50 bg-card p-5 hover:border-border transition-all hover:shadow-sm block"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl flex-shrink-0">
                  {enrollment.course.icon || "📁"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm group-hover:text-primary transition-colors truncate">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {enrollment.completed_at
                      ? "Completed"
                      : `${completedCount} chapter${completedCount !== 1 ? "s" : ""} done`}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
              </div>
              <div className="mt-3 w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{ width: "0%" }}
                  title={`${completedCount} chapters completed`}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default EnrolledCourses;
