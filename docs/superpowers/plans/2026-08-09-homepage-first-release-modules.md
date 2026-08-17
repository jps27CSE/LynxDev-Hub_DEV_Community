# Homepage First-Release Modules Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage features grid cards with the 4 first-release modules (Courses, Code Editor, DSA Problems, Interview Prep) and rename the section kicker to `// first release`.

**Architecture:** Pure static content change in a single Server Component (`app/_components/Features.tsx`). No data fetching, no API routes, no dependency changes. The existing 4-column neon card grid and chip-generation logic are untouched — only the `features` array entries and the kicker label change.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, lucide-react icons. No test framework exists in this project — verification is `npm run typecheck` + `npm run build` + manual check in `npm run dev` (per `.agent/ENGINEERING.md`).

## Global Constraints

- Only `app/_components/Features.tsx` may change — Hero, YoutubeCarousel, CoursePreview, Footer are out of scope
- Cards stay static: no `<Link>`, no stats row
- Exact accent values from the spec (commit `74a63f7`): cyan `text-cyan-400` / `bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]` / `text-cyan-400/80`; blue `text-blue-400` / `bg-blue-400/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]` / `text-blue-400/80`; amber `text-amber-400` / `bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.2)]` / `text-amber-400/80`; lime unchanged
- Icons from `lucide-react` only; remove `Bot` and `Users` imports (no unused imports)
- Dark mode is default (`className="dark"`) — neon styles already fit, no change needed
- No new dependencies, no DB reads, no `"use client"` additions

---

### Task 1: Replace features array with first-release modules

**Files:**
- Modify: `app/_components/Features.tsx:1` (imports) and `app/_components/Features.tsx:12-49` (features array)

**Interfaces:**
- Consumes: nothing (standalone static data change)
- Produces: `features` array of 4 entries (title/description/icon/accent/glow/chip) consumed by the existing grid map at `app/_components/Features.tsx:74-97`; Task 2 reads the same file

- [ ] **Step 1: Update the lucide-react import**

Replace line 1 (currently `import { BookOpen, Bot, Target, Users, type LucideIcon } from "lucide-react";`) with:

```tsx
import {
  BookOpen,
  BrainCircuit,
  Code2,
  Target,
  type LucideIcon,
} from "lucide-react";
```

- [ ] **Step 2: Replace the features array**

Replace the entire `features` array (lines 12-49) with:

```tsx
const features: Feature[] = [
  {
    title: "Interactive Courses",
    description:
      "Hands-on courses with real exercises and an embedded editor per chapter — structured learning, not just videos.",
    icon: BookOpen,
    accent: "text-cyan-400",
    glow: "bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]",
    chip: "text-cyan-400/80",
  },
  {
    title: "Code Editor",
    description:
      "A dedicated browser workspace — write and run JavaScript instantly, save your code as a file, and import it back.",
    icon: Code2,
    accent: "text-blue-400",
    glow: "bg-blue-400/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]",
    chip: "text-blue-400/80",
  },
  {
    title: "DSA Problems",
    description:
      "Practice 183 top LeetCode classics plus 36 beginner drills — statement and editor side by side, mark solved as you go.",
    icon: BrainCircuit,
    accent: "text-amber-400",
    glow: "bg-amber-400/10 shadow-[0_0_20px_rgba(251,191,36,0.2)]",
    chip: "text-amber-400/80",
  },
  {
    title: "Interview Prep",
    description:
      "Practice with 900+ categorized questions, tag-based customization, and AI-generated question sets.",
    icon: Target,
    accent: "text-lime-400",
    glow: "bg-lime-400/10 shadow-[0_0_20px_rgba(163,230,53,0.2)]",
    chip: "text-lime-400/80",
  },
];
```

The `Feature` type at lines 3-10 and the grid markup at lines 68-102 are untouched.

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: PASS — no errors, no unused-import errors (`noUnusedLocals` is on; `Bot`/`Users` must be gone)

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: PASS — homepage compiles, `Features` is server-rendered static content

- [ ] **Step 5: Commit**

```bash
git add app/_components/Features.tsx
git commit -m "feat(home): showcase first-release modules in features grid"
```

---

### Task 2: Rename section kicker to `// first release`

**Files:**
- Modify: `app/_components/Features.tsx:55` (kicker chip text)

**Interfaces:**
- Consumes: features grid from Task 1
- Produces: nothing — final visual polish

- [ ] **Step 1: Update the kicker label**

Replace the chip label inside `SectionKicker` (currently `<span className="text-cyan-400">//</span> features`) with:

```tsx
<span className="text-cyan-400">//</span> first release
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add app/_components/Features.tsx
git commit -m "feat(home): label features section as first release"
```

---

### Task 3: Manual verification (both tasks together)

**Files:** none — browser check only

- [ ] **Step 1: Run dev server**

Run: `npm run dev` and open `http://localhost:3000` in a **signed-out** session (incognito window — signed-in users are redirected to `/dashboard` by `app/page.tsx:17-21`)

- [ ] **Step 2: Verify the grid**

Expected:
- 4 cards: Interactive Courses, Code Editor, DSA Problems, Interview Prep
- Correct icons (BookOpen cyan, Code2 blue, BrainCircuit amber, Target lime) and glow effects
- Chips render: `// interactive-courses`, `// code-editor`, `// dsa-problems`, `// interview-prep`
- Kicker reads `// first release`
- Cards are static (no hover cursor, no navigation on click)
- Section heading still reads "Everything you need to level up / From zero to job-ready — all free, all in one place."

- [ ] **Step 3: Check dark mode + responsive**

Expected: grid shows 2 columns on `sm`, 4 columns on `lg` (unchanged `grid sm:grid-cols-2 lg:grid-cols-4`); dark mode is default and all accent colors legible

- [ ] **Step 4: Confirm untouched sections**

Expected: Hero stats/terminal, YoutubeCarousel, CoursePreview, Footer are byte-identical in appearance to before
