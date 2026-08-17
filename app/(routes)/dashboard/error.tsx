"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col items-center gap-4 py-16 px-4 rounded-2xl border border-border bg-card text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">
            Something went wrong loading your dashboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            We couldn&apos;t fetch your dashboard data. Please try again.
          </p>
        </div>
        <Button onClick={() => reset()} className="mt-2">
          Try again
        </Button>
      </div>
    </div>
  );
}
