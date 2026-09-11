import { Flame, Sparkles, BookOpenCheck, Trophy } from "lucide-react";

const statusItems = [
  {
    key: "points",
    label: "Points",
    labelShort: "Points",
    icon: Sparkles,
    accent: "bg-amber-500/10 text-amber-500",
  },
  {
    key: "chapters",
    labelShort: "Chapters",
    label: "Chapters Completed",
    icon: BookOpenCheck,
    accent: "bg-sky-500/10 text-sky-500",
  },
  {
    key: "coursesDone",
    labelShort: "Courses",
    label: "Courses Completed",
    icon: Trophy,
    accent: "bg-emerald-500/10 text-emerald-500",
  },
  {
    key: "active",
    labelShort: "Active",
    label: "Active Courses",
    icon: Flame,
    accent: "bg-orange-500/10 text-orange-500",
  },
] as const;

export type StatusData = {
  points: number;
  chaptersCompleted: number;
  coursesCompleted: number;
  activeCourses: number;
};

function StatusStrip({ status }: { status: StatusData }) {
  const values: Record<(typeof statusItems)[number]["key"], number> = {
    points: status.points,
    chapters: status.chaptersCompleted,
    coursesDone: status.coursesCompleted,
    active: status.activeCourses,
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
      {statusItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.key}
            className="group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card p-3 sm:p-4 lg:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg"
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                boxShadow: "inset 0 1px 0 0 rgb(255 255 255 / 0.05)",
                background:
                  "linear-gradient(135deg, rgba(56,189,248,0.04), transparent)",
              }}
            />
            <div className="flex items-center gap-2 sm:gap-3 relative">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 rounded-lg sm:rounded-xl ${item.accent} flex items-center justify-center flex-shrink-0 ring-1 ring-border`}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight leading-none">
                  {values[item.key]}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 sm:mt-1.5 leading-tight">
                  <span className="sm:hidden">{item.labelShort}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatusStrip;
