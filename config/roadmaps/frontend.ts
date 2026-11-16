import type { Roadmap } from "./types";

/**
 * Frontend Developer roadmap — modern (2026).
 *
 * Tree shape: root is a section header; children are topics; deeper levels are
 * sub-topics. Leaves are the completable units (progress is measured against
 * leaves).
 */
export const frontendRoadmap: Roadmap = {
  slug: "frontend",
  title: "Frontend Developer",
  description:
    "Step-by-step guide to becoming a modern frontend developer in 2026 — from semantic HTML and CSS to production-grade React/TypeScript apps, testing, and deployment.",
  category: "frontend",
  level: "beginner",
  updatedAt: "2026-10-15",
  estimatedHours: 140,
  tags: ["html", "css", "javascript", "typescript", "react", "accessibility", "performance"],
  root: {
    id: "fe-root",
    title: "Frontend Fundamentals",
    description:
      "The foundations every frontend developer needs before touching a framework.",
    level: "beginner",
    resources: [
      {
        type: "docs",
        title: "MDN Web Docs",
        url: "https://developer.mozilla.org/",
        note: "The canonical reference for the web platform.",
      },
    ],
    children: [
      {
        id: "html",
        title: "HTML",
        description: "Structure and semantics of web pages.",
        level: "beginner",
        platformCourseTitle: "HTML",
        resources: [
          { type: "docs", title: "MDN: HTML", url: "https://developer.mozilla.org/en-US/docs/Web/HTML" },
          { type: "article", title: "web.dev: Learn HTML", url: "https://web.dev/learn/html" },
        ],
        children: [
          {
            id: "semantic-html",
            title: "Semantic HTML",
            description: "Use the right element for the right meaning (article, nav, main, …).",
            level: "beginner",
            resources: [{ type: "docs", title: "MDN: Semantics", url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics" }],
          },
          {
            id: "forms",
            title: "Forms & Validation",
            description: "Inputs, labels, constraint validation, and accessible error states.",
            level: "beginner",
            resources: [{ type: "docs", title: "MDN: Forms", url: "https://developer.mozilla.org/en-US/docs/Learn/Forms" }],
          },
          {
            id: "a11y",
            title: "Accessibility (a11y)",
            description: "Keyboard navigation, ARIA, screen readers, color contrast.",
            level: "intermediate",
            resources: [
              { type: "docs", title: "MDN: Accessibility", url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility" },
              { type: "article", title: "web.dev: Learn Accessibility", url: "https://web.dev/learn/accessibility" },
            ],
          },
        ],
      },
      {
        id: "css",
        title: "CSS",
        description: "Styling, layout, and responsive design.",
        level: "beginner",
        platformCourseTitle: "CSS",
        resources: [
          { type: "docs", title: "MDN: CSS", url: "https://developer.mozilla.org/en-US/docs/Web/CSS" },
          { type: "article", title: "web.dev: Learn CSS", url: "https://web.dev/learn/css" },
        ],
        children: [
          {
            id: "css-layout",
            title: "Box Model, Flexbox & Grid",
            description: "The three layout primitives. Master all three.",
            level: "beginner",
            resources: [{ type: "article", title: "CSS Tricks: Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/" }],
          },
          {
            id: "responsive",
            title: "Responsive Design",
            description: "Media queries, fluid typography, container queries.",
            level: "beginner",
            resources: [{ type: "article", title: "web.dev: Responsive design", url: "https://web.dev/learn/design" }],
          },
          {
            id: "css-vars",
            title: "CSS Variables & Theming",
            description: "Custom properties for theming and dark mode.",
            level: "intermediate",
            resources: [{ type: "docs", title: "MDN: CSS variables", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties" }],
          },
          {
            id: "animations",
            title: "Animations & Transitions",
            description: "CSS transitions, keyframes, and the Web Animations API.",
            level: "intermediate",
            optional: true,
            resources: [{ type: "docs", title: "MDN: Animations", url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations" }],
          },
        ],
      },
      {
        id: "javascript",
        title: "JavaScript",
        description: "The language of the web.",
        level: "beginner",
        platformCourseTitle: "JavaScript",
        resources: [
          { type: "docs", title: "MDN: JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript" },
          { type: "article", title: "javascript.info", url: "https://javascript.info/" },
        ],
        children: [
          {
            id: "es6",
            title: "ES6+ & Modules",
            description: "let/const, arrow functions, destructuring, modules, classes.",
            level: "beginner",
            resources: [{ type: "article", title: "ES6 features", url: "https://github.com/lukehoban/es6features" }],
          },
          {
            id: "dom",
            title: "DOM & Events",
            description: "Querying, mutating, and listening to the DOM.",
            level: "beginner",
            resources: [{ type: "docs", title: "MDN: DOM", url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model" }],
          },
          {
            id: "async-js",
            title: "Async JavaScript",
            description: "Promises, fetch, async/await, error handling.",
            level: "intermediate",
            resources: [{ type: "article", title: "MDN: Async", url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous" }],
          },
          {
            id: "typescript",
            title: "TypeScript",
            description: "Typed JavaScript for safer, larger codebases.",
            level: "intermediate",
            platformCourseTitle: "TypeScript",
            optional: true,
            resources: [
              { type: "docs", title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
              { type: "article", title: "Total TypeScript (free tips)", url: "https://www.totaltypescript.com/" },
            ],
          },
        ],
      },
      {
        id: "tooling",
        title: "Tooling & Workflow",
        description: "Version control, bundlers, and code quality.",
        level: "beginner",
        resources: [],
        children: [
          {
            id: "git",
            title: "Git & GitHub",
            description: "Version control, branching, PRs, collaboration.",
            level: "beginner",
            platformCourseTitle: "Git",
            resources: [{ type: "article", title: "Pro Git book", url: "https://git-scm.com/book/en/v2" }],
          },
          {
            id: "bundler",
            title: "Vite & Bundlers",
            description: "Dev server, HMR, production builds, tree-shaking.",
            level: "intermediate",
            resources: [{ type: "docs", title: "Vite Guide", url: "https://vitejs.dev/guide/" }],
          },
          {
            id: "lint",
            title: "Linting & Formatting",
            description: "ESLint, Prettier, and consistent code style.",
            level: "beginner",
            optional: true,
            resources: [{ type: "docs", title: "ESLint", url: "https://eslint.org/docs/latest/" }],
          },
        ],
      },
      {
        id: "react",
        title: "React",
        description: "Component-based UI library (the industry default).",
        level: "intermediate",
        platformCourseTitle: "React",
        resources: [
          { type: "docs", title: "React Docs", url: "https://react.dev/" },
        ],
        children: [
          {
            id: "react-components",
            title: "Components & Props",
            description: "Function components, props, composition.",
            level: "intermediate",
            resources: [{ type: "docs", title: "React: Describing UI", url: "https://react.dev/learn/describing-the-ui" }],
          },
          {
            id: "react-state",
            title: "State & Hooks",
            description: "useState, useEffect, useContext, custom hooks.",
            level: "intermediate",
            resources: [{ type: "docs", title: "React: State", url: "https://react.dev/learn/state-a-components-memory" }],
          },
          {
            id: "react-router",
            title: "Routing",
            description: "Client-side routing with React Router / Next.js App Router.",
            level: "intermediate",
            resources: [{ type: "docs", title: "React Router", url: "https://reactrouter.com/" }],
          },
          {
            id: "data-fetching",
            title: "Data Fetching",
            description: "React Query / SWR, caching, mutations.",
            level: "intermediate",
            resources: [{ type: "docs", title: "TanStack Query", url: "https://tanstack.com/query/latest" }],
          },
          {
            id: "styling-react",
            title: "Styling in React",
            description: "Tailwind, CSS Modules, styled-components.",
            level: "intermediate",
            optional: true,
            resources: [{ type: "docs", title: "Tailwind CSS", url: "https://tailwindcss.com/docs" }],
          },
        ],
      },
      {
        id: "testing",
        title: "Testing",
        description: "Confidence through automated tests.",
        level: "intermediate",
        resources: [],
        children: [
          {
            id: "unit-testing",
            title: "Unit & Component Tests",
            description: "Vitest / Jest + Testing Library.",
            level: "intermediate",
            resources: [{ type: "docs", title: "Vitest", url: "https://vitest.dev/" }],
          },
          {
            id: "e2e-testing",
            title: "End-to-End Tests",
            description: "Playwright for full user flows.",
            level: "advanced",
            optional: true,
            resources: [{ type: "docs", title: "Playwright", url: "https://playwright.dev/" }],
          },
        ],
      },
      {
        id: "perf-seo",
        title: "Performance & SEO",
        description: "Fast, discoverable apps.",
        level: "advanced",
        resources: [],
        children: [
          {
            id: "cwv",
            title: "Core Web Vitals",
            description: "LCP, INP, CLS — measure and improve.",
            level: "advanced",
            resources: [{ type: "article", title: "web.dev: Core Web Vitals", url: "https://web.dev/articles/vitals" }],
          },
          {
            id: "code-splitting",
            title: "Code Splitting & Lazy Loading",
            description: "Dynamic imports, route-based splitting.",
            level: "advanced",
            optional: true,
            resources: [{ type: "docs", title: "MDN: dynamic import", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import" }],
          },
        ],
      },
      {
        id: "deployment",
        title: "Deployment",
        description: "Ship to production.",
        level: "intermediate",
        resources: [],
        children: [
          {
            id: "vercel-netlify",
            title: "Vercel / Netlify",
            description: "Zero-config hosting for frontend apps.",
            level: "intermediate",
            resources: [{ type: "docs", title: "Vercel Docs", url: "https://vercel.com/docs" }],
          },
          {
            id: "cicd",
            title: "CI/CD Basics",
            description: "GitHub Actions for test + deploy pipelines.",
            level: "advanced",
            optional: true,
            resources: [{ type: "docs", title: "GitHub Actions", url: "https://docs.github.com/en/actions" }],
          },
        ],
      },
    ],
  },
};
