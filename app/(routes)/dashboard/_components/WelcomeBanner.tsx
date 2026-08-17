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
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-primary/10 p-6 sm:p-8">
      <div className="absolute inset-0 bg-grid-paper" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/50 bg-card/50 text-[11px] text-muted-foreground mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {timeGreeting(name)}
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold tracking-tight leading-tight">
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              {name?.trim() || "Developer"}
            </span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xl">
            Pick up where you left off, keep your streak alive, and make
            something great today.
          </p>
          {skills && skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {skills.slice(0, 8).map((skill) => (
                <span
                  key={skill}
                  className="px-2.5 py-1 rounded-full border border-border/50 bg-card/60 text-[11px] font-medium text-muted-foreground"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 8 && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-medium text-muted-foreground/60">
                  +{skills.length - 8} more
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 sm:flex-col sm:items-end shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 ring-1 ring-border/50 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-display font-bold text-lg text-primary">
                {getInitials(name)}
              </span>
            )}
          </div>
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default WelcomeBanner;
