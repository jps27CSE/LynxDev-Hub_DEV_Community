# Phase 5 — Mock Interview (AI Voice) + Skills Roadmap

> Plan: `docs/superpowers/plans/2026-07-25-mock-interview-skills-roadmap.md` (moved here as canonical)

**Goal:** Build two major features:

1. **AI Mock Interview with Voice** — Interactive mock interview where an AI voice interviewer asks questions, presents coding problems in an embedded editor, validates solutions in real time, and gives a feedback report with score and improvement suggestions. Weekly limit: 1 interview per user. Targeted at Junior level initially.

2. **Skills Roadmap with YouTube Courses** — A browseable roadmap section where users can click on skill nodes, see curated learning resources (articles, docs, videos), watch YouTube videos from the CodeInsightsByJack channel, and mark them complete with progress tracking.

**Architecture:** Next.js 16 App Router with server/client components. Drizzle ORM + MySQL for persistence. Web Speech API / TTS for AI voice. Code editor via CodeMirror or Monaco editor.

**Tech Stack:** Next.js 16, Tailwind v4, shadcn/ui, Drizzle ORM, MySQL, Web Speech API (browser TTS) or ElevenLabs/Google TTS API, CodeMirror/Monaco editor, YouTube IFrame API, sonner for toasts.

---

## Part 1: AI Mock Interview

### Database Schema

New tables needed in `config/schema.tsx`:

```typescript
// Mock interview templates (readymade templates per role/topic)
export const mockInterviewTemplates = mysqlTable("mock_interview_templates", {
  id: int().primaryKey().autoincrement(),
  title: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  role: varchar({ length: 100 }).notNull(), // "Junior Frontend", "Junior Backend", etc.
  topics: json().notNull(), // array of topic strings
  difficulty: varchar({ length: 20 }).default("junior"),
  duration_minutes: int().default(30),
  is_active: boolean().default(true),
  order_index: int().default(0),
});

// Mock interview sessions (one per user per week)
export const mockInterviewSessions = mysqlTable("mock_interview_sessions", {
  id: int().primaryKey().autoincrement(),
  user_id: int("user_id").references(() => usersTable.id).notNull(),
  template_id: int("template_id").references(() => mockInterviewTemplates.id),
  custom_topics: json(), // user-chosen topics if not using template
  status: varchar({ length: 20 }).default("pending"), // pending, in_progress, completed
  started_at: timestamp("started_at").defaultNow(),
  completed_at: timestamp("completed_at"),
  score: int().default(0),
  feedback: json(), // full feedback object
});

// Interview questions in a session
export const mockInterviewQuestions = mysqlTable("mock_interview_questions", {
  id: int().primaryKey().autoincrement(),
  session_id: int("session_id").references(() => mockInterviewSessions.id).notNull(),
  question_text: text().notNull(),
  question_type: varchar({ length: 20 }).default("verbal"), // verbal, coding
  coding_prompt: text(), // if coding type
  starter_code: text(),
  solution_code: text(),
  test_cases: json(),
  user_answer_text: text(),
  user_code: text(),
  code_passed: boolean(),
  ai_feedback: json(),
  order_index: int().default(0),
});
```

### Pages & Routes

```
(mock-interview)/
  page.tsx                - List available templates + custom topic selector
  [id]/
    page.tsx              - Start / resume interview session
    session/
      page.tsx            - Live interview with AI voice + editor
    feedback/
      page.tsx            - Post-interview feedback, score, improvements
```

### Components

**`components/mock-interview/`**

| Component | Description |
|---|---|
| `TemplateCard.tsx` | Card for a readymade interview template |
| `TopicSelector.tsx` | Multi-select for custom topics |
| `InterviewSession.tsx` | Main session orchestrator (voice + questions + editor) |
| `VoiceController.tsx` | Handles TTS playback, mic recording |
| `CodingEditor.tsx` | Embedded code editor with test validation |
| `FeedbackReport.tsx` | Score, per-question feedback, improvement list |
| `WeeklyLimitBadge.tsx` | Shows remaining weekly interviews |

### Key Flows

#### Flow 1: Creating an Interview

```
User clicks "New Mock Interview"
  ├── Choose: "Use Template" or "Custom Topics"
  │   ├── Template → Pick from list (Junior Frontend, Junior Backend, etc.)
  │   └── Custom → Select topics (Array, Strings, React Hooks, APIs, etc.)
  └── Start Interview → Creates session (checks weekly limit)
```

#### Flow 2: Live Interview

```
AI Voice: "Welcome to your mock interview. Let's start with a quick question."
AI asks verbal question (TTS)
  └── User answers verbally or types
AI asks coding problem
  └── Editor opens with starter code
  └── User writes solution
  └── Runs test cases → validation
AI gives follow-up based on answer
Repeat until all questions done
```

#### Flow 3: Feedback & Score

```
Interview completes
  ├── Overall score (0-100)
  ├── Per-question breakdown
  │   ├── Correctness
  │   ├── Communication
  │   ├── Code quality (for coding questions)
  │   └── AI feedback comment
  ├── Suggested improvements
  │   ├── "Practice more on Array methods"
  │   ├── "Review React useEffect dependencies"
  │   └── Links to relevant courses/chapters
  └── Weekly limit enforced (1 per week)
```

### Weekly Limit Logic

- Check `mock_interview_sessions` for current week's sessions for the user
- If a session exists and is `completed`, block new interview creation
- Show a `WeeklyLimitBadge` in the UI
- Reset at start of each week (Monday)

---

## Task List for Part 1

- [ ] **Step 1.1: Add DB schema** — Create tables in `config/schema.tsx`, run drizzle migration
- [ ] **Step 1.2: Create data access layer** — `lib/mock-interview-data.ts` with CRUD functions
- [ ] **Step 1.3: Seed templates** — Create `config/seed-mock-interviews.ts` with junior-level templates
- [ ] **Step 1.4: Build API routes** — `app/api/mock-interview/` endpoints (create session, get questions, submit answer, complete session)
- [ ] **Step 1.5: Build TemplatePicker page** — `app/(routes)/(mock-interview)/page.tsx` with template cards + custom topic selector
- [ ] **Step 1.6: Build InterviewSession page** — Live interview UI with AI voice
- [ ] **Step 1.7: Implement VoiceController** — Browser Speech Synthesis API for AI voice
- [ ] **Step 1.8: Implement CodingEditor** — Embedded editor with test runner
- [ ] **Step 1.9: Build FeedbackReport page** — Score + per-question feedback + improvement suggestions
- [ ] **Step 1.10: Add weekly limit check** — Validation on session creation + UI indicator
- [ ] **Step 1.11: Add sidebar nav link** — "Mock Interview" in the sidebar navigation

---

## Part 2: Skills Roadmap with YouTube Courses

### Database Schema

New tables needed:

```typescript
export const skillRoadmaps = mysqlTable("skill_roadmaps", {
  id: int().primaryKey().autoincrement(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  icon: varchar({ length: 10 }),
  color: varchar({ length: 50 }),
  order_index: int().default(0),
  is_published: boolean().default(true),
});

export const skillNodes = mysqlTable("skill_nodes", {
  id: int().primaryKey().autoincrement(),
  roadmap_id: int("roadmap_id").references(() => skillRoadmaps.id).notNull(),
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  icon: varchar({ length: 10 }),
  color: varchar({ length: 50 }),
  parent_id: int("parent_id"), // for tree structure
  order_index: int().default(0),
  resource_type: varchar({ length: 50 }), // "video", "article", "course", "docs"
  resource_url: varchar({ length: 500 }),
  is_published: boolean().default(true),
});

// YouTube videos from the channel
export const youtubeVideos = mysqlTable("youtube_videos", {
  id: int().primaryKey().autoincrement(),
  video_id: varchar({ length: 100 }).notNull().unique(), // YouTube video ID
  title: varchar({ length: 255 }).notNull(),
  description: text(),
  thumbnail: varchar({ length: 500 }),
  duration: varchar({ length: 20 }),
  playlist: varchar({ length: 100 }), // playlist category
  order_index: int().default(0),
});

export const userVideoProgress = mysqlTable("user_video_progress", {
  id: int().primaryKey().autoincrement(),
  user_id: int("user_id").references(() => usersTable.id).notNull(),
  video_id: int("video_id").references(() => youtubeVideos.id).notNull(),
  completed: boolean().default(false),
  completed_at: timestamp("completed_at"),
});
```

### Pages & Routes

```
(roadmap)/
  page.tsx                    - List all roadmaps (Frontend, Backend, etc.)
  [roadmapId]/
    page.tsx                  - Interactive tree/graph of skill nodes
    video/
      [videoId]/
        page.tsx              - Watch YouTube video + mark complete
```

### Components

| Component | Description |
|---|---|
| `RoadmapCard.tsx` | Card for a roadmap (e.g., "Frontend Roadmap") |
| `SkillNode.tsx` | Individual skill node in the roadmap tree |
| `SkillTree.tsx` | Interactive tree/graph visualization |
| `VideoPlayer.tsx` | YouTube IFrame player with completion toggle |
| `VideoGrid.tsx` | Grid of video cards from YouTube |
| `ProgressBadge.tsx` | Shows completion status for a node/video |

### Key Flows

#### Flow 1: Browsing Roadmaps

```
User navigates to /roadmap
  ├── Sees list of roadmaps (Frontend, Backend, DevOps, etc.)
  └── Clicks one → goes to /roadmap/[id]
      ├── Sees skill tree / node graph
      ├── Each node shows title, icon, completion status
      └── Clicks node → opens resource (video/article/course chapter)
```

#### Flow 2: YouTube Video Integration

```
Skill node with resource_type="video"
  ├── Links to youtube_videos table
  ├── Opens VideoPlayer component
  │   ├── Embedded YouTube player
  │   └── "Mark as Complete" button
  ├── Tracks in user_video_progress
  └── Shows checkmark on skill node when completed
```

#### Flow 3: Video Courses Page

```
/roadmap/videos
  ├── Shows all YouTube videos from CodeInsightsByJack channel
  ├── Grouped by playlist/category
  ├── Each video card: thumbnail, title, duration, progress
  └── Click → watch → mark complete
```

---

## Task List for Part 2

- [ ] **Step 2.1: Add DB schema** — Create tables in `config/schema.tsx`, run drizzle migration
- [ ] **Step 2.2: Create data access layer** — `lib/roadmap-data.ts` and `lib/youtube-data.ts`
- [ ] **Step 2.3: Create API routes** — Seed YouTube videos, track progress
- [ ] **Step 2.4: Build Roadmap listing page** — `/roadmap/page.tsx`
- [ ] **Step 2.5: Build Skill Tree page** — `/roadmap/[roadmapId]/page.tsx` with interactive nodes
- [ ] **Step 2.6: Build VideoPlayer component** — YouTube embed + mark complete
- [ ] **Step 2.7: Build Video Library page** — `/roadmap/videos/page.tsx` with grid
- [ ] **Step 2.8: Add sidebar nav link** — "Roadmap" in the sidebar navigation
- [ ] **Step 2.9: Seed initial data** — Roadmaps, skill nodes, YouTube videos from channel

---

## Global Constraints

- **Junior-level focus** for mock interview templates (topics like HTML/CSS, JS basics, React fundamentals, basic algorithms, Git basics)
- **Weekly limit of 1** completed interview per user (configurable)
- **All images/videos** from YouTube CDN — no file uploads
- **Dark theme** by default (already configured)
- **Use existing shadcn/ui components** (Button, Card, Badge, Progress, Dialog)
- **sonner** for toasts and notifications (already installed)
- **Responsive design** (mobile-first)
- **SSR-friendly** — server components where possible, client components for interactive parts
- **AI voice** uses Web Speech API (browser-native TTS) initially; can upgrade to ElevenLabs later
- **Code editor** should use a lightweight solution — CodeMirror 6 (already compatible) or a simple textarea with syntax highlighting
- **Test validation** runs against pre-defined test cases server-side via API route
