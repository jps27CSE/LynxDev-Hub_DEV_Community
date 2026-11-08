import type { SdEdge, SdGraph, SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";
import task from "./idempotency.task";

/**
 * Module 14 — idempotency, converted in slice B7 (plan 17).
 *
 * **Netflix anchor.** Netflix finished its cloud migration in January 2016, and
 * `about.netflix.com/en/news/completing-the-netflix-cloud-migration` is the
 * announcement. The sentence this module is built on is the one that explains
 * why the migration took seven years: the majority of systems, *"including all
 * customer-facing services"*, moved before 2015, and what remained was
 * *"a secure and durable cloud path for our billing infrastructure as well as
 * all aspects of our customer and employee data management"*. Billing went last
 * because a double charge cannot be retried away — the streaming path could be
 * moved while it was still imperfect, and the money path could not. (The
 * companion post, *Netflix Billing Migration to AWS*, says the same thing from
 * the other side — *"for a company, its billing solution is its financial
 * lifeline"* — and is cited by title only: `netflixtechblog.com` answers 403 to
 * non-browser clients, so it cannot be a `sources` entry. See resource map §5.)
 *
 * **The task.** 4,000 uploads per second arrive, and 75% of them are repeats —
 * the same asset re-sent because the client timed out after the work had
 * already been done. There is no idempotency store and one resize worker.
 * Measured: the worker runs at 400% of its capacity, 75% of all traffic is shed
 * and throughput settles at 1,000, which is exactly one worker's ceiling. With
 * the idempotency store absorbing 75% of arrivals, 1,000 requests per second
 * reach the worker and two workers sit at 51%: all 4,000 served, nothing shed.
 *
 * **What this canvas does not model — asserted, not described.** The queue
 * carries `retryLimit`, `maxDepth` and `dlqEnabled`, and the engine reads none
 * of them: there is no redelivery, no poison-message handling and no backpressure
 * from a deep queue. The dedupe store is a `cache` with a `hitRate`, so a "hit"
 * means *this request returned the earlier result and was never forwarded* —
 * which is the consequence of an idempotency key rather than the key itself. So
 * the task grades the decision the engine can see (the duplicate share is
 * absorbed) and one advisory decision it cannot (the queue parks what it cannot
 * process). Lesson 4 states the limitation where a learner looks for the DLQ,
 * and `tests/system-design-content.test.ts` asserts that toggling `dlqEnabled`
 * changes no number, so a later engine slice fails the suite rather than
 * silently falsifying the lesson.
 *
 * **Why the old task was replaced.** Its start and solution differed only in
 * worker `replicas` (1 → 2) and in the queue's `retryLimit`/`dlqEnabled`, both
 * inert. Measured at its own 200 requests per second, both graphs were idle —
 * the criteria could not fail, which makes them decoration.
 *
 * **Chain note.** `check:system-design` is satisfied: the `cache`, `queue`,
 * `worker` and `object_store` nodes module 13's solution carried are all still
 * here, because this module is about what happens *inside* the async path.
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

function uploadGraph(
  arrivalRate: number,
  duplicateShare: number,
  workerReplicas: number,
  dlqEnabled = false,
): SdGraph {
  return {
    nodes: [
      { ...defaultNode("client", "client-1", 40, 260), label: "Uploaders" },
      { ...defaultNode("load_balancer", "lb-1", 200, 260), label: "Edge" },
      {
        ...defaultNode("app_server", "app-1", 360, 260),
        label: "Upload API",
        replicas: 5,
      },
      {
        ...defaultNode("cache", "dedupe-1", 520, 260),
        label: "Idempotency store",
        hitRate: duplicateShare,
      },
      {
        ...defaultNode("queue", "queue-1", 680, 260),
        label: "Upload queue",
        dlqEnabled,
      },
      {
        ...defaultNode("worker", "worker-1", 840, 260),
        label: "Resize worker",
        replicas: workerReplicas,
      },
      {
        ...defaultNode("object_store", "store-1", 1000, 140),
        label: "Blob store",
      },
      { ...defaultNode("database", "db-1", 1000, 380), label: "Asset rows" },
    ],
    edges: [
      wire("e1", "client-1", "lb-1"),
      wire("e2", "lb-1", "app-1"),
      wire("e3", "app-1", "dedupe-1", "seen this key?"),
      wire("e4", "dedupe-1", "queue-1", "enqueue"),
      wire("e5", "queue-1", "worker-1", "consume"),
      wire("e6", "worker-1", "store-1", "blob"),
      wire("e7", "worker-1", "db-1", "row"),
    ],
    scenario: {
      arrivalRate,
      writeShare: 0.9,
      mediaShare: 0,
      bytesPerMediaRequest: 2_000_000,
      abusiveShare: 0,
      latencyJitterMs: 0,
      cacheColdStart: false,
      replicaLagMs: 0,
    },
  };
}

/** The pipeline at a load it can serve, with no duplicates absorbed. */
const conceptGraph = uploadGraph(400, 0, 1);
/** The task's start: 4,000 r/s, 75% duplicates, one worker. */
const taskStartGraph = uploadGraph(4_000, 0, 1);
/**
 * The task's solution: the same load, duplicates absorbed, two workers, and a
 * queue that parks what it cannot process.
 *
 * `dlqEnabled` changes no number — the engine reads none of the queue's retry
 * fields (lesson 4 says so, and the test asserts it). It is set on the solution
 * anyway because the solution *is* a design, and a solution graph that fails its
 * own `park-what-cannot-be-processed` step is a task no learner can finish;
 * `check:system-design`'s orphan check is what caught that.
 */
const taskSolutionGraph = uploadGraph(4_000, 0.75, 2, true);
/** The same pipeline before anyone added an idempotency store. */
const duplicateGraph = uploadGraph(4_000, 0, 4);

const module: SdModule = {
  slug: "idempotency",
  order: 14,
  part: 3,
  partTitle: "Reliability",
  kind: "sim",
  title: "Idempotency & Exactly-Once Delivery",
  description:
    "At-least-once delivery means every message can arrive twice. Absorb repeats with idempotency keys, accept that exactly-once is scoped rather than universal, and park what a queue cannot process instead of retrying it forever.",
  story:
    "Netflix moved billing out of its own data centres months after the streaming path, because a retried charge is a customer complaint and a retried playback start is a second request. Our upload pipeline has the same shape as that decision, only smaller and louder: 4,000 uploads a second arrive, three quarters of them repeats, and there is nothing between the queue and the worker to notice. The worker runs at four times its capacity and the queue drops three quarters of the traffic, all of it genuinely offered. The fix is not more workers — that hides the duplicates instead of removing them. The fix is a key, a store that remembers the first answer, and a queue with a place to put what it will never be able to process.",
  chapters: [
    {
      slug: "delivery-semantics",
      title: "Delivery semantics",
      description:
        "A message that is guaranteed to arrive is a message that can arrive twice.",
      children: [
        {
          slug: "at-least-once-chapter",
          title: "At least once",
          description:
            "Why the queue redelivers, and why that is a capacity problem before it is a correctness problem.",
          lessonSlug: "at-least-once-delivery",
        },
      ],
    },
    {
      slug: "making-repeats-harmless",
      title: "Making repeats harmless",
      description:
        "A key the client generates, a store that remembers, and an honest name for the guarantee.",
      children: [
        {
          slug: "keys-chapter",
          title: "Idempotency keys",
          description:
            "The client chooses the key, the server remembers the answer, the repeat costs nothing.",
          lessonSlug: "idempotency-keys",
        },
        {
          slug: "exactly-once-chapter",
          title: "Exactly once, scoped",
          description:
            "Where the guarantee is real, where it stops, and why the boundary is the side effect.",
          lessonSlug: "exactly-once-is-a-lie",
        },
      ],
    },
    {
      slug: "what-cannot-be-processed",
      title: "What cannot be processed",
      description:
        "A poison message retried forever is a queue that never drains.",
      children: [
        {
          slug: "dlq-chapter",
          title: "Dead letters",
          description:
            "Retry limits, parking, and the difference between a backlog and a wall.",
          lessonSlug: "dead-letter-queues",
        },
      ],
    },
  ],
  lessons: [
    {
      slug: "at-least-once-delivery",
      title: "Every message can arrive twice",
      attribution:
        "Synthesised from Apache Kafka's documentation on delivery semantics, the Amazon SQS dead-letter queue guide, and the AWS Builders' Library on making retries safe.",
      sources: [
        {
          label: "Apache Kafka — documentation",
          url: "https://kafka.apache.org/documentation/",
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
          title: "Three quarters of the queue is repeats",
          body: "The upload API writes an asset row and enqueues a resize job. The worker takes the job, reads the blob, writes a resized copy, and acknowledges. Then the acknowledgement is lost — the worker died after doing the work and before the queue heard about it. The queue does the only correct thing it can: it redelivers. The same asset is resized again, the row is written again, and the second copy is indistinguishable from the first except that it cost a worker a full job.\n\nOn the canvas that is 4,000 arrivals a second of which 3,000 are repeats, one worker at 400% of its capacity, and 75% of all traffic shed. The correctness damage is invisible here — the worker is a capacity multiplier, not a row writer — but the capacity damage is not: throughput settles at 1,000 a second, exactly one worker's ceiling, and three quarters of the offered work is turned away at the door.",
        },
        {
          kind: "concept",
          title: "Three guarantees, and only two of them are honest",
          body: "**At-most-once** means the sender does not retry: a message lost in flight is lost. Cheap, and unacceptable for anything a user paid for.\n\n**At-least-once** means the sender retries until it hears an acknowledgement, so nothing is lost — and anything can be duplicated. This is what every queue you will use actually provides, because the acknowledgement itself can be lost, and the sender has no way to distinguish 'the work did not happen' from 'the work happened and the reply did not arrive'.\n\n**Exactly-once** means neither loss nor duplication. It is not a delivery guarantee any network can give you, and it is not what the phrase usually means when a vendor prints it. It is a property of a system that controls both the write and the record of the write, in one transaction — a scope, not a promise about the world.",
        },
        {
          kind: "concept",
          title:
            "The duplicate is created by the acknowledgement, not the message",
          body: "The interesting part is *where* the duplicate comes from. A sender that retries immediately after posting a message duplicates the message: two copies exist because the first was never confirmed. A consumer that retries after doing the work duplicates the effect: the row, the charge, the email.\n\nBoth duplicates originate in the gap between doing something and recording that it was done. That gap is not a bug in the queue; it is the fundamental shape of a distributed commit. Two parties must agree that an action happened, and they cannot agree atomically over a network, so one of them will sometimes act and then fail to tell the other. Every design that pretends otherwise is either losing messages or duplicating them, and usually choosing which one silently.",
        },
        {
          kind: "concept",
          title:
            "Duplicates are a capacity problem before a correctness problem",
          body: "Teams usually meet this topic through a data bug: two rows, two charges, two emails. The canvas shows the cheaper, earlier symptom — the one that shows up first in production and gets misdiagnosed as a scaling problem.\n\nIf three quarters of your arrivals are repeats, then three quarters of your worker capacity is doing work that has already been done. Measured here, one worker against 4,000 arrivals a second runs at 400% and sheds 75% of traffic; the instinct is to add workers until the shedding stops. That works, and it is the wrong fix: four workers take the queue to exactly 100% and five take it to 80%, all of it still processing duplicates. The capacity you are buying is capacity to repeat yourself.",
        },
        {
          kind: "diagram",
          caption:
            "The pipeline at 400 r/s with nothing absorbed: the worker at 40%, the rest of the tiers idle. Nothing is failing yet — the failure is a function of load and of how much of it is a repeat",
          graph: conceptGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "List three side effects in a system you have worked on that would be wrong if they happened twice. For each, say whether it is currently protected by a key, by a unique constraint, or by nothing at all.",
        },
        {
          kind: "compare",
          body: "A beginner reads 'at-least-once' as a footnote and builds the consumer as if it were exactly-once. A senior engineer reads it as the specification: every consumer must assume it will see the same message again, and every producer must assume its own retry will create a second one.\n\nThe trap is deduplicating in the wrong place. De-duplicating inside the worker means the duplicate has already been enqueued, delivered and started — the expensive part is done. It has to be absorbed at the entry point, before the work is queued, which is the next lesson.",
        },
        {
          kind: "recap",
          points: [
            "At-most-once loses messages; at-least-once duplicates them; exactly-once is a scope, not a delivery guarantee",
            "The duplicate is created in the gap between doing the work and recording that it was done",
            "Redelivery is the queue being correct, not misbehaving",
            "Measured here: 75% repeats put one worker at 400% and cap throughput at 1,000 r/s",
            "Adding workers scales the duplicate processing — absorb the repeat before it is queued",
          ],
        },
      ],
    },
    {
      slug: "idempotency-keys",
      title: "The client chooses the key",
      attribution:
        "Synthesised from Stripe's documentation on idempotent requests and the AWS Builders' Library on making retries safe with idempotent APIs.",
      sources: [
        {
          label: "Stripe — idempotent requests",
          url: "https://docs.stripe.com/api/idempotent_requests",
        },
        {
          label:
            "AWS Builders' Library — making retries safe with idempotent APIs",
          url: "https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/",
        },
        {
          label: "Idempotence (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Idempotence",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The store answers 3,000 requests without forwarding them",
          body: "The upload client generates a key before the first attempt: not a hash of the file, not a server-assigned id, but a value chosen once and reused on every retry. The API writes that key into an idempotency store alongside the response it produced, and it does so *before* enqueueing the work. A repeat arrives with the same key, the store finds it, and the API returns the stored response without touching the queue.\n\nMeasured on this canvas, with the store absorbing 75% of arrivals: 1,000 requests a second reach the queue instead of 4,000, and two workers at 2,000 each sit at 51%. All 4,000 are served and nothing is shed. The duplicates did not disappear — they were answered, which from the client's side is the same thing and from the worker's side is the whole difference.",
        },
        {
          kind: "concept",
          title: "Idempotent means the repeat has the same effect as the first",
          body: "An operation is idempotent when applying it twice leaves the system in the same state as applying it once. `SET balance = 100` is idempotent; `balance = balance + 10` is not. `PUT /assets/abc` is idempotent; `POST /assets` is not, which is precisely why the second one needs a key.\n\nThe property belongs to the operation and the data model, not to the retry policy. A delete is naturally idempotent — the second one finds nothing and succeeds. An insert is not, unless a unique constraint or a key makes it so. The engineering work is to move each non-idempotent write into the second category, one write at a time, starting with the ones that cost money.",
        },
        {
          kind: "concept",
          title:
            "The key must come from the client, and it must be chosen once",
          body: "This is the detail teams get wrong most often. A server-generated key cannot help: the retry is a new request, so the server generates a new key, so the repeat looks like fresh work. The key has to be created upstream of the retry loop and carried through it unchanged — one UUID per *intent*, not per attempt.\n\nThat has a consequence for the client: the key must survive a process restart, because the most interesting retries happen after the app has been killed and relaunched. Stripe's documentation states the rule from the API's side — a key is remembered for a bounded window, and reusing one with a different payload is an error rather than a new request — which is also the cheapest way to catch a client that generates keys wrongly: it starts getting conflicts instead of duplicates.",
        },
        {
          kind: "concept",
          title: "Store the response, not just the key",
          body: "A store that only records 'seen' is half a solution. The repeat arrives, the server knows it is a duplicate, and then has to answer something — and the only correct answer is the response the first attempt produced. Otherwise a client that timed out at 30 seconds gets a 409 for its retry, cannot tell whether its upload succeeded, and retries again.\n\nSo the row is: key, request fingerprint, status, and the serialised response, with a TTL long enough to cover the client's own retry window. The fingerprint matters for the reason above — same key with a different body is a client bug, and answering it with the stored response would silently discard the new data. In the canvas this whole mechanism is one number, the cache's hit rate: a hit means the request was answered here and never forwarded, which is exactly the behaviour described.",
        },
        {
          kind: "concept",
          title: "The unique constraint is the last line of defence",
          body: "A key in a store in front of the queue is a fast path with a race in it: two identical requests can arrive close enough together that both miss the store and both enqueue. The fix is not a lock — it is a unique index on the key in the database, so the second write fails at the storage layer where atomicity is actually guaranteed.\n\nThat ordering is worth internalising: the cheap check absorbs the common case, and the constraint catches the case the cheap check missed. A design with only the store is eventually consistent in the worst way, and a design with only the constraint pays a database round-trip for every duplicate. Both together cost one extra column and one index.",
        },
        {
          kind: "diagram",
          caption:
            "The same 4,000 r/s with the store absorbing 75%: 1,000 reach the queue, two workers sit at 51%, and nothing is shed",
          graph: taskSolutionGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "Design the row you would store for an idempotency key. Name every column, what happens when the same key arrives with a different body, and how long the row lives. Then say which of your writes cannot be protected this way and why.",
        },
        {
          kind: "compare",
          body: "A beginner hashes the request body and calls that the idempotency key, which breaks the moment two genuinely distinct uploads have identical bytes — a re-upload after an edit is a different intent with the same content. A senior engineer has the client generate one key per intent and keeps it stable across every retry of that intent.\n\nThe trap is a key with no expiry. Keys accumulate forever, the store becomes a second database nobody owns, and the lookup that was supposed to be cheap becomes a table scan. Pick a window that covers the client's retry policy and then a bit more.",
        },
        {
          kind: "recap",
          points: [
            "Idempotent means the second application leaves the same state as the first",
            "The key is generated by the client, once per intent, and reused on every retry",
            "Store the response, not just the key, or the retry has nothing to return",
            "A unique constraint catches the race the store misses",
            "Measured here: absorbing 75% of arrivals drops the worker from 400% to 51%",
          ],
        },
      ],
    },
    {
      slug: "exactly-once-is-a-lie",
      title: "Exactly-once is a scope, not a promise",
      attribution:
        "Synthesised from Apache Kafka's documentation on message delivery semantics and transactional producers, and the Wikipedia article on the two generals problem.",
      sources: [
        {
          label: "Apache Kafka — documentation (delivery semantics)",
          url: "https://kafka.apache.org/documentation/",
        },
        {
          label: "Idempotence (Wikipedia)",
          url: "https://en.wikipedia.org/wiki/Idempotence",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Four workers, nothing shed, every message processed twice",
          body: "The shedding stops after somebody adds three more workers. The queue drains, the dashboard is green, throughput reaches 4,000 a second — and every one of the 3,000 duplicate arrivals is still going through the resize worker. Measured on this canvas: four workers take the tier to exactly 100% of its capacity, five to 80%, six to 67%, all with zero shed.\n\nSo the incident is closed and the duplicate writes continue, now with more hardware underneath them. This is the shape of the exactly-once conversation in most teams: the symptom everyone could see was capacity, so capacity is what got bought, and the correctness question was never asked because nothing was on fire anymore.",
        },
        {
          kind: "concept",
          title: "Two generals, and why the network decides for you",
          body: "Two armies must attack at the same time, and they can only communicate by messenger through a valley where messengers are sometimes captured. The first general sends a time. Did it arrive? He needs an acknowledgement. The acknowledgement might be lost, so he needs an acknowledgement of the acknowledgement — and the regress never terminates.\n\nThat is the whole proof, and it applies to every 'did it happen' question across a network: there is no finite number of messages that makes both sides certain. In practice you choose what to do with the uncertainty. Retry until acknowledged and you may duplicate. Never retry and you may lose. A third option — record the intent locally and reconcile later — is what most large systems actually do, and it is a business decision wearing engineering clothes.",
        },
        {
          kind: "concept",
          title: "What Kafka's exactly-once actually promises",
          body: "Kafka does support exactly-once semantics, and the documentation is careful about the scope: it holds for read-process-write cycles *within Kafka*, using an idempotent producer and transactions that make the consumed offsets and the produced records commit together. If a consumer crashes mid-cycle, the transaction aborts, the offsets do not advance, and the records are not visible — so the cycle neither half-happened nor happened twice.\n\nThe boundary is the interesting part. The moment the consumer also charges a card, sends an email, or writes to a data warehouse that is not in the transaction, that side effect is outside the guarantee. Kafka can promise the record moved once; it cannot promise the email was sent once, because the email server has its own memory and its own failure modes. That is not a weakness in Kafka; it is the boundary of any transaction, and it is where every real system has to build its own key.",
        },
        {
          kind: "concept",
          title: "Effectively-once is at-least-once plus a key",
          body: "The honest name for what you build is *effectively once*: the transport delivers at least once, and the consumer's work is idempotent, so the observable state changes exactly once even though the message arrived three times. Two mechanisms, and you need both. A transactional transport without an idempotent side effect still double-charges; an idempotent side effect without retries still loses messages when the broker drops one.\n\nThis is also why the canvas models duplicates as a hit rate on a store in front of the queue rather than as an engine-level redelivery. The store is the mechanism, and the guarantee is a property of what happens when it says yes — a stored answer, not a second execution.",
        },
        {
          kind: "concept",
          title: "Find the side effects that live outside the boundary",
          body: "Make a list of everything a request does that outlives it: rows written, money moved, emails sent, webhooks fired, third-party APIs called, files written to a bucket, messages published to another system. For each, ask whether it sits inside the same transaction as the record that says it happened. Almost nothing does.\n\nEach item on that list then needs its own key, passed to the external system if that system supports one, or protected by a record of intent if it does not. The common failure is to make the database write idempotent and forget the email, so the retry sends a second confirmation for an order that only exists once — a duplicate that no unique constraint can catch and no database transaction can roll back.",
        },
        {
          kind: "diagram",
          caption:
            "Four workers, nothing shed, 4,000 r/s served — and the tier at exactly 100% of its capacity, still processing every duplicate. Capacity fixed the symptom; the key was never added",
          graph: duplicateGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "Take one write path you know. List every side effect it has, mark which ones sit inside one transaction, and for each of the rest name the key, constraint or reconciliation job that would stop it happening twice.",
        },
        {
          kind: "compare",
          body: "A beginner reads a vendor's 'exactly-once delivery' badge and builds the consumer without a key. A senior engineer reads the same page looking for the scope sentence, finds it, and designs the boundary around it — because the guarantee is real and narrower than the badge.\n\nThe trap is deduplicating with a timestamp window. 'Ignore identical requests within five seconds' fails on the retry that arrives at six, and passes on the two genuinely distinct uploads that arrive within one. A client-chosen key has neither problem, because it encodes intent rather than proximity.",
        },
        {
          kind: "recap",
          points: [
            "No finite message exchange makes both sides certain an action happened",
            "Kafka's exactly-once is scoped to read-process-write inside Kafka",
            "Effectively-once is at-least-once transport plus an idempotent consumer",
            "The side effect outside the transaction is the one that duplicates",
            "Measured here: four workers remove the shedding and keep every duplicate",
          ],
        },
      ],
    },
    {
      slug: "dead-letter-queues",
      title: "The message that will never succeed",
      attribution:
        "Synthesised from the Amazon SQS dead-letter queue guide, the AWS Builders' Library on avoiding insurmountable queue backlogs, and Apache Kafka's documentation.",
      sources: [
        {
          label: "Amazon SQS — dead-letter queues",
          url: "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html",
        },
        {
          label:
            "AWS Builders' Library — avoiding insurmountable queue backlogs",
          url: "https://aws.amazon.com/builders-library/avoiding-insurmountable-queue-backlogs/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "One message, retried forever, blocks the queue behind it",
          body: "A malformed upload is enqueued. The worker reads it, fails on the corrupt header, and returns it to the queue — because that is what a retry policy with no limit does. It fails again. It will fail every time, because the input is the problem, and inputs do not get better with repetition.\n\nOn the canvas the consequence is the one the whole module is about: the worker is occupied by work that can never succeed, and the arrivals behind it are shed. The start graph sheds 75% of 4,000 arrivals a second and serves 1,000, and from the outside that is indistinguishable from a capacity problem — which is why teams add workers.\n\nThe fix has two halves, and both are decisions rather than infrastructure: cap the retries, and give the message somewhere to go that is not the back of the queue.",
        },
        {
          kind: "concept",
          title: "Retries are for transient failures, not for input errors",
          body: "A retry is a bet that the failure was temporary: a timeout, a connection reset, a dependency that was restarting. That bet is right often enough to justify the mechanism. It is wrong for every failure caused by the message itself — a schema that no longer parses, a referenced row that was deleted, a file with the wrong encoding.\n\nSeparating the two is the first design step, and it is a classification problem rather than a queue configuration: does retrying this message have any chance of a different outcome? If the answer is no, the retry is not a recovery strategy, it is a delay before the same failure. Most clients let you distinguish the two by error type — 400 and 422 will fail forever, 500 and 503 might not — The discipline is to encode that distinction where the retry is decided.",
        },
        {
          kind: "concept",
          title: "A dead-letter queue is a parking space with a light on it",
          body: "A dead-letter queue is a second queue that receives messages that exhausted their retries. The important property is not storage; it is that the main queue drains, so the work that *can* succeed keeps moving. A DLQ without an alert is a landfill: the messages go somewhere quiet and nobody ever learns that a class of input is failing.\n\nSo the operational requirements are the ones that make it useful. It needs an alarm on depth, because the first message in it is a bug report. It needs the failure reason attached, or the person debugging it has to reproduce the failure to learn what it was. It needs a replay path, so that after the bug is fixed the parked messages can be processed rather than re-uploaded by hand. And it needs a retention policy, because a DLQ nobody drains is a second backlog with the same problem one level down.",
        },
        {
          kind: "concept",
          title: "A backlog is not the same as a wall",
          body: "AWS's article on insurmountable queue backlogs draws the distinction that matters for capacity work. A backlog is a queue that is growing slower than it drains: the consumer is behind, the trend is improving, and the system recovers without intervention. A wall is a queue whose arrival rate exceeds the maximum drain rate — no amount of waiting fixes it, because the consumer is not slow, it is insufficient.\n\nThat distinction decides the response. A backlog gets time and a shed of non-essential traffic; a wall gets capacity, or a decision to drop work deliberately. Waiting out a wall is how a queue grows until the broker runs out of disk. The metric that tells them apart is drain rate against arrival rate, not depth — depth alone cannot distinguish a big backlog from a permanent one.",
        },
        {
          kind: "concept",
          title: "What this canvas does and does not model",
          body: "The queue node carries `maxDepth`, `retryLimit` and `dlqEnabled`, and the engine reads none of them: there is no redelivery loop, no poison-message path, and no backpressure from a deep queue. A message that fails is not modelled at all, so a DLQ cannot change a number here.\n\nThat is why the task grades this decision as a *step* and not as a pass criterion. The step checks that the queue's retry limit is capped and its dead-letter queue is on, which is the design decision; the criteria grade the capacity consequence, which is the half the engine can measure. Lesson 4 states the gap in the module's own voice and the test suite asserts that toggling the flag changes no number, so a later engine slice fails the suite rather than quietly falsifying this page.",
        },
        {
          kind: "diagram",
          caption:
            "The queue with one worker and nothing absorbed: 75% of 4,000 r/s shed, throughput at 1,000. From outside, a poison message and a capacity shortage look identical",
          graph: taskStartGraph,
        },
        {
          kind: "your_turn",
          prompt:
            "Name three consumer failures that would fail identically on every retry. For each, say how you would classify it, how many retries you would allow, and who would be told when it lands in the dead-letter queue.",
        },
        {
          kind: "compare",
          body: "A beginner retries forever, because the alternative is admitting the message is lost. A senior engineer caps the retries, parks the message with its failure reason, alerts on the first one, and builds the replay before the first incident — because the replay is the thing nobody has time to write during one.\n\nThe trap is a dead-letter queue with no owner. Unread and unreplayed, it is a slower, more expensive way of losing the message.",
        },
        {
          kind: "recap",
          points: [
            "Retries are a bet on transient failure; input errors never get better",
            "A dead-letter queue drains the main queue and reports what could not be done",
            "Alarm on depth, attach the reason, keep a replay path, bound the retention",
            "A backlog drains on its own; a wall does not, and depth alone cannot tell them apart",
            "This canvas stores the retry limit and DLQ flag and grades the decision, not the number",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "Your upload API writes an asset row and then enqueues a resize job. The client times out, retries, and the job runs twice. What do you change, and what can you still not promise?",
    strongAnswer:
      "I would make the write and the enqueue carry a client-generated idempotency key, store the key with the response, and let a repeat return the first result instead of doing the work again. The queue then delivers at least once, which is the only guarantee it can actually give, and the consumer becomes idempotent so a redelivery is absorbed rather than duplicated. I would also cap retries and park what keeps failing in a dead-letter queue with an alert, because a message that fails forever blocks the partition behind it. What I still cannot promise is that the user saw the confirmation: my guarantee is that the state changed once and the response is replayable, not that the network delivered the second reply. Exactly-once only exists inside a boundary I control end to end.",
    trap: "Saying 'we will add retries with deduplication in the client' and calling it exactly-once. The client cannot know whether the server did the work; only the server can decide that a key has been seen, and only the store can remember it.",
  },
  task,
  recap: [
    "At-least-once is the only delivery guarantee a network can make you",
    "A duplicate costs capacity before it costs correctness — three quarters of this pipeline's arrivals were repeats",
    "The client generates the key; the server remembers the answer; the repeat returns the first result",
    "Exactly-once is real only inside one transactional boundary, and the side effect is usually outside it",
    "Cap retries and park what cannot be processed, or one message stops the queue",
  ],
  attribution:
    "Synthesised from Netflix's cloud-migration and billing-migration posts, Stripe's idempotent-requests documentation, the AWS Builders' Library on idempotent APIs and queue backlogs, Apache Kafka's documentation on delivery semantics, and the Amazon SQS dead-letter queue guide. Sources are linked per lesson; every capacity figure and error rate comes from this module's canvas.",
};

export default module;
