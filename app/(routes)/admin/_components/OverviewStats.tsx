import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Users,
  BookOpen,
  GraduationCap,
  MessageSquare,
  FileCode2,
  AlertCircle,
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
    label: "Users",
    icon: Users,
    color: "text-blue-600 dark:text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    key: "enrollments" as const,
    label: "Enrollments",
    icon: GraduationCap,
    color: "text-green-600 dark:text-green-500",
    bg: "bg-green-500/10",
  },
  {
    key: "courses" as const,
    label: "Courses",
    icon: BookOpen,
    color: "text-purple-600 dark:text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    key: "chapters" as const,
    label: "Chapters",
    icon: FileCode2,
    color: "text-orange-600 dark:text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    key: "problems" as const,
    label: "Problems",
    icon: MessageSquare,
    color: "text-cyan-600 dark:text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    key: "openTickets" as const,
    label: "Open Tickets",
    icon: AlertCircle,
    color: "text-red-600 dark:text-red-500",
    bg: "bg-red-500/10",
  },
];

export default function OverviewStats({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.key}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {item.label}
            </CardTitle>
            <div
              className={`w-8 h-8 rounded-lg ${item.bg} flex items-center justify-center`}
            >
              <item.icon className={`w-4 h-4 ${item.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats[item.key]}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
