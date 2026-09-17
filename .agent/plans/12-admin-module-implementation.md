# Admin Module — First Ship Implementation Plan

> **Date:** 2026-09-08
> **Status:** In Progress — Tasks 1-9 complete, review fixes applied
> **Feature:** 4.6 Admin tools — Feedback tickets + admin overview
> **Owner:** Single admin (env allowlist)
> **Stack:** Next.js 16 App Router, Clerk, Drizzle + TiDB MySQL, Tailwind v4 + shadcn/ui

---

## Step 1 — Understand Requirements

**What:** Single-owner admin control panel — feedback tickets + read-only overview of existing features.

**Why:** At 500 users, no way to observe user activity, triage support issues, or view stats without raw DB queries. Admin panel = control plane (observe → triage → act) at zero cost.

**Scope (this ship):**
- Admin authz (env allowlist, single admin)
- Feedback tickets (user submit + admin list/filter/status/delete)
- Admin overview (live stats cards)
- Sidebar link (hidden for non-admin)

**Retention lifecycle (confirmed 2026-09-10):**
- Resolve (`PATCH status=resolved/closed`) keeps the row — user keeps seeing `Resolved` history via `GET /api/feedback` + Task 14 list.
- No auto hard-delete on resolve. DB stays clean from view, not from disk.
- Admin manually deletes finished tickets from admin panel (`DELETE` → `is_deleted=true`). Deleted tickets disappear from both admin list and user's list.
- Rationale: ticket rows are ~1-2KB; 500 users × 10 tickets ≈ 10MB, negligible on TiDB 0.5GB free tier. Preserves audit trail.

**Out of scope:** Course authoring, bulk import, hard delete (physical `DELETE FROM`), auto-purge cron, email, multi-admin.

---

## Step 2 — Analyze

| Category | Details |
|----------|---------|
| **Assumptions** | Single admin (you), env allowlist, no multi-admin needed yet, TiDB 5 conn pool, Vercel 60s timeout |
| **Missing** | `feedback_tickets` table doesn't exist, no `isAdmin()` helper, no admin rate limits, no admin pages |
| **Edge cases** | Empty env = no admin, signed-out user on `/admin`, deleted user submitting feedback, concurrent status patches, search SQL injection (LIKE escaping), pagination bounds (0–9999 clamped) |
| **Risks** | Pool exhaustion (6 parallel count queries), spam on feedback POST, no audit trail yet, Clerk userId → DB user lookup latency |
| **Existing patterns to follow** | `lib/enroll-data.ts` (user lookups), `app/api/enroll/route.ts` (auth + rate + Zod flow), `lib/course-data.ts` (cached Drizzle helpers), `components/ui/table.tsx` (data tables) |

---

## Step 3 — Architecture

**Route group:** `app/(routes)/admin/` — inherits `AppShell`, no new layout group needed.

### File Tree (new + modified files)

```
config/schema.tsx              — MODIFY: add feedback_tickets table
config/rate-limits.ts          — MODIFY: add 4 admin rate limit scopes
lib/db-rate-limit.ts           — MODIFY: extend RateLimitScope union
lib/admin-auth.ts              — NEW: isAdmin(), requireAdmin()
lib/feedback-data.ts           — NEW: get/create/update/delete feedback helpers
app/(routes)/admin/layout.tsx  — NEW: Server guard (auth + isAdmin → 404)
app/(routes)/admin/page.tsx    — NEW: Overview stats cards (Server Component)
app/(routes)/admin/_components/OverviewStats.tsx — NEW: Client stats grid
app/(routes)/admin/feedback/page.tsx    — NEW: Admin feedback list (Server)
app/(routes)/admin/feedback/_components/FeedbackTable.tsx — NEW: Client table
app/(routes)/admin/feedback/_components/FeedbackDetailDialog.tsx — NEW: Client detail dialog
app/(routes)/feedback/page.tsx          — NEW: User feedback form + my tickets
app/(routes)/feedback/_components/FeedbackForm.tsx — NEW: Client form
app/(routes)/feedback/_components/MyTicketsList.tsx — NEW: Client ticket list
app/api/feedback/route.ts               — NEW: POST (submit) + GET (own tickets)
app/api/admin/feedback/route.ts         — NEW: GET all (admin only)
app/api/admin/feedback/[id]/route.ts    — NEW: PATCH status + DELETE soft
app/api/admin/overview/route.ts         — NEW: GET batched counts
app/(routes)/_components/Sidebar.tsx    — MODIFY: add Admin link (conditional)
```

### Data Flow

```
User submits → FeedbackForm → POST /api/feedback → Zod → auth → rateLimit → insert → 201
User lists   → /feedback/page.tsx (Server) → getMyFeedback(userId) → MyTicketsList
Admin list   → /admin/feedback/page.tsx (Server) → getAllFeedback({status,page}) → FeedbackTable
Admin update → FeedbackTable → PATCH /api/admin/feedback/[id] → update status → router.refresh()
Overview     → /admin/page.tsx (Server) → getAdminOverview() → Promise.all 6×count → OverviewStats
```

### DB Change

One new table `feedback_tickets` (12 columns, 2 composite indexes). See Task 1 for full schema.

### Index Strategy (post-review)

| Index | Columns | Covers |
|-------|---------|--------|
| `feedback_user_idx` | `(user_id, is_deleted, created_at)` | User's own tickets: filter by user + exclude soft-deleted + sort by date |
| `feedback_admin_list_idx` | `(status, created_at)` | Admin list: filter by status + sort by date |

**Why 2 composite indexes instead of 4 single-column:**
- Redundant `feedback_status_idx` removed — covered by `feedback_admin_list_idx` leftmost column
- Useless `feedback_is_deleted_idx` (boolean, 2 values) removed — merged into `feedback_user_idx`
- `updated_at` has `.onUpdateNow()` — auto-updates on every row change (review fix)

---

## Step 4 — Tasks (one file change each)

| # | Task | File | Depends | Verify |
|---|------|------|---------|--------|
| 1 | ✅ Add `feedback_tickets` table to schema | `config/schema.tsx` | — | `npx drizzle-kit generate` SQL review |
| 2 | ✅ Add 4 admin rate limit scopes | `config/rate-limits.ts` | — | Grep new keys exist |
| 3 | ✅ Extend `RateLimitScope` union | `lib/db-rate-limit.ts` | — | `tsc --noEmit` |
| 4 | ✅ Create `isAdmin()` + `requireAdmin()` | `lib/admin-auth.ts` | — | `tsc --noEmit` clean, review fixes applied |
| 5 | ✅ Create feedback data helpers | `lib/feedback-data.ts` | 1 | `tsc --noEmit` clean, review fixes applied |
| 6 | ✅ Create `POST /api/feedback` (submit) | `app/api/feedback/route.ts` | 2,3,4,5 | `tsc --noEmit` clean, review clean |
| 7 | ✅ Add `GET /api/feedback` (own tickets) | same file + `lib/user-lookup.ts` | 5,6 | `tsc --noEmit` clean, review fixes applied |
| 8 | ✅ Create `GET /api/admin/feedback` | `app/api/admin/feedback/route.ts` | 2,3,4,5 | `tsc --noEmit` clean, review clean |
| 9 | ✅ Create `PATCH + DELETE /api/admin/feedback/[id]` | `app/api/admin/feedback/[id]/route.ts` | 2,3,4,5 | `tsc --noEmit` clean, review clean, hard delete |
| 10 | ✅ Create `GET /api/admin/overview` | `app/api/admin/overview/route.ts` | 2,3,4 | `tsc --noEmit` clean |
| 11 | ✅ Create admin layout guard | `app/(routes)/admin/layout.tsx` | 4 | `tsc --noEmit` clean, notFound() for non-admin |
| 12 | Create admin overview page + stats cards | `app/(routes)/admin/page.tsx` + `_components/OverviewStats.tsx` | 10,11 | `/admin` shows 6 stat cards |
| 13 | Create admin feedback list + table + dialog | `app/(routes)/admin/feedback/page.tsx` + `_components/*` | 8,9,11 | Filter, PATCH, soft delete UI |
| 14 | Create user feedback form + my tickets | `app/(routes)/feedback/page.tsx` + `_components/*` | 6,7 | Submit → list own tickets |
| 15 | Add Admin link to Sidebar (conditional) | `app/(routes)/_components/Sidebar.tsx` | 4 | Sidebar shows Admin only for admin user |
| 16 | Self-review + harden | — | 1-15 | `tsc`, `build`, ENGINEERING checklist |

**Execution order:** schema → rate limits → auth → data helpers → user API → admin API → guard → pages → sidebar → review.

---

## Task Details

### Task 1 — `config/schema.tsx` ✅ DONE

Add `feedbackTickets` table (review fixes applied: `.onUpdateNow()`, 2 composite indexes):

```typescript
export const feedbackTickets = mysqlTable(
  "feedback_tickets",
  {
    id: int().primaryKey().autoincrement(),
    user_id: int("user_id")
      .references(() => usersTable.id)
      .notNull(),
    title: varchar({ length: 120 }).notNull(),
    message: text().notNull(),
    category: varchar({ length: 20 }).default("other"),    // bug, feature, feedback, other
    status: varchar({ length: 20 }).default("open"),        // open, in_progress, resolved, closed
    admin_notes: text("admin_notes"),
    metadata: json(),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow(),  // review fix: auto-update on row change
    resolved_at: timestamp("resolved_at"),
    is_deleted: boolean("is_deleted").default(false),
  },
  (table) => [
    index("feedback_user_idx").on(table.user_id, table.is_deleted, table.created_at),   // review fix: composite for user queries
    index("feedback_admin_list_idx").on(table.status, table.created_at),                 // review fix: covers admin list + status filter
  ],
);
```

**Review fixes applied:**
1. `.onUpdateNow()` — `updated_at` auto-updates on every row change
2. 2 composite indexes instead of 4 single-column — better coverage, less write overhead
3. `feedback_user_idx` covers: `WHERE user_id = ? AND is_deleted = false ORDER BY created_at DESC`
4. `feedback_admin_list_idx` covers: `WHERE status = ? ORDER BY created_at DESC`

### Task 2 — `config/rate-limits.ts` ✅ DONE

Add 4 entries to the `routes` array (review: no issues found):

```typescript
{ pattern: "/api/feedback", method: "POST", config: { limit: 10, windowMs: WINDOW_1M } },
{ pattern: "/api/feedback", method: "GET", config: { limit: 30, windowMs: WINDOW_1M } },
{ pattern: "/api/admin/feedback", method: "GET", config: { limit: 30, windowMs: WINDOW_1M } },
{ pattern: "/api/admin/overview", method: "GET", config: { limit: 30, windowMs: WINDOW_1M } },
```

**Review verdict:** No bugs, no performance issues, follows existing conventions. PATCH/DELETE on `/api/admin/feedback/[id]` fall back to default 20/min — fine for single admin.

### Task 3 — `lib/db-rate-limit.ts` ✅ DONE

Extend `RateLimitScope` union type (4 scopes added: `feedback-create`, `feedback-list`, `admin-feedback`, `admin-overview`):

```typescript
export type RateLimitScope =
  | "mentor-chat"
  | "interview-generate"
  | "user-sync"
  | "enroll"
  | "progress"
  | "profile-update"
  | "interview-stack"
  | "interview-questions-by-tags"
  | "feedback-create"
  | "feedback-list"
  | "admin-feedback"
  | "admin-overview";
```

**Verify:** `npx tsc --noEmit` — no errors in `lib/db-rate-limit.ts` (remaining `.next/types/validator.ts` errors pre-existing for not-yet-created admin/feedback routes).

### Task 4 — `lib/admin-auth.ts` ✅ DONE

Create `isAdmin()` + `requireAdmin()` (review fixes applied: `React.cache()`, module-scope env, explicit return type):

```typescript
import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { withConnectRetry } from "@/lib/db-retry";
import { createLogger } from "@/lib/logger";

const log = createLogger("admin-auth");

const adminEmails = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

const adminClerkIds = (process.env.ADMIN_CLERK_IDS ?? "")
  .split(",")
  .map((id) => id.trim())
  .filter(Boolean);

export const isAdmin = cache(async (userId: string): Promise<boolean> => {
  if (adminEmails.length === 0 && adminClerkIds.length === 0) return false;
  if (adminClerkIds.includes(userId)) return true;
  try {
    const users = await withConnectRetry(() =>
      db.select({ email: usersTable.email })
        .from(usersTable)
        .where(eq(usersTable.clerk_id, userId))
        .limit(1),
    );
    if (users.length === 0) return false;
    return adminEmails.includes(users[0].email.toLowerCase());
  } catch (error) {
    log.error("isAdmin DB lookup failed", error);
    return false;
  }
});

export async function requireAdmin(): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId) throw new Response(null, { status: 302, headers: { Location: "/sign-in" } });
  const admin = await isAdmin(userId);
  if (!admin) throw new Response("Forbidden", { status: 403 });
  return { userId };
}
```

**Review fixes applied:**
1. `React.cache()` — deduplicates DB lookups for same userId within a single request
2. Module-scope env parsing — `adminEmails`/`adminClerkIds` computed once at import, not per call
3. Explicit return type on `requireAdmin(): Promise<{ userId: string }>`
4. Removed redundant `.toLowerCase()` — already lowercased on parse

```typescript
import { auth } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { withConnectRetry } from "@/lib/db-retry";

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function getAdminClerkIds(): string[] {
  return (process.env.ADMIN_CLERK_IDS ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
}

export async function isAdmin(userId: string): Promise<boolean> {
  const adminEmails = getAdminEmails();
  const adminClerkIds = getAdminClerkIds();

  if (adminEmails.length === 0 && adminClerkIds.length === 0) return false;

  if (adminClerkIds.includes(userId)) return true;

  const users = await withConnectRetry(() =>
    db.select({ email: usersTable.email })
      .from(usersTable)
      .where(eq(usersTable.clerk_id, userId))
      .limit(1),
  );

  if (users.length === 0) return false;
  return adminEmails.includes(users[0].email.toLowerCase());
}

export async function requireAdmin() {
  const { userId } = await auth();
  if (!userId) throw new Response(null, { status: 302, headers: { Location: "/sign-in" } });
  const admin = await isAdmin(userId);
  if (!admin) throw new Response("Forbidden", { status: 403 });
  return { userId };
}
```

### Task 5 — `lib/feedback-data.ts` ✅ DONE

7 functions, 358 lines. Data access layer for feedback tickets + admin overview stats.

**Functions:**
- `createFeedback(userId, data)` — insert + `LAST_INSERT_ID()` in transaction, return created row
- `getMyFeedback(userId, page)` — paginated own tickets, 20/page, excludes soft-deleted
- `getAllFeedback({ status, category, q, page })` — admin: join usersTable for author info, paginated, excludes soft-deleted
- `getFeedbackById(id)` — single ticket with user info
- `updateFeedbackStatus(id, status, adminNotes)` — admin update, only sets `resolved_at` on transition TO resolved/closed (preserves audit trail)
- `deleteFeedback(id)` — admin hard delete (`DELETE FROM feedback_tickets WHERE id = ?`), idempotent
- `getAdminOverview()` — `Promise.all` 6× `count(*)`: users, enrollments, courses, chapters, problems, open tickets

**Key patterns:** `cache()`, `withConnectRetry()`, `createLogger("feedback-data")`, graceful degradation (return safe defaults on DB failure).

**Review fixes applied:**
1. `InferSelectModel<typeof feedbackTickets>` — type derived from schema, stays in sync automatically
2. `authorName`/`authorEmail` — renamed from `userName`/`userEmail` to avoid future collision with ticket columns
3. `resolved_at` audit fix — reads current status first, only sets `resolved_at` on transition TO resolved/closed (not on every update or reopen)
4. `escapeLike` — escapes `\` before `%` and `_` (MySQL LIKE pattern safety)
5. `createFeedback` — wrapped in `db.transaction()` to guarantee `LAST_INSERT_ID()` runs on same connection as insert
6. `adminNotes` — explicit spread with comment explaining Drizzle undefined-skip behavior

### Task 6 — `app/api/feedback/route.ts` (POST) ✅ DONE

63 lines. Zod validation → Clerk auth → rate limit → DB user lookup → createFeedback → 201.

**Zod schema:**
```typescript
const FeedbackSchema = z.object({
  category: z.enum(["bug", "feature", "feedback", "other"]).default("other"),
  title: z.string().min(5).max(120),
  message: z.string().min(10).max(5000),
});
```

**Route flow:**
```
1. withRequestLog("POST /api/feedback")
2. auth() → 401 if no userId
3. enforceDbRateLimit(userId, "feedback-create", ...) → 429 if limited
4. req.json() → Zod safeParse
5. DB lookup: clerkId → dbUserId (usersTable)
6. createFeedback(dbUserId, data) → 201 + created row
```

**Note:** Plan said `type: enum` but schema uses `category` — matched to `feedbackTickets` table and `createFeedback()` helper.

### Task 7 — `app/api/feedback/route.ts` (GET)
```
1. withRequestLog("POST /api/feedback")
2. auth() → 401 if no userId
3. enforceDbRateLimit(userId, "feedback-create", ...) → 429 if limited
4. req.json() → Zod { type: enum, title: 5-200, message: 10-5000, pageUrl?: string }
5. createFeedback(dbUserId, data)
6. return 201 + created row
```

**GET (implemented + review fixes applied):**
```
1. withRequestLog("GET /api/feedback")
2. auth() → 401
3. enforceDbRateLimit(userId, "feedback-list", ...) → 429 (throw → JSON 500, fail-closed)
4. strict digits-only page parse → clampPage() from lib/feedback-data.ts (single bounds truth, 1..500)
5. getDbUserIdByClerkId() from lib/user-lookup.ts (shared POST/GET, retry + JSON 500 on DB failure)
6. getMyFeedback(dbUserId, page) → strip admin_notes + metadata (internal-only) → { data, total, page, hasMore }
7. Cache-Control: private, no-store (explicit fresh; Task 14 refreshes on submit)
```

### Task 8 — `app/api/admin/feedback/route.ts` ✅ DONE

49 lines. Admin-only list endpoint with filtering and pagination.

**Route flow:**
```
1. withRequestLog("GET /api/admin/feedback")
2. auth() → 401 if no userId
3. isAdmin(userId) → 403 if false
4. enforceDbRateLimit(userId, "admin-feedback", ...) → 429 if limited
5. parse searchParams: status, category, q, page (strict digits-only)
6. getAllFeedback({ status, category, q, page })
7. return { data, total, hasMore }
```

**Also added:** `forbidden()` helper to `lib/api-error.ts` — follows existing `unauthorized()` pattern.

### Task 9 — `app/api/admin/feedback/[id]/route.ts` ✅ DONE

82 lines. Two admin-only mutations: PATCH (status update) + DELETE (soft delete).

**PATCH flow:**
```
1. withRequestLog("PATCH /api/admin/feedback/[id]")
2. auth() → 401
3. isAdmin() → 403
4. Zod params: id regex /^\d+$/
5. req.json() → Zod { status: enum, adminNotes?: string }
6. updateFeedbackStatus(id, status, adminNotes)
7. return 200 + updated row (or 404 if not found)
```

**DELETE flow:**
```
1. withRequestLog("DELETE /api/admin/feedback/[id]")
2. auth() → 401
3. isAdmin() → 403
4. Zod params: id regex /^\d+$/
5. deleteFeedback(id)  // hard delete: DELETE FROM feedback_tickets WHERE id = ?
6. return 200 { success: true }
```

**Admin flow:** resolve first (PATCH), user sees "Resolved", then admin deletes when done. No auto-delete on resolve. Hard delete — row permanently removed from database.

### Task 10 — `app/api/admin/overview/route.ts`

**GET:**
```
1. withRequestLog("GET /api/admin/overview")
2. auth() → 401
3. isAdmin() → 403
4. enforceDbRateLimit(userId, "admin-overview", ...) → 429
5. getAdminOverview() → Promise.all 6× count
6. return { users, enrollments, courses, chapters, problems, openTickets }
```

✅ Complete. `tsc --noEmit` clean.

### Task 11 — `app/(routes)/admin/layout.tsx`

```typescript
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) notFound();
  const admin = await isAdmin(userId);
  if (!admin) notFound();
  return <>{children}</>;
}
```

✅ Complete. `tsc --noEmit` clean.

### Task 12 — Admin overview page

`app/(routes)/admin/page.tsx` — Server Component:
- Calls `getAdminOverview()`
- Renders `OverviewStats` with the 6 counts

`app/(routes)/admin/_components/OverviewStats.tsx` — Client Component:
- 6 `Card` components in a responsive grid
- Icons: `Users`, `BookOpen`, `GraduationCap`, `MessageSquare`, `FileCode2`, `AlertCircle`
- Each card shows count + label
- Dark mode compatible, responsive (1 col mobile, 2 col tablet, 3 col desktop)

### Task 13 — Admin feedback pages

`app/(routes)/admin/feedback/page.tsx` — Server Component:
- Reads `searchParams` for status, category, q, page
- Calls `getAllFeedback()`
- Passes data to `FeedbackTable`

`app/(routes)/admin/feedback/_components/FeedbackTable.tsx` — Client:
- shadcn `Table` with columns: Title, User, Category, Status, Created, Actions
- Status filter `Tabs` (All, Open, In Progress, Resolved, Closed)
- Search input for title/message
- `Badge` for status (color-coded: open=blue, in_progress=yellow, resolved=green, closed=gray)
- Actions: View detail, Update status dropdown, Soft delete button
- Pagination at bottom

`app/(routes)/admin/feedback/_components/FeedbackDetailDialog.tsx` — Client:
- shadcn `Dialog` showing full ticket: title, message, user email, category, status, created_at
- Admin notes textarea (editable)
- Status dropdown (changeable)
- Save button → PATCH
- Delete button → soft delete

### Task 14 — User feedback pages

`app/(routes)/feedback/page.tsx` — Server Component:
- Calls `getMyFeedback(userId, page)` from searchParams
- Renders `FeedbackForm` + `MyTicketsList`

`app/(routes)/feedback/_components/FeedbackForm.tsx` — Client:
- shadcn `Card` with form: type `Select`, title `Input`, message `Textarea`
- Submit button with loading state
- Success toast via `sonner`
- Zod validation client-side

`app/(routes)/feedback/_components/MyTicketsList.tsx` — Client:
- shadcn `Table` with columns: Title, Category, Status, Created
- `Badge` for status (open=blue, in_progress=yellow, resolved=green, closed=gray)
- Pagination
- Empty state when no tickets (“No tickets yet” / after admin manual delete, resolved tickets disappear — expected, not a bug)
- Resolved tickets stay visible until admin manually deletes them (retention confirmed 2026-09-10)

### Task 15 — Sidebar modification

`app/(routes)/_components/Sidebar.tsx`:
- Import `ShieldCheck` from `lucide-react`
- Import `useUser` from `@clerk/nextjs`
- Add to `links` array: `{ label: "Admin", href: "/admin", icon: ShieldCheck }`
- Filter links based on admin status (check `user.emailAddresses[0].emailAddress` against `ADMIN_EMAILS` env)

### Task 16 — Self-review + harden

- [ ] `tsc --noEmit` — no type errors
- [ ] `npm run build` — no build errors
- [ ] No `console.log` or debug code
- [ ] No unused imports or variables
- [ ] API routes authenticated (Clerk `auth()`) and validated (Zod)
- [ ] Rate limits on all new endpoints
- [ ] Error states handled for every data-dependent component
- [ ] Dark mode looks good
- [ ] Responsive layout works
- [ ] Follows existing code patterns

---

## Human Verification Gate

After Task 16, STOP. No commit. Verify:

1. `npm run dev`
2. Sign in as admin → `/admin` shows stats cards, `/admin/feedback` shows table
3. Sign in as non-admin → `/admin` returns 404
4. Submit feedback via `/feedback` → appears in admin list
5. PATCH status in admin → status updates; user sees new status on `/feedback`
6. Admin manual delete after resolve → ticket disappears from admin list AND user list (soft delete, `is_deleted=true`)
7. Sidebar shows Admin link only for admin user
8. Rate limit: 11th POST in 60s → 429

Awaiting manual test and commit before any further agents.

---

## Open Questions (resolve before build)

1. Allowlist via `ADMIN_EMAILS` or `ADMIN_CLERK_IDS`? (both supported)
2. Sidebar admin visibility: env check on client or server? (client email check)
3. Category enum exact values? (bug, feature, feedback, other)
4. Status enum exact values? (open, in_progress, resolved, closed)
5. Feedback form: inline or separate page? (separate `/feedback` page)

---

> Generated via ELOS pipeline. Tasks 1-11 complete. Next: Task 12 (admin overview page + stats cards).
