"use client";

import { useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function PageError({
  title,
  reset,
}: {
  title: string;
  reset: () => void;
}) {
  const router = useRouter();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = () => {
    setRetrying(true);
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col items-center gap-4 py-16 px-4 rounded-2xl border border-border bg-card text-center">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h2 className="font-semibold text-lg">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            We couldn&apos;t load this page. Please try again.
          </p>
        </div>
        <Button onClick={handleRetry} disabled={retrying} className="mt-2">
          {retrying ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : null}
          {retrying ? "Retrying..." : "Try again"}
        </Button>
      </div>
    </div>
  );
}