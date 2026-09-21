import Link from "next/link";
import {
  Users,
  BookOpen,
  GraduationCap,
  MessageSquare,
  FileCode2,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

type Stats = {
  users: number;
  enrollments: number;
  courses: number;
  chapters: number;
  problems: number;
  openTickets: number;
};

const items = [
  {
    key: "users" as const,
    label: "Total Users",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    ring: "ring-blue-500/20",
    gradient: "from-blue-500/5 to-transparent",
  },
  {
    key: "enrollments" as const,
    label: "Enrollments",
    icon: GraduationCap,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    ring: "ring-emerald-500/20",
    gradient: "from-emerald-500/5 to-transparent",
  },
  {
    key: "courses" as const,
    label: "Courses",
    icon: BookOpen,
    color: "text-violet-500",
    bg: "bg-violet-500/10",
    ring: "ring-violet-500/20",
    gradient: "from-violet-500/5 to-transparent",
  },
  {
    key: "chapters" as const,
    label: "Chapters",
    icon: FileCode2,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    ring: "ring-amber-500/20",
    gradient: "from-amber-500/5 to-transparent",
  },
  {
    key: "problems" as const,
    label: "Problems",
    icon: MessageSquare,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    ring: "ring-cyan-500/20",
    gradient: "from-cyan-500/5 to-transparent",
  },
  {
    key: "openTickets" as const,
    label: "Open Tickets",
    icon: AlertCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    ring: "ring-red-500/20",
    gradient: "from-red-500/5 to-transparent",
    href: "/admin/feedback",
  },
];

export default function OverviewStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        const content = (
          <div
            className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg ${
              item.href ? "cursor-pointer" : ""
            }`}
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
            />

            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${item.bg} ring-1 ${item.ring} flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${item.color}`} />
                </div>
                {item.href && (
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>

              <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                {stats[item.key]}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {item.label}
              </p>
            </div>
          </div>
        );

        if (item.href) {
          return (
            <Link key={item.key} href={item.href}>
              {content}
            </Link>
          );
        }
        return <div key={item.key}>{content}</div>;
      })}
    </div>
  );
}
