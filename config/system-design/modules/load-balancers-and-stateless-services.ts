import type { SdEdge, SdGraph, SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

/**
 * Module 6 — load balancers and stateless services, converted to the leaf model
 * (plan 17, slice B5).
 *
 * **Netflix anchor.** The two halves of "how does a request find a server":
 *
 *   - **Zuul**, which its README calls *"an L7 application gateway that
 *     provides capabilities for dynamic routing, monitoring, resiliency,
 *     security"* — the balancer that sits *in* the path;
 *   - **Eureka**, *"a RESTful service … for the purpose of discovery, load
 *     balancing and failover of middle-tier servers"* — the registry that sits
 *     *outside* it, so an instance can be replaced without anyone being told.
 *
 * Those two sentences are the module: one box that has to be in front, and one
 * idea — replaceable instances — that makes being behind something a safe place
 * to be.
 *
 * **The task was structurally impossible, and the rebuild is measured.** The
 * previous version offered 20,000 r/s to a single load balancer whose capacity
 * in `NODE_TYPES` is exactly 20,000, and its only pass criterion was
 * `assert: (r) => r.valid` — structural validity. Measured on the old solution
 * graph: **90% errors, 2,000 of 20,000 requests served, and the criterion
 * green.**
 *
 * Worse, the engine cannot spread load across *parallel* app nodes: path
 * selection is per terminal datastore (`lib/system-design/engine.ts`,
 * `pathsToTerminals`), so with `app-1..app-3` all leading to one database only
 * the first is ever reached. Measured on the old three-node solution:
 * **app-1 at 200% while app-2 and app-3 sit at 0%.**
 *
 * So the rebuilt task uses the model's own unit for N instances — `replicas` on
 * one app node — and its numbers are measured at 4,000 r/s, where a healthy
 * finish exists: **monolith → 50.0% errors, app at 200%, p95 13.2 ms; balancer
 * + 4 replicas → 0% errors, app at 50%, store at 80%, p95 4.0 ms.** The store
 * at 80% is deliberate: that is the hand-off to module 7, which inherits this
 * shape at 12,000 r/s and finds the cache missing.
 */

/** Every edge in this module is plain: no retries, no partitions. */
const plain = { attempts: 0, backoffMs: 0, jitter: false } as const;

function wire(
  id: string,
  from: string,
  to: string,
  label: string | null = null,
): SdEdge {
  return { id, from, to, label, retry: { ...plain }, partitioned: false };
}

/** The scenario every graph in this module runs on: 4,000 r/s, 5% writes. */
const scenario = {
  arrivalRate: 4_000,
  writeShare: 0.05,
  mediaShare: 0,
  bytesPerMediaRequest: 2_000_000,
  abusiveShare: 0,
  latencyJitterMs: 0,
  cacheColdStart: false,
  replicaLagMs: 0,
} as const;

/** The monolith: one box doing everything, at twice what it can serve. */
const monolithGraph: SdGraph = {
  nodes: [
    { ...defaultNode("client", "client-1", 40, 200), label: "Members" },
    {
      ...defaultNode("app_server", "app-1", 300, 200),
      label: "Monolith",
      replicas: 1,
    },
    { ...defaultNode("database", "db-1", 620, 200), label: "Title store" },
  ],
  edges: [wire("e1", "client-1", "app-1"), wire("e2", "app-1", "db-1")],
  scenario: { ...scenario },
};

/** The same load behind one address and four identical instances. */
const scaledGraph: SdGraph = {
  nodes: [
    { ...defaultNode("client", "client-1", 40, 200), label: "Members" },
    { ...defaultNode("load_balancer", "lb-1", 220, 200), label: "Edge" },
    {
      ...defaultNode("app_server", "app-1", 420, 200),
      label: "Playback API",
      replicas: 4,
    },
    { ...defaultNode("database", "db-1", 640, 200), label: "Title store" },
  ],
  edges: [
    wire("e1", "client-1", "lb-1"),
    wire("e2", "lb-1", "app-1"),
    wire("e3", "app-1", "db-1"),
  ],
  scenario: { ...scenario },
};

const module: SdModule = {
  slug: "load-balancers-and-stateless-services",
  order: 6,
  part: 1,
  partTitle: "Scaling up",
  kind: "sim",
  title: "Load Balancers & Stateless Services",
  description:
    "One box cannot serve four thousand requests a second, and four boxes are not an answer until something puts one address in front and something stops them remembering the user. Vertical vs horizontal, the balancer in the path, the number of instances, and the property that makes a server replaceable.",
  story:
    "Netflix's own account of leaving the data centre has a phrase for the thing we are running: “vertically scaled single points of failure”. One application, one database, and every member's request landing on the same box. Their answer was not a bigger box — it was Zuul at the edge and Eureka behind it, two projects whose READMEs describe the two halves of this module. Zuul is “an L7 application gateway” that routes; Eureka is a registry that lets an instance be replaced without anyone being told. We are at 4,000 requests per second on a single app process that can serve 2,000, shedding half of everything, and the fix is not a faster machine. It is a door, a number, and a promise that no server remembers you.",
  chapters: [
    {
      slug: "the-wall",
      title: "The wall",
      description:
        "Why one box stops, and what the two scaling axes really cost.",
      children: [
        {
          slug: "vertical-vs-horizontal-chapter",
          title: "Vertical vs horizontal",
          description:
            "A bigger box has a ceiling you cannot negotiate with. More boxes have a coordination problem instead.",
          lessonSlug: "vertical-vs-horizontal",
        },
      ],
    },
    {
      slug: "getting-traffic-to-instances",
      title: "Getting traffic to instances",
      description:
        "One address in front, and a number that has to change by itself.",
      children: [
        {
          slug: "load-balancing-chapter",
          title: "The balancer in the path",
          description:
            "Which instance, how it is chosen, what happens when one is sick — and why the balancer is a box too.",
          lessonSlug: "load-balancing",
        },
        {
          slug: "autoscaling-chapter",
          title: "How many instances?",
          description:
            "The control loop that answers the question, and the two ways it goes wrong.",
          lessonSlug: "autoscaling",
        },
      ],
    },
    {
      slug: "replaceable-instances",
      title: "Replaceable instances",
      description:
        "The property that makes all of the above safe: no server may remember you.",
      children: [
        {
          slug: "sessions-without-sticky-chapter",
          title: "Sessions without sticky",
          description:
            "A session in local memory survives to the next request one time in four. The arithmetic, and the three places to move it.",
          lessonSlug: "sessions-without-sticky",
        },
        {
          slug: "stateless-services-chapter",
          title: "What stateless actually means",
          description:
            "The test is whether you can kill the instance right now — and what it costs to pass it.",
          lessonSlug: "stateless-services",
        },
      ],
    },
  ],
  lessons: [
    // ---------------------------------------------------------------------
    {
      slug: "vertical-vs-horizontal",
      title: "Vertical vs horizontal",
      attribution:
        "Synthesised from the system-design-primer's scalability section and the Twelve-Factor App's chapter on processes, with Netflix's migration post supplying the phrase for the failure mode. All capacity figures are this module's teaching model.",
      sources: [
        {
          label: "system-design-primer — scalability",
          url: "https://github.com/donnemartin/system-design-primer",
        },
        {
          label: "The Twelve-Factor App — VI. Processes",
          url: "https://12factor.net/processes",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The box you cannot buy",
          body: "Four thousand requests per second at peak, one application process, and a ceiling of two thousand. Half of everything arrives and is turned away — not slowly, but immediately, shed at the door because the process is already at 100% and has no queue left to put it in.\n\nThe first instinct is a bigger box. Twice the CPU, twice the memory, and the number doubles. It works, for a while, and then it does not, and Netflix's account of leaving its own data centres has the phrase for where that ends: “vertically scaled single points of failure”. One application. One database. Every member's request on the same machine, and no way to add a second one because nothing was built to have a second one.",
        },
        {
          kind: "concept",
          title: "Two axes, and only one of them has a ceiling",
          body: "**Vertical** — scale up. More capacity per machine.\n**Horizontal** — scale out. More machines.\n\nThe canvas makes the difference unusually concrete: an app server node has a capacity of 2,000 requests per second, and there is no bigger app server in the palette. That is not a missing feature. It is the lesson. Vertical scaling ends at the largest instance your provider sells, and every provider has one.\n\nHorizontal scaling has no such wall — you add a node, or set `replicas`, and capacity multiplies — but it replaces a hardware problem with a coordination problem, which is the rest of this module.",
        },
        {
          kind: "concept",
          title: "The arithmetic of the wall",
          body: "At 4,000 requests per second against 2,000 of capacity, the process is at 200%. The engine sheds a request the moment utilisation reaches 1, so what a member experiences is not a slow page but a failed one:\n\n```\noffered 4,000 r/s ÷ capacity 2,000 r/s = 200% utilisation\nmeasured: 50.0% of requests shed, p95 13.2 ms (over the half that completed)\n```\n\nWork backwards from the target instead of forwards from the wall. To serve 4,000 at 70% utilisation you need 4,000 ÷ 0.7 ≈ 5,714 requests per second of capacity, which is three instances. Two give you 4,000 — exactly 100%, zero headroom, and the first spike is a repeat of the failure you just paid to fix.",
        },
        {
          kind: "diagram",
          caption:
            "The monolith at 4,000 r/s: the app tier is at 200% and sheds half the traffic before the database is ever asked",
          graph: monolithGraph,
        },
        {
          kind: "concept",
          title: "What each axis costs, in the same three places",
          body: "**Downtime.** A vertical upgrade means stopping the machine to make it bigger. A horizontal one means adding an instance beside it, which is why the same word — deploy — means “outage” on one axis and “nothing” on the other.\n\n**Blast radius.** One big box is one point of failure, and the failure is total. Twelve small ones lose 1/12th of their capacity and, if they are replaceable, nothing a member notices.\n\n**Price.** Doubling a server's size rarely doubles its cost — the top of a provider's catalogue commands a premium for a machine almost nobody rents. Four instances of the cheap size are usually cheaper than one of the expensive one, and you can turn three of them off at 3 a.m.\n\nWhat vertical buys is the absence of a coordination problem: no extra address, no shared state, no deploy pipeline. That is a real benefit, and it is why the correct answer at 200 requests per second is usually “upgrade the box and go and build the product”.",
        },
        {
          kind: "concept",
          title: "Read the canvas: `replicas` is N instances",
          body: "The canvas represents horizontal scaling as a number on one node — `replicas: 4` means four identical processes behind the same name, and capacity is multiplied by four. It is worth being explicit about that, because a learner who drags four separate app nodes onto the canvas will find that only one of them ever receives traffic: the engine picks a path per destination datastore, not per app server, so four boxes sharing one database are four boxes with one box's traffic.\n\nThat is a limitation of the model, not of load balancing, and the model's abstraction is the honest one anyway: behind a balancer, eight identical processes *are* one service. What differs between them is nothing a request can observe — which is exactly the property the last two lessons are about.",
        },
        {
          kind: "your_turn",
          prompt:
            "You are at 4,000 requests per second and 2,000 of capacity per instance. Compute how many instances you need for 70% utilisation, then say what you would have to give up if your provider's largest instance were 8,000 requests per second and you chose to buy it instead.",
        },
        {
          kind: "compare",
          body: "A beginner asks “which is better, vertical or horizontal” and expects one answer. An engineer asks “what does the next 10× cost, and what breaks the day after I do it”.\n\nThe trap is treating horizontal scaling as free capacity. It buys you a second problem in exchange for the first: something now has to choose an instance, something has to know how many there are, and nothing may hold state that only one instance has. Every section of this module is one of those bills being paid.",
        },
        {
          kind: "recap",
          points: [
            "Vertical is more per machine; horizontal is more machines",
            "The canvas has no bigger app node — 2,000 r/s is the ceiling, and the ceiling is the lesson",
            "4,000 against 2,000 is 200% and 50% shed; 70% utilisation needs three instances, not two",
            "Vertical costs downtime and concentrates failure; horizontal costs a coordination problem",
            "`replicas` is how this model says “four identical processes”, because behind a balancer that is what they are",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "load-balancing",
      title: "The balancer in the path",
      attribution:
        "Synthesised from Netflix's Zuul README, the AWS Application Load Balancer introduction, and the system-design-primer's load-balancing section. The 20,000 r/s ceiling is this module's node model, not an AWS number.",
      sources: [
        {
          label: "AWS — What is an Application Load Balancer?",
          url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html",
        },
        {
          label: "Netflix Zuul — an L7 application gateway",
          url: "https://github.com/Netflix/zuul",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "One address, four boxes",
          body: "Four instances now exist and a member's browser still has one hostname to connect to. Something has to turn that name into one of the four, and it has to stop choosing an instance the moment that instance is sick.\n\nAWS describes the role in a single sentence: *“A load balancer serves as the single point of contact for clients.”* Netflix's edge does the same job and calls itself *“an L7 application gateway that provides capabilities for dynamic routing, monitoring, resiliency, security”*. Both descriptions are careful to say what the thing is — a door — rather than what it makes possible.",
        },
        {
          kind: "concept",
          title: "The decision it makes, and the information it uses",
          body: "A balancer picks one target per request. AWS exposes two algorithms and makes the choice explicit: *“The default routing algorithm is round robin; alternatively, you can specify the least outstanding requests routing algorithm.”*\n\n**Round robin** is a counter: 1, 2, 3, 4, 1. It is right when requests cost the same — a single slow endpoint handed a tenth of the traffic becomes the whole system's p95.\n\n**Least outstanding requests** asks how many requests each target is currently serving and picks the least loaded. It costs a shared counter per target, and it fixes exactly the case round robin creates — requests that are not uniform.\n\nThe last component stops the design from being a mistake: *“It monitors the health of its registered targets, and routes traffic only to the healthy targets.”* A balancer without health checks is a traffic distributor with no opinion about whether the far end works.",
        },
        {
          kind: "concept",
          title: "The balancer is a box too",
          body: "This is the part that design reviews skip. In this module's model a load balancer's capacity is **20,000 requests per second** — generous, and finite. Ten app instances at 2,000 each add up to exactly 20,000, so the moment you build a fleet big enough to need eleven, the door is the bottleneck and every instance behind it is idle.\n\nMeasured here: at 4,000 r/s the balancer sits at 20% while the app tier sits at 50%. It is nowhere near its limit — and it will be the limit long before the database is.\n\nReal systems answer this by making the door plural: DNS returns several balancer addresses, anycast routes a member to the nearest one, and the balancer fleet is itself an autoscaled group. The lesson generalises past this canvas — **every tier has a ceiling, and the tier you added to remove a ceiling becomes the next one.**",
        },
        {
          kind: "concept",
          title: "A proxy is not a balancer",
          body: "Both terminate the connection and both forward it, which is why the two words are used interchangeably in conversation and should not be in an interview.\n\nA **reverse proxy** forwards to an upstream it was configured with. It hides the backend, terminates TLS, caches and compresses — one destination, chosen when the config was written.\n\nA **load balancer** chooses from a *pool* it is continuously checking, and the pool changes without a deploy.\n\nThe distinction is not academic: it decides whether adding an instance requires a config change and a reload, and whether a dead instance keeps receiving traffic until somebody notices.",
        },
        {
          kind: "concept",
          title: "In the path, or out of it",
          body: "Netflix runs both patterns, and their READMEs describe them without saying so. Zuul is **in the path**: the request reaches Zuul, Zuul picks a target, and every hop costs a proxy. Eureka is **outside it**: *“a RESTful service … for the purpose of discovery, load balancing and failover of middle-tier servers”* — a registry that hands out addresses, after which the caller connects directly.\n\n| | In the path (Zuul, ALB) | Out of the path (Eureka) |\n| --- | --- | --- |\n| Extra network hop | one per request | none |\n| Where the rules live | one place, all clients | every client |\n| Can it route around a dead box | yes, instantly | yes, once the registry notices |\n| Language support | anything that speaks HTTP | needs a client library |\n\nThe trade is a hop against a shared implementation. One client gets more from a proxy; dozens of services in four languages end up building the registry.",
        },
        {
          kind: "diagram",
          caption:
            "One address, four instances: the balancer sits at 20% while the app tier does the work",
          graph: scaledGraph,
        },
        {
          kind: "video",
          videoId: "WxNLwivRCR0",
          title:
            "System Design Basics in Bangla | Forward Proxy vs Reverse Proxy Explained",
          caption:
            "Watch this for the proxy half of the distinction above — then be able to say, in one sentence, what a balancer has that a reverse proxy does not.",
        },
        {
          kind: "your_turn",
          prompt:
            "You have ten app instances of 2,000 r/s each and one balancer of 20,000. Traffic grows by 20% a month. Work out which tier fails first and in which month, then name the cheapest change that buys the most months.",
        },
        {
          kind: "compare",
          body: "A beginner adds a balancer to “make it faster” and expects the p95 to drop. An engineer adds one because a fleet needs a single address and a health check, and then asks what the balancer's own ceiling is.\n\nThe trap is a design that scales the tier behind the door and forgets the door. In this model that is arithmetic you can do in your head; in a real system it is a ticket that says “we added servers and nothing improved”.",
        },
        {
          kind: "recap",
          points: [
            "A balancer is the single point of contact: one address, many targets",
            "Round robin is a counter; least outstanding requests is a measurement",
            "Health checks are what make the pool safe to change",
            "A proxy forwards to a configured upstream; a balancer chooses from a checked pool",
            "Zuul is in the path, Eureka is out of it — a hop against a shared client library",
            "The balancer has its own ceiling: 20,000 r/s here, which is ten app instances",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "autoscaling",
      title: "How many instances?",
      attribution:
        "Synthesised from the Kubernetes Horizontal Pod Autoscaler documentation (algorithm, tolerance and stabilisation window) and the AWS Application Load Balancer introduction on target registration. All capacity figures are this module's teaching model.",
      sources: [
        {
          label: "Kubernetes — Horizontal Pod Autoscaling",
          url: "https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/",
        },
        {
          label: "AWS — Application Load Balancer introduction",
          url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The number that is right for one hour",
          body: "Four instances is the right answer at 8 p.m. and four times too many at 4 a.m. Picking a number by hand means either paying for capacity nobody uses or paging somebody when the graph bends — and the graph always bends at the worst moment, because that is when the traffic is.\n\nThe number is not a constant. It is the output of a loop, and the loop is small enough to write down.",
        },
        {
          kind: "concept",
          title: "The loop, in one formula",
          body: "Kubernetes states it plainly: *“the HorizontalPodAutoscaler automatically updates a workload resource … with the aim of automatically scaling capacity to match demand.”* The controller runs on an interval (default 15 seconds) and computes:\n\n```\ndesiredReplicas = ceil( currentReplicas × currentMetricValue ÷ desiredMetricValue )\n```\n\nWork the module's numbers through it. Two instances at 4,000 requests per second are each at 100% of their 2,000 capacity. Target 70%:\n\n```\nceil( 2 × 100 ÷ 70 ) = ceil(2.86) = 3 instances\n```\n\nThree instances give 6,000 of capacity for 4,000 of load — 67%, just under target. The formula did not need to know what a request is; it only needed a ratio and a ceiling function.",
        },
        {
          kind: "concept",
          title: "Why the target is not 100%",
          body: "A target of 100% is a target of shedding. A request that arrives while every instance is exactly at capacity is refused, so the loop must aim below the ceiling by enough to cover the gap between “the metric changed” and “a new instance is serving”.\n\nAt 70%, 4,000 requests per second needs 5,714 of capacity — three instances, with 2,000 of spare. That spare is the time budget: while utilisation walks from 67% to the moment the loop notices, the fleet has headroom to absorb it. Set the target at 95% and the same loop has 300 requests per second of slack, which is a busy minute, not a lead time.\n\nThe honest way to pick the number is to ask how long an instance takes to become useful — image pull, JIT warm-up, cache fill — and what the traffic can grow by in that window. The target is that answer expressed as a percentage.",
        },
        {
          kind: "concept",
          title: "Two failure modes: thrashing and being late",
          body: "**Thrashing.** The loop adds an instance, utilisation drops below target, the loop removes it, utilisation climbs, the loop adds it back. Kubernetes damps this three ways: a tolerance (*“the control plane skips any scaling action if the ratio is sufficiently close to 1.0 (within a configurable tolerance, 0.1 by default)”*), a stabilisation window, and separate scale-up and scale-down behaviour.\n\nThe defaults are asymmetric on purpose: upscale has **no** stabilisation window, downscale defaults to **300 seconds**. Scale up immediately, scale down slowly. The cost of being one instance too big for five minutes is a few cents; the cost of being one too small is an outage.\n\n**Being late.** Every autoscaler reacts. If the metric is utilisation, the trigger is already a saturated fleet; if it is a queue depth or a request rate, you can act before anyone is affected. That is the whole argument for scaling on a leading indicator rather than on the symptom.",
        },
        {
          kind: "concept",
          title: "Scaling the app tier does not scale the store",
          body: "Here is the number that ends the module. At 4,000 requests per second with four instances, the app tier sits at 50% — comfortable — and the database sits at **80%**, because every one of those requests still ends there.\n\nAdd eight instances and the app tier drops to 25%. The database does not move. It cannot: replicas multiply the capacity of the tier you scaled, and the store is not that tier.\n\nThat is why autoscaling an app fleet is a complete answer only while the next tier has headroom, and why the module after this one exists. The loop is a good tool with a narrow domain: it buys you time in the tier it watches, and it will happily hold the store at 100% while reporting a healthy green graph for everything it manages.",
        },
        {
          kind: "video",
          videoId: "UQ67LJJkhg8",
          title: "System Design Basics in Bangla | Cloud Computing Explained",
          caption:
            "Background rather than a walkthrough: the managed services that make an autoscaling group a checkbox instead of a project.",
        },
        {
          kind: "your_turn",
          prompt:
            "Five instances are at 90% with a 70% target and a tolerance of 0.1. Compute what the loop does, then say what changes if the metric is request rate instead of utilisation and the traffic doubles in ninety seconds.",
        },
        {
          kind: "compare",
          body: "A beginner sets the autoscaler's target to 90% to “use the hardware”. An engineer sets it to whatever leaves enough time for an instance to become useful, and then checks what the largest tier below it is doing.\n\nThe trap is trusting the graph the autoscaler draws. It reports on the tier it controls, so a fleet at 40% behind a store at 130% is a green dashboard attached to a failing system. Autoscaling is a control loop, not an architecture — it moves the number, it does not remove the wall.",
        },
        {
          kind: "recap",
          points: [
            "Capacity is the output of a loop, not a number somebody picks",
            "desired = ceil(current × currentMetric ÷ targetMetric) — 2 × 100 ÷ 70 is three instances",
            "A 100% target is a target of shedding; the gap to 100% is the time budget",
            "Default behaviour is deliberate: upscale at once, downscale after five minutes",
            "Tolerance and stabilisation exist because a loop that over-reacts is worse than a static fleet",
            "Scaling the app tier leaves the store exactly where it was — 80% here",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "sessions-without-sticky",
      title: "Sessions without sticky",
      attribution:
        "Built on the Twelve-Factor App's chapter on processes, which states the sticky-session position this lesson argues from, and the arithmetic of this module's four-instance model.",
      sources: [
        {
          label: "The Twelve-Factor App — VI. Processes (sticky sessions)",
          url: "https://12factor.net/processes",
        },
        {
          label: "AWS — sticky sessions for an Application Load Balancer",
          url: "https://docs.aws.amazon.com/elasticloadbalancing/latest/application/sticky-sessions.html",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The member who keeps logging out",
          body: "Login works. The next page works. The page after that asks them to log in again, at random, and support cannot reproduce it because support is one person hitting one server.\n\nThe cause is one line of code: the session was stored in a `Map` in the application process. Four instances means four `Map`s, the balancer picks one per request, and three of the four have never heard of this member.",
        },
        {
          kind: "concept",
          title: "The arithmetic that settles it",
          body: "With four interchangeable instances, the chance the instance that served the last request serves the next one is 1/4. So a session in local memory survives to the next request **one time in four** — and fails three times in four.\n\nA page load is not one request. At ten requests per visit:\n\n```\nP(all ten land on the same instance) = (1/4)^9 ≈ 3.8 × 10⁻⁶\n```\n\nFour in a million. No retry logic makes that work, and no test reliably reproduces it — which is why this bug reaches production as “intermittent” and stays for weeks.\n\nAt two instances it is (1/2)^9 ≈ 0.2% — also fatal, also called intermittent. The point is not the probability; the point is that it is never zero.",
        },
        {
          kind: "concept",
          title: "Sticky sessions make it work, and everything else worse",
          body: "The obvious fix is to route a member to the same instance every time, by cookie. It works, and the Twelve-Factor App is blunt about it: *“Some web systems rely on ‘sticky sessions’ … Sticky sessions are a violation of twelve-factor and should never be used or relied upon.”*\n\nThree reasons, all operational:\n\n- **The instance dies and the session dies with it.** Health checks route traffic away and every member on that instance is logged out, at once.\n- **A deploy logs everyone out.** Rolling updates replace instances; a session pinned to a replaced instance is gone. That converts your best safety practice into a scheduled outage.\n- **The fleet stops being uniform.** A member with a long session pins capacity, so the balancer cannot balance and the autoscaler cannot remove their instance — the two features you built this module for stop working.\n\nSticky sessions also cannot survive autoscaling: you cannot scale down an instance that is somebody's memory.",
        },
        {
          kind: "concept",
          title: "Three places the session can live",
          body: "**A shared store.** Redis, memcached, EVCache. The Twelve-Factor App names this directly: session state *“is a good candidate for a datastore that offers time-expiration, such as Memcached or Redis.”* One copy, one expiry policy, every instance reads it. Cost: a network hop (0.2 ms here) and one more tier that must be up.\n\n**A signed token.** The session becomes a value the client carries, verified by a shared key, so there is no read at all. Cost: revocation. You cannot un-issue a token, so “log out everywhere” needs a denylist — which is a shared store again, just smaller.\n\n**The database.** Correct, durable, and on the critical path of every request. It works at small scale and becomes the reason you cannot scale.\n\n| Where | Cost per request | Revocable | Survives a deploy |\n| --- | --- | --- | --- |\n| Process memory | ~0 | only that instance | no |\n| Shared store | one hop | yes, delete the key | yes |\n| Signed token | none | only via a denylist | yes |\n| Database | a query | yes | yes |",
        },
        {
          kind: "concept",
          title: "“Log out from all devices” is the test",
          body: "It is the feature that exposes which of the three you actually built. A pure token design logs out the current device by dropping the token; the other four keep working, because nothing server-side knows they exist. To stop them you need a record of the member's live sessions — keyed by member, with an expiry — and that record is a shared store regardless of what the token looks like.\n\nSo the honest design is both: a token for the fast path, and a small, short-lived revocation list for the rare, deliberate action. The lesson is not “tokens are better”. It is that **state does not disappear when you move it; it moves**, and the question is only which tier now remembers.",
        },
        {
          kind: "video",
          videoId: "tOm35rmGrfg",
          title:
            'How "Logout from All Devices" Actually Works | Backend System Design in Bangla',
          caption:
            "The feature that makes a session store unavoidable, walked through end to end.",
        },
        {
          kind: "your_turn",
          prompt:
            "A member performs 12 requests per visit against 6 instances. Compute the probability that all 12 land on the same instance, then design “log out from all devices” for a token-based system and say where the revocation list lives and how long an entry stays.",
        },
        {
          kind: "compare",
          body: "A beginner stores the session in memory, sees it work on their laptop, and ships. An engineer assumes every request arrives at a different instance — because at four instances, three times in four it does — and designs as if the instance that handled the last request no longer exists.\n\nThe trap is choosing sticky sessions because they are one configuration flag. They are a flag that turns off autoscaling, turns a deploy into a logout, and concentrates a failure onto the members least likely to forgive it: the ones who have been there longest.",
        },
        {
          kind: "recap",
          points: [
            "A session in process memory survives to the next request 1 time in 4 at four instances",
            "Sticky sessions work and break deploys, autoscaling and even balancing",
            "Session state belongs in a shared store, a signed token, or — worst — the database",
            "Tokens remove the read, not the state: revocation still needs a small store",
            "State does not disappear when you move it; something else starts remembering",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "stateless-services",
      title: "What stateless actually means",
      attribution:
        "Built on the Twelve-Factor App's process chapter and Netflix's Eureka README, with the cost figures taken from this module's node model.",
      sources: [
        {
          label: "The Twelve-Factor App — VI. Processes",
          url: "https://12factor.net/processes",
        },
        {
          label: "Netflix Eureka — discovery, load balancing and failover",
          url: "https://github.com/Netflix/eureka",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Replaceable is the property",
          body: "Everything so far has been about adding capacity. This lesson is about the property that decides whether adding capacity is safe: can you destroy any single instance, at any moment, without a member noticing?\n\nThe Twelve-Factor App states the rule and then states the consequence: *“Twelve-factor processes are stateless and share-nothing. Any data that needs to persist must be stored in a stateful backing service, typically a database.”*",
        },
        {
          kind: "concept",
          title: "The test: can I kill this instance right now?",
          body: "Not “is there state in the app” — there is always state — but “is there state here that only this instance has”.\n\nApply it to a deploy. Twelve-Factor's argument is a single paragraph about restarts: *“… a restart (triggered by code deploy, config change, or the execution environment relocating the process to a different physical location) will usually wipe out all local (e.g. memory and filesystem) state.”*\n\nSo the question is not hypothetical. Every instance will be restarted, by you or by the platform, and everything it was holding in memory goes with it. A stateless design is one where that sentence is boring.",
        },
        {
          kind: "concept",
          title: "Stateless does not mean there is no state",
          body: "It means the state lives somewhere that survives an instance, and the app is a pure function of (request, backing services).\n\nThe move is always the same: name the state, move it to the tier that owns it, and accept a hop. A watch position becomes a row. A cart becomes a row keyed by member. A thumbnail becomes an object in a store.\n\nThe canvas makes the cost visible: every request once answered from local memory now crosses a hop. A cache read is 0.2 ms here, a database read 2 ms — cheap, and not free. Twelve-Factor is careful about this too: *“The memory space or filesystem of the process can be used as a brief, single-transaction cache.”* Brief, and single-transaction. Not across requests, and not across instances.",
        },
        {
          kind: "concept",
          title: "Why statelessness is what makes a registry possible",
          body: "Netflix's Eureka README describes its job as *“discovery, load balancing and failover of middle-tier servers”*. That sentence only makes sense if the servers are interchangeable: a registry can hand out any address because any address can serve any request, and a failed health check removes an address without anything being lost.\n\nIn a stateful fleet the registry is impossible — the address is not interchangeable, because that instance holds a member's session. You cannot fail it over, scale it down, or roll it. The registry is not an add-on you install; it is a reward for having made instances replaceable.\n\nThis is also why the ordering in this module is deliberate: door first, number second, statelessness last. Each step is only safe because the next one makes it safe — and statelessness is the one that turns the other two from risky into routine.",
        },
        {
          kind: "concept",
          title: "The three bills, stated plainly",
          body: "**A hop per request.** 0.2 ms here, and it applies to every request rather than the rare one. Cache it locally and you have reintroduced the state you removed, with a shorter failure window — worse, because it fails rarely enough to look like a hardware problem.\n\n**A tier that is now load-bearing.** The shared store is on the critical path of every request, and needs what a database gets: redundancy, monitoring, and an answer for when it is down. That is where module 7 opens.\n\n**Discipline that decays.** Nothing in a stateless design fails loudly when somebody adds a `static Map` for “just this one thing”. The next deploy logs out one instance's worth of members, and the review that would have caught it happened months earlier.",
        },
        {
          kind: "concept",
          title: "What it buys, in one measurement",
          body: "A deploy becomes an operation you can run at noon: instances are replaced one at a time, the balancer routes around each as its health check fails, and the fleet never drops below the autoscaler's minimum.\n\nWithout statelessness the same operation is a scheduled outage, and that is the real cost: not the outage you have, but the release you postpone for three weeks because shipping is dangerous.\n\nThat is the trade this module has been building toward. A door and a number give you capacity. Statelessness gives you the ability to use it, repeatedly, at any time of day.",
        },
        {
          kind: "your_turn",
          prompt:
            "Take a service you have written and list every piece of state it holds between requests. For each, name the tier it would move to, the extra latency that costs, and what breaks the first time that tier is unavailable.",
        },
        {
          kind: "compare",
          body: "A beginner reads “stateless” as “the app has no state” and concludes it is impossible, because their app clearly has state. An engineer reads it as “nothing survives on this instance that a member needs”, moves the state to an owner, and budgets the hop.\n\nThe trap is the local cache added later for performance. It is the same bug as a session in memory, only slower to appear: it works for months, survives every review, and then one instance restarts mid-request and the member sees a value that does not exist. If you add one, add a metric that says how often it is wrong.",
        },
        {
          kind: "recap",
          points: [
            "The test is whether you can destroy an instance right now and hear nothing",
            "Stateless means the state moved, not that it vanished",
            "Every instance gets restarted eventually, by you or by the platform",
            "Eureka's registry only works because any address can serve any request",
            "The bills: a hop per request, a new load-bearing tier, and decay",
            "The real payoff is being able to deploy at noon — capacity you can use",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "One app server is at capacity. Walk me from “buy a bigger box” to a fleet you can deploy to at noon.",
    strongAnswer:
      "First the numbers: 4,000 requests per second against 2,000 of capacity per instance is 200%, so half the traffic is being shed — that is a capacity problem, not a latency one. Vertical scaling buys one doubling and costs downtime to apply, so at some point I scale out. Out means three things, in order. One address: a load balancer in front, round robin or least outstanding requests, with health checks, and I have to size the balancer too because it is one box with its own ceiling. One number: the replica count comes from a control loop — desired equals ceil of current times current metric over target — with a target below 100% because the gap is the time budget for a new instance to warm, and with a stabilisation window so it does not flap. And one promise: no instance may remember a member, because at four instances a session in local memory survives to the next request one time in four and a ten-request page load lands on one instance about four times in a million. So sessions go to a shared store or a signed token, with a revocation list for log-out-everywhere. That last property is what makes a service registry and an autoscaler possible at all — if the instance is holding a member, you cannot replace it.",
    trap: "Saying “add a load balancer” without saying what breaks when one instance dies, and forgetting that the balancer itself has a capacity limit — in this model 20,000 r/s, which is only ten app instances. The second trap is choosing sticky sessions to avoid moving session state: it makes a deploy log everyone out and stops the autoscaler from ever removing an instance.",
  },
  task: {
    brief:
      "The monolith is at 200% and shedding half of everything: 4,000 requests per second at peak, and one app process that serves 2,000. Put one address in front of a fleet and give the app tier enough headroom to survive a busy minute. The store will end up near its own ceiling — that is the next module, not this task.",
    startGraph: monolithGraph,
    solutionGraph: scaledGraph,
    steps: [
      {
        id: "add-lb",
        title: "Put one address in front",
        brief:
          "Members must reach the app tier through a single address, not by connecting to the process directly.",
        hint: "Look in the Traffic category of the palette.",
        reveal:
          "Add a Load balancer between the client and the app tier, and remove the direct client → app edge.",
        check: (g) => {
          const lbs = g.nodes.filter((n) => n.type === "load_balancer");
          if (lbs.length === 0) {
            return { passed: false, progress: "Add a load balancer" };
          }
          const lbIds = new Set(lbs.map((n) => n.id));
          const direct = g.edges.some(
            (e) =>
              g.nodes.some((n) => n.id === e.from && n.type === "client") &&
              g.nodes.some((n) => n.id === e.to && n.type === "app_server"),
          );
          if (direct) {
            return {
              passed: false,
              progress:
                "Clients still reach an app server directly — remove that edge",
            };
          }
          const routes = g.edges.some(
            (e) =>
              lbIds.has(e.from) &&
              g.nodes.some((n) => n.id === e.to && n.type === "app_server"),
          );
          return {
            passed: routes,
            progress: routes
              ? "✓ One address, routed to the app tier"
              : "Connect the balancer to the app tier",
          };
        },
      },
      {
        id: "scale-out",
        title: "Scale the app tier out",
        brief:
          "One process is not enough. Add instances — the canvas models them as `replicas` on the app node.",
        hint: "Select the app server and raise its replica count. Two is not enough.",
        reveal:
          "Three replicas give 6,000 of capacity for 4,000 of load — 67%. Four give 50%, which is where the reference design sits.",
        check: (g) => {
          const apps = g.nodes.filter((n) => n.type === "app_server");
          if (apps.length === 0) {
            return { passed: false, progress: "Add an app server" };
          }
          const capacity = apps.reduce(
            (sum, node) => sum + node.replicas * 2_000,
            0,
          );
          const enough = capacity > 4_000;
          return {
            passed: enough,
            progress: enough
              ? `✓ ${capacity.toLocaleString()} r/s of app capacity for 4,000 offered`
              : `${capacity.toLocaleString()} r/s of app capacity is not more than the 4,000 offered`,
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "zero-errors",
        label: "Error rate = 0% at 4,000 requests per second",
        required: true,
        explain:
          "The monolith sheds 50% of this load. The previous version of this task asked for 20,000 r/s behind a single 20,000 r/s balancer and checked nothing but structural validity — it passed while 90% of traffic was turned away.",
        assert: (r) => r.valid && r.errorRate === 0,
      },
      {
        id: "app-headroom",
        label: "App tier utilisation < 70%",
        required: true,
        explain:
          "Two replicas give exactly 4,000 of capacity for 4,000 of load — 100%, no headroom, and the next request fails. The threshold forces a third instance, which is the difference between sizing for the average and sizing for the peak.",
        assert: (r) => {
          const app = r.perNode.find((n) => n.id === "app-1");
          return !!app && app.utilisation < 0.7;
        },
      },
      {
        id: "edge-headroom",
        label: "Balancer utilisation < 50%",
        required: true,
        explain:
          "The balancer is a box with a ceiling of its own — 20,000 r/s here, which is only ten app instances. At 4,000 it should sit at 20%. If it reads higher, the load is not what the graph says it is.",
        assert: (r) => {
          const lb = r.perNode.find((n) => n.id === "lb-1");
          return !!lb && lb.utilisation < 0.5;
        },
      },
    ],
  },
  recap: [
    "Vertical adds capacity to a box that has a ceiling; horizontal adds boxes and a coordination problem",
    "4,000 against 2,000 is 200% and 50% shed; 70% utilisation needs three instances",
    "A balancer is one address, a choice per request, and a health check per target",
    "The balancer is a box too: 20,000 r/s here, which is ten app instances",
    "Zuul is in the path, Eureka is out of it — a hop against a shared client library",
    "Replica count is a control loop: ceil(current × current ÷ target), aimed below 100%",
    "A session in local memory survives to the next request 1 time in 4",
    "Stateless means the state moved, and it is what makes a fleet replaceable",
  ],
  attribution:
    "Synthesised from Netflix's Zuul and Eureka READMEs, Netflix's account of completing its cloud migration, the Twelve-Factor App's chapter on processes, the AWS Application Load Balancer documentation, the Kubernetes Horizontal Pod Autoscaler documentation and the system-design-primer's scalability and load-balancing sections. Sources are linked per lesson; the capacity figures (2,000 r/s per instance, 20,000 per balancer, 5,000 per store) are this module's teaching model, and the measured error rates come from its canvas.",
};

export default module;
