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
  tags: [
    "html",
    "css",
    "javascript",
    "typescript",
    "react",
    "accessibility",
    "performance",
  ],
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
      {
        type: "article",
        title: "roadmap.sh: Frontend",
        url: "https://roadmap.sh/frontend",
      },
      { type: "course", title: "web.dev: Learn", url: "https://web.dev/learn" },
    ],
    children: [
      {
        id: "html",
        title: "HTML",
        description: "Structure and semantics of web pages.",
        level: "beginner",
        platformCourseTitle: "HTML",
        resources: [
          {
            type: "docs",
            title: "MDN: HTML",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
          },
          {
            type: "article",
            title: "web.dev: Learn HTML",
            url: "https://web.dev/learn/html",
          },
          {
            type: "docs",
            title: "MDN: HTML elements reference",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element",
          },
          {
            type: "docs",
            title: "WHATWG: HTML Living Standard",
            url: "https://html.spec.whatwg.org/multipage/",
          },
        ],
        children: [
          {
            id: "semantic-html",
            title: "Semantic HTML",
            description:
              "Use the right element for the right meaning (article, nav, main, …).",
            level: "beginner",
            resources: [
              {
                type: "docs",
                title: "MDN: Semantics",
                url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics",
              },
              {
                type: "docs",
                title: "MDN: <article> element",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/article",
              },
              {
                type: "docs",
                title: "WHATWG: Sections",
                url: "https://html.spec.whatwg.org/multipage/sections.html",
              },
              {
                type: "article",
                title: "web.dev: Learn HTML — Document structure",
                url: "https://web.dev/learn/html/document-structure",
              },
            ],
          },
          {
            id: "forms",
            title: "Forms & Validation",
            description:
              "Inputs, labels, constraint validation, and accessible error states.",
            level: "beginner",
            resources: [
              {
                type: "docs",
                title: "MDN: Forms",
                url: "https://developer.mozilla.org/en-US/docs/Learn/Forms",
              },
              {
                type: "course",
                title: "web.dev: Learn Forms",
                url: "https://web.dev/learn/forms",
              },
              {
                type: "docs",
                title: "MDN: Constraint validation",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Constraint_validation",
              },
              {
                type: "docs",
                title: "MDN: <input> element",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input",
              },
            ],
          },
          {
            id: "a11y",
            title: "Accessibility (a11y)",
            description:
              "Keyboard navigation, ARIA, screen readers, color contrast.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "MDN: Accessibility",
                url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility",
              },
              {
                type: "article",
                title: "web.dev: Learn Accessibility",
                url: "https://web.dev/learn/accessibility",
              },
              {
                type: "practice",
                title: "The A11Y Project: Accessibility checklist",
                url: "https://www.a11yproject.com/checklist/",
              },
              {
                type: "docs",
                title: "WebAIM: WCAG 2 checklist",
                url: "https://webaim.org/standards/wcag/checklist",
              },
              {
                type: "docs",
                title: "MDN: ARIA basics",
                url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA",
              },
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
          {
            type: "docs",
            title: "MDN: CSS",
            url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
          },
          {
            type: "article",
            title: "web.dev: Learn CSS",
            url: "https://web.dev/learn/css",
          },
        ],
        children: [
          {
            id: "css-layout",
            title: "Box Model, Flexbox & Grid",
            description: "The three layout primitives. Master all three.",
            level: "beginner",
            resources: [
              {
                type: "article",
                title: "CSS Tricks: Flexbox",
                url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
              },
              {
                type: "docs",
                title: "MDN: CSS grid layout",
                url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout",
              },
              {
                type: "docs",
                title: "MDN: Flexbox",
                url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout",
              },
              {
                type: "article",
                title: "web.dev: Learn CSS — Layout",
                url: "https://web.dev/learn/css/layout",
              },
              {
                type: "practice",
                title: "Flexbox Froggy",
                url: "https://flexboxfroggy.com/",
              },
              {
                type: "practice",
                title: "Grid Garden",
                url: "https://cssgridgarden.com/",
              },
            ],
          },
          {
            id: "responsive",
            title: "Responsive Design",
            description: "Media queries, fluid typography, container queries.",
            level: "beginner",
            resources: [
              {
                type: "article",
                title: "web.dev: Responsive design",
                url: "https://web.dev/learn/design",
              },
              {
                type: "docs",
                title: "MDN: Using media queries",
                url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_media_queries/Using_media_queries",
              },
              {
                type: "docs",
                title: "MDN: viewport meta tag",
                url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag",
              },
            ],
          },
          {
            id: "css-vars",
            title: "CSS Variables & Theming",
            description: "Custom properties for theming and dark mode.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "MDN: CSS variables",
                url: "https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties",
              },
              {
                type: "docs",
                title: "MDN: @property",
                url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@property",
              },
              {
                type: "article",
                title: "web.dev: Learn CSS — Color (custom properties)",
                url: "https://web.dev/learn/css/color",
              },
            ],
          },
          {
            id: "animations",
            title: "Animations & Transitions",
            description:
              "CSS transitions, keyframes, and the Web Animations API.",
            level: "intermediate",
            optional: true,
            resources: [
              {
                type: "docs",
                title: "MDN: Animations",
                url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations",
              },
              {
                type: "docs",
                title: "MDN: Using CSS animations",
                url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations",
              },
              {
                type: "article",
                title: "web.dev: Learn CSS — Transitions and animations",
                url: "https://web.dev/learn/css/animations",
              },
              {
                type: "docs",
                title: "MDN: prefers-reduced-motion",
                url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion",
              },
            ],
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
          {
            type: "docs",
            title: "MDN: JavaScript",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
          },
          {
            type: "article",
            title: "javascript.info",
            url: "https://javascript.info/",
          },
          {
            type: "docs",
            title: "MDN: JavaScript Guide",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide",
          },
        ],
        children: [
          {
            id: "es6",
            title: "ES6+ & Modules",
            description:
              "let/const, arrow functions, destructuring, modules, classes.",
            level: "beginner",
            resources: [
              {
                type: "article",
                title: "ES6 features",
                url: "https://github.com/lukehoban/es6features",
              },
              {
                type: "article",
                title: "javascript.info: Modules, introduction",
                url: "https://javascript.info/modules-intro",
              },
              {
                type: "docs",
                title: "MDN: JavaScript modules",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules",
              },
              {
                type: "docs",
                title: "MDN: Destructuring assignment",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment",
              },
            ],
          },
          {
            id: "dom",
            title: "DOM & Events",
            description: "Querying, mutating, and listening to the DOM.",
            level: "beginner",
            resources: [
              {
                type: "docs",
                title: "MDN: DOM",
                url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model",
              },
              {
                type: "article",
                title: "javascript.info: Document",
                url: "https://javascript.info/document",
              },
              {
                type: "docs",
                title: "MDN: Introduction to the DOM",
                url: "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Introduction",
              },
              {
                type: "article",
                title: "javascript.info: Introduction to browser events",
                url: "https://javascript.info/introduction-browser-events",
              },
            ],
          },
          {
            id: "async-js",
            title: "Async JavaScript",
            description: "Promises, fetch, async/await, error handling.",
            level: "intermediate",
            resources: [
              {
                type: "article",
                title: "MDN: Async",
                url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous",
              },
              {
                type: "article",
                title: "javascript.info: Promises, async/await",
                url: "https://javascript.info/async",
              },
              {
                type: "docs",
                title: "MDN: Promise",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
              },
              {
                type: "article",
                title: "javascript.info: Event loop",
                url: "https://javascript.info/event-loop",
              },
              {
                type: "article",
                title: "javascript.info: Fetch",
                url: "https://javascript.info/fetch",
              },
            ],
          },
          {
            id: "typescript",
            title: "TypeScript",
            description: "Typed JavaScript for safer, larger codebases.",
            level: "intermediate",
            platformCourseTitle: "TypeScript",
            optional: true,
            resources: [
              {
                type: "docs",
                title: "TypeScript Handbook",
                url: "https://www.typescriptlang.org/docs/handbook/intro.html",
              },
              {
                type: "article",
                title: "Total TypeScript (free tips)",
                url: "https://www.totaltypescript.com/",
              },
              {
                type: "docs",
                title: "TS: Everyday Types",
                url: "https://www.typescriptlang.org/docs/handbook/2/everyday-types.html",
              },
              {
                type: "docs",
                title: "TS: Narrowing",
                url: "https://www.typescriptlang.org/docs/handbook/2/narrowing.html",
              },
              {
                type: "practice",
                title: "TypeScript Playground",
                url: "https://www.typescriptlang.org/play",
              },
            ],
          },
        ],
      },
      {
        id: "tooling",
        title: "Tooling & Workflow",
        description: "Version control, bundlers, and code quality.",
        level: "beginner",
        resources: [
          {
            type: "docs",
            title: "Pro Git (free book)",
            url: "https://git-scm.com/book/en/v2",
          },
          {
            type: "practice",
            title: "Learn Git Branching",
            url: "https://learngitbranching.js.org/",
          },
          {
            type: "docs",
            title: "Prettier: Documentation",
            url: "https://prettier.io/docs/",
          },
        ],
        children: [
          {
            id: "git",
            title: "Git & GitHub",
            description: "Version control, branching, PRs, collaboration.",
            level: "beginner",
            platformCourseTitle: "Git",
            resources: [
              {
                type: "article",
                title: "Pro Git book",
                url: "https://git-scm.com/book/en/v2",
              },
              {
                type: "docs",
                title: "Pro Git: Git Basics",
                url: "https://git-scm.com/book/en/v2/Getting-Started-What-is-Git%3F",
              },
              {
                type: "docs",
                title: "Git reference",
                url: "https://git-scm.com/docs",
              },
              {
                type: "practice",
                title: "Learn Git Branching",
                url: "https://learngitbranching.js.org/",
              },
            ],
          },
          {
            id: "bundler",
            title: "Vite & Bundlers",
            description: "Dev server, HMR, production builds, tree-shaking.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "Vite Guide",
                url: "https://vitejs.dev/guide/",
              },
              {
                type: "docs",
                title: "Vite: Getting Started",
                url: "https://vite.dev/guide/",
              },
              {
                type: "docs",
                title: "Vite: Features",
                url: "https://vite.dev/guide/features",
              },
              {
                type: "article",
                title: "Vite: Why Vite",
                url: "https://vite.dev/guide/why",
              },
            ],
          },
          {
            id: "lint",
            title: "Linting & Formatting",
            description: "ESLint, Prettier, and consistent code style.",
            level: "beginner",
            optional: true,
            resources: [
              {
                type: "docs",
                title: "ESLint",
                url: "https://eslint.org/docs/latest/",
              },
              {
                type: "docs",
                title: "ESLint: Getting Started",
                url: "https://eslint.org/docs/latest/use/getting-started",
              },
              {
                type: "docs",
                title: "Prettier: Documentation",
                url: "https://prettier.io/docs/",
              },
              {
                type: "docs",
                title: "Biome: Getting Started",
                url: "https://biomejs.dev/guides/getting-started/",
              },
            ],
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
          {
            type: "course",
            title: "React: Learn React",
            url: "https://react.dev/learn",
          },
          {
            type: "docs",
            title: "React API reference",
            url: "https://react.dev/reference/react",
          },
        ],
        children: [
          {
            id: "react-components",
            title: "Components & Props",
            description: "Function components, props, composition.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "React: Describing UI",
                url: "https://react.dev/learn/describing-the-ui",
              },
              {
                type: "article",
                title: "React: Thinking in React",
                url: "https://react.dev/learn/thinking-in-react",
              },
              {
                type: "article",
                title: "React: Passing props to a component",
                url: "https://react.dev/learn/passing-props-to-a-component",
              },
              {
                type: "article",
                title: "React: Keeping components pure",
                url: "https://react.dev/learn/keeping-components-pure",
              },
            ],
          },
          {
            id: "react-state",
            title: "State & Hooks",
            description: "useState, useEffect, useContext, custom hooks.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "React: State",
                url: "https://react.dev/learn/state-a-components-memory",
              },
              {
                type: "article",
                title: "React: Managing state",
                url: "https://react.dev/learn/managing-state",
              },
              {
                type: "docs",
                title: "React: useState",
                url: "https://react.dev/reference/react/useState",
              },
              {
                type: "article",
                title: "React: You might not need an effect",
                url: "https://react.dev/learn/you-might-not-need-an-effect",
              },
              {
                type: "article",
                title: "React: Scaling up with reducer and context",
                url: "https://react.dev/learn/scaling-up-with-reducer-and-context",
              },
            ],
          },
          {
            id: "react-router",
            title: "Routing",
            description:
              "Client-side routing with React Router / Next.js App Router.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "React Router",
                url: "https://reactrouter.com/",
              },
              {
                type: "docs",
                title: "React Router: Routing",
                url: "https://reactrouter.com/start/library/routing",
              },
              {
                type: "docs",
                title: "TanStack Router: Overview",
                url: "https://tanstack.com/router/latest/docs/framework/react/overview",
              },
              {
                type: "docs",
                title: "Next.js: App Router",
                url: "https://nextjs.org/docs/app",
              },
            ],
          },
          {
            id: "data-fetching",
            title: "Data Fetching",
            description: "React Query / SWR, caching, mutations.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "TanStack Query",
                url: "https://tanstack.com/query/latest",
              },
              {
                type: "docs",
                title: "TanStack Query: Overview",
                url: "https://tanstack.com/query/latest/docs/framework/react/overview",
              },
              {
                type: "docs",
                title: "MDN: Using Fetch",
                url: "https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch",
              },
              {
                type: "article",
                title: "React: Synchronizing with effects",
                url: "https://react.dev/learn/synchronizing-with-effects",
              },
            ],
          },
          {
            id: "styling-react",
            title: "Styling in React",
            description: "Tailwind, CSS Modules, styled-components.",
            level: "intermediate",
            optional: true,
            resources: [
              {
                type: "docs",
                title: "Tailwind CSS",
                url: "https://tailwindcss.com/docs",
              },
              {
                type: "docs",
                title: "Tailwind CSS: Styling with utility classes",
                url: "https://tailwindcss.com/docs/styling-with-utility-classes",
              },
              {
                type: "docs",
                title: "shadcn/ui: Introduction",
                url: "https://ui.shadcn.com/docs",
              },
              {
                type: "docs",
                title: "MDN: CSS modules (via Vite)",
                url: "https://vite.dev/guide/features#css-modules",
              },
            ],
          },
        ],
      },
      {
        id: "testing",
        title: "Testing",
        description: "Confidence through automated tests.",
        level: "intermediate",
        resources: [
          {
            type: "article",
            title: "Martin Fowler: The practical test pyramid",
            url: "https://martinfowler.com/articles/practical-test-pyramid.html",
          },
          {
            type: "docs",
            title: "Vitest: Getting Started",
            url: "https://vitest.dev/guide/",
          },
          {
            type: "docs",
            title: "Playwright: Introduction",
            url: "https://playwright.dev/docs/intro",
          },
        ],
        children: [
          {
            id: "unit-testing",
            title: "Unit & Component Tests",
            description: "Vitest / Jest + Testing Library.",
            level: "intermediate",
            resources: [
              { type: "docs", title: "Vitest", url: "https://vitest.dev/" },
              {
                type: "docs",
                title: "Vitest: Getting Started",
                url: "https://vitest.dev/guide/",
              },
              {
                type: "docs",
                title: "React Testing Library: Intro",
                url: "https://testing-library.com/docs/react-testing-library/intro/",
              },
              {
                type: "article",
                title: "Kent C. Dodds: Testing implementation details",
                url: "https://kentcdodds.com/blog/testing-implementation-details",
              },
            ],
          },
          {
            id: "e2e-testing",
            title: "End-to-End Tests",
            description: "Playwright for full user flows.",
            level: "advanced",
            optional: true,
            resources: [
              {
                type: "docs",
                title: "Playwright",
                url: "https://playwright.dev/",
              },
              {
                type: "docs",
                title: "Playwright: Introduction",
                url: "https://playwright.dev/docs/intro",
              },
              {
                type: "docs",
                title: "Playwright: Best practices",
                url: "https://playwright.dev/docs/best-practices",
              },
              {
                type: "article",
                title: "Playwright: Locators",
                url: "https://playwright.dev/docs/locators",
              },
            ],
          },
        ],
      },
      {
        id: "perf-seo",
        title: "Performance & SEO",
        description: "Fast, discoverable apps.",
        level: "advanced",
        resources: [
          {
            type: "course",
            title: "web.dev: Learn Performance",
            url: "https://web.dev/learn/performance",
          },
          {
            type: "docs",
            title: "web.dev: Core Web Vitals",
            url: "https://web.dev/articles/vitals",
          },
          {
            type: "practice",
            title: "PageSpeed Insights",
            url: "https://pagespeed.web.dev/",
          },
        ],
        children: [
          {
            id: "cwv",
            title: "Core Web Vitals",
            description: "LCP, INP, CLS — measure and improve.",
            level: "advanced",
            resources: [
              {
                type: "article",
                title: "web.dev: Core Web Vitals",
                url: "https://web.dev/articles/vitals",
              },
              {
                type: "docs",
                title: "MDN: Web performance",
                url: "https://developer.mozilla.org/en-US/docs/Web/Performance",
              },
              {
                type: "practice",
                title: "PageSpeed Insights",
                url: "https://pagespeed.web.dev/",
              },
              {
                type: "docs",
                title: "web.dev: Optimize Largest Contentful Paint",
                url: "https://web.dev/articles/optimize-lcp",
              },
            ],
          },
          {
            id: "code-splitting",
            title: "Code Splitting & Lazy Loading",
            description: "Dynamic imports, route-based splitting.",
            level: "advanced",
            optional: true,
            resources: [
              {
                type: "docs",
                title: "MDN: dynamic import",
                url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/import",
              },
              {
                type: "docs",
                title: "React: lazy",
                url: "https://react.dev/reference/react/lazy",
              },
              {
                type: "docs",
                title: "Next.js: Lazy loading",
                url: "https://nextjs.org/docs/app/guides/lazy-loading",
              },
            ],
          },
        ],
      },
      {
        id: "deployment",
        title: "Deployment",
        description: "Ship to production.",
        level: "intermediate",
        resources: [
          {
            type: "docs",
            title: "Vercel: Documentation",
            url: "https://vercel.com/docs",
          },
          {
            type: "docs",
            title: "Vercel: Deployments overview",
            url: "https://vercel.com/docs/deployments/overview",
          },
          {
            type: "docs",
            title: "GitHub Actions: Documentation",
            url: "https://docs.github.com/en/actions",
          },
        ],
        children: [
          {
            id: "vercel-netlify",
            title: "Vercel / Netlify",
            description: "Zero-config hosting for frontend apps.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "Vercel Docs",
                url: "https://vercel.com/docs",
              },
              {
                type: "docs",
                title: "Vercel: Deployments overview",
                url: "https://vercel.com/docs/deployments/overview",
              },
              {
                type: "docs",
                title: "Netlify: Documentation",
                url: "https://docs.netlify.com/",
              },
              {
                type: "docs",
                title: "Vercel: Environment variables",
                url: "https://vercel.com/docs/environment-variables",
              },
            ],
          },
          {
            id: "cicd",
            title: "CI/CD Basics",
            description: "GitHub Actions for test + deploy pipelines.",
            level: "advanced",
            optional: true,
            resources: [
              {
                type: "docs",
                title: "GitHub Actions",
                url: "https://docs.github.com/en/actions",
              },
              {
                type: "article",
                title: "GitHub Actions: Understanding workflows",
                url: "https://docs.github.com/en/actions/using-workflows/about-workflows",
              },
              {
                type: "docs",
                title: "GitHub Actions: Quickstart",
                url: "https://docs.github.com/en/actions/quickstart",
              },
            ],
          },
        ],
      },
    ],
  },
};
