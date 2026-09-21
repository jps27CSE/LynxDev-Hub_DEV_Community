"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { FeedbackTicket } from "@/lib/feedback-data";
import FeedbackForm from "./FeedbackForm";
import MyTicketsList from "./MyTicketsList";

export default function FeedbackContent({
  initialData,
  total,
  hasMore,
  currentPage,
}: {
  initialData: FeedbackTicket[];
  total: number;
  hasMore: boolean;
  currentPage: number;
}) {
  const router = useRouter();
  const [key, setKey] = useState(0);

  const refresh = useCallback(() => {
    router.refresh();
    setKey((k) => k + 1);
  }, [router]);

  function handlePageChange(page: number) {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", String(page));
    router.push(`/feedback?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <FeedbackForm onCreated={refresh} />
      <MyTicketsList
        key={key}
        data={initialData}
        total={total}
        hasMore={hasMore}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
