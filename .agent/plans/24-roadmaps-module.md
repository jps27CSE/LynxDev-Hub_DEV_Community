# Roadmaps — in-platform learning links (platform resources)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let every roadmap topic point at LynxDEV's own lessons and courses ("Learn it on LynxDEV"), replacing the dead `platformCourseTitle` card that has never rendered.

**Architecture:** Roadmap config gains a declarative `platform: RoadmapPlatformLink[]` per node — course entries carry a stable `key`, lesson/task entries carry a System Design route — and a server-side resolver turns keys into course ids from the DB at render time. The detail panel renders those links in a dedicated amber block above the external "Free resources" list. Course links degrade to hidden when the DB is unavailable; lesson links never touch the DB.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Drizzle/TiDB, `node:test` via tsx, Prettier, Tailwind v4.

**Spec:** §2 of this document (design approved in conversation, 2026-11-18).

> **Status:** In Progress — Tasks 1–4 implemented (uncommitted; pending user manual test + commit). Task 5 (final verification + docs) pending.

## Context

The Roadmaps module shipped earlier as T1–T6 on `feature/roadmaps-module` (`bc57862`, `2202620`, `7943aa8`). Content was expanded to 434 external resources in `7943aa8`. Two facts drive this plan:

1. `platformCourseTitle` exists on 14 nodes but is compared against lowercased DB titles, so `"HTML"` never matches `"Learn HTML — Build Websites From Scratch"` — the "Recommended on LynxDEV" card has **never** rendered.
2. LynxDEV already hosts 9 courses (105 chapters, `/learn/<courseId>/<chapterId>`) and 79 System Design lessons (slug-routed, `/system-design/<module>/lesson/<slug>`), none of which a roadmap links to.

## Global Constraints

- `npm test` must stay green (696 tests at plan time) and must never import `config/db` — tests run before `Build` in CI.
- TypeScript strict: no `any`, no `as` casts on Drizzle results.
- Client components may only `import type` from modules that reach `config/db` (I.9). `config/roadmaps/types.ts` must stay runtime-dependency-free.
- No DB schema change. No new dependency.
- `/roadmaps` stays statically prerendered; `/roadmaps/[slug]` stays dynamic.
- Internal links are `<Link>` with no `target="_blank"`; external links keep `target="_blank" rel="noopener noreferrer"`.
- Prettier config is enforced; run `npx prettier --write` on every touched file.
- No agent commits. Each task ends with a manual-test handoff; the user commits.

## Review Focus

- **DB unreachable** (measured today: `ETIMEDOUT`): course links must vanish, lesson links must still render, the page must not 500.
- **Unknown course key** in a roadmap (typo, renamed course): must fail `npm test`, not silently hide a link.
- **Lesson href typo**: must fail `npm test` against the System Design registry, not ship a 404.
- **Removal of `platformCourseTitle`**: no dangling reference may remain in types, configs, page, tree or panel.
- **Panel keyboard behaviour**: the new links are focusable; Tab must still cycle inside the dialog and Escape must still close it.

---

## 1. File structure

| File | Responsibility |
|---|---|
| `config/courses/types.ts` (modify) | add `CourseKey` union + required `key` on `CourseData` |
| `config/courses/{html,css,js,linux,typescript,git,react,node,sql}.ts` (modify) | one `key:` line each |
| `config/seed-courses.ts` (modify) | destructure `key` out so it is not inserted into the `courses` table |
| `config/roadmaps/types.ts` (modify) | `RoadmapPlatformLink`, `PlatformCourseRef`, node field `platform`, drop `platformCourseTitle` |
| `lib/roadmap-platform.ts` (create) | pure key→course matcher + server-only loader with fallback |
| `config/roadmaps/*.ts` (modify) | platform links per node (5 files) |
| `app/(routes)/roadmaps/[slug]/page.tsx` (modify) | resolve the course map, pass it down |
| `app/(routes)/roadmaps/_components/RoadmapTree.tsx` (modify) | stop resolving titles; pass the map |
| `app/(routes)/roadmaps/_components/RoadmapDetailPanel.tsx` (modify) | "Learn it on LynxDEV" block |
| `tests/courses-keys.test.ts` (create) | course key uniqueness gate |
| `tests/roadmaps-platform.test.ts` (create) | pure matcher tests |
| `tests/roadmaps.test.ts` (create) | content manifest gate both directions |
| `.agent/feature-tracker.md`, `.agent/plans/24-roadmaps-module.md` (modify) | status row + record |

## 2. Design

**Config shape**

```ts
export type CourseKey = "html" | "css" | "javascript" | "typescript" | "react" | "node" | "sql" | "git" | "linux";

export type RoadmapPlatformLink =
  | { kind: "course"; courseKey: CourseKey; note?: string }
  | { kind: "lesson"; title: string; href: string; note?: string }
  | { kind: "task"; title: string; href: string; note?: string };

export type PlatformCourseRef = { id: number; title: string; chapterCount: number };
```

`RoadmapNode.platform?: RoadmapPlatformLink[]`. `platformCourseTitle` is deleted — it was dead, and two sources for the same link is how it died.

**Resolution**

`buildPlatformCourseMap(configCourses, dbCourses)` is pure: match by normalised title (`trim().toLowerCase()`, collapse whitespace), fall back to `order_index`, omit anything unmatched. `getPlatformCourseMap()` calls `getAllCourses()` inside `try/catch`, logs via `createLogger("roadmap-platform")`, returns `{}` on failure. Course links hidden + lesson links visible is the DB-down state.

**Panel**

Amber block above "Free resources", hidden when no entry resolves:

```
★ Learn it on LynxDEV
  Learn HTML — Build Websites From Scratch   14 chapters  →
  Your first web page                        Lesson       →
  Chaos capstone task                        Task         →
```

Course rows show DB title and `chapter_count`; lesson/task rows show the config title and their kind. Course href `/courses/<id>`, lesson/task href straight from config.

**Course mapping editorial rule:** one course per topic, chosen so the course's own chapters cover the node's title — not "closest available". System Design lessons are cross-linked into backend/full-stack where the lesson is genuinely the better explanation (API contracts, caching, idempotency, logs).

## 3. Tasks

### Task 1: Stable course keys

**Files:**
- Modify: `config/courses/types.ts`, `config/courses/{html,css,js,linux,typescript,git,react,node,sql}.ts`, `config/seed-courses.ts`
- Test: `tests/courses-keys.test.ts`

**Interfaces:**
- Produces: `CourseKey` union; `CourseData.key: CourseKey`; `allCourses` each with a unique `key`.

- [ ] **Step 1: Write the failing test** — `tests/courses-keys.test.ts`: import `allCourses`, assert every course has a `key` drawn from the union, and that the set of keys has no duplicates and has the same size as `allCourses` (9).

- [ ] **Step 2: Run it** — `npm test` → fails with `key is undefined` / duplicate set size.

- [ ] **Step 3: Implement** — add `export type CourseKey = "html" | "css" | "javascript" | "typescript" | "react" | "node" | "sql" | "git" | "linux";` and `key: CourseKey;` to `CourseData`; add `key: "html"` etc. to the nine course files (file name → key 1:1, `js.ts` → `"javascript"`, `node.ts` → `"node"`); in `config/seed-courses.ts` change the destructure to `const { chapters: chapterData, key, ...courseFields } = courseData;` and add `void key;` so `noUnusedLocals` stays happy (the key is config-only, not a `courses` column).

- [ ] **Step 4: Run** — `npm test` → green; `npx tsc --noEmit` → clean.

### Task 2: Platform link types + resolver

**Files:**
- Modify: `config/roadmaps/types.ts`
- Create: `lib/roadmap-platform.ts`
- Test: `tests/roadmaps-platform.test.ts`

**Interfaces:**
- Consumes: `CourseKey`, `allCourses`.
- Produces:
  - `RoadmapPlatformLink`, `PlatformCourseRef` in `config/roadmaps/types.ts`; `RoadmapNode.platform?: RoadmapPlatformLink[]` (keep `platformCourseTitle` until Task 3).
  - `buildPlatformCourseMap(configCourses: ReadonlyArray<{ key: CourseKey; title: string; order_index: number }>, dbCourses: ReadonlyArray<{ id: number; title: string; order_index: number | null; chapter_count: number }>): Partial<Record<CourseKey, PlatformCourseRef>>`
  - `getPlatformCourseMap(): Promise<Partial<Record<CourseKey, PlatformCourseRef>>>`

- [ ] **Step 1: Write failing tests** — `tests/roadmaps-platform.test.ts` with these cases: exact title match returns `{id, title, chapterCount}` from the DB row; `"  learn html — build websites from scratch "` still matches; a drifted DB title falls back to `order_index`; a course present in config but absent from DB is **omitted** (DB-down case); two config courses with the same `order_index` do not throw.

- [ ] **Step 2: Run** — `npm test` → module not found.

- [ ] **Step 3: Implement** — pure matcher as specified; loader wraps `getAllCourses()` in `try/catch`, returns `{}` and logs on failure.

- [ ] **Step 4: Run** — `npm test`, `npx tsc --noEmit` → green.

### Task 3: Wire the panel (course links live)

**Files:**
- Modify: `config/roadmaps/{frontend,backend,full-stack}.ts` (replace the 8 `platformCourseTitle` entries with `platform: [{ kind: "course", courseKey }]`)
- Modify: `config/roadmaps/types.ts` (delete `platformCourseTitle`)
- Modify: `app/(routes)/roadmaps/[slug]/page.tsx`, `RoadmapTree.tsx`, `RoadmapDetailPanel.tsx`

**Interfaces:**
- Consumes: `getPlatformCourseMap`, `PlatformCourseRef`, `RoadmapPlatformLink`.
- Produces: `RoadmapTree` prop `platformCourses: Partial<Record<CourseKey, PlatformCourseRef>>`; `RoadmapDetailPanel` prop `platformCourses` (replaces `platformCourseId`).

- [ ] **Step 1: Replace the 8 config entries** — frontend (`HTML`→`html`, `CSS`→`css`, `JavaScript`→`javascript`, `TypeScript`→`typescript`, `Git`→`git`, `React`→`react`), backend (`Node.js`→`node`, `TypeScript`→`typescript`, `SQL & Databases`→`sql`), full-stack (`React`, `TypeScript`, `React`, `Node.js`, `SQL & Databases`).

- [ ] **Step 2: Page** — swap the `courseIdByTitle` block for `const platformCourses = await getPlatformCourseMap();` and pass `platformCourses`.

- [ ] **Step 3: Tree** — drop `courseIdByTitle` and `platformCourseId`; pass `platformCourses` to the panel.

- [ ] **Step 4: Panel** — render the amber block for resolved entries only; course row `Link href={`/courses/${ref.id}`}` with `ref.title` and `${ref.chapterCount} chapters`; lesson/task rows with their own hrefs and kind labels; `key` = href; block hidden when empty. Import `Sparkles`; keep the existing focus-trap query selector unchanged.

- [ ] **Step 5: Verify** — `npx tsc --noEmit`, `npm test`, `npm run build`, then `npm run dev`: `/roadmaps/frontend` → click `HTML` → amber block shows **Learn HTML — Build Websites From Scratch · 14 chapters**, Start opens `/courses/<id>`; Tab cycles inside the panel.

- [ ] **Step 6: Handoff** — stop for manual test + user commit.

### Task 4: Content pass — lessons and remaining courses

**Files:**
- Modify: `config/roadmaps/{frontend,backend,full-stack,ai-engineer,system-design}.ts`
- Test: `tests/roadmaps.test.ts`

**Interfaces:**
- Consumes: `getAllRoadmaps()`, `allCourses`, `loadAllModules()` from `config/system-design/registry`.
- Produces: `platform` links on the nodes listed below; `tests/roadmaps.test.ts` proving every link resolves.

- [ ] **Step 1: Write the manifest test first** — assert (a) every `platform` course key exists in `allCourses`; (b) **both directions**: every `CourseKey` in `allCourses` is used by at least one roadmap node; (c) every lesson href matches `/system-design/<module>/lesson/<slug>` and resolves to a real lesson whose title equals the config title; (d) every task href matches `/system-design/<module>/task`; (e) no node repeats a course key or href.

- [ ] **Step 2: Run** — `npm test` → fails on (b) `linux` and on every node still missing links.

- [ ] **Step 3: Add content** — exactly these mappings:

  **frontend** (courses): `fe-root` html · `html`/`semantic-html`/`forms`/`a11y` html · `css`/`css-layout`/`responsive`/`css-vars`/`animations` css · `javascript`/`es6`/`dom`/`async-js` javascript · `typescript` typescript · `tooling`/`git` git · `react`/`react-components`/`react-state`/`react-router`/`data-fetching`/`styling-react` react.

  **backend** (course / lessons): `be-root` node · `language`/`nodejs` node · `typescript-be` typescript · `apis` + `rest`: `api-and-contracts/the-contract-before-the-code`, `…/pagination-that-doesnt-lie`, `…/errors-and-status-codes` · `express-fastify` node · `databases`/`sql` sql · `auth`/`auth-basics`/`rbac`: `api-and-contracts/who-are-you-vs-what-may-you-do` · `caching`: `caching/why-cache`, `…/where-to-cache`, `…/cache-aside`, `…/ttl-and-eviction` · `messaging`: `idempotency/at-least-once-delivery` · `queues`: `…/at-least-once-delivery`, `…/dead-letter-queues` · `events`: `…/at-least-once-delivery`, `…/exactly-once-is-a-lie` · `security`: `api-and-contracts/who-are-you-vs-what-may-you-do` · `deployment-be` linux · `observability`: `how-systems-fail/logging-monitoring-and-traces`.

  **full-stack**: `fs-root` node · `fs-frontend` html · `fs-html-css` html + css · `fs-js-ts` javascript + typescript · `fs-react` react · `fs-backend`/`fs-framework` node · `fs-http`: `api-and-contracts/the-contract-before-the-code` · `fs-database`/`fs-sql` sql · `fs-auth`: `api-and-contracts/who-are-you-vs-what-may-you-do` · `fs-server-actions`: `api-and-contracts/idempotent-writes` · `fs-monitoring`: `how-systems-fail/logging-monitoring-and-traces`.

  **ai-engineer**: no platform links (no in-platform AI content) — block stays hidden; this is the documented expected state.

  **system-design**: `sd-requirements` 4 lessons (`functional-vs-nonfunctional`, `eliciting-requirements`, `turning-fast-into-a-number`, `what-youre-not-building`) · `sd-estimation` 4 (`powers-of-two-and-latency-numbers`, `qps-storage-bandwidth`, `littles-law`, `estimation-under-uncertainty`) · `sd-scaling` `vertical-vs-horizontal` · `sd-loadbalancer` (`load-balancing`, `autoscaling`) · `sd-stateless` (`stateless-services`, `sessions-without-sticky`) · `sd-caching` 5 (`why-cache`, `cache-aside`, `ttl-and-eviction`, `invalidation`, `cache-stampede`) · `sd-replicas` 4 (`scaling-reads-vs-writes`, `replication-lag`, `read-your-own-writes`, `when-replicas-dont-help`) · `sd-sharding` 5 (`why-partition-data`, `hash-and-range-sharding`, `hot-keys-and-skew`, `consistent-hashing`, `when-not-to-shard`) · `sd-edge` 4 (`latency-numbers`, `cache-keys-and-ttl`, `what-a-cdn-cannot-cache`, `image-and-video-delivery`) · `sd-ratelimit` 5 (`the-bot-in-your-traffic`, `algorithms`, `distributed-rate-limiting`, `429-and-retry-after`, `load-shedding`) · `sd-failures` 5 (`trace-your-own-design`, `retry-storms`, `cascades`, `blast-radius-and-bulkheads`, `logging-monitoring-and-traces`) · `sd-retries` 5 (`no-timeout-is-worse`, `retries-and-jitter`, `breakers-and-bulkheads`, `timeout-budgets`, `fallbacks-and-degradation`) · `sd-idempotency` 4 (`at-least-once-delivery`, `idempotency-keys`, `exactly-once-is-a-lie`, `dead-letter-queues`) · `sd-practice` one `task` (`/system-design/chaos-capstone/task`) + 3 lessons (`chaos-as-practice`, `surviving-everything`, `postmortems-without-blame`).

  Note the module segment and lesson slug are different strings: the href is `/system-design/<module>/lesson/<slug>`, e.g. `sd-requirements` → `/system-design/requirements/lesson/functional-vs-nonfunctional`. Titles must be copied verbatim from the registry, so run `npx tsx` against `loadAllModules()` while writing, or copy them from this plan's §4 appendix.

- [ ] **Step 4: Run** — `npm test` → green (all five assertions).

- [ ] **Step 5: Mutation-check the gate** — temporarily rename one href's slug and one course key, confirm `npm test` fails naming the offending node, restore.

- [ ] **Step 6: Handoff** — stop for manual test + user commit.

### Task 5: Docs, tracker, full verification

**Files:**
- Modify: `.agent/plans/24-roadmaps-module.md`, `.agent/feature-tracker.md`

- [ ] **Step 1: Record** — append the shipped numbers (nodes with platform links, resolved course links, lesson/task links, tests count) and any deviations.
- [ ] **Step 2: Tracker** — add a Phase 5 row `5.9 | Roadmaps module | In Progress | High |` pointing at this plan file.
- [ ] **Step 3: Verify** — `npx prettier --check` on touched files, `npx tsc --noEmit`, `npm test`, `npm run build`, dev smoke `/roadmaps`, `/roadmaps/frontend`, `/roadmaps/system-design`, `/courses/<id>`, one lesson URL.
- [ ] **Step 4: Handoff** — summary + manual test script; user commits.

---

## 4. Appendix — System Design lesson titles

Used verbatim in config; asserted by `tests/roadmaps.test.ts`.

| module | slug → title |
|---|---|
| requirements | functional-vs-nonfunctional → Functional vs non-functional · eliciting-requirements → Eliciting requirements · turning-fast-into-a-number → Turning 'fast' into a number · what-youre-not-building → What you're not building |
| back-of-the-envelope | powers-of-two-and-latency-numbers → Powers of two and latency · qps-storage-bandwidth → QPS, storage, bandwidth · littles-law → Little's Law · estimation-under-uncertainty → Estimation under uncertainty |
| load-balancers-and-stateless-services | vertical-vs-horizontal → Vertical vs horizontal · load-balancing → The balancer in the path · autoscaling → How many instances? · sessions-without-sticky → Sessions without sticky · stateless-services → What stateless actually means |
| caching | why-cache → Why cache at all · where-to-cache → Where a cache can live · cache-aside → Cache-aside · ttl-and-eviction → TTL and eviction · invalidation → Invalidation · cache-stampede → The stampede |
| read-replicas | scaling-reads-vs-writes → Reads replicate, writes do not · replication-lag → Lag is a position · read-your-own-writes → Read your own writes · when-replicas-dont-help → When replicas do not help |
| partitioning-and-sharding | why-partition-data → One machine cannot hold it · hash-and-range-sharding → Hash or range · hot-keys-and-skew → Sixteen partitions, 1.29× · consistent-hashing → The ring · when-not-to-shard → When not to shard |
| cdns-and-static-content | latency-numbers → The latency table · cache-keys-and-ttl → Cache keys and TTL · what-a-cdn-cannot-cache → The uncacheable set · image-and-video-delivery → Image and video delivery |
| rate-limiting | the-bot-in-your-traffic → Capacity is finite · algorithms → Shapes of allowance · distributed-rate-limiting → One client should not win · 429-and-retry-after → 429 and Retry-After · load-shedding → Queue depth |
| how-systems-fail | trace-your-own-design → Trace the request · retry-storms → Retries become traffic · cascades → Slow is not down · blast-radius-and-bulkheads → Failure domains · logging-monitoring-and-traces → Signals |
| timeouts-retries-circuit-breakers | no-timeout-is-worse → No bound, no limit · retries-and-jitter → Retry with intent · breakers-and-bulkheads → Breakers and bulkheads · timeout-budgets → Timeout budgets · fallbacks-and-degradation → Fallbacks |
| idempotency | at-least-once-delivery → At least once · idempotency-keys → Idempotency keys · exactly-once-is-a-lie → Exactly once, scoped · dead-letter-queues → Dead letters |
| chaos-capstone | chaos-as-practice → Chaos, deliberately · surviving-everything → Surviving the loss · postmortems-without-blame → Postmortems |
| api-and-contracts | the-contract-before-the-code → The contract before the code · pagination-that-doesnt-lie → Pagination that doesn't lie · who-are-you-vs-what-may-you-do → Who you are vs what you may do · idempotent-writes → Idempotent writes · errors-and-status-codes → Errors and status codes |

---

## 5. Shipped record — Tasks 1–4 (2026-11-18)

- Tests: 696 → **717** (3 `courses-keys` + 12 `roadmaps-platform` + 6 `roadmaps`).
- `npm test` green, `npx tsc --noEmit` clean, `npm run build` OK (`/roadmaps` static, `/roadmaps/[slug]` dynamic).
- Platform links: **118** total — 40 course, 77 lesson, 1 task.
  - frontend 22 (html ×4, css ×5, javascript ×4, typescript ×1, git ×2, react ×6)
  - backend 40 (node ×4, typescript ×1, sql ×2, linux ×1, 20 lessons, plus authz/caching/messaging links)
  - full-stack 15 (react ×3, html ×2, css ×1, javascript ×1, typescript ×1, node ×2, sql ×2, 4 lessons)
  - system-design 54 (53 lessons + 1 task)
- `tests/roadmaps.test.ts` is the both-directions gate: every key resolves, every shipped
  course is linked, every lesson href names a real lesson with a matching title, every
  task href names a `sim` module, no duplicate key/href within a node, no empty arrays.
- Live DB resolution (Task 3) unchanged: 9/9 keys → ids 150010–150018 with chapter counts.
- Browser-verified (dev, with `/roadmaps` and `/system-design` temporarily un-gated and
  restored byte-identically, sha256 `01efcb08…`): amber block renders course rows (14 chapters,
  `/courses/150010`), lesson rows (`/system-design/caching/lesson/why-cache`, no `target`),
  task row (`/system-design/chaos-capstone/task`); AI Engineer nodes render no block;
  Tab never escapes the dialog; Escape closes and clears `?node=`.
- Deviations from the plan:
  - `RoadmapResource.platformCourseId` deleted (dead field, same defect class as
    `platformCourseTitle`).
  - `resolvePlatformEntries` moved into `config/roadmaps/platform.ts` (rather than the
    panel) so the DB-down degradation policy is a unit-tested pure function.
  - `fe-root`, `be-root`, `fs-root`, `sd-r-root` platform links skipped — the root node
    renders as a heading, not a clickable node, so a link there is never visible.
  - Lesson titles copied verbatim from the registry; the plan's §4 appendix was
    paraphrased for some modules and disagreed with the registry (e.g. `the-bot-in-your-traffic`
    is "The bot in your traffic", not "Capacity is finite"). The test asserts registry titles.
  - `?node=` deep-link did not open the panel on a fresh document load in dev (the effect
    runs and reports `found=true`, then `setSelectedId`, but the panel never appears). Clicking
    a node works. Cause not yet determined; out of scope for this plan — flagged as an open
    item. The effect's dependency on `searchParams` (object identity) is a candidate.
