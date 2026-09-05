"use client";

import PageError from "@/components/PageError";

export default function HomeError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      title="Something went wrong loading the homepage"
      reset={reset}
    />
  );
}
