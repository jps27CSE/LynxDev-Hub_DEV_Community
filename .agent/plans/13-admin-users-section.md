# Admin Users Section — Finalized Feature Spec (Free-Tier Safe)

> **Date:** 2026-09-22
> **Status:** Task 5 — Done (Build Mode, uncommitted) — Strict Review Fix applied 2026-09-24
> **Scope:** Expand `Admin Panel > Users` — list usernames + safe admin actions
> **Progress:** ✅ Tasks 1-5 complete 2026-09-22/24 — Tasks 6-11 pending
> **Stack:** Next.js 16 App Router (Server Components default), Clerk `auth()`, Drizzle + TiDB MySQL (pool `connectionLimit:5`), Tailwind v4 + shadcn/ui, Vercel Hobby Free, TiDB Cloud Starter Free
> **Constraint:** Zero cost forever — every query paginated (20), rate-limited, batched. No feature may exhaust 50M RU/month or 100GB bandwidth.

---

## 1. Business Problem

Admin can see `Total Users` count on `/admin` (`lib/feedback-data.ts:338 getAdminOverview` 6×`count()`), but cannot list users, search by name/email, or inspect enrollments/feedback per user. Support requires username lookup + drill-in without burning RU/bandwidth.

**Goal:** Read-only observability first, safe moderation second. Incremental delivery.

---

## 2. Finalized Features — Included vs Excluded (Free-Tier Rationale)

### ✅ INCLUDED — Phase 1 (Ship First, Zero Migration)

| # | Feature | What it does | Why included (cost) |
|---|---------|--------------|---------------------|
| **U-01** | **Paginated Users Table** `/admin/users` | Columns: `Name (avatar fallback) · Email · Points · Enrollments # · Feedback # · Subscription`. `20/page` fixed, `offset` pagination, `orderBy desc(id)` default. Server Component fetches via `lib/admin-users.ts`, passes props to Client table. Reuses `app/admin/feedback/_components/FeedbackTable.tsx` pattern. | **~5-10 RU** per page: single `SELECT ... LIMIT 20 OFFSET x`. ~3KB JSON. Safest primitive. Mirror `feedback-data.ts:118` `PAGE_SIZE=20`. |
| **U-02** | **Search (name/email)** | Query param `?q=jacks`, debounced 300ms client, `q.length >=2` enforced server, `truncateSearch 100` + `escapeLike` (`feedback-data.ts:42-50`) + `LIKE '%q%'` with `LIMIT 20`. URL-synced (`router.push ?q=&page=`). | Cheap *with guardrails*: 1 query capped 20 rows. Without guardrails = full scan → 100 RU. Rate-limit 20/min prevents spam. |
| **U-03** | **Sort + Filter (minimal)** | Sort: `newest (id desc)` / `points desc` / `name asc` — whitelist 3 values only (Zod enum). Filter: `subscription` (if used) — `WHERE subscription=?`. | Whitelist avoids dynamic `ORDER BY` injection. Requires indexes only if sort on `points` — add `INDEX(points)` lazily. |
| **U-04** | **User Detail Drawer** | Click row → `Dialog` (reuse `FeedbackDetailDialog.tsx:52` pattern). Header: name/email/bio/skills/points. Tabs lazy-loaded: (a) **Enrollments** with progress bar (reuse `lib/enroll-data.ts:100 fetchEnrollments` batched `inArray`), (b) **Feedback tickets** submitted by user (reuse `feedback_user_idx`). No `mentor_conversations` in v1. | **~15 RU** per open: 1 user query + 1 batched enrollments query + 1 feedback count. Batched via `Promise.all`, not N+1 loop. Tabs fetch on demand. |
| **U-05** | **Stat Strip (light)** | Above table: `Total Users` (from cached `getAdminOverview` or `SELECT COUNT(*) FROM users`), `New (7d)` only after `created_at` migration. No charts in v1. | Reuse existing `OverviewStats.tsx` — no new 6×`count()` burst. `React.cache()` dedup per request (`lib/feedback-data.ts:333`). |
| **U-06** | **Pagination + Empty/Error/Loading States** | Clamped `page 1..500` (`FEEDBACK_MAX_PAGE:36`), `hasMore` boolean, skeleton `components/ui/skeleton.tsx`, dark-mode + responsive overflow. | Prevents `?page=99999` DoS (`feedback-data.ts:38 clampPage`). Zero extra cost. |
| **U-07** | **Sidebar Link + Auth Guard** | Add `{label:"Users", href:"/admin/users", icon:Users}` to `app/admin/_components/AdminSidebar.tsx:14`. Guard `app/admin/layout.tsx:14 isAdmin()` + every `app/api/admin/users/*` with `auth()`+`isAdmin()`+`enforceDbRateLimit`. | Zero RU, reuses `lib/admin-auth.ts:27` fast-path `ADMIN_CLERK_IDS`. Fail-closed if env empty. |

**Outcomes:** Admin can answer "who is this user, what courses/tickets do they have" in 2 clicks, <20 RU per interaction, <5KB payload — safe for 500 users on free tier.

### ✅ INCLUDED — Phase 2 (One Migration, Only If Needed)

Requires `drizzle-kit generate` migration `0010` (or `0009` if no pending):

```sql
ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL;
ALTER TABLE users ADD COLUMN is_banned BOOLEAN DEFAULT FALSE NOT NULL;
CREATE INDEX users_created_at_idx ON users(created_at);
CREATE INDEX users_points_idx ON users(points);
```

| # | Feature | Condition to ship | Cost |
|---|---------|-------------------|------|
| **U-08** | **Joined Date + Sort by Newest** | Ship only with `created_at` migration. Enables `ORDER BY created_at DESC` and `New (7d)` stat. | One-time DDL, indexed sort = ~8 RU vs filesort 40 RU. |
| **U-09** | **Ban / Unban (DB flag)** | Soft ban: `PATCH /api/admin/users/[id]/ban {is_banned:boolean, reason?}` sets flag. App checks `is_banned` at login (middleware or `getUserByClerkId` wrapper) and shows `/banned`. No `clerkClient.users.banUser` in v1 (saves Clerk API quota). | 1 `UPDATE` (~5 RU), no Clerk API. Safer than hard delete (keeps FK). |
| **U-10** | **Points Adjustment** | `PATCH /api/admin/users/[id]/points {delta:number, reason:string}` Zod `delta -1000..1000`, audit log via `createLogger`. | 1 `UPDATE` (~5 RU). Rate-limit `10/min`. Avoids abuse. |

> **Do not ship Phase 2 before Phase 1 is verified on production** (`npm run dev` + `/admin/users` as admin vs non-admin).

### ❌ EXCLUDED — Eats RU / Bandwidth on Free Tier (Do Not Ship)

| Feature | Why excluded | RU / Bandwidth hit |
|---------|--------------|--------------------|
| **Show All / unbounded `SELECT *` without `LIMIT`** | `10k users × 500B = 5MB` JSON exceeds Vercel 5MB response, hits TiDB `256 MiB` query memory (`docs/production-review-500-users.md:14`), pool stall 15s. | 5k+ RU + 5MB bandwidth per request |
| **Live search per keystroke (no debounce)** | 1 scan per key × 500 admin loads = 10k scans/day | Exhausts 50M RU in days |
| **CSV Export ALL users** | 10k rows = 2-5MB, 10-15s CPU stringify → Vercel 60s timeout risk, holds pool slot, 500 exports/mo = 2.5GB bandwidth. | 75 RU + 5MB + 5s CPU each |
| **Bulk actions >20 users** | Large `UPDATE ... WHERE id IN (100)` locks rows, burns RU, long txn. | 50+ RU + lock contention |
| **4-table timeline (users+enrollments+feedback+mentor)** | 4-way join per detail = heavy. | 40-80 RU per detail |
| **Realtime polling 5s** | 12 req/min per open tab × admins. | 12× RU multiplier |
| **recharts growth chart in initial load** | `+85KB` bundle (`package.json:66`) on every admin page. | Bandwidth + CPU |
| **Hard delete user** | Breaks `enrollments.user_id FK`, loses audit. Use `is_deleted` soft delete + cron `vercel.json:3` `0 3 * * *`. | Write amplification |
| **Full-text `LIKE '%term%'` without limit / prefix** | Leading `%` cannot use btree index → full scan. | 100 RU at 10k rows |
| **Impersonate / View-as without audit** | Security risk, log burden. | Not needed for 1 admin |

**Rule:** If a feature needs `SELECT without LIMIT`, `LIKE` without cap, `N+1 loop`, or `>1MB response`, it fails the free-tier gate.

---

## 3. Architecture (Free-Tier Optimized)

### File Tree (every file justified)

```
app/admin/layout.tsx                          # existing guard — isAdmin() check, no change
app/admin/_components/AdminSidebar.tsx        # +Users link (Users icon)
app/admin/page.tsx                            # existing OverviewStats — no change (reuse for strip)
app/admin/users/page.tsx                      # NEW Server Component — data boundary, parse searchParams, call lib (Task 5 Done 2026-09-24)
app/admin/users/loading.tsx                   # NEW Skeleton — table placeholder for Suspense (Task 5 Strict Fix)
app/admin/users/_components/UsersTable.tsx    # NEW Client — search input (debounced 300ms), sort/filter, table, pagination
app/admin/users/_components/UserDetailDialog.tsx # NEW Client — Dialog, lazy tabs (Enrollments, Feedback)
# Optional alt: app/admin/users/[id]/page.tsx — full page detail if deep-link needed (pick dialog first)
app/api/admin/users/route.ts                  # NEW GET — Zod→auth→isAdmin→rateLimit→Drizzle (Strict Fix: validate before rateLimit)
app/api/admin/users/[id]/route.ts             # NEW GET single + PATCH (Phase 2: ban/points) — Zod→auth→isAdmin→rateLimit (Strict Fix: params first)
lib/admin-users.ts                            # NEW data layer — getUsersPaginated(q,sort,subscription,page), getUserWithStats(id) (Strict Fix: lean list projection, no clerk_id leak)
config/rate-limits.ts                         # +2 scopes: admin-users 20/min, admin-users-detail 30/min
drizzle/0010_*.sql                            # Phase 2 only: created_at, is_banned, indexes
```

### Component Boundaries

*   **Server:** `app/admin/users/page.tsx` (also `UserDetailDialog` data if page variant). Fetches via `lib/admin-users.ts` with `cache()` + `withConnectRetry` (`config/db.tsx:18` pool 5).
*   **Client leaves only:** `UsersTable.tsx`, `UserDetailDialog.tsx` — `"use client"` for `useState`, `useRouter`, `debounce`.
*   Reuse: `components/ui/{table,dialog,badge,input,select,skeleton,pagination}`, `cn()` (`lib/utils.ts`), `lucide-react: Users`.

### Data Flow

```
List:  page.tsx --searchParams--> getUsersPaginated(q, sort, subscription, page) primitive args (React.cache dedup-safe)
       → Drizzle .select({id,name,email,points,subscription}).from(usersTable) — lean list, no clerk_id/bio/skills leak
         .where(and(like?name/email, eq?subscription)).orderBy(...).limit(20).offset(...)
       → props → UsersTable (client filters via ?q= → server refetch) + loading.tsx skeleton while Suspense

Detail: row click → Dialog → GET /api/admin/users/[id] (detail keeps clerk_id/bio/skills)
        → Promise.all([getUserById, fetchEnrollments(userId), getFeedbackByUserId])
        → batched, inArray where needed, tabs lazy
```

### DB Changes

**Phase 1:** None — uses `config/schema.tsx:14 usersTable` as-is (`id, clerk_id, name, email, bio, skills json, points, subscription`). No storage impact.

**Phase 2 migration (deferred):** `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`, `is_banned BOOLEAN DEFAULT FALSE`, `banned_reason TEXT nullable`, `banned_at TIMESTAMP nullable`, indexes `users_created_at_idx`, `users_points_idx`. Storage: +~16 bytes/row, <1MB for 10k users. Under 20 tables limit.

### API Contract (Standard: `lib/api-error.ts`)

```
GET /api/admin/users?q=&sort=newest|points|name&page=1
  1. Zod: q ≤100 (empty→undefined), page 1..500, sort enum (Strict Fix: validate before auth to save quota)
  2. auth() → 401
  3. isAdmin() → 403
  4. enforceDbRateLimit("admin-users", "/api/admin/users", "GET") 20/min → 429 Retry-After
  5. getUsersPaginated(q,sort,subscription,page) → Drizzle lean list {id,name,email,points,subscription} limit 20, escapeLike(truncateSearch(q))
  6. → {data: AdminUserRow[], total, page, hasMore} 200; throw → 500

GET /api/admin/users/[id]
  1. Zod id ^\d+$ → 400 (validate before auth)
  2. auth→401, isAdmin→403, rateLimit 30/min → 429
  3. getUserWithStats(id) → {id,clerk_id,name,email,bio,skills,points,subscription,enrollmentsCount,feedbackCount} 200 / 404 / 500

PATCH /api/admin/users/[id]/ban          (Phase 2) — {is_banned, reason?} 10/min
PATCH /api/admin/users/[id]/points       (Phase 2) — {delta, reason} 10/min
```

Errors: `{error:string, details?:unknown}` — never leak internals. `withRequestLog` (`app/api/admin/overview/route.ts:10` pattern).

### Free-Tier Safeguards Checklist

*   [ ] Pagination `LIMIT 20` fixed, `clampPage` (`feedback-data.ts:38`)
*   [ ] `escapeLike` + `truncateSearch(100)` on `q`
*   [ ] Debounce 300ms, min 2 chars, no live per-keystroke
*   [ ] Whitelisted sort enum, no dynamic `sql` string
*   [ ] No `SELECT *` unbounded, no `JOIN` without limit
*   [ ] Batched `inArray()` not N+1 loop (`enroll-data.ts:122`)
*   [ ] `cache()` per request, `withConnectRetry` for TiDB wake (`lib/db-retry.ts:47`)
*   [ ] Pool `connectionLimit:5` respected — no `Promise.all` >5 heavy queries (`config/db.tsx:18`)
*   [ ] Rate limits DB-backed (`lib/db-rate-limit.ts`, `rate_limits` table) — 20/min users, 5/min ban/points
*   [ ] Soft delete `is_deleted` pattern if delete ever added (`feedbackTickets.is_deleted:168`)
*   [ ] Dark mode + responsive table overflow handled
*   [ ] No file uploads, no `recharts` eager load, images via Clerk CDN

---

## 4. Tasks (Sequential, <30 min each, One Agent at a Time)

| # | Task | Files | Depends | Status | Verify |
|---|------|-------|---------|--------|--------|
| 1 | Data layer `lib/admin-users.ts` — `getUsersPaginated`, `getUserWithStats` (pure Drizzle, batched, `cache()`, `withConnectRetry`), types `UserRow` | `lib/admin-users.ts` | — | **✅ Done 2026-09-22** — `tsc --noEmit` pass, `next build` pass, no N+1 | 
| 2 | Rate limits — add `admin-users` + `admin-users-detail` scopes | `config/rate-limits.ts` | — | **✅ Done 2026-09-22** — `admin-users 20/min`, `admin-users-detail 30/min`, scopes `lib/db-rate-limit.ts:12` |
| 3 | API `GET /api/admin/users` — Zod→auth→isAdmin→rateLimit→query→200 `{data,total,page,hasMore}` | `app/api/admin/users/route.ts` | 1,2 | **✅ Done 2026-09-23** — `c78fa5f`, `tsc` ✅, `build` ✅ (`ƒ /api/admin/users`) |
| 4 | API `GET /api/admin/users/[id]` — single user + enrollments/feedback counts | `app/api/admin/users/[id]/route.ts` | 1,2 | **✅ Done 2026-09-23** — `tsc` ✅, `build` ✅ (`ƒ /api/admin/users/[id]`) |
| 5 | Page `app/admin/users/page.tsx` Server — parse `searchParams`, call lib, handle empty/error/skeleton | `app/admin/users/page.tsx` + `app/admin/users/loading.tsx` | 1,3 | **✅ Done 2026-09-24** — Server `force-dynamic`, `buildUsersHref` keeps `subscription`+`q`+`sort`+`page`, `PaginationLink` span when disabled, `ADMIN_USERS_PAGE_SIZE`/`MAX_SEARCH_LENGTH` shared, error UI on throw, `loading.tsx` skeleton; `tsc` ✅ `build` ✅ (`ƒ /admin/users`) |
| 6 | `UsersTable.tsx` Client — table, debounced search, sort select, pagination (reuse `FeedbackTable.tsx` URL pattern) | `app/admin/users/_components/UsersTable.tsx` | 3,5 | ⬜ Pending |
| 7 | `UserDetailDialog.tsx` Client — Dialog, lazy tabs Enrollments (progress bar) + Feedback, reuses `fetchEnrollments` | `app/admin/users/_components/UserDetailDialog.tsx` | 4,5 | ⬜ Pending |
| 8 | Sidebar + header polish — add Users link, badge `totalUsers` optional | `app/admin/_components/AdminSidebar.tsx`, `app/admin/_components/AdminHeader.tsx` | 5 | ⬜ Pending |
| 9 | Self-review + harden — `npm run typecheck`, `npm run build`, ENGINEERING checklist | — | 1-8 | ⬜ Pending |
| 10 | **Phase 2 (deferred)** Migration `created_at` + `is_banned` + indexes | `config/schema.tsx`, `drizzle/*` | 1-9 | ⬜ Deferred |
| 11 | **Phase 2 (deferred)** `PATCH ban/points` | `app/api/admin/users/[id]/route.ts` | 10 | ⬜ Deferred |

### Changelog

*   **2026-09-22 Task 1 Done:** Created `lib/admin-users.ts:1` — `PAGE_SIZE=20`, `ADMIN_USERS_MAX_PAGE=500`, `AdminUsersSort`, `AdminUserRow/Detail`, `clampAdminUsersPage`, `escapeLike` + `truncateSearch`, `getUsersPaginated` (count+rows `Promise.all`, `q≥2` OR `like(name/email)`, `subscription` filter, whitelisted sorts `newest→desc(id)` / `points→desc(points)` / `name→asc(name)`, batched `inArray` counts for `enrollmentsCount`/`feedbackCount`), `getUserWithStats` (single + 2 counts). Verified `npm run typecheck` ✅, `npm run build` ✅ (16.7s, 33/33 pages). Uncommitted per Human Verification Gate.
*   **2026-09-22 Task 2 Done:** Added `config/rate-limits.ts:93` scopes `GET /api/admin/users 20/min`, `GET /api/admin/users/[id] 30/min` + `lib/db-rate-limit.ts:13` `RateLimitScope` `admin-users|admin-users-detail`. Verified `tsc --noEmit` ✅, `build` ✅.
*   **2026-09-22 Task 2 Fix:** Renamed phantom `"/api/admin/users/detail"` → `"/api/admin/users/[id]"` (matches `app/api/admin/users/[id]/route.ts:*`) and added `PATCH /api/admin/users/[id] 10/min` for Phase 2 ban/points, so `getRateLimitConfig:108` exact match works and `enforceDbRateLimit(...,"/api/admin/users/[id]")` hits intended limit (was falling to default 20/min).
*   **2026-09-23 Task 3 Done:** Created `app/api/admin/users/route.ts` — Zod query schema (`q≤100`, `sort` enum, `subscription≤50`, `page` coerced `1..ADMIN_USERS_MAX_PAGE`), `auth()`→401 → `isAdmin()`→403 → `enforceDbRateLimit("admin-users")`→429 → `getUsersPaginated` → 200 `{data,total,page,hasMore}`. Mirrors `admin/feedback/route.ts` guard order + `interview/questions/route.ts` Zod-query pattern. Self-review: no bugs/security/perf issues; fixed magic-number `.max(500)` → `ADMIN_USERS_MAX_PAGE` import + hoisted double `clampAdminUsersPage`. Verified `tsc --noEmit` ✅, `build` ✅ (`ƒ /api/admin/users` registered; 3 stale `.next` validator errors cleared by fresh build). Committed `c78fa5f`.
*   **2026-09-23 Task 4 Done:** Created `app/api/admin/users/[id]/route.ts` — Next.js 16 `params: Promise<{id}>`, Zod `^\d+$` id → 400, `auth()`→401 → `isAdmin()`→403 → `enforceDbRateLimit("admin-users-detail", 30/min)`→429 → `getUserWithStats(id)` → 404 `notFound("User")` / 200 user JSON. Mirrors `admin/feedback/[id]/route.ts`. Self-review: no bugs/security/perf issues; micro-fix `Number(rawId)` → `Number(idParsed.data.id)`. Verified `tsc --noEmit` ✅, `build` ✅ (`ƒ /api/admin/users/[id]`). Uncommitted.
*   **2026-09-22 Task 1 Fix (strict review):** `lib/admin-users.ts:1` — Removed `eq(id,id)` placeholder hack → direct `or(like…)` push with `SQL<unknown>[]` typing, renamed `PAGE_SIZE`→`ADMIN_USERS_PAGE_SIZE`, deduplicated `AdminUserRow/Detail` via `AdminUserBase`, explicit `select({id,…})` projection (avoids `SELECT *` + large `skills JSON` overhead), `sort` whitelisted defensively, `getUserWithStats` guards `!Number.isFinite(id) || id<1`, removed raw `q` from error log (PII), dropped unused `sql` import. Re-verified `tsc --noEmit` ✅, `build` ✅.
*   **2026-09-24 Task 5 Done:** Created `app/admin/users/page.tsx:1` — Server `force-dynamic`, `searchParams: Promise<{q,sort,page,subscription}>`, `MAX_SEARCH_LENGTH`/`ADMIN_USERS_PAGE_SIZE` shared, `parseAdminUsersSort` via `ADMIN_USERS_SORTS`, `clampAdminUsersPage`, `buildUsersHref` keeps `q/sort/subscription/page`, `PaginationLink` span-disabled (a11y), `ADMIN_USERS_PAGE_SIZE` not magic `20`, `try/catch` error UI ("Failed to load"), lean table columns `Name·Email·Points·Enrollments#·Feedback#·Subscription` with `Badge`, `getUsersPaginated` lean list. Created `app/admin/users/loading.tsx:1` skeleton (`Skeleton` 5 rows). Verified `tsc --noEmit` ✅ `build` ✅ (`ƒ /admin/users`, 34/34 pages).
*   **2026-09-24 Strict Review Fix (Tasks 1,3,4,5):** `lib/admin-users.ts:1` — list `select` drops `clerk_id/bio/skills` leak (detail keeps them), split `AdminUserRow` (list fields) vs `AdminUserDetail` (detail fields) via `AdminUserListFields`/`DetailFields`, `ADMIN_USERS_SORTS` + `parseAdminUsersSort` DRY, `truncateSearch→escapeLike` order fix (no cut `\%`), primitive `cache(q,sort,subscription,page)` args (object ref bust dedup), `catch` now `throw` (API/page map to 500/error UI). `app/api/admin/users/route.ts:1` — `Zod` validate before `enforceDbRateLimit` (saves quota on 400), `emptyToUndefined` for `?q=&sort=&page=` (empty → default not 400), `rateLimitedResponse` rename, `throw` mapped to 500. `app/api/admin/users/[id]/route.ts:1` — validate `rawId` before `auth`/`isAdmin`, rename `AdminUserIdParamsSchema`, wrap `getUserWithStats` in `try/catch`. `app/admin/users/page.tsx:1` — `buildUsersHref` keeps `subscription`, `PaginationLink`, `ADMIN_USERS_PAGE_SIZE` reuse. Re-verified `tsc --noEmit` ✅ `build` ✅ 25.1s. Uncommitted per Human Verification Gate.

**Order:** data → rate → APIs → pages → UI leaves → polish → review → (deferred) migration → mutations.

**Human Verification Gate (Highest Priority):** After Task 9, STOP. No `git commit` by agent. Report: what changed, how to verify (`npm run dev` → `/admin` as admin shows Users link → `/admin/users` paginated 20 → `?q=` search → click row → dialog with enrollments → test non-admin `/admin/users` → 302/403). Wait for manual test + your commit before any review agent. Phase 2 runs only after your approval.

---

## 5. Open Questions Resolved

*   Route group: `app/admin/` (already exists, not `(routes)/admin`) — keep consistent with `app/admin/layout.tsx`, `app/admin/feedback/*`.
*   Detail UX: **Dialog first** (fastest, mirrors `FeedbackDetailDialog.tsx`). Full `/admin/users/[id]` page added only if shareable deep-link required.
*   Export/bulk/charts/hard-delete: **Deferred** — free-tier unsafe, see Excluded table.
*   Ban implementation: **DB flag first**, Clerk ban optional later (saves API quota).

---

## 6. Verification Script

```bash
npm run typecheck
npm run build
npm run dev
# As admin: /admin → Users link visible → /admin/users → 20 rows, pagination → ?q=jack → filtered → click row → dialog tabs
# As non-admin: /admin/users → redirect / (layout.tsx:15)
# Curl: curl /api/admin/users → 401 anon, 403 non-admin, 200 admin, 429 after 20/min
# Dark mode + mobile 375px: table scrolls, no overflow
```

---

> This spec keeps Users expansion **under ~15 RU/page** and **<5KB JSON/page** — survives 50M RU and 100GB on free tier. Ship Phase 1, verify, then decide Phase 2 ban/points.
