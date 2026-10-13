# Production Review — Blog Module

> **Date:** 2026-10-13 (reviewed) · 2026-10-13 (all §7 fixes applied and re-verified)
> **Scope:** Blog module — `/blog`, the five post routes, OG image routes, and their `components/blog/*` + `config/blog.ts` + `lib/blog-seo.ts` dependencies. The legacy markdown pipeline (`app/blog/[slug]/page.tsx`, `lib/blog.ts`, `blog/engineering/*.md`) was in scope when this review was written and has since been deleted — see §7 Fix 2.
> **Target:** 500 users on TiDB Cloud Starter (free) + Vercel Hobby (free).
> **Companion docs:** `docs/production-review-500-users.md` (app-wide), `docs/production-review-courses-module.md` (module review format).
>
> **Method:** measured, not estimated. Build route table, per-route byte counts against a same-shell baseline, response headers, runtime cache-write behaviour, and CPU timing of the OG renderer. Numbers below are from this machine; treat them as shape, not absolute.

---

## 0. Headline

The blog is the **cheapest module in the app**: it performs **zero TiDB queries**, is **fully prerendered**, and adds only **+36 KB JS / +1 script** over an otherwise-identical public page. It is not a scaling risk.

When first reviewed it also carried the app's only **uncached, CPU-expensive, un-rate-limited** public endpoint, plus a **legacy catch-all route that wrote a disk file for every unknown slug requested**. Both traced to the same root cause — leftovers from the markdown-to-component migration. Both are now closed (§7 Fix 1, Fix 2).

**RU consumption: ~0.** No database is touched.

> **Status 2026-10-13 — all four §7 fixes applied and verified. No 🔴 or 🟡 findings remain open in this module.**
>
> | Fix | Result |
> |---|---|
> | 1 — OG endpoint prerendered | `ƒ` → `●`; warm response **0.6 s → 14 ms**; ~24,000-request CPU exposure → **never** |
> | 2 — legacy pipeline deleted | Unbounded ISR disk writes from arbitrary slugs → **0 files** (was 1 per request) |
> | 3 — slug integrity enforced | `check:blog-toc` now asserts `SLUG` vs `config.slug` |
> | 4 — title template fixed | `"Engineering Blog \| LynxDEV \| LynxDEV"` → single suffix across all 7 routes |

---

## 1. Performance

### 🔴 Critical

None.

### 🟡 Medium

| Finding | Evidence | Impact | Fix |
|---|---|---|---|
| ~~**Per-post OG images are dynamic, uncached and un-rate-limited**~~ | ✅ **Fixed 2026-10-13** — `generateStaticParams()` added to `app/blog/[slug]/opengraph-image.tsx`. Route `ƒ` → `●`, 5 paths prerendered, warm response **0.6 s → 14 ms** (`x-nextjs-cache: HIT`), CPU now build-time only. Was the only unbounded public CPU surface in the app | ~24,000 requests to exhaust the 4 CPU-hour budget → **never** (fixed at 5 renders/build) | See §7 Fix 1 |
| **886 KB of app-shell JS on every blog page** | Measured: `/whats-new` 886.3 KB vs `/blog/<post>` 922.7 KB. The 886 KB baseline is **pre-existing** — Clerk provider + Radix + theme | Real cost is ~293 KB per pageview compressed, ≈357k pageviews before the 100 GB budget. Not blog-caused, but the blog inherits it | Reduce globally (`@clerk/nextjs` is the dominant term), not blog-locally |

### 🟢 Verified good

| Check | Result |
|---|---|
| **TiDB queries from blog** | **Zero.** No file under `app/blog/`, `components/blog/`, `lib/blog-seo.ts`, `config/blog.ts` imports `config/db`. The two grep hits in `server-client-boundary/page.tsx` are article prose and `<Code>` string literals — the I.9 trap, correctly avoided |
| **Rendering mode** | All 5 posts + index prerendered (`○`), 1 h ISR, served `x-nextjs-cache: HIT`. OG image routes also prerendered (`●`, 5 paths) |
| **HTML transfer size** | 114.7 KB raw → **23.6 KB gzipped** (20%), `Content-Encoding: gzip` confirmed |
| **Client JS footprint** | +36 KB marginal over the public baseline. `TableOfContents` is the only blog client component |
| **Layout dead bands** | None. Grid + `order-first` verified across 375→1920 px |
| **Scroll-spy cost** | One `IntersectionObserver` per page (was two) |
| **Route table** | No duplicate or dynamic `[slug]` page route remains after Fix 2 |
| **Disk writes from unknown slugs** | 0 files (was 1 per request) after Fix 2 |
| **Dependency surface** | `gray-matter` removed — the blog now pulls no markdown parser |

---

## 2. Scaling

| Sev | Finding |
|---|---|
| ~~🔴~~ ✅ | **OG render endpoint was the only unbounded CPU surface in the app.** Fixed 2026-10-13 by prerendering the 5 known slugs — the CPU cost is now paid once per build. At realistic traffic it was ~0.2 % of budget, so this was always a blast-radius problem rather than a projected one: it scaled linearly with hostile traffic while everything else scaled with genuine traffic. |
| ~~🟡~~ ✅ | ~~**Legacy `[slug]` route causes unbounded ISR cache growth.**~~ **Fixed 2026-10-13** — the route was deleted with the rest of the legacy pipeline. Each unknown slug previously wrote a new HTML file to `.next/server/app/blog/`; measured after the fix, 3 requests → **0** files. On any Node/self-hosted deploy this had been unbounded disk driven by untrusted input. |
| ~~🟡~~ ✅ | ~~**Duplicate prerendered paths.**~~ **Fixed 2026-10-13** — `/blog/[slug]` prerendered the same 2 paths the static routes produced. Both dead outputs are gone from the route table. |
| ✅ | **No rate limiting needed on blog pages** — static, zero DB. Do **not** add it; that would be a round-trip per read for no benefit. |
| ✅ | **No connection-pool pressure.** Blog never reaches the DB, so `connectionLimit: 5` is untouched by this module. |

---

## 3. Monitoring

| Sev | Finding |
|---|---|
| 🟢 | **OG render cost is now observable by construction.** With prerendering, renders happen once per build and are counted in the build log rather than in request logs. The prior gap — no way to answer "how much CPU is the blog consuming?" — is closed by removing the request-time cost entirely. |
| 🟢 | **Server-side logs lack a per-post breakdown, but analytics cover it.** The `[http]` lines carry only the path string, so post-level traffic is not answerable from Vercel logs alone. **Correction to the first draft of this review**, which claimed there was no post-level breakdown at all: `<Analytics />` and `<SpeedInsights />` are mounted in the root layout (`app/layout.tsx`) and the blog renders inside it, so per-path pageviews are already collected. Only the server-side log axis is coarse. |
| 🟢 | Vercel Analytics + Speed Insights are mounted in the root layout, so blog pages are already instrumented (injected client-side, hence absent from SSR HTML — expected, not a defect). |
| 🟢 | No error surface. The blog has no try/catch to swallow errors: `getPost()` returning `undefined` fails loudly at build time rather than degrading silently. |

---

## 4. Logging

| Sev | Finding |
|---|---|
| 🟢 | **OG render failures surface at build time, not runtime.** Since the images are prerendered, a satori failure fails `npm run build` instead of silently shipping a broken card. This also removes the pre-existing blind spot where middleware records a pass-through 200 before the handler completes. |
| 🟢 | Blog requests are logged uniformly by `proxy.ts` (`[http] GET /blog/... 200 Nms`), including signed-out visitors — verified. |
| 🟢 | No user data or PII in blog logs. The bucket-redaction pattern in `db-rate-limit.ts` does not apply here since no rate limiting runs. |

---

## 5. Security

| Sev | Finding |
|---|---|
| ~~🟡~~ ✅ | **Unbounded public CPU endpoint (also a DoS vector) — closed.** The OG route accepted arbitrary requests and spent ~0.6 s of CPU each with no limiter: the only place in the app where an unauthenticated visitor could force meaningful compute. Now prerendered at build time (5 renders), so there is no request-time compute left to abuse. |
| ✅ | **No authentication required, and none needed.** Blog pages call no `auth()` and touch no user data. `proxy.ts` allows `/blog(.*)`; `Header` reads Clerk client state and renders the signed-out variant correctly (verified: sign-in prompt, not a crash). |
| ✅ | **No secret or infrastructure leakage in published content.** Scanned all 5 posts for API keys, `DATABASE_URL`, `ADMIN_EMAILS`, quota figures — clean. The legacy markdown draft that *did* contain free-tier limits and user ceilings was sanitised and has since been **deleted entirely** with the rest of the legacy pipeline (§7 Fix 2). |
| ✅ | **JSON-LD injection is handled.** `components/blog/JsonLd.tsx` escapes `<` → `\u003c`, preventing a literal `</script>` in any value from terminating the tag early. Payload is build-time literals only — no user input. |
| ✅ | **Auth boundaries intact.** Verified after the public-route change: `/dashboard` `/courses` `/problems` `/mentor` `/profile` `/editor` `/admin` all still 307; only `/blog`, `/robots.txt`, `/sitemap.xml` are public. |
| ✅ | **No `dangerouslySetInnerHTML`** outside the guarded JSON-LD helper. |

---

## 6. Failure Recovery

| Sev | Finding |
|---|---|
| ~~🟡~~ ✅ | ~~**A missing `config/blog.ts` entry is a build crash, not a runtime error.**~~ **Now fully enforced.** Each post does `const POST = getPost(SLUG)!`, so a typo'd slug fails the build (loud). The silent case — a *valid* post that was never registered, which builds and renders while being invisible from index/sitemap/TOC — is caught by `npm run check:blog-toc`, which checks config→HTML **and** HTML→config **and** asserts `SLUG` against `config.slug`. Regression-tested against all four failure modes: broken anchor, orphan directory, config entry with no directory, slug mismatch. |
| ✅ **Accepted** | **OG images have no fallback path.** `getPost(slug)` returning `undefined` renders a bare "LynxDEV Engineering" card rather than failing. Accepted because the prerendered slugs are enumerated from the same `config/blog.ts` that lists them, so deleting a post removes its prerendered path in the same build — the fallback is only reachable for a slug that exists on disk but not in config, which `check:blog-toc` now fails the build over (§7 Fix 3). |
| 🟢 | **404 handling works.** Unknown slugs return 404 with the app not-found page, title `"LynxDEV"`. The original finding here — the not-found page inheriting the blog layout's title and producing `"Engineering Blog — LynxDEV | LynxDEV"` — became moot when the `[slug]` route was deleted, since unknown slugs no longer resolve through the blog segment. Verified across 7 blog routes. |
| 🟢 | **No stale-data risk.** Prerendered output is static; content changes require a rebuild, which is the correct semantic for engineering posts. |
| 🟢 | **No cache-invalidation complexity.** `config/blog.ts` is the single source for title/date/description/TOC/JSON-LD — there is no second place to forget to update, which is the failure mode that produced the earlier `og:title` bug. |

---

## 7. Recommended improvements

### ✅ Fix 1 — Cache and limit the OG image endpoint — APPLIED AND VERIFIED

The single highest-value change in this review. It is both a cost control and a security fix.

Because the five post slugs are **known at build time**, the fix is to make the OG route prerender them instead of generating per request:

```ts
// app/blog/[slug]/opengraph-image.tsx
export function generateStaticParams() {
  return getSortedPosts().map((post) => ({ slug: post.slug }));
}
```

**Applied 2026-10-13 and verified.** Measured before/after on `/blog/designing-scalable-architecture/opengraph-image`:

| | Before (`ƒ`) | After (`●`) |
|---|---|---|
| Route type | `ƒ /blog/[slug]/opengraph-image` | `● /blog/[slug]/opengraph-image` (5 prerendered paths) |
| Warm response | **560–870 ms** (satori re-render every origin hit) | **14 ms** (`x-nextjs-cache: HIT`) |
| CPU cost | ~0.6 CPU-s per request | build-time only |
| Budget exhausted at | ~24,000 requests | never (fixed at 5 renders) |

All 5 images verified as valid 1200×630 PNGs served `cache=HIT`. This removes the finding entirely rather than caching it. Note the CDN header still reads `max-age=0, must-revalidate` — the saving comes from prerendering, not from the cache header, so it holds regardless of CDN behaviour.

### ✅ Fix 2 — Delete the legacy markdown pipeline — APPLIED AND VERIFIED

Deleted `app/blog/[slug]/page.tsx`, `lib/blog.ts`, `blog/engineering/`, `blog/index.md`, `blog/README.md`, and the `gray-matter` dependency.

Dependency chain was contained before deleting — `lib/blog.ts` was imported by exactly one file, `gray-matter` by exactly one file, and nothing else referenced `blog/engineering/`. The `[slug]/` directory is retained: it now holds only `opengraph-image.tsx`, which legitimately needs the dynamic param.

Verified after deletion:
- Route table: the duplicate `● /blog/[slug]` entry and both dead prerendered paths are gone
- **Unbounded ISR cache writes closed** — 3 requests for unknown slugs produced **0** new files on disk (was 3)
- All 5 posts still 200; OG images still `cache=HIT`
- `gray-matter` removed from `package.json`

Note: `rm -rf .next/types` + `next typegen` is required afterwards — the generated route validator holds a reference to the deleted `page.js` and `tsc` fails until regenerated.

### ✅ Fix 3 — Collapse the triplicated slug — APPLIED AND VERIFIED

The slug exists in three places per post: directory name, `const SLUG` in the page, and `config.slug`. `check:blog-toc` now asserts `page.tsx`'s `SLUG` against `config.slug`, using the directory name as the reference the URL actually resolves to.

This matters because `getPost(SLUG)!` is a non-null assertion: a typo'd slug makes the lookup miss while the page still renders — invisible from the index, sitemap and TOC, but building successfully.

Regression-tested by injecting a typo (`server-client-boundary-TYPO`), which produced a targeted `FAIL` and exit 1.

### ✅ Fix 4 — Title template double-application — APPLIED AND VERIFIED

The original Fix 4 note assumed a 404-title problem inherited from the deleted `[slug]` route. Fixing Fix 2 made that moot — unknown slugs now fall through to the root not-found. Checking titles instead surfaced the **real** variant of the bug:

```
/blog   ->  "Engineering Blog | LynxDEV | LynxDEV"     <- doubled
```

Cause: a plain-string `metadata.title` is a *template input*, not a final value — the root layout's `template: "%s | LynxDEV"` is still appended. Individual post pages happened to render correctly only because their titles are long enough to hide it in casual reading; the index was the visible case.

Fix: `title: { absolute: ... }` in `lib/blog-seo.ts` and `app/blog/layout.tsx`, which opts out of every ancestor template. Verified across all 7 blog routes — no doubled suffix remains.

### Not recommended

- **Rate limiting blog pages** — static and DB-free; a limiter round-trip per read is pure cost.
- **Caching blog HTML further** — already prerendered at build with 1 h ISR and `s-maxage=3600, stale-while-revalidate`.
- **Moving OG generation off Vercel** — Fix 1 removes the need entirely.

---

## 8. Post-fix verification

Everything asserted in §7, re-run after all four fixes were applied together.

| Check | Command / method | Result |
|---|---|---|
| Types | `npm run typecheck` | clean (after `rm -rf .next/types && npx next typegen`) |
| Build | `npm run build` | clean; route table has no duplicate `[slug]` page |
| TOC + registration + slug | `npm run check:blog-toc` | 5/5 registered, 51/51 anchors resolve |
| Posts reachable | `GET /blog/<slug>` × 5 | all `200` |
| Titles | `<title>` × 7 blog routes | single `\| LynxDEV`, no doubling |
| SEO tags | head inspection | canonical, og:url, og:type=article, og:image, article:published_time, JSON-LD — all present |
| OG images | `GET .../opengraph-image` × 5 | all `x-nextjs-cache: HIT`, valid 1200×630 PNG |
| Sitemap | `GET /sitemap.xml` | 6 blog URLs |
| Robots | `GET /robots.txt` | `200`, readable by crawlers |
| Auth boundaries | `GET` × 7 app routes | all `307` — no route leaked public |
| ISR disk writes | 3 requests for unknown slugs | **0** new files |

### Checker regression coverage

`check:blog-toc` was tested against each failure it exists to catch, not just the passing path:

| Injected fault | Result |
|---|---|
| Broken TOC anchor id | `FAIL … no matching heading`, exit 1 |
| Post directory absent from `config` | `FAIL … absent from the index, the sitemap and the TOC`, exit 1 |
| `config` entry with no directory | `FAIL … Remove the entry or add the page`, exit 1 |
| `SLUG` typo in `page.tsx` | `FAIL … getPost() would miss and the post would render empty`, exit 1 |
| None (clean tree) | exit 0 |

---

## Bottom line

For 500 users the blog module is **not a scaling risk**: zero RU, fully static, ~23 KB gzipped per page. The work was never performance — it was removing the migration leftovers and closing one public CPU endpoint.

**All four §7 fixes are applied and verified. No 🔴 or 🟡 findings remain open in this module.**

Two items were downgraded during the post-fix pass rather than carried forward as findings:

- **OG image fallback** (was 🟡) — accepted. Prerendered slugs come from `config/blog.ts`, so the fallback is unreachable for any config/disk mismatch, and `check:blog-toc` now fails the build on exactly that state.
- **Post-level traffic visibility** (was 🟡) — the original claim was **wrong**. `<Analytics />` is mounted in the root layout and the blog renders inside it, so per-path pageviews are already collected. Only the server-side `[http]` log axis is coarse.

The one remaining observation is **886 KB of pre-existing app-shell JS** on every blog page, dominated by the Clerk provider. That is a global concern this module merely inherits — it is not blog-caused, and the marginal blog cost is +36 KB.