import type { SdEdge, SdGraph, SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
import task from "./chaos-capstone.task";

/**
 * Module 15 — the chaos capstone, converted in slice B7 (plan 17).
 *
 * **Netflix anchor.** Chaos Monkey is the tool that made failure a design input
 * rather than an incident: `github.com/Netflix/chaosmonkey` describes a service
 * that terminates instances in production at random, on purpose, on a schedule.
 * The reasoning behind it is the module's thesis — a system whose survival
 * assumes no instance ever dies is a system with an untested assumption in the
 * most expensive possible place. Chaos Kong, one level up, does the same to a
 * whole region.
 *
 * **The task.** This is the capstone, so it uses every tier the path has
 * taught and asks one question: can the design survive being degraded? At
 * 12,000 requests a second with 5 app instances, no read replicas and an edge
 * cache that misses everything, the start graph sheds 16.7% of traffic, runs
 * the API at 120%, the store at 100.1% and the origin at 49.9%. The solution —
 * 10 app instances, 2 read replicas, a 95% edge hit rate — serves all 12,000
 * with the API at 60%, the store at 40% and the origin at 3%, and still serves
 * all 12,000 when both compute tiers are degraded to two thirds (90% and 60%).
 *
 * **Why the acceptance test is degradation, not instance death.** `replicas` is
 * a capacity multiplier in this model, so a `node_down` on `app-1` removes the
 * node and every replica with it: measured, that is 100% unreachable, which
 * grades nothing. `degraded` multiplies capacity and is the only dimension the
 * engine has for "a third of this tier is gone", so that is what the tests
 * assert — and they assert the `node_down` blindness alongside it, so a later
 * engine slice fails the suite instead of quietly invalidating the lesson.
 *
 * **A second terminal reroutes, it does not fail.** With both `origin-1` and
 * `db-1` as terminals, taking `cdn-1` down sends its traffic to the surviving
 * path: measured, 0% errors and the store at 80%. That is not a modelling bug —
 * a reroute is a real behaviour — but it means "take the CDN away" cannot be
 * graded as a failure scenario here, so this module does not pretend to.
 *
 * **Chain note.** `check:system-design` warns that this `startGraph` drops the
 * `cache`, `queue` and `worker` nodes module 14's solution carried. Intentional
 * and answered here: the capstone is the playback path, not the upload path,
 * and carrying a queue with no traffic through it would make the canvas read as
 * though the uploader were part of serving a viewer. Three nodes out of eight
 * is the smallest honest canvas that still contains every tier the reliability
 * part taught.
 *
 * **Video note.** `Pfr_6h3Rqew` is the same walkthrough module 12 opened with,
 * reused deliberately as the capstone's summary; the caption says so rather
 * than duplicating it silently.
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

function playbackGraph(
  appReplicas: number,
  readReplicas: number,
  cdnHitRate: number,
): SdGraph {
  return {
    nodes: [
      { ...defaultNode("client", "client-1", 40, 200), label: "Viewers" },
      { ...defaultNode("load_balancer", "lb-1", 200, 200), label: "Edge" },
      {
        ...defaultNode("app_server", "app-1", 380, 200),
        label: "Playback API",
        replicas: appReplicas,
      },
      {
        ...defaultNode("cdn", "cdn-1", 560, 120),
        label: "Open Connect",
        hitRate: cdnHitRate,
      },
      {
        ...defaultNode("object_store", "origin-1", 740, 120),
        label: "Video store",
      },
      {
        ...defaultNode("database", "db-1", 560, 300),
        label: "Playback store",
        readReplicas,
      },
    ],
    edges: [
      wire("e1", "client-1", "lb-1"),
      wire("e2", "lb-1", "app-1"),
      wire("e3", "app-1", "cdn-1", "media"),
      wire("e4", "cdn-1", "origin-1", "misses"),
      wire("e5", "app-1", "db-1", "metadata"),
    ],
    scenario: {
      arrivalRate: 12_000,
      writeShare: 0.15,
      mediaShare: 0.6,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  };
}

const taskStartGraph = playbackGraph(5, 0, 0);
const taskSolutionGraph = playbackGraph(10, 2, 0.95);

/** The same design at 1,000 r/s — the load a rehearsal at the wrong size uses. */
const conceptGraph = (() => {
  const graph = playbackGraph(5, 0, 0);
  graph.scenario = { ...graph.scenario, arrivalRate: 1_000 };
  return graph;
})();

const module: SdModule = {
  slug: "chaos-capstone",
  order: 15,
  part: 3,
  partTitle: "Reliability",
  kind: "sim",
  title: "Chaos Capstone: Survive the Loss",
  description:
    "One design, every tier, and a deliberate loss. Size the playback path so a third of it can disappear, cache at the edge so the origin never sees the load, and write the postmortem that makes the next rehearsal cheaper than the next outage.",
  story:
    "Chaos Monkey exists because nobody trusts a system that has only ever been observed while healthy. The playback path is now as complete as this path will make it: an edge, an API tier, a CDN with an origin behind it, and a store with replicas. Twelve thousand requests a second arrive, and the question is not whether any single piece works — every piece works — but whether the design still serves when two thirds of a tier is what remains. We will break it on purpose, measure what is left, and then write down what we learned in the form that makes the next engineer's decision cheaper.",
  chapters: [
    {
      slug: "failure-as-a-practice",
      title: "Failure as a practice",
      description:
        "An untested assumption about failure is a guess with a production deployment.",
      children: [
        {
          slug: "chaos-chapter",
          title: "Chaos, deliberately",
          description:
            "Experiment, steady state, blast radius — the shape of a rehearsal.",
          lessonSlug: "chaos-as-practice",
        },
      ],
    },
    {
      slug: "the-whole-design",
      title: "The whole design",
      description:
        "Every tier sized for a loss, and an honest accounting of what the canvas cannot show.",
      children: [
        {
          slug: "surviving-chapter",
          title: "Surviving the loss",
          description:
            "Headroom on each tier, a cache at the edge, and the failures that reroute instead of failing.",
          lessonSlug: "surviving-everything",
        },
      ],
    },
    {
      slug: "learning-from-it",
      title: "Learning from it",
      description:
        "The artifact that turns one incident into a permanent improvement.",
      children: [
        {
          slug: "postmortem-chapter",
          title: "Postmortems",
          description:
            "Timeline, contributing factors, action items — and no names.",
          lessonSlug: "postmortems-without-blame",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "chaos-as-practice",
      title: "Break it on purpose",
      attribution:
        "Synthesised from Netflix's Chaos Monkey and Simian Army projects, and the AWS Builders' Library on static stability using availability zones.",
      sources: [
        {
          label: "Netflix — Chaos Monkey",
          url: "https://github.com/Netflix/chaosmonkey",
        },
        {
          label:
            "AWS Builders' Library — static stability using availability zones",
          url: "https://aws.amazon.com/builders-library/static-stability-using-availability-zones/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The design that has only ever been seen healthy",
          body: "The playback path is complete: an edge balancer, a Playback API tier, an edge cache with an origin behind it, and a store. Twelve thousand requests a second arrive, every dashboard is green, and nobody has ever observed what happens when a piece of it goes away.\n\nThat is the position every design is in on the day it launches, and it is a position of ignorance rather than safety. The design's failure behaviour exists whether or not anyone has looked at it — the only question is whether the first observation happens in a rehearsal or in an incident. Measured on this canvas with the design as it stands: five API instances against 12,000 requests a second run at 120% of their capacity, the store at 100.1%, and 16.7% of all traffic is shed while every individual component is doing exactly what it was configured to do.",
        },
        {
          kind: "concept",
          title: "A rehearsal needs a steady state, not a hope",
          body: "Chaos engineering is an experiment, and an experiment needs a hypothesis with a measurable answer: *the system serves 12,000 requests a second with zero shed while one tier is degraded*. State it before touching anything, because without it a rehearsal has no pass condition and every outcome can be called a success.\n\nThe steady state is deliberately about what users experience, not about the internals. A CPU number going up is not a violation; requests being shed is. Choosing user-visible metrics as the hypothesis is what prevents the most common failure of these exercises — running them, seeing the graphs move, and concluding something useful happened.",
        },
        {
          kind: "concept",
          title: "Small, then bigger, then the one you fear",
          body: "Netflix's tools form a ladder of blast radius: Chaos Monkey terminates instances at random in production, Chaos Gorilla removes a whole availability zone, Chaos Kong removes a whole region. Each rung asks the same question at a different size, and the order matters because the small failure teaches you whether the instrumentation and the runbook work before the big one tests the architecture.\n\nThe ladder also keeps the exercise honest about cost. An instance loss should be a non-event — if it pages someone, the design has no headroom and the larger experiments should wait. A zone loss should be survivable with the surviving capacity, which is the arithmetic this module's task measures. A region loss is a business decision about how much redundancy you are willing to pay for continuously, and it should be written down as one rather than discovered as a surprise.",
        },
        {
          kind: "concept",
          title: "Inject the failure where the system can learn from it",
          body: "There are three ways to find out how a design behaves under loss, and they differ in who pays. Read the diagram and reason about it: free, and wrong surprisingly often, because the interaction between two tiers is not visible in either. Wait for production: accurate, and paid for by users. Or inject the failure deliberately, in a controlled window, with the hypothesis written down: accurate, and paid for by an engineering team that chose the time.\n\nThe third option is the only one that produces both knowledge and confidence. It also has a side benefit that is easy to underestimate: the rehearsal exercises the *people*, not just the machines. The runbook, the dashboards, the alert routing and the question of who is allowed to make the call all get tested, and all of them fail in ways no architecture review would reveal.",
        },
        {
          kind: "concept",
          title: "Rehearse at the load you actually run",
          body: "An experiment at 1,000 requests a second is not an experiment on a system that serves 12,000. On this canvas the start graph at 1,000 has the API at 10%, the store at 10.2% and the origin at 4.9%: every tier looks comfortable, every degradation is absorbable, and the rehearsal produces a reassuring result that says nothing about production.\n\nThe headroom question only has an answer at the real load, and the answer changes completely — 10% becomes 120% at twelve times the traffic, because capacity is fixed and load is not. This is the single most common way a chaos exercise is worse than none: it certifies a system at a size it never runs at, and the certificate is what people remember when the incident happens.",
        },
        {
          kind: "diagram",
          caption:
            "The same design at 1,000 r/s: the API at 10%, the store at 10.2%, the origin at 4.9%. Comfortable, and the reason a rehearsal at this load proves nothing about 12,000",
          graph: conceptGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "Write the steady-state hypothesis for a system you know, at the load it actually serves. Then name the smallest failure you could inject this week that would tell you something you do not already know.",
        },
        {
          kind: "compare",
          body: "A beginner tests the failure behaviour by waiting for it, which means the first experiment is a real outage with real users and no hypothesis. A senior engineer writes the hypothesis, injects the smallest failure that could falsify it, and learns while the window is chosen.\n\nThe trap is rehearsing at a comfortable load. Every tier passes at a fraction of production traffic, the report says the system is resilient, and the number that would have failed — the real one — was never tried.",
        },
        {
          kind: "video",
          videoId: "Pfr_6h3Rqew",
          title:
            "System Design Basics in Bangla | Scalability + Availability + Consistency + Fault Tolerance Explained",
          caption:
            "The same walkthrough that opened this part, deliberately reused as the capstone's summary of fault tolerance.",
        },
        {
          kind: "recap",
          points: [
            "An unrehearsed failure behaviour is a guess with a production deployment",
            "State the steady state first, in numbers users can feel",
            "Small failures first: instance, then zone, then the one you are afraid of",
            "Rehearse at the real load — 10% at 1,000 r/s becomes 120% at 12,000",
            "Measured here: the unrehearsed design sheds 16.7% while every dashboard is green",
          ],
        },
      ],
    },
    {
      slug: "surviving-everything",
      title: "Every tier, sized for the loss",
      attribution:
        "Synthesised from the AWS Builders' Library on static stability and avoiding fallback, and Google's SRE Book chapter on addressing cascading failures.",
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
        {
          label:
            "AWS Builders' Library — avoiding fallback in distributed systems",
          url: "https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Three ceilings, one at a time",
          body: "The design has three places it can run out, and each one has to be fixed in order, because fixing the first exposes the second. Ten API instances and no replicas: the API drops to 60%, the store goes to 120%, and 8.4% of traffic is still shed. Add one read replica: the store drops to 60% and nothing is shed — and the origin is now at 60%, which is a ceiling nobody had looked at because the store was louder.\n\nAdd a second replica and the store sits at 40%; the origin is still at 60%. Only when the edge cache starts absorbing its share does the origin fall — to 29.9% at a 50% hit rate, 6% at 90%, and 3% at 95%. Then both compute tiers can be degraded to two thirds and the design still serves all 12,000 with the API at 90% and the store at 60%.",
        },
        {
          kind: "concept",
          title: "Sizing is division, not intuition",
          body: "The rule this module's task enforces is one line of arithmetic: capacity must exceed peak load divided by the fraction of the tier that survives. Lose a third and the fraction is two thirds, so the tier needs 1.5× the peak — and the corresponding headroom line is 66%, because a tier at 66% of capacity is exactly at 99% after losing a third.\n\nThat is why nine API instances fail and ten pass: nine is 18,000 of capacity against 12,000 — 66.7% — and 66.7% degraded to two thirds is 100%, so a tier that was fine a second ago is now shedding. The criterion is that arithmetic, checked when the design is degraded rather than when it is healthy.",
        },
        {
          kind: "concept",
          title: "A cache at the edge is a capacity decision",
          body: "It is tempting to treat the CDN as a latency feature and size it after the tiers that matter. The canvas shows the opposite: the origin is a tier with a ceiling, and whether it is a bottleneck depends entirely on what the cache absorbs. At a 0% hit rate the origin carries half the traffic and sits at 60% with the compute tiers already fixed; at 95% it carries 3%.\n\nThat is a read replica one layer further out: you are not making the origin faster, you are removing requests from it. And the criterion is written at 40% rather than at 66% for exactly this reason — an origin at 66% of its capacity is an origin that cannot absorb the reroute when the cache path is unavailable, which is a measured consequence rather than a precaution.",
        },
        {
          kind: "concept",
          title: "Some failures reroute instead of failing",
          body: "Take the edge cache away in this graph and the result is surprising: zero requests shed, and the store goes to 80%. Traffic that had two paths now has one, and the engine sends all of it down the surviving path. Take the origin away instead and the result is the same kind of number — nothing shed, the store at 40%.\n\nThat is real behaviour, not a modelling accident: a second terminal means a reroute, which is what a fallback does. It is also a reminder that a fallback's capacity is the thing that decides whether the reroute was a save or a second outage. With one read replica in place of two, the same cache failure sends the store to 120% and sheds 16.7% — the reroute happened, and there was nothing there to receive it.",
        },
        {
          kind: "concept",
          title: "What this canvas cannot show, and why the test says so",
          body: "Two limits are worth naming, because each one is a question a reviewer will ask. First, `replicas` is a capacity multiplier, not redundancy: a `node_down` on the API removes the node and every replica with it, which is measured at 100% unreachable. So 'one of thirteen instances died' is not expressible here, and the acceptance test uses `degraded` instead — a capacity factor, which is the honest model of a zone at two thirds of normal.\n\nSecond, the reverse case is equally unflattering: three separate failures — cache down, origin down, store down — all produce zero errors, because each one reroutes. That means this canvas cannot grade 'survives losing the cache' as a failure at all. Both are asserted in the suite, so an engine slice that adds real redundancy or real terminal failure fails it.",
        },
        {
          kind: "diagram",
          caption:
            "The finished design at 12,000 r/s: the API at 60%, the store at 40%, the origin at 3%, and nothing shed — with 90% and 60% after both compute tiers are degraded to two thirds",
          graph: taskSolutionGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "Remove one thing at a time from the canvas — an API instance, a read replica, the edge cache — and predict each number before you run it. Which did you get wrong, and why?",
        },
        {
          kind: "compare",
          body: "A beginner sizes each tier for the load it carries today, which produces a design that is exactly adequate and has no answer to a loss. A senior engineer sizes each tier for peak divided by the survival fraction, then checks what the surviving paths carry after a reroute.\n\nThe trap is fixing tiers in the order they appear on the graph rather than the order they saturate. This design had three ceilings and only one was visible at a time; the store's replica exposed the origin, and the origin's cache exposed nothing, because by then the design had room.",
        },
        {
          kind: "recap",
          points: [
            "Capacity must exceed peak divided by the fraction that survives — 1.5× for a lost third",
            "A tier at 66% is exactly at 100% after losing a third, which is why nine instances fail",
            "The edge cache is a capacity decision: 60% of the origin becomes 3%",
            "A reroute moves the load, so the surviving path needs capacity for all of it",
            "This canvas models degradation, not instance loss — and the suite asserts both limits",
          ],
        },
      ],
    },
    {
      slug: "postmortems-without-blame",
      title: "The postmortem nobody is afraid of",
      attribution:
        "Synthesised from Google's SRE Book chapter on postmortem culture, and the PagerDuty postmortem documentation.",
      sources: [
        {
          label: "SRE Book — postmortem culture: learning from failure",
          url: "https://sre.google/sre-book/postmortem-culture/",
        },
        {
          label: "PagerDuty — postmortem documentation",
          url: "https://postmortems.pagerduty.com/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The dashboard that reported 9.8 ms",
          body: "During the incident the latency dashboard was healthy: p95 at 9.8 milliseconds, better than the week before. Throughput was 9,994 requests a second, which looked close enough to the 12,000 the system was designed for. The number that told the truth was a ratio nobody had put on the wall: 16.7% of requests were never served at all.\n\nThat is the shape of most incidents that get written up badly. The metrics were correct; the question was missing. A latency percentile computed over the requests that completed cannot see the ones that were turned away, and a throughput number without the offered rate beside it cannot tell a busy system from a refusing one. The postmortem's first job is to establish what was actually being measured, because the timeline of a metric that was never taken is a fiction.",
        },
        {
          kind: "concept",
          title: "A timeline, then contributing factors — not a root cause",
          body: "A useful postmortem has a timeline with timestamps: when the first bad request was served, when it was noticed, when someone understood it, when the mitigation went in, when it was over. Those five moments separate detection from diagnosis from response, and the gaps between them are where most of the improvement lives.\n\nThe reason to write *contributing factors* instead of *root cause* is that a single root cause is almost always a story told backwards. This design had three ceilings — the API at 120%, the store at 100.1%, the origin at 49.9% — and none of them was the cause; the cause was a capacity plan that assumed none of them would ever be lost. 'Root cause: the database was slow' ends the investigation one question too early, and the question it skips is the one that generalises.",
        },
        {
          kind: "concept",
          title: "Blamelessness is a data-quality requirement",
          body: "The argument for blameless postmortems is usually made on ethical grounds, and it is sound. The engineering argument is stronger: a postmortem that assigns fault gets a sanitised timeline. The person closest to the action has the most accurate account of it and the most to lose from telling it, so blame selects for the version that protects people rather than the version that is true.\n\nThat matters because the output of a postmortem is a *change*. A timeline that omits 'I ran the command because I had seen it fix this before' produces action items that do not prevent the incident, because the incident was never described. The practical form is simple: name roles and systems in the timeline, not people, and treat every human action as a reasonable response to the information available at that moment.",
        },
        {
          kind: "concept",
          title: "Action items that are code, not intentions",
          body: "Every postmortem produces a short list, and the quality test for each item is whether it can be closed by a diff. 'Improve monitoring' cannot be closed; 'alert when served divided by offered drops below 0.98 for five minutes' can. 'Be more careful with capacity' cannot; 'ready check requires peak ÷ survival fraction × 1.1 on every tier' can.\n\nTwo habits make the list useful. Cap it at three or four items, because a list of fourteen is a list of zero. And split it into *mitigated* (this specific failure cannot recur) and *prevented* (the class of failure is less likely), because the first kind is cheap and the second kind is where the real improvement comes from — the capacity formula in this module, and the degradation test in its suite, are both the second kind.",
        },
        {
          kind: "concept",
          title: "The rehearsal is the last action item",
          body: "The capstone closes where it opened: the way to know whether the action items worked is to inject the failure again, at the real load, with the same steady-state hypothesis. A design that has been fixed but never re-broken has a new set of untested assumptions, and they are the expensive kind, because they are believed.\n\nThe loop is what makes the practice compound. Each rehearsal produces a postmortem, each postmortem produces diffs, and each diff makes the next rehearsal cheaper to run and less likely to find anything. Netflix's failure injectors are not a stunt; they are the mechanism that keeps a very large system's assumptions from silently decaying between incidents.",
        },
        {
          kind: "diagram",
          caption:
            "What the postmortem has to explain: 16.7% of 12,000 requests never served, while p95 reads 9.8 ms over the requests that completed",
          graph: taskStartGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "Write the timeline of one incident you remember, in five moments: first bad request, noticed, understood, mitigated, over. Then write one action item that is a diff and one that is only an intention, and say which you would actually ship.",
        },
        {
          kind: "compare",
          body: "A beginner writes 'root cause: a bad deploy' and closes the ticket. A senior engineer writes the timeline, names the contributing factors, and produces two diffs and one rehearsal date — because the interesting question is not which change broke it, but why the system was arranged so that one change could.\n\nThe trap is a postmortem with no owner for each item. An action item without a name and a date is a wish, and a wish is what the next postmortem cites as the previous one's conclusion.",
        },
        {
          kind: "recap",
          points: [
            "Metrics were correct and the question was missing: p95 over survivors hides the shed requests",
            "Timeline first, then contributing factors — root cause ends the investigation too early",
            "Blamelessness is what makes the timeline accurate, not just what makes people comfortable",
            "Close each action item with a diff, and keep the list to three or four",
            "Re-inject the failure at the real load, or the fixes are the next set of untested assumptions",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "Here is a playback path: edge, API tier, CDN, origin, store. Twelve thousand requests a second. Convince me it survives losing a third of any tier.",
    strongAnswer:
      "I would answer with numbers rather than adjectives. At 12,000 requests a second, 10 API instances put the tier at 60% and 2 read replicas put the store at 40%, so degrading either to two thirds lands at 90% and 60% with nothing shed — that is the arithmetic I would put in the review. The CDN matters because it changes what the origin sees: a 95% hit rate takes the origin from 50% to 3%, which is the difference between an origin that is a bottleneck and one that is a cache-fill service. Then I would say what the model cannot prove: replicas are capacity, not redundancy, so losing a node is not the same as losing a third of a tier, and a second terminal reroutes rather than fails. And I would rehearse it, because a design that has never been broken is a design whose failure behaviour is unknown.",
    trap: "Answering with 'we have three availability zones' and no headroom number, or claiming the design survives a node loss when all replicas of a tier live on one node. Both sound like resilience and neither is measured.",
  },
  task,
  recap: [
    "Inject failure on purpose, or the first test of your failure behaviour is an incident",
    "State the steady state first, so a rehearsal has an answer to compare against",
    "Size every tier for the fraction that survives — and measure it before the outage",
    "A cache at the edge changes what the origin is asked to do, which is the whole point of it",
    "Write the postmortem without names, or the next one will not contain the truth",
  ],
  attribution:
    "Synthesised from Netflix's Chaos Monkey and Simian Army projects, the AWS Builders' Library on static stability, Google's SRE Book on cascading failures, handling overload and postmortem culture, and the PagerDuty postmortem documentation. Sources are linked per lesson; every capacity figure and error rate comes from this module's canvas.",
};

export default module;
