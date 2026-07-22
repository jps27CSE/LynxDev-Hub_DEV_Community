# Phase 3 — Developer Community

## Purpose

Community features: posts, discussions, comments — a space for developers to ask questions and share knowledge.

## Pages & Routes

| Route | Purpose |
|-------|---------|
| `/community` | Post feed |
| `/community/new` | Create new post |
| `/community/[id]` | Post detail + comments |

## Components

### Post Feed (`/community`)
- Sort: Latest, Top (by upvotes)
- Each post: title, author avatar + name, excerpt, tag chips, upvote count, comment count, time ago
- Paginated (20 per page)

### Create Post (`/community/new`)
- Title input
- Content textarea (Markdown supported)
- Tag selector (multi-select: react, help, discussion, showoff, etc.)

### Post Detail (`/community/[id]`)
- Full post content (markdown rendered)
- Upvote button
- Comment list (flat or nested)
- Comment form

## Data Model

Uses:
- `posts` — community posts with JSONB tags
- `comments` — comments with soft delete

## Free Tier Optimizations

- **Soft delete** (is_deleted flag) — no cascade issues
- **JSONB tags** instead of tag join table
- **Markdown** rendered client-side (no server load)
- **No real-time** — refresh to see new content
- **Pagination** with offset/limit (cursors are overkill at this scale)
- **No image uploads** — users link images via URL
