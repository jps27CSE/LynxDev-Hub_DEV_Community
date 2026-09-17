"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { FeedbackTicketWithUser } from "@/lib/feedback-data";
import FeedbackDetailDialog from "./FeedbackDetailDialog";

type Ticket = FeedbackTicketWithUser;

const STATUS_BADGE: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  in_progress:
    "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  resolved:
    "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  closed: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30",
};

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
] as const;

export default function FeedbackTable({
  initialData,
  total,
  hasMore,
  currentStatus,
  currentPage,
  currentQ,
}: {
  initialData: Ticket[];
  total: number;
  hasMore: boolean;
  currentStatus: string;
  currentPage: number;
  currentQ: string;
}) {
  const router = useRouter();
  const [searchParams] = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [data, setData] = useState<Ticket[]>(initialData);
  const [searchInput, setSearchInput] = useState(currentQ);

  function updateParams(status?: string, page?: number, q?: string) {
    const params = new URLSearchParams();
    const s = status ?? currentStatus;
    const p = page ?? currentPage;
    const search = q ?? currentQ;
    if (s && s !== "all") params.set("status", s);
    if (p > 1) params.set("page", String(p));
    if (search) params.set("q", search);
    startTransition(() => {
      router.push(`/admin/feedback?${params.toString()}`);
    });
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    updateParams(currentStatus, 1, searchInput);
  }

  function handleSaved(updated: Ticket) {
    setData((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleDeleted(id: number) {
    setData((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          value={currentStatus}
          onValueChange={(v) => updateParams(v, 1)}
        >
          <TabsList>
            {STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Input
            placeholder="Search tickets..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-64"
          />
          <Button type="submit" variant="outline" size="icon">
            <Search className="w-4 h-4" />
          </Button>
        </form>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  No tickets found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">
                    {ticket.title}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {ticket.authorName}
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
                    {new Date(ticket.created_at ?? Date.now()).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} total {total === 1 ? "ticket" : "tickets"}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1 || isPending}
            onClick={() => updateParams(currentStatus, currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore || isPending}
            onClick={() => updateParams(currentStatus, currentPage + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {selectedTicket && (
        <FeedbackDetailDialog
          ticket={selectedTicket}
          open={!!selectedTicket}
          onOpenChange={(open) => !open && setSelectedTicket(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
