# Production Review — Editor Module (500 Concurrent Users, Free Tier)

> **Date:** 2026-08-06
> **Last updated:** 2026-08-20 — Tier 1.1 (sandbox hardening) + 1.3 (log cap) implemented
> **Scope:** `lib/editor.ts`, `hooks/useCodeEditor.ts`, `components/editor/*`, `components/code-block.tsx`, `/editor` page, workspace + dialog editor surfaces
> **Stack:** Next.js 16 on Vercel Hobby | TiDB Cloud Starter (Free) | Monaco via jsDelivr CDN

## Verdict

The editor module is **~99% client-side** — the server impact is a single `getProblemById`
query on `/editor?problemId=N`, Monaco ships from the CDN, and statements never rebundle.
At 500 users it costs Vercel essentially **zero**. This review targets **client-side
quality** — sandbox security and failure recovery — not infrastructure.

---

## 1. Performance

| Finding | Detail | Severity |
|---|---|---|
| Monaco remounts per problem switch | `ProblemPane` is keyed by `problem.key` (`app/(routes)/problems/[slug]/_components/ProblemPane.tsx`) — each sidebar click destroys and recreates the editor (~300-600ms parse, memory churn). Chosen for clean per-problem editor state; the tradeoff is real | 🟡 |
| Autosave is debounced 500ms | ✅ Writes coalesce (`hooks/useCodeEditor.ts:35-39`) | ✅ |
| Unbounded log capture | **Fixed 2026-08-20** — worker caps captured output at 10k lines / 500KB (`lib/editor.ts:24-44`); guard short-circuits before string building once capped, so `for(;;) console.log(1)` does ~no work after the cap; single oversized lines are sliced (head preserved) with a `… N more lines truncated` marker | ✅ |
| Lazy loading | ✅ `next/dynamic` + CDN loader (`components/editor/MonacoEditor.tsx:5`); `EditorDialog` pulls Monaco only when opened — no page carries the cost | ✅ |

## 2. Scaling

| Metric | Value |
|---|---|
| Server calls | `/editor?problemId` → 1 DB query (per request, deduped by `React cache()`); course pages render code blocks statically |
| RU / CPU / bandwidth | Realistic marginal cost < **0.5%** of free-tier budget — effectively zero |
| External dependency | **jsDelivr CDN is load-bearing** — one outage/throttle = all editor surfaces offline (§6) |
| localStorage | ≤219 small keys/user, well under the 5MB quota; private mode handled |

## 3. Monitoring

| Gap | Detail | Fix |
|---|---|---|
| No visibility into editor behaviour | No counter of run / error / timeout rates — at 500 users you'd be blind to broken starters or spiking timeouts | Enable Vercel Analytics (free, ~0.2 hr) for page views; no server-side instrumentation needed for this module |

## 4. Logging

| Finding | Detail |
|---|---|
| ✅ Server | `getProblemById` failures logged via `createLogger("problem-data")` |
| 🟡 Client | Autosave failures are silently swallowed; no `console.error` on run / dialog failures. Add `console.warn("[editor] run failed/timeout:", ...)` on those paths (surfaces in devtools, free) |

## 5. Security (the meat)

| Finding | Detail | Fix |
|---|---|---|
| ✅ **Worker sandbox no longer exposes network globals** | **Fixed 2026-08-20** — `lib/editor.ts:31-58` runs user code via `new Function` with `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts`, `navigator` (closes `sendBeacon` exfil), `self`, `globalThis`, and `postMessage` shadowed to `undefined` (param/arg list is a single source of truth, so it can't drift). Covers problems editor, `/editor`, EditorDialog, and code-block Run alike. Verified: all 8 vectors throw; normal exercises unaffected (no seed uses any of these globals). **Known residual:** `(0, eval)("fetch(...)")` and `Function("return this")().fetch` still reach the real globals — out of scope; this is a casual-abuse deterrent, not a security boundary | Done |
| ✅ No XSS surface | Monaco is a plain editor; `code-block` renders children as React nodes (escaped) | — |
| ✅ Numeric `problemId` probing | benign — public read-only data | — |

## 6. Failure Recovery

| Scenario | Today | Fix |
|---|---|---|
| 🔴 CDN outage / offline | Monaco never loads → blank editor box, user is stuck (no fallback) | ErrorBoundary → plain `<textarea>` fallback that reuses the same worker Run (small change, large win) |
| ✅ Infinite loop | 5s timeout + `worker.terminate()` + `revokeObjectURL` | Already solid |
| 🟢 Private-mode autosave | Edits silently lost on refresh | Warn once: "code won't be saved on this device" |
| 🟡 Reset destroys unsaved work | `reset()` overwrites `initialCode` + autosave with no confirmation (`hooks/useCodeEditor.ts:53-57`) | Confirm when `code !== initialCode` |
| 🟢 File import / run errors | Surfaces in `OutputPane` | ✅ |

---

## Prioritized Action Plan

### Tier 1 — Recommended (~2 hours total)

| # | Action | Benefit | Effort |
|---|--------|---------|--------|
| 1.1 | **Sandbox hardening** — `lib/editor.ts`: shadow `fetch` / `XMLHttpRequest` / `WebSocket` / `importScripts` / `navigator` / `self` / `globalThis` / `postMessage` before evaluating user code | Closes the only real security gap; covers problems editor, `/editor`, playground, and code-block Run in one place. Duplicates problems-review Tier 1.2 — do both together. **✅ Done 2026-08-20** | 0.25 hr |
| 1.2 | **Monaco CDN fallback** — error boundary + `<textarea>` fallback that still Runs via the worker | Removes the single point of failure for the whole module | 1 hr |
| 1.3 | **Log cap in the worker** — truncate captured lines (10k) + chars (500KB) with `… N more lines truncated` marker | Protects the main thread from pathological output. **✅ Done 2026-08-20** | 0.25 hr |

### Tier 2 — Optional (~0.5 hour)

| # | Action | Note |
|---|--------|------|
| 2.1 | Reset confirmation + "autosave unavailable" warning | Prevents silent data loss |
| 2.2 | `console.warn` on run timeout / worker errors | Monitoring hygiene via devtools |