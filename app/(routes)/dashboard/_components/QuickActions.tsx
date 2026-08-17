import Link from "next/link";
import { ArrowUpRight, BookOpen, Code2, Sparkles } from "lucide-react";

const actions = [
  {
    label: "Courses",
    description: "Structured lessons & hands-on projects",
    href: "/courses",
    icon: BookOpen,
    accent: "bg-sky-500/10 text-sky-500",
    glow: "group-hover:shadow-sky-500/10",
  },
  {
    label: "Interview Prep",
    description: "Curated questions, chapters & practice",
    href: "/interview",
    icon: Sparkles,
    accent: "bg-purple-500/10 text-purple-500",
    glow: "group-hover:shadow-purple-500/10",
  },
  {
    label: "Problem Solving",
    description: "DSA challenges in the built-in editor",
    href: "/problems",
    icon: Code2,
    accent: "bg-emerald-500/10 text-emerald-500",
    glow: "group-hover:shadow-emerald-500/10",
  },
];

function QuickActions() {
  return (
    <div>
      <h2 className="text-xl font-bold tracking-tight mb-6">Explore</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className="group relative rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-border hover:shadow-lg overflow-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 outline-none"
            >
              <div
                className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${action.glow}`}
                style={{
                  boxShadow: "inset 0 1px 0 0 rgb(255 255 255 / 0.05)",
                }}
              />
              <div className="flex items-start justify-between relative">
                <div
                  className={`w-11 h-11 rounded-xl ${action.accent} flex items-center justify-center ring-1 ring-border`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
              </div>
              <h3 className="font-semibold text-sm mt-4 group-hover:text-primary transition-colors">
                {action.label}
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActions;
