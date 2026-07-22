# Phase 2 — Problem Solving Section

## Purpose

Curated list of important DSA/algorithm problems for developers to practice.

## Pages & Routes

| Route | Purpose |
|-------|---------|
| `/problems` | Problem list with filters |
| `/problems/[id]` | Problem detail with code editor |

## Components

### Problem List (`/problems`)
- Filter by: difficulty (easy/medium/hard), category (arrays, strings, DP, trees, graphs, etc.)
- Search by title
- Each row: title, difficulty badge, category tag
- Completion status (solved/unsolved)

### Problem Detail (`/problems/[id]`)
- Problem description (left)
- Code editor (right) — same Monaco/CodeMirror component from courses
- Language selector
- Run button
- Test cases (pre-defined)
- Submit → validates against test cases
- Track solved status per user

## Data Model

Uses:
- `problems` — problem statements, initial code (JSONB), solutions (stored as text)

## Free Tier Optimizations

- **No live judge** initially — validate against predefined test cases client-side
- **Problem content** stored as text/JSONB in DB (no external API dependency)
- **Share editor component** with course platform (reuse = less code)
- **Pre-seed** 30-50 problems manually to start
- User solutions stored in-memory or in a simple `solved_problems` JSON column on user profile (avoids new table)

## Implementation Order

1. Problem list page with filters
2. Problem detail page (reuse editor from courses)
3. Test case validation (client-side)
4. Track solved status
