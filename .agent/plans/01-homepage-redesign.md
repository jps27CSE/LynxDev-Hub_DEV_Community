# Phase 1 — Homepage Redesign

## Purpose

Redesign the landing page (app/page.tsx) to be a modern dev platform homepage that showcases what LynxDEV delivers.

## Sections

### 1. Hero
- **Tagline**: Short, punchy value prop (e.g., "Learn. Build. Grow. For Free.")
- **Subtitle**: Brief explanation of the platform
- **CTAs**: "Start Learning" → dashboard, "Browse Courses" → /courses
- **Visual**: Abstract code/macbook illustration or gradient background

### 2. Features Grid
3-4 cards showing core offerings:
- Interactive Courses (freeCodeCamp-style)
- AI Mentor
- Developer Community
- Interview Prep

Each card: icon + title + short description.

### 3. YouTube Playlist Carousel
- Auto-scrolling train animation (left to right)
- Shows your YouTube video thumbnails
- Uses YouTube playlist API or manual links
- Pause on hover
- Click opens video in new tab

### 4. Available Courses Preview
- Show 4-6 course cards (first few from DB)
- Each card: icon, title, difficulty badge
- "View All Courses" link → /courses

### 5. Footer
- Brand name + tagline
- Quick links (Courses, Community, Mentor, Resources)
- Social links (YouTube, GitHub, Twitter)

## Technical Notes

- **Rendering**: Static (no SSR needed — content rarely changes)
- **Data**: Course preview fetched via server component or hardcoded initially
- **YouTube**: Manual URL list in a config file (no API calls = no rate limits)
- **Animation**: CSS keyframes for carousel (no heavy library needed)
- **Free tier**: Zero DB reads for hero/features — pure static content
- Layout already uses dark theme in `globals.css`
