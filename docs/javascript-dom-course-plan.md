# Plan — "JavaScript in the Browser: DOM & Events" Course

**Phase**: 1 (Foundation) — extends the existing course platform
**Status**: Planned (not started)
**Depends on**: HTML, CSS, JavaScript Fundamentals courses (already shipped)
**Owner**: config/courses/ module (data-driven, no schema changes)

---

## 1. Business problem

Learners finish the HTML, CSS, and JavaScript Fundamentals courses and can write console JS, but they have never manipulated a live page. The gap between "I can log to the console" and "I can make a button do something" is the single biggest drop-off point in frontend learning. A hands-on DOM course bridges it using the same browser-sandbox editor they already know, keeping the "learn by building" promise intact without new infrastructure.

**Target learner**: someone who completed the JS Fundamentals course (console mode) and wants to move to interactive pages.

**Acceptance criteria**:
- Course appears in `/courses` catalog with correct icon, difficulty, chapter count.
- Every chapter runs in the browser preview (live, no "Run" button needed) and shows a task + solution.
- Progress, points, and completion badges work exactly like existing courses.
- No new DB tables, routes, components, or runners are required.

---

## 2. Why this is the right next course (analysis)

### 2.1 Reuse check

| Need | Already exists? | Where |
|---|---|---|
| Course data shape | Yes | `config/courses/types.ts` (`CourseData`, `ChapterContent`) |
| Browser live preview | Yes | `LessonClient` `type: "browser"` → sandboxed iframe (`buildSandboxedSrcDoc`) |
| Monaco language | Yes | `getCourseLanguage` → default `"html"` for browser mode |
| Course icon | Yes | `CourseIcon` matches `"javascript"` / `"js"` |
| Catalog + detail + lesson pages | Yes | `app/(routes)/courses`, `app/(routes)/learn` — data-driven |
| Progress/enrollment | Yes | `lib/enroll-data.ts`, `app/api/progress` |
| Seed pipeline | Yes | `config/seed-courses.ts` → `coursesData` from `config/seed-data.ts` |

### 2.2 Runtime fit

- Content type: `"browser"` (iframe `srcDoc`, `sandbox="allow-scripts"`).
- Code is a full HTML document with inline `<script>`, exactly like `html.ts`/`css.ts`.
- No `fetch`/network needed for the DOM topics (all DOM manipulation is local). Where `fetch` is taught, it must be framed as "runs in the preview iframe against a public endpoint" or deferred to a later course — the worker shadows `fetch`, but the iframe does NOT, so browser-mode `fetch` actually works. (Note: keep examples to public, CORS-friendly endpoints.)

### 2.3 Trade-offs considered

- **Alternative A — Advanced JS (console mode)**: also easy, but the worker blocks `fetch`/`navigator`/`self`, so it can't teach the most motivating interactive topics. Deferred as course #2.
- **Alternative B — TypeScript course**: Monaco has TS highlighting, but the worker runs raw JS, so type annotations break `Run`. Rejected until a TS→JS transpiler is added.
- **Alternative C — Tailwind course**: browser-mode via CDN, but content-heavy and no dedicated language mapping (html fallback). Rejected for now; can be added later with no infra.

### 2.4 Edge cases / risks

- **Sandbox scope**: iframe has `allow-scripts` only (no `allow-same-origin`). Code cannot access parent, cookies, or storage. Lessons must not rely on `localStorage`/`sessionStorage` of the parent. (Teaching `localStorage` is fine — it operates on the iframe's opaque origin, which persists within a session but is sandboxed; acceptable for learning.)
- **Infinite loops in `<script>`**: unlike the worker, the iframe has no timeout. Lessons must avoid "run this loop" exercises; use event-driven snippets. Add a note in authoring guidelines.
- **Hydration / SSR**: course pages are server components fetching from DB; no client state beyond `LessonClient`. No mismatch risk.
- **Cache invalidation**: bump `COURSE_CACHE_VERSION` after seeding or learners see stale "no courses".

---

## 3. Architecture

### 3.1 Files to add / change

```
config/courses/dom.ts          (NEW)   — course definition (export domCourse)
config/courses/index.ts        (EDIT)  — import + append to allCourses
lib/course-data.ts             (EDIT)  — bump COURSE_CACHE_VERSION 1 → 2
```

No other files. `CourseIcon` already matches `"javascript"`/`"js"` in the title ("JavaScript in the Browser — DOM & Events" contains "javascript" → `icons.javascript`). `getCourseLanguage` defaults to `"html"` for browser mode, which is correct for full-document lessons.

### 3.2 Course metadata

```ts
export const domCourse: CourseData = {
  title: "JavaScript in the Browser — DOM & Events",
  description:
    "Make pages interactive: select elements, react to clicks, update content, and build small UIs — 10 hands-on lessons plus 4 projects, all in the live browser preview.",
  icon: "",
  difficulty: "Beginner",
  category: "Frontend",
  order_index: 4,   // after HTML(1), CSS(2), JS(3)
  chapters: [ /* ~14 chapters, see §4 */ ],
};
```

### 3.3 Chapter shape

Each chapter follows the `html.ts` pattern:

```ts
{
  title: "N. Topic",
  content: {
    type: "browser",
    instructions: `...HTML with ${codeBlock(...)} and ${externalLink(...)}...`,
    initialCode: `<!DOCTYPE html>...`,   // starter with TODO comments
    solution: `<!DOCTYPE html>...`,     // complete working version
  },
  points_reward: 10,   // 25 for project chapters
}
```

### 3.4 Authoring rules (to keep consistent with existing courses)

- Instructions are HTML strings using `codeBlock`, `externalLink`, `BOX_STYLE` from `./format`.
- Every lesson has: concept explanation → code examples → "Learn more" (MDN links) → "Your task" → starter with `<!-- ... -->` TODOs → solution.
- Starter code is intentionally incomplete but runnable (no syntax errors) so the preview never breaks.
- Solutions are complete and runnable.
- Use the cat-photo-app CDN images for any `<img>` examples (consistent with HTML/CSS courses).
- No `localStorage` of the parent; `localStorage` inside the iframe is acceptable for a "save theme" lesson.

---

## 4. Curriculum (chapter list)

**Lessons (10)** — 10 pts each
1. **What is the DOM?** — `document`, the tree, `console.log(document)`; selecting with `querySelector`/`getElementById`.
2. **Selecting Elements** — `querySelector`, `querySelectorAll`, NodeList vs Array, `getElementById/ByClassName`.
3. **Changing Content & Attributes** — `textContent` vs `innerHTML`, `setAttribute`, `classList.add/remove/toggle`, `style`.
4. **Creating & Removing Elements** — `createElement`, `append`/`appendChild`, `remove`, `insertAdjacentHTML`, fragments.
5. **Events Basics** — `addEventListener`, click/submit/input, event object, `preventDefault`.
6. **Event Delegation** — bubbling, `target` vs `currentTarget`, delegating on a list, `stopPropagation`.
7. **Forms & Validation** — reading input values, `submit` event, basic validation, showing error messages.
8. **Timers & Intervals** — `setTimeout`, `setInterval`, `clearTimeout`, a countdown/stopwatch mini-app.
9. **Browser Storage** — `localStorage`/`sessionStorage` inside the iframe, save/restore a theme or todo list.
10. **Fetching Data** — `fetch` + `async/await` against a public CORS-friendly endpoint, render a list; error/loading states.

**Projects (4)** — 25 pts each
11. **Project 1 — Counter App** — increment/decrement/reset, disable at bounds, keyboard support.
12. **Project 2 — Todo List** — add/remove/toggle, filter (all/active/done), persist to `localStorage`.
13. **Project 3 — Quiz App** — render questions, score, feedback, restart; event delegation.
14. **Project 4 — Live Search Filter** — filter a list as you type, highlight matches, empty state.

**Total**: 14 chapters, 10×10 + 4×25 = 200 pts. (Compare: HTML 24 chapters/??, CSS 24, JS 14/?? — keep comparable.)

---

## 5. Task breakdown (sequential, each independently testable)

| # | Task | Depends on | Deliverable |
|---|---|---|---|
| 1 | Create `config/courses/dom.ts` with course metadata + chapters 1–5 | — | File compiles, type-checks |
| 2 | Add chapters 6–10 | Task 1 | |
| 3 | Add project chapters 11–14 | Task 2 | |
| 4 | Register in `config/courses/index.ts` (`import { domCourse }`, append to `allCourses`) | Task 3 | Course shows in catalog |
| 5 | Bump `COURSE_CACHE_VERSION` 1 → 2 in `lib/course-data.ts` | Task 4 | |
| 6 | Seed DB: run `config/seed-courses.ts` (or reset + seed) | Task 5 | Rows in `courses`/`chapters` |
| 7 | Manual verify: catalog card icon, detail page, all 14 lessons run in preview, progress saves, dark mode, mobile | Task 6 | Verification report |

**Human verification gate**: after Task 7, hand to user for manual test + commit. No auto-commits. Reviewer runs only after user commits.

---

## 6. Self-review checklist (before signaling complete)

- [ ] No `console.log` / debug code in new files
- [ ] No unused imports
- [ ] All chapters have `type: "browser"`, valid `instructions`/`initialCode`/`solution`
- [ ] Starter code is runnable (no syntax errors) — verified by pasting into preview
- [ ] Solutions are complete and runnable
- [ ] MDN links use `externalLink`
- [ ] `order_index: 4` doesn't collide (HTML=1, CSS=2, JS=3)
- [ ] `npm run typecheck` passes
- [ ] `npm test` still passes (no DB-touching tests added)
- [ ] Dark mode + responsive layout checked on a sample lesson
- [ ] Cache version bumped

---

## 7. Out of scope (YAGNI)

- No new runner, language, or icon (all exist).
- No TypeScript transpiler (separate future course).
- No new DB columns/tables.
- No changes to `LessonClient`, `MonacoEditor`, or editor lib.
- No automated tests for course content (matches existing practice — content is seed data, not unit-tested).

---

## 8. Best learning resources (from the web)

Use these to source lesson content, examples, and best practices. Prefer MDN as the canonical reference; use javascript.info for deeper explanations; use freeCodeCamp/Odin for project ideas.

### Tier 1 — Canonical references (cite these in "Learn more")

- **MDN Web Docs — DOM scripting** (core of the course)
  - https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting
  - Covers: DOM tree, selecting/traversing, creating/removing nodes, attributes, styles, events.
- **MDN — Introduction to events**
  - https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events
  - Covers: `addEventListener`, event objects, inline handlers (and why to avoid them), `preventDefault`.
- **MDN — Event delegation / bubbling** (see "Working with events" guide)
  - https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
- **MDN — Web APIs / Document Object Model**
  - https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model
- **javascript.info — Browser: Document, Events, Interfaces** (best deep-dive)
  - https://javascript.info
  - Sections: DOM tree, Walking the DOM, Searching, Node properties, Attributes/properties, Modifying the document, Styles and classes, Element size/scrolling, Introduction to events, Bubbling and capturing, Event delegation, Browser default actions, Dispatching custom events, UI events (mouse/keyboard/pointer), Forms & controls.

### Tier 2 — Structured courses / tutorials (for curriculum pacing)

- **freeCodeCamp — "JavaScript DOM Manipulation – Full Course for Beginners"** (YouTube, ~freeCodeCamp.org)
  - https://www.youtube.com/watch?v=5fb2aPlgoys
  - Good for pacing the beginner → intermediate progression and project ideas.
- **freeCodeCamp — "The JavaScript DOM Manipulation Handbook"** (article)
  - https://www.freecodecamp.org/news/the-javascript-dom-manipulation-handbook
  - Cheat-sheet style reference for event types (mouse/keyboard/form/window) and best practices (use `textContent` over `innerHTML`, `classList`, delegation).
- **The Odin Project — "DOM Manipulation and Events"**
  - https://www.theodinproject.com/lessons/foundations-dom-manipulation-and-events
  - Best for: project-driven learning, knowledge checks, "dynamic shopping list" exercise pattern.
- **Scrimba — "Learn JavaScript"** (interactive, MDN partnership)
  - https://scrimba.com/articles/best-free-javascript-courses-and-tutorials-in-2026
  - Reference for interactive, pause-and-edit lesson style (matches our browser preview).

### Tier 3 — Best-practice articles (mine for tips & gotchas)

- **Medium — "Mastering DOM Manipulation in JavaScript: From Basics to Best Practices"**
  - Covers: avoid `innerHTML` (XSS), use `classList`, `DocumentFragment` for batch inserts, avoid layout thrashing (read/write separation), event delegation pattern.
- **Medium — "Event Delegation in JavaScript Explained"**
  - Covers: bubbling path, `event.target` vs `event.currentTarget`, `closest()`, non-bubbling events (`focus`/`blur` → use `focusin`/`focusout`).
- **CSS-Tricks — "What is the DOM?"**
  - https://css-tricks.com/dom/ (referenced by MDN ecosystem)
- **W3Schools JavaScript Event Reference** (linked from Odin Project) — quick lookup of event types.

### Lesson to resource mapping (suggested)

| Chapter | Primary source |
|---|---|
| 1. What is the DOM? | MDN DOM scripting intro + javascript.info DOM tree |
| 2. Selecting Elements | javascript.info Searching: getElement*, querySelector* |
| 3. Changing Content & Attributes | MDN DOM scripting + Medium best-practices (`textContent`, `classList`) |
| 4. Creating & Removing Elements | MDN "Doing some basic DOM manipulation" + `DocumentFragment` tip |
| 5. Events Basics | MDN Introduction to events |
| 6. Event Delegation | Medium delegation article + MDN bubbling/capturing |
| 7. Forms & Validation | javascript.info Forms, controls + MDN events |
| 8. Timers & Intervals | MDN `setTimeout`/`setInterval` (Web APIs) |
| 9. Browser Storage | MDN `localStorage`/`sessionStorage` |
| 10. Fetching Data | MDN Fetch API + async/await (javascript.info) |
| 11–14. Projects | Odin Project exercises + freeCodeCamp project patterns |

### Best practices to weave into lessons (from research)

- Prefer `textContent` over `innerHTML` (XSS safety) — teach in ch. 3.
- Use `classList` instead of mutating `style` for state changes — ch. 3.
- Batch DOM writes with `DocumentFragment` to avoid layout thrashing — ch. 4.
- Single listener + delegation instead of N listeners — ch. 6.
- Use `event.target.closest()` to identify the clicked item — ch. 6.
- `preventDefault()` for form submits; don't rely on inline handlers — ch. 5/7.
- Avoid `innerHTML` with unsanitized input — call out in ch. 10 (fetch rendering).

## 9. Notes for the implementer

- Mirror `config/courses/html.ts` for structure and tone; mirror `css.ts` for styling lessons.
- The `js.ts` course is `type: "console"` — do NOT copy its runner assumptions; this course is browser-mode.
- When in doubt about a topic's runnability, test the snippet in a scratch HTML file in the browser preview before authoring the chapter.
- Keep each chapter file size reasonable; if `dom.ts` exceeds ~3000 lines, split into `dom-lessons.ts` + `dom-projects.ts` and re-export from `dom.ts` (matches the "one concern per file, split over 300 lines" guidance — though course files are inherently large; follow existing single-file convention unless it becomes unwieldy).

---

## Today You Learned (preview)

- **Concepts**: data-driven course registration, content-type-driven runtime selection, cache versioning for seed data.
- **New terms**: `srcDoc` iframe sandbox, `COURSE_CACHE_VERSION`, `order_index`.
- **Patterns used**: config-as-data, reuse-first (no new infra), browser-mode live preview.
- **Mistakes avoided**: adding a course that can't actually Run; forgetting to bump the cache version; colliding `order_index`.
