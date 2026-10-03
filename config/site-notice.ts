/**
 * Site notice vocabulary. Deliberately isolated from `lib/site-notice.ts`:
 * that module imports `config/db`, so anything that reads a *value* out of it
 * from a client component drags mysql2 and the Node `net`/`tls`/`timers`
 * builtins into the browser bundle and the build fails on `Can't resolve
 * 'net'`. Type-only imports are erased and stay safe, so this file is the one
 * place a client component may import from.
 *
 * Keep this file dependency-free. The moment it gains an import, the trap
 * returns.
 */

export const SITE_NOTICE_SEVERITIES = ["info", "warning", "critical"] as const;
export const SITE_NOTICE_DISPLAYS = ["banner", "modal"] as const;

/**
 * Column widths, shared so the admin form's counters and `maxLength` cannot
 * drift from the Zod schema and the varchar limits in `config/schema.tsx`.
 */
export const SITE_NOTICE_TITLE_MAX = 120;
export const SITE_NOTICE_MESSAGE_MAX = 2000;

export type SiteNoticeSeverity = (typeof SITE_NOTICE_SEVERITIES)[number];
export type SiteNoticeDisplay = (typeof SITE_NOTICE_DISPLAYS)[number];
