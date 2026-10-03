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
    <div className="pointer-events-none fixed inset-x-0 top-16 z-40 p-3 sm:p-4 lg:top-0">
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
