"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Terminal,
  Brain,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { VersionBadge } from "@/components/VersionBadge";

const links = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Courses", href: "/courses", icon: BookOpen },
  { label: "Interview", href: "/interview", icon: Sparkles },
  { label: "Problems", href: "/problems", icon: Terminal },
];

type SidebarProps = {
  open: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
};

export default function Sidebar({
  open,
  collapsed,
  onToggleCollapse,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-card border-r border-border/50 transition-all duration-300 flex flex-col ${
          open ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 ${collapsed ? "w-16" : "w-64"}`}
      >
        <div className="flex items-center h-16 px-4 border-b border-border/50 shrink-0">
          {collapsed ? (
            <Link href="/dashboard" className="mx-auto" onClick={onClose}>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">L</span>
              </div>
            </Link>
          ) : (
            <Link
              href="/dashboard"
              className="flex items-center gap-2"
              onClick={onClose}
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">L</span>
              </div>
              <span className="font-bold text-base">LynxDev</span>
            </Link>
          )}
        </div>

        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                } ${collapsed ? "justify-center px-0" : ""}`}
                title={collapsed ? link.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border/50 py-3 px-2 space-y-1">
          <Link
            href="/profile"
            onClick={onClose}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              pathname === "/profile"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            } ${collapsed ? "justify-center px-0" : ""}`}
            title={collapsed ? "Profile" : undefined}
          >
            <User className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Profile</span>}
          </Link>

          <SignOutButton>
            <button
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all ${
                collapsed ? "justify-center px-0" : ""
              }`}
              title={collapsed ? "Sign Out" : undefined}
            >
              <LogOut className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Sign Out</span>}
            </button>
          </SignOutButton>
        </div>

        {!collapsed && (
          <div className="flex items-center justify-center py-2 border-t border-border/50">
            <VersionBadge />
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="hidden lg:flex items-center justify-center h-10 border-t border-border/50 text-muted-foreground hover:text-foreground transition-colors"
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
