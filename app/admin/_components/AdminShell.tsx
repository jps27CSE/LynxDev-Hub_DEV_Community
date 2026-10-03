"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import AdminSidebar from "./AdminSidebar";

type AdminShellProps = {
  children: React.ReactNode;
};

// Deliberately renders no greeting header. It used to sit above `children`,
// so the "Good afternoon, Admin" card showed on every admin tab — Feedback,
// Users and Site Notice included — where it was pure repetition. It now
// belongs to the Overview page it actually describes.
export default function AdminShell({ children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("adminSidebarCollapsed");
      if (saved === "true") setSidebarCollapsed(true);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const toggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("adminSidebarCollapsed", String(next));
      } catch {
        // Non-persisting sidebar is acceptable
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#05060a] overflow-x-hidden">
      <AdminSidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleCollapse}
        onClose={() => setSidebarOpen(false)}
      />

      <button
        onClick={() => setSidebarOpen((prev) => !prev)}
        className="lg:hidden fixed top-3 left-3 z-30 w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors bg-background/80 backdrop-blur border border-border/40"
        aria-label="Toggle sidebar"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div
        className={`transition-all duration-300 flex flex-col min-h-screen overflow-hidden ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <main className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
