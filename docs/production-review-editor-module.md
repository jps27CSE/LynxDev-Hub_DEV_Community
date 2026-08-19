# Production Review — Editor Module (500 Concurrent Users, Free Tier)

> **Date:** 2026-08-19
> **Scope:** `lib/editor.ts`, `hooks/useCodeEditor.ts`, `components/editor/*`, `components/code-block.tsx`, `/editor` page (VS Code-style workspace, JS/HTML/CSS playground), problems workspace + dialog editor surfaces
> **Stack:** Next.js 16 on Vercel Hobby | TiDB Cloud Starter (Free) | Monaco via jsDelivr CDN
> **Supersedes:** the 2026-08-06 review of this module

## Verdict

The editor module is **~99% client-side** — the server impact is a single `getProblemById`
query on `/editor?problemId=N`, Monaco ships from the CDN, and statements never rebundle.
At 500 users it costs Vercel essentially **zero**. This review targets **client-side
quality** — sandbox security and failure recovery — not infrastructure.

Since the last review, the module grew a VS Code-style fullscreen playground with
JS/HTML/CSS support and a sandboxed iframe preview (`83aebd4`, `ad43ab0`). The preview
iframe is properly sandboxed, but the **worker sandbox gap remains open**, the **Monaco
CDN fallback is still missing**, and the new surfaces introduced a handful of smaller
issues (cursor re-render churn, autosave flush loss, download filename bug).

---

## 1. Security

| Finding | Detail | Severity |
|---|---|---|
| 🔴 **Worker sandbox exposes full globals** | `lib/editor.ts:22-41` runs user code via `new Function("console", code)` in sloppy mode inside a worker global scope. `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts`, `navigator.sendBeacon`, `indexedDB`, `caches`, `postMessage`, `close` are all reachable (bare, via `self`, or via `this`). `fetch` in a worker sends same-origin cookies → user code can call any `/api/*` as their own session, loop the mentor endpoint to burn Mistral quota, or spoof `postMessage` to fake run results. Affects problems workspace, `/editor`, playground, and code-block Run — one fix covers all. **Open since the 2026-08-06 review (Tier 1.1)** | 🔴 |
| ✅ `BrowserPreview` iframe | `sandbox="allow-scripts"` + `srcDoc` → opaque origin, no cookies, no parent access. Solid | — |
| ✅ No XSS surface | Monaco is a plain editor; `code-block` renders children as React nodes (escaped) | — |
| 🟡 Unpinned Monaco from jsDelivr | `@monaco-editor/react` default loader fetches the latest `monaco-editor` — supply-chain drift + availability risk. Pin via `loader.config` (optionally SRI) | 🟡 |

## 2. Performance

| Finding | Detail | Severity |
|---|---|---|
| 🟡 Full-tree re-render on every cursor move | `app/(routes)/editor/EditorClient.tsx:85-91` — every Monaco cursor event → `setCursor` in the page root → re-renders `EditorWorkspace` (unmemoized) → `MonacoEditor` (unmemoized, fresh `options` object per render). Monaco itself survives, but the subtree reconciles needlessly. Fix: isolate the status-bar cursor readout in its own tiny component; `React.memo` workspace + editor; memoize the `options` object | 🟡 |
| 🟡 Unbounded log capture | The worker (`lib/editor.ts:22-41`) pushes every `console.log` line during the 5s window; `for(i=0;i<1e7;i++)console.log(i)` builds a huge array → giant `postMessage` string stalls the main thread and renders a megabyte `<pre>`. Cap ~5-10k lines in the worker **and** cap rendered output (~100KB) with a "truncated" note. **Open since 2026-08-06 (Tier 1.3)** | 🟡 |
| 🟡 Monaco remount on problem/language switch | `ProblemPane` keyed by `problem.key` (`app/(routes)/problems/[slug]/_components/ProblemPane.tsx`); `EditorWorkspace` keyed by `problem:language` (`EditorClient.tsx:165`). Clean state per problem is a reasonable trade-off, but a language switch could use `setModelLanguage` instead of a full editor destroy/recreate (~300-600ms parse) | 🟡 |
| 🟡 Full Monaco build (~4-5MB) from CDN | Not Vercel's bandwidth, but a big parse on low-end devices. Optionally scope to JS/HTML/CSS languages only | 🟢 |
| ✅ Good | Autosave debounced 500ms; lazy `next/dynamic` Monaco + CDN loader — no page carries the cost; worker isolation with timeout; iframe preview | — |

## 3. Scaling (500 users)

| Metric | Value |
|---|---|
| Server calls | `/editor?problemId` → 1 DB query per request (deduped in-request by `React cache()`); course pages render code blocks statically |
| RU / CPU / bandwidth | Realistic marginal cost < **0.5%** of free-tier budget — effectively zero |
| External dependency | **jsDelivr CDN is load-bearing** — one outage/throttle = all editor surfaces offline (§6) |
| localStorage | ≤219 small keys/user, well under the 5MB quota; private mode handled |

Optional (not needed at 500): `unstable_cache` with a revalidate window on `getProblemById`
to drop even the per-visit query.

## 4. Monitoring

| Gap | Detail | Fix |
|---|---|---|
| No visibility into editor behaviour | No counter of run / error / timeout rates — at 500 users you'd be blind to broken starters or spiking timeouts | Enable Vercel Analytics (free, ~0.2 hr) for page views. At this scale, page-view signals suffice — don't build custom event pipelines |
| Server-side already covered | `getProblemById` / `getAllProblems` failures logged via `createLogger("problem-data")` | — |

## 5. Logging

| Finding | Detail |
|---|---|
| ✅ Server | Problem-data failures logged via `createLogger("problem-data")` |
| 🟡 Client | Autosave failures are silently swallowed; no `console.error`/`console.warn` on run / timeout / worker failures. Add `console.warn("[editor] run failed/timeout:", ...)` on those paths (surfaces in devtools, free); optionally a single `window.addEventListener("error")` on editor pages |

## 6. Failure Recovery

| Scenario | Today | Fix |
|---|---|---|
| 🔴 CDN outage / offline | Monaco never loads → blank editor box, user is stuck. **Open since 2026-08-06 (Tier 1.2)** | ErrorBoundary → plain `<textarea>` fallback that reuses the same worker Run (small change, large win) |
| 🟡 Autosave flush lost on unmount | `hooks/useCodeEditor.ts:35-39` — cleanup only `clearTimeout`s; switching problem/language (or closing the tab) within the 500ms debounce window **silently drops the last edit** | Flush synchronously on unmount + `pagehide` listener |
| ✅ Infinite loop | 5s timeout + `worker.terminate()` + `revokeObjectURL` | Already solid |
| 🟡 Reset destroys unsaved work | `reset()` overwrites `initialCode` + autosave with no confirmation (`hooks/useCodeEditor.ts:53-57`). **Open since 2026-08-06 (Tier 2.1)** | Confirm when `code !== initialCode` |
| 🟢 Private-mode autosave | Edits silently lost on refresh. **Open since 2026-08-06 (Tier 2.1)** | Warn once: "code won't be saved on this device" |
| 🟢 Import size cap | `file.text()` accepts arbitrarily large files → Monaco chokes; a quota-filled localStorage makes the "Autosave: On" status bar a lie | Cap ~1MB with a friendly error; reflect real autosave state in the status bar |
| 🟢 File import / run errors | Surfaces in `OutputPane` | ✅ |

---

## 7. Next.js / UI-UX (senior review)

| Finding | Detail |
|---|---|
| 🟡 No `loading.tsx` / `error.tsx` on `/editor` | The page awaits a DB query before first paint → blank screen during the round-trip; a client crash in the complex workspace tree = white screen. Add a skeleton + error boundary |
| 🟡 `problems/[slug]` lacks `loading.tsx` / `error.tsx` too | Same white-screen risk for the heaviest client tree in the app |
| 🟡 Download filename bug | `useCodeEditor.downloadCode` hardcodes `solution.js` — saving in HTML/CSS playground modes produces a `.js`-named file (title bar even shows `index.html`) |
| 🟡 Keyboard inconsistency | Ctrl+Enter works in the problems workspace only; `/editor` has no run shortcut |
| 🟡 `OutputPane` has no `aria-live` | Screen-reader users never hear run results / "Running" — add `role="status"` / `aria-live="polite"` |
| 🟢 "Autosave: On" is unconditional | Shows On even when storage is blocked — tie to real state (§6) |
| ✅ Good | Awaited `searchParams` (Next 16); `ssr:false` dynamic Monaco; fully-typed props; aria-labels; focus states; mobile layouts (45dvh editor / stacked preview); consistent dark theme |
| 🟢 Minor | No `metadata` title on `/editor`; hydration is currently safe only because Monaco never SSRs `value` — if code text ever renders server-side, the `loadSavedCode` state initializer will mismatch. Worth a comment |

---

## Prioritized Action Plan

### Tier 1 — Recommended (~2.5 hours)

| # | Action | Benefit | Effort |
|---|--------|---------|--------|
| 1.1 | **Sandbox hardening + log cap in one place** — `lib/editor.ts`: run user code in `"use strict"` and shadow `fetch` / `XMLHttpRequest` / `WebSocket` / `importScripts` / `navigator` / `indexedDB` / `caches` / `postMessage` / `close` / `self` / `globalThis` before eval; cap captured logs (~10k lines) | Closes the only real security gap; protects the main thread from pathological output; covers problems editor, `/editor`, playground, and code-block Run in one place. Duplicates problems-review Tier 1.2 — do both together | 0.5 hr |
| 1.2 | **Monaco CDN fallback** — error boundary + `<textarea>` fallback that still Runs via the worker; pin the Monaco version in `loader.config` | Removes the single point of failure for the whole module + supply-chain drift | 1 hr |
| 1.3 | **Autosave flush on unmount + `pagehide`** — flush the pending debounced write before unmount / tab close | Stops silent loss of the last <500ms of edits | 0.5 hr |
| 1.4 | **`loading.tsx` / `error.tsx` for `/editor`** | No blank screen while the DB query resolves; graceful client-crash recovery | 0.25 hr |

### Tier 2 — Optional (~2 hours)

| # | Action | Note |
|---|--------|------|
| 2.1 | Perf: memoize `EditorWorkspace` / `MonacoEditor`, memoize `options`, isolate the status-bar cursor readout | Stops full-tree re-render per cursor move |
| 2.2 | Output render cap (~100KB) + import size cap (~1MB) | Bounded memory and DOM |
| 2.3 | Reset confirmation + honest autosave status + private-mode warning | Prevents silent data loss |
| 2.4 | `console.warn` on run timeout / worker errors; optional `window` error listener | Monitoring hygiene via devtools |
| 2.5 | Download filename per mode (`solution.js` / `index.html` / `styles.css`) | Correctness |
| 2.6 | Ctrl+Enter run on `/editor`; `aria-live` on run output | Consistency + a11y |
| 2.7 | `loading.tsx` / `error.tsx` for `problems/[slug]` | Same as 1.4 for the heaviest tree |