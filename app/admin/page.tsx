import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getAdminOverview } from "@/lib/feedback-data";
import { getUserByClerkId } from "@/lib/enroll-data";
import AdminHeader from "./_components/AdminHeader";
import OverviewStats from "./_components/OverviewStats";
import QuickActions from "./_components/QuickActions";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description:
    "Platform overview — users, enrollments, courses, and feedback management.",
};

export default async function AdminPage() {
  const { userId } = await auth();
  const overview = await getAdminOverview();
  // userId is non-null in practice: the layout redirects before this renders.
  const adminName = userId
    ? ((await getUserByClerkId(userId))?.name ?? "Admin")
    : "Admin";

  return (
    <div className="space-y-6 sm:space-y-8 pt-6 sm:pt-8">
      <AdminHeader name={adminName} />
      <OverviewStats stats={overview} />
      <QuickActions openTickets={overview.openTickets} />
    </div>
  );
}
