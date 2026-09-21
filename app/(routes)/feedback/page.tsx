import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMyFeedback, clampPage } from "@/lib/feedback-data";
import { getDbUserIdByClerkId } from "@/lib/user-lookup";
import { MessageSquare, Plus } from "lucide-react";
import FeedbackContent from "./_components/FeedbackContent";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Submit feedback, report bugs, or request features on the LynxDEV platform.",
};

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const params = await searchParams;
  const rawPage = params.page;
  const page =
    rawPage !== undefined && /^\d+$/.test(rawPage)
      ? parseInt(rawPage, 10)
      : 1;

  const dbUserId = await getDbUserIdByClerkId(userId);
  if (!dbUserId) redirect("/");

  const { data, total, hasMore } = await getMyFeedback(dbUserId, clampPage(page));

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
      <div className="relative w-full rounded-xl sm:rounded-2xl border border-border/50 bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 sm:p-6 lg:p-8 overflow-hidden">
        <div className="absolute inset-0 bg-grid-paper pointer-events-none" />
        <div className="relative">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border/50 bg-muted/50 text-[10px] text-muted-foreground mb-3">
            <MessageSquare className="w-3 h-3" />
            <span>Support</span>
          </div>
          <h1 className="text-lg sm:text-2xl lg:text-3xl font-display font-bold tracking-tight leading-snug sm:leading-tight">
            Feedback &{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">
              Support
            </span>
          </h1>
          <p className="mt-1.5 sm:mt-2 text-[11px] sm:text-sm text-muted-foreground leading-relaxed">
            Report bugs, request features, or share general feedback with the team.
          </p>
          <div className="flex items-center gap-4 mt-3 sm:mt-4">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground">
              <Plus className="w-3.5 h-3.5" />
              <span>{total} {total === 1 ? "ticket" : "tickets"} submitted</span>
            </div>
          </div>
        </div>
      </div>
      <FeedbackContent
        initialData={data}
        total={total}
        hasMore={hasMore}
        currentPage={clampPage(page)}
      />
    </div>
  );
}
