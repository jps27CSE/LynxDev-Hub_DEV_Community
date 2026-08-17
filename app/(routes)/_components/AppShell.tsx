"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebarCollapsed");
      if (saved === "true") setSidebarCollapsed(true);
    } catch {
      // localStorage unavailable (private mode / storage disabled) — keep default
    }
  }, []);

  const toggleCollapse = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("sidebarCollapsed", String(next));
      } catch {
        // Non-persisting sidebar is acceptable when storage is blocked
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#05060a]">
      <Sidebar
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
        className={`transition-all duration-300 flex flex-col min-h-screen ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <main className="flex-1 flex flex-col">{children}</main>
      </div>
    </div>
  );
}
