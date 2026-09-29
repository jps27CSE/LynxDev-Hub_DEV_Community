import type { Metadata } from "next";
import { getAllFeedback, clampPage } from "@/lib/feedback-data";
import { getUserByClerkId } from "@/lib/enroll-data";
import { auth } from "@clerk/nextjs/server";
import FeedbackTable from "./_components/FeedbackTable";
import AdminPageWrapper from "../_components/AdminPageWrapper";

export const metadata: Metadata = {
  title: "Manage Feedback",
  description: "View, respond to, and manage user feedback tickets on LynxDEV.",
};

async function getAdminName(): Promise<string> {
  const { userId } = await auth();
  if (!userId) return "Admin";
  const user = await getUserByClerkId(userId);
  return user?.name ?? "Admin";
}

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

  const adminName = await getAdminName();

  const { data, total, hasMore } = await getAllFeedback({
    status: status || undefined,
    q: q || undefined,
    page: clampPage(page),
  });

  return (
    <AdminPageWrapper
      title="Feedback Tickets"
      description="View and manage user feedback"
    >
      <FeedbackTable
        initialData={data}
        total={total}
        hasMore={hasMore}
        currentStatus={status}
        currentPage={clampPage(page)}
        currentQ={q}
      />
    </AdminPageWrapper>
  );
}