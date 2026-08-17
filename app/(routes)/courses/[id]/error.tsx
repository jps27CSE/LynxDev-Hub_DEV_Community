"use client";

import PageError from "@/components/PageError";

export default function CourseDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError title="Something went wrong loading this course" reset={reset} />
  );
}