"use client";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

const EnrolledCourses = () => {
  const [enrolledCourses] = useState([]);

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
      {enrolledCourses.length === 0 ? (
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
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">{/* Course cards */}</div>
      )}
    </div>
  );
};

export default EnrolledCourses;
