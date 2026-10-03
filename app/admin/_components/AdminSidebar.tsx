"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  ArrowLeft,
  ShieldCheck,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Megaphone,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";

const adminLinks = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Feedback", href: "/admin/feedback", icon: MessageSquare },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Site Notice", href: "/admin/site-notice", icon: Megaphone },
];

type AdminSidebarProps = {
  open: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
};

export default function AdminSidebar({
  open,
  collapsed,
  onToggleCollapse,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-[#07090e] border-r border-border/50 transition-all duration-300 flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${collapsed ? "lg:w-16" : "w-64"}`}
      >
        <div className="flex items-center h-16 px-4 border-b border-border/50 shrink-0">
          {collapsed ? (
            <Link href="/admin" className="mx-auto" onClick={onClose}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                <ShieldCheck className="w-4.5 h-4.5 text-white" />
              </div>
            </Link>
          ) : (
            <Link
              href="/admin"
              className="flex items-center gap-2.5"
              onClick={onClose}
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-sm block leading-none">Admin Panel</span>
                <span className="text-[10px] text-muted-foreground">LynxDEV</span>
              </div>
            </Link>
          )}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {adminLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-red-500/10 text-red-500"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? link.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50 py-3 px-2 space-y-1">
          <Link
            href="/dashboard"
            onClick={onClose}
            className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all ${
              collapsed ? "justify-center px-0" : ""
            }`}
            title={collapsed ? "Back to App" : undefined}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            {!collapsed && <span>Back to App</span>}
          </Link>

          <SignOutButton>
            <button
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all ${
                collapsed ? "justify-center px-0" : ""
              }`}
              title={collapsed ? "Sign Out" : undefined}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </SignOutButton>
        </div>

        {/* Collapse/Expand toggle button - bottom of sidebar, desktop only */}
        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center h-10 border-t border-border/50 text-muted-foreground hover:text-foreground transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </aside>
    </>
  );
}