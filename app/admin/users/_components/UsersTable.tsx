"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminUserRow, AdminUsersSort } from "@/lib/admin-users";
import { ADMIN_USERS_PAGE_SIZE, ADMIN_USERS_SORTS } from "@/lib/admin-users-constants";
import UserDetailDialog from "./UserDetailDialog";

type UsersTableProps = {
  data: AdminUserRow[];
  total: number;
  hasMore: boolean;
  currentQ: string;
  currentSort: AdminUsersSort;
  currentPage: number;
  currentSubscription?: string;
};

const SEARCH_DEBOUNCE_MS = 300;

export default function UsersTable({
  data,
  total,
  hasMore,
  currentQ,
  currentSort,
  currentPage,
  currentSubscription,
}: UsersTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchInput, setSearchInput] = useState(currentQ);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Keep input in sync when navigating via back/forward or sort change
  useEffect(() => {
    setSearchInput(currentQ);
  }, [currentQ]);

  const buildUsersHref = useCallback(
    (overrides: Partial<{ q: string; sort: AdminUsersSort; page: number; subscription: string }>) => {
      const q = overrides.q !== undefined ? overrides.q : currentQ;
      const sort = overrides.sort !== undefined ? overrides.sort : currentSort;
      const page = overrides.page !== undefined ? overrides.page : currentPage;
      const subscription =
        overrides.subscription !== undefined ? overrides.subscription : currentSubscription;
      const sp = new URLSearchParams();
      if (q) sp.set("q", q);
      if (sort !== "newest") sp.set("sort", sort);
      if (subscription) sp.set("subscription", subscription);
      if (page > 1) sp.set("page", String(page));
      const qs = sp.toString();
      return qs ? `/admin/users?${qs}` : "/admin/users";
    },
    [currentQ, currentSort, currentPage, currentSubscription],
  );

  const pushUsersHref = useCallback(
    (href: string) => {
      startTransition(() => {
        router.push(href);
      });
    },
    [router],
  );

  // Debounced sync of search input → URL (skip 1-char to avoid URL lie vs server q>=2)
  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === currentQ) return;
    if (trimmed.length === 1) return;
    const timer = setTimeout(() => {
      pushUsersHref(buildUsersHref({ q: trimmed, page: 1 }));
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput, currentQ, buildUsersHref, pushUsersHref]);

  function onSortChange(v: string) {
    if (!ADMIN_USERS_SORTS.includes(v as AdminUsersSort)) return;
    pushUsersHref(buildUsersHref({ sort: v as AdminUsersSort, page: 1 }));
  }

  return (
    <div className="space-y-4">
      {/* Controls: debounced search + sort select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8"
            aria-label="Search users"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
          <Select value={currentSort} onValueChange={onSortChange}>
            <SelectTrigger className="w-[140px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ADMIN_USERS_SORTS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "newest" ? "Newest" : s === "points" ? "Points" : "Name A-Z"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table — reuses server-fetched data, refetches on URL change */}
      <div className={`rounded-lg border bg-card overflow-hidden ${isPending ? "opacity-60 pointer-events-none" : ""}`}>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Points</TableHead>
                <TableHead className="text-center">Enrollments</TableHead>
                <TableHead className="text-center">Feedback</TableHead>
                <TableHead>Subscription</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    {currentQ ? `No users matching "${currentQ}".` : "No users found."}
                  </TableCell>
                </TableRow>
              ) : (
                data.map((u) => (
                  <TableRow
                    key={u.id}
                    className="hover:bg-muted/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    tabIndex={0}
                    role="button"
                    aria-label={`View ${u.name}`}
                    onClick={() => {
                      setSelectedUserId(u.id);
                      setDialogOpen(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedUserId(u.id);
                        setDialogOpen(true);
                      }
                    }}
                  >
                    <TableCell className="font-medium max-w-[180px] truncate">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[220px] truncate text-xs sm:text-sm">
                      {u.email}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">{u.points ?? 0}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="font-mono">
                        {u.enrollmentsCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="font-mono">
                        {u.feedbackCount}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.subscription ? (
                        <Badge variant="secondary" className="text-xs">
                          {u.subscription}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} total {total === 1 ? "user" : "users"}
          {total > ADMIN_USERS_PAGE_SIZE && !hasMore && data.length < total
            ? ` · showing ${data.length} on this page`
            : ""}
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1 || isPending}
            onClick={() => pushUsersHref(buildUsersHref({ page: currentPage - 1 }))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[70px] text-center">
            Page {currentPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!hasMore || isPending}
            onClick={() => pushUsersHref(buildUsersHref({ page: currentPage + 1 }))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <UserDetailDialog
        userId={selectedUserId}
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setSelectedUserId(null);
        }}
      />
    </div>
  );
}
