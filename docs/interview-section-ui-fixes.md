# Interview Section — UI/UX Audit & Fix Plan

> Status: **In progress** · Last audited: 2026-08-02 ·
> Scope: all `app/(routes)/interview/**` pages, shared `AppShell`/`Sidebar`, and the local dev UI.
> Owner: Frontend / UX.

This doc records the findings of a full UI/UX + mobile-responsive audit of the Interview Preparation
section, plus the ordered, task-sized fixes. Each task is independent and testable in isolation.

Progress: **13 of 13 fixed** — see ✅ Done sections below.

## Current file map

| Page | Files |
| --- | --- |
| Landing | `app/(routes)/interview/page.tsx` |
| Track reader | `app/(routes)/interview/[category]/page.tsx` + `CategoryClient.tsx` |
| Practice mode | `app/(routes)/interview/[category]/practice/page.tsx` + `PracticeClient.tsx` |
| Custom practice | `app/(routes)/interview/[category]/custom-practice/page.tsx` + `CustomPracticeClient.tsx` |
| Customize stack | `app/(routes)/interview/customize/page.tsx` + `CustomizeClient.tsx` |
| Shared shell | `app/(routes)/_components/AppShell.tsx`, `Sidebar.tsx` |

---

## 🔴 P0 — Critical (breaks mobile)

### 1. Mobile hamburger overlaps every inner header — ✅ Done (2026-08-02)

- **Where**: `_components/AppShell.tsx:33` (fixed `top-3 left-3 z-30`, 36×36, `lg:hidden`)
- **Affected**: `CategoryClient.tsx:238`, `practice/page.tsx:34`,
  `custom-practice/page.tsx:24`, `customize/page.tsx:37`. All page headers
  start their content at `px-4` (16px), so the fixed hamburger covers the
  "← Interview" breadcrumb text on mobile.
- **Implemented**:
  - New shared component **`components/PageHeader.tsx`** (server-safe) with
    `border-b border-border/40 bg-card pl-14 pr-4 sm:pr-6 lg:px-8 py-3`.
    Left padding stays `56px` at every width below `lg`, which fully clears
    the 36px hamburger (spans 12–48px); `lg:px-8` restores 32px where the
    trigger is hidden.
  - Applied `<PageHeader>` in: `CategoryClient.tsx:239`, `practice/page.tsx:35`,
    `custom-practice/page.tsx:25`, `customize/page.tsx:38` — plus the
    identical header in `learn/[courseId]/[chapterId]/page.tsx` (same defect).
- **Lesson learned** (why the naive fix failed): `px-4 pl-14 sm:px-6 lg:px-8`
  breaks at 640–1023px — Tailwind v4 emits `sm:px-6` as `padding-inline`,
  which lands *after* the base `padding-left` from `pl-14` in the generated
  CSS and overrides it back to 24px while the hamburger is still visible.
  Verified by compiling the CSS; fix uses **conflict-free** classes that set
  one side per breakpoint.
- **Verification**: `tsc --noEmit` clean, prettier clean, compiled CSS
  inspected at base / `sm` / `lg`.
- Test: 375px viewport, signed-in, every interview sub-page breadcrumb
  visible & tappable (also re-check 768px tablet width).

### 2. Category reader is a fixed-height "mini-app" — ✅ Done (2026-08-02)

- **File**: `CategoryClient.tsx:237` — `h-screen overflow-hidden` + inner
  `overflow-y-auto` (`:315`).
- **Problems**:
  - `100vh` on iOS Safari clips the bottom of content when the URL bar is
    collapsed → content below the fold unreachable.
  - Nested scroll containers break scroll-chaining on touch devices; the
    page feels frozen at boundaries.
- **Implemented** (document-scroll approach — matches `problems`/`practice`):
  - Outer wrapper: `h-screen overflow-hidden` → plain `flex flex-col`
    (document scroll; fixes iOS 100vh clipping + scroll-chaining).
  - `main`: dropped `overflow-y-auto` + ref; scroll-to-top on chapter change
    is now `window.scrollTo({ top: 0, behavior: "smooth" })`.
  - Desktop chapter rail: now `sticky top-0 h-dvh overflow-y-auto` so the
    rail stays visible while the page scrolls (no UX regression vs. the old
    fixed viewport), and only on `lg+` as before.
  - Removed now-unused `useRef`.
- **Verification**: `tsc --noEmit` + prettier clean. Manual test needed:
  iOS Safari with collapsed URL bar (no clipped bottom), 375px + 1440px,
  chapter switch scrolls to top.

### 3. No chapter navigation on mobile — ✅ Done (2026-08-02)

- **File**: `CategoryClient.tsx:281` — `aside` is `hidden lg:block`; the
  sidebar toggle is `hidden lg:flex` (`:263`).
- **Impact**: on `<lg` viewports the only way to move between chapters is
  the Prev/Next bar (`:448`), which is poor for multi-chapter categories
  (no overview, no jump).
- **Implemented**: collapsible, searchable chapter list on mobile (`lg:hidden`,
  default open):
  - Header toggle row: "Chapters" + current position `n/N` + chevron; `aria-expanded`.
  - Panel: `Search` input filtering chapter titles (client-side, `useMemo`),
    scrollable list (`max-h-72`) reusing the desktop rail's row styling
    (`01. <title>` + active state), "No chapters match your search" empty
    state. Selecting a chapter calls `handleSetChapter` (URL `?chapter=`
    stays in sync) and collapses the panel.
  - Desktop rail and toggle are unchanged.
- **Verification**: `tsc --noEmit` + prettier clean. Manual: 375px — search
  narrows list, select updates content + URL, panel collapses, would also
  check search empty state.

### 4. Category header has no responsive overflow handling — ✅ Done (2026-08-02)

- **File**: `CategoryClient.tsx:239-276`. Single row: breadcrumb +
  "Custom Practice" + "Practice Mode" buttons. No truncation, no wrap,
  no breakpoints. Squeezes/overlaps at ~375px.
- **Implemented**:
  - CTA labels hidden below `md` (icon-only, `aria-label` preserved).
  - **Distinct icons** per CTA: `SlidersHorizontal` for Custom Practice,
    `Sparkles` for Practice Mode (icons are no longer ambiguous at
    icon-only widths).
  - Breadcrumb: `flex-1 min-w-0` on the left cluster + `truncate` on the
    category name; outer row got `flex-wrap` as a safety net so the right
    cluster drops to a second row instead of overlapping at ultra-narrow
    widths. Dropped the redundant `px-2.5` (Button `sm` already applies
    `has-[>svg]:px-2.5`).
- **Verification**: `tsc --noEmit` + prettier clean. Manual: 320/375/767px —
  single row, distinct CTA icons, labels return ≥768px, no overlap.

---

## 🟠 P1 — High (consistency / UX)

### 5. "Customize Your Stack" is a dead-end promise — ✅ Done (2026-08-02, option A)

- **Files**: `CustomizeClient.tsx:8` saves `lynxdev_interview_stacks`;
  `CategoryClient.tsx:44` declared the same `STORAGE_KEY` but never read it.
- **Implemented (option A — wire it up, client-side only, no API)**:
  - `CategoryClient.tsx` now loads saved tags from `lynxdev_interview_stacks`
    guarded by try/catch after mount; `tailored` starts `true` when a stack
    exists.
  - `sortedQuestions` filters to questions whose tags intersect the saved
    stack and orders by match count (most relevant first). Stacked on top of
    the existing sort control.
  - Chapter heading UI: "Tailored to: X, Y, Z…" primary chip with an ✕ to
    revert; a "Personalize by saved stack" outline chip restores it.
  - Questions count badge reflects the filtered length; empty state card
    ("No questions in this chapter match your saved stack" + "Show all
    questions") covers the zero-match case.
- Per plan, filtering stays client-side in `CategoryClient` — no new API.
- **Verification**: `tsc --noEmit` + prettier clean. Manual: save a stack in
  Customize → open a category → questions filtered/ordered by stack; ✕ and
  re-enable both restore full list.

### 6. Duplicated `AnswerMarkdown` component (×3) — ✅ Done (2026-08-02)

- **Files**: `CategoryClient.tsx:85-171`, `PracticeClient.tsx:36-122`,
  `CustomPracticeClient.tsx:27-113`. ~100 identical lines each.
- **Implemented**: extracted to **`components/markdown-answer.tsx`**
  (named export `AnswerMarkdown`, no `"use client"`), imported by all three
  pages. Removed the local copies and their `react-markdown` /
  `remark-gfm` / `rehype-highlight` imports. Verified zero remaining
  `ReactMarkdown` references under `app/(routes)/interview`.
- **Bundled**: while consolidating, code blocks now live in a
  `pre.overflow-x-auto` inside the relative code wrapper (see #7) — wide
  highlighted code scrolls horizontally instead of bleeding off card on
  mobile; the language chip stays pinned.
- **Verification**: `tsc --noEmit` + prettier clean. Manual: render a
  chapter/practice/custom-practice answer containing a long code line at
  375px (horizontal scroll, no overflow) — otherwise identical rendering.

### 7. Code blocks overflow horizontally on mobile — ✅ Done (2026-08-02)

- **Files**: all three `AnswerMarkdown`.
- **Implemented**: the shared `markdown-answer.tsx` wraps block code in
  `pre.overflow-x-auto` (multi-line `highlight.js` samples scroll instead
  of bleeding horizontally); tables already used the same pattern.
- **Verification**: see #6 — visual check at 375px with a wide snippet.

### 8. Custom Practice renders raw tag slugs — ✅ Done (2026-08-02)

- **File**: `CustomPracticeClient.tsx:160` (chip) and `:253` (badge) show
  `{tag}` e.g. `"data-structures"`.
- **Implemented**: extracted one canonical **`lib/tags.ts`** exporting
  `formatTagLabel` (merged `tagLabels` map, incl. the extended QA/stack
  entries) and used it everywhere:
  - `CustomPracticeClient` filter chips + result badges now show labels.
  - `CategoryClient` topic badges + `PracticeClient` question badges now
    show labels too (previously updated them with the same raw `{tag}`).
  - Removed the two duplicated local copies (`CategoryClient`, `CustomizeClient`).
  - Verified no `function formatTagLabel` / local `tagLabels` remain under
    `app/(routes)/interview`.
- **Verification**: `tsc --noEmit` + prettier clean.

### 9. Practice footer + tag rows overflow on small screens — ✅ Done (2026-08-02)

- **File**: `PracticeClient.tsx:223` (tags row) and `:261` (Prev / Mark as
  Reviewed / Next) — both `flex` with no wrap. "Mark as Reviewed" is long.
- **Implemented**:
  - Tags row: added `flex-wrap` so difficulty + tags + Top 50 wrap
    naturally instead of overflowing.
  - Footer: responsive 2-row layout on mobile — `Previous | Next` pair on
    row 1 (`justify-between`), `Mark as Reviewed` full-width on row 2;
    back to a single `justify-between` row ≥`sm`. Good tap targets on
    phones, unchanged on desktop.
  - Question badges also formatted via `formatTagLabel` (ties into #8).
- **Verification**: `tsc --noEmit` + prettier clean. Manual: 320/375px —
  tags wrap, footer stacks, "Mark as Reviewed" is full-width; ≥640px restores
  single row.

---

## 🟡 P2 — Medium (polish)

### 10. Custom Practice missing empty/error states — ✅ Done (2026-08-02)

- **File**: `CustomPracticeClient.tsx:135-147` — on API error `questions`
  silently reset to `[]`; zero-match has no status.
- **Implemented**:
  - `error` state → "Failed to load questions. Please try again." under the
    controls on request failure.
  - `hasSearched` state → dashed empty-state card "No questions found —
    try fewer tags." when a search returns zero matches.
  - `Get Questions` button shows a `<Loader2>` spinner while loading.
  - `clearAll` resets error + searched flag.
- **Verification**: `tsc --noEmit` + prettier clean.

### 11. Landing page dead code & unused styles — ✅ Done (2026-08-02)

- **File**: `interview/page.tsx:9-49` theme map rows for Fullstack/DevOps/QA
  are unreachable since `PUBLISHED_SLUGS` (now `INTERVIEW_PUBLISHED_SLUGS` in
  `lib/interview-constants.ts`) filters to 3; and `:165`
  sets `animationDelay` with no animation system running.
- **Implemented**: trimmed `categoryThemes` to the 3 allowed tracks and
  dropped the unused `medium` field from the shape + fallback; removed the
  dead `animationDelay` and the now-unused `idx` map arg.
- **Verification**: `tsc --noEmit` + prettier clean.

### 12. "Reviewed %" progress is session-only, not persisted — ✅ Done (2026-08-02)

- **File**: `PracticeClient.tsx:194` — `reviewed` Set is in-memory.
- **Implemented**: persisted to `localStorage["lynxdev_reviewed_<slug>"]`:
  load once on mount (guarded try/catch, `hydratedReviews` ref so we never
  overwrite stored data with the empty pre-hydration set), persist on
  change. Progress/toggle now survives reloads.
- **Verification**: `tsc --noEmit` + prettier clean. Manual: mark a few,
  reload — still reviewed, bar restored.

### 13. Tag chips: no select-all / per-group toggle — ✅ Done (2026-08-02)

- **File**: `CustomizeClient.tsx:145-180` group cards.
- **Implemented**: per-group header actions — `Select all` (adds the whole
  group) and `Clear` (shown when ≥1 selected in the group), plus a
  `· N selected` count appended to the subtitle. `saveSelection` flow and
  footer bar unchanged.
- **Verification**: `tsc --noEmit` + prettier clean.

---

## ✅ Already good (keep as-is)

- Server Components + `cache()` + batched `Promise.all` in
  `practice/page.tsx:23` and initiation APIs.
- `useSearchParams` properly wrapped in `Suspense`.
- Consistent difficulty color tokens across Interview & Problems.
- Prev/Next, sort, mark-reviewed & infinite-scroll prefetch all work.
- Landing hero/cards are responsive.

---

## ⚙️ When I should be worked

Order of execution (each is isolated / testable):

1. **P001** — shared `PageHeader` + mobile offset: fixes #1 and #4.
   → **#1 and #4 done** (PageHeader + responsive header row).
2. **P002** — responsive `h-dvh` + mobile chapter picker: fixes #2 and #3.
   → **#2 and #3 done** (document scroll + sticky rail + mobile chapter search list).
3. **P003** — extract `AnswerMarkdown` `lib/` + `formatTagLabel` in lib: fixes #6, #7, #8.
   → **#6, #7, #8 done** (shared `components/markdown-answer.tsx`, `lib/tags.ts`).
4. **P004** — Practice practice mode footer / wrap + tags wrap: fixes #9.
   → **#9 done** (responsive 2-row footer + tags wrap).
5. **P005** — `CustomizeClient` empty/error states + persistent reviewed: fixes #10, #12, #13.
6. **P006** — dead code cleanup on landing page (#11).
7. **P007** — decide + implement "saved stack ™ workflow (#5).

After every task: `npm run build` + `npm run lint` + manual test on
375/390/1440, dark mode, both auth states.

**Tracking:** items are marked `✅ Done (date)` in the sections above as they
ship; unmarked items are pending.