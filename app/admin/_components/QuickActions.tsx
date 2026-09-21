import Link from "next/link";
import {
  MessageSquare,
  BarChart3,
  Settings,
  ExternalLink,
} from "lucide-react";

export default function QuickActions({ openTickets }: { openTickets: number }) {
  const actions = [
    {
      label: "Manage Feedback",
      description:
        openTickets > 0
          ? `${openTickets} open ticket${openTickets === 1 ? "" : "s"} awaiting review`
          : "View and respond to user feedback",
      icon: MessageSquare,
      href: "/admin/feedback",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      ring: "ring-blue-500/20",
    },
    {
      label: "View Analytics",
      description: "Platform usage and engagement metrics",
      icon: BarChart3,
      href: "/admin",
      color: "text-violet-500",
      bg: "bg-violet-500/10",
      ring: "ring-violet-500/20",
      disabled: true,
    },
    {
      label: "Settings",
      description: "Admin configuration and preferences",
      icon: Settings,
      href: "/admin",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      ring: "ring-amber-500/20",
      disabled: true,
    },
  ];

  return (
    <div>
      <h2 className="text-sm font-semibold text-muted-foreground mb-3">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const card = (
            <div
              className={`group relative overflow-hidden rounded-xl sm:rounded-2xl border border-border/50 bg-card p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-border hover:shadow-lg ${
                action.disabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${action.bg} ring-1 ${action.ring} flex items-center justify-center shrink-0`}
                >
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${action.color}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold">{action.label}</p>
                    {!action.disabled && (
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            </div>
          );

          if (action.disabled) return <div key={action.label}>{card}</div>;
          return (
            <Link key={action.label} href={action.href}>
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
