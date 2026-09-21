# Feedback Module — Production Review (500 Users, Free Tier)

**Date:** 2026-09-21
**Scope:** Full feedback submit form module — user submission, ticket listing, admin management
**Infrastructure:** Vercel Hobby (free) + TiDB Cloud (free tier)

---

## Architecture Overview

```
FeedbackForm (Client) → POST /api/feedback → createFeedback() → DB transaction (3 queries)
FeedbackContent (Client) → MyTicketsList (Client) → renders server-fetched data
Admin page (Server) → getAllFeedback() → DB join + count → FeedbackTable (Client) → FeedbackDetailDialog
```

**Schema:** 12 columns, 2 composite indexes, `is_deleted` soft-delete column exists but is unused by the delete function.

**Files reviewed:**

| File | Purpose |
|------|---------|
| `config/schema.tsx:152-174` | `feedbackTickets` table definition |
| `lib/feedback-data.ts` | Data access layer — 7 functions |
| `app/api/feedback/route.ts` | User-facing API — POST + GET |
| `app/api/admin/feedback/route.ts` | Admin API — GET all tickets |
| `app/api/admin/feedback/[id]/route.ts` | Admin API — PATCH + DELETE |
| `app/(routes)/feedback/page.tsx` | User feedback page (Server Component) |
| `app/(routes)/feedback/_components/FeedbackForm.tsx` | Client form component |
| `app/(routes)/feedback/_components/FeedbackContent.tsx` | Client orchestrator |
| `app/(routes)/feedback/_components/MyTicketsList.tsx` | Client ticket list |
| `app/admin/feedback/page.tsx` | Admin feedback page (Server Component) |
| `app/admin/feedback/_components/FeedbackTable.tsx` | Admin client table |
| `app/admin/feedback/_components/FeedbackDetailDialog.tsx` | Admin detail dialog |
| `config/rate-limits.ts` | Rate limit configuration |
| `lib/db-rate-limit.ts` | DB-backed rate limiter |
| `lib/db-retry.ts` | TiDB connection retry |
| `lib/logger.ts` | Structured logging |
| `lib/request-log.ts` | Request-level logging with query count |
| `lib/api-error.ts` | Consistent error responses |
| `lib/admin-auth.ts` | Admin authorization |

---

## 1. Performance

### Strengths

- `React.cache()` on all read functions — request-level dedup
- Composite indexes cover primary query patterns (`user_id, is_deleted, created_at` and `status, created_at`)
- `withConnectRetry()` handles TiDB scale-to-zero cold starts
- `withRequestLog()` tracks query count and duration per request
- Slow DB warning at >250ms threshold

### Issues Found

| # | Severity | Issue | Location | Impact at 500 users |
|---|----------|-------|----------|---------------------|
| P1 | **High** | `createFeedback` does 3 DB round-trips in a transaction (insert → `LAST_INSERT_ID()` → re-select) | `lib/feedback-data.ts:63-85` | Each ticket costs 3 queries. 10 creates/min = 30 queries/min just for submissions |
| P2 | **Medium** | `getMyFeedback` runs `count(*)` + `SELECT` in parallel, but count scans all rows without LIMIT | `lib/feedback-data.ts:110-122` | At 1000+ tickets/user, count becomes slow. Currently fine at 500 users |
| P3 | **Medium** | Admin `getAllFeedback` joins `usersTable` on every query, including for the count | `lib/feedback-data.ts:169-189` | Count query scans the join — heavier than needed |
| P4 | **Medium** | `getAdminOverview` fires 6 parallel count queries on every admin dashboard load | `lib/feedback-data.ts:314-324` | 6 queries per admin page load. Admin-only, so acceptable, but no caching |
| P5 | **Low** | `admin_notes` textarea in `FeedbackDetailDialog` has no `maxLength` prop — server validates at 2000 but client doesn't enforce | `FeedbackDetailDialog.tsx:131-136` | User can type 100k chars, gets rejected server-side, wastes bandwidth |

### Recommendations

**P1: Reduce `createFeedback` to 1-2 round-trips.**

Instead of insert → `LAST_INSERT_ID()` → re-select, construct the return value from the insert input + known defaults:

```typescript
await tx.insert(feedbackTickets).values({
  user_id: userId,
  title: data.title,
  message: data.message,
  category: data.category ?? "other",
});
// Get the inserted ID
const rows = await tx.execute(sql`SELECT LAST_INSERT_ID() AS id`);
const insertedId = (rows as unknown as Array<Array<{ id: number }>>)[0]?.[0]?.id;
if (!insertedId) return null;
// Return constructed object instead of re-selecting
return {
  id: insertedId,
  user_id: userId,
  title: data.title,
  message: data.message,
  category: data.category ?? "other",
  status: "open",
  admin_notes: null,
  metadata: null,
  created_at: new Date(),
  updated_at: new Date(),
  resolved_at: null,
  is_deleted: false,
};
```

**P3: Separate count from data query for admin.** The count query doesn't need the join:

```typescript
// Count only feedback_tickets (no join needed for total)
db.select({ value: count() }).from(feedbackTickets).where(where)
// Data query does the join
db.select({...}).from(feedbackTickets).innerJoin(usersTable, ...).where(where)
```

---

## 2. Scaling

### Current Capacity (500 users on free tier)

| Resource | Limit | Feedback module usage | Risk |
|----------|-------|----------------------|------|
| TiDB connections | 5 pool + 25 queue | 10 POST/min + 30 GET/min user + 30 GET/min admin = ~70 queries/min | **OK** — well within limits |
| Vercel function timeout | 60s (Hobby) | Feedback routes: <1s typical, <15s worst case (cold start + retry) | **OK** |
| DB storage | 0.5 GB | 500 users × ~10 tickets × ~1KB = ~5MB | **OK** — negligible |
| Rate limit table | Unbounded rows | 500 users × ~8 scopes = ~4000 rows | **OK** — small |
| Vercel bandwidth | 100 GB/mo | Feedback payloads: ~2KB/page load × 500 users × 50 loads/mo = ~50MB | **OK** |

### Scaling Concerns

| # | Issue | When it bites | Fix |
|---|-------|--------------|-----|
| S1 | **Rate limit table grows unbounded** — no cleanup cron for expired windows | 10k+ rows after ~6 months | Add a weekly cleanup job (Cloudflare Worker or Vercel cron) to `DELETE WHERE window_start < NOW() - INTERVAL 7 DAY` |
| S2 | **No connection pool queuing visibility** — if all 5 connections are busy and 25 requests queue, the 26th fails with no diagnostic | Burst of 30+ concurrent users | Add pool stats logging on warmup or expose via admin API |
| S3 | **Admin search uses `LIKE %term%`** — full table scan, no index on `title` | 1000+ tickets, frequent search | Add index on `title` if search becomes a feature, or use full-text search |
| S4 | **`FEEDBACK_MAX_PAGE = 500`** allows offset-based pagination to page 500 (offset 9,980) — MySQL/TiDB must scan and discard 9,980 rows | Deep pagination by admin | Cap at page 50 (offset 980) or switch to cursor-based pagination |

---

## 3. Monitoring

### Current State

- Structured JSON logging in production (`lib/logger.ts`)
- Request ID tracking with query count (`lib/request-log.ts`)
- Slow query detection (>250ms)
- Rate limit failures logged

### Gaps

| # | Gap | Impact | Recommendation |
|---|-----|--------|----------------|
| M1 | **No success/failure rate tracking** — can't see how many submissions succeed vs fail | Blind to degradation | Add a metric counter: `log.info("feedback.created", { userId, category })` on success |
| M2 | **No admin action audit trail** — status changes and deletes aren't logged with who did it | Can't trace admin mistakes | Add `log.info("feedback.status_changed", { id, from, to, adminId })` in `updateFeedbackStatus` |
| M3 | **No health check endpoint** for the feedback module | Can't detect issues proactively | Create `GET /api/health/feedback` that runs a simple DB ping |
| M4 | **No alerting** — errors are logged but nobody sees them | Silent failures | At 500 users: set up a Vercel webhook to Slack/Discord for 5xx rate > 5%/10min |
| M5 | **`getAdminOverview` has no caching** — 6 queries on every admin dashboard load | Admin page loads are heavy | Already uses `React.cache()` — consider stale-while-revalidate pattern |

---

## 4. Logging

### Current State

Good. The logging infrastructure is solid:

- `createLogger("feedback-data")` with structured JSON in prod
- `withRequestLog()` wraps every API handler with requestId, duration, query count, status
- Error serialization catches Error objects properly
- PII redaction in rate limit logs (`user:***`)

### Gaps

| # | Issue | Fix |
|---|-------|-----|
| L1 | **`createFeedback` success not logged** — only failures are logged | Add `log.info("created", { id, userId, category })` after successful insert |
| L2 | **`deleteFeedback` not logged** — a destructive admin action with no audit log | Add `log.warn("deleted", { id, adminId })` with WARNING level since it's irreversible |
| L3 | **`updateFeedbackStatus` not logged** — status transitions invisible | Add `log.info("status_changed", { id, from: current?.status, to: status })` |
| L4 | **No structured context on user-facing errors** — `FeedbackForm` shows generic "Something went wrong" | Client can't log server errors; add `console.error` in the catch block with the response body |

---

## 5. Security

### Strengths

- Clerk `auth()` on every route
- `isAdmin()` check on all admin routes with fail-closed design
- Zod validation on all inputs (title: 5-120, message: 10-5000, category: enum)
- Rate limiting per user per scope (DB-backed, global across instances)
- `admin_notes` stripped from user-facing GET response
- `escapeLike()` prevents LIKE injection in search
- `Cache-Control: private, no-store` on user ticket list

### Issues

| # | Severity | Issue | Location | Fix |
|---|----------|-------|----------|-----|
| S1 | **High** | **Hard delete with no recovery** — `deleteFeedback` does `DELETE FROM` permanently. No soft delete, no archive. | `lib/feedback-data.ts:292-304` | Change to soft delete: `UPDATE SET is_deleted = true WHERE id = ?`. The `is_deleted` column already exists in the schema |
| S2 | **Medium** | **PATCH/DELETE admin routes have no explicit rate limit** — fall back to default 20/min | `app/api/admin/feedback/[id]/route.ts` | Add explicit entries in `config/rate-limits.ts` |
| S3 | **Medium** | **`updateFeedbackStatus` is not atomic** — reads current status, then updates, then re-reads. Race condition on `resolved_at` logic | `lib/feedback-data.ts:246-287` | Wrap in a transaction |
| S4 | **Low** | **No input sanitization for XSS** — `message` and `admin_notes` are stored raw | Various | Current rendering uses React text nodes (safe). Confirm no `dangerouslySetInnerHTML` anywhere |
| S5 | **Low** | **Admin notes textarea has no `maxLength`** — server rejects >2000 but user can type freely | `FeedbackDetailDialog.tsx:131-136` | Add `maxLength={2000}` to match server validation |

### Recommendation: Switch to Soft Delete

The `is_deleted` column already exists in the schema. The delete function should be:

```typescript
export async function deleteFeedback(id: number): Promise<boolean> {
  await db.update(feedbackTickets)
    .set({ is_deleted: true })
    .where(eq(feedbackTickets.id, id));
  return true;
}
```

And all read queries should add `eq(feedbackTickets.is_deleted, false)` to their WHERE clause. This is free (no migration), reversible, and auditable.

---

## 6. Failure Recovery

### Current State

- `withConnectRetry()` handles TiDB cold starts (1 retry, 3s delay)
- `createFeedback` wraps in a transaction (atomic)
- All data access functions return safe defaults on failure
- `isAdmin` fails closed (false on error)

### Gaps

| # | Issue | Risk | Fix |
|---|-------|------|-----|
| F1 | **`updateFeedbackStatus` not wrapped in transaction** — reads status, updates, re-reads. If DB fails between update and re-select, the update happened but the response says it failed | User sees error but data changed | Wrap in `db.transaction()` and return the updated row from the transaction |
| F2 | **No retry on non-transient DB errors** — if TiDB returns a deadlock or lock timeout, it fails immediately | Rare but possible under concurrent admin edits | Deadlocks are retried by TiDB automatically; no action needed |
| F3 | **`getAdminOverview` has no circuit breaker** — if DB is down, all 6 queries fail, admin dashboard is broken | Admin can't see any data | Add a try/catch that returns partial data if some queries succeed and others fail |
| F4 | **No graceful degradation for the user feedback page** — if DB fails, the entire page shows an error | User can't submit or view tickets | The page Server Component catches errors, but `FeedbackContent` doesn't handle a scenario where `initialData` is empty due to DB failure vs. genuinely no tickets |

---

## Priority Summary

### Must-Fix Before 500 Users

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 1 | **Switch `deleteFeedback` to soft delete** — use the existing `is_deleted` column | 30 min | Prevents irreversible data loss |
| 2 | **Add `is_deleted = false` filter to all read queries** | 15 min | Completes the soft-delete pattern |
| 3 | **Log admin actions** (create, status change, delete) | 20 min | Audit trail for debugging |
| 4 | **Add `maxLength={2000}` to admin notes textarea** | 2 min | Client-side UX |
| 5 | **Wrap `updateFeedbackStatus` in a transaction** | 15 min | Atomicity |

### Should-Fix (Performance at Scale)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 6 | Reduce `createFeedback` from 3 to 1-2 DB round-trips | 45 min | 66% fewer queries on ticket creation |
| 7 | Separate admin count query from join query | 20 min | Lighter count queries |
| 8 | Add explicit rate limits for PATCH/DELETE admin routes | 5 min | Consistent rate limiting |
| 9 | Cap max page at 50 instead of 500 | 5 min | Prevents deep-offset performance cliff |
| 10 | Add rate limit table cleanup cron | 30 min | Prevents unbounded table growth |

### Nice-to-Have (Monitoring & Observability)

| # | Fix | Effort | Impact |
|---|-----|--------|--------|
| 11 | Log successful ticket creation with category/user context | 5 min | Success rate visibility |
| 12 | Add health check endpoint for feedback module | 15 min | Proactive monitoring |
| 13 | Set up error rate alerting (Vercel webhook) | 30 min | Catch silent failures |

---

## Free Tier Checklist

- [x] All DB queries paginated (max 20 per page)
- [x] API rate-limited (per-route limits: 10-30 req/min, DB-backed)
- [x] No file uploads stored permanently
- [ ] Soft deletes everywhere (`is_deleted` flag) — **hard delete currently used**
- [x] JSON columns used for flexible metadata
- [x] Schema under 20 tables
- [x] Images served from GitHub URLs / CDN
- [x] TiDB connection pool respected (`connectionLimit: 5`)

---

**Overall assessment:** The feedback module is well-built with strong foundations (auth, validation, rate limiting, retry, logging). The most critical issue is the hard delete — the `is_deleted` column exists but isn't used, meaning admin deletes are irreversible. Everything else is solid for 500 users. The performance optimizations become relevant at 1k+ tickets.
