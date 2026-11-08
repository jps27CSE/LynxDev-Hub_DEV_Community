import type { SdEdge, SdGraph, SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
import task from "./how-systems-fail.task";

/**
 * Module 12 — how systems fail, converted to the leaf model (plan 17, slice B7).
 *
 * **Netflix anchor.** In July 2011 Netflix published the Simian Army: a set of
 * tools that break production on purpose. Chaos Monkey "randomly disables
 * production instances to make sure we can survive without one"; Chaos Gorilla
 * takes out a whole availability zone; Chaos Kong takes out a whole region.
 * That progression is the module — each tool answers the same question at a
 * different size of blast radius, and `github.com/Netflix/SimianArmy` is the
 * code, not the marketing.
 *
 * **The task.** The playback API serves 12,000 requests a second from four app
 * instances and a store with no replica. Measured: 58.3% of requests are shed,
 * the API runs at 150% of its capacity and the store at 160%, and throughput
 * settles at 5,000 — the store's ceiling. The fix is not "add redundancy
 * somewhere": each tier must be sized so that losing a third of it still leaves
 * capacity. Measured: 10 app instances (60%) and 4 read replicas (48%) serve
 * every request, and still serve every request when both tiers are degraded to
 * two thirds (90% and 72%).
 *
 * **What the canvas cannot show, and what this module does instead.**
 * `replicas` is a capacity multiplier, not redundancy: a `node_down` failure on
 * `app-1` removes the node from the graph and kills every replica at once, so
 * "one of thirteen instances died" is not expressible. `degraded` is — it
 * multiplies capacity — which is why the acceptance test is *capacity after
 * loss* rather than instance death. `tests/system-design-content.test.ts`
 * asserts both halves so the caveat cannot rot: the solution survives a tier
 * degraded to two thirds, and a `node_down` on the store still invalidates the
 * topology.
 *
 * **Why the old task was replaced.** It required `replicas >= 2` and graded
 * `app.utilisation < 0.4` at 1,000 r/s, where a single instance already sits at
 * 50% — so the criterion measured arithmetic, not survival, and the module's
 * own subject (failure) was graded by nothing at all.
 *
 * **Chain note.** `check:system-design` warns that this `startGraph` drops the
 * `cdn` and `object_store` nodes module 11's solution carried. Intentional: the
 * media tier was module 11's canvas, and this module's question — what happens
 * when a tier disappears — is clearest with one terminal, because a second
 * terminal makes the engine reroute every request to it instead of failing any.
 */

const plain = { attempts: 0, backoffMs: 0, jitter: false } as const;

function wire(
  id: string,
  from: string,
  to: string,
  label: string | null = null,
): SdEdge {
  return { id, from, to, label, retry: { ...plain }, partitioned: false };
}

/** Concept graph: the healthy design at a load it can actually serve. */
const conceptScenario = {
  arrivalRate: 1_000,
  writeShare: 0.1,
  mediaShare: 0,
  bytesPerMediaRequest: 2_000_000,
  abusiveShare: 0,
  latencyJitterMs: 0,
  cacheColdStart: false,
  replicaLagMs: 0,
} as const;

function topGraph(
  arrivalRate: number,
  appReplicas: number,
  readReplicas: number,
): SdGraph {
  return {
    nodes: [
      { ...defaultNode("client", "client-1", 40, 200), label: "Viewers" },
      { ...defaultNode("load_balancer", "lb-1", 220, 200), label: "Edge" },
      {
        ...defaultNode("app_server", "app-1", 440, 200),
        label: "Playback API",
        replicas: appReplicas,
      },
      {
        ...defaultNode("database", "db-1", 680, 200),
        label: "Playback store",
        readReplicas,
      },
    ],
    edges: [
      wire("e1", "client-1", "lb-1"),
      wire("e2", "lb-1", "app-1"),
      wire("e3", "app-1", "db-1", "session write"),
    ],
    scenario: { ...conceptScenario, arrivalRate },
  };
}

const conceptGraph = topGraph(1_000, 4, 0);
const stormGraph = topGraph(9_000, 4, 0);
const hardenedGraph = topGraph(12_000, 10, 4);
const taskStartGraph = topGraph(12_000, 4, 0);
const taskSolutionGraph = topGraph(12_000, 10, 4);

const module: SdModule = {
  slug: "how-systems-fail",
  order: 12,
  part: 3,
  partTitle: "Reliability",
  kind: "sim",
  title: "How Systems Fail & Blast Radius",
  description:
    "Trace a request through every hop, find the tiers whose loss stops playback, and size each one so losing a third of it is survivable. Retry storms, cascades, failure domains and the signals that tell you which of them is happening.",
  story:
    "Netflix gave its failure injectors an army's name because the alternative — waiting for production to find the weak node — was worse. Chaos Monkey disables instances at random; Chaos Gorilla takes an availability zone; Chaos Kong takes a region. Every one of them is a question about blast radius, and none of them can be answered by looking at a healthy dashboard. We are at 12,000 requests a second on the playback API, served by four app instances and a store with no replica. Tracing one request shows three hops, and two of them are single points of failure: the API and the store. The task is not to add redundancy everywhere; it is to size each tier so that a third of it can disappear and the remaining two thirds still answer every request. Then we learn to tell the difference between a system that is slow and a system that is lying to you about being fast.",
  chapters: [
    {
      slug: "finding-the-failure",
      title: "Finding the failure",
      description:
        "Trace a request and mark every hop whose death stops playback.",
      children: [
        {
          slug: "trace-chapter",
          title: "Trace the request",
          description:
            "Four hops, and the blast radius of each one is a number you can compute.",
          lessonSlug: "trace-your-own-design",
        },
        {
          slug: "retry-chapter",
          title: "Retries become traffic",
          description:
            "A retry is a new request, and a thousand clients retrying is a load test you did not schedule.",
          lessonSlug: "retry-storms",
        },
      ],
    },
    {
      slug: "the-cascade",
      title: "The cascade",
      description:
        "A slow dependency is more dangerous than a dead one, because it is still in the path.",
      children: [
        {
          slug: "slow-is-not-down-chapter",
          title: "Slow is not down",
          description:
            "A dependency that takes thirty seconds takes the caller with it.",
          lessonSlug: "cascades",
        },
      ],
    },
    {
      slug: "containing-the-damage",
      title: "Containing the damage",
      description:
        "Failure domains, headroom, and the signals that tell you which one broke.",
      children: [
        {
          slug: "domains-chapter",
          title: "Failure domains",
          description:
            "Zones, regions and bulkheads decide how far one failure travels.",
          lessonSlug: "blast-radius-and-bulkheads",
        },
        {
          slug: "signals-chapter",
          title: "Signals",
          description:
            "Metrics, logs and traces, and the percentile that hid the outage.",
          lessonSlug: "logging-monitoring-and-traces",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "trace-your-own-design",
      title: "Trace one request",
      attribution:
        "Synthesised from the Netflix Simian Army announcement, the AWS Builders' Library on static stability, and Google's SRE Book chapter on addressing cascading failures. Capacity figures are this module's teaching model.",
      sources: [
        {
          label:
            "AWS Builders' Library — static stability using availability zones",
          url: "https://aws.amazon.com/builders-library/static-stability-using-availability-zones/",
        },
        {
          label: "SRE Book — addressing cascading failures",
          url: "https://sre.google/sre-book/addressing-cascading-failures/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Four hops, two of them fatal",
          body: "A viewer presses play. The request leaves the client, reaches the edge load balancer, is forwarded to one of four Playback API instances, and becomes a session write against the Playback store. Four hops. Now delete each one in your head and ask what still works.\n\nDelete the load balancer and nothing reaches the API. Delete the API and there is no request to forward. Delete the store and the API has nowhere to write the session. Every hop is on every request's path, so the blast radius of two of them is one hundred percent of playback. That is the whole exercise: not 'which node is important' — which node is *unavoidable*.",
        },
        {
          kind: "concept",
          title: "Blast radius is a number you can compute",
          body: "The blast radius of a failure is the share of requests that stop succeeding because of it. It is not a feeling about how important a component is, and it is not the number of nodes affected. It is computed from the paths: a node that every request traverses has a blast radius of one; a node that half the requests traverse has a blast radius of a half; a node that only the nightly export touches has a blast radius of nearly zero.\n\nThat distinction changes the order of work. The store in this graph has no replica, so its loss is total — the engine reports the topology as invalid rather than pretending to serve. Giving it one replica does not shrink its blast radius to fifty percent, because the replica is a capacity multiplier in this model, not a second path. What a replica does is make the surviving capacity large enough to carry the whole load, which is a different and equally real guarantee: the store stops being a tier whose loss is *fatal* and becomes a tier whose loss is *absorbed*.",
        },
        {
          kind: "concept",
          title: "The failure you can measure is capacity after loss",
          body: "Instance death is hard to model honestly and easy to model dishonestly. The canvas takes the honest route: a node is a tier, its `replicas` is how much work that tier can do, and a `degraded` failure multiplies that capacity by a factor — a region that is running at a third of normal. So the question the task asks is the one a production review actually asks: *if a third of this tier goes away, does the remaining two thirds still serve?*\n\nAt 12,000 requests a second, four app instances (8,000 of capacity) are at 150% before anything fails. The store, at 5,000, is at 160%. The engine sheds 58.3% of requests and settles at 5,000 a second, which is exactly the store's ceiling: the API tier is not even the limit by the end of the run. Ten instances (20,000) sit at 60% and four read replicas (25,000) sit at 48%, and both remain under capacity when degraded to two thirds — 90% and 72%, with zero shed.\n\nThat is the difference between a rehearsal and a hope. Instance death can only be discovered by killing instances; capacity after a loss can be computed before anything breaks, from three numbers: peak load, capacity per instance, and the fraction of the tier that survives. Two of those are on a dashboard, and the third is a decision about how the system is deployed.",
        },
        {
          kind: "diagram",
          caption:
            "The healthy design at 1,000 r/s: 13% on the API, 20% on the store, and nothing failing yet",
          graph: conceptGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "List every hop between the viewer and the store. For each, write the share of requests that traverses it and what still works if it disappears. Which one would you fix first, and what does fixing it cost?",
        },
        {
          kind: "compare",
          body: "A beginner reacts to an outage by adding redundancy to the node named in the incident, then waits for the next one. A senior engineer builds the table first — hop, traffic share, surviving behaviour — and spends the redundancy budget where blast radius times likelihood is largest.\n\nThe trap is confusing 'we have replicas' with 'we survive a loss'. Replicas raise the ceiling; headroom is what decides whether the ceiling is high enough after the loss. A tier at 95% with ten replicas fails the moment it loses two.",
        },
        {
          kind: "video",
          videoId: "Pfr_6h3Rqew",
          title:
            "System Design Basics in Bangla | Scalability + Availability + Consistency + Fault Tolerance Explained",
          caption:
            "Bangla walkthrough of fault tolerance — the vocabulary this module uses.",
        },
        {
          kind: "recap",
          points: [
            "Blast radius is the share of requests a failure stops, computed from paths",
            "A node on every path has a blast radius of one, however small it looks",
            "Replicas raise capacity; headroom decides whether that capacity survives a loss",
            "Measured here: four instances at 150%, store at 160%, 58.3% shed",
            "Size each tier so losing a third still leaves it under capacity",
          ],
        },
      ],
    },
    {
      slug: "retry-storms",
      title: "Retries become traffic",
      attribution:
        "Synthesised from the AWS Builders' Library on timeouts, retries and backoff with jitter, and Google's SRE Book on cascading failures.",
      sources: [
        {
          label:
            "AWS Builders' Library — timeouts, retries and backoff with jitter",
          url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
        },
        {
          label: "SRE Book — addressing cascading failures",
          url: "https://sre.google/sre-book/addressing-cascading-failures/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The store slows down, so the clients help",
          body: "The store gets slow. Requests start timing out at the edge. The client library does what it was told: it retries. Each of the 3,000 real requests per second now arrives twice, then a third time, and the store — which was slow because it was near capacity — receives 9,000 requests a second instead of 3,000.\n\nThis is the most expensive kindness in distributed systems. Nobody wrote a load test; the retries *are* the load test, and they run at exactly the moment the system has the least room for one. Measured on this canvas at 9,000 requests a second: the API is at 113%, the store at 160%, 44.4% of requests are shed, and throughput settles at 5,000 — the store's ceiling again.",
        },
        {
          kind: "concept",
          title: "The server cannot tell a retry from an intent",
          body: "Every retry is a brand new request as far as the receiving service is concerned. It carries no memory of the original attempt, no marker that says *this is the second try*, and no way to know that the first attempt may have already succeeded. The engine models exactly this: it counts arrivals, and a retry is an arrival.\n\nThat has two consequences, and they point in opposite directions. For availability, retries are a tax: they multiply load on a tier that is already struggling. For correctness, they are worse than a tax, because an attempt that timed out may have completed — the write may have landed, the charge may have gone through. Module 14 is about that second consequence. This lesson is about the first: a retry is load, and load on a saturated tier makes the original failure more likely, not less.",
        },
        {
          kind: "concept",
          title: "Backoff, jitter, and a budget you can name",
          body: "Three controls turn retries from an amplifier into a dampener, and each one fixes a different failure.\n\n**Backoff.** Wait longer after each attempt — 100 ms, then 200, then 400. A failing dependency needs time to recover, and a retry that arrives in a millisecond is a probe, not a rescue.\n\n**Jitter.** Randomise the wait. A thousand clients that all back off for exactly 200 ms all retry at exactly the same instant; that is a thundering herd wearing a backoff's clothes. AWS's article is blunt about the fix: add randomness, and prefer 'full jitter' — a uniform draw between zero and the backoff window — because it spreads the retries as widely as possible.\n\n**A budget.** Cap retries as a share of total traffic, not per call. If retries may add at most ten percent to the load, then a dependency that is failing cannot be asked to absorb three times its normal traffic, no matter how many callers are retrying. The budget is the only one of the three that is about the *aggregate*, which is the number that actually takes a tier down.",
        },
        {
          kind: "concept",
          title: "You cannot retry your way out of a saturated store",
          body: "The intuitive fix for a retry storm is more capacity at the front door: add API instances until the retries stop timing out. It does not work, and the canvas shows why. At 9,000 requests a second, doubling the API tier from four instances to six drops it from 113% to 75% — and the store is still at 180%, still sheds 44.4%, and still caps throughput at 5,000.\n\nThe retries were never the API's problem. They were the store's problem, delivered by the API. Adding instances upstream of a saturated tier moves the queue, not the load. The fixes that work are the ones that reduce what reaches the store: stop retrying, deduplicate at the edge, cache the read, or shed the request before it becomes a write.",
        },
        {
          kind: "diagram",
          caption:
            "Retries modelled as what they are — 9,000 arrivals a second: the API at 113%, the store at 160%, 44.4% shed",
          graph: stormGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "A dependency returns 503 for ten percent of calls. You retry three times with 100 ms of backoff and no jitter, from 1,000 clients. How much extra load does the dependency see in the first second, and what changes if the backoff is jittered across zero to 400 ms?",
        },
        {
          kind: "compare",
          body: "A beginner adds retries until the error rate drops, and calls the drop a fix. A senior engineer asks what the retry does to the tier that is failing, caps the aggregate retry budget, and makes the retry safe for writes before making it frequent.\n\nThe trap is retrying every 5xx. A 500 may be transient; a 503 with `Retry-After` is the server telling you exactly how long to wait, and retrying in 100 ms is ignoring the answer. The second trap is retrying a write without an idempotency key, which turns a slow database into a duplicate-rows database.",
        },
        {
          kind: "recap",
          points: [
            "A retry is a new request: the server cannot see the original attempt",
            "Retries multiply load on the tier that is already failing",
            "Backoff gives recovery time; jitter desynchronises clients; a budget caps the total",
            "Measured here: 9,000 arrivals keep the store at 160% and throughput at 5,000",
            "Adding capacity upstream of a saturated store moves the queue, not the load",
          ],
        },
      ],
    },
    {
      slug: "cascades",
      title: "Slow is worse than down",
      attribution:
        "Synthesised from Google's SRE Book on cascading failures, the AWS Builders' Library on avoiding fallback, and the Bangla production-latency walkthrough by Jack Pritom Soren.",
      sources: [
        {
          label: "SRE Book — addressing cascading failures",
          url: "https://sre.google/sre-book/addressing-cascading-failures/",
        },
        {
          label:
            "AWS Builders' Library — avoiding fallback in distributed systems",
          url: "https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The resize service is not dead, it is thinking",
          body: "The image API calls a resize service for every new asset. The resize service does not return errors: it accepts the connection, takes the request, and then takes thirty seconds to answer, because it is out of capacity and its queue is deep.\n\nThe API has no timeout on that call, so every API worker that touches a resize sits and waits. Workers are a fixed pool. Within a minute the pool is full of threads waiting on a dependency that is not failing, and the API stops answering *anything* — including the metadata reads that never needed the resize service at all. On the canvas the resize tier runs at 149% of its capacity and sheds 16.3% of all traffic, and at a quarter of its capacity it runs at 596% and sheds 41.3%.",
        },
        {
          kind: "concept",
          title: "A dead dependency is cheap; a slow one is expensive",
          body: "A dead dependency fails fast. The connection is refused in microseconds, the caller gets an error it can handle, and the resource — thread, connection, goroutine — is released immediately. A slow dependency holds the resource for as long as it takes, and the resource is the part of the system that is actually finite.\n\nThis is why capacity engineering alone does not save you. Adding API instances adds threads, and every new thread can also get stuck waiting, so the only thing that grows is the size of the stuck pool. The failure mode is not 'we ran out of capacity'; it is 'we ran out of capacity and we are still paying for requests that will never finish'. The call that started at 09:14 is still holding a worker at 09:15, and it is holding it for a request whose client disconnected at 09:14:02.",
        },
        {
          kind: "concept",
          title: "Wait time is the only metric that matters at the top",
          body: "As a tier approaches its capacity, its queue grows without bound. Little's Law makes that arithmetic explicit: concurrency equals arrival rate multiplied by time in system. If the resize tier is offered more work than it can do, requests queue, so time in system rises, so concurrency rises — and concurrency is the number of workers held hostage by the slow dependency.\n\nThe engine's own numbers follow the same curve. At 149% utilisation the queue is already adding latency to every request that reaches it; the requests that are shed are the ones that arrived after the tier stopped accepting. In production you see the same shape as a p99 that climbs while the median looks fine, because the median is the traffic that missed the slow path entirely.",
        },
        {
          kind: "concept",
          title: "Timeouts are the first cut, not the fix",
          body: "A timeout converts 'slow' into 'failed', which is what makes it useful: it returns the worker, and a returned worker can serve the next request. The rule that matters is that a timeout must be shorter than the caller's own deadline — a thirty-second timeout inside a ten-second request budget is not a timeout, it is a promise to fail late.\n\nBut a timeout alone turns a slow dependency into an error the user sees. What turns it into a *degraded* response is what the caller does next: serve the original unresized asset, serve a cached version, or fail fast and let the client retry elsewhere. That decision is module 13's subject. The point here is only that the timeout comes first, because nothing else you build has a chance to run while a worker is blocked.",
        },
        {
          kind: "diagram",
          caption:
            "The resize tier at 149% of capacity: 16.3% of all requests are shed, and the API holds workers waiting for requests that will never finish",
          graph: (() => {
            const graph = topGraph(6_000, 4, 1);
            graph.nodes.push({
              ...defaultNode("app_server", "resize-1", 440, 340),
              label: "Resize",
              replicas: 1,
            });
            graph.edges.push(wire("e4", "app-1", "resize-1", "resize"));
            return graph;
          })(),
        },
        {
          kind: "your_turn",
          prompt:
            "The resize service is slow but alive. The API can wait, fail fast, or serve the unresized image. For each choice, name who pays: the user, the API tier, or the resize tier. Which would you ship, and what would you measure to know you chose correctly?",
        },
        {
          kind: "compare",
          body: "A beginner waits indefinitely, because the service is not down and the request might still succeed. A senior engineer sets a small timeout, serves a degraded asset, and treats a slow dependency as a failure that has not finished happening yet.\n\nThe trap is a timeout that is too generous. 'Let us give it thirty seconds in case it is just slow' is the exact sentence that turns one slow dependency into a full outage, because thirty seconds times every worker is the whole pool.",
        },
        {
          kind: "video",
          videoId: "osfhB8rd55A",
          title:
            "5ms on Localhost, 5 Seconds in Production? Here's What Went Wrong (Bangla)",
          caption:
            "Why the latency you measured and the latency your users get are different numbers.",
        },
        {
          kind: "recap",
          points: [
            "A dead dependency fails fast and releases the caller; a slow one holds it",
            "Cascades start when callers hold workers waiting for a dependency",
            "Little's Law turns a growing queue into growing concurrency",
            "A timeout must be shorter than the caller's own deadline",
            "Measured here: resize at 149% sheds 16.3% of all traffic; at a quarter of capacity, 41.3%",
          ],
        },
      ],
    },
    {
      slug: "blast-radius-and-bulkheads",
      title: "Failure domains and headroom",
      attribution:
        "Synthesised from the AWS Builders' Library on static stability and leader election, and the Netflix Simian Army's zone- and region-level failure injectors.",
      sources: [
        {
          label:
            "AWS Builders' Library — static stability using availability zones",
          url: "https://aws.amazon.com/builders-library/static-stability-using-availability-zones/",
        },
        {
          label: "Netflix Simian Army — Chaos Gorilla and Chaos Kong",
          url: "https://github.com/Netflix/SimianArmy",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "One zone of three",
          body: "The playback API runs in three availability zones. Each zone holds a third of the app instances and a third of the database's read capacity. An availability zone fails — power, network, a control-plane bug — and a third of every tier goes with it, at the same moment, on every tier at once.\n\nThis is not an exotic scenario; it is the one Netflix built Chaos Gorilla to rehearse, and the reason Chaos Kong exists one level up is that a region failure is the same problem with a bigger multiplier. The question a design review must answer is not 'can we survive a zone loss in theory' but 'at 12,000 requests a second, is the remaining two thirds enough, and do we know that before the zone goes?'",
        },
        {
          kind: "concept",
          title: "Failure domains are chosen, not discovered",
          body: "A failure domain is the set of things that fail together. A process, a host, a rack, an availability zone, a region, a database primary, a shared thread pool, a single DNS name — each is a domain, and the design decides which of them share a fate.\n\nThe important ones are the ones you did not choose. Two services that share a connection pool share a failure domain. Two tiers that share a load balancer share one. A retry budget shared across all callers is a failure domain: one bad client can exhaust the retries that everyone else needed. Drawing the boundaries on purpose is the whole of resilience architecture; the rest is arithmetic about how much capacity survives inside each boundary.",
        },
        {
          kind: "concept",
          title: "Static stability, or why capacity is not a plan",
          body: "There are two ways to survive a zone loss. The reactive one is to notice the failure and add capacity elsewhere — which fails exactly when the control plane that would do the adding is in the zone that just died. The other is static stability: provision so that the surviving capacity is already sufficient, with no action required at the moment of failure. AWS's article is the canonical statement, and the practical rule is one-and-a-half times peak on every tier that can lose a third.\n\nThe canvas makes that rule checkable. Ten app instances are 20,000 requests a second of capacity against 12,000 of load: 60%. Degrade both tiers to two thirds and the API sits at 90% and the store at 72%, with zero requests shed. Nine instances land at 67% and fail the headroom criterion, which is the point — the criterion is not decoration, it is the difference between 'probably fine' and 'measured'.",
        },
        {
          kind: "concept",
          title: "Bulkheads keep one flood out of the other compartments",
          body: "A bulkhead partitions a shared resource so that exhaustion in one partition cannot exhaust another. The classic case is thread pools: if every endpoint shares one pool, an endpoint that blocks on a slow dependency can take the whole API down, which is exactly the cascade in the previous lesson. Separate pools per dependency — or a concurrency cap per dependency — mean the resize service can only ever consume the threads reserved for resizing.\n\nThe trade is utilisation for isolation: a partitioned pool is idle in one compartment while another is queued, and that idle capacity is the price of the guarantee. The right size is not 'as small as possible' but 'enough for normal traffic, small enough that its loss is survivable' — the same sentence as capacity planning, applied to a pool instead of a tier. The canvas does not model pools; module 13 is where the pattern is named and the decision is graded.",
        },
        {
          kind: "diagram",
          caption:
            "Sized for a lost third: 10 instances at 60%, 4 read replicas at 48%, and both still under capacity when degraded to two thirds",
          graph: hardenedGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "Your API runs in three zones with an even split. The store is a single primary with two read replicas in the same three zones. A zone dies: what breaks first, what does the remaining capacity look like, and which decisions would you have had to make a month earlier?",
        },
        {
          kind: "compare",
          body: "A beginner says 'we have three zones, so we are highly available' and discovers in the incident that all three share one database primary. A senior engineer names the failure domains, sizes every tier for the loss of the largest one, and rehearses the loss before production does.\n\nThe trap is confusing distribution with independence. Three zones running the same single-primary database are three failure domains for compute and one for storage, and the storage one is the one that matters.",
        },
        {
          kind: "recap",
          points: [
            "A failure domain is whatever fails together — process, zone, pool, primary",
            "Static stability means the surviving capacity is already enough, with no action",
            "Size each tier for peak divided by the fraction that survives — about 1.5× for a lost third",
            "Bulkheads partition a shared resource so one dependency cannot exhaust the rest",
            "Measured here: 10 instances and 4 replicas survive a two-thirds degradation at 90% and 72%",
          ],
        },
      ],
    },
    {
      slug: "logging-monitoring-and-traces",
      title: "The dashboard that said everything was fine",
      attribution:
        "Synthesised from the OpenTelemetry observability primer, Brendan Gregg's USE method, and Google's SRE Book on postmortem culture.",
      sources: [
        {
          label: "OpenTelemetry — observability primer",
          url: "https://opentelemetry.io/docs/concepts/observability-primer/",
        },
        {
          label: "Brendan Gregg — the USE method",
          url: "https://www.brendangregg.com/usemethod.html",
        },
        {
          label: "SRE Book — postmortem culture",
          url: "https://sre.google/sre-book/postmortem-culture/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Green dashboard, shed traffic",
          body: "During the incident the dashboard was green. Latency was fine — p95 at 9.9 ms, better than the week before. CPU was fine. The only number that was not fine was the one nobody had put on the dashboard: 58.3% of requests were being rejected before they finished, and a percentile computed over the requests that completed cannot see the requests that did not.\n\nThat is not a modelling artefact; it is the single most common way a monitoring system lies. Every latency metric is conditioned on a request existing long enough to be measured, and a server that sheds work at the door produces beautiful latency for the work it accepts.",
        },
        {
          kind: "concept",
          title: "Three signals, three jobs",
          body: "**Metrics** are cheap aggregates: counters, gauges, histograms. They answer 'how much' and 'how often', they are the only signal cheap enough to keep for months, and they are the only one you can alert on at scale. What they cannot do is tell you why.\n\n**Logs** are discrete events with context. They answer 'what happened to this one request', they are expensive per event, and they are the signal you read after the alert fires rather than the one that fires it.\n\n**Traces** are the request's own view of itself: a span per hop, with duration, parent and attributes. They answer 'where did the time go' for one request across services, which is the question neither of the other two can answer. The reason observability bills explode is traces — a trace per request at 12,000 requests a second is 12,000 records a second — which is why the usual answer is sampling: keep all the errors, keep a fraction of the successes.",
        },
        {
          kind: "concept",
          title: "The percentile was computed over survivors",
          body: "Look at what the engine reports for the broken start graph: p95 of 9.9 ms, and an error rate of 58.3%. Both numbers are correct, and the first one is the reason the second one went unnoticed.\n\nThe fix is not to compute a different percentile. It is to always read latency next to the count it was computed over, and to alert on the ratio rather than the duration. A service answering 400 requests a second at 8 ms each when it was asked for 1,000 is not fast; it is refusing 60% of its traffic, and the refusal is happening in a fraction of the time the successful requests take — which is precisely why it drags the average down.",
        },
        {
          kind: "concept",
          title: "USE, and what to alert on",
          body: "Brendan Gregg's USE method is a checklist for resources: for every resource, check **utilisation**, **saturation** and **errors**. Utilisation is how busy it is, saturation is how much work is waiting, errors is how much failed. Applied to this canvas: the API at 150% utilisation, saturated, shedding; the store at 160%, saturated, shedding. Three lines per resource, and the incident is visible without a single log line.\n\nAlerting follows from it. Alert on symptoms users feel — error rate, latency at the tail, throughput below expectation — not on causes like CPU, which are noisy and often benign. Alert on burn rate rather than raw thresholds, so a slow burn over a day pages as reliably as a fast burn over five minutes. And put the shed count somewhere a human sees it during an incident: a request that was rejected is a user who saw an error, whether or not it produced a log line.",
        },
        {
          kind: "diagram",
          caption:
            "Where the four USE numbers live: utilisation and errors per tier, with the 60% / 48% of the sized design as the baseline to compare against",
          graph: hardenedGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "Design the four panels you would put on the wall for this system. For each, name the signal, the aggregation, and the threshold that would page someone. Then name the one panel that would have caught this incident in its first minute.",
        },
        {
          kind: "compare",
          body: "A beginner alerts on CPU above 80% and latency above 200 ms, and sleeps through an outage caused by a tier shedding 60% of its traffic at 9 ms. A senior engineer alerts on the ratio of served to offered requests, reads latency conditioned on that ratio, and uses traces to find the hop once the symptom is established.\n\nThe trap is treating observability as a logging problem. More logs would not have found this: the numbers were correct and complete. What was missing was the question — 'of the requests we were given, how many did we answer?' — asked in a place someone would see it.",
        },
        {
          kind: "video",
          videoId: "8itMutVwl_c",
          title:
            "System Design Basics in Bangla | Logging & Monitoring Explained",
          caption:
            "Bangla walkthrough of logging and monitoring, and what each one is for.",
        },
        {
          kind: "recap",
          points: [
            "Metrics answer how much, logs answer what happened, traces answer where the time went",
            "Latency is always conditioned on the requests that completed",
            "Measured here: p95 of 9.9 ms alongside 58.3% of requests shed",
            "USE checks utilisation, saturation and errors for every resource",
            "Alert on symptoms and burn rate, not on causes",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "Walk me through how this design fails. Which part has the largest blast radius, and what happens at 12,000 requests a second if a third of it goes away?",
    strongAnswer:
      "I would trace one request through every hop and record the share of traffic that traverses each one. Here the API and the store are on every request, so either one dying is a total outage; the load balancer is the same problem one level up. Then I would size every tier for peak divided by the fraction that survives a zone loss — about 1.5× at 12,000 requests a second, so 10 app instances and 4 read replicas, which sit at 60% and 48% and stay under capacity when degraded to two thirds. I would cap the retry budget so a failing store cannot be handed triple traffic, put a timeout on every dependency call so a slow tier cannot hold workers, and alert on served-versus-offered rather than on p95, because a system shedding 58% of its traffic reports excellent latency for the requests it accepts.",
    trap: "Saying 'we have replicas so we are highly available' without checking headroom after the loss, and quoting a p95 without the count it was computed over. Also, treating a slow dependency as less urgent than a dead one — the slow one still holds every worker.",
  },
  task,
  recap: [
    "Blast radius is the share of requests a failure stops, computed from the paths",
    "A retry is a new request, and retries are the load test nobody scheduled",
    "A slow dependency holds workers; a dead one releases them",
    "Size every tier for the fraction of it that survives — about 1.5× for a lost third",
    "Latency percentiles are conditioned on the requests that completed",
  ],
  attribution:
    "Synthesised from the Netflix Simian Army and Chaos Monkey projects, the AWS Builders' Library on static stability, timeouts and retries, Google's SRE Book on cascading failures and postmortem culture, the OpenTelemetry observability primer, Brendan Gregg's USE method, and Jack Pritom Soren's Bangla walkthroughs. Sources are linked per lesson; every capacity figure and error rate comes from this module's canvas.",
};

export default module;
