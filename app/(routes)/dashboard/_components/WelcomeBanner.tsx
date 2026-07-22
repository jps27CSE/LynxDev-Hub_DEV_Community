"use client";
import { useUser } from "@clerk/nextjs";

function WelcomeBanner() {
  const { user } = useUser();

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="relative">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          Welcome back,{" "}
          <span className="text-primary">{user?.fullName || "Developer"}</span>
        </h1>
        <p className="mt-2 text-muted-foreground max-w-xl">
          Continue your learning journey. You have courses waiting, challenges
          to conquer, and skills to build.
        </p>
        <div className="flex flex-wrap gap-6 mt-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">0</span>
            <span className="text-sm text-muted-foreground">Points</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">0</span>
            <span className="text-sm text-muted-foreground">Enrolled</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">0</span>
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">0</span>
            <span className="text-sm text-muted-foreground">Badges</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;
