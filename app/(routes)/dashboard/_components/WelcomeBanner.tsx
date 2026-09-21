"use client";

import { Pencil } from "lucide-react";
import Link from "next/link";

const timeGreeting = (name: string | null) => {
  const hour = new Date().getHours();
  const period =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return `${period}, ${name?.trim() || "Developer"}!`;
};

const getInitials = (name: string | null) => {
  const trimmed = name?.trim();
  if (!trimmed) return "D";
  return trimmed
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

function WelcomeBanner({
  name,
  avatarUrl,
  skills,
}: {
  name: string | null;
  avatarUrl: string | null;
  skills: string[] | null;
}) {
  return (
    <div className="relative w-full max-w-full rounded-xl border border-border bg-gradient-to-br from-primary/5 via-background to-primary/10 p-3 sm:p-6 lg:p-8 box-border overflow-hidden">
      <div className="absolute inset-0 bg-grid-paper pointer-events-none" />

      <div className="relative">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/50 bg-muted/50 text-[10px] text-muted-foreground mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
        <span className="truncate">{timeGreeting(name)}</span>
      </div>

      {/* Heading */}
      <h1 className="text-lg sm:text-2xl lg:text-3xl font-display font-bold tracking-tight leading-snug sm:leading-tight">
        Welcome back,{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
          {name?.trim() || "Developer"}
        </span>
      </h1>

      {/* Subtitle */}
      <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-muted-foreground leading-relaxed">
        Pick up where you left off, keep your streak alive, and make
        something great today.
      </p>

      {/* Avatar + Edit profile */}
      <div className="flex items-center gap-3 mt-3 sm:mt-4 sm:justify-end">
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-border/50 overflow-hidden flex items-center justify-center shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="font-display font-bold text-sm text-primary">
              {getInitials(name)}
            </span>
          )}
        </div>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Edit profile
        </Link>
      </div>

      {/* Skills */}
      {skills && skills.length > 0 && (
        <div className="flex flex-wrap gap-1 sm:gap-1.5 mt-3 sm:mt-4">
          {skills.slice(0, 5).map((skill) => (
            <span
              key={skill}
              className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full border border-border/50 bg-muted/50 text-[8px] sm:text-[11px] font-medium text-muted-foreground"
            >
              {skill}
            </span>
          ))}
          {skills.length > 5 && (
            <span className="px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[8px] sm:text-[11px] font-medium text-muted-foreground/60">
              +{skills.length - 5} more
            </span>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

export default WelcomeBanner;
