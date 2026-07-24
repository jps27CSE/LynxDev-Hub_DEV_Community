"use client";

import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

type TopNavProps = {
  onToggleSidebar: () => void;
};

export default function TopNav({ onToggleSidebar }: TopNavProps) {
  return (
    <header className="sticky top-0 z-30 w-full h-16 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">L</span>
            </div>
            <span className="font-bold text-sm">LynxDev</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
