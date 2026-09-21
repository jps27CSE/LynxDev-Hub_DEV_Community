import { auth } from "@clerk/nextjs/server";
import AppShell from "./_components/AppShell";
import AdminLink from "./_components/AdminLink";
import { isAdmin } from "@/lib/admin-auth";

export default async function RoutesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const admin = userId ? await isAdmin(userId) : false;

  return (
    <AppShell
      adminLink={admin ? <AdminLink /> : undefined}
    >
      {children}
    </AppShell>
  );
}
