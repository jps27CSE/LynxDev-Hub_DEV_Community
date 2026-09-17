import type { Metadata } from "next";
import { getAllFeedback, clampPage } from "@/lib/feedback-data";
import FeedbackTable from "./_components/FeedbackTable";

export const metadata: Metadata = {
  title: "Manage Feedback — Admin",
  description: "View and manage user feedback tickets.",
};

export default async function AdminFeedbackPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "";
  const q = params.q ?? "";
  const rawPage = params.page;
  const page =
    rawPage !== undefined && /^\d+$/.test(rawPage)
      ? parseInt(rawPage, 10)
      : 1;

  const { data, total, hasMore } = await getAllFeedback({
    status: status || undefined,
    q: q || undefined,
    page: clampPage(page),
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Feedback Tickets</h1>
        <p className="text-muted-foreground text-sm mt-1">
          View and manage user feedback
        </p>
      </div>
      <FeedbackTable
        initialData={data}
        total={total}
        hasMore={hasMore}
        currentStatus={status}
        currentPage={clampPage(page)}
        currentQ={q}
      />
    </div>
  );
}
