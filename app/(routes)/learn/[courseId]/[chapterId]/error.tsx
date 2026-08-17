"use client";

import PageError from "@/components/PageError";

export default function LessonError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PageError title="Something went wrong loading this lesson" reset={reset} />;
}