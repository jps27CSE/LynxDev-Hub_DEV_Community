# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the LynxDev HUB landing page to a modern dev platform (freeCodeCamp/Codecademy style) with Hero, Features grid, YouTube playlist carousel, and course preview cards.

**Architecture:** Static landing page using Next.js server components. No DB reads for hero/features. YouTube playlist uses a config file. Course preview can be hardcoded or fetched via server component.

**Tech Stack:** Next.js 16 (App Router), Tailwind v4, shadcn/ui, CSS keyframes for carousel animation

## Global Constraints

- All images served from `/public/` or GitHub URLs — no file uploads
- Dark theme by default (already set in globals.css)
- Use existing shadcn/ui components (Button, Card, Badge)
- No new npm packages for animation (CSS keyframes only)
- Keep the "LynxDev HUB" brand name and logo
- Responsive design (mobile-first)

---

### Task 1: Redesign Header — Modern Nav

**Files:**
- Modify: `app/_components/Header.tsx`
- Modify: `app/page.tsx` (add Header import)

**Interfaces:**
- Consumes: Button from `@/components/ui/button`, Link from `next/link`, UserButton + useUser from `@clerk/nextjs`
- Produces: `<Header />` — clean professional nav with logo, nav links, auth buttons

- [ ] **Step 1: Rewrite Header.tsx with modern nav**

```tsx
"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserButton, useUser } from "@clerk/nextjs";

const navLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Community", href: "/community" },
  { label: "Mentor", href: "/mentor" },
  { label: "Resources", href: "/resources" },
];

function Header() {
  const { user } = useUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="LynxDev HUB" width={36} height={36} />
          <span className="text-xl font-bold font-inter">LynxDev HUB</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {!user ? (
            <Link href="/sign-in">
              <Button variant="default" size="sm">
                Sign In
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="default" size="sm">
                  Dashboard
                </Button>
              </Link>
              <UserButton />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
```

- [ ] **Step 2: Update page.tsx to use new Header**

```tsx
import Header from "@/app/_components/Header";
import Hero from "@/app/_components/Hero";
import Features from "@/app/_components/Features";
import YoutubeCarousel from "@/app/_components/YoutubeCarousel";
import CoursePreview from "@/app/_components/CoursePreview";
import Footer from "@/app/_components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <YoutubeCarousel />
        <CoursePreview />
      </main>
      <Footer />
    </div>
  );
}
```

---

### Task 2: Redesign Hero Section — Modern Dev Platform Hero

**Files:**
- Modify: `app/_components/Hero.tsx`

**Interfaces:**
- Consumes: Button from `@/components/ui/button`, Link from `next/link`
- Produces: `<Hero />` — gradient hero with tagline, subtitle, CTAs

- [ ] **Step 1: Rewrite Hero.tsx with modern design**

```tsx
import { Button } from "@/components/ui/button";
import Link from "next/link";

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/40">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center rounded-full border border-border px-4 py-1.5 text-sm font-medium text-muted-foreground mb-8">
            🚀 Your all-in-one developer platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
            Learn. Build. Grow.{" "}
            <span className="text-primary">For Free.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Interactive coding courses, AI mentorship, developer community, and
            interview prep — everything you need to level up your dev career.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-up">
              <Button size="lg" className="w-full sm:w-auto text-base px-8">
                Start Learning Free
              </Button>
            </Link>
            <Link href="/courses">
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base px-8"
              >
                Browse Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
```

---

### Task 3: Features Section — What We Offer

**Files:**
- Create: `app/_components/Features.tsx`

**Interfaces:**
- Consumes: nothing (pure static)
- Produces: `<Features />` — 4-card grid showing core platform features

- [ ] **Step 1: Create Features.tsx**

```tsx
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Interactive Courses",
    description: "Learn by doing with hands-on coding exercises, real-time feedback, and structured chapters like freeCodeCamp.",
    icon: "💻",
  },
  {
    title: "AI Developer Mentor",
    description: "Get help with debugging, coding questions, and career guidance — powered by Gemini and Groq AI.",
    icon: "🤖",
  },
  {
    title: "Developer Community",
    description: "Connect with fellow developers, share knowledge, ask questions, and grow together.",
    icon: "👥",
  },
  {
    title: "Interview Prep",
    description: "Practice with categorized questions, tag-based customization, and AI-generated question sets.",
    icon: "🎯",
  },
];

function Features() {
  return (
    <section className="py-20 sm:py-28 border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Everything You Need to{" "}
            <span className="text-primary">Level Up</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            From zero to job-ready — all free, all in one place.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card
              key={feature.title}
              className="border-border/50 hover:border-border transition-colors"
            >
              <CardHeader>
                <span className="text-3xl mb-2 block">{feature.icon}</span>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
```

---

### Task 4: YouTube Playlist Carousel — Moving Train

**Files:**
- Create: `app/_components/YoutubeCarousel.tsx`

**Interfaces:**
- Consumes: nothing (static data)
- Produces: `<YoutubeCarousel />` — auto-scrolling horizontal strip of YouTube video cards

- [ ] **Step 1: Add carousel animation to globals.css**

Add at the end of `app/globals.css`:

```css
@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll {
  animation: scroll 40s linear infinite;
}

.animate-scroll:hover {
  animation-play-state: paused;
}
```

- [ ] **Step 2: Create YoutubeCarousel.tsx**

```tsx
import Image from "next/image";
import Link from "next/link";

const videos = [
  {
    title: "Getting Started with Web Development",
    thumbnail: "https://img.youtube.com/vi/placeholder1/mqdefault.jpg",
    url: "https://youtube.com/watch?v=placeholder1",
  },
  {
    title: "React Tutorial for Beginners",
    thumbnail: "https://img.youtube.com/vi/placeholder2/mqdefault.jpg",
    url: "https://youtube.com/watch?v=placeholder2",
  },
  {
    title: "JavaScript Fundamentals",
    thumbnail: "https://img.youtube.com/vi/placeholder3/mqdefault.jpg",
    url: "https://youtube.com/watch?v=placeholder3",
  },
  {
    title: "CSS Grid & Flexbox Masterclass",
    thumbnail: "https://img.youtube.com/vi/placeholder4/mqdefault.jpg",
    url: "https://youtube.com/watch?v=placeholder4",
  },
  {
    title: "Node.js Crash Course",
    thumbnail: "https://img.youtube.com/vi/placeholder5/mqdefault.jpg",
    url: "https://youtube.com/watch?v=placeholder5",
  },
  {
    title: "Python for Beginners",
    thumbnail: "https://img.youtube.com/vi/placeholder6/mqdefault.jpg",
    url: "https://youtube.com/watch?v=placeholder6",
  },
];

function YoutubeCarousel() {
  return (
    <section className="py-20 sm:py-28 border-b border-border/40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Watch & Learn
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Curated video tutorials from our YouTube channel
          </p>
        </div>
      </div>
      <div className="relative">
        <div className="flex gap-4 animate-scroll w-max">
          {[...videos, ...videos].map((video, index) => (
            <Link
              key={index}
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 w-[280px] group"
            >
              <div className="rounded-xl overflow-hidden border border-border/50 group-hover:border-border transition-colors bg-card">
                <div className="aspect-video relative bg-muted">
                  <Image
                    src={video.thumbnail}
                    alt={video.title}
                    fill
                    className="object-cover"
                    sizes="280px"
                  />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2">
                    {video.title}
                  </h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default YoutubeCarousel;
```

---

### Task 5: Course Preview Section

**Files:**
- Create: `app/_components/CoursePreview.tsx`

**Interfaces:**
- Consumes: Badge from `@/components/ui/badge`, Button from `@/components/ui/button`
- Produces: `<CoursePreview />` — 4 course cards with icon, title, difficulty badge

- [ ] **Step 1: Create CoursePreview.tsx**

```tsx
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const courses = [
  {
    title: "HTML & CSS Fundamentals",
    description: "Build your first web pages with semantic HTML and modern CSS.",
    icon: "/html-icon.png",
    difficulty: "Beginner",
    chapters: 12,
  },
  {
    title: "JavaScript Essentials",
    description: "Master variables, functions, DOM manipulation, and ES6+ features.",
    icon: "/js-icon.png",
    difficulty: "Beginner",
    chapters: 16,
  },
  {
    title: "React Development",
    description: "Build modern UIs with components, hooks, and state management.",
    icon: "/react-icon.png",
    difficulty: "Intermediate",
    chapters: 20,
  },
  {
    title: "Node.js Backend",
    description: "Create REST APIs, handle databases, and deploy your backend.",
    icon: "/node-icon.png",
    difficulty: "Intermediate",
    chapters: 14,
  },
];

const difficultyColor = {
  Beginner: "bg-green-500/10 text-green-500 border-green-500/20" as const,
  Intermediate: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" as const,
  Advanced: "bg-red-500/10 text-red-500 border-red-500/20" as const,
};

function CoursePreview() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Start Learning Today
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Hands-on courses designed to take you from beginner to confident
            developer.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course) => (
            <div
              key={course.title}
              className="group rounded-xl border border-border/50 bg-card p-6 hover:border-border transition-all hover:shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                <span className="text-2xl">📁</span>
              </div>
              <h3 className="font-semibold mb-2">{course.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {course.description}
              </p>
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={
                    difficultyColor[
                      course.difficulty as keyof typeof difficultyColor
                    ]
                  }
                >
                  {course.difficulty}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {course.chapters} chapters
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/courses">
            <Button variant="outline" size="lg">
              View All Courses
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CoursePreview;
```

---

### Task 6: Footer Section

**Files:**
- Create: `app/_components/Footer.tsx`

**Interfaces:**
- Consumes: nothing (pure static)
- Produces: `<Footer />` — minimal footer with brand, links, social

- [ ] **Step 1: Create Footer.tsx**

```tsx
import Link from "next/link";

const footerLinks = [
  { label: "Courses", href: "/courses" },
  { label: "Community", href: "/community" },
  { label: "Mentor", href: "/mentor" },
  { label: "Resources", href: "/resources" },
];

const socialLinks = [
  { label: "YouTube", href: "https://youtube.com/@lynxdev" },
  { label: "GitHub", href: "https://github.com/lynxdev" },
  { label: "Twitter", href: "https://twitter.com/lynxdev" },
];

function Footer() {
  return (
    <footer className="border-t border-border/40 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold">LynxDev HUB</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Learn. Build. Grow. For Free.
            </p>
          </div>
          <div className="flex gap-8">
            <div>
              <h4 className="text-sm font-medium mb-3">Platform</h4>
              <ul className="space-y-2">
                {footerLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Connect</h4>
              <ul className="space-y-2">
                {socialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border/40 text-center">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} LynxDev HUB. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
```

---

### Task 7: Remove Old Hero Image + Verify Build

**Files:**
- Modify: `public/` (cleanup if needed)

- [ ] **Step 1: Run build to verify everything compiles**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 2: Run dev server and check visually**

```bash
npm run dev
```

Check: Header renders, Hero section shows, Features grid displays, YouTube carousel scrolls, Course preview cards show, Footer renders.
