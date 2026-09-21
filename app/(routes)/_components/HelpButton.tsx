"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, MessageSquare, X } from "lucide-react";

export default function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 w-56 rounded-xl border border-border/50 bg-[#07090e] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="px-4 py-3 border-b border-border/50">
            <p className="text-sm font-semibold">Need help?</p>
          </div>
          <div className="p-2">
            <Link
              href="/feedback"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Submit Feedback
            </Link>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen((prev) => !prev)}
        className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all"
        aria-label="Help"
      >
        {open ? (
          <X className="w-4 h-4" />
        ) : (
          <HelpCircle className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}
