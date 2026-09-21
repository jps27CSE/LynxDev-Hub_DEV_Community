"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";
import type { FeedbackTicketWithUser } from "@/lib/feedback-data";

type Ticket = FeedbackTicketWithUser;

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed"] as const;

const STATUS_BADGE: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  in_progress:
    "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  resolved:
    "bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/30",
  closed: "bg-gray-500/15 text-gray-600 dark:text-gray-400 border-gray-500/30",
};

export default function FeedbackDetailDialog({
  ticket,
  open,
  onOpenChange,
  onSaved,
  onDeleted,
}: {
  ticket: Ticket;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (updated: Ticket) => void;
  onDeleted: (id: number) => void;
}) {
  const [status, setStatus] = useState(ticket.status ?? "open");
  const [adminNotes, setAdminNotes] = useState(ticket.admin_notes ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/feedback/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (res.ok) {
        const updated = await res.json();
        onSaved({ ...ticket, ...updated });
        onOpenChange(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/feedback/${ticket.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        onDeleted(ticket.id);
        onOpenChange(false);
      }
    } finally {
      setDeleting(false);
    }
  }

  const canDelete = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-left">{ticket.title}</DialogTitle>
          <DialogDescription className="text-left">
            {ticket.authorName} ({ticket.authorEmail}) &middot;{" "}
            {new Date(ticket.created_at ?? Date.now()).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {ticket.message}
          </p>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Category:</span>
            <Badge variant="secondary">{ticket.category}</Badge>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${STATUS_BADGE[s]?.split(" ")[0]}`}
                    />
                    {s.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Admin Notes</label>
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Internal notes about this ticket..."
              rows={3}
              maxLength={2000}
            />
          </div>
        </div>

        <DialogFooter className="flex flex-row justify-between sm:flex-row">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting || !canDelete}
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-1" />
            ) : null}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
