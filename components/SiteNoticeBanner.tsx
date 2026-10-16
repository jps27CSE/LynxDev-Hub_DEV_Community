"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Info, TriangleAlert, OctagonAlert, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ActiveSiteNotice } from "@/lib/site-notice";
import type { SiteNoticeSeverity } from "@/config/site-notice";

const STORAGE_KEY = "lynxdev_site_notice_ack";

/**
 * Top-anchored chrome the banner has to sit below: the sticky public header
 * and the mobile sidebar toggle. Measured instead of hardcoded, because the
 * correct offset is route-dependent — home and /blog have a 65px header,
 * (auth) has none, and the toggle only exists below `lg`. A magic number here
 * silently reintroduces the overlap that `lg:top-0` caused on the header pages.
 */
const CHROME_SELECTORS = [
  "header[data-site-header]",
  'button[aria-label="Toggle sidebar"]',
];

function measureTopChrome(): number {
  let bottom = 0;

  for (const selector of CHROME_SELECTORS) {
    for (const el of document.querySelectorAll(selector)) {
      const { height, bottom: edge } = el.getBoundingClientRect();
      // Chrome hidden by `display:none` (the toggle from `lg` up) reports a
      // zero rect and must not contribute an offset.
      if (height === 0) continue;
      bottom = Math.max(bottom, edge);
    }
  }

  return bottom;
}

function useTopChromeOffset(pathname: string): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const update = () => setOffset(measureTopChrome());
    update();

    // Re-measure on resize: chrome can cross a breakpoint or swap fonts, and a
    // mount-time value would then be stale. ResizeObserver covers a height
    // change, the listener covers a breakpoint crossing that reveals or hides
    // an element outright.
    const observer = new ResizeObserver(update);
    for (const selector of CHROME_SELECTORS) {
      document.querySelectorAll(selector).forEach((el) => observer.observe(el));
    }
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return offset;
}

const severityConfig = {
  info: {
    Icon: Info,
    accent: "text-blue-500",
    surface: "border-blue-500/30 bg-blue-500/10",
  },
  warning: {
    Icon: TriangleAlert,
    accent: "text-amber-500",
    surface: "border-amber-500/30 bg-amber-500/10",
  },
  critical: {
    Icon: OctagonAlert,
    accent: "text-destructive",
    surface: "border-destructive/30 bg-destructive/10",
  },
} satisfies Record<
  SiteNoticeSeverity,
  { Icon: LucideIcon; accent: string; surface: string }
>;

function readAcked(version: string): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === version;
  } catch {
    return false;
  }
}

export function SiteNoticeBanner({
  notice,
}: {
  notice: ActiveSiteNotice | null;
}) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const version = notice?.version;
  const topChromeOffset = useTopChromeOffset(pathname);

  useEffect(() => {
    if (!version) return;
    setVisible(!readAcked(version));
    setReady(true);
  }, [version]);

  const dismiss = () => {
    if (!version) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, version);
    } catch {
      /* storage unavailable (private mode) — dismiss for this render only */
    }
    setVisible(false);
  };

  if (!notice || !ready || !visible) return null;
  if (pathname.startsWith("/admin")) return null;

  const { Icon, accent, surface } = severityConfig[notice.severity];

  if (notice.display === "modal") {
    return (
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) dismiss();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon
                className={cn("size-5 shrink-0", accent)}
                aria-hidden="true"
              />
              {notice.title}
            </DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {notice.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={dismiss}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 p-3 sm:p-4"
      style={{ top: topChromeOffset }}
    >
      <div
        role="status"
        className={cn(
          "pointer-events-auto mx-auto flex max-w-3xl items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur-sm",
          surface,
        )}
      >
        <Icon
          className={cn("mt-0.5 size-4 shrink-0", accent)}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{notice.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground whitespace-pre-line">
            {notice.message}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={dismiss}
          aria-label="Dismiss notice"
          className="-mt-1 -mr-2 shrink-0"
        >
          <X />
        </Button>
      </div>
    </div>
  );
}
