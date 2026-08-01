"use client";
import { useUser } from "@clerk/nextjs";
import { useContext } from "react";
import { UserDetailContext } from "@/context/UserDetailContext";
import { Settings } from "lucide-react";
import Link from "next/link";

function WelcomeBanner({
  enrolledCount,
  completedCount,
}: {
  enrolledCount: number;
  completedCount: number;
}) {
  const { user } = useUser();
  const { userDetail } = useContext(UserDetailContext);

  const points = (userDetail as { points?: number })?.points ?? 0;
  const badges = completedCount;
  const skills = (userDetail as { skills?: string[] })?.skills;

  return (
    <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-8">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight">
              Welcome back,{" "}
              <span className="text-primary">
                {user?.fullName || "Developer"}
              </span>
            </h1>
            <p className="mt-2 text-muted-foreground max-w-xl text-sm">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1 flex-shrink-0"
          >
            <Settings className="w-3.5 h-3.5" />
            Edit profile
          </Link>
        </div>

        {skills && skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-full border border-border/50 bg-card text-[11px] font-medium text-muted-foreground"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-6 mt-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">{points}</span>
            <span className="text-sm text-muted-foreground">Points</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              {enrolledCount}
            </span>
            <span className="text-sm text-muted-foreground">Enrolled</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              {completedCount}
            </span>
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">{badges}</span>
            <span className="text-sm text-muted-foreground">Badges</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;
