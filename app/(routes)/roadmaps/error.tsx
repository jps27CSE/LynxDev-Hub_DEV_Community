"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-16 text-center">
      <p className="text-muted-foreground">Failed to load roadmaps.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 text-sm text-primary hover:underline"
      >
        Try again
      </button>
    </div>
  );
}
