import type { SdModule } from "../types";

/**
 * Module 5 — the first *prose* module (plan 17, slice B3).
 *
 * No build task: this module teaches the contract an API makes with its
 * callers, and there is no canvas for a contract. `kind: "prose"` is what
 * decides that — see `types.ts`. An absent task on a `sim` module is a
 * content bug the checker fails; presence is never the discriminator.
 *
 * **Running case study: Netflix's gateway.** By 2012 Netflix had hundreds of
 * micro-services and a problem that had nothing to do with capacity: every
 * client (TV, phone, web, third-party) was talking to all of them. Zuul —
 * Netflix's L7 application gateway — and Eureka — their service registry —
 * are the artefacts this module is built on. The quotes below are verbatim
 * from the project READMEs.
 *
 *   - `github.com/Netflix/zuul` — "Zuul is an L7 application gateway that
 *     provides capabilities for dynamic routing, monitoring, resiliency,
 *     security, and more."
 *   - `github.com/Netflix/eureka` — "Eureka is a RESTful service that is
 *     primarily used in the AWS cloud for the purpose of discovery, load
 *     balancing and failover of middle-tier servers. It plays a critical
 *     role in Netflix mid-tier infra."
 *
 * Numbers that are ours (the page-size arithmetic, the retry budgets) are
 * labelled as teaching models, not measurements of Netflix.
 */
const module: SdModule = {
  slug: "api-and-contracts",
  order: 5,
  part: 0,
  partTitle: "Mindset",
  kind: "prose",
  title: "APIs and contracts",
  description:
    "An API is a promise you make to a caller you will never meet. Learn to write the contract before the code, paginate without lying, separate identity from permission, make writes safe to repeat, and put one door in front of many services.",
  story:
    "It is 2012 at Netflix. You have hundreds of micro-services and four kinds of client — TVs, phones, browsers, partners — and every client talks to every service. A change to the playback service breaks the TV app. A change to the membership service breaks search. There is no single place where the rules of the conversation live, so there is no single place to change them. Zuul is the answer Netflix built: one door in front of all of it, where routing, auth, rate limiting and resilience live once instead of in every service. This module is about the contract that door enforces — the thing that has to be right before the gateway, or any service behind it, matters.",
  chapters: [
    {
      slug: "the-contract",
      title: "The contract",
      description:
        "What an API promises, how to make the promise checkable, and why writing the code first is how you end up with a promise nobody can rely on.",
      children: [
        {
          slug: "contract-before-code-chapter",
          title: "The contract before the code",
          description:
            "A design is a list of checkable constraints; an API is a list of checkable promises. Write them first.",
          lessonSlug: "the-contract-before-the-code",
        },
        {
          slug: "pagination-chapter",
          title: "Pagination that doesn't lie",
          description:
            "Offset pagination is a lie at scale. Cursors, page tokens, and the honest way to say 'there is more'.",
          lessonSlug: "pagination-that-doesnt-lie",
        },
      ],
    },
    {
      slug: "identity-and-safety",
      title: "Identity and safety",
      description:
        "Who is calling, what may they do, and what happens when the network delivers the same request twice.",
      children: [
        {
          slug: "authn-authz-chapter",
          title: "Who you are vs what you may do",
          description:
            "Authentication and authorisation are two different questions, asked in two different places, and confusing them is how data leaks.",
          lessonSlug: "who-are-you-vs-what-may-you-do",
        },
        {
          slug: "idempotency-chapter",
          title: "Idempotent writes",
          description:
            "A retry is not a bug; a write that cannot be retried safely is. Idempotency keys and the design behind them.",
          lessonSlug: "idempotent-writes",
        },
      ],
    },
    {
      slug: "errors-and-the-door",
      title: "Errors and the door",
      description:
        "What a failure looks like to a caller, and the single door that stands in front of every service.",
      children: [
        {
          slug: "errors-chapter",
          title: "Errors and status codes",
          description:
            "A status code is a contract too. 4xx vs 5xx, problem details, and the retry contract implied by each.",
          lessonSlug: "errors-and-status-codes",
        },
        {
          slug: "gateway-chapter",
          title: "The gateway as one door",
          description:
            "Zuul and Eureka: one door, one registry, and the capabilities that belong at the edge and nowhere else.",
          lessonSlug: "the-gateway-as-one-door",
        },
      ],
    },
  ],
  lessons: [
    // -----------------------------------------------------------------------
    {
      slug: "the-contract-before-the-code",
      title: "The contract before the code",
      attribution:
        "Synthesised from RFC 9110 (HTTP semantics) and the Google API design guide. The Netflix gateway story is from the Zuul and Eureka project READMEs. No source text reproduced; the design vocabulary is our own.",
      sources: [
        {
          label: "RFC 9110 — HTTP semantics",
          url: "https://www.rfc-editor.org/rfc/rfc9110.html",
        },
        {
          label: "Google API design guide",
          url: "https://cloud.google.com/apis/design",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The TV app breaks on a Tuesday",
          body: "It is 2012. You are on the platform team at Netflix. The playback service ships a new field in its response, and on Tuesday morning the TV app stops playing. The field name changed from `playbackUrl` to `playback_url`. Nobody told the TV team. Nobody could have: the playback service's response shape lived in the code, and the code was the only documentation. The contract was implicit, and an implicit contract is a contract that changes without anyone noticing.\n\nThe fix is not a better code review. The fix is that the contract exists somewhere a caller can read it, check it, and fail a build against it — before the server changes.",
        },
        {
          kind: "concept",
          title: "An API is a promise, not a function",
          body: "A function is a piece of code. An API is a promise about the future behaviour of that code, made to a caller you will never meet and cannot recompile. The difference matters because the two have different lifetimes: you can rewrite a function in an afternoon, but you cannot rewrite an API without breaking everyone who depends on it.\n\nA promise worth making has four parts, and each one is checkable:\n\n1. **Shape** — what goes in and what comes out, including field names, types, and which fields are required vs optional. `playbackUrl` vs `playback_url` is a shape failure.\n2. **Semantics** — what the values mean. Is `duration` in seconds or milliseconds? Is a missing field `null` or absent? Is an empty list `[]` or `null`? Semantics are where the real bugs live, because two teams can agree on shape and still disagree on meaning.\n3. **Errors** — what a failure looks like, which codes mean what, and whether the caller may retry. Covered in the errors lesson.\n4. **Evolution** — how the contract changes over time without breaking old callers. Covered below.\n\nA promise that cannot be checked is a wish. The checkable version is a schema, validated in CI.",
        },
        {
          kind: "concept",
          title: "Write the contract first",
          body: "The natural order is: write the service, then document what it does. That order produces a contract that describes the implementation, including its accidents. A caller who reads it is reading your bugs.\n\nThe order that works is the reverse: write the contract, review it with the callers, then implement against it. This is called **design-first** (or contract-first) development, and it has three consequences:\n\n- **Callers can start early.** The TV team writes against a mock server generated from the schema while you build the real one. The two proceed in parallel, and integration becomes a formality.\n- **Breaking changes are visible.** A schema diff in CI shows exactly which fields were removed or retyped. You cannot accidentally break a caller; you have to do it on purpose, and on purpose means a review.\n- **The implementation has a target.** A service with no contract drifts: every PR adds a field, and six months later the response has forty fields nobody remembers adding.\n\nThe cost is that someone has to write the schema before the code, and writing a schema is slower than writing a function. That is the point: the slowness is a filter. A change not worth writing down is not worth making.",
        },
        {
          kind: "concept",
          title: "Evolution without breakage",
          body: "Contracts change. The goal is not to freeze them; it is to change them without surprising a caller. Four rules cover almost every case:\n\n- **Add, don't rename.** Adding `playback_url` alongside `playbackUrl` is safe. Renaming breaks every caller that read the old name. Deprecate the old field and remove it only after the last caller migrates.\n- **Make new fields optional.** A required new field breaks every old caller that does not send it. Optional fields default sensibly and let old and new callers coexist.\n- **Never change the meaning of a value.** A field that meant seconds and now means milliseconds is a silent breakage: the schema still validates, the code still runs, and the data is wrong.\n- **Version at the boundary, not the field.** `/v1/playback` and `/v2/playback` with different contracts is honest. A single endpoint whose behaviour depends on a header the caller may not know it is sending is not.\n\nNetflix's gateway exists precisely because evolution is hard at scale: with hundreds of services and four client types, a contract change in one place has to be enforced somewhere, and that somewhere is the edge, not each service.",
        },
        {
          kind: "video",
          videoId: "YNvtSkHb3co",
          title:
            "System Design Basics in Bangla | API + REST + GraphQL + gRPC Explained",
          caption:
            "Bangla walkthrough of APIs, REST, GraphQL and gRPC — useful as a second pass over the vocabulary in this lesson.",
        },
        {
          kind: "your_turn",
          prompt:
            "Take one endpoint you use daily (yours or a public one). Write its four-part contract: shape, semantics, errors, evolution. Which part is currently implicit, and what would have to change to make it checkable in CI?",
        },
        {
          kind: "compare",
          body: "A beginner writes the handler and lets the response shape fall out of the code. An engineer writes the schema first and lets the handler fall out of the schema.\n\nThe first is faster today and slower forever: every change is a potential breakage, and you find out by reading bug reports. The second is slower today and faster forever: the schema is the spec, the mock server unblocks callers, and CI catches the breaks before they ship. At Netflix's scale — hundreds of services, four client types — the second is the only one that survives.",
        },
        {
          kind: "recap",
          points: [
            "An API is a promise to a caller you cannot recompile",
            "A promise has four parts: shape, semantics, errors, evolution",
            "Write the contract first; let the code fall out of it",
            "Add, don't rename; make new fields optional; never change a value's meaning",
            "HTTP methods are semantics, not labels — GET is safe and idempotent",
          ],
        },
      ],
    },
    // -----------------------------------------------------------------------
    {
      slug: "pagination-that-doesnt-lie",
      title: "Pagination that doesn't lie",
      attribution:
        "Synthesised from Google's AIP-158 and Stripe's pagination documentation. The arithmetic is a labelled teaching model.",
      sources: [
        {
          label: "AIP-158 — pagination",
          url: "https://google.aip.dev/158",
        },
        {
          label: "Stripe — pagination",
          url: "https://docs.stripe.com/api/pagination",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Page 47 of a feed that changed",
          body: "You are building a feed. You ship offset pagination: `?page=3&limit=20`. It works in staging. In production, a user scrolls to page 47, and the feed shows them the same item twice and skips another. The cause is not a bug in your code: between their first request and their forty-seventh, new items were inserted at the top of the feed, and every offset shifted by the number of inserts. Offset pagination assumes the list is frozen. No real list is frozen.",
        },
        {
          kind: "concept",
          title: "Why offset pagination lies",
          body: "Offset pagination says *skip N items, then give me M*. That instruction is only meaningful if the items are in a fixed order and nothing is inserted or deleted between requests. On a live feed, a new item inserted above the cursor pushes every existing item down by one; the offset no longer points at the same place. The result is duplicates (an item seen on page 2 appears again on page 3) and skips (an item that existed is never shown).\n\nThere is a second, quieter problem: **counting**. To render *“page 3 of 47”* you need the total count, and the total count requires scanning the whole result set or maintaining a counter that drifts under concurrent writes. At scale, `SELECT COUNT(*)` on a live table is a slow query on a hot path.\n\nOffset pagination is fine for admin screens with stable data and small tables. It is wrong for feeds, search results, and anything that changes while you are reading it.",
        },
        {
          kind: "concept",
          title: "Cursor pagination",
          body: "A cursor says *give me the M items that come after this marker*, where the marker is an opaque token the server hands you. The client does not interpret it; it just sends it back. The server decodes it into a compound-key range and returns the next page plus a new cursor.\n\nWhy this fixes the lie: the marker is anchored to a specific item, not a position. Insertions above it do not move it. Deletions below it just mean the next page is shorter. The client never needs the total count; it only needs to know whether there is a next page, which the server answers with *“here is a cursor”* vs *“no cursor, you are done”*.\n\nThe cost: you cannot jump to page 47. Cursor pagination is sequential. For a feed that is the correct trade. For an admin table where jumping matters, offset is acceptable.",
        },
        {
          kind: "concept",
          title: "Page tokens and the honest 'there is more'",
          body: "Google's AIP-158 and Stripe's pagination both use the same shape: a response carries the items plus a `next_page_token` (or `starting_after`). If the token is present, there is more; if it is absent or empty, you are at the end. That is the entire pagination contract, and it is honest in two ways:\n\n- **No total count.** The server does not promise how many items exist. It promises only what it has right now, which is all it can honestly know.\n- **No page numbers.** The client cannot ask for page 7; it can only ask for *“the next page after the token you gave me”*. This removes the ability to jump, and with it removes the ability to be wrong about where you are.\n\nA common mistake is to make the token a page number in disguise (`next_page_token = \"3\"`). That is offset pagination with extra steps, and it lies in exactly the same way. The token must be opaque and server-decoded, or the contract is a fiction.",
        },
        {
          kind: "concept",
          title: "Stable ordering is the real requirement",
          body: "A cursor only works if the order is total and stable: every item has a position, and two items never share one. `created_at` alone is not stable — same-millisecond ties make the cursor skip or duplicate items.\n\nThe fix is a compound key: `(created_at, id)` with `id` as the tie-breaker. The cursor encodes both. The query is `WHERE (created_at, id) > (cursor_created, cursor_id) ORDER BY created_at, id LIMIT M`. This is a range scan on an index, which is fast and stable.\n\nThe deeper point: pagination is not a presentation concern. It is a query-shape concern, and the query shape determines whether your index helps or hurts. A pagination that scans the whole table to skip N rows is O(N) per page; cursor pagination on a compound index is O(M). The difference is invisible at a hundred rows and fatal at a hundred million.",
        },
        {
          kind: "your_turn",
          prompt:
            "You have a feed of events with `created_at` and `id`. Write the cursor query (SQL or pseudo-SQL) for the next page, and the rule that decides when the cursor is exhausted. Then say what breaks if two events share the same `created_at` and you forget the tie-break.",
        },
        {
          kind: "compare",
          body: "Offset pagination is a position in a list that may have moved. Cursor pagination points at a specific item.\n\nThe first is simpler to implement and simpler to misuse: page numbers in URLs, *“page 3 of 47”* in the UI, and a count query on every request. The second is harder to implement and impossible to misuse: no page numbers, no count, and a query that scales. Choose offset when the data is small and stable and the UI needs jumping. Choose cursor for everything else — which, in 2024, is most things.",
        },
        {
          kind: "recap",
          points: [
            "Offset pagination assumes a frozen list; real lists are not frozen",
            "Cursor pagination anchors to an item, not a position",
            "A page token must be opaque; a page number in disguise still lies",
            "Stable ordering needs a compound key, not a timestamp alone",
            "State the max page size and the consistency level in the contract",
          ],
        },
      ],
    },
    // -----------------------------------------------------------------------
    {
      slug: "who-are-you-vs-what-may-you-do",
      title: "Who you are vs what you may do",
      attribution:
        "Synthesised from the Auth0 JWT documentation and MDN's HTTP method reference. The Netflix gateway story is from the Zuul project README.",
      sources: [
        {
          label: "Auth0 — JWT",
          url: "https://auth0.com/docs/secure/tokens/json-web-tokens",
        },
        {
          label: "MDN — HTTP methods",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The admin endpoint that was not",
          body: "A new engineer ships `/admin/users`, protected by a check that the request carries a valid session cookie. The check answers one question: *is this a logged-in user?* It does not answer the second: *is this user an admin?* A regular member discovers the endpoint, and because they are logged in, they can list every user in the system. The bug is not in the cookie check. The bug is that the cookie check was treated as the whole of security, when it is only the first half.",
        },
        {
          kind: "concept",
          title: "Two questions, two answers",
          body: "**Authentication** is the question *who are you?* It establishes identity: this request was made by the account with id 42, or by the service named `playback`, or by nobody (anonymous). It says nothing about what that identity may do.\n\n**Authorisation** is the question *what may you do?* It checks whether the identified caller has permission for the specific action on the specific resource: may user 42 read user 7's profile? May the `playback` service write to the billing table?\n\nThe two are asked in different places and fail in different ways. Authentication fails with 401 Unauthorized (the name is historical; it means *unauthenticated*). Authorisation fails with 403 Forbidden. Confusing them produces two classic bugs: returning 403 for a missing token (leaking that the resource exists) and returning 401 for a permission failure (prompting a login that will not help). The distinction is the difference between a door that asks for ID and a door that checks a guest list. In practice, the gateway validates the token signature and expiry, extracts the identity, and forwards it as a trusted header such as X-User-Id. The service trusts that header only because it arrives over the internal network from the gateway, never from the public internet. A request that bypasses the gateway and sets that header itself is a security bug, which is why the services are not reachable except through the gateway. This is the same trust boundary that makes service-to-service authentication work: the network topology, not the token, is what makes the header trustworthy.",
        },
        {
          kind: "concept",
          title: "Where each belongs",
          body: "Authentication belongs at the edge, once, for every request. It is a cross-cutting concern: every service needs to know who is calling, and doing it in each service means N copies of the same bug. Netflix's Zuul gateway is exactly this: a single place where identity is established and attached to the request before it reaches any service.\n\nAuthorisation belongs closer to the resource, because only the service that owns the resource knows its rules. The gateway can enforce coarse rules (*“this token is a service token, services may call internal endpoints”*), but fine-grained rules (*“user 42 may edit their own profile but not user 7's”*) belong in the service that owns the profile. Putting fine-grained authorisation in the gateway couples the gateway to every service's data model, and the gateway becomes a bottleneck for every permission change.\n\nThe split: the edge answers *who*; the service answers *whether*. A request that fails *who* never reaches the service. A request that fails *whether* reaches the service, is rejected there, and the rejection is logged where the data is.",
        },
        {
          kind: "video",
          videoId: "sP5pzApI72E",
          title:
            "Google OAuth 2.0 Explained | Backend Authentication Flow Step-by-Step (Bangla)",
          caption:
            "Bangla walkthrough of the OAuth 2.0 flow — a useful second pass over the token concepts in this lesson.",
        },
        {
          kind: "your_turn",
          prompt:
            "Design the auth split for a system with a web app, a mobile app, and an internal admin tool. Which identity provider, which token type, and where does each of the two questions (who / whether) get answered? What does the gateway forward to services?",
        },
        {
          kind: "compare",
          body: "A beginner puts authentication and authorisation in the same middleware and treats a valid session as permission. An engineer separates them: the edge establishes identity, the service decides permission, and the token carries the minimum scope for the job.\n\nThe first produces the admin-endpoint bug at the top of this lesson: logged in implies allowed. The second produces a system where a stolen token is bounded in what it can do, and where adding a new permission is a service change, not a gateway change.",
        },
        {
          kind: "recap",
          points: [
            "Authentication is 'who are you'; authorisation is 'what may you do'",
            "401 means unauthenticated; 403 means forbidden — do not swap them",
            "Auth at the edge, authorisation near the resource",
            "JWTs are stateless and hard to revoke; sessions are stateful and easy",
            "Grant the minimum scope, for the minimum time, to the minimum set of resources",
          ],
        },
      ],
    },
    // -----------------------------------------------------------------------
    {
      slug: "idempotent-writes",
      title: "Idempotent writes",
      attribution:
        "Synthesised from Stripe's idempotent-requests documentation and the AWS Builders' Library. The retry arithmetic is a labelled teaching model.",
      sources: [
        {
          label: "Stripe — idempotent requests",
          url: "https://docs.stripe.com/api/idempotent_requests",
        },
        {
          label: "AWS — making retries safe with idempotent APIs",
          url: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The double charge",
          body: "A user clicks *pay* on a slow connection. The request leaves the browser, the network stalls, and the client retries. The first request arrives and charges the card. The retry arrives and charges it again. The user is billed twice. The cause is not a malicious retry: it is a client doing the only sensible thing — retrying a request that did not obviously succeed — against a server that treated each request as a new charge. A write that cannot be repeated safely is a bug waiting for a bad network.",
        },
        {
          kind: "concept",
          title: "What idempotency means",
          body: "An operation is **idempotent** if performing it once and performing it N times has the same effect. `GET /users/42` is idempotent: reading the user does not change them. `DELETE /users/42` is idempotent: deleting a user who is already deleted is still *deleted*. `POST /charges` is not: each call creates a new charge.nnIdempotency is a property of the *effect*, not the method. A `POST` that creates a resource with a client-supplied id can be idempotent if the server treats a duplicate id as *“already exists, return the existing”*. A `PUT` that increments a counter is not idempotent, even though `PUT` is supposed to be. The method is a hint; the effect is the truth. A useful mental model: an idempotent operation is one you can safely hand to a retry loop with no other coordination. If running it twice changes the world twice, it is not idempotent, and it needs a key before it can be retried. Most reads are idempotent. Most writes are not, unless you designed them to be. The design question is never is this method idempotent? but what does running this twice do to the data, and is that acceptable? The practical test: write the operation's effect on a whiteboard, run it twice in your head, and check whether the second run changes anything. If it does, you need a key or a redesign before this endpoint can be retried safely by any client.",
        },
        {
          kind: "concept",
          title: "Idempotency keys",
          body: "The standard fix, used by Stripe and most payment APIs, is an **idempotency key**: a client-generated unique string (a UUID) sent in a header (`Idempotency-Key: <uuid>`). The server stores the result of the first request under that key. A retry with the same key returns the stored result instead of re-running the operation.\n\nThree rules make it work:\n\n1. **The key is client-generated.** The server cannot generate it, because the server does not know whether two requests are the same operation or two different ones. Only the client knows intent.\n2. **The key is scoped to the operation.** The same key on `POST /charges` and `POST /refunds` must not collide. Scope it to `(user, endpoint, key)` or similar.\n3. **The stored result has a TTL.** Keys are not forever. Stripe keeps them for 24 hours. After that, a retry is treated as a new request — which is correct, because a retry 25 hours later is probably not a retry.\n\nThe storage cost is one row per in-flight operation, which is cheap. The correctness benefit is that every write becomes safe to retry, which means every client can retry on any failure, which means transient failures stop becoming user-visible.",
        },
        {
          kind: "your_turn",
          prompt:
            "A mobile app submits an order. The network drops after the request is sent but before the response arrives. Design the idempotency scheme: who generates the key, when, how it is stored, what the server returns on retry, and what happens if the user taps 'submit' twice in one second.",
        },
        {
          kind: "compare",
          body: "A beginner treats every failed request as a candidate for a blind retry. An engineer makes every write safe to retry, then retries with backoff and jitter, and respects the server's `Retry-After`.\n\nThe first turns a slow network into duplicate charges, duplicate orders, and duplicate emails. The second turns a slow network into a slightly slower request that still succeeds once. The difference is not cleverness; it is deciding, before writing the handler, whether running it twice is safe.",
        },
        {
          kind: "recap",
          points: [
            "Idempotency is a property of the effect, not the HTTP method",
            "An idempotency key is client-generated, operation-scoped, and TTL'd",
            "A retry returns the original response, byte for byte",
            "In-flight duplicates need a lock, not a second execution",
            "Retries use exponential backoff with jitter, and honour Retry-After",
          ],
        },
      ],
    },
    // -----------------------------------------------------------------------
    {
      slug: "errors-and-status-codes",
      title: "Errors and status codes",
      attribution:
        "Synthesised from RFC 9457 (problem details) and MDN's HTTP status reference. The Netflix gateway story is from the Zuul project README.",
      sources: [
        {
          label: "RFC 9457 — problem details for HTTP APIs",
          url: "https://www.rfc-editor.org/rfc/rfc9457.html",
        },
        {
          label: "MDN — 429 Too Many Requests",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429",
        },
        {
          label: "MDN — Retry-After header",
          url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Retry-After",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The 500 that meant 'try again'",
          body: "Your client gets a `500 Internal Server Error` from an API. Is the operation done? Unknown. Did the server charge the card before it crashed? Unknown. Can the client retry? If it retries and the server did charge, it double-charges. If it does not retry and the server did not charge, the user's order is lost. A status code that does not tell the caller what happened is not a status code; it is a shrug. Most of the shrugs in production come from 500s used where 4xxs or 409s were meant.",
        },
        {
          kind: "concept",
          title: "The codes that matter",
          body: "You do not need all 60 status codes. You need about ten, used precisely:\n\n- **200 OK** — success, body present. **201 Created** — a new resource was created, `Location` header points at it. **204 No Content** — success, no body (deletes, updates with nothing to return).\n- **400 Bad Request** — the request is malformed or fails validation. The body says what is wrong.\n- **401 Unauthorized** — no valid identity. **403 Forbidden** — identity known, permission denied.\n- **404 Not Found** — the resource does not exist. **409 Conflict** — the request conflicts with current state (duplicate idempotency key, version mismatch, constraint violation).\n- **422 Unprocessable Entity** — syntactically valid but semantically wrong (use 400 if you do not want this distinction).\n- **429 Too Many Requests** — rate limited, with `Retry-After`.\n- **500 Internal Server Error** — unexpected server failure. **502 Bad Gateway** — an upstream failed. **503 Service Unavailable** — overloaded or down, with `Retry-After`. **504 Gateway Timeout** — upstream timed out.\n\nThe most common misuse is 404 for *“you are not allowed to see this”*. That is a 403 (or a 401 if unauthenticated). Using 404 to hide existence is a legitimate pattern for some security-sensitive endpoints, but it must be a deliberate choice, not a default. A second common misuse is 200 with a success false body, which forces every client to parse the body to learn whether the request worked. The status code exists precisely so clients do not have to, always.",
        },
        {
          kind: "concept",
          title: "RFC 9457: problem details",
          body: 'A status code says *what* happened; it does not say *why* or *what to do about it*. RFC 9457 defines a standard body for error responses — `application/problem+json` — with five fields:\n\n- `type` — a URI identifying the problem type (often a docs page).\n- `title` — a short human-readable summary.\n- `status` — the HTTP status code, repeated for convenience.\n- `detail` — a human-readable explanation of this specific occurrence.\n- `instance` — a URI identifying this specific occurrence (useful for support tickets).\n\nExtensions (extra fields) are allowed and encouraged: `errors: [{ field, message }]` for validation failures is the common one. The value of the standard is not the fields; it is that every error in your system has the same shape, so a client can parse errors generically and a support engineer can read any error the same way.\n\nThe anti-pattern is a different error shape per endpoint: `{ error: "..." }` here, `{ message: "..." }` there, `{ errors: [...] }` somewhere else. A client handling three endpoints writes three parsers, and the fourth endpoint ships a fourth shape that nobody handles.',
        },
        {
          kind: "your_turn",
          prompt:
            "Audit one API you use. List every status code it returns, and for each one say: whose fault (client/server), whether retrying helps, and what body shape it uses. Which one is lying?",
        },
        {
          kind: "compare",
          body: "A beginner returns 200 with `{ success: false }` in the body, or 500 for everything, and lets the client parse the body to figure out what happened. An engineer returns the right status code, a problem-details body, and a `Retry-After` when retrying helps.\n\nThe first makes every client a special case and every error a support ticket. The second makes errors machine-readable, retryable where appropriate, and consistent across every endpoint. The gateway can only protect callers if the services tell the truth.",
        },
        {
          kind: "recap",
          points: [
            "4xx is the client's fault; 5xx is the server's — do not swap them",
            "401 vs 403 vs 404 are three different answers; pick the right one",
            "RFC 9457 gives every error the same parseable shape",
            "Every status code implies a retry policy; state it in the contract",
            "Services return honest errors; the gateway translates and protects",
          ],
        },
      ],
    },
    // -----------------------------------------------------------------------
    {
      slug: "the-gateway-as-one-door",
      title: "The gateway as one door",
      attribution:
        "Synthesised from the Zuul and Eureka project READMEs (verbatim quotes attributed) and the microservices.io API gateway pattern. No source text reproduced beyond the quoted README lines.",
      sources: [
        {
          label: "microservices.io — API gateway pattern",
          url: "https://microservices.io/patterns/apigateway.html",
        },
        {
          label: "Wikipedia — API gateway",
          url: "https://en.wikipedia.org/wiki/API_gateway",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Four clients, hundreds of services",
          body: "It is 2012 at Netflix. You have hundreds of micro-services and four client types: smart TVs, phones, browsers, and partner integrations. Every client calls every service it needs. A new field in the playback service requires updating four clients. A new auth scheme requires updating four clients and hundreds of services. There is no single place where the rules of the conversation live, so there is no single place to change them. The cost is not capacity; it is coordination, and coordination does not scale.",
        },
        {
          kind: "concept",
          title: "What a gateway is",
          body: "An API gateway is a server that sits between clients and services and acts as the single entry point for all requests. Netflix's Zuul is one: the project README describes it as *“an L7 application gateway that provides capabilities for dynamic routing, monitoring, resiliency, security, and more.”* The key word is *application*: Zuul operates at layer 7, so it understands HTTP — paths, headers, methods — and can make decisions the network layer cannot.\n\nWhat the gateway does, in one sentence: it receives a request, decides which service should handle it, and forwards it, applying cross-cutting concerns along the way. The client sees one host. The services see one caller. The contract lives in one place. Yes, one more big key consideration: the gateway must be observable. Every request that passes through it should be logged with a correlation id, and every downstream call should be traced. When a request fails, the gateway is where you look first, because it is the one component that saw the whole conversation. Without that visibility, the gateway becomes a black box that everyone blames and nobody can debug. The gateway is also the natural place to enforce a single version of the API contract: when the playback service changes its response shape, the gateway can translate between the old and new shapes during a migration, so clients do not break while the service rolls out. This translation is a temporary measure, not a permanent feature, and it should be removed once all clients have migrated.",
        },
        {
          kind: "concept",
          title: "What belongs at the edge",
          body: "A capability belongs at the gateway if it is **cross-cutting** — needed by every service, identical in every service, and better maintained once. The list:\n\n- **Routing** — which service handles which path. Dynamic routing means the gateway can shift traffic without a deploy.\n- **Authentication** — establishing identity once, for every request, as covered in the auth lesson.\n- **Rate limiting** — protecting every service from a single abusive caller, in one place.\n- **Resiliency** — timeouts, retries, circuit breakers, bulkheads, applied uniformly.\n- **Monitoring** — one set of metrics and logs for the whole edge, not N sets per service.\n- **Request/response transformation** — aggregating multiple service calls into one client response, or translating protocols (REST to gRPC).\n\nThe test for *“does this belong at the gateway?”* is: *would every service implement it identically?* If yes, it belongs at the edge. If it depends on a service's data, it belongs in the service.",
        },
        {
          kind: "video",
          videoId: "vz6ShBpxt2U",
          title:
            "System Design Basics in Bangla | CDN + Message Queue + API Gateway Explained",
          caption:
            "Bangla walkthrough of the API gateway concept alongside CDN and message queues.",
        },
        {
          kind: "your_turn",
          prompt:
            "You are designing the edge for a system with a web app, a mobile app, and a partner API. Do you use one gateway, BFFs, or composition? What lives at the edge, what stays in services, and what is your service-discovery story?",
        },
        {
          kind: "compare",
          body: "A beginner sees a gateway as a router and puts business logic in it because *“it is already there.”* An engineer sees a gateway as a policy enforcement point and keeps it thin: routing, auth, rate limiting, resiliency, monitoring — and nothing that knows what a user or an order is.\n\nThe first produces a distributed monolith with a single deployable that every team must coordinate on. The second produces a system where services own their data and the edge owns the rules of the conversation — which is the only arrangement that scales past a few services.",
        },
        {
          kind: "recap",
          points: [
            "A gateway is the single entry point and the home of cross-cutting concerns",
            "Zuul: dynamic routing, monitoring, resiliency, security — at layer 7",
            "Business logic and fine-grained auth do not belong at the edge",
            "Eureka provides discovery so routing can be dynamic",
            "BFFs tailor the edge per client; composition aggregates at the cost of coupling",
            "Start without a gateway; add one when duplication hurts more than running it",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "An API is a promise with four parts — shape, semantics, errors, evolution — and the gateway is where that promise is enforced for every caller at once.",
    strongAnswer:
      "I design APIs contract-first: write the schema, review with callers, implement against it. Pagination uses opaque cursors on a compound key, not offsets. Auth splits into identity at the edge and permission in the service. Writes carry idempotency keys so retries are safe. Errors use RFC 9457 problem details with honest status codes. The gateway — Zuul-style — owns routing, auth, rate limiting, resiliency and monitoring, and stays thin: no business logic, no fine-grained auth. Service discovery (Eureka) makes routing dynamic.",
    trap: "The trap is treating the gateway as a place to put business logic because 'it is already there,' and treating a valid session as permission. The first creates a distributed monolith; the second leaks data the moment a non-admin logs in.",
  },
  recap: [
    "Write the contract before the code; let the code fall out of it",
    "Paginate with opaque cursors on a compound key, not offsets",
    "Authentication at the edge, authorisation near the resource",
    "Idempotency keys make every write safe to retry",
    "Errors are a contract: right status code, problem-details body, retry policy",
    "The gateway owns cross-cutting concerns and stays thin",
  ],
  attribution:
    "Synthesised from RFC 9110, the Google API design guide, AIP-158, Stripe's pagination and idempotency docs, the AWS Builders' Library, Auth0's JWT docs, RFC 9457, MDN's HTTP reference, and the Zuul and Eureka project READMEs. The Netflix gateway story is from those READMEs; their quoted lines are verbatim. No source text reproduced beyond the quoted README lines; the design vocabulary is our own.",
};

export default module;
