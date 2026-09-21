import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getAdminOverview } from "@/lib/feedback-data";
import { getUserByClerkId } from "@/lib/enroll-data";
import OverviewStats from "./_components/OverviewStats";
import QuickActions from "./_components/QuickActions";
import AdminHeader from "./_components/AdminHeader";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description:
    "Platform overview — users, enrollments, courses, and feedback management.",
};

export default async function AdminPage() {
  const { userId } = await auth();
  const [overview, user] = await Promise.all([
    getAdminOverview(),
    userId ? getUserByClerkId(userId) : null,
  ]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <AdminHeader name={user?.name ?? "Admin"} />
      <OverviewStats stats={overview} />
      <QuickActions openTickets={overview.openTickets} />
    </div>
  );
}
