"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { User as UserIcon } from "lucide-react";
import type { AdminUserDetail } from "@/lib/admin-users";

const DIALOG_MAX_W = "sm:max-w-[520px]";
const MAX_SKILLS_SHOWN = 12;

type UserDetailDialogProps = {
  userId: number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function parseSkills(skills: unknown): string[] {
  if (!Array.isArray(skills)) return [];
  return (skills as unknown[]).filter((s): s is string => typeof s === "string" && s.trim().length > 0);
}

export default function UserDetailDialog({ userId, open, onOpenChange }: UserDetailDialogProps) {
  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState("enrollments");

  const fetchUser = useCallback(async (id: number, signal: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { signal });
      if (!res.ok) {
        const body = await res.json().catch(() => ({} as Record<string, unknown>));
        const msg =
          typeof body.error === "string" ? body.error : `Failed ${res.status}`;
        throw new Error(msg);
      }
      const data = (await res.json()) as AdminUserDetail;
      if (!signal.aborted) setUser(data);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      if (!signal.aborted) setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      if (!signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!open || userId === null) return;
    const controller = new AbortController();
    setDetailTab("enrollments");
    // Keep stale user until new loads (avoid flash) — only clear on first open or id change after abort
    // Do not null user here; fetch will overwrite on success
    setError(null);
    setLoading(true);
    fetchUser(userId, controller.signal);
    return () => controller.abort();
  }, [open, userId, fetchUser]);

  // Reset state on close to avoid stale data leaking to next open
  useEffect(() => {
    if (!open) {
      setError(null);
      setLoading(false);
      // delay clearing user to allow exit animation
      const t = setTimeout(() => setUser(null), 150);
      setDetailTab("enrollments");
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleRetry = () => {
    if (userId === null) return;
    const controller = new AbortController();
    fetchUser(userId, controller.signal);
  };

  const skills = parseSkills(user?.skills).slice(0, MAX_SKILLS_SHOWN);
  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("")
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={DIALOG_MAX_W}>
        <DialogHeader>
          <DialogTitle className="text-left flex items-center gap-2.5">
            {loading && !user ? (
              <Skeleton className="h-5 w-32" />
            ) : user ? (
              <>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground text-xs font-medium shrink-0 overflow-hidden">
                  {initials ? initials : <UserIcon className="w-4 h-4" />}
                </span>
                <span className="truncate">{user.name}</span>
              </>
            ) : (
              "User"
            )}
          </DialogTitle>
          <DialogDescription className="text-left">
            {loading && !user ? (
              <Skeleton className="h-4 w-48" />
            ) : error ? (
              <span className="text-destructive">{error}</span>
            ) : user ? (
              <span className="truncate">{user.email}</span>
            ) : (
              "View user details"
            )}
          </DialogDescription>
        </DialogHeader>

        {loading && !user ? (
          <div className="space-y-3 py-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <div className="py-4 space-y-3">
            <p className="text-sm text-muted-foreground">Unable to load user. Please retry.</p>
            <Button size="sm" variant="outline" onClick={handleRetry}>
              Try again
            </Button>
          </div>
        ) : user ? (
          <div className="space-y-4">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="font-mono">
                  {user.points ?? 0} pts
                </Badge>
                <Badge variant="outline" className="font-mono">
                  {user.enrollmentsCount} enrollments
                </Badge>
                <Badge variant="outline" className="font-mono">
                  {user.feedbackCount} feedback
                </Badge>
                {user.subscription ? (
                  <Badge className="text-xs">{user.subscription}</Badge>
                ) : (
                  <span className="text-xs text-muted-foreground">no subscription</span>
                )}
              </div>
              {user.bio && (
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{user.bio}</p>
              )}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">ID: {user.id}</p>
            </div>

            {/* Tabs — lazy content, no extra fetches in v1 */}
            <Tabs value={detailTab} onValueChange={setDetailTab}>
              <TabsList className="w-full">
                <TabsTrigger value="enrollments" className="flex-1">
                  Enrollments
                </TabsTrigger>
                <TabsTrigger value="feedback" className="flex-1">
                  Feedback
                </TabsTrigger>
              </TabsList>
              <TabsContent value="enrollments" className="pt-3">
                <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
                  <p className="text-sm font-medium">Enrollments · {user.enrollmentsCount}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.enrollmentsCount === 0
                      ? "No enrollments yet."
                      : `${user.enrollmentsCount} course${user.enrollmentsCount === 1 ? "" : "s"} enrolled. Detailed list with progress bar lands when admin enrollments API is added.`}
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="feedback" className="pt-3">
                <div className="rounded-lg border bg-muted/20 p-4 space-y-2">
                  <p className="text-sm font-medium">Feedback · {user.feedbackCount}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.feedbackCount === 0
                      ? "No feedback tickets submitted."
                      : `${user.feedbackCount} ticket${user.feedbackCount === 1 ? "" : "s"} submitted. Full list via feedback_user_idx in future.`}
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-4">No user selected.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
