"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  LogOut,
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
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <ShieldCheck className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-none">
              Admin Panel
            </span>
            <span className="text-[10px] text-muted-foreground">
              LynxDEV
            </span>
          </div>
        </Link>
      </div>

      <div className="px-3 py-4">
        <div className="px-2 mb-2">
          <p className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
            Management
          </p>
        </div>
        <nav className="space-y-0.5">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-red-500/10 text-red-500"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-border/50 py-3 px-3 space-y-0.5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Back to App</span>
        </Link>

        <SignOutButton>
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
