"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { FeedbackTicket } from "@/lib/feedback-data";

const STATUS_BADGE: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  in_progress:
    "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  resolved:
    "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  closed: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30",
};

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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Inbox className="w-12 h-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium">No tickets yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Submit your first feedback above
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium max-w-[200px] truncate">
                  {ticket.title}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{ticket.category}</Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={STATUS_BADGE[ticket.status ?? "open"] ?? ""}
                    variant="outline"
                  >
                    {(ticket.status ?? "open").replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {ticket.created_at
                    ? new Date(ticket.created_at).toLocaleDateString()
                    : "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} {total === 1 ? "ticket" : "tickets"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
