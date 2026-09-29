import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { getUserByClerkId } from "@/lib/enroll-data";
import AdminShell from "./_components/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const admin = await isAdmin(userId);
  if (!admin) redirect("/");

  const user = await getUserByClerkId(userId);
  const adminName = user?.name ?? "Admin";

  return <AdminShell adminName={adminName}>{children}</AdminShell>;
}