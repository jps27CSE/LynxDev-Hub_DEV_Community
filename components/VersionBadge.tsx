"use client";

import { APP_VERSION } from "@/lib/app-version";

export function VersionBadge() {
  return (
    <span className="text-[11px] text-muted-foreground/80 select-none">
      v{APP_VERSION}
    </span>
  );
}
