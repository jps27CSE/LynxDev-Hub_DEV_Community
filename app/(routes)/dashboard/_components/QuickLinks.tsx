import { MessageSquare, BookOpen, Brain, Terminal, Sparkles, User } from "lucide-react";
import Link from "next/link";

const links = [
  {
    title: "Community",
    description: "Ask questions, share knowledge",
    icon: MessageSquare,
    href: "/community",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "AI Mentor",
    description: "Get coding help & guidance",
    icon: Brain,
    href: "/mentor",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Notes",
    description: "Save code snippets & ideas",
    icon: BookOpen,
    href: "/notes",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Interview",
    description: "Practice interview questions",
    icon: Sparkles,
    href: "/interview",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    title: "Problems",
    description: "Solve DSA challenges",
    icon: Terminal,
    href: "/problems",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    title: "Profile",
    description: "Edit your name, bio & skills",
    icon: User,
    href: "/profile",
    color: "text-foreground",
    bg: "bg-muted",
  },
];

function QuickLinks() {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="font-semibold text-sm mb-4">Quick Actions</h3>
      <div className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent transition-colors group"
            >
              <div
                className={`w-9 h-9 rounded-lg ${link.bg} flex items-center justify-center`}
              >
                <Icon className={`w-4 h-4 ${link.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{link.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {link.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default QuickLinks;
