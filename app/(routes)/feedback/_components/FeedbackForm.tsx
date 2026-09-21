"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Bug, Lightbulb, MessageSquare, HelpCircle } from "lucide-react";

const CATEGORIES = [
  { value: "bug", label: "Bug", icon: Bug, color: "text-red-500 bg-red-500/10 border-red-500/20", activeColor: "text-red-500 bg-red-500/20 border-red-500/40" },
  { value: "feature", label: "Feature", icon: Lightbulb, color: "text-amber-500 bg-amber-500/10 border-amber-500/20", activeColor: "text-amber-500 bg-amber-500/20 border-amber-500/40" },
  { value: "feedback", label: "Feedback", icon: MessageSquare, color: "text-blue-500 bg-blue-500/10 border-blue-500/20", activeColor: "text-blue-500 bg-blue-500/20 border-blue-500/40" },
  { value: "other", label: "Other", icon: HelpCircle, color: "text-muted-foreground bg-muted/50 border-border/50", activeColor: "text-foreground bg-muted border-border" },
] as const;

export default function FeedbackForm({
  onCreated,
}: {
  onCreated: () => void;
}) {
  const [category, setCategory] = useState("other");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (title.trim().length < 5) {
      toast.error("Title must be at least 5 characters");
      return;
    }
    if (message.trim().length < 10) {
      toast.error("Message must be at least 10 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, title: title.trim(), message: message.trim() }),
      });

      if (res.ok) {
        toast.success("Feedback submitted!");
        setTitle("");
        setMessage("");
        setCategory("other");
        onCreated();
      } else {
        const data = await res.json();
        toast.error(data.error ?? "Failed to submit feedback");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl sm:rounded-2xl border border-border/50 bg-card p-4 sm:p-5">
      <h2 className="text-sm font-semibold mb-4">Submit Feedback</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              const active = category === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    active ? c.activeColor : c.color
                  } hover:scale-[1.02] active:scale-[0.98]`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Title</label>
          <Input
            placeholder="Brief summary of your feedback"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            className="h-9"
          />
          <p className="text-[10px] text-muted-foreground text-right">
            {title.length}/120
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Message</label>
          <Textarea
            placeholder="Describe your feedback in detail..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            maxLength={5000}
            className="resize-none"
          />
          <p className="text-[10px] text-muted-foreground text-right">
            {message.length}/5000
          </p>
        </div>

        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
          ) : (
            <Send className="w-4 h-4 mr-1.5" />
          )}
          Submit Feedback
        </Button>
      </form>
    </div>
  );
}
