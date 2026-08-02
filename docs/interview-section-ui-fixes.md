# Interview Section — UI/UX Audit & Fix Plan

> Status: **In progress** · Last audited: 2026-08-02 ·
> Scope: all `app/(routes)/interview/**` pages, shared `AppShell`/`Sidebar`, and the local dev UI.
> Owner: Frontend / UX.

This doc records the findings of a full UI/UX + mobile-responsive audit of the Interview Preparation
section, plus the ordered, task-sized fixes. Each task is independent and testable in isolation.

Progress: **1 of 13 fixed** — see ✅ Done sections below.

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

### 2. Category reader is a fixed-height "mini-app"

- **File**: `CategoryClient.tsx:237` — `h-screen overflow-hidden` + inner
  `overflow-y-auto` (`:315`).
- **Problems**:
  - `100vh` on iOS Safari clips the bottom of content when the URL bar is
    collapsed → content below the fold unreachable.
  - Nested scroll containers break scroll-chaining on touch devices; the
    page feels frozen at boundaries.
- **Fix**:
  - Swap `h-screen` → `h-dvh` (with `supports[-...]` fallback) OR drop the
    fixed viewport entirely and let the document scroll (preferred — matches
    `problems` and `practice` routes).
  - If keeping the sticky reader layout: keep the top bar + chapter rail
    `sticky`, and set the rail/main to `h-dvh` with `overflow-y-auto`.

### 3. No chapter navigation on mobile

- **File**: `CategoryClient.tsx:281` — `aside` is `hidden lg:block`; the
  sidebar toggle is `hidden lg:flex` (`:263`).
- **Impact**: on `<lg` viewports the only way to move between chapters is
  the Prev/Next bar (`:448`), which is poor for multi-chapter categories
  (no overview, no jump).
- **Fix**: add a mobile chapter picker above the chapter content:
  - A `<Sheet>`/`Drawer` reusing the same rail content, OR
  - A compact `<select>` "Chapter x of y" when `< lg`.
- Wire it to the same `handleSetChapter` callback.

### 4. Category header has no responsive overflow handling

- **File**: `CategoryClient.tsx:239-276`. Single row: breadcrumb +
  "Custom Practice" + "Practice Mode" buttons. No truncation, no wrap,
  no breakpoints. Squeezes/overlaps at ~375px.
- **Fix**: on `xs`/`sm`:
  - Hide button labels → icon-only with `aria-label`, and
  - `flex-wrap` on the right cluster, or move CTAs to a second row.

---

## 🟠 P1 — High (consistency / UX)

### 5. "Customize Your Stack" is a dead-end promise

- **Files**: `CustomizeClient.tsx:8` saves `lynxdev_interview_stacks`;
  `CategoryClient.tsx:49` declares the same const but never reads it.
- **Impact**: the landing hero (`interview/page.tsx:120-125`) promises a
  "personalized interview plan" but a saved stack has zero effect anywhere.
- **Fix (choose one)**:
  - **A (wire it up)** — pass the saved tags into the category reader and
    surface a "Tailored to: X, Y, Z" filter chip that filters the rendered
    questions of each chapter (and/or orders questions to match).
  - **B (relabel)** — copy it as "save your prefs" learning bookmarks and
    load them into Customize only. Cheaper, honest.
- If **A**: keep filtering client-side in `CategoryClient` (data set is
  small); do not add a new API route.

### 6. Duplicated `AnswerMarkdown` component (×3)

- **Files**: `CategoryClient.tsx:85-171`, `PracticeClient.tsx:36-122`,
  `CustomPracticeClient.tsx:27-113`. ~100 identical lines each.
- **Fix**: extract one shared component (e.g.
  `components/markdown-answer.tsx`) exporting `AnswerMarkdown`, and import
  from all three. Optionally unify with the mentor chat renderer later.

### 7. Code blocks overflow horizontally on mobile

- **Files**: all three `AnswerMarkdown`.
- **Fix**: wrap `<pre>` in an `overflow-x-auto` container (same pattern as
  the markdown `table` renderer already uses). Verify tailwind `highlight.js`
  theme does not introduce fixed widths.

### 8. Custom Practice renders raw tag slugs

- **File**: `CustomPracticeClient.tsx:160` (chip) and `:253` (badge) show
  `{tag}` e.g. `"data-structures"`.
- **Fix**: reuse the shared `formatTagLabel()` (currently duplicated in
  `CategoryClient.tsx:78` and `CustomizeClient.tsx:82`) in
  CustomPracticeClient so all tag display is consistent. Extract helper to
  `lib/` (e.g. `lib/tags.ts`).

### 9. Practice footer + tag rows overflow on small screens

- **File**: `PracticeClient.tsx:223` (tags row) and `:261` (Prev / Mark as
  Reviewed / Next) — both `flex` with no wrap. "Mark as Reviewed" is long.
- **Fix**:
  - Add `flex-wrap` or possibly `gap-2`; on `sm` and below let the tag row
    wrap naturally.
  - Practice footer: stack `Mark as Reviewed` onto its own row on mobile
    (`flex-col sm:flex-row`), keep both: the primary action.

---

## 🟡 P2 — Medium (polish)

### 10. Custom Practice missing empty/error states

- **File**: `CustomPracticeClient.tsx:135-147` — on API error `questions`
  silently reset to `[]`; zero-match has no status.
- **Fix**: show error message, or empty state ("No questions match your
  stacks — try fewer tags") and disable `Get Questions` button while
  `loading` with a spinner (`<Loader2>`).

### 11. Landing page dead code & unused styles

- **File**: `interview/page.tsx:9-49` theme map rows for Fullstack/DevOps/QA
  are unreachable since `ALLOWED_SLUGS` (`:51`) filters to 3; and `:165`
  sets `animationDelay` with no animation system running.
- **Fix**: trim map to allowed slugs or drop the filter, remove dead
  `animationDelay`. Also note the allowed-slug list being hardcoded in JS
  duplicates what DB returns — keep as is for now if intent is to gate.

### 12. "Reviewed %" progress is session-only, not persisted

- **File**: `PracticeClient.tsx:194` — `reviewed` Set is in-memory.
- **Fix (later)**: persist `Set<number>` to `localStorage` keyed by
  category, mirroring the stacks key. Keep `progress` denominator = reviewed
  target (loaded length) unless we know total from the API.

### 13. Tag chips: no select-all / per-group toggle

- **File**: `CustomizeClient.tsx:145-180` group cards.
- **Fix**: add "Select all in group" / "Clear groups" small actions per card.

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
   → **#1 done** (PageHeader in place). #4 (header overflow at ~375px) still open.
2. **P002** — responsive `h-dvh` + mobile chapter picker: fixes #2 and #3.
3. **P003** — extract `AnswerMarkdown` `lib/` + `formatTagLabel` in lib: fixes #6, #7, #8.
4. **P004** — Practice practice mode footer / wrap + tags wrap: fixes #9.
5. **P005** — `CustomizeClient` empty/error states + persistent reviewed: fixes #10, #12, #13.
6. **P006** — dead code cleanup on landing page (#11).
7. **P007** — decide + implement "saved stack ™ workflow (#5).

After every task: `npm run build` + `npm run lint` + manual test on
375/390/1440, dark mode, both auth states.

**Tracking:** items are marked `✅ Done (date)` in the sections above as they
ship; unmarked items are pending.