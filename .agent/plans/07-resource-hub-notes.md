# Phase 4 — Resource Hub + Developer Notebook

## Purpose

Resource hub for YouTube playlists, blogs, tools, and a personal developer notebook for notes and code snippets.

## Pages & Routes

| Route | Purpose |
|-------|---------|
| `/resources` | Resource hub (YouTube + blogs + tools) |
| `/notes` | Developer notebook list |
| `/notes/new` | Create new note |
| `/notes/[id]` | View/edit note |

## Components

### Resource Hub (`/resources`)
- Tabbed sections:
  - **YouTube**: Playlist cards (uses same carousel/train component from homepage)
  - **Blogs/Articles**: Link cards with title, description, external link
  - **Tools**: Tool recommendations with tags
- All data from static config (no DB needed initially)

### Developer Notebook (`/notes`)
- Left: sidebar list of notes (searchable)
- Right: note editor
- Each note: title, content (markdown), code snippets (with language labels)
- CRUD operations
- Save via Server Action (auto-save on debounce)

## Data Model

Uses:
- `user_notes` — notes with JSONB code_snippets

## Free Tier Optimizations

- **Resource hub** is fully static (config file, no DB reads)
- **Notes** use server actions (no API route overhead)
- **JSONB code_snippets** — flexible schema, single column
- **Auto-save debounce** (5s) — reduces DB writes
- **No rich text** — markdown only (simpler, lighter)
