"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SITE_NOTICE_DISPLAYS,
  SITE_NOTICE_MESSAGE_MAX,
  SITE_NOTICE_SEVERITIES,
  SITE_NOTICE_TITLE_MAX,
  type SiteNoticeDisplay,
  type SiteNoticeSeverity,
} from "@/config/site-notice";
import {
  AlertTriangle,
  Info,
  Loader2,
  Megaphone,
  ShieldAlert,
} from "lucide-react";

/**
 * View model for the form. Dates cross the server/client boundary as ISO
 * strings rather than `Date` objects: `expiresAt` has to be reshaped into a
 * `datetime-local` wall time anyway, and a string keeps that conversion
 * explicit instead of implicit.
 */
export type SiteNoticeFormValues = {
  isEnabled: boolean;
  severity: SiteNoticeSeverity;
  display: SiteNoticeDisplay;
  title: string;
  message: string;
  expiresAt: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  /**
   * Display caption for `updatedBy`, resolved server-side. Null when the admin
   * has no `users` row or the lookup failed, in which case the raw id is shown
   * instead — a raw id is ugly, but it is still an honest audit trail.
   */
  updatedByLabel: string | null;
};

/**
 * Defaults for an unseeded table. `updateSiteNotice` upserts on the singleton
 * id, so saving from here creates the row rather than failing.
 */
export const UNSEEDED_SITE_NOTICE: SiteNoticeFormValues = {
  isEnabled: false,
  severity: "info",
  display: "banner",
  title: "",
  message: "",
  expiresAt: null,
  updatedAt: null,
  updatedBy: null,
  updatedByLabel: null,
};

/**
 * ISO string -> the `YYYY-MM-DDTHH:mm` wall time a `datetime-local` input
 * expects. Local getters, so the admin sees their own clock rather than UTC.
 */
function isoToDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

type FormState = {
  isEnabled: boolean;
  severity: SiteNoticeSeverity;
  display: SiteNoticeDisplay;
  title: string;
  message: string;
  /** Local wall time, or "" for no expiry. */
  expiresLocal: string;
};

export default function SiteNoticeForm({
  initial,
  isUnseeded,
}: {
  initial: SiteNoticeFormValues;
  isUnseeded: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    isEnabled: initial.isEnabled,
    severity: initial.severity,
    display: initial.display,
    title: initial.title,
    message: initial.message,
    // Deliberately "" rather than isoToDatetimeLocal(initial.expiresAt). That
    // helper reads local wall time, and a useState initialiser runs during
    // SSR, so it would put the UTC wall time in the server HTML and the
    // admin's real wall time in theirs — a value React then patches under the
    // admin's hands. The server cannot know the admin's timezone, so it must
    // not guess one. Populated after mount below.
    expiresLocal: "",
  });
  // One-shot, so it cannot clobber an edit made between mount and effect.
  const expiryHydrated = useRef(false);
  useEffect(() => {
    if (expiryHydrated.current) return;
    expiryHydrated.current = true;
    setForm((prev) => ({
      ...prev,
      expiresLocal: isoToDatetimeLocal(initial.expiresAt),
    }));
  }, [initial.expiresAt]);
  const [audit, setAudit] = useState({
    updatedAt: initial.updatedAt,
    updatedBy: initial.updatedBy,
    updatedByLabel: initial.updatedByLabel,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // The browser clock, sampled on the client only. Reading Date.now() during
  // render is a hydration mismatch: the server and client would disagree about
  // "is the expiry in the past" for any expiry near the SSR-to-hydration
  // window. Same reasoning as SiteNoticeBanner returning null until its effect
  // has run — null until the first effect.
  const [clockNowMs, setClockNowMs] = useState<number | null>(null);
  // Recomputed while the form is open so the "already in the past" hint cannot
  // go stale. A single sample on mount would keep reporting "future" for a
  // form left open past the expiry.
  useEffect(() => {
    setClockNowMs(Date.now());
    const id = window.setInterval(() => setClockNowMs(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const parsedExpiry = useMemo(() => {
    if (!form.expiresLocal) return null;
    return new Date(form.expiresLocal);
  }, [form.expiresLocal]);

  const resolvedExpiry =
    parsedExpiry !== null && !Number.isNaN(parsedExpiry.getTime())
      ? parsedExpiry
      : null;

  // A non-empty value the browser could not parse used to be silently coerced
  // to null on submit, which quietly cleared an expiry the admin believed they
  // had set. Surface it and refuse the save instead.
  const expiryInvalid = form.expiresLocal.length > 0 && resolvedExpiry === null;
  const expiryError = expiryInvalid
    ? "That expiry could not be read. Pick a date and time again."
    : null;

  // Trim before validating, because the API does exactly that
  // (z.string().trim().min(1).max(120)). Validating the raw value would reject
  // a 120-char title the server would happily accept.
  const titleError =
    form.title.trim().length === 0 ? "Title is required." : null;
  const messageError =
    form.message.trim().length === 0 ? "Message is required." : null;
  const expiryInPast =
    clockNowMs !== null &&
    resolvedExpiry !== null &&
    resolvedExpiry.getTime() <= clockNowMs;
  // An expiry in the past is a UX warning only, not a block: the API accepts
  // it and resolveActiveNotice treats it as expired, so it never becomes
  // visible. Refusing the save would trap an admin who is deliberately
  // clearing a stale expiry.
  const canSubmit = !saving && !titleError && !messageError && !expiryInvalid;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (titleError || messageError) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/site-notice", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // Every field, always. The endpoint is full-replacement: a partial body
        // 400s rather than merging, so sending only the dirty fields would fail.
        body: JSON.stringify({
          isEnabled: form.isEnabled,
          severity: form.severity,
          display: form.display,
          title: form.title.trim(),
          message: form.message.trim(),
          // Mandatory conversion: the schema wants a full ISO 8601 datetime with
          // an offset, and a raw datetime-local value is rejected.
          expiresAt: resolvedExpiry ? resolvedExpiry.toISOString() : null,
        }),
      });

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        let message =
          payload?.error ?? `Save failed with status ${res.status}.`;
        if (res.status === 429) {
          const retryAfter = Number(res.headers.get("Retry-After"));
          if (Number.isFinite(retryAfter) && retryAfter > 0) {
            message += ` Try again in ${Math.ceil(retryAfter)}s.`;
          }
        }
        setError(message);
        return;
      }

      // Adopt the server's record rather than trusting local state: it trims,
      // it owns updated_at/updated_by, and echoing it back keeps the audit
      // line honest.
      const saved = (await res.json()) as SiteNoticeFormValues;
      setForm({
        isEnabled: saved.isEnabled,
        severity: saved.severity,
        display: saved.display,
        title: saved.title,
        message: saved.message,
        expiresLocal: isoToDatetimeLocal(saved.expiresAt),
      });
      setAudit({
        updatedAt: saved.updatedAt,
        updatedBy: saved.updatedBy,
        updatedByLabel: saved.updatedByLabel,
      });
      router.refresh();
    } catch {
      setError(
        "Could not reach the server. Check your connection and try again.",
      );
    } finally {
      setSaving(false);
    }
  }

  // Memoised so typing a message does not re-run Intl formatting on every
  // keystroke, and so the same label renders identically on the server and the
  // client (both call the same formatter with an explicit locale).
  // Browser timezone, sampled client-only. resolvedOptions().timeZone is
  // "UTC" on Vercel and the user's real zone in the browser, so rendering it
  // during SSR is a guaranteed mismatch — and because React 19 derives useId
  // from tree position, the divergent text shifts every generated id below it,
  // surfacing as bogus aria-controls diffs on the Selects far above.
  // Memoising does NOT help: useMemo still runs on both sides. Same reasoning
  // as clockNowMs and SiteNoticeBanner's sessionStorage read — null until the
  // first effect. Note this only reproduces in production; dev is usually UTC
  // to UTC, which is exactly why it hides locally.
  const [timeZone, setTimeZone] = useState<string | null>(null);
  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
  }, []);

  const expiresUtcLabel = useMemo(
    () =>
      resolvedExpiry === null
        ? ""
        : `${resolvedExpiry.toLocaleString("en-US", {
            timeZone: "UTC",
            dateStyle: "medium",
            timeStyle: "short",
          })} UTC`,
    [resolvedExpiry],
  );

  // Gated on timeZone for the same reason as above: toLocaleString with no
  // timeZone resolves in the ambient zone, so SSR says "UTC" and the client
  // says its own. Rendering it only once timeZone is known (client-only) means
  // the first client render matches the server's empty string and the label
  // fills in on the next one.
  const lastSavedLabel = useMemo(
    () =>
      audit.updatedAt === null || timeZone === null
        ? null
        : new Date(audit.updatedAt).toLocaleString("en-US", {
            timeZone,
            dateStyle: "medium",
            timeStyle: "short",
          }),
    [audit.updatedAt, timeZone],
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-busy={saving}>
      {isUnseeded && (
        <div className="flex items-start gap-3 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-600 dark:text-yellow-400" />
          <p className="text-yellow-700 dark:text-yellow-300">
            No notice row exists yet. Saving creates it from these defaults —
            expected on a database bootstrapped with{" "}
            <code>drizzle-kit push</code>.
          </p>
        </div>
      )}

      <div className="rounded-lg border bg-card p-5 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <Label htmlFor="isEnabled" className="text-base">
              Active
            </Label>
            <p className="text-sm text-muted-foreground">
              Off means nothing is shown to anyone, whatever the fields below
              say.
            </p>
          </div>
          <Switch
            id="isEnabled"
            checked={form.isEnabled}
            onCheckedChange={(v) => setField("isEnabled", v)}
            className="mt-1"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="severity">Severity</Label>
            <Select
              value={form.severity}
              onValueChange={(v) =>
                setField("severity", v as SiteNoticeSeverity)
              }
            >
              <SelectTrigger id="severity" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SITE_NOTICE_SEVERITIES.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className="flex items-center gap-2">
                      {s === "critical" ? (
                        <ShieldAlert className="size-3.5 text-red-500" />
                      ) : s === "warning" ? (
                        <AlertTriangle className="size-3.5 text-yellow-500" />
                      ) : (
                        <Info className="size-3.5 text-blue-500" />
                      )}
                      {s[0].toUpperCase() + s.slice(1)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="display">Display</Label>
            <Select
              value={form.display}
              onValueChange={(v) => setField("display", v as SiteNoticeDisplay)}
            >
              <SelectTrigger id="display" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SITE_NOTICE_DISPLAYS.map((d) => (
                  <SelectItem key={d} value={d}>
                    <span className="flex items-center gap-2">
                      <Megaphone className="size-3.5 text-muted-foreground" />
                      {d === "banner" ? "Banner" : "Modal"}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              A modal covers the page and blocks it until dismissed. A banner
              sits above the content.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="title">Title</Label>
            <span
              aria-live="polite"
              className={`text-xs tabular-nums ${
                form.title.length >= SITE_NOTICE_TITLE_MAX
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {form.title.length}/{SITE_NOTICE_TITLE_MAX}
            </span>
          </div>
          <Input
            id="title"
            value={form.title}
            maxLength={SITE_NOTICE_TITLE_MAX}
            onChange={(e) => setField("title", e.target.value)}
            placeholder="Scheduled maintenance"
            aria-invalid={titleError !== null}
            aria-describedby={titleError ? "title-error" : undefined}
            disabled={saving}
          />
          {titleError && (
            <p
              id="title-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {titleError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <Label htmlFor="message">Message</Label>
            <span
              aria-live="polite"
              className={`text-xs tabular-nums ${
                form.message.length >= SITE_NOTICE_MESSAGE_MAX
                  ? "text-destructive"
                  : "text-muted-foreground"
              }`}
            >
              {form.message.length}/{SITE_NOTICE_MESSAGE_MAX}
            </span>
          </div>
          <Textarea
            id="message"
            value={form.message}
            maxLength={SITE_NOTICE_MESSAGE_MAX}
            onChange={(e) => setField("message", e.target.value)}
            rows={5}
            placeholder="We are performing maintenance. Some content may be temporarily unavailable."
            aria-invalid={messageError !== null}
            aria-describedby={messageError ? "message-error" : undefined}
            disabled={saving}
            className="whitespace-pre-wrap"
          />
          {messageError && (
            <p
              id="message-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {messageError}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Plain text only — no markdown, no HTML. Line breaks are preserved.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiresAt">Auto-expire (optional)</Label>
          <Input
            id="expiresAt"
            type="datetime-local"
            value={form.expiresLocal}
            onChange={(e) => setField("expiresLocal", e.target.value)}
            disabled={saving}
            aria-invalid={expiryError !== null}
            aria-describedby={expiryError ? "expiresAt-error" : undefined}
            className="w-full sm:w-72"
          />
          {expiryError && (
            <p
              id="expiresAt-error"
              role="alert"
              className="text-xs text-destructive"
            >
              {expiryError}
            </p>
          )}
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>
              Leave empty for no expiry. Interpreted in your local time zone
              {timeZone ? ` (${timeZone})` : ""}.
            </p>
            {resolvedExpiry && (
              <p
                aria-live="polite"
                className={
                  expiryInPast ? "text-yellow-600 dark:text-yellow-400" : ""
                }
              >
                {expiryInPast &&
                  "Already in the past — the notice will never show. "}
                Stored as {expiresUtcLabel}
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-muted-foreground">
          {/* Keyed on updatedAt, not on lastSavedLabel. lastSavedLabel is null until
            the client-only timezone is known, and branching on it here would
            flash "Never saved" for a notice that was in fact saved — a lie
            that is worse than a one-frame gap. */}
          {audit.updatedAt === null ? (
            <>Never saved</>
          ) : lastSavedLabel === null ? (
            // Timezone not sampled yet. Reserve the line so the layout does
            // not jump when the real label lands one render later.
            <span className="opacity-0">Last saved —</span>
          ) : (
            <>
              Last saved {lastSavedLabel}
              {audit.updatedBy && (
                <>
                  {" "}
                  by{" "}
                  {/* Prefer the resolved name. The id stays in the DOM as the
                      title so a collision or a renamed account is still
                      traceable to a single row. */}
                  <span title={audit.updatedBy}>
                    {audit.updatedByLabel ?? audit.updatedBy}
                  </span>
                </>
              )}
            </>
          )}
        </p>
        <Button type="submit" disabled={!canSubmit} className="sm:w-48">
          {saving ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving
            </>
          ) : (
            "Save notice"
          )}
        </Button>
      </div>
    </form>
  );
}
