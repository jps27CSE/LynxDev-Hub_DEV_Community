"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

const adminLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed top-0 left-0 z-50 h-full w-64 bg-[#07090e] border-r border-border/50 flex flex-col">
      <div className="flex items-center h-16 px-4 border-b border-border/50 shrink-0">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-red-500" />
          </div>
          <span className="font-bold text-base">Admin Panel</span>
        </Link>
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {adminLinks.map((link) => {
          const Icon = link.icon;
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/50 py-3 px-2 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <ArrowLeft className="w-5 h-5 shrink-0" />
          <span>Back to App</span>
        </Link>

        <SignOutButton>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
            <span>Sign Out</span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
