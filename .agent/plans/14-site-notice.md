# Site Notice / Maintenance Banner — Finalized Feature Spec (Free-Tier Safe)

> **Date:** 2026-09-29
> **Status:** Tasks 1-2 built + self-reviewed. Task 1 verified in TiDB, Task 2 logic-tested. Awaiting manual test before commit.
> **Scope:** Admin-toggled global notice (maintenance / warning / info) shown to every user except on `/admin`
> **Progress:** Tasks 1-2 complete — Tasks 3-9 not yet started
> **Stack:** Next.js 16 App Router (Server Components default), Clerk `auth()`, Drizzle + TiDB MySQL (pool `connectionLimit:5`), Tailwind v4 + shadcn/ui (`Dialog`, `Alert`, `Switch`, `Select`, `Textarea`), Vercel Hobby Free, TiDB Cloud Starter Free
> **Constraint:** Zero cost forever. This feature runs on **every page load of the entire app**, so its cost is multiplied by the highest-traffic page in the product. It must not add a per-request DB query or a per-request function invocation.

---

## 1. Business Problem

During seed runs, migrations, and TiDB cold starts, data can be temporarily missing or inconsistent (empty course lists, missing chapters, empty interview banks, a 504 from a waking database). A user landing on the site during that window sees what looks like a broken product and leaves.

**Goal:** Let the admin turn on a global notice — banner or modal — from the admin panel, with no redeploy, and have it self-clear.

**Explicitly not the goal:** a hard maintenance mode that 503s the site. That would lock the admin out of the very panel that turns it off, and would hide the "app is fine, just the data is mid-refresh" nuance that makes the notice useful instead of alarming.

---

## 2. The Central Design Decision — Read It Before Writing Any Code

The obvious implementation is a `"use client"` component that fetches `/api/site-status` on mount. **This is rejected.** It is the single most expensive possible place to put a 1-row read, because the read would be multiplied by every page view in the product.

| | ❌ Client fetch on mount | ✅ Cached read in root layout |
|---|---|---|
| Vercel function invocations | **+1 per page load** (~135K/mo at 500 users) | **+0** — folded into the page render that already counts |
| TiDB queries | **+1 per page load** | **1 per hour per region** |
| Added RU/month | ~0.7–1.4M | **~20K (0.04% of the 50M budget)** |
| Client waterfall | JS → fetch → render on every page | none |
| Stale-on-toggle | n/a | solved by `revalidateTag` |

The numbers come from the traffic model in `docs/production-review-500-users.md:277-296` (~4,500 page loads/day at 500 users) and the RU budget of 50M/month (`production-review-500-users.md:17`).

**Chosen approach:** read the singleton row in the **root layout** (`app/layout.tsx`), wrapped in the existing `createContentCache({ tag: "site-notice", ttl: 3600 })` helper (`lib/content-cache.ts:22`), and pass a plain object of primitives down to a `"use client"` component.

This also fixes the **first `revalidateTag` call site in the codebase** — `lib/content-cache.ts:16` reserves the tag for "a future admin revalidate endpoint". The admin PATCH route becomes that endpoint, making the toggle instant.

---

## 3. Mount Point — Why the Root Layout

| Candidate | Covers | Verdict |
|---|---|---|
| `app/layout.tsx:77` (inside `<body>`, **sibling of `<Provider>`**) | `(routes)`, `/admin`, `/`, `/whats-new`, `/sign-in` | ✅ **Chosen.** Only common ancestor. |
| `app/(routes)/layout.tsx` | Authed app only | ❌ Misses `/admin` (separate `AdminShell` tree), `/`, `/whats-new`, `/sign-in` |
| `app/provider.tsx:60` | Same as root | ❌ Would widen the `NextThemesProvider` prop type for no benefit |
| `proxy.ts` | All | ❌ **Edge runtime — no `mysql2`, no Drizzle.** Would break or force a Node runtime onto the edge layer |

**Sibling of `<Provider>`, not inside it.** `Provider`'s props are `React.ComponentProps<typeof NextThemesProvider>`; adding `siteNotice` there would pollute a theming prop type. `app/provider.tsx` stays untouched.

`/admin` is exempted at runtime in the client component via `usePathname()` — a layout cannot read the pathname, and the client already needs to be a client component for the dismissal effect.

---

## 4. Finalized Features

### ✅ INCLUDED

| # | Feature | What it does | Why included (cost) |
|---|---------|--------------|---------------------|
| **S-01** | **Singleton `site_notices` row** | One row, `id` always `1`. No relations, no auto-increment, no indexes needed. Mirrors the `rateLimits` precedent (`config/schema.tsx:133`). | 13th table (limit 20). One 5-RU PK lookup. |
| **S-02** | **Severity** `info` / `warning` / `critical` | Drives color + icon + default display. `warning` = "app works, data mid-refresh" (the seeding case). `critical` = "service degraded". | Zod `z.enum` — 3 values, no lookup table. |
| **S-03** | **Display** `banner` / `modal`, admin-chosen | `banner` = non-blocking dismissible strip. `modal` = acknowledgement dialog. A warning that interrupts a user mid-lesson with a blocking modal is hostile UX, so this is admin's call, not hardcoded. | One enum. Both paths render from the same cached object. |
| **S-04** | **Custom title + message** | `title` varchar(120), `message` text. | Zero extra cost. Capped at 120/2000 chars by Zod. |
| **S-05** | **`expires_at` auto-expiry** | Optional timestamp. The **real risk in a bare on/off toggle**: admin enables it during seeding, forgets, and now every user sees a maintenance modal forever. Self-expiry removes that failure mode. | One nullable column, one comparison in the cached fn. |
| **S-06** | **Session dismissal** | `sessionStorage` keyed by the notice's `updated_at`. Dismiss → gone for the rest of the tab session. Edit the message → version bumps → re-shows immediately, even mid-session. | Free. `sessionStorage`, **not** `localStorage` — key must not collide with `lynxdev_app_version` (`VersionUpdateNotification.tsx:8`). |
| **S-07** | **`/admin` auto-exempt** | `usePathname()` → return `null` under `/admin`. | Zero cost. Prevents locking the admin out of the panel that disables the notice. |
| **S-08** | **Instant toggle via `revalidateTag`** | PATCH route calls `revalidateTag(SITE_NOTICE_CACHE_TAG)`. The 1h TTL is a **backstop**, not the mechanism — if tag revalidation ever fails silently, the notice self-corrects within an hour instead of being stuck. **Revised from 60s after measurement — see §11.** | ~5 RU per admin save. |
| **S-09** | **Env kill switch** | `SITE_NOTICE_DISABLED=true` suppresses the notice at the data layer. Bail-out for the day admin access is lost. Parsed case-insensitively — a bail-out that silently fails on a typo is worse than no bail-out. | 3 lines, zero cost. |

### ❌ EXCLUDED (YAGNI / free-tier gate)

| Feature | Why excluded |
|---------|-------------|
| `starts_at` scheduled window | Admin can just toggle it on at the right moment. Extra column + extra logic for no current use. |
| Notice history / archive table | The user only needs "on now". History is Phase 4 territory at best. |
| `localStorage` permanent dismissal | Once dismissed forever means a user who dismisses "DB is down" never sees the next real outage. Session-scoped is the correct granularity. |
| Per-user / per-role targeting | YAGNI. Everyone except the admin. |
| Per-feature kill switches (Mentor, etc.) | Separate concern. `MENTOR_ENABLED` env var already exists; migrating it to a panel is its own spec. |
| Draft + preview before publishing | YAGNI for a 1-row singleton. |
| Email / push notification on toggle | No user notification table exists, and Phase 3 has none. |

---

## 5. Database Schema

`config/schema.tsx` — appended after `feedbackTickets`:

```ts
export const siteNotices = mysqlTable("site_notices", {
  id: int().primaryKey(),
  is_enabled: boolean("is_enabled").notNull().default(false),
  severity: varchar({ length: 10 }).notNull().default("info"),
  display: varchar({ length: 10 }).notNull().default("banner"),
  title: varchar({ length: 120 }).notNull().default("Heads up"),
  message: text().notNull(),
  expires_at: timestamp("expires_at"),
  updated_at: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
  updated_by: varchar("updated_by", { length: 255 }),
});
```

**Design notes:**
- `id` is a manual PK, not `autoincrement()` — the row is always `1`. Same reasoning as `rateLimits.bucket` (`config/schema.tsx:134`).
- `updated_at` has `.onUpdateNow()` — it is both the audit field **and** the dismissal version key. No extra column needed.
- **No indexes** — a single-row PK lookup uses the clustered primary key. Adding an index here would be pure waste.
- **Migration `0009` seeds `id = 1`** so the admin form has something to edit on a normal `migrate`-based environment.
- **The seed row is NOT guaranteed to exist.** `drizzle-kit push` diffs the Drizzle schema and does **not** execute migration SQL, so any environment bootstrapped that way (fresh dev DB, staging) gets the table with **zero rows** — as does a manual truncate. `getSiteNoticeRecord()` therefore returns `null` in the wild, and **the admin form must render defaults for a null record** rather than assume a row. An admin panel that 500s is the one failure mode that locks you out of the thing this feature exists for.
- **The singleton invariant is unenforced.** `id` has no `autoincrement` (correct — matches `rateLimits.bucket:134`), but nothing stops an insert that omits `id` (lands on `0`) or a stray `id = 2` row, which `WHERE id = 1` would then **silently ignore** while the admin UI shows stale data. Documented here rather than in a code comment, because `config/schema.tsx` has zero comments by convention.
- **`updated_at` has 1-second precision** (`timestamp`, not `timestamp(3)`). Two saves inside the same second share a version key. Irrelevant for a human clicking Save; noted so a double-click is not mistaken for a bug.

---

## 6. Data Layer — `lib/site-notice.ts`

```
SITE_NOTICE_SINGLETON_ID = 1
SITE_NOTICE_CACHE_TAG    = "site-status"
SITE_NOTICE_CACHE_TTL    = 3600
```

| Export | Cached? | Purpose |
|---|---|---|
| `getActiveSiteNotice(): Promise<ActiveSiteNotice \| null>` | `unstable_cache`, 3600s, tag `site-notice` | The public read. Returns `null` when: env kill switch on, no row, `is_enabled = false`, or `expires_at <= now`. |
| `resolveActiveNotice(row, now?): ActiveSiteNotice \| null` | n/a — **pure** | The eligibility + projection logic, split out of the I/O path so the expiry boundary and disabled/expired cases are testable without a Next request context. |
| `getSiteNoticeRecord(): Promise<SiteNoticeRecord \| null>` | `cache()` only, per-request | Raw row for the admin form, so the admin can see and edit an expired or disabled notice. |
| `updateSiteNotice(input, updatedBy): Promise<SiteNoticeRecord>` | n/a | `INSERT ... ON DUPLICATE KEY UPDATE` on `id = 1`. Idempotent — never needs a "does the row exist" pre-check. |

Both read functions are wrapped in React `cache()` for per-request dedup (matches the ~35 existing call sites; `lib/admin-auth.ts:27` is the closest precedent for a `cache()`-wrapped admin-scoped read).

### Two constraints that are not optional

**1. The public read must be a column allowlist.** The row also carries `updated_by` — a Clerk user ID. Spreading the raw row into a client component would ship every admin's Clerk ID to every visitor in the HTML payload. `resolveActiveNotice` returns exactly `version · severity · display · title · message`, all primitives. Never `{ ...row }`. `getSiteNoticeRecord` may return the full row because it only ever reaches the admin page.

**2. `updated_at` must be set explicitly in the upsert, not left to the column default.** MySQL fires `ON UPDATE CURRENT_TIMESTAMP` **only when a value actually changes** — verified against the live table: a no-op `UPDATE` left `updated_at` untouched. So `updateSiteNotice` writes `updated_at: sql\`CURRENT_TIMESTAMP\`` in both the `values` and the `onDuplicateKeyUpdate.set` branches.

Without this, re-saving an unchanged notice leaves the version key intact, and every user who had already dismissed that version would never see the re-announcement. `revalidateTag` would fire correctly and change nothing. This is why the dismissal key cannot be delegated to the schema.

**Why the cached function returns primitives:** `unstable_cache` round-trips through JSON, so a `Date` would come back as a `string`. `version` is therefore `updatedAt.toISOString()` at the projection boundary. `getSiteNoticeRecord` is *not* behind `unstable_cache`, so its `Date` fields stay `Date` — which is what the admin form's `datetime-local` needs.

**Two functions, two jobs — do not unify.** The admin needs the *unfiltered* row; the public path needs it filtered. One function with a boolean flag is how the cached path starts leaking drafts and expired state.

---

## 7. API Route — `PATCH /api/admin/site-notice`

Handler order follows the canonical `app/api/enroll/route.ts` pattern:

1. `withRequestLog("PATCH /api/admin/site-notice", ...)` — `lib/request-log.ts:22`
2. `auth()` → `unauthorized()`
3. `isAdmin(userId)` → `forbidden()` (`lib/admin-auth.ts:27`, fail-closed)
4. `enforceDbRateLimit(userId, "admin-site-notice", "/api/admin/site-notice", "PATCH")` → return the 429 if limited
5. `req.json()` in a nested try → `badJson()`
6. Zod `safeParse` → `validationError()`
7. `updateSiteNotice(...)`
8. `revalidateTag(SITE_NOTICE_CACHE_TAG)`
9. `NextResponse.json(record)` — bare payload, matching `app/api/admin/feedback/[id]/route.ts:59`

**No `GET` route.** The admin page is a Server Component and reads `getSiteNoticeRecord()` directly. The form PATCHes, then calls `router.refresh()`. A GET endpoint would be a second code path for the same data with no consumer.

Zod schema:

```ts
z.object({
  isEnabled:  z.boolean(),
  severity:   z.enum(["info", "warning", "critical"]),
  display:    z.enum(["banner", "modal"]),
  title:      z.string().trim().min(1).max(120),
  message:    z.string().trim().min(1).max(2000),
  expiresAt:  z.string().datetime().nullable(),   // ISO, or null for "never"
})
```

**Rate limit:** `PATCH /api/admin/site-notice` → `10/min`, new scope `"admin-site-notice"` in the `RateLimitScope` union (`lib/db-rate-limit.ts:9`). Adding a route requires edits in **three** places: the route file, `config/rate-limits.ts`, and that union.

---

## 8. Component — `components/SiteNoticeBanner.tsx`

`"use client"`. Mirrors `components/VersionUpdateNotification.tsx` (reads storage in `useEffect` only, no SSR mismatch).

```
LS/SESSION KEY: "lynxdev_site_notice_ack"   → stores the ISO updated_at string
```

**State machine:**

```
mount
  → useEffect: read sessionStorage
      ready = false, so SSR and first client render both produce null
  → useEffect: if ack === notice.version → stay hidden
               else → show
dismiss (banner ×  or  modal OK / Esc / X)
  → sessionStorage.setItem(KEY, notice.version)
```

**Hydration safety:** a `ready` gate renders `null` until the effect has run. This avoids a hydration mismatch, at the cost of a one-frame delay. The alternative — always rendering the banner on first paint and hiding it in an effect — causes a visible flash.

**`/admin` exemption:** `usePathname()` → `if (pathname.startsWith("/admin")) return null`. Cheap, and it means the exemption cannot drift out of sync with the admin route tree.

**Accessibility:** the modal is always dismissible (Esc, X, and the OK button). It is **not** a focus trap with no exit — trapping a user in a dialog with no escape is a bug, not a feature. The banner uses `role="status"` (polite); the modal uses the Radix `Dialog` primitives, which already wire up `role="dialog"`, focus trapping, and the title/description aria linkage.

**Render the message as plain text.** Do not use `dangerouslySetInnerHTML`, and do not add `rehype-raw` if `react-markdown` is used. `react-markdown` is already a dependency and would be the natural wrong turn, but the notice body is admin-authored free text that ends up in every visitor's DOM. Plain text also avoids pulling `react-markdown` + `rehype-highlight` into a component mounted in the **root layout**, i.e. into the bundle of every page.

**`severity` / `display` are not constrained at the DB level.** Zod guards the only write path, but a bad value could reach the component from a direct SQL edit. Style lookups must fall back to a default rather than yielding `undefined` class strings — `toSeverity` / `toDisplay` in `lib/site-notice.ts` already normalise the values, so a lookup keyed on the typed union is safe.

**Dark mode is the default** (`app/layout.tsx:66` sets `className="dark"`), so all colors are authored dark-first using the existing `border-border/50 bg-card` token vocabulary from `QuickActions.tsx:55`.

---

## 9. Admin UI — `/admin/site-notice`

- `app/admin/site-notice/page.tsx` — Server Component. `export const dynamic = "force-dynamic"` (matches `app/admin/users/page.tsx:20`). Reads `getSiteNoticeRecord()`. Wrapped in `AdminPageWrapper` (`app/admin/_components/AdminPageWrapper.tsx`).
- `app/admin/site-notice/_components/SiteNoticeForm.tsx` — `"use client"`. `Switch` for `isEnabled`; `Select` for severity and display; `Input` for title; `Textarea` for message; `datetime-local` `Input` for expiry, with an explicit "No expiry" reset. PATCHes on save, then `router.refresh()`.

**Guard already covered** by `app/admin/layout.tsx:12-16` (`auth()` → `isAdmin()` → redirect). Do not re-check in the page.

**Nav wiring:** add `{ label: "Site Notice", href: "/admin/site-notice", icon: Megaphone }` to `adminLinks` in `app/admin/_components/AdminSidebar.tsx:18-22`, and flip the `disabled: true` **Settings** card in `app/admin/_components/QuickActions.tsx:33-42` to a real link — it has been sitting as a placeholder described as "Admin configuration and preferences", which is exactly this page.

**Observed gap, out of scope for this feature:** the *main app* sidebar (`app/(routes)/_components/Sidebar.tsx:20-26`) has no Admin link, so `/admin` is only reachable by typing the URL. Worth a separate one-line task; not folding it in here.

---

## 10. Known Trade-offs

| Trade-off | Decision | Rationale |
|---|---|---|
| **Root layout leaves the static shell** | Accept — **measured, no regression** | Resolved in §11. `unstable_cache` absorbs the DB cost. TTFB warm 4-50ms across `/`, `/whats-new`, `/courses`. No mount-point change needed. |
| **TTL 3600 instead of `false`** | Accept the 1-hour window | `createContentCache` supports `ttl: false` (invalidate only by version bump), which would be free. Rejected: a failed `revalidateTag` would strand the notice until the next deploy. 1h is a self-healing backstop behind an instant `revalidateTag`, and keeps the ISR cost near baseline (§11). |
| **`sessionStorage` is per-tab** | Accept, document | 3 tabs open = 3 modals. For a maintenance notice this is defensible — each tab is a separate browsing context. `localStorage` would be 1 modal ever, which is wrong for a real outage. |
| **1 new table** | Accept | The only alternative to a table is a static `config/` constant, which requires a redeploy — exactly what the admin toggle exists to avoid. 13/20 tables. |
| **Client component in the tree** | Accept | Unavoidable: dismissal needs `sessionStorage` + `usePathname`. It is mounted once, in the root layout, and returns `null` when there is no notice — so it adds no render cost to the common case. |

---

## 11. Free-Tier Compliance Check

| Gate (`13-admin-users-section.md:70`) | Status |
|---|---|
| No unbounded `SELECT *` without `LIMIT` | ✅ Single-row PK lookup |
| No `LIKE` without cap | ✅ No `LIKE` |
| No N+1 loop | ✅ One query, no loop |
| No response > 1MB | ✅ ~200 bytes of JSON |
| Queries paginated | ✅ n/a — 1 row |
| Rate limited | ✅ 10/min, DB-backed, fail-closed |
| Soft deletes everywhere | ✅ n/a — singleton, toggle not delete |
| Schema < 20 tables | ✅ 13 |
| TiDB pool `connectionLimit: 5` | ✅ No `Promise.all`, 1 query |

**Projected spend:** ~5 RU per 60s per region. At 3 Vercel regions that is ~4,320 queries/day ≈ **~20K RU/month = 0.04% of the 50M budget**. **+0 Vercel function invocations.** The admin PATCH costs ~5 RU per save, admin-only.

---

## 12. Task Breakdown

Each task is independently testable. **Implement one at a time; stop and hand off for manual test after each.** No agent commits — the developer tests and commits.

| # | Task | Files | Verify by |
|---|------|-------|-----------|
| **1** | Schema + migration | `config/schema.tsx`, `drizzle/0009_*.sql` | `npx drizzle-kit generate`, review SQL, `npx drizzle-kit migrate`, confirm the seeded row |
| **2** | Data layer | `lib/site-notice.ts` | `npx tsx` scratch script prints the row; toggle `is_enabled` and confirm `getActiveSiteNotice()` returns / `null` |
| **3** | Global component | `components/SiteNoticeBanner.tsx` | Not yet visible — no mount point yet |
| **4** | Root layout mount | `app/layout.tsx` | Visit `/dashboard` with a seeded enabled row; banner/modal appears |
| **5** | API route + rate limit | `app/api/admin/site-notice/route.ts`, `config/rate-limits.ts`, `lib/db-rate-limit.ts` | `curl` PATCH as admin (200) and as non-admin (403), unsigned (401), bad body (400) |
| **6** | Admin page + form | `app/admin/site-notice/page.tsx`, `_components/SiteNoticeForm.tsx`, `config/site-notice.ts` | Toggle + save from the UI; the notice updates everywhere. **Done — plan §21** |
| **7** | Nav wiring | `AdminSidebar.tsx`, `QuickActions.tsx` | Link present and active-state correct; Settings card no longer disabled |
| **8** | Docs | `.env.example`, `.agent/feature-tracker.md` | `SITE_NOTICE_DISABLED` documented; 4.6 no longer claims admin is unbuilt |
| **9** | Self-review + hand off | — | `npm run typecheck`, `npm run format:check`, then the manual test script below |

---

## 13. Manual Test Script (for the developer)

1. `npx drizzle-kit generate` → **review** `drizzle/0009_*.sql` → `npx drizzle-kit migrate`
2. `npm run dev`, sign in as admin → `/admin/site-notice`
3. severity `warning`, display `banner`, message "Re-seeding course data", **no** expiry → Save
4. Reload `/dashboard` → banner appears. Dismiss it. Navigate away and back **in the same tab** → gone
5. Open a **new tab** → `/dashboard` → banner returns (proves `sessionStorage`, not `localStorage`)
6. Switch display to `modal` → Save → modal appears on `/` (public) and `/sign-in`, but **not** on `/admin/site-notice`
7. Set `expires_at` 2 minutes out → Save → wait → notice disappears on its own with no admin action
8. Set `expires_at` 5 minutes out, then change the message text and Save → the notice **re-appears immediately in the same tab** (proves `revalidateTag`)
9. Toggle `isEnabled` off → Save → gone everywhere immediately
10. Dark mode check (it is the default) and mobile viewport check
11. `npm run typecheck` && `npm run format:check`

---

## 14. Out of Scope — Revisit Later

- Main app `Sidebar.tsx` has no Admin link (`app/(routes)/_components/Sidebar.tsx:20-26`).
- `npm run format:check` fails on **45 files** repo-wide — pre-existing. Of the files this feature touches only `config/schema.tsx` is listed, and only for the pre-existing `feedback_user_idx` line (84 chars) at `:171`; the new `siteNotices` block is prettier-clean. A repo-wide `npx prettier --write .` clears the rest, but that belongs in its own commit.
- `.env.example` was missing 5 vars that real code reads — `ADMIN_EMAILS`, `ADMIN_CLERK_IDS`, `MENTOR_ENABLED`, `CRON_SECRET`, `YOUTUBE_CHANNEL_ID`. Documented in Task 8. (`JWT_SECRET`, `OPENAI_API_KEY`, `PINECONE_API_KEY` also appear in a grep of `process.env` but are only sample code inside seed-data Q&A prose — not real reads.)
- `db.execute()` on this stack returns a **`[rows, fields]` tuple**, not rows — a raw-SQL helper that treats the result as rows will silently read the field-metadata array. `lib/site-notice.ts` uses the Drizzle query builder (`db.select().from(...)`), which returns rows directly, as every other `lib/*` file does. Worth knowing before anyone adds a raw-SQL helper.

---

## 15. Self-Review Log — Task 1/2

Findings raised by the post-implementation review and their resolution:

| # | Severity | Finding | Resolution |
|---|----------|---------|------------|
| 1 | **P1** | `ON UPDATE CURRENT_TIMESTAMP` fires only on a real value change — verified live: a no-op `UPDATE` left `updated_at` untouched. Re-saving an unchanged notice would never re-announce. | **Fixed.** `updateSiteNotice` sets `updated_at: sql\`CURRENT_TIMESTAMP\`` explicitly in both upsert branches. Proven: two identical saves 1.2s apart produced `04:52:30` → `04:52:32`. |
| 2 | **P1** | `updated_by` (a Clerk user ID) sits in the row the public read touches; spreading the row would leak it to every visitor. | **Fixed.** `resolveActiveNotice` returns a 5-key allowlist, all primitives. Proven: raw row has 9 keys, public projection has 5, `updated_by` absent. |
| 3 | **P2** | Plan claimed `getSiteNoticeRecord()` never returns `null` — false, because `drizzle-kit push` does not run migration SQL. | **Fixed.** §5 now documents it; the admin form must handle `null`. |
| 4 | **P2** | Seeded placeholder leaked admin-panel terminology to end users. | **Fixed** via migration `0010` (guarded `UPDATE`; `0009` is immutable once recorded). |
| 5 | **P2** | Plan asserted `ClerkProvider` makes the root layout request-scoped — never verified, no build output existed. | **Corrected.** §10 now labels it an unverified assumption to confirm in `npm run build`. |
| 6 | **P3** | Cache tag was `"site-status"` while the feature is "site notice". | **Fixed** to `site-notice` while still unreferenced by any `revalidateTag` call. |
| 7 | **P3** | `SITE_NOTICE_DISABLED` was case-sensitive — a typo during an incident would leave the notice showing, defeating the bail-out's purpose. | **Fixed.** Now `.trim().toLowerCase() === "true"`. Diverges from `config/mentor.ts`'s `=== "true"`, deliberately. |
| 8 | **P3** | Considered an invariant comment on `siteNotices`; dropped — `config/schema.tsx` has zero comments by convention. | **Moved** to §5 prose. |
| 9 | **P3** | `updated_at` has 1-second precision, so same-second saves share a version. | **Documented** in §5. Accepted; not worth a `timestamp(3)` migration. |

Open, carried to later tasks: the `format:check` failure (above), the `Sidebar.tsx` Admin link, and the `feature-tracker` staleness.

---

## 16. Measurement Log — Tasks 3/4 (root layout mount)

Everything below was measured on this machine against the live TiDB instance, not
inferred. Two findings changed the design.

### 16.1 The 60s TTL silently re-rendered 7 routes 1440x/day

`unstable_cache({ revalidate: N })` does not just bound one function call — it
propagates up and becomes the **enclosing route's ISR window**, set to the minimum
across the whole tree. So the ttl chosen in Task 2 was also choosing how often
`/problems`, `/profile` and three other fully static pages re-render.

Built the tree twice, with and without the layout read, and diffed the route table:

| Route | Baseline | TTL 60 | Extra renders/day |
|---|---|---|---|
| `/_not-found` | static | 1m | +1,440 |
| `/interview` | 1h | 1m | +1,416 |
| `/interview/customize` | 1h | 1m | +1,416 |
| `/interview/stack` | static | 1m | +1,440 |
| `/problems` | static | 1m | +1,440 |
| `/profile` | static | 1m | +1,440 |
| `/whats-new` | static | 1m | +1,440 |

That is ~257k extra page regenerations/month against a 1M/month Vercel Hobby
function budget — roughly 26% spent on revalidation before a single real visitor,
and each regeneration re-runs that page's own queries against a 1,100 RU/hour
TiDB tier. Four routes that previously never re-rendered at all were the worst
offenders, because "static" has the most to lose.

**Fix: `SITE_NOTICE_CACHE_TTL = 3600`.** Re-measured — `/interview` and
`/interview/customize` return to their native 1h, and the five static routes move
to 1h, costing 5 x 24/day = ~3,600/month, about 0.36% of budget.

`ttl: false` would cost nothing, but a failed `revalidateTag` would then strand
the notice until the next deploy. 0.36% is a fair price for a bounded worst
case, and admin saves still invalidate instantly.

**Lesson worth carrying:** a cache TTL in a *layout* is a routing decision, not
a caching decision. Always diff the build route table when adding one.

### 16.2 The notice is JS-only — no SSR markup

The `ready` gate (storage is read in an effect, so SSR cannot know whether the
user already dismissed this version) means the component returns `null` during
SSR. Verified: the notice ships only inside the RSC flight payload as component
props; `role="status"` is absent from the server HTML.

**Accepted, deliberately.** The upgrade is a pre-paint inline script that reads
`sessionStorage` and sets `display:none` before first paint — the classic
no-flash pattern. Rejected for now because it adds an inline script, an
id/CSS contract and a hydration-order dependency, and because this app is
unusable without JS regardless (editor, dashboard, community all hydrate). A
maintenance notice that only works with JS has no value on a page that needs JS
to function. Revisit only if a genuinely no-JS route (e.g. a static status page)
ever needs it.

### 16.3 Security check passed

`updated_by` held `"user_test"` in the row. The served HTML for `/` contains the
title and message and **does not** contain `updated_by`. The allowlist projection
holds. Banner chunk is 29.7 KB with no trace of `mysql2`, `drizzle`, or
`config/db` — `import type` is fully erased by SWC, so the root-layout read does
not pull the driver into the client bundle.

### 16.4 Bug found for Task 5: Drizzle silently drops `undefined`

`updateSiteNotice(input, updatedBy)` takes **camelCase** `UpdateSiteNoticeInput`
with `expiresAt: Date | null`. Passing snake_case keys instead does not throw —
Drizzle omits `undefined` keys from the `SET` clause, so the update appears to
succeed while silently persisting the old values. Observed live: `is_enabled`
stayed `false` and `expires_at` stayed `null` while `title`/`severity` updated.

**Consequence for Task 5:** the Zod schema must map to exactly
`UpdateSiteNoticeInput` — same keys, same casing, every field present. A
`passthrough()` or a renamed field produces a save that looks successful and
changes nothing. Consider asserting the parsed shape against the type.

Also noted: `updatedBy` is typed `string` but the column is nullable, so
seeding a system-originated notice needs a cast. The API route always has a Clerk
userId, so this is cosmetic — but `string | null` is the honest signature.

### 16.5 Verification method gotcha

Static routes (`/whats-new`) are prerendered at build time and served from disk
with a 1h window, so they will not reflect a notice enabled after the build
until the window expires. And unauthenticated `/courses` 307-redirects to
`/sign-in`. Both made early `curl` checks look like failures when the feature
was working. Verify against `/` (dynamic, public, 200) and clear
`.next/cache/fetch-cache` after changing notice state locally.

---

## 17. Review Log — Tasks 3/4

A strict self-review of the component and the layout mount. Five findings, all
fixed in the same pass. Recorded because two of them are the kind of thing that
looks correct until someone reads it under a narrow viewport.

| # | Sev | Finding | Resolution |
|---|-----|---------|------------|
| 1 | **P1** | Banner covered the mobile sidebar toggle | `top-0` -> `top-16 lg:top-0` |
| 2 | P2 | `{ Icon: typeof Info }` was a type lie | `LucideIcon` |
| 3 | P2 | `updatedBy: string` but column nullable | `string \| null` |
| 4 | P3 | Comment said "four" fields, there are five | Corrected |
| 5 | P3 | Tailwind class order slip on the message `<p>` | Reordered |

### 17.1 P1 — the banner made mobile navigation impossible

`AppShell.tsx:48` renders the sidebar toggle as `lg:hidden fixed top-3 left-3
z-30 w-9 h-9`. The banner was `fixed inset-x-0 top-0 z-40 p-3` with an inner
`pointer-events-auto mx-auto max-w-3xl`.

Below `sm` the inner box spans the full viewport width, so it sat **on top of**
the 36px toggle — same 12px origin, banner winning on `z-40`, and its
`pointer-events-auto` swallowing the click. With any notice showing, the sidebar
could not be opened on a phone. Desktop was unaffected because the toggle is
`lg:hidden`.

Fix: `top-16 lg:top-0`. The toggle only exists below `lg`, so the banner clears
it (bottom edge 48px vs banner start 64px — 16px of clearance) and returns to
`top-0` on desktop where nothing is in the way. One class, no `AppShell` edit,
mount point unchanged.

**Lesson:** any new `fixed top-*` overlay has to be checked against every other
`fixed` element, not just its own z-index. `z-40` beating `z-30` is only half the
question — the other half is whether they overlap in space. `HelpButton`
(`bottom-5 right-5`) and `Sidebar` (`top-0 left-0`, x <= 256) were both checked
and are clear.

*Known cosmetic limit, not fixed:* the banner is centred on the **viewport**, not
the content column, so at 1024-1280px with the sidebar expanded its left edge
sits under the sidebar (which wins at `z-50`). Inherent to a centred floating
banner; would need a content-width-aware offset to solve.

### 17.2 P2 — `typeof Info` was a type lie

`severityConfig` declared `{ Icon: typeof Info }`, so every icon was typed as the
`Info` component. It typechecks only because all lucide icons share one
`ForwardRefExoticComponent` signature. Replaced with the exported `LucideIcon`.

### 17.3 P2 — `updatedBy` signature lied about the column

`updateSiteNotice(input, updatedBy: string)` against a nullable `updated_by`
column. Seeding a system-originated notice needed `null as unknown as string` —
a cast that existed only to satisfy a wrong signature. Now `string | null`. The
API route always has a Clerk userId, so this changes no caller, but the function
no longer forces a lie.

### 17.4 P3 — stale comment in my own code

The `ActiveSiteNotice` doc comment read "an allowlist of **four** primitive
fields" while the type has **five**. It predated adding `version` and was never
updated. Bad because the number is the whole point of the comment: it is what a
future reader checks before adding a sixth field, and a wrong count there is how
`updated_by` eventually leaks.

### 17.5 Nits

Tailwind class order on the message `<p>` (`whitespace-pre-line` before
`text-muted-foreground`) broke the alphabetical ordering used elsewhere in the
file. Prettier did not catch it — the tailwind plugin is not enforcing order on
this file — so it was fixed by hand.

The dismissal effect also depended on `[notice]`, a fresh object on every Server
Component layout render, so `sessionStorage` was re-read on every client-side
navigation. Now keyed on `notice?.version`, which is the actual trigger and
matches the intent.

### 17.6 Re-verified after the fixes

Typecheck and Prettier clean. `npm run build` route table byte-identical to
before the fixes. Banner chunk still 29.7 KB with no `mysql2`, `drizzle` or
`config/db` trace.

---

## 18. Task 5 Notes — `PATCH /api/admin/site-notice`

### 18.1 `revalidateTag` needs a profile in Next 16

The plan's snippet was `revalidateTag(SITE_NOTICE_CACHE_TAG)`. That does not
compile — Next 16 requires a second argument:

```ts
revalidateTag(tag: string, profile: string | CacheLifeConfig): undefined
```

Used `{ expire: 0 }` rather than a named profile. `CacheLifeConfig` is
`{ expire?: number }`, and `expire: 0` means "already expired", giving
read-your-own-writes: the admin's next read is a cache miss. A named profile
such as `"max"` would also work but leaves the semantics implicit.

`updateTag(tag)` is the stronger primitive but is **Server-Action-only** — its
own doc comment says so — so it is not available from a Route Handler. If this
write ever moves to a Server Action, prefer `updateTag`.

### 18.2 The proxy masks every unauthenticated response code

`proxy.ts` calls `auth.protect()` for every route outside
`/sign-in(.*)`, `/`, `/whats-new`, `/api/health(.*)`. So an unsigned `PATCH` to
this endpoint returns **307 to /sign-in**, not the handler's 401. Same for a
`GET`, which would otherwise be 405.

The handler's `auth()` / `isAdmin()` checks are therefore defense-in-depth rather
than the first line of defence. Kept anyway — required by the project standard,
and the proxy must not become the only gate on a write endpoint.

Consequence: the 200 / 403 / 400 branches cannot be exercised without a real
signed-in admin session. See 18.4.

### 18.3 Validation and mapping verified

Ran the schema through 8 cases; the parse results are the 400 path:

| Case | Result |
|---|---|
| valid full body | pass |
| `expiresAt: null` | pass |
| `expiresAt: "2026-09-30T06:22"` (`datetime-local`) | **reject** |
| missing `severity` | **reject** |
| `severity: "urgent"` | **reject** |
| `title: "   "` (whitespace only) | **reject** |
| `title` 121 chars (column is `varchar(120)`) | **reject** |
| `isEnabled: "true"` (string) | **reject** |

Then the full post-auth path: parse -> map -> `updateSiteNotice` -> read back.
All six keys present, no `undefined` anywhere (the 16.4 silent-drop condition),
`expiresAt` a real `Date`, read-back matched exactly.

Note `datetime-local` is rejected on purpose. The Task 6 client must send
`new Date(localValue).toISOString()`, or every expiry save 400s.

### 18.4 Not verified — needs a signed-in admin session

`ADMIN_EMAILS` / `ADMIN_CLERK_IDS` are set in `.env`, so `isAdmin` will resolve
for a real session, but a Clerk cookie cannot be forged locally. Untested:

- 200 on a valid admin PATCH
- 403 for a signed-in non-admin
- 429 after 10 saves in a minute
- that `revalidateTag(..., { expire: 0 })` actually invalidates at runtime

That last one is the one to watch. The call is typechecked, but nothing in this
environment proves the cache is really dropped — and if it silently does
nothing, the admin saves and the banner does not move for up to an hour, with no
error to explain it. Test it by saving in the admin form and reloading `/`
without a redeploy.

---

## 19. Review Log — Task 5

Three findings, all fixed. No security or performance defects.

| # | Sev | Finding | Resolution |
|---|-----|---------|------------|
| 1 | **P2** | Write failure reason discarded | `log.error` with the error in both catches |
| 2 | **P2** | `revalidateTag` unguarded after a committed write | Own `try`, logs and continues |
| 3 | P3 | Value + type imports split across two statements | Merged |

### 19.1 The swallowed error was hiding a real diagnostic

Both `catch` blocks discarded the error and returned a bare 500.
`withRequestLog` does record the 500 *status*, so the failure was visible, but
not the reason.

Proved the gap by forcing a real one — a 121-char `title` against a
`varchar(120)`:

```
cause: Error: Data too long for column 'title' at row 1
  code: 'ER_DATA_TOO_LONG'  errno: 1406  sqlState: '22001'
  at updateSiteNotice (lib/site-notice.ts:190:15)
```

That is what the log line now carries. Before, it was a 500 and a shrug.

> **Corrected in §20.** The three diagnostic fields above are on the error's
> `cause`, and the production branch of the logger dropped `cause` entirely —
> so in production this log line did **not** carry them. It also inlined the
> bound parameters four times over. `lib/logger.ts` was fixed; the claim is only
> true now.

Two things this also settled:

1. **MySQL is in strict mode.** The over-length value was *rejected*, not
   silently truncated, and the `ON DUPLICATE KEY UPDATE` rolled back cleanly
   (`updated_at` unchanged afterwards). So Zod's `.max(120)` is real defence in
   depth against the column, not just a cosmetic bound.
2. **`lib/site-notice.ts` logs success but never failure.** `log.info` on the
   happy path, `log.error` only inside `fetchRow`. An `updateSiteNotice` throw
   had no trace at all. The route now covers that.

Note the three existing `app/api/admin/*` routes all swallow the same way, and
`lib/` already had the right pattern (`admin-users.ts:254`). This is a new
instance of a codebase habit, not a novel mistake — fixed here, not refactored
across the others, since that would be an unrelated diff.

### 19.2 A committed write must not report failure

`revalidateTag` ran after the upsert, outside any `try`. If it threw, the
exception escaped `withRequestLog` (which is `try/finally`, no `catch`) and the
admin got a 500 — **with the row already written.**

The natural client response is to retry, and a retry bumps `updated_at` again,
which **re-announces the notice to every user who had already dismissed it**.
Small chance, bad outcome: a self-inflicted site-wide notification.

Now wrapped separately, logging and returning 200 on failure. The write did
succeed, so reporting success is the truth, and the 1h TTL is precisely the
backstop for a missed invalidation — the two decisions now line up instead of
contradicting each other.

### 19.3 Not fixed, deliberately

`const admin = await isAdmin(userId)` names a boolean like an entity. Three
sibling admin routes do the same; `isAdmin` itself is well named. Diverging one
route for style costs more in consistency than it returns. Left alone, recorded
here so the choice is deliberate.

## 20. Review Log — `lib/logger.ts` error serialization

Surfaced by reviewing my own §19.1 fix. **The claim in §19.1 was wrong, and
wrong only in production** — which is the branch that actually ships.

### 20.1 The correction

§19.1 stated the new `log.error` carries `code: 'ER_DATA_TOO_LONG'`. I verified
that in **dev**, where `emit` hands the raw error object to `console.error` and
every own property prints. I never checked the production branch, which
serializes first:

```ts
// before
function serializeError(err) {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return err;
}
```

`cause` is never touched. On a Drizzle error that is the worst of both worlds at
once:

- `message` **and** `stack` both inline the **bound parameter values**, and an
  `ON DUPLICATE KEY UPDATE` repeats them — so the full `title` (120) +
  `message` (2000) and the admin's `updated_by` Clerk ID were written **four
  times per failed save**.
- `cause` — where `code` / `errno` / `sqlState` actually live — was **dropped**.

The log line carried the payload four times and the diagnosis zero times.
Measured on a real forced `ER_DATA_TOO_LONG`, production serialization, before
the fix:

```
{"error":{"name":"Error",
  "message":"Failed query: insert into `site_notices` (…) values (?, ?, …)
              on duplicate key update …\nparams: 1,false,info,banner,yyy…(121),m,,
              false,info,banner,yyy…(121),m,,",
  "stack":"Error: Failed query: …\nparams: 1,false,info,banner,yyy…(121),…
              at MySql2PreparedQuery.queryWithCache (…/session.ts:79:11) …"}}
```

### 20.2 Why it was still worth fixing now

Severity for *this* endpoint is genuinely low, and the plan should say so rather
than inflate it:

- the notice is public by definition — it is rendered to every visitor;
- the Clerk ID in `updated_by` belongs to the admin making the request;
- **no secret reaches a log line on this path.** Checked: `withConnectRetry`
  logs only `extractCode(error)`, and mysql2 connection errors carry
  host/port and sometimes a username, never the password.

The risk is the **pattern**, not this endpoint. §19.1 recommended `log.error` as
*the* correct response to a swallowed failure, and there are **43 `log.error`
call sites** in the repo. Copied to a route handling profile edits, feedback
tickets, or user sync, the same serialization puts real user PII into Vercel
logs four times over, unredacted — while still hiding the error code that would
tell you what broke.

### 20.3 The fix — `lib/logger.ts` only, no call-site changes

Root cause is shared infrastructure, so that is where it was fixed. Three parts:

1. **Walk `cause`**, bounded by `MAX_CAUSE_DEPTH = 3`, emitting
   `[cause chain truncated]` at the limit. A self-referential `cause` chain
   would otherwise hang the logger on a log call.
2. **Redact bound params** from `message` and `stack` while **keeping the query
   shape** — *which* statement failed is the diagnostic; the values are the leak.
3. **Surface `code` / `errno` / `sqlState` / `sqlMessage`** off the cause, since
   those are the fields that identify a database failure.

After, same forced failure:

```
message      : Failed query: insert into `site_notices` (…) values (?, ?, …)
               params: [redacted]
code         : ER_DATA_TOO_LONG
sqlState     : 22001
sqlMessage   : Data too long for column 'title' at row 1
stack frames : 6 preserved
leaks title  : false
log bytes    : 2520
```

Payload gone, code present, query still identifiable. §19.1's claim is now
actually true rather than accidentally true in dev.

**No call site needed changing.** `log.error(msg, err, ctx)` has the same
signature and the same dev behaviour — dev still receives the raw error object
with everything on it, which is the right local-debugging experience. Only the
production serialization got safer, so all 43 sites improve for free.

### 20.4 The multi-line trap — why redaction cannot be line-based

The obvious implementation is `text.replace(/^params: .*$/gm, ...)`. **It is
wrong for this feature.** The notice `message` is admin-authored and multi-line
*by design* — `SiteNoticeBanner` renders it with `whitespace-pre-line`. A newline
inside a bound param value breaks the line anchor, and every line after the
first leaks:

```
params: 1,Heads up
SECOND LINE OF THE NOTICE,second-leak
```

Hence the lookahead instead of an anchor:

```ts
const SQL_PARAMS = /params: [\s\S]*?(?=\n\s+at\s|$)/g;
```

Lazy match terminating at either a stack frame (`\n    at `) or end of string.
One pattern covers params in `message`, params in `stack`, and params containing
newlines. Verified against a deliberately two-line secret in a param value: fully
redacted.

**Accepted cost:** a param value containing the literal text `\n    at ` would be
under-redacted for that fragment. The regex fails toward a *longer* log line,
never a shorter one, which is the correct direction for a redaction rule.

### 20.5 Verified

| Case | Result |
|------|--------|
| Real Drizzle `ER_DATA_TOO_LONG` | params redacted, `code` + `sqlState` + `sqlMessage` present, 6 frames kept |
| Param value containing a newline | fully redacted, no second-line leak |
| Params in `stack` only | redacted; `at foo` / `at bar` frames after it **survive** |
| Plain `Error`, no `cause` | unchanged, `cause` omitted rather than `undefined` |
| Circular `cause` chain (a→b→c→d→a) | terminates at 4 levels, no hang |
| Non-`Error` thrown | passed through unchanged, as before |
| Live DB row after forced failure | `updated_at` unchanged — the upsert still rolls back cleanly |

`npm run typecheck` and Prettier both clean across `lib/logger.ts`,
`app/api/admin/site-notice/route.ts`, `config/rate-limits.ts`,
`lib/db-rate-limit.ts`.

## 21. Task 6 Notes — admin page + form

`app/admin/site-notice/page.tsx` (Server Component) +
`_components/SiteNoticeForm.tsx` (`"use client"`). This is what makes the
notice usable at all — through Task 5 the only way to change the row was by
hand in the DB.

### 21.1 The form calls the endpoint, not a server action

The page could have written via a server action calling `updateSiteNotice`
directly, which would have skipped the HTTP round trip and needed no client
component at all. It went with `fetch` against the PATCH endpoint instead:

- **One source of validation.** The Zod schema lives in the route. A server
  action would either duplicate it or need the schema extracted to a third
  module. Duplicating validation is how "the form accepted it but the API
  rejected it" bugs are born.
- **Rate limiting applies.** `enforceDbRateLimit` returns a `NextResponse`,
  which is awkward to surface from a server action. Going through the endpoint
  means the documented 10 req/min is actually enforced on this path.
- **It exercises the code that was already reviewed and committed.** A server
  action would be a second, unreviewed write path sitting next to the first.

Cost: one HTTP round trip on a form save that is already behind a button
press and a 1s spinner. Negligible. Recorded because the trade-off was real,
not because it was close.

### 21.2 `force-dynamic` on the page

Not for data freshness — the PATCH calls `revalidateTag`, and `force-dynamic`
sidesteps cache semantics entirely for an edit surface. If an admin saves,
navigates back, and sees stale fields, the reasonable conclusion is "the save
failed". That is a worse outcome than one extra query on a page almost nobody
loads. Admin traffic is negligible, so caching buys nothing worth the risk.

### 21.3 The build-breaker this task walked into

The first draft of the form imported **values** from `@/lib/site-notice`:

```ts
import {
  SITE_NOTICE_DISPLAYS,
  SITE_NOTICE_SEVERITIES,   // <- values, not types
  type SiteNoticeDisplay,
  type SiteNoticeSeverity,
} from "@/lib/site-notice";
```

`tsc` passed. `next build` did not:

```
Module not found: Can't resolve 'net'
  mysql2 -> config/db -> lib/site-notice -> SiteNoticeForm.tsx [Client Component Browser]
```

`lib/site-notice.ts` imports `config/db`, so importing any **value** from it
in a `"use client"` file drags mysql2 and the Node `net`/`tls`/`timers`
builtins into the browser bundle. Type-only imports are erased and stay safe,
which is why `SiteNoticeBanner`'s existing `import type { ... }` never tripped
this.

This is the same leak the Known Debt entry about the banner chunk guards
against, reached from the opposite direction: not a stray spread, just the
wrong kind of import.

**Fix:** vocabulary moved to `config/site-notice.ts`, which has zero imports.
`lib/site-notice.ts` now `import`s it rather than re-exporting — a re-export
would have left the trap armed for the next client component. Verified the
form's client chunk contains zero driver symbols.

General rule: **if a module reaches `config/db`, a client component may only
ever `import type` from it.** Values go in `config/`.

### 21.4 Two hydration/detail bugs caught in self-review

**The "in the past" hint went stale.** It sampled the clock once in an effect,
so a form left open past the expiry kept reporting "future" indefinitely. Now
a 30s interval re-samples, cleared on unmount.

**The first fix for it was itself a hydration bug.** `expiryInPast` originally
called `Date.now()` during render. That runs on the server for SSR *and* again
on the client — an expiry landing inside the gap makes the two disagree and
React complains. The fix is the same pattern `SiteNoticeBanner` already uses for
`sessionStorage`: a client-only clock that is `null` until the first effect.

### 21.5 An unparsable expiry used to silently clear itself

`resolvedExpiry` went `null` both for an empty field *and* for garbage the
browser couldn't parse. Empty is legitimately "no expiry", so the submit path
serialized `expiresAt: null` — meaning a fat-fingered `datetime-local` value
**silently wiped an expiry the admin believed they had set**, and the save
succeeded.

Split into `parsedExpiry` (raw `Date`, possibly Invalid) and `resolvedExpiry`
(valid or `null`), with `expiryInvalid` distinguishing the two cases. Garbage
now shows an error and blocks the save. Verified:

```
input=""                 invalid=false  payload=null              <- cleared, intended
input="2026-10-05T14:30" invalid=false  payload=2026-10-05T08:30:00.000Z
input="abc"              invalid=true   <- was silently null before
input="2026-10-05T"      invalid=true   <- partial typing caught too
```

### 21.6 Error surfacing, deliberately not copied

The mutation shape was copied from `FeedbackDetailDialog.handleSave`, but its
error handling was not. That component does `if (res.ok) { ... }` and nothing
else, so a failed save is indistinguishable from no-op. This form reads
`{ error }` from every response shape and appends `Retry-After` on a 429.

### 21.7 Column widths were three copies of the same number

`120` and `2000` appeared in the form's `maxLength`, in the route's Zod schema,
and in the `varchar` width. Now `SITE_NOTICE_TITLE_MAX` /
`SITE_NOTICE_MESSAGE_MAX` in `config/site-notice.ts` feed all three, including
`config/schema.tsx`. `drizzle-kit generate` confirms **no schema change** — the
constant is structurally identical to the literal it replaced.

### 21.8 Timezone handling

`datetime-local` is a local wall time; the API wants full ISO with an offset.
The conversion is mandatory, not stylistic — verified that
`new Date(local).toISOString()` passes the schema and a raw `datetime-local`
value is rejected.

The form shows the resolved UTC value and warns when it is in the past, because
"2026-10-05 14:30" is ambiguous without knowing the admin's zone. Round-trip
is stable across six timezones including UTC+14 and UTC−11;
`Pacific/Midway` correctly renders the *previous* day, so the local-date math
crosses date boundaries and not just time-of-day.

### 21.9 Not fixed, deliberately

| Item | Why left |
|------|----------|
| `maxLength` counts raw, Zod counts trimmed | A 120-char title plus trailing spaces passes `maxLength` and fails the API. Fixing means counting `trim().length` and adding slack to `maxLength`, which then makes the counter and the limit visibly disagree. Real edge case, needs a decision rather than a guess. |
| Clock does not re-sample on tab focus | The 30s interval covers it, but a backgrounded tab throttles timers so the hint can lag up to a minute on refocus. A `visibilitychange` listener is more machinery than a warning label warrants. |
| Rate-limit message not localised to the field | Server-side rate limiting is the correct enforcement point; the client hint is a nicety. |

### 21.10 Verified

- Form payload accepted by the route's schema in all 5 shapes — with expiry,
  null expiry, whitespace-padded fields, multi-line message, 120-char boundary.
  All 3 negative cases the UI must block are rejected.
- `config/schema.tsx` edit briefly nested an `import {` inside another while
  adding the constant. Caught by `npm run typecheck`, fixed, `drizzle-orm`
  import kept first. Noted because it is what the gates are for.
- typecheck, Prettier, build all clean; `/admin/site-notice` registers dynamic;
  client chunk free of mysql2/Drizzle symbols.

**Not verified — needs a signed-in admin:** the live cache invalidation
(`revalidateTag(..., { expire: 0 })` actually busting the banner without a
redeploy), the `/admin` exemption, and mobile layout. There is also still no
nav link to this page — Task 7.
