import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import AdminSidebar from "./_components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const admin = await isAdmin(userId);
  if (!admin) redirect("/");

  return (
    <div className="min-h-screen bg-[#05060a]">
      <AdminSidebar />
      <div className="ml-64">
        <main className="min-h-screen p-6">{children}</main>
      </div>
    </div>
  );
}
