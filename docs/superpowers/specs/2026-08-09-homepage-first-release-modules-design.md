# Homepage Features Grid — First-Release Modules

**Date:** 2026-08-09
**Status:** Approved by user (build mode)
**Phase:** Post-Phase-2 polish (all 4 modules shipped: Phase 1 Courses/Editor, Phase 2 Problems/Interview)

## Problem

The homepage features grid (`app/_components/Features.tsx`) showcases "AI Developer Mentor" and "Developer Community" — features that are Phase 3 or adjacent and not part of the first release. The **Editor** and **DSA Problems** modules — both live — are missing from the homepage entirely. The grid should tell the story of what's actually live in the first release: Courses, Editor, Problems, Interview.

## Scope

**One file changes:** `app/_components/Features.tsx` (Server Component, static content).

No other homepage sections change (Hero, YoutubeCarousel, CoursePreview, Footer untouched). No DB reads, no API routes, no new dependencies.

## Change

Replace the 4 entries in the `features` array with the 4 first-release modules, keeping the existing card format exactly: icon + title + description + auto-generated `//` chip, 4-column neon grid.

### New card contents

| # | Title | Icon | Accent / Glow / Chip | Description |
|---|-------|------|----------------------|-------------|
| 1 | Interactive Courses | `BookOpen` | cyan (unchanged): `text-cyan-400` / `bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]` / `text-cyan-400/80` | Hands-on courses with real exercises and an embedded editor per chapter — structured learning, not just videos. |
| 2 | Code Editor | `Code2` | blue: `text-blue-400` / `bg-blue-400/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]` / `text-blue-400/80` | A dedicated browser workspace — write and run JavaScript instantly, save your code as a file, and import it back. |
| 3 | DSA Problems | `BrainCircuit` | amber: `text-amber-400` / `bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.2)]` / `text-amber-400/80` | Practice 183 top LeetCode classics plus 36 beginner drills — statement and editor side by side, mark solved as you go. |
| 4 | Interview Prep | `Target` | lime (unchanged): `text-lime-400` / `bg-lime-400/10 shadow-[0_0_20px_rgba(163,230,53,0.2)]` / `text-lime-400/80` | Practice with 900+ categorized questions, tag-based customization, and AI-generated question sets. |

### Removed cards

- **AI Developer Mentor** — real feature (`/mentor`), but not one of the 4 first-release modules; reachable via sidebar/nav
- **Developer Community** — Phase 3, not shipped

### Micro-change

- Section kicker chip: `// features` → `// first release`

## Constraints

- Cards remain **static** (no links, no stats row) — confirmed by user
- Dark-mode only (default) — neon styling already fits
- Keep `lucide-react` icons only; no new dependencies
- Descriptions keep natural-language numbers (consistent with existing cards)
