# Phase 1 — Course Platform

## Purpose

Build a freeCodeCamp-style interactive learning experience with course catalog, chapters, embedded code editor, and gamification (stars/points/badges).

## Pages & Routes

| Route | Purpose |
|-------|---------|
| `/courses` | Browse all available courses |
| `/courses/[id]` | Course detail + chapter list |
| `/learn/[courseId]/[chapterId]` | Interactive lesson + code editor |

## Components

### Course Catalog (`/courses`)
- Grid of course cards
- Each card: icon, title, description, difficulty badge (beginner/intermediate/advanced), chapter count
- Filter by difficulty or category
- "Enroll" button

### Course Detail (`/courses/[id]`)
- Full course info
- Chapter list with completion status
- Progress bar (% complete)
- "Continue Learning" / "Start Course" CTA

### Lesson Page (`/learn/[courseId]/[chapterId]`)
- **Left panel** (40%): Lesson content
  - Markdown-rendered instructions
  - Code examples
  - Tips and hints
- **Right panel** (60%): Code editor
  - Monaco Editor or CodeMirror (in-browser, free)
  - Language selector (HTML/CSS/JS, Python, etc.)
  - Run button (executes code in sandbox)
  - Output panel
  - "Check Solution" button → validates against expected output
- **Navigation**: Previous/Next chapter buttons

### Progress System
- **Points**: Awarded per completed chapter (stored in users.points)
- **Stars**: 1-3 stars per chapter based on solution quality (or completion speed)
- **Badges**: Course completion badge (stored in badges table)
- **Progress saved**: enrollments.progress JSON column

## Data Model

Uses these tables (see database-schema.md):
- `courses` — course metadata
- `chapters` — lesson content (instructions + initialCode + solution stored as JSONB)
- `enrollments` — user progress (JSONB progress column)
- `badges` — earned badges

## Free Tier Optimizations

- **No file uploads** — all content stored as JSONB in DB (tiny rows)
- **Monaco Editor** loaded on-demand (dynamic import) — saves bundle size
- **Code execution** — Use a simple eval sandbox (for JS) or skip live execution initially (just validate output client-side)
- **Progress saves** on debounce (every 30s, not every keystroke)
- **Chapter content** stored as JSONB (avoid joins, single query per lesson)
- **No real-time sync** — simple save/submit model
- All text-based, no images in lessons

## Implementation Order

1. Course catalog page + DB seeding
2. Course detail page + chapter list
3. Lesson page layout (left/right split)
4. Code editor component (Monaco)
5. Run + validate logic
6. Progress saving (points, stars, badges)
7. Enrollment flow
