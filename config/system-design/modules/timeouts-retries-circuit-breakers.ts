import type { SdEdge, SdGraph, SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

/**
 * Module 13 — timeouts, retries and circuit breakers, converted in slice B7.
 *
 * **Netflix anchor.** Hystrix is the library Netflix open-sourced in 2012 to
 * stop one slow dependency from consuming every thread in the JVM. Its README
 * describes the problem in the same words this module does: without isolation,
 * "a single dependency ... can saturate all of the container's user threads".
 * `github.com/Netflix/Hystrix` is the artifact; the module is the reasoning
 * that produced it.
 *
 * **The task, and why it looks the way it does.** The image API calls a resize
 * service on every new asset. Measured at 6,000 requests a second: the resize
 * tier runs at 149% of its capacity and 16.5% of *all* traffic is shed, while
 * the metadata store sits at 30%. Stopping the call — the canvas's model of an
 * open breaker with a fallback — and giving the metadata store one read replica
 * serves all 6,000 with zero shed (metadata at 60%). Remove the resize call but
 * leave the store at one node and the fallback cannot carry the load: the store
 * runs at 120% and sheds 16.7%. That second measurement is the lesson, and it
 * is why `fallback-carries-the-load` is a step rather than a paragraph.
 *
 * **What this canvas does not model — asserted, not described.**
 * `breakerEnabled` and `maxConcurrency` are real fields, visible in the
 * inspector and persisted with the graph, and the engine never reads either of
 * them; neither does it read `edge.retry`. There is no timeout dimension, no
 * half-open state and no trip threshold. The task therefore grades the decision
 * the engine *can* see — the dependency is no longer in the request path — and
 * an advisory criterion for the failover path's headroom. The limitation is
 * stated in lesson 3 where a learner looks for the breaker, and
 * `tests/system-design-content.test.ts` asserts that toggling the flag changes
 * nothing, so a later engine slice fails the suite instead of silently
 * falsifying the lesson.
 *
 * **Why the old task was replaced.** Its "solution" differed from its start
 * only in app `replicas` (1 → 2); the breaker and bulkhead it graded were inert,
 * so the module taught a checkbox. Its criterion (`app.utilisation < 0.5`) at
 * 1,500 requests a second passed on arithmetic alone.
 *
 * **Chain note.** `check:system-design` is satisfied here: the resize node and
 * its object store stay in the solution graph, with no traffic reaching them —
 * which is what an open breaker actually looks like. Losing the store, not the
 * dependency, is the failure this task has to survive.
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

function imageGraph(
  arrivalRate: number,
  resizePath: boolean,
  readReplicas: number,
  resizeReplicas = 1,
): SdGraph {
  const edges = [
    wire("e1", "client-1", "lb-1"),
    wire("e2", "lb-1", "api-1"),
    wire("e5", "api-1", "db-1", "metadata"),
  ];
  if (resizePath) {
    edges.push(wire("e3", "api-1", "resize-1", "resize"));
    edges.push(wire("e4", "resize-1", "origin-1", "store"));
  }
  return {
    nodes: [
      { ...defaultNode("client", "client-1", 40, 200), label: "Viewers" },
      { ...defaultNode("load_balancer", "lb-1", 200, 200) },
      {
        ...defaultNode("app_server", "api-1", 380, 200),
        label: "Image API",
        replicas: 4,
      },
      {
        ...defaultNode("app_server", "resize-1", 560, 120),
        label: "Resize",
        replicas: resizeReplicas,
      },
      {
        ...defaultNode("object_store", "origin-1", 740, 120),
        label: "Resized store",
      },
      {
        ...defaultNode("database", "db-1", 560, 300),
        label: "Metadata",
        readReplicas,
      },
    ],
    edges,
    scenario: {
      arrivalRate,
      writeShare: 0.1,
      mediaShare: 0,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  };
}

const healthyGraph = imageGraph(500, true, 0);
const stormGraph = imageGraph(12_000, true, 1);
const taskStartGraph = imageGraph(6_000, true, 1);
const taskSolutionGraph = imageGraph(6_000, false, 1);

const module: SdModule = {
  slug: "timeouts-retries-circuit-breakers",
  order: 13,
  part: 3,
  partTitle: "Reliability",
  kind: "sim",
  title: "Timeouts, Retries & Circuit Breakers",
  description:
    "No timeout is worse than a bad one. Bound every call, retry with backoff and jitter, cap concurrency per dependency, and stop calling a tier that is not answering — with a fallback that can carry the load on its own.",
  story:
    "Hystrix exists because one dependency with a slow answer is enough to take down a process that has nothing wrong with it. The image API calls a resize service on every new asset. The resize tier is over capacity, so it accepts requests and answers them slowly, and the API has no timeout, no bulkhead and no breaker: every worker that touches a resize waits, and the metadata path waits behind them. At 6,000 requests a second, 16.5% of all traffic is being shed and the only thing that is actually broken is one dependency on one path. The fix is four decisions, in order: bound the call, retry it carefully, isolate it, and stop calling it when it cannot answer — then make sure the fallback still has the capacity to serve everyone.",
  chapters: [
    {
      slug: "the-stuck-worker",
      title: "The stuck worker",
      description: "A call with no bound is a worker held hostage.",
      children: [
        {
          slug: "no-bound-chapter",
          title: "No bound, no limit",
          description:
            "Why a slow dependency is more expensive than a dead one.",
          lessonSlug: "no-timeout-is-worse",
        },
      ],
    },
    {
      slug: "retries-and-breakers",
      title: "Retries and breakers",
      description:
        "Retrying makes load worse; a breaker takes the dependency out of the path.",
      children: [
        {
          slug: "retry-chapter",
          title: "Retry with intent",
          description:
            "Backoff, jitter, and a budget that counts retries against everyone.",
          lessonSlug: "retries-and-jitter",
        },
        {
          slug: "breaker-chapter",
          title: "Breakers and bulkheads",
          description:
            "Closed, open, half-open — and a pool per dependency so one cannot take the rest.",
          lessonSlug: "breakers-and-bulkheads",
        },
      ],
    },
    {
      slug: "budgets-and-fallbacks",
      title: "Budgets and fallbacks",
      description:
        "One deadline for the whole request, and something useful to return when a dependency is gone.",
      children: [
        {
          slug: "budget-chapter",
          title: "Timeout budgets",
          description:
            "A deadline is a property of the request, not of each hop.",
          lessonSlug: "timeout-budgets",
        },
        {
          slug: "fallback-chapter",
          title: "Fallbacks",
          description:
            "A fallback with no capacity is an outage with extra steps.",
          lessonSlug: "fallbacks-and-degradation",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "no-timeout-is-worse",
      title: "No timeout is worse than a bad one",
      attribution:
        "Synthesised from the AWS Builders' Library on timeouts, retries and backoff with jitter, and Google's SRE Book chapter on addressing cascading failures.",
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
          title: "The resize service accepts, then thinks",
          body: "The resize tier is at 149% of its capacity. It is not refusing connections — it is accepting them and answering late, because its queue is deep and it is doing its best. The API calls it synchronously on every new asset, with no timeout at all, so the call returns whenever the resize tier gets around to it.\n\nWithin a minute the API's workers are all in that state. A worker waiting on a resize cannot serve a metadata read, and metadata reads are the majority of the traffic. The engine reports 16.5% of all requests shed and a resize tier at 149%, but the number that explains the incident is the one that is not there: the API has no capacity left, and it has none because it is holding work it will never finish.",
        },
        {
          kind: "concept",
          title: "A slow dependency is more dangerous than a dead one",
          body: "A dead dependency fails in microseconds. The connection is refused, the caller learns the truth immediately, and the resource it was holding goes back to the pool. A slow dependency holds that resource for as long as it likes, and the resource is the finite thing.\n\nThat is the counter-intuitive part of reliability work: arrival of errors is easier to survive than arrival of latency. An unavailable service stops consuming your capacity; a slow one consumes it and then bills you for the requests that were abandoned while it was consuming it. This is why 'it is not down, it is just slow' is the sentence that precedes most large outages.",
        },
        {
          kind: "concept",
          title: "A timeout is a bound, not a failure",
          body: "A timeout turns an unbounded wait into a decision. Once the caller knows that the dependency did not answer within N milliseconds, it can do something else — return a degraded response, fall back to a cached copy, or fail fast so the client can try elsewhere.\n\nThe size of N is the interesting part, and the rule that matters is relative, not absolute: the timeout must be shorter than the caller's own deadline, and usually much shorter, because the caller still has work to do after the dependency answers. A thirty-second timeout inside a one-second page budget does not bound anything; it guarantees that every slow request also fails late. Choose the timeout from the request's budget, divide by the number of hops that share it, and treat any call without one as a bug of the same severity as an unhandled exception.",
        },
        {
          kind: "concept",
          title: "Bounding the call is step one of four",
          body: "A timeout stops the wait, and that is all it does. It does not stop the next request from making the same doomed call, it does not stop the client from retrying, and it does not stop a thousand callers from retrying together.\n\nThe four decisions in this module are ordered because each one is useless without the one before it. Bound the call so a worker comes back. Retry it carefully so a transient failure does not become a load spike. Isolate it so the dependency can only consume the resources you reserved for it. And stop calling it entirely when it is clearly not answering, so the resources it would have consumed go to the requests that can still succeed. Skipping the first makes the other three impossible: there is nothing to retry safely, isolate or break away from while a worker is blocked forever.",
        },
        {
          kind: "diagram",
          caption:
            "The healthy design at 500 r/s: the API at 6%, resize at 12%, the store at 5%. Nothing here is failing — the failure is a function of load and of what the API does when the resize tier cannot keep up",
          graph: healthyGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "The resize service is slow but alive. Write down what the API should do after 300 ms, after 1 second, and after 5 seconds — and what the user should see at each of those moments.",
        },
        {
          kind: "compare",
          body: "A beginner leaves the call unbounded, because the dependency is not failing and the request might still succeed. A senior engineer bounds every call, because a dependency that answers in thirty seconds has already failed for every user who has a one-second budget.\n\nThe trap is a generous timeout justified by a rare slow path. The generous value is measured against the request budget, not against the slowest success you have ever seen; if the budget is one second, a thirty-second timeout is not generous, it is a second outage mode.",
        },
        {
          kind: "recap",
          points: [
            "A dead dependency releases resources; a slow one holds them",
            "An unbounded call turns a dependency's problem into the caller's outage",
            "A timeout must be shorter than the caller's own deadline",
            "Measured here: resize at 149% sheds 16.5% of all traffic",
            "Bound, retry, isolate, break — in that order, because each needs the last",
          ],
        },
      ],
    },
    {
      slug: "retries-and-jitter",
      title: "Retry with intent",
      attribution:
        "Synthesised from the AWS Builders' Library on timeouts, retries and backoff with jitter, and on making retries safe with idempotent APIs.",
      sources: [
        {
          label:
            "AWS Builders' Library — timeouts, retries and backoff with jitter",
          url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
        },
        {
          label:
            "AWS Builders' Library — making retries safe with idempotent APIs",
          url: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The retry doubles the load on the tier that is struggling",
          body: "The resize tier answers slowly, so the API's retry policy does its job and sends the same request again. Twice. The tier that was at 149% is now offered twice the work it was already failing to do.\n\nMeasured on this canvas, with retries inflating 6,000 requests a second to 12,000: the API goes from 75% to 150%, the resize tier from 149% to 199%, and 49.9% of all traffic is shed. The pathological detail is the shape of the number: the retries did not merely add errors, they moved the API tier itself past its own capacity, so a dependency's problem became a front-door failure. Without the resize call in the path, the same 12,000 requests put the API at 150% and the store at 80% — still shed, because the capacity was never there. Retries cannot add capacity; they only redistribute who is waiting.",
        },
        {
          kind: "concept",
          title: "Backoff gives the dependency time to recover",
          body: "Backoff means waiting longer after each attempt: 100 milliseconds, then 200, then 400. The point is not politeness. A dependency that is over capacity needs the queue to drain, and a retry that arrives in a millisecond joins the queue instead of relieving it.\n\nExponential backoff is the usual shape, with a cap so the wait does not grow without bound — a request that waits four minutes to fail has failed in a way the user experiences as a hang. The cap is also what keeps a retry budget meaningful: unbounded waits turn a retry into a background job nobody scheduled.",
        },
        {
          kind: "concept",
          title: "Jitter is what stops clients retrying in unison",
          body: "A thousand clients that all wait exactly 200 milliseconds all retry at exactly the same instant. The dependency sees a spike of a thousand requests at t+200 ms, then silence, then another spike. That is a thundering herd with better manners, and it is worse than no backoff at all, because it concentrates the same load into a narrower window.\n\nJitter randomises the wait. AWS's article recommends full jitter — a uniform draw between zero and the backoff window — because it spreads retries across the whole interval instead of clustering them at the top. The trade is that some clients retry very early; the win is that no two clients retry together, and the aggregate shape of the retries becomes a ramp rather than a spike.",
        },
        {
          kind: "concept",
          title: "A retry budget is the only control on aggregate load",
          body: "Backoff and jitter change *when* retries arrive; only a budget changes *how many* arrive. The budget is expressed as a share of legitimate traffic — retries may add at most ten percent, or twenty — and it is enforced across all callers, not per call.\n\nThis is the control that would have saved the scenario above. If the API's retries may add at most 10% to the resize tier's load, then a failing tier is offered 6,600 requests a second instead of 12,000, and the tier's own recovery has somewhere to happen. Per-call limits cannot do this: ten thousand callers each making three attempts is three retries per call and thirty thousand requests. The aggregate is the number that takes a tier down, so the aggregate is the number the budget must bound.",
        },
        {
          kind: "concept",
          title: "Retry the writes only when a repeat is harmless",
          body: "Every rule above is about load. There is a second question with a worse answer: what does the retry do to the data? An attempt that timed out may have succeeded. The resize job may have run, the row may have been written, the charge may have gone through, and the retry now does it again.\n\nSo a retry policy is only correct in combination with idempotency: a client-generated key that lets the server recognise a repeat and return the first result instead of doing the work twice. Reads are safe by nature; writes are safe only if somebody made them so. Until that is true, the honest configuration for a write is zero retries at the edge and a reconciliation path — which is exactly the arrangement module 14 argues for, and the reason the retry policy belongs on the connection rather than on the client library's defaults.",
        },
        {
          kind: "diagram",
          caption:
            "Retries inflating 6,000 r/s to 12,000: the API at 150%, resize at 199%, 49.9% of all requests shed",
          graph: stormGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "You have 1,000 clients, a dependency that fails ten percent of calls, three attempts per call, and a 100 ms base backoff. Estimate the extra load in the first second with no jitter, then with full jitter. Which number would you put in a capacity plan?",
        },
        {
          kind: "compare",
          body: "A beginner enables retries and watches the error rate fall until the dependency's queue is the thing that fails. A senior engineer enables retries with exponential backoff, full jitter and a budget, and makes the write path idempotent before enabling any of it.\n\nThe trap is retrying a request that has no safe repeat. The second trap is measuring retries per call instead of in aggregate: the per-call limit is a polite fiction when ten thousand callers apply it.",
        },
        {
          kind: "recap",
          points: [
            "A retry arrives at the dependency as brand-new load",
            "Exponential backoff gives a struggling tier room to drain",
            "Full jitter spreads retries so clients do not retry in unison",
            "Only a shared budget bounds the aggregate, which is the number that matters",
            "Retry writes only when a repeat is provably harmless",
          ],
        },
      ],
    },
    {
      slug: "breakers-and-bulkheads",
      title: "Breakers and bulkheads",
      attribution:
        "Synthesised from Martin Fowler's circuit-breaker write-up, the Wikipedia circuit-breaker pattern article, and Netflix's Hystrix documentation.",
      sources: [
        {
          label: "Martin Fowler — CircuitBreaker",
          url: "https://martinfowler.com/bliki/CircuitBreaker.html",
        },
        {
          label: "Circuit breaker pattern (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Circuit_breaker_design_pattern",
        },
        {
          label: "Netflix Hystrix",
          url: "https://github.com/Netflix/Hystrix",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Stop asking a tier that cannot answer",
          body: "The resize tier has been over capacity for six minutes. Every request to it will time out, at the cost of a worker and a few hundred milliseconds, and the answer is known in advance: no.\n\nA circuit breaker is the mechanism that stops asking. It watches the calls to one dependency, counts failures, and when the failure rate crosses a threshold it *opens*: subsequent calls fail immediately, without touching the dependency at all. After a cool-down it goes *half-open* and lets a few probe requests through. If they succeed, the circuit closes and normal traffic resumes; if they fail, it opens again for another interval. The state machine is the whole idea: stop paying for a call whose answer is known.",
        },
        {
          kind: "concept",
          title: "Three states, and the one that is hard to get right",
          body: "**Closed** is normal: calls go through, failures are counted. **Open** is the fast-fail state: calls return an error or a fallback immediately, the dependency is left alone to recover, and its queue drains because nobody is adding to it. **Half-open** is the probe: a limited number of requests are allowed through to test whether the dependency is back.\n\nThe hard part is not the state machine; it is the threshold and the cool-down. Trip too eagerly and a handful of slow requests takes a healthy dependency out of the path, turning a blip into an outage. Trip too slowly and every caller pays for timeouts while the breaker waits for enough evidence. The usual starting point is a rolling window of the last N calls, a failure-rate threshold around fifty percent, and a cool-down measured in seconds rather than minutes — with the numbers visible on a dashboard, because a breaker you cannot see the state of is a mystery during an incident.",
        },
        {
          kind: "concept",
          title: "A bulkhead limits the damage a dependency can do",
          body: "A circuit breaker removes a dependency from the path after it has failed. A bulkhead stops it from taking the whole process down while it fails: it reserves a fixed number of workers, or concurrent calls, for each dependency, so the slow one can only ever consume its own compartment.\n\nThis is Hystrix's actual contribution, and its README is unusually direct about the reason: without isolation, one dependency can saturate every user thread in the container, and the failure spreads to dependencies that were healthy. The compartment costs you utilisation — a reserved pool sits partly idle while another is queued — and that idle capacity is the price of the guarantee. Set it from normal traffic plus headroom, not from the peak you would like to survive, because a compartment sized at the peak is not a compartment.",
        },
        {
          kind: "concept",
          title: "What this canvas does and does not model",
          body: "The canvas has both fields: an app server carries `breakerEnabled` and `maxConcurrency`, and an edge carries a retry policy of `attempts`, `backoffMs` and `jitter`. You can set all of them in the inspector, and they persist with your design.\n\nThe engine does not read any of them. There is no timeout dimension, no half-open state, no trip threshold, and no per-dependency pool; a retry is a field on an edge, not extra arrivals. So the task grades what the model can see: whether the resize service is still in the request path at all. That is the *consequence* of an open breaker, which is why deleting the call is the right gesture rather than a workaround — but do not read a green criterion as evidence that your threshold is correct. The threshold is a production measurement, and this canvas does not take it.",
        },
        {
          kind: "diagram",
          caption:
            "The open state, modelled as what it means: the resize tier and its store are still deployed, and no traffic reaches them",
          graph: taskSolutionGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "The resize tier fails fifteen percent of calls with a five-second timeout. Write the breaker configuration you would ship: window, threshold, cool-down, and what a caller receives while the circuit is open. Then say how you would know the configuration is wrong.",
        },
        {
          kind: "compare",
          body: "A beginner retries harder when a dependency is failing, on the theory that persistence wins. A senior engineer opens the circuit, isolates the dependency in its own pool, and lets the failure cost one timeout instead of every worker in the process.\n\nThe trap is a breaker with no fallback. Opening the circuit converts a slow dependency into a fast error, which is better for the system and identical for the user unless something serves the degraded request — which is the last lesson in this module.",
        },
        {
          kind: "recap",
          points: [
            "Closed counts failures, open fails fast, half-open probes for recovery",
            "A breaker's job is to stop paying for a call whose answer is known",
            "Thresholds that trip too easily turn blips into outages",
            "Bulkheads reserve capacity per dependency so one cannot exhaust the process",
            "This canvas stores the breaker and bulkhead fields but grades the decision, not the threshold",
          ],
        },
      ],
    },
    {
      slug: "timeout-budgets",
      title: "One deadline for the whole request",
      attribution:
        "Synthesised from the AWS Builders' Library on timeouts and backoff, and Google's SRE Book chapter on handling overload.",
      sources: [
        {
          label:
            "AWS Builders' Library — timeouts, retries and backoff with jitter",
          url: "https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/",
        },
        {
          label: "SRE Book — handling overload",
          url: "https://sre.google/sre-book/handling-overload/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title:
            "Every hop has a timeout, and the request still takes too long",
          body: "The page budget is one second. The API sets a 900 ms timeout on the metadata call and a 900 ms timeout on the resize call, because each on its own might legitimately take that long. Each hop's timeout is generous and each is technically correct, and a request that touches both can take 1.8 seconds.\n\nThis is the most common way timeouts fail: they are chosen per call, by the engineer who owns that call, against the worst latency they have seen — and nobody adds them up. The request's deadline is the only number the user experiences, and it has to be divided among the hops before the timeouts are chosen, not audited afterwards.",
        },
        {
          kind: "concept",
          title: "A deadline belongs to the request",
          body: "The right primitive is a deadline that travels with the request: a timestamp every hop can read, so each service knows how much time is left rather than how much time it is allowed in isolation. That is the difference between 'you may take 900 ms' and 'you have 240 ms left'.\n\nWith a deadline, the second hop in the chain gets whatever the first one left, and the arithmetic works no matter how the path changes. Without one, every hop is sized against a local view, the sum is unbounded, and the only thing that stops a request is the client giving up — which is the worst outcome, because the work continues on the server after the user has gone.",
        },
        {
          kind: "concept",
          title: "Divide the budget, then reserve for the response",
          body: "Take the one-second page budget. Reserve some of it for the work the API must do regardless, and some for the network back to the client; what remains is the share available to dependencies. If the API calls the store and then the resize service sequentially, the two timeouts must sum to less than that share, or the second call is not really bounded.\n\nRetries multiply the budget, which is the part teams forget. Three attempts at a 300 ms timeout is 900 ms of worst case before the second dependency is even called. Either the retry budget is expressed in time as well as in count, or the first dependency's retries can consume the whole request. AWS's article makes the same point from the other side: retries are only safe when the total time they can consume is bounded.",
        },
        {
          kind: "concept",
          title: "Overload is a budget problem, not a latency problem",
          body: "When a tier is over capacity, every request it accepts is a request it will finish late or not at all. Google's SRE book calls the usual response *handling overload*: shed work early rather than accepting it and failing slowly, and give the system a way to reject load that is cheaper than serving it.\n\nA deadline makes that decision possible, because a request that has already exceeded its deadline is work with no value — the client has gone, and completing it helps nobody. The discipline is to check the deadline *before* starting expensive work, not after it finishes, and to let the rejection propagate instead of retrying it into a second queue. The engine's own shed counter is the same idea in miniature: at capacity it rejects rather than queueing forever, and the requests that were shed cost almost nothing.",
        },
        {
          kind: "concept",
          title: "Write the budget down where the numbers live",
          body: "A timeout budget is a design artifact, not a convention. It belongs in a table next to the service catalogue: request class, total budget, per-hop allocation, retry allowance, and what each hop does when it runs out. Without that table, every timeout is an independent guess that happens to be defensible in a code review and adds up to a number nobody chose.\n\nThe test of the table is the slow path: take the request that touches every dependency, add the worst case at each, and check that the sum is inside the budget with room for the response. If it is not, the fix is not a bigger budget at the top; it is fewer hops on the critical path, parallel calls where the data allows, or a fallback that skips a hop entirely.",
        },
        {
          kind: "diagram",
          caption:
            "Four hops share one deadline: the edge at 30%, the API at 75%, the resize tier at 149% of its own capacity — the tier whose queue eats the budget",
          graph: taskStartGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "A request must answer within 800 ms. It makes three sequential calls: auth, store, resize. Allocate the budget, decide how many retries each call may spend, and say what happens when the store has already used 400 ms of it.",
        },
        {
          kind: "compare",
          body: "A beginner sets each call's timeout from that call's worst observed latency, and discovers in production that the worst cases stack. A senior engineer starts from the user's budget, divides it across the path, and treats a hop that cannot fit as a design problem rather than a configuration one.\n\nThe trap is a retry allowance that is not in the arithmetic. Three retries of a 300 ms call is 900 ms, and if that number is not in the budget the budget is fiction.",
        },
        {
          kind: "recap",
          points: [
            "A deadline travels with the request; a timeout is per call and blind to the rest",
            "Divide the user's budget across hops before choosing any timeout",
            "Retries consume the budget too — three attempts is three times the worst case",
            "A request past its deadline is work with no value; reject it before starting",
            "Write the budget in a table, and test it against the slow path",
          ],
        },
      ],
    },
    {
      slug: "fallbacks-and-degradation",
      title: "A fallback with no capacity is an outage",
      attribution:
        "Synthesised from the AWS Builders' Library on avoiding fallback in distributed systems, and Google's SRE Book chapter on handling overload.",
      sources: [
        {
          label:
            "AWS Builders' Library — avoiding fallback in distributed systems",
          url: "https://aws.amazon.com/builders-library/avoiding-fallback-in-distributed-systems/",
        },
        {
          label: "SRE Book — handling overload",
          url: "https://sre.google/sre-book/handling-overload/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The resize call is gone and the store inherits the traffic",
          body: "The breaker is open on the resize service, so the API serves the original asset instead of a resized one. Provisioning time drops, error rate drops, and the incident looks resolved. The traffic that used to be split across two paths now arrives on one, and the metadata store — which was at 30% — is the only thing left in the request path.\n\nMeasured on this canvas: with the resize call removed and the store still at a single node, 6,000 requests a second put it at 120% of capacity and 16.7% of traffic is shed. Same load as before. Same dependency removed. The fallback became the outage, because nobody checked whether the surviving path could carry the traffic the failed path used to absorb.",
        },
        {
          kind: "concept",
          title: "Fallbacks have capacity requirements",
          body: "A fallback is a second path, and a path is a set of tiers that must be able to serve what is routed to it. The moment a breaker opens, the surviving path inherits the failed path's traffic — 100% of it, not the share it was sized for.\n\nSo the failover budget is part of the capacity plan, not a deployment detail. If the store normally serves 30% of requests and the resize path serves the other 70%, then the store must be sized so that 100% of traffic stays under its ceiling after failover, or the fallback must be selective: serve degraded responses for some request classes and refuse others, rather than accepting everything and shedding at random. Both are legitimate; what is not legitimate is discovering the requirement during the incident, which is exactly when the store is least able to absorb it.",
        },
        {
          kind: "concept",
          title: "Sometimes the right fallback is an error",
          body: "AWS's article on avoiding fallback makes an argument that reads as contrarian and is not: a fallback that silently changes the answer can be worse than an error. A degraded response that returns slightly stale data is fine. A fallback that writes to a different store, or answers from a cache with a different consistency model, can create data that is wrong in ways nobody notices for a week.\n\nThe test is whether the degraded mode has a defined answer to *what the user now sees*. Serving the original image instead of a resized one: visibly different, semantically identical, safe. Serving a cached price instead of the current one: visibly identical, semantically different, unsafe. Only fallbacks in the first category can be automatic; the second needs to fail, or to be gated behind a human decision.",
        },
        {
          kind: "concept",
          title: "Degradation is a product decision with an engineering bill",
          body: "Someone has to choose what is dropped when the system cannot do everything: resized images, personalised recommendations, search ranking, the second half of a page. That choice belongs to the product, because it is about what the user can live without, and the engineering contribution is to make each option cheap to select and honest about its cost.\n\nThe bill arrives in capacity. Every degraded mode is a promise that the surviving path can absorb the traffic, so each one needs its own headroom calculation — which is what the task in this module measures. A degraded mode nobody sized is a bigger outage with better copy.",
        },
        {
          kind: "concept",
          title: "The pattern, in order",
          body: "Bound the call with a timeout so the worker comes back. Retry with backoff, jitter and a budget so the failure does not become a load spike. Open the circuit when the answer is reliably bad, and keep the dependency in its own pool so it cannot take the process with it. Then serve a fallback that the surviving path can actually carry, and check the arithmetic before the incident rather than during it.\n\nThat last clause is the module. Every one of the first four is about limiting damage; the fifth is about where the damage goes next, and it is the one that is usually missing, because it is the one that requires looking at the system after the fix — at which point everyone has already moved on.",
        },
        {
          kind: "diagram",
          caption:
            "The same 6,000 r/s with the resize call removed but only one store node: the metadata tier at 120% sheds 16.7% — the fallback needs capacity of its own",
          graph: (() => {
            const graph = imageGraph(6_000, false, 0);
            return graph;
          })(),
        },
        {
          kind: "your_turn",
          prompt:
            "Pick three things your system could stop doing under load. For each, say what the user sees instead, what the surviving path has to carry, and whether you would switch it automatically or by hand.",
        },
        {
          kind: "compare",
          body: "A beginner opens the breaker and declares the incident over when the error rate falls. A senior engineer checks what the surviving path now carries, sizes it for failover, and writes down which degraded modes are automatic.\n\nThe trap is a fallback that changes the meaning of the answer. Returning the original image is degradation; returning a cached balance is a correctness bug with a nice name.",
        },
        {
          kind: "recap",
          points: [
            "A fallback inherits 100% of the failed path's traffic",
            "Failover capacity is part of the plan, not a deployment detail",
            "Some fallbacks are safe (same meaning) and some are not (different meaning)",
            "Measured here: one store node behind a removed resize call goes to 120% and sheds 16.7%",
            "Bound, retry, isolate, break, then check where the traffic went",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "A dependency your API calls on every request has gone from fast to five seconds. Walk me through what you would change, in order, and what breaks at each step.",
    strongAnswer:
      "First a timeout, shorter than the request budget, so workers come back and I can see the real error rate. Then retries with exponential backoff, full jitter and a shared budget, because retries without a budget turn one slow dependency into two overloaded tiers. Then a circuit breaker with a rolling window and a short cool-down so callers stop paying for calls whose answer is known, plus a bulkhead that reserves a fixed pool per dependency so it can only exhaust its own compartment. Then a fallback that the surviving path can actually carry — I would check the arithmetic, because removing a dependency moves 100% of its traffic onto whatever remains, and in this canvas that took the metadata store from 30% to 120%. And I would make any retried write idempotent before enabling retries on it.",
    trap: "Listing the patterns without ordering them, and enabling retries before timeouts. Also, opening a breaker with no fallback — the user sees the same error, just faster — and claiming a fallback exists without checking that the surviving path has the capacity for it.",
  },
  task: {
    brief:
      "The resize service is over capacity and the API calls it on every new asset. Stop calling it, and make sure the metadata path can carry the whole load on its own: 6,000 requests a second with zero shed.",
    startGraph: taskStartGraph,
    solutionGraph: taskSolutionGraph,
    steps: [
      {
        id: "stop-calling-the-dead-service",
        title: "Take the dependency out of the request path",
        brief:
          "The resize tier cannot answer. Remove the API's call to it so those requests fail fast and serve the original asset instead of waiting.",
        hint: "Select the edge from the Image API to the Resize node and delete it. The Resize and Resized store nodes stay — nothing is calling them.",
        reveal:
          "An open breaker is a decision not to call. On the canvas that means deleting the `api-1 → resize-1` edge: the resize tier and its store remain deployed and receive no traffic, which is exactly what the open state looks like in production.",
        check: (graph) => {
          const called = graph.edges.some(
            (edge) => edge.from === "api-1" && edge.to === "resize-1",
          );
          return {
            passed: !called,
            progress: called
              ? "The API still calls the resize tier on every asset"
              : "✓ Resize call removed — the tier receives no traffic",
          };
        },
      },
      {
        id: "fallback-carries-the-load",
        title: "Size the surviving path for failover",
        brief:
          "With the resize call gone, every request lands on the metadata store. Give it a read replica so it can carry the whole 6,000 r/s.",
        hint: "Select the Metadata store and raise Read Replicas. One node is 5,000 r/s of capacity against 6,000 of load.",
        reveal:
          "One replica doubles the store to 10,000 requests a second, so 6,000 of load is 60%. Without it the store runs at 120% and sheds 16.7% — the fallback becomes the outage.",
        check: (graph) => {
          const db = graph.nodes.find((node) => node.type === "database");
          const replicas = db?.type === "database" ? db.readReplicas : 0;
          const passed = replicas >= 1;
          return {
            passed,
            progress: passed
              ? `✓ ${replicas} read replica(s) — ${(5_000 * (1 + replicas)).toLocaleString()} r/s of failover capacity`
              : "One store node is 5,000 r/s of capacity; failover needs more",
          };
        },
      },
      {
        id: "keep-the-load",
        title: "Do not shrink the problem",
        brief:
          "6,000 requests a second is what the system serves. Dropping the arrival rate hides the failover requirement instead of meeting it.",
        hint: "Check the scenario's arrival rate in the inspector.",
        reveal:
          "At 1,000 requests a second the store passes on one node and the fallback looks free. The requirement is 6,000, and that is the number the failover path must carry.",
        check: (graph) => {
          const arrivals = graph.scenario.arrivalRate;
          return {
            passed: arrivals >= 6_000,
            progress:
              arrivals >= 6_000
                ? `✓ ${arrivals.toLocaleString()} r/s — the load is unchanged`
                : `${arrivals.toLocaleString()} r/s is below the 6,000 r/s the system is expected to serve`,
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "zero-errors",
        label: "Zero requests shed",
        required: true,
        explain:
          "With the resize call in the path, 16.5% of all requests are shed because the resize tier is at 149%. Every failure class has to be zero, so a fallback that simply moves the shedding does not pass.",
        assert: (result) =>
          result.valid &&
          (result.errorClasses.shed ?? 0) === 0 &&
          (result.errorClasses.unreachable ?? 0) === 0 &&
          (result.errorClasses.stale ?? 0) === 0 &&
          (result.errorClasses.rejected ?? 0) === 0,
      },
      {
        id: "capacity-served",
        label: "At least 5,900 requests a second served",
        required: true,
        explain:
          "Removing the resize call raises throughput only if the surviving path has capacity. Without a second store node the design still caps out at 5,000, which is the store's ceiling.",
        assert: (result) => result.valid && result.throughput >= 5_900,
      },
      {
        id: "metadata-headroom",
        label: "Metadata store under 65% utilisation (advisory)",
        required: false,
        explain:
          "Advisory, because it is green in the start graph: while the resize tier absorbs the damage, only half the traffic reaches the store, so 30% looks healthy. It turns red the moment the fallback inherits everything and nobody sized it, which is the failure this task exists to prevent — a criterion cannot require it at the start without also pretending the start graph is healthy.",
        assert: (result) => {
          const db = result.perNode.find((node) => node.id === "db-1");
          return result.valid && !!db && db.utilisation < 0.65;
        },
      },
    ],
  },
  recap: [
    "Bound every call with a timeout shorter than the request's deadline",
    "Retry with exponential backoff, full jitter, and a shared budget",
    "Open the circuit when the answer is reliably bad, and isolate it in its own pool",
    "Remove the dependency from the path, then check where its traffic went",
    "Re-measure the surviving path: failover inherits 100% of the load",
  ],
  attribution:
    "Synthesised from Netflix's Hystrix, the AWS Builders' Library on timeouts, retries, idempotent APIs, avoiding fallback and overload, Google's SRE Book on cascading failures and handling overload, Martin Fowler's circuit-breaker write-up and the Wikipedia circuit-breaker article. Sources are linked per lesson; every capacity figure and error rate comes from this module's canvas.",
};

export default module;
