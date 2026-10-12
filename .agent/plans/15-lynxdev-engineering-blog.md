# LynxDEV Engineering Blog Implementation Plan

> **For agentic workers:** Follow this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a LynxDEV Engineering Blog feature inside the app (like a real blog section) so users can read the engineering articles from the app itself, following the existing app patterns (Server Components, route groups, styling, etc.).

**Architecture:** Add a blog route under the app. Since blog is content-focused, it should be accessible from the public/home area or routes area. Looking at existing patterns - the homepage has a "What's New" page at `/whats-new` (public route). Blog could be a public route at `/blog` or under `(routes)/blog` if auth-gated. But engineering blogs are typically public. Also the sidebar is in `(routes)/_components/Sidebar.tsx` and only shows for authenticated routes.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind v4, shadcn/ui, Lucide React icons. Dark mode default.

**Global Constraints:**
- Follow existing code patterns (Server Components by default, reuse components from `components/ui/`)
- Dark mode only (app uses `dark` class)
- Don't add unnecessary dependencies
- Keep consistent styling with the existing app (neon/cyberpunk aesthetic on homepage, clean cards elsewhere)
- Blog content (markdown) can be stored as .md files and rendered with `react-markdown` + `remark-gfm` + `rehype-highlight` (already installed)

---

### Task 1: Create blog route structure and content loader

**Files to create/modify:**
- Create: `app/blog/` directory with layout.tsx and page.tsx
- Create: `app/blog/[slug]/` directory with page.tsx
- Create: `lib/blog.ts` - utilities to load blog posts from filesystem
- Create: `config/blog.ts` or use lib directly (follow existing patterns)

**Goal:** Make blog accessible at `/blog` (public route, not under (routes) group).

**Rationale:** Engineering blogs are usually public. `/whats-new` is also a top-level public route. The (routes) group is for authenticated shell (AppShell with sidebar). Public routes like `/`, `/blog`, `/whats-new` don't use AppShell.

**Implementation:**
- Create `app/blog/layout.tsx` - simple layout, maybe include Header/Footer like homepage for public viewing? Or minimal layout. Check homepage pattern - `app/page.tsx` includes Header and Footer. Also `/whats-new/page.tsx` has its own header-like back navigation.
- Create content loader in `lib/blog.ts` to read from `blog/engineering/*.md` files, parse frontmatter (title, date, author, description), and return post list and individual post content.

**Steps:**
1. Create `app/blog/page.tsx` - blog index/listing page showing all posts
2. Create `app/blog/[slug]/page.tsx` - individual blog post page with markdown rendering
3. Create `app/blog/layout.tsx` - layout for blog routes
4. Create `lib/blog.ts` - helper functions to load and parse blog posts

**Dependencies:** `gray-matter` for frontmatter parsing? Check if installed - package.json has `remark-gfm`, `react-markdown`, `rehype-highlight` but not `gray-matter`. Either add it or parse frontmatter manually (simple key-value). Blog posts we wrote don't have frontmatter yet - we should add it.

**Decision point:** Add frontmatter to existing blog posts for metadata (title, date, description, slug).

**Verification:**
- `npm run typecheck` passes
- Blog routes render without errors

---

### Task 2: Add frontmatter to existing blog posts

**Files to modify:**
- `blog/engineering/01-building-lynxdev-zero-cost-platform.md`
- `blog/index.md` (maybe keep as is or convert)

**Goal:** Add YAML frontmatter for better metadata handling.

**Add to first post:**
```markdown
---
title: "Building LynxDEV: A Zero-Cost Developer Learning Platform"
date: "2025-10-12"
author: "LynxDEV Engineering"
description: "How we built a zero-cost developer learning platform on Next.js 16, TiDB, Clerk, and Mistral running entirely on free tiers."
slug: "building-lynxdev-zero-cost-platform"
tags: ["architecture", "nextjs", "free-tier", "performance", "security"]
---
```

**Steps:**
1. Update the first blog post with frontmatter
2. Update `lib/blog.ts` to parse frontmatter

**Verification:**
- Frontmatter parsed correctly
- TypeScript types defined

---

### Task 3: Implement blog content loader

**File:** `lib/blog.ts`

**Functions needed:**
- `getAllPosts()` - returns all blog posts with metadata (sorted by date desc)
- `getPostBySlug(slug)` - returns full post content + metadata for a specific slug
- `getAllPostSlugs()` - for generateStaticParams if we want SSG

**Pattern to follow:** Similar to how course data is loaded - pure functions reading from filesystem. Use `fs/promises` and `path`.

**Implementation notes:**
- Read from `blog/engineering/*.md` 
- Parse frontmatter (if using gray-matter, add to deps; or regex parse)
- For the existing posts, derive slug from filename: `01-building-lynxdev-zero-cost-platform.md` → `building-lynxdev-zero-cost-platform` (strip leading number and .md)

**Decision:** Add `gray-matter` dependency? It's lightweight and standard. Check package.json - not present. Add it as dependency (not devDependency).

**Steps:**
1. Add `gray-matter` to dependencies
2. Implement `lib/blog.ts` with TypeScript types
3. Test with existing posts

**Verification:**
- All posts load correctly
- Slugs match expected URLs

---

### Task 4: Build blog index page

**File:** `app/blog/page.tsx`

**Goal:** Create a clean, readable blog listing page consistent with app's design.

**Design inspiration:** Look at `/whats-new/page.tsx` for styling patterns (neon accents, cards, gradients). Also can be cleaner like a typical engineering blog index.

**UI elements:**
- Header with "Engineering Blog" title and description
- Back to home link
- Post cards showing: title, date, description, tags, "Read more" link
- Clean card layout with hover effects
- Responsive grid

**Implementation:**
- Server Component (default)
- Load posts via `getAllPosts()`
- Format dates nicely
- Link to `/blog/[slug]`

**Styling:** Use existing shadcn/ui components if helpful (Card, Badge, Button). Follow dark mode, consistent with app.

**Verification:**
- Index page loads and displays all posts
- Links work correctly
- Responsive design looks good

---

### Task 5: Build individual blog post page

**File:** `app/blog/[slug]/page.tsx`

**Goal:** Render full blog post with markdown and syntax highlighting.

**Dependencies already available:** `react-markdown`, `remark-gfm`, `rehype-highlight`

**Features:**
- Render markdown content
- Syntax highlighting for code blocks (rehype-highlight already configured)
- Table of contents? Optional but nice
- "Back to blog" link
- Post metadata (title, date, author)
- Responsive layout
- Proper heading anchors

**Implementation:**
- Server Component for static generation? Or dynamic - posts are files on disk. Can use `generateStaticParams()` to pre-render at build time.
- Load post by slug via `getPostBySlug(slug)`
- If not found, call `notFound()`
- Use ReactMarkdown with remark-gfm and rehype-highlight
- Style markdown with prose classes or custom styles. Tailwind Typography plugin? Check if `@tailwindcss/typography` is installed - probably not. Can add custom styles for markdown elements to match app's dark theme.

**Alternative:** Add `@tailwindcss/typography` plugin for easier prose styling. Check devDependencies - not there. But we can write custom CSS for markdown elements. Look at how interview chapter notes render markdown - maybe there's existing styling? Let us look up markdown rendering patterns in the app.

**Steps:**
1. Check existing markdown usage - e.g., interview chapters use react-markdown
2. Create post page with proper styling
3. Add generateStaticParams for better performance
4. Add metadata generation

**Verification:**
- Posts render correctly with code blocks highlighted
- Tables, links, lists render properly
- Mobile responsive

---

### Task 6: Add blog link to navigation

**Files to modify:**
- `app/_components/Header.tsx` (public header) - add Blog link
- `app/(routes)/_components/Sidebar.tsx` (authenticated sidebar) - add Blog link
- Maybe `app/_components/Footer.tsx` - add Blog link in footer

**Goal:** Make blog discoverable from the app.

**Public header** (`app/_components/Header.tsx`): Shows on homepage and public pages. Add "Blog" link alongside other nav items.

**Sidebar** (`app/(routes)/_components/Sidebar.tsx`): Shows for authenticated users in the app shell. Add a blog nav item (maybe BookOpen icon or Newspaper icon from lucide-react).

**Footer** (`app/_components/Footer.tsx`): Good to have blog link there too.

**Steps:**
1. Add Blog link to Header (public)
2. Add Blog link to Sidebar (authenticated) 
3. Add Blog link to Footer
4. Use appropriate icons (e.g., Newspaper, BookText, FileText)

**Verification:**
- Links appear in all navigation locations
- Links navigate to /blog correctly

---

### Task 7: Add blog to What's New / mention it

**Optional but nice:** Update what's new page to mention blog? The app already has a what's new page. Not strictly necessary. But the blog is a new feature - could add a note. But maybe skip to keep scope minimal.

**Alternative:** Add blog card to homepage? The features grid shows first-release modules. Blog is more like a content/resource. Probably not needed. Navigation links are sufficient.

---

### Task 8: Test and polish

**Testing checklist:**
- [ ] All routes load without errors (`/blog`, `/blog/building-lynxdev-zero-cost-platform`)
- [ ] Markdown renders correctly (code blocks, tables, lists, links)
- [ ] Syntax highlighting works
- [ ] Responsive design on mobile
- [ ] Dark mode looks good (default)
- [ ] TypeScript compiles without errors (`npm run typecheck`)
- [ ] Build succeeds (`npm run build`)
- [ ] Navigation links work from all locations
- [ ] 404 for invalid slug works

**Polish items:**
- Add proper metadata (title, description) for SEO on blog pages using Next.js Metadata API
- Add OpenGraph tags for blog posts
- Consider adding reading time estimate
- Add share buttons? Probably not needed
- Style code blocks nicely for dark theme

**Verification:**
- `npm run typecheck` passes
- `npm run build` passes  
- Manual testing of key flows

---

## Implementation Notes

**Content location:** Keep blog content in `blog/` at repo root (as we created) and also potentially serve from app? Or just read from filesystem. Reading from filesystem in Next.js works fine for build-time/static generation. For dev and build, `fs` can read from project root.

**Path resolution:** In `lib/blog.ts`, use `path.join(process.cwd(), 'blog', 'engineering', ...)` to read files.

**Frontmatter library:** Add `gray-matter` to dependencies:
```bash
npm install gray-matter
```

**Markdown styling:** The app already has `rehype-highlight` which adds CSS classes. We need the actual CSS for syntax highlighting theme. Check if highlight.js CSS is imported anywhere. For example, interview chapters might import a theme. Let us look - interview chapters use `react-markdown` + `rehype-highlight` and might need CSS. Let us search.

**Code block styling:** Add appropriate highlight.js theme CSS. GitHub Dark theme is common for dark mode apps.

**TypeScript:** Follow strict mode, no `any`. Define proper types for Post metadata.

---

## Estimated Effort

- Task 1-3 (core infrastructure): ~1-2 hours
- Task 4-5 (UI pages): ~1-2 hours  
- Task 6 (navigation): ~15-30 min
- Task 7-8 (polish/testing): ~30-60 min

**Total:** ~3-5 hours
