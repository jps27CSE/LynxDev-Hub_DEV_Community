"use client";

import PageError from "@/components/PageError";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageError
      title="Something went wrong loading your dashboard"
      reset={reset}
    />
  );
}
