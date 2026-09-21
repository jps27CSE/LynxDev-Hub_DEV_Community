import type { Metadata } from "next";
import { getAdminOverview } from "@/lib/feedback-data";
import OverviewStats from "./_components/OverviewStats";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Platform overview and management.",
};

export default async function AdminPage() {
  const overview = await getAdminOverview();

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Platform overview and management
        </p>
      </div>
      <OverviewStats stats={overview} />
    </div>
  );
}
