import type { Roadmap } from "./types";

/**
 * Frontend Developer roadmap.
 *
 * T1: minimal tree to wire up the module. Expanded in T2.
 */
export const frontendRoadmap: Roadmap = {
  slug: "frontend",
  title: "Frontend Developer",
  description:
    "Step-by-step guide to becoming a modern frontend developer — from HTML/CSS basics to production-grade React apps.",
  category: "frontend",
  level: "beginner",
  updatedAt: "2026-10-01",
  estimatedHours: 120,
  tags: ["html", "css", "javascript", "react", "typescript"],
  root: {
    id: "frontend-root",
    title: "Frontend Fundamentals",
    description: "The foundations every frontend developer needs.",
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
        resources: [
          {
            type: "docs",
            title: "MDN: HTML",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTML",
          },
        ],
      },
      {
        id: "css",
        title: "CSS",
        description: "Styling, layout, and responsive design.",
        level: "beginner",
        resources: [
          {
            type: "docs",
            title: "MDN: CSS",
            url: "https://developer.mozilla.org/en-US/docs/Web/CSS",
          },
        ],
      },
      {
        id: "javascript",
        title: "JavaScript",
        description: "The language of the web.",
        level: "beginner",
        resources: [
          {
            type: "docs",
            title: "MDN: JavaScript",
            url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
          },
        ],
        children: [
          {
            id: "typescript",
            title: "TypeScript",
            description: "Typed JavaScript for safer, larger codebases.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "TypeScript Handbook",
                url: "https://www.typescriptlang.org/docs/",
              },
            ],
          },
          {
            id: "react",
            title: "React",
            description: "Component-based UI library.",
            level: "intermediate",
            resources: [
              {
                type: "docs",
                title: "React Docs",
                url: "https://react.dev/",
              },
            ],
          },
        ],
      },
    ],
  },
};
