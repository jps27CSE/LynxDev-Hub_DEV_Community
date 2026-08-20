"use client";

import PageError from "@/components/PageError";

export default function CoursesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError title="Something went wrong loading courses" reset={reset} />
  );
}
