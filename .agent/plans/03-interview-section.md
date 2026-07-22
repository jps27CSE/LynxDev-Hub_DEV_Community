# Phase 2 — Interview Section

## Purpose

Categorized interview prep with tag-based customization, AI question generation, and top 50 curated questions per category.

## Pages & Routes

| Route | Purpose |
|-------|---------|
| `/interview` | Category selection + overview |
| `/interview/[category]` | Category detail with tags + questions |
| `/interview/[category]/practice` | Practice mode with question-by-question UI |

## Components

### Interview Home (`/interview`)
- Category cards grid
  - Software Engineer
  - Frontend Engineer
  - Backend Engineer
  - Fullstack Engineer
  - DevOps Engineer
  - QA Engineer
- Each card: icon, title, question count
- Top 50 badge on cards that have curated questions

### Category Page (`/interview/[category]`)
- Tag filter chips (React, Angular, Spring Boot, Node.js, AWS, Docker, etc.)
- Question list with difficulty badges
- Filter: all / easy / medium / hard
- "Generate 50 Questions" button → AI generates questions based on selected tags
- "Top 50" tab → curated questions

### Practice Mode (`/interview/[category]/practice`)
- Single question view
- Show answer on click (accordion/card flip)
- Next/Previous navigation
- Mark as reviewed
- Progress tracking (how many done)

## Data Model

Uses:
- `interview_categories` — category metadata
- `interview_questions` — questions with tags (JSONB), difficulty, is_top50 flag

## AI Question Generation

- Endpoint: `POST /api/interview/generate`
- Takes: category + selected tags + count (default 50)
- Returns: array of {question, answer, difficulty}
- AI Provider: Gemini Flash (free) or Groq
- Rate limited: 5 generations per user per hour
- Generated questions optionally saved to DB (with generated=true flag) for reuse

## Free Tier Optimizations

- **Pre-seed top 50 questions** manually (zero AI cost for these)
- **Cache generated questions** per tag combination (avoid re-generation)
- **JSONB tags** — single column, no join table
- **Paginate** question lists (20 per page max)
- **Rate limit** AI generation aggressively
