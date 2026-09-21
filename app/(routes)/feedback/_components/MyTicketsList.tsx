"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Inbox, Clock, MessageSquare } from "lucide-react";
import type { FeedbackTicket } from "@/lib/feedback-data";

const STATUS_CONFIG: Record<
  string,
  { label: string; class: string; dot: string }
> = {
  open: {
    label: "Open",
    class: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    dot: "bg-blue-500",
  },
  in_progress: {
    label: "In Progress",
    class: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    dot: "bg-amber-500",
  },
  resolved: {
    label: "Resolved",
    class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed",
    class: "bg-muted text-muted-foreground border-border/50",
    dot: "bg-muted-foreground",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  bug: "Bug",
  feature: "Feature",
  feedback: "Feedback",
  other: "Other",
};

function timeAgo(date: Date | null): string {
  if (!date) return "—";
  const now = new Date();
  const d = new Date(date);
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default function MyTicketsList({
  data,
  total,
  hasMore,
  currentPage,
  onPageChange,
}: {
  data: FeedbackTicket[];
  total: number;
  hasMore: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
}) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl sm:rounded-2xl border border-border/50 bg-card p-8 sm:p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <Inbox className="w-7 h-7 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold">No tickets yet</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">
            Submit your first feedback using the form above
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Your Tickets</h2>
        <p className="text-xs text-muted-foreground">
          {total} {total === 1 ? "ticket" : "tickets"}
        </p>
      </div>

      <div className="space-y-2">
        {data.map((ticket) => {
          const status = STATUS_CONFIG[ticket.status ?? "open"] ?? STATUS_CONFIG.open;
          return (
            <div
              key={ticket.id}
              className="group rounded-xl border border-border/50 bg-card p-4 transition-all hover:border-border hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-sm font-medium truncate">
                      {ticket.title}
                    </h3>
                    <Badge
                      className={`${status.class} border shrink-0 text-[10px] px-1.5 py-0`}
                      variant="outline"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${status.dot} mr-1`} />
                      {status.label}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {ticket.message}
                  </p>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {CATEGORY_LABELS[ticket.category ?? "other"] ?? "Other"}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {timeAgo(ticket.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-muted-foreground">
          Page {currentPage}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="h-8 px-2"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore}
            onClick={() => onPageChange(currentPage + 1)}
            className="h-8 px-2"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
