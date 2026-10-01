import type { Metadata } from "next";
import Link from "next/link";
import { getSiteNoticeRecord } from "@/lib/site-notice";
import { getUserLabelByClerkId } from "@/lib/user-lookup";
import AdminPageWrapper from "../_components/AdminPageWrapper";
import SiteNoticeForm, {
  UNSEEDED_SITE_NOTICE,
  type SiteNoticeFormValues,
} from "./_components/SiteNoticeForm";

export const metadata: Metadata = {
  title: "Site Notice",
  description:
    "Publish a global maintenance or warning banner for every LynxDEV user.",
};

/**
 * force-dynamic rather than relying on the 1h notice cache. This page is an
 * edit surface, not a reading one: an admin who saves, navigates back, and
 * sees stale state would reasonably conclude the save failed. Admin traffic is
 * negligible, so there is nothing to win by caching it.
 */
export const dynamic = "force-dynamic";

export default async function AdminSiteNoticePage() {
  let values: SiteNoticeFormValues = UNSEEDED_SITE_NOTICE;
  let unseeded = false;
  let fetchError = false;

  try {
    const record = await getSiteNoticeRecord();
    if (record) {
      values = {
        isEnabled: record.isEnabled,
        severity: record.severity,
        display: record.display,
        title: record.title,
        message: record.message,
        // Strings, not Dates: this crosses into a client component and the form
        // needs a value it can hand straight to <input type="datetime-local">.
        expiresAt: record.expiresAt ? record.expiresAt.toISOString() : null,
        updatedAt: record.updatedAt.toISOString(),
        updatedBy: record.updatedBy,
        // The stored updatedBy stays the raw Clerk id — that is the audit
        // fact. This is only the caption next to it. A null here (no users row
        // for that admin, or the lookup failed) falls back to the id, so the
        // audit line degrades instead of disappearing.
        updatedByLabel: record.updatedBy
          ? await getUserLabelByClerkId(record.updatedBy)
          : null,
      };
    } else {
      // getSiteNoticeRecord returns null on an unseeded table — reachable via
      // `drizzle-kit push`, which never executes migration SQL. Not an error
      // state: updateSiteNotice upserts on the singleton id, so saving from
      // here creates the row. The form still works, with defaults.
      unseeded = true;
    }
  } catch {
    fetchError = true;
  }

  const content = fetchError ? (
    <div className="rounded-lg border bg-card p-8 text-center">
      <p className="text-sm text-muted-foreground">
        Failed to load the current notice. TiDB may be waking. Please retry.
      </p>
      <Link
        href="/admin/site-notice"
        className="inline-flex mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Retry
      </Link>
    </div>
  ) : (
    <SiteNoticeForm initial={values} isUnseeded={unseeded} />
  );

  return (
    <AdminPageWrapper
      title="Site Notice"
      description="Publishes one message to every signed-in user, everywhere except the admin panel. Saving is full-replacement — all fields are sent on every save."
    >
      {content}
    </AdminPageWrapper>
  );
}
