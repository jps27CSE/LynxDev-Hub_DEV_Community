import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { isAdmin } from "@/lib/admin-auth";

export default async function AdminLink() {
  const { userId } = await auth();
  if (!userId) return null;

  const admin = await isAdmin(userId);
  if (!admin) return null;

  return (
    <Link
      href="/admin"
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-accent"
    >
      <ShieldCheck className="w-5 h-5 shrink-0" />
      <span>Admin</span>
    </Link>
  );
}
