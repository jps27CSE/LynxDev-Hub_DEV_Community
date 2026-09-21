import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMyFeedback, clampPage } from "@/lib/feedback-data";
import { getDbUserIdByClerkId } from "@/lib/user-lookup";
import FeedbackContent from "./_components/FeedbackContent";

export const metadata: Metadata = {
  title: "My Feedback",
  description: "Submit feedback and track your tickets.",
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
      <div>
        <h1 className="text-2xl font-bold">My Feedback</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Submit feedback and track your tickets
        </p>
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
