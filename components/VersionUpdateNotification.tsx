"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { APP_VERSION, APP_NAME } from "@/lib/app-version";

const LS_KEY = "lynxdev_app_version";

export function VersionUpdateNotification() {
  useEffect(() => {
    const prev = localStorage.getItem(LS_KEY);
    if (prev && prev !== APP_VERSION) {
      toast.success(`${APP_NAME} updated to v${APP_VERSION}`, {
        description: prev
          ? `Updated from v${prev} — check out what's new!`
          : undefined,
        duration: 6000,
      });
    }
    localStorage.setItem(LS_KEY, APP_VERSION);
  }, []);

  return null;
}
