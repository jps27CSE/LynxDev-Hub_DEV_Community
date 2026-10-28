import type { SdModule } from "../types";
import { defaultNode, getNodeTypeSpec } from "@/lib/system-design/nodes";

/**
 * Module 2 — requirements, converted to the leaf model (plan 17, slice B2).
 *
 * **Netflix anchor.** One paragraph of the migration post does the work:
 *
 *   - *"The majority of our systems, including all customer-facing services, had
 *     been migrated to the cloud prior to 2015."*
 *   - *"Since then, we've been taking the time necessary to figure out a secure
 *     and durable cloud path for our billing infrastructure as well as all
 *     aspects of our customer and employee data management."*
 *
 * Two systems, one company, one cloud — and a year between them. The post never
 * says *why* billing had different requirements; it only says the path had to be
 * "secure and durable". So the reasons given in these lessons are labelled as
 * reasoning, not as Netflix's own words. That distinction is the whole discipline
 * of a case study: quote what is published, mark what you inferred.
 *
 * **The task's numbers were measured, not chosen.** `npm`-run simulations of the
 * start and solution graphs on 2026-10-28: start invalid (`No terminal datastore`),
 * solution 0% errors at 3,000 r/s with every node at 0.75 utilisation or below.
 * The 80% rule is the same sentence the learner meets in modules 3 and 4, so the
 * gate teaches one habit three times rather than three unrelated thresholds.
 *
 * **The task graph intentionally starts a new canvas.** `check:system-design`'s
 * chain check warns that this startGraph has no `database` while module 1's
 * solution did. That is the exercise: this canvas is the *membership* service,
 * the second system from "Two systems, one company", and the requirement being
 * tested is durability — so there is no store to inherit. The task brief says so
 * in its first sentence, which is where a reviewer reading the warning lands.
 */
const module: SdModule = {
  slug: "requirements",
  order: 2,
  part: 0,
  partTitle: "Mindset",
  kind: "sim",
  title: "Requirements",
  description:
    "Requirements are discovered by asking, not assumed. Turn a vague ask into a number you can fail — and learn why Netflix moved its streaming product years before it moved billing.",
  story:
    "February 2016. The migration is done, and a reviewer asks the obvious question: the announcement says most systems — including every customer-facing one — were already in the cloud before 2015, so why did the whole thing only finish in January 2016? The answer is one sentence further down the same page, and it is not about difficulty: 'Since then, we've been taking the time necessary to figure out a secure and durable cloud path for our billing infrastructure.' Streaming and billing were built from two different sets of requirements. Nobody handed the team a document that said so — they had to dig it out by asking. That is this module.",
  chapters: [
    {
      slug: "what-to-build",
      title: "What to build",
      description:
        "The two halves of a requirement — what the system does, and how well — and the questions that turn both into something you can check.",
      children: [
        {
          slug: "functional-vs-nonfunctional-chapter",
          title: "Functional vs non-functional",
          description:
            "Two systems, one company, a year apart — and the difference is not the feature list.",
          lessonSlug: "functional-vs-nonfunctional",
        },
        {
          slug: "eliciting-requirements-chapter",
          title: "Eliciting requirements",
          description:
            "The six questions that do most of the work, and why the read/write ratio is the first fork.",
          lessonSlug: "eliciting-requirements",
        },
      ],
    },
    {
      slug: "how-well-and-what-not",
      title: "How well, and what not",
      description:
        "Turning 'fast' into a number with a window, and writing down the boundary of what you are deliberately not building.",
      children: [
        {
          slug: "turning-fast-into-a-number-chapter",
          title: "Turning 'fast' into a number",
          description:
            "Availability arithmetic, percentiles, and the error budget that makes a target shippable.",
          lessonSlug: "turning-fast-into-a-number",
        },
        {
          slug: "what-youre-not-building-chapter",
          title: "What you're not building",
          description:
            "Scope is a requirement with a date — and every feature you keep is a requirement you must meet.",
          lessonSlug: "what-youre-not-building",
        },
      ],
    },
  ],
  lessons: [
    // ---------------------------------------------------------------------
    {
      slug: "functional-vs-nonfunctional",
      title: "Functional vs non-functional requirements",
      attribution:
        "Synthesised from Netflix's own account of completing its cloud migration, Hello Interview's system-design framing and the system-design-primer. The reasoning about payments is labelled as reasoning, not as a Netflix statement.",
      sources: [
        {
          label: "Netflix — completing the cloud migration (their own account)",
          url: "https://about.netflix.com/news/completing-the-netflix-cloud-migration",
        },
        {
          label: "Hello Interview — system design in a hurry",
          url: "https://www.hellointerview.com/learn/system-design/in-a-hurry",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Two systems, one company",
          body: "The Netflix announcement, read quickly, sounds like one migration. Read carefully, it is two.\n\n*“The majority of our systems, including all customer-facing services, had been migrated to the cloud prior to 2015.”* Billing left last, in January 2016. Same company, same cloud, same engineers — a year behind the thing everybody could see.\n\nNothing about billing has more **features** than streaming. It has fewer. What it has is a different answer to one question: *what happens if this is wrong?* That answer is a requirement, and it decided the schedule.",
        },
        {
          kind: "concept",
          title: "Functional requirements are the verbs",
          body: "A functional requirement says what the system does. A member can start a title. A member can resume where they stopped. An operator can add a title to the catalogue. A card can be charged once for one month.\n\nTwo properties matter. First, each one is **demonstrable**: you can show it working, and a test can fail it. Second, functional requirements are the part everybody lists — because they are visible, and because a product manager can write one without knowing anything about architecture.\n\nA design that satisfies every functional requirement and none of the non-functional ones is a demo. It does the right things at the wrong speed, for the wrong number of people, losing data politely.",
        },
        {
          kind: "concept",
          title: "Non-functional requirements are the adverbs",
          body: "A non-functional requirement says *how well*, *for whom*, *under what conditions*. It carries a number and a scope: p95 playback start under two seconds on a mobile connection; 99.99% of playback requests succeed over a calendar month; a payment record is never lost and never duplicated; only the account owner can read the billing history.\n\nThree of those four are numbers. The fourth is a condition you can test. An NFR that cannot be tested is a preference, and a preference survives review and fails in production.\n\n| Question | Functional | Non-functional |\n| --- | --- | --- |\n| What grows the checklist? | another feature | another qualifier |\n| Who writes it? | product | whoever operates the system |\n| What does it change? | screens and endpoints | caches, replicas, queues, indexes |\n| How does it fail? | a wrong result | a slow, missing or duplicated result |\n\nThe right-hand column is the architecture.",
        },
        {
          kind: "concept",
          title: "Same company, different answer to 'what if it's wrong?'",
          body: "Streaming's non-functional requirement is **latency at scale**: a member presses play and expects a frame in under two seconds, from any device, during prime time. The system that satisfies it looks like a CDN, a cache tier and stateless services that can be copied when demand grows.\n\nBilling's is **correctness under retry**: a charge happens exactly once, is attributable to a person, survives an audit years later, and can be reversed. The system that satisfies it looks like a ledger, idempotency keys, and a database somebody is careful with.\n\nThe post does not spell that reasoning out — it only says the team needed *“a secure and durable cloud path”* for billing. The reasons above are ours. But the shape of the delay will be familiar to anyone who has worked on payments: a system whose failure is a legal event gets migrated last, by people who are not in a hurry.",
        },
        {
          kind: "concept",
          title: "NFRs pick the architecture, FRs pick the endpoints",
          body: "Here is the claim the rest of this path rests on: two systems with identical feature lists can need completely different architectures, because their NFRs differ.\n\nAdd a read-heavy workload and a cache appears. Add geography and a CDN appears. Add a spike and a queue appears. Add a write that must not duplicate and idempotency keys appear. Add a number of concurrent users and replicas appear. None of those boxes came from a feature list; every one came from a qualifier.\n\nSo the beginner move — list features first, draw boxes second — produces a design that solves the visible half of the problem. The engineer's move is to ask, of every feature: *how fast, how available, how correct, for how many, and who may do it?* Each answer is a constraint, and a design is a list of constraints before it is a diagram.",
        },
        {
          kind: "video",
          videoId: "5WVl9F_7f7k",
          title:
            "System Design in Bangla | YouTube-Like System Design (Functional & Non-Functional Requirements)",
          caption:
            "The same split applied to a different system: a video platform's feature list, and the qualifiers that decide what its architecture has to be.",
        },
        {
          kind: "your_turn",
          prompt:
            "Take four features of a video service — start a title, resume playback, add a profile, charge a card — and write one functional and two non-functional requirements for each. Then circle the one NFR you could not measure today, and say what you would instrument to measure it.",
        },
        {
          kind: "compare",
          body: "Beginners treat NFRs as a quality checklist to mention at the end. Experienced designers treat them as the input: the cache, the replica and the queue exist because a number said so, and if you delete the number you cannot justify the box.\n\nThe second trap is writing NFRs nobody owns. *“Highly available”* is not a requirement. *“99.99% of playback requests succeed, measured over a calendar month, alerting at half the budget”* is one — it has a number, a window, and a person who gets paged.",
        },
        {
          kind: "recap",
          points: [
            "Functional requirements are what it does; non-functional are how well, for whom, under what conditions",
            "An NFR without a number, a scope and a window is a preference",
            "Netflix moved customer-facing systems years before billing because their NFRs differ, not their features",
            "Caches, replicas and queues exist because an NFR demanded them",
            "Two systems with identical feature lists can need different architectures",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "eliciting-requirements",
      title: "Eliciting requirements: ask before you design",
      attribution:
        "Synthesised from the system-design-primer's step one, Hello Interview's clarifying-questions framing and Netflix's migration account. Every number in the worked exchange is a teaching model.",
      sources: [
        {
          label: "system-design-primer — use cases, constraints, assumptions",
          url: "https://github.com/donnemartin/system-design-primer",
        },
        {
          label: "Hello Interview — system design in a hurry",
          url: "https://www.hellointerview.com/learn/system-design/in-a-hurry",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The requirement nobody wrote down",
          body: "Nobody at Netflix ever received a document saying *keep billing in the data centre for another year*. If they had, the migration would have been planned around it from the start. What existed instead was a sentence in a status meeting: *we need to figure out a secure and durable path for billing*. That sentence is a requirement with the words filed off — and finding out what it means is the work.\n\nIn an interview you get *“design Netflix”*. At work you get *“make it faster”*. Neither is a spec. Both are an invitation to ask, and the questions you ask are the design.",
        },
        {
          kind: "concept",
          title: "Six questions that do most of the work",
          body: "Most of the value comes from a short, boring list. Ask them in this order, and stop asking when the answer stops changing the design.\n\n| Question | What it changes | If the answer is 'big', you add |\n| --- | --- | --- |\n| Scope — what is in v1? | how many systems exist | nothing yet — you delete some |\n| How many users, now and in a year? | capacity | replicas, partitions |\n| Read/write mix? | whether copies are safe | cache, read replicas |\n| Payload — text, images or video? | bytes per request | object storage, CDN |\n| Where are the users? | distance | CDN, multiple regions |\n| What must never happen? | the failure budget | replication, idempotency, backups |\n\nThe last row is the one that explains Netflix's schedule. For streaming, the unacceptable outcome is a playback that does not start. For billing, it is a charge that happens twice or not at all. Different answer, different migration date.",
        },
        {
          kind: "concept",
          title: "The read/write ratio is the first fork",
          body: "Before any estimation, one number splits the design: what share of requests change state?\n\n**Read-heavy** work is easy to copy. Ten machines can serve the same title metadata and disagree about nothing, because the answer is the same everywhere. Scale arrives by duplication: caches, replicas, CDNs.\n\n**Write-heavy** work is where copies become a problem. Two machines accepting the same payment must agree on which one is real, and agreement costs coordination: a single writer, a quorum, a ledger with a sequence.\n\nSo the ratio decides the shape of the whole system. A catalogue at 95% reads is a caching problem. A payment system at 50% writes is a consistency problem — and consistency problems are the expensive kind. When you ask *“reads or writes?”* you are really asking *“can I copy my way out of this?”*",
        },
        {
          kind: "concept",
          title: "Assumptions are a deliverable",
          body: "You will not get exact numbers, so you state assumptions and design for them. The sentence has a fixed shape:\n\n> *“Assuming 80 million members, two hours of viewing a day, and 5% of requests are writes, the peak is about 3,000 requests per second.”*\n\nNow the design can be argued with. Someone who knows the real write rate can correct you in ten seconds, which is exactly what you want — far better than a diagram that quietly encodes a wrong number nobody can see.\n\nTwo rules. Name the assumption you would **bet** on, not all of them; a list of twenty is a way of hiding the one that matters. And when an assumption changes mid-project, say which boxes it invalidates. An assumption is not a disclaimer, it is an input.",
        },
        {
          kind: "concept",
          title: "Write the questions down before you draw",
          body: "In an interview, spend the first three to five minutes asking and confirming, with nothing on the whiteboard. In a review, spend the first page. The temptation is to start drawing because drawing feels like progress; the drawing is the fastest thing you will do all week, and the requirements are the slowest.\n\nA useful test before you draw anything: **can you state the design's success condition in one sentence with a number in it?** If not, you are not ready. *“Playback starts in under two seconds at p95 for 50,000 concurrent streams in one region”* is ready. *“It should be fast and scalable”* means you have not asked yet.",
        },
        {
          kind: "your_turn",
          prompt:
            "You are told: 'Design the next Netflix market launch.' Write six questions in order of importance, and for each say what you would do differently if the answer were ten times larger. Then state the single assumption you would bet the design on.",
        },
        {
          kind: "compare",
          body: "A weak answer asks questions to fill time: *“How many users?”* — then ignores the answer. A strong answer asks the question whose answer changes the design, and says so out loud: *“If this is read-heavy I will cache aggressively; if it is write-heavy I will not, so which is it?”*\n\nThe second difference is what happens after the answer. Beginners collect requirements and then draw the thing they already had in mind. Engineers let the answer delete a box.",
        },
        {
          kind: "recap",
          points: [
            "Requirements are discovered by asking, and the questions are the design",
            "Six questions cover most of it: scope, scale, read/write, payload, geography, what must never happen",
            "The read/write ratio decides whether you can copy your way out of the problem",
            "State the assumption you would bet on, and say which boxes it invalidates",
            "If you cannot state the success condition in one sentence with a number, you are not ready to draw",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "turning-fast-into-a-number",
      title: "Turning 'fast' into a number",
      attribution:
        "Synthesised from Google's SRE Book and SRE Workbook on service level objectives, and Netflix's stated goal of four nines of availability. The downtime arithmetic is exact; every other figure is labelled as a teaching model.",
      sources: [
        {
          label: "Google SRE Book — service level objectives",
          url: "https://sre.google/sre-book/service-level-objectives/",
        },
        {
          label: "Google SRE Workbook — implementing SLOs",
          url: "https://sre.google/workbook/implementing-slos/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Four nines of what?",
          body: "The Netflix migration post ends its reliability paragraph with a target: they were *“nearing our desired goal of four nines of service uptime”*.\n\nFour nines is 99.99%. Of what — every request, or only playback starts? Measured over a month, a quarter, or a rolling seven days? Excluding planned maintenance, or including it? Until those three questions are answered, the sentence is a slogan, not a requirement.\n\nThis lesson is the conversion. It takes the adjectives teams actually say out loud — fast, reliable, always up — and turns each one into a number with a window, a measurement point and a consequence.",
        },
        {
          kind: "concept",
          title: "Availability is arithmetic",
          body: "Availability is the share of time or requests that succeed. Written as nines it becomes a budget of failure you can spend:\n\n| Target | Downtime per year | Per month | Per week |\n| --- | --- | --- | --- |\n| 99% (two nines) | 3.65 days | 7.2 hours | 1.7 hours |\n| 99.9% (three) | 8.76 hours | 43.8 minutes | 10.1 minutes |\n| 99.99% (four) | 52.6 minutes | 4.38 minutes | 60.5 seconds |\n| 99.999% (five) | 5.26 minutes | 26.3 seconds | 6.05 seconds |\n\nFour nines is **4.4 minutes a month**. That is the whole reason the number is hard: it is shorter than one bad deploy, one DNS mistake, one person noticing a dashboard. Choosing a target is choosing how much of your engineering week goes to reliability, so the target has to be a decision somebody owns — not a word in a slide.",
        },
        {
          kind: "concept",
          title: "Latency is a percentile with a scope",
          body: "*“Fast”* usually means an average, and an average is the one number that cannot fail. One hundred playback starts, ninety-nine at 200 ms and one at 10 seconds:\n\n```\naverage = (99 × 200 ms + 1 × 10,000 ms) / 100 = 298 ms\np50     = 200 ms\np99     = 10,000 ms\n```\n\nThe average says *“about 300 ms, fine”*. The p99 says one member in a hundred waited ten seconds — and at a million starts a day, that is ten thousand people, several times a minute. Averages hide the requests that generate complaints.\n\nSo the shape of a usable latency requirement is: **percentile, threshold, window, population**. *“p95 playback start under 2 s, over 5-minute windows, for mobile devices in one region.”* Change the population and you may change the answer, which is why it is written down.",
        },
        {
          kind: "concept",
          title: "The error budget buys your shipping",
          body: "A target of 100% is not ambitious, it is unshippable: every deploy risks a few failed requests, so a 100% target forbids deploying. The SRE answer is to subtract the target from 100% and call the remainder a **budget**.\n\nAt 99.99% you have 4.4 minutes a month to spend. Spend them deliberately: a rollout that fails 0.5% of requests for two minutes costs a minute of budget. When the budget is gone, feature work stops and reliability work starts — and that rule was agreed before the argument, which is the only time it can be agreed.\n\nThis is what makes an SLO different from an SLA. The SLA is what you promise a customer, with money attached. The SLO is the internal target, deliberately tighter, so that you notice before they do.",
        },
        {
          kind: "concept",
          title: "The test: could a machine fail this?",
          body: "Before a requirement leaves the room, write it in the fixed form:\n\n> **metric** · comparator · **number** · **window** · **population**\n\n*“99.99% of playback-start requests succeed, measured over a calendar month, across all regions”* passes. *“The platform should be highly available”* fails, and the failure is not pedantry: nobody can build a dashboard for it, nobody can be paged for it, and nobody can prove it was met.\n\nThe same test applies to the adjectives you will hear next week. *“Fast”* → which percentile? *“Reliable”* → measured how, over what? *“Scalable”* → at what load, and what should the curve look like? Every question is a number waiting to be said out loud.",
        },
        {
          kind: "your_turn",
          prompt:
            "Write three requirements in the metric‑comparator‑number‑window‑population form: one for playback start, one for availability, one for billing correctness. Then say which of the three you would page a human for at 3 a.m., and why the other two can wait until morning.",
        },
        {
          kind: "compare",
          body: "The beginner version promises the best number: *“we'll be up 99.999% of the time.”* The engineer's version asks what it costs and who pays. Five nines means no deploys without a canary, no single-region dependency, and a staffed rotation — a real bill, and worth paying only if the alternative is worse.\n\nThe second trap is promising a number you cannot measure. If nobody can compute *“99.99% of what, over which window”* from real telemetry, the requirement is decoration, and the first outage will be spent arguing about whether it counted.",
        },
        {
          kind: "recap",
          points: [
            "Four nines is 52.6 minutes a year — a budget, not a mood",
            "Every availability target is a decision somebody owns and a bill somebody pays",
            "A percentile without a window and a population is not a requirement",
            "The error budget is the rule that lets you ship while the target still means something",
            "If a machine cannot fail the requirement, it is a preference",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "what-youre-not-building",
      title: "What you're not building",
      attribution:
        "Synthesised from Netflix's migration account, the system-design-primer's scope guidance and Wikipedia's treatment of high availability. The lesson's central claim — that scope is a requirement with a date — is a framework, not a Netflix quote.",
      sources: [
        {
          label: "Netflix — completing the cloud migration",
          url: "https://about.netflix.com/news/completing-the-netflix-cloud-migration",
        },
        {
          label: "system-design-primer — scope the problem",
          url: "https://github.com/donnemartin/system-design-primer",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The line Netflix drew",
          body: "Read the migration post again and notice how much of it is about a boundary that was chosen on purpose.\n\n*“The majority of our systems, including all customer-facing services, had been migrated to the cloud prior to 2015. Since then, we've been taking the time necessary to figure out a secure and durable cloud path for our billing infrastructure…”*\n\nThat is a scope decision written down in public. Customer-facing first. Billing and customer data afterwards, deliberately, with the reason attached. The migration was not late; the scope was sequenced, and the sequence was the design.\n\nMost teams cannot say which system they are *not* migrating this quarter, and that is why their estimates are fiction.",
        },
        {
          kind: "concept",
          title: "Scope is a requirement with a date",
          body: "A requirement says what must be true. A scope says **by when**, and what is allowed to stay false until then. Both are needed, and only one of them usually gets written down.\n\nThe useful form of a scope line has three parts:\n\n1. **In:** the things this phase must do, with their NFRs.\n2. **Out:** the things this phase must not do — and for each, the reason.\n3. **Trigger:** what would have to become true for an *out* to move *in*.\n\nNetflix's billing line is exactly this shape. Out of the first phase; reason, a secure and durable path did not exist yet; trigger, the path exists. When the trigger was met, the work started. Until then, nobody had to rediscover the decision every sprint.",
        },
        {
          kind: "concept",
          title: "Every feature you keep is a requirement you must meet",
          body: "Features are not free at design time even when they are free at build time, because each one imports its own NFRs.\n\nAdd *resume playback* and you need to store a position per member per title — small, but written on every pause, so a write path. Add *profiles* and every one of those keys gains a dimension, and permissions arrive. Add *downloads* and you need storage on the device, licence expiry, and a sync protocol that works offline. Each is a sentence in a product meeting and a column, an index and a failure mode in your system.\n\nSo the honest scoping question is not *“can we build it?”* — usually yes. It is *“which NFRs does it import, and can we meet them this phase?”* Cut the feature and you delete its NFRs with it. That is the cheapest architecture work available.",
        },
        {
          kind: "concept",
          title: "Write the not-list before the diagram",
          body: "A design document with no *not* list is a wish list. The not-list is what makes the rest reviewable, because it defines the edges of the claim.\n\n*“Not in v1: billing, offline downloads, recommendations. Billing moves when we can show a durable, auditable path. Downloads move when we can license and expire them. Recommendations move when we have enough watch history to be better than a popularity list.”*\n\nRead that back and notice how much engineering it prevents. Nobody spends a sprint on a recommendation service for a product with eight hours of history. Nobody argues about the billing migration because the condition is stated. Scope written this way is not a limitation on ambition; it is the schedule that ambition runs on.",
        },
        {
          kind: "concept",
          title: "Deferred is only cheap if the design leaves a seam",
          body: "There is a catch, and it is the reason this lesson follows the estimation one. Saying *“later”* is cheap only if later is actually possible. A monolith with one database and one deploy can defer microservices forever and still be fine — until the day the payment path needs a different release cadence from playback, and there is no seam to cut along.\n\nThe seam is usually one of three: a module boundary inside the monolith, a queue between two responsibilities, or a separate data store for data with different correctness needs. Each costs a little now and buys the option to split later. That option is what the scope line is spending.\n\nWhat you must not do is defer a feature **and** close the seam, then describe the result as flexibility.",
        },
        {
          kind: "your_turn",
          prompt:
            "Write the scope line for the first phase of a video service: three things in, three things out, and a trigger for each out. Then name the one seam you would leave in the design so that the most expensive out can move in without a rewrite.",
        },
        {
          kind: "compare",
          body: "Beginners scope by ambition: *“we'll do everything, then prioritise.”* Engineers scope by constraint: *“we can meet these NFRs for these features by this date, and not those.”* The second sentence sounds less exciting and survives contact with a calendar.\n\nThe other trap is a not-list with no trigger. *“Not now”* without a condition is how a deferred feature becomes a forgotten one — or worse, gets rebuilt by a different team two years later because nobody recorded why it was out.",
        },
        {
          kind: "recap",
          points: [
            "Netflix sequenced the migration and published the boundary — scope written down is a decision, not a delay",
            "A scope line has three parts: in, out, and the trigger that moves an out to in",
            "Every feature imports its own NFRs; cutting the feature deletes them",
            "A design document without a not-list is a wish list",
            "Deferring is only cheap if the design leaves a seam to cut along later",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape: "How do you decide what to build first when everything is wanted?",
    strongAnswer:
      "I separate functional from non-functional requirements, then scope by constraint rather than ambition. Netflix is the example I use: most systems, including all customer-facing ones, were in the cloud before 2015, but billing stayed in the data centre until January 2016 because they needed a secure and durable path first. Same company, different non-functional requirement — a failed charge is a legal event, a buffering video is an annoyance. So I write the scope line explicitly: what is in, what is out, and what would have to become true to move an out to in. Then I check that the design leaves a seam for the most likely out, because deferring a feature without a seam is not deferring, it is hiding a rewrite.",
    trap: "Listing features and calling it requirements. Or saying 'everything is high priority' — which is the same as saying nothing is scoped. The second trap is a not-list with no trigger: 'not now' with no condition is how a deferred feature becomes a forgotten one, or gets rebuilt by another team two years later.",
  },
  task: {
    brief:
      "The requirement is written down, which means it can fail: zero errors at a peak of 3,000 requests per second, member records that survive a restart, and no component above 80% utilisation at that peak. This canvas is the membership service, not the playback API from module 1 — it starts as one app server and no storage. Make it meet the sentence.",
    startGraph: {
      nodes: [
        { ...defaultNode("client", "client-1", 60, 180), label: "Members" },
        {
          ...defaultNode("app_server", "app-1", 300, 180),
          label: "Membership app",
        },
      ],
      edges: [
        {
          id: "e1",
          from: "client-1",
          to: "app-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 3_000,
        writeShare: 0.05,
        mediaShare: 0,
        bytesPerMediaRequest: 2_000_000,
        abusiveShare: 0,
        latencyJitterMs: 0,
        cacheColdStart: false,
        replicaLagMs: 0,
      },
    },
    solutionGraph: {
      nodes: [
        { ...defaultNode("client", "client-1", 60, 180), label: "Members" },
        {
          ...defaultNode("app_server", "app-1", 300, 180),
          label: "Membership app",
          replicas: 2,
        },
        {
          ...defaultNode("database", "db-1", 520, 180),
          label: "Member records",
        },
      ],
      edges: [
        {
          id: "e1",
          from: "client-1",
          to: "app-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e2",
          from: "app-1",
          to: "db-1",
          label: "durable writes",
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 3_000,
        writeShare: 0.05,
        mediaShare: 0,
        bytesPerMediaRequest: 2_000_000,
        abusiveShare: 0,
        latencyJitterMs: 0,
        cacheColdStart: false,
        replicaLagMs: 0,
      },
    },
    steps: [
      {
        id: "durable-store",
        title: "Make the record survive a restart",
        brief:
          "The requirement says member records survive a restart. Nothing on this canvas stores anything yet.",
        hint: "Look at the Data section in the palette, then draw the connection.",
        reveal:
          "A request that ends at the app server leaves no trace. Add a database and connect the app to it.",
        check: (g) => {
          const stored = g.edges.some((edge) => {
            const from = g.nodes.find((n) => n.id === edge.from);
            const to = g.nodes.find((n) => n.id === edge.to);
            return (
              from?.type === "app_server" &&
              (to?.type === "database" ||
                to?.type === "object_store" ||
                to?.type === "cache")
            );
          });
          return {
            passed: stored,
            progress: stored
              ? "✓ Storage connected"
              : "Connect the app server to a data store",
          };
        },
      },
      {
        id: "meet-the-peak",
        title: "Meet the peak the requirement states",
        brief:
          "3,000 requests per second, and no component above 80% utilisation. One instance serves 2,000.",
        hint: "Open the app server in the Inspector and raise its replicas.",
        reveal:
          "3,000 ÷ 0.8 = 3,750 requests per second of capacity. At 2,000 per instance that is two instances, not one.",
        check: (g) => {
          const appCapacity = g.nodes
            .filter((n) => n.type === "app_server")
            .reduce(
              (total, node) =>
                total + getNodeTypeSpec("app_server").capacity * node.replicas,
              0,
            );
          const needed = g.scenario.arrivalRate / 0.8;
          return {
            passed: appCapacity >= needed,
            progress: `${appCapacity.toLocaleString()} of ${Math.ceil(
              needed,
            ).toLocaleString()} requests per second of app capacity`,
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "zero-errors",
        label: "Error rate = 0% at 3,000 requests per second",
        required: true,
        explain:
          "The number in the requirement, not a round one: at 3,000 one instance saturates and starts shedding. The requirement was written down so this could be failed loudly rather than discovered at launch.",
        assert: (r) => r.valid && r.errorRate === 0,
      },
      {
        id: "headroom",
        label: "No component above 80% utilisation at peak",
        required: true,
        explain:
          "A design that exactly fits its peak is one request away from its first error. 80% leaves room for a burst, a slow query and a deploy. You will meet this same rule in modules 3 and 4.",
        assert: (r) => r.valid && r.perNode.every((n) => n.utilisation <= 0.8),
      },
    ],
  },
  recap: [
    "Functional requirements are verbs; non-functional requirements decide the architecture",
    "Netflix moved streaming years before billing because their NFRs differ",
    "Ask six questions — scope, scale, read/write, payload, geography, what must never happen",
    "Turn 'fast' into percentile, threshold, window and population, then attach an error budget",
    "Write the not-list with a trigger, and leave a seam for the most expensive out",
    "A requirement you cannot fail is a preference",
  ],
  attribution:
    "Synthesised from Netflix's own account of completing its cloud migration, the system-design-primer, Hello Interview's system-design framing, and Google's SRE Book and Workbook. Sources are linked per lesson. No source text is reproduced: Netflix's words are quoted as published, the reasoning about payments is labelled as ours, and every capacity figure is a teaching model.",
};

export default module;
