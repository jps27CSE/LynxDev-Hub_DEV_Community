"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import HelpButton from "./HelpButton";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  /**
   * The build-task workspace fills the viewport with resizable panels, so the
   * fixed help button (bottom-right, 40px) lands on top of the right rail and
   * hides the last columns of the results table. It is the only surface with
   * no free corner, so it opts out instead of padding content out from under it.
   */
  const isFullViewportWorkspace = /\/system-design\/[^/]+\/task(?:\/|$)/.test(
    pathname ?? "",
  );

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
    <div className="min-h-screen bg-[#05060a] overflow-x-hidden">
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
        className={`transition-all duration-300 flex flex-col min-h-screen overflow-hidden ${
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        }`}
      >
        <main className="flex-1 flex flex-col min-w-0 w-full overflow-hidden">
          {children}
        </main>
      </div>

      {!isFullViewportWorkspace && <HelpButton />}
    </div>
  );
}
