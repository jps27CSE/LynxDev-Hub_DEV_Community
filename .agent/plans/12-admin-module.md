# Admin Module — Single-Owner Control Panel (ELOS Full Pipeline)

> **Date:** 2026-09-06
> **Status:** Planned (Phases 1-4 complete, awaiting implementation approval)
> **Feature:** 4.6 Admin tools (Pending in `feature-tracker.md`) — Feedback/issues tickets + admin overview for existing features
> **Owner:** Single admin (env allowlist, only you)
> **Stack:** Next.js 16 App Router (Server Components default), Clerk, Drizzle + TiDB MySQL (5 conn pool), Tailwind v4 + shadcn/ui, Vercel Hobby, zero cost / zero lock-in

---

## Phase 1 — Teach (Mentor)

### 1. Business Problem + Senior Thinking (500 users, Free Tier)

**Real scenario:** 500 DAU on TiDB 0.5GB, Vercel Hobby, Mistral free. No ticket inbox, no user/enrollment list, no way to hide `is_published=false` without deploy. Support cost scales linearly, data integrity risk (seed-only edits), spam risk on `questions-by-tags`.

**Why admin now:** Control plane (observe → triage → act → audit) with minimal DB cost. Every query paginated (20), batched, pool-aware. If admin panel DoS TiDB, you've failed.

**Incremental delivery:**
- Ship 1: Feedback tickets (submit + list + resolve/delete) + authz guard
- Ship 2: Read-only overview (courses/chapters, interview, problems, users/enrollments, stats)
- Ship 3: Mutations (publish, reorder) — deferred

### 2. LynxDEV Stack Thinking

| Principle | Admin shape |
|-----------|-------------|
| Server Components default | `app/(routes)/admin/page.tsx`, `feedback/page.tsx` are Server data boundaries; fetch via `lib/` , pass props to Client leaves only for `onClick`. Mirrors `dashboard`, `courses` pattern |
| Clerk `auth()` everywhere | Every `app/api/admin/*` + `app/api/feedback/*` must `auth()` + allowlist. Pattern: `app/api/enroll/route.ts`, `app/api/mentor/chat/route.ts` |
| Drizzle + TiDB 5 conn (`config/db.tsx:18`) | Batch counts with `Promise.all`, use `with` eager loading, not loops. Reuse `lib/course-data.ts` error logging |
| Zero cost | No Linear/Intercom. `json` col for metadata, soft delete, single `feedback_tickets` table (<20 tables, now 11) |
| Zero lock-in | Authz behind `lib/admin-auth.ts:isAdmin()` wrapper, not Clerk Organizations |
| Reuse | `components/ui/*`, `lib/api-error.ts`, `lib/db-rate-limit.ts`, `config/rate-limits.ts` |

**Route group:** `app/(routes)/admin/` inherits `AppShell` (`(routes)/layout.tsx`). Avoids duplicating shell vs new `(admin)` group.

### 3. File Walkthrough

| File | Why |
|------|-----|
| `config/schema.tsx` | Add `feedback_tickets` (id, user_id FK, type, title, message, status, metadata json, is_deleted, timestamps). Indexes on user_id, status, created_at |
| `config/admin.ts` or env | Single-admin allowlist `ADMIN_EMAILS`/`ADMIN_CLERK_IDS` |
| `lib/admin-auth.ts` (new) | `isAdmin()`, `requireAdmin()` — single source |
| `lib/feedback-data.ts` + `lib/admin-stats.ts` | Pure Drizzle helpers, testable, mirrors `lib/interview-data.ts` |
| `app/(routes)/admin/layout.tsx` | Server guard `auth()`→`isAdmin()`→`redirect/404` (DRY) |
| `app/(routes)/admin/page.tsx` | Overview Server Component, parallel `Promise.all` counts |
| `app/(routes)/admin/feedback/*` + `TicketTable.tsx` (Client) | List/filter + PATCH/DELETE via Server Actions/API |
| `app/api/feedback/route.ts` (POST+GET own) + `app/api/admin/feedback/*` (GET all, PATCH) | Standard API shape (Zod→auth→rateLimit→query→response) |

### 4. Before vs After

**Authz:** Per-route copy-paste → `lib/admin-auth.ts` + `admin/layout.tsx` guard (wins: DRY, fail-closed)
**Tickets:** DB table vs SaaS → DB wins ($0, joinable, no lock-in)
**Delete:** Hard delete vs soft `is_deleted` → soft wins (audit, free-tier cron purge later)
**Overview:** Via API vs direct Drizzle in Server Component → direct wins (fewer hops, fewer conns)

### 5. Beginner Mistakes Checklist

- AuthZ only on UI, not API (leak)
- Trusting client `isAdmin` body
- N+1 overview (`for` loop queries)
- Unbounded `select *` (no `limit 20`)
- No Zod on feedback (spam 100k)
- No rate limit on `POST /api/feedback` (reuse `lib/db-rate-limit.ts`)
- No audit (`resolved_by`)
- Leaking `ADMIN_EMAILS` to client (`NEXT_PUBLIC`)
- `"use client"` on page instead of leaf
- Hard delete immediately
- Ignoring dark/mobiile table overflow

### 6. Industry → Free-tier

| Industry | Translation |
|----------|-------------|
| RBAC/Casbin | Single `isAdmin()` allowlist, wrapper for future DB role |
| Audit log | `resolved_by, resolved_at` + optional `admin_audit_logs` JSON |
| Jira workflow | `open→in_progress→resolved→closed` enum, no assignee |
| Rate limit + CAPTCHA | DB-backed `lib/db-rate-limit.ts` 5/min + Clerk as CAPTCHA proxy |
| Datadog | `lib/logger.ts` + `request-log.ts` |

### 7. Learn

Concepts: Control plane, allowlist vs RBAC, fail-closed, soft vs hard, audit, pool contention, Server boundary. Patterns: layout guard, thin wrapper, Zod→auth→authorize→query→response, batched counts, DB-backed rate limit.

---

## Phase 2 — Requirements

### Scope

**In-scope:** Admin authz (owner only), feedback tickets (submit/list/filter/status/delete), admin overview read for Done features (courses/chapters Restart, interview Done, problems Done, users/enrollments, dashboard stats). **Out:** Course/question authoring, bulk import, hard delete, file uploads, email, multi-admin.

### Functional — MUST

**Authz:**
- M-ADMIN-01 Single env allowlist (`ADMIN_EMAILS`/`ADMIN_CLERK_IDS`), fail-closed, 403 for non-admin, redirect for signed-out
- M-ADMIN-02 Both layers: `admin/layout.tsx` + every API `auth()`+`isAdmin()`
- M-ADMIN-03 Empty env = no admin

**Feedback user:** M-FB-01 `POST /api/feedback` Zod `{type enum, title 5-200, message 10-5000, pageUrl?}`, 201. M-FB-02 auth+Zod+rate-limit 5/min. M-FB-03 `GET /api/feedback?mine` own only.

**Feedback admin:** M-FB-04 `GET /api/admin/feedback` paginated 20, sorted desc. M-FB-05 filter status/type/q. M-FB-06 `PATCH /:id` status enum + adminNotes. M-FB-07 `DELETE` soft `is_deleted`. M-FB-08 join user email/name batched.

**Overview:** M-OV-01 stats cards (users, enrollments, courses published/draft, interview reachable, problems, open tickets). M-OV-02 users table 20/page + drill-in. M-OV-03 courses/chapters table. M-OV-04 interview categories/questions. M-OV-05 problems table. M-OV-06 empty states for Pending community/notes/blog (no fabricate).

**SHOULD:** S-01 inline edit `is_published`, S-02 bulk soft-delete, S-03 CSV export, S-04 rate limit view, S-05 search/sort, S-06 sidebar badge open count.

**COULD (deferred):** WYSIWYG, hard purge cron, email, multi-admin, audit UI.

### Non-functional

- TiDB pool 5, paginate 20, batch `with`/`Promise.all`, indexes on feedback(user_id,status,created_at), <20 tables, `json` metadata
- Vercel 60s cap, `withConnectRetry`, `logger.timed` >250ms warn
- Clerk `auth()` once per request, no loop `currentUser()`
- No file uploads, soft delete only, Zod 100%, no-store admin stats or 60s tag, dark+responsive, `components/ui/*`, `is_deleted` filtered

### Assumptions

A-01 single admin, A-02 dark/mobile/20, A-03 auth required, A-04 community pending (no tables), A-05 courses empty (Restart), A-06 follow Server/Client + Zod→auth→rateLimit→query pattern, A-07 TiDB MySQL (not Neon), A-08 `app/(routes)/admin/` under AppShell, A-09 English UTC, A-10 no email.

### Missing (needed to ship)

`lib/admin.ts` helper, `feedback_tickets` table + indexes, rate limits in `config/rate-limits.ts`, pagination `{data,total,page,hasMore}` clamped, search `LIKE` escaped 100 chars, empty/loading/error skeletons, soft-delete cols, audit `updated_by`, idempotency note, leftJoin for deleted user, cache invalidation, sidebar hide, `withRequestLog`, Zod co-located, manual matrix.

### Edge Cases

Auth (signed-out redirect, non-admin 403, env empty), spam (rate 429, script tags escaped, 5k max), empty zero tickets/courses, deleted user leftJoin, orphan chapter, page 0/9999 clamped, concurrent patch last-write-wins, TiDB cold 15s `withConnectRetry`, Vercel 6 counts `Promise.all` degrade, search `%` parameterized, large message truncate 120 + dialog, soft-delete `includeDeleted` admin-only, rate table collision, Clerk lag auto-create user.

### Risks

Pool exhaustion 5→queue 25, RU 0.5GB JSON lean, Vercel 60s batched counts, Clerk double call, spam DB, hard delete loss, no audit, schema drift MySQL, scope creep, sidebar flash, pagination DoS limit 20.

### Acceptance Criteria (Given/When/Then)

AC1 non-admin `GET /api/admin/feedback` → 403, AC2 admin list paginated 20, AC3 submit valid → 201, AC4 short title → 400, AC5 6th POST in 60s → 429, AC6 PATCH status → 200, AC7 DELETE soft → excluded, AC8 `/admin` cards counts, AC9 `/admin/users?q=jack` drill-in, AC10 sidebar hidden for non-admin, AC11 anon POST → 401, AC12 `limit=999` clamped 20, AC13 deleted user placeholder, AC14 dark mobile cards no overflow.

### Open Questions (resolve before build)

1. Allowlist `ADMIN_EMAILS` vs `ADMIN_CLERK_IDS`? 2. `(routes)/admin/` vs `(admin)` group? 3. Type enum exact? 4. Read-only or inline edit v1? 5. Detect `posts` table dynamically? 6. Reply history visible? 7. Badge notification? 8. User self-delete? 9. Search email too? 10. `schema.tsx` vs `.ts`? 11. Scope names? 12. Audit history JSON?

---

## Phase 3 — Architecture

### Affected Files

- `config/schema.tsx` — +feedback_tickets
- `config/rate-limits.ts` — +4 scopes (feedback_create 10/min, feedback_list 30/min, admin_feedback 30/min, admin_overview 30/min)
- `lib/db-rate-limit.ts` — extend union
- `app/(routes)/_components/Sidebar.tsx` — Admin link conditional
- `lib/*` — reused logger/request-log

### New Files

- `lib/admin-auth.ts` — `isAdmin()` env check
- `lib/admin-stats.ts` — batched counts (no cache, fresh)
- `lib/feedback-data.ts` — helpers get/create/update
- `lib/validators/feedback.ts` — Zod schemas
- `app/(routes)/admin/layout.tsx` — Server guard (404 for non-admin)
- `app/(routes)/admin/page.tsx` — overview Server
- `app/(routes)/admin/_components/OverviewStats.tsx`
- `app/(routes)/admin/feedback/page.tsx` — Server + `FeedbackTable.tsx` Client + `FeedbackDetailDialog.tsx`
- `app/(routes)/feedback/page.tsx` — user Server + `FeedbackForm.tsx` Client + `MyTicketsList.tsx`
- `app/api/feedback/route.ts` — POST+GET own
- `app/api/admin/feedback/route.ts` — GET all + `app/api/admin/feedback/[id]/route.ts` PATCH
- `app/api/admin/overview/route.ts` — optional stats JSON

### Route / Component Tree

- Group: `(routes)/admin` inside `AppShell` (not separate `(admin)`). `admin/layout.tsx` Server guard → `notFound()` for non-admin. No parallel routes; detail via `Dialog`.
- Server boundaries: `/admin/page.tsx`, `/admin/feedback/page.tsx`, `/feedback/page.tsx`, `admin/layout.tsx` (fetch via `lib/` with `React.cache`, `withConnectRetry`).
- Client leaves: `FeedbackForm`, `MyTicketsList`, `FeedbackTable`, `FeedbackDetailDialog` (only `"use client"`).
- Reuse `components/ui/{table,dialog,card,badge,tabs,select,textarea,pagination,skeleton}` + `cn()`.

### Data Flow

- Create: `FeedbackForm` → `POST /api/feedback` (Zod→auth→rateLimit 10/min→insert)→201→`revalidatePath`
- Admin list: `/admin/feedback/page.tsx` Server → `getAllFeedback({status,page})` (join users, 20, desc) → props → `FeedbackTable` filters via `searchParams` → server refetch
- Update: `FeedbackTable` → `PATCH /api/admin/feedback/[id]` → `update set status, admin_notes, resolved_at` → `router.refresh()`
- Overview: `/admin/page.tsx` → `getAdminOverview()` `Promise.all` 6×`count(*)` via pool queue 25 → `revalidate 0`

### DB Changes

`feedback_tickets` `mysqlTable`:
`id int PK AI`, `user_id int FK→users`, `title varchar(120)`, `message text`, `category varchar(20) default other`, `status varchar(20) default open`, `admin_notes text`, `metadata json`, `created_at timestamp defaultNow`, `updated_at onUpdate`, `resolved_at nullable`, `is_deleted bool default false`
Indexes: `user_id`, `status`, `created_at desc`, composite `(status, created_at)`, `is_deleted`. Relations `→users`. Migrate `drizzle-kit generate/migrate`. No new admin table.

### External Services

- None new. No Mistral/Clerk webhook. `ADMIN_EMAIL` env only. Thin wrapper allows future Clerk role swap.

### Trade-offs

1. **Admin identity:** ENV single vs DB role vs Clerk Org → ENV wins (0 RU, zero lock-in)
2. **Route group:** `(routes)/admin` (reuse AppShell) vs `(admin)` (duplicate) → `(routes)` wins DRY
3. **PATCH via API vs Server Action:** API wins (rate-limit uniform, `withRequestLog`)
4. **Overview live counts vs materialized** → live `Promise.all` wins (accurate, cheap 6×count)
5. **Offset vs cursor** → offset limit 20 wins ( <1k tickets, YAGNI)

---

## Phase 4 — Tasks (all <30 min, sequential)

| # | Task | Files | Depends | Verify |
|---|------|-------|---------|--------|
| 1 | DB `feedback_tickets` + indexes | `config/schema.tsx`, `drizzle/*` | — | `drizzle-kit generate` SQL review, `tsc --noEmit` |
| 2 | `lib/admin-auth.ts` `isAdmin()` | `lib/admin-auth.ts` | — | mock Clerk admin vs non-admin 403 |
| 3 | `lib/feedback-data.ts` helpers | `lib/feedback-data.ts` | 1 | `tsc`, no N+1 |
| 4 | Rate limits 4 scopes | `config/rate-limits.ts` | — | grep new keys |
| 5 | `POST /api/feedback` | `app/api/feedback/route.ts` | 2,3,4 | curl 201/401/400/429 |
| 6 | `GET /api/feedback` own list | same file | 3,4 | curl paginated 20 |
| 7 | `GET /api/admin/feedback` | `app/api/admin/feedback/route.ts` | 2,3,4 | 403 vs 200 |
| 8 | `PATCH /api/admin/feedback/[id]` | `app/api/admin/feedback/[id]/route.ts` | 2,3 | curl status enum |
| 9 | `GET /api/admin/overview` (batched counts) | `app/api/admin/overview/route.ts` | 2,3 | curl stats |
| 10 | `app/(routes)/admin/layout.tsx` guard | `app/(routes)/admin/layout.tsx` | 2 | `/admin` redirect 403 |
| 11 | `admin/page.tsx` stats cards | `app/(routes)/admin/page.tsx` + `OverviewStats.tsx` | 9,10 | `/admin` cards live |
| 12 | `admin/feedback/page.tsx` table | `.../feedback/page.tsx` + `FeedbackTable.tsx` | 7,8,10 | filter + PATCH UI |
| 13 | `feedback/page.tsx` user form + my tickets | `.../feedback/*` | 5,6 | submit → list |
| 14 | Self-review + harden | — | 5-13 | `tsc`, `build`, ENGINEERING checklist |

**Order:** schema → auth → data → rate → user API → admin API → guards → pages. Free-tier flags: 3,4,5,7,9,12,13.

**Human Verification Gate:** After Task 14, STOP, no commit, summary how to verify (`npm run dev`, `/admin` as admin vs non-admin, `/api/feedback` curl). Awaiting approval before Task 1 — no code will be written.

---

> Generated via ELOS pipeline: Mentor (general), Requirements, Architect, Planner — `WORKFLOW.md` Steps 1-4. Next: Implement Task 1 only after approval (backend/database/api agents one at a time, then parallel reviews).
