import type { SdModule } from "../types";
import { defaultNode, getNodeTypeSpec } from "@/lib/system-design/nodes";

/**
 * Module 3 — constraints and the design process, converted to the leaf model
 * (plan 17, slice B2).
 *
 * **Netflix anchor.** The same migration post, read as a process document rather
 * than a reliability story:
 *
 *   - the timeline — begun August 2008, *"after seven years of diligent effort"*,
 *     completed January 2016;
 *   - the sequencing — customer-facing systems before 2015, billing and data
 *     afterwards;
 *   - the constraint — *"we simply could not have racked the servers fast
 *     enough"*, which is a lead-time fact, not a cash fact;
 *   - the published trade — the forklift paragraph, in their own words.
 *
 * The video is a narrated walkthrough of a video-platform architecture. It is a
 * supplement: the lesson reads correctly with the embed removed.
 *
 * **The task's numbers were measured.** Start graph at 1,800 r/s: 0% errors but
 * the app at 0.90 utilisation. Solution: load balancer plus two replicas, 0.45.
 * That gap is the whole lesson — a design can be *working* and still be one
 * request away from the cliff.
 */
const module: SdModule = {
  slug: "constraints-and-design-process",
  order: 3,
  part: 0,
  partTitle: "Mindset",
  kind: "sim",
  title: "Constraints & the design process",
  description:
    "A repeatable way to approach any design, and the judgement to know which box to add. Structure, trade-offs, the anti-patterns that look like maturity — and how to say all of it out loud.",
  story:
    "2014. The migration has been running for six years and it is not finished. You are the engineer who has to explain why to a sceptical VP: the systems are not the problem, the calendar is. Every phase had to be sequenced, because *you cannot rack servers faster than the demand arrives* — Netflix's own phrase for the constraint that made the cloud necessary in the first place. Speaking that sentence clearly, in a review, is the skill this module teaches. Not drawing. Speaking.",
  chapters: [
    {
      slug: "approaching-the-problem",
      title: "Approaching the problem",
      description:
        "A structure that survives a 45-minute interview or a six-year migration, and the trade that every box in it represents.",
      children: [
        {
          slug: "the-45-min-structure-chapter",
          title: "The 45-minute structure",
          description:
            "Requirements, estimate, diagram, deep dive, wrap-up — five blocks with a checkpoint between each.",
          lessonSlug: "the-45-min-structure",
        },
        {
          slug: "tradeoffs-chapter",
          title: "Trade-offs",
          description:
            "Forklift or rebuild, cache or consistency — how to state a trade in three sentences.",
          lessonSlug: "tradeoffs",
        },
      ],
    },
    {
      slug: "what-goes-wrong",
      title: "What goes wrong",
      description:
        "The five anti-patterns that look like seniority, and the narration habit that catches them before a reviewer does.",
      children: [
        {
          slug: "anti-patterns-chapter",
          title: "Anti-patterns",
          description:
            "Designing for a load nobody stated, adding boxes before naming constraints, and forklift thinking.",
          lessonSlug: "anti-patterns",
        },
        {
          slug: "saying-it-out-loud-chapter",
          title: "Saying it out loud",
          description:
            "Constraint first, cost unprompted, uncertainty named — the published post as a design document.",
          lessonSlug: "saying-it-out-loud",
        },
      ],
    },
  ],
  lessons: [
    // ---------------------------------------------------------------------
    {
      slug: "the-45-min-structure",
      title: "A practical 45-minute structure",
      attribution:
        "Synthesised from Hello Interview's interview structure, the system-design-primer's approach section and Netflix's migration account. The minute allocations are our teaching model.",
      sources: [
        {
          label: "Hello Interview — system design in a hurry",
          url: "https://www.hellointerview.com/learn/system-design/in-a-hurry",
        },
        {
          label: "system-design-primer — how to approach an interview",
          url: "https://github.com/donnemartin/system-design-primer",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Seven years, sequenced",
          body: "The Netflix migration took seven years, and the post is unusually honest about why: it was not one decision, it was a sequence. Customer-facing systems first. Billing and customer data after, once *“a secure and durable cloud path”* existed. Each phase had a checkpoint — what is done, what is next, what is deliberately still out.\n\nThat is the same discipline an interview tests in 45 minutes, compressed until the phases fit on one whiteboard. Not because interviews are artificial, but because a design nobody can narrate in order is a design nobody can review. The structure is the deliverable.",
        },
        {
          kind: "concept",
          title: "Minutes 0–5: requirements",
          body: "Ask, then write. Three to five questions that change the design, a short functional list, and the two or three non-functional sentences that will end up as pass criteria.\n\nThe block has one job: make the constraints **visible** so the rest of the answer can be judged against them. *“Assuming 80 million members, two hours of viewing a day, 95% reads, and a hard requirement that payments never duplicate.”* Eighteen seconds of speech, and now every box you draw has a reason.\n\nDo not draw in this block; the whiteboard is the fastest thing you will do.",
        },
        {
          kind: "concept",
          title: "Minutes 5–10: one estimate",
          body: "Two numbers, three at most: peak requests per second, and bytes per second at that peak. That is enough to decide whether you need a cache, a queue and a CDN — and whether a single database can plausibly carry the writes.\n\nShow the arithmetic in one line. *“80 million members × 10 actions ÷ 86,400 ≈ 9,000 per second, peak three times that, so about 28,000.”* Nobody checks the divisor. They check whether you did it at all.\n\nThe failure mode here is the opposite of what you expect: not a wrong number, but no number. A candidate who never estimates spends the next 30 minutes making choices with nothing to justify them.",
        },
        {
          kind: "concept",
          title: "Minutes 10–25: the diagram, two paths",
          body: "Draw the read path and the write path separately, even if they share boxes. Reads and writes fail differently, scale differently and are fixed by different components, so a single arrow labelled *“traffic”* hides the only interesting part of the design.\n\nStart with the smallest chain that works: client → edge → service → store. Then add one box at a time, and say which constraint each one answers. *“Reads are 95%, so a cache sits between the service and the store.”* If you cannot name the constraint, do not add the box — that sentence is the difference between a design and a shopping list.\n\nLeave the canvas boring. The interesting part is the deep dive, and a cluttered diagram gives you nowhere to go.",
        },
        {
          kind: "concept",
          title: "Minutes 25–40: deep dive where the numbers pointed",
          body: "Pick the part your own estimate made interesting. If 95% of traffic is reads, deep-dive the cache: keys, hit rate, invalidation, what happens on a cold start. If writes are the expensive part, deep-dive the write path: ordering, duplicates, retries.\n\nWhat not to do: deep-dive the subsystem you know best. Interviewers notice within a minute, and it reads as a rehearsed answer rather than a design. The deep dive is where you demonstrate judgement, and judgement is visible only when the choice is not obvious.\n\nDepth here means naming the failure, not adding detail. *“If the cache is cold at 8 p.m., every request goes to the store at once — here is what absorbs that.”*",
        },
        {
          kind: "concept",
          title: "Minutes 40–45: the wrap-up nobody plans",
          body: "Three sentences: what breaks first, what you would do next, and what you would measure to know.\n\n*“The store is the first bottleneck; next I would add read replicas and accept replication lag on profile reads. I would measure p95 at peak and the replica lag, and revisit if lag exceeds a second.”*\n\nThis is the block candidates skip when they run out of time, and it is the block interviewers remember, because it proves you know a design is a snapshot rather than a finished thing. It also protects you: naming the weakness before the reviewer does turns a hole into a trade-off.\n\nA structure is not a script. It is a checklist that keeps you from spending fifteen minutes on the part you enjoy.",
        },
        {
          kind: "your_turn",
          prompt:
            "Plan the first ten minutes of: 'take billing out of the data centre.' Write the questions you ask, the estimate you make, and the one sentence you use to state the constraint. Do not draw anything yet.",
        },
        {
          kind: "compare",
          body: "A weak answer starts with components: *“I'd use Kafka, Redis and Kubernetes.”* A strong answer starts with a constraint and arrives at components as a consequence: *“writes must not duplicate, so I need an idempotency key and a single writer per account — that rules out active-active for the ledger.”*\n\nThe second difference is time discipline. Running out of time during the deep dive is fine. Running out of time before the wrap-up is not, because the wrap-up is the only part that shows you can evaluate your own design.",
        },
        {
          kind: "recap",
          points: [
            "The structure is requirements, estimate, diagram, deep dive, wrap-up — each with a checkpoint",
            "Requirements first, and nothing on the whiteboard until they are written",
            "One estimate is enough: peak requests per second and bytes per second",
            "Draw the read path and the write path separately, and add a box only when you can name its constraint",
            "Deep-dive where your own numbers pointed, not where you are comfortable",
            "The wrap-up — what breaks first, what next, what you would measure — is the part that gets remembered",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "tradeoffs",
      title: "Every choice has a cost",
      attribution:
        "Synthesised from Netflix's migration account, the system-design-primer's trade-off sections and Martin Kleppmann's CAP retrospective on InfoQ. Netflix quotations are theirs; the three-sentence form is our teaching device.",
      sources: [
        {
          label: "system-design-primer — trade-offs and scaling",
          url: "https://github.com/donnemartin/system-design-primer",
        },
        {
          label: "CAP twelve years later — how the rules have changed",
          url: "https://www.infoq.com/articles/cap-twelve-years-later-how-the-rules-have-changed/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Forklift or rebuild",
          body: "Netflix names the choice better than any textbook:\n\n> *“Arguably, the easiest way to move to the cloud is to forklift all of the systems, unchanged, out of the data center and drop them in AWS. But in doing so, you end up moving all the problems and limitations of the data center along with it.”*\n\nThe forklift is a quarter of the work and changes nothing. The alternative — *“hundreds of micro-services”*, a denormalised NoSQL model, teams deploying independently — took seven years and changed everything.\n\nBoth are rational. Which one is right depends on what you are optimising for, and that is a trade, not a fact. The job of a design review is to make the trade visible enough that somebody can disagree with it.",
        },
        {
          kind: "concept",
          title: "A trade is three sentences",
          body: "Most people state a trade as one sentence — the benefit — and hope nobody asks for the rest. A complete trade has three parts:\n\n1. **The gain**, tied to a constraint: *“a cache in front of the title store, because 95% of requests read the same catalogue.”*\n2. **The cost**, named concretely: *“staleness and an invalidation path — a member can see a title that was just removed.”*\n3. **The reversal condition**: *“if the field became legally binding, or the hit rate dropped below 60%, I would remove the cache and take the latency.”*\n\nThe third sentence is the one that separates a designer from a memoriser. A trade without a reversal condition is a preference with a cost you have not thought about — and the cost always arrives, usually at the worst hour.",
        },
        {
          kind: "concept",
          title: "The trades this path keeps returning to",
          body: "Almost every box later in this path is one row of this table.\n\n| Add | You gain | You pay |\n| --- | --- | --- |\n| Cache | latency, store capacity | staleness, invalidation, cold start |\n| Read replica | read capacity | replication lag, a failover story |\n| Partition | write capacity | cross-partition queries, hot keys |\n| Queue | absorbing a spike | eventual consistency, a backlog to drain |\n| CDN | distance | a fleet you do not own |\n| Microservices | independent deploys | distributed debugging, network failure |\n\nThe right-hand column is not a list of reasons to avoid these; it is what you must be able to operate before adding the box.",
        },
        {
          kind: "concept",
          title: "Netflix's actual trade, in their words",
          body: "Strip the marketing out of the migration post and it is a trade stated in public:\n\n- **Gain:** *“Elasticity of the cloud allows us to add thousands of virtual servers and petabytes of storage within minutes”*, availability *“nearing our desired goal of four nines”*, and a cost per streaming start that ended up *“a fraction of those in the data center.”*\n- **Cost:** seven years, a rewrite of *“virtually all of our technology”*, and new skills. They also admit the cloud did not remove failure: *“while we have hit some inevitable rough patches in the cloud.”*\n- **Reversal condition:** implicit, and honest — *“Cost reduction was not the main reason we decided to move to the cloud.”* They did not move to save money; they moved because the constraint was capacity lead time, not price.\n\nThat last line is the most useful sentence in the post. A project justified by the wrong benefit gets judged by the wrong number, and then someone cancels it because costs went up while elasticity was the point.",
        },
        {
          kind: "concept",
          title: "Doing nothing is also a trade",
          body: "The status quo has a balance sheet even when nobody writes it down. Staying in the data centre in 2008 meant keeping the vertically scaled databases whose failure mode was *three days without shipping a DVD*, and accepting that demand could arrive faster than hardware.\n\nThis matters because *“we'll leave it as it is”* is the only option that never has to justify itself. In a review, make it explicit: state what the current design costs per year in reliability, in lead time, and in the workarounds people have built around it. A trade that only prices the new option is not a comparison, it is an advertisement.\n\nA useful habit: if you cannot name what the status quo costs, you are not ready to argue for a change — you are just enthusiastic about one.",
        },
        {
          kind: "your_turn",
          prompt:
            "Pick two components you would consider adding to a video platform. For each, write the three-sentence trade: gain tied to a constraint, cost named concretely, and the condition under which you would reverse it. Then state the cost of the status quo.",
        },
        {
          kind: "compare",
          body: "Beginners say *“I'll add Redis”*. Engineers say *“I'll cache title metadata because reads dominate and the payload is small; I'm accepting staleness bounded by the TTL, and I'll invalidate on publish; if a removed title must vanish immediately for legal reasons, the cache goes.”*\n\nThe second sentence is longer and it is the whole answer. Notice it can be argued with — which is exactly what a design review is for. A choice nobody can disagree with is not a design decision, it is a style preference.",
        },
        {
          kind: "recap",
          points: [
            "Every box buys a capability and charges an operational cost",
            "A complete trade has three parts: gain, cost, and the condition that reverses it",
            "The recurring trades — cache, replica, partition, queue, CDN, services — are the spine of this path",
            "Netflix moved for elasticity, not cost; judge a project by the benefit it was justified on",
            "Doing nothing has a price, and a review that omits it is an advertisement",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "anti-patterns",
      title: "Common mistakes to avoid",
      attribution:
        "Synthesised from Netflix's migration account, Martin Fowler's writing on the microservice premium and Google's SRE chapter on cascading failures. Named anti-patterns are a synthesis of interview feedback, not a published taxonomy.",
      sources: [
        {
          label: "Martin Fowler — the microservice premium",
          url: "https://martinfowler.com/bliki/MicroservicePremium.html",
        },
        {
          label: "Google SRE Book — addressing cascading failures",
          url: "https://sre.google/sre-book/addressing-cascading-failures/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The constraint is not always money",
          body: "Netflix's reason for leaving the data centre is one clause, and it is not about cost: *“we simply could not have racked the servers fast enough.”*\n\nThe bottleneck was **lead time** — weeks to order, rack and wire a machine, against demand that could double inside a quarter. The anti-pattern it invites: buy more of the thing that is already the bottleneck, and keep the constraint.\n\nEvery anti-pattern below is the same mistake in a different costume: a response that does not name the constraint it is answering.",
        },
        {
          kind: "concept",
          title: "Designing for a load nobody stated",
          body: "The most common answer in an interview starts *“to handle a billion users…”* before anyone has established whether the number is a thousand or a billion. It sounds senior and it is the opposite: it is a design with no requirement behind it, so nothing in it can be wrong and nothing can be justified.\n\nThe fix is a sentence, said early: *“I'm designing for 3,000 requests per second at peak; if it's a hundred times that, three components change.”* Now your design has a scope, and the interviewer can move the scope instead of guessing.\n\nThe same mistake wears a suit in production: a service built for a load that never arrived, carrying complexity its team cannot remove without a migration.",
        },
        {
          kind: "concept",
          title: "Adding a component before naming the constraint",
          body: "A cache, a queue, a service mesh and a Kubernetes cluster are all answers. Without the question they are inventory.\n\nTest every box with one sentence: *“this exists because ______, and it moves ______ from ______ to ______.”* Fill the blanks or delete the box. *“This cache exists because 95% of reads hit the same catalogue, and it moves read latency from 8 ms to 0.5 ms.”* That box is justified. *“This queue exists because queues are good practice”* is not an argument, and the on-call rota will write the missing clause for you at 3 a.m.\n\nThe corollary: a component you cannot monitor is one you cannot justify — you will never know whether it is doing the job you added it for.",
        },
        {
          kind: "concept",
          title: "Forklift thinking, and the microservice reflex",
          body: "The forklift moves systems without changing their design, which is why Netflix rejected it: *“you end up moving all the problems and limitations of the data center along with it.”* The move is easy; the limitation travels with the boxes.\n\nThe modern version is the microservice reflex — *“we'll split it into services”* as a first move rather than a last resort. Fowler's **microservice premium** names the trade honestly: the pattern buys independent deploys and team autonomy, and charges you a distributed system — network calls that fail, eventually consistent data, and a debugging session spanning five logs. Worth paying at a certain organisational size; a tax before that.\n\nA monolith with clean module boundaries is not an embarrassing intermediate state. It is usually the correct design for the size of the team and the problem.",
        },
        {
          kind: "concept",
          title: "Designing only the happy path",
          body: "A diagram of successful requests has described the easy half of the system; the half that pages you is the other one.\n\nThree questions expose it. **What happens when the store is slow rather than down?** (Not an error — a queue, then a timeout, then a retry storm.) **What happens when ten thousand clients retry at once?** (Google's SRE book calls the result a cascading failure: one saturated dependency turns into a system-wide outage because every caller retries faster than the dependency recovers.) **Which single component, if it disappears, stops the product?** (If the answer is one, you have a design decision to make, not a fact to accept.)\n\nYou need not solve all three in 45 minutes; naming them is what turns a picture into a design.",
        },
        {
          kind: "concept",
          title: "The quiet one: an unmeasurable claim",
          body: "*“It'll be fast.” “It's highly available.” “It scales horizontally.”* Each sounds like a property and behaves like an opinion: nobody can fail it, so it survives every review and dies in the first incident.\n\nThe fix is mechanical: attach a number, a window and a population — *p95 under 200 ms over five minutes across all reads*. If you cannot produce those three, the honest sentence is *“I don't know yet — here is how I'd measure it”*, which is stronger than the confident one. It is last because it hides in adjectives rather than in a diagram.",
        },
        {
          kind: "your_turn",
          prompt:
            "You are reviewing the design for a launch into 130 countries in one day. Name three anti-patterns you would refuse in the review, and for each write the constraint it violates in one sentence with a number.",
        },
        {
          kind: "compare",
          body: "Beginners demonstrate knowledge by naming technology. An engineer demonstrates judgement by naming what they refused and why. *“I am not adding a queue here because the write is synchronous and the caller must know it succeeded; a queue would move the failure into a place nobody is watching.”*\n\nThe second trap is treating anti-patterns as forbidden techniques: a cache is not bad, but a cache on the write path because caching is good practice is. The pattern is fine; the missing constraint is the mistake.",
        },
        {
          kind: "recap",
          points: [
            "Netflix's constraint was lead time, not money — buy more of the bottleneck and you keep the constraint",
            "Design for the load you stated, and say what would change if it moved",
            "Every box must answer a named constraint, or it is inventory",
            "Forklift thinking moves the problem with the boxes; the microservice premium is real and payable later",
            "Name the failure path — slow dependencies, retry storms, single points of failure",
            "An unmeasurable claim is the anti-pattern that survives review",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "saying-it-out-loud",
      title: "Saying it out loud",
      attribution:
        "Synthesised from Netflix's published migration account, Hello Interview's communication guidance and Google's SRE chapter on postmortem culture. The structure taught here is our own; the quotations are Netflix's.",
      sources: [
        {
          label: "Hello Interview — system design in a hurry",
          url: "https://www.hellointerview.com/learn/system-design/in-a-hurry",
        },
        {
          label: "Google SRE Book — postmortem culture",
          url: "https://sre.google/sre-book/postmortem-culture/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The post is the deliverable",
          body: "In February 2016 three Netflix vice-presidents published a page describing eight years of work. Read it as a design document rather than an announcement and the structure is startlingly plain:\n\n1. **What broke** — *“a major database corruption and for three days could not ship DVDs.”*\n2. **What we chose** — cloud-native, not forklift; hundreds of micro-services; a denormalised data model.\n3. **What it cost** — seven years, a rewrite, *“some inevitable rough patches.”*\n4. **What we got** — elasticity, availability nearing four nines, a fraction of the cost per streaming start.\n\nFour headings, no diagrams, readable by anyone in the company. That is what a finished design sounds like when it is written down. If yours cannot survive that shape, it is not finished — it is a picture.",
        },
        {
          kind: "concept",
          title: "Constraint first, component second",
          body: "The order of a sentence teaches the listener how to judge it. Say the component first and you have asked for trust; say the constraint first and you have offered evidence.\n\n> *“Reads are 95% of traffic at 28,000 per second. The store serves 5,000, so it is the first bottleneck. I'm putting a cache in front of the title metadata — the cost is staleness bounded by the TTL.”*\n\nThree sentences: constraint, consequence, choice. Notice that the cache arrives last and is the least interesting part. That is what it feels like to listen to someone who has actually thought about it.\n\nThe reverse order — *“I'll add Redis. It's read-heavy.”* — is not wrong, it is unfalsifiable. The listener has to reconstruct the constraint before they can disagree, and most will not bother; they will simply decide you sounded confident or you did not.",
        },
        {
          kind: "concept",
          title: "Say the cost before you are asked",
          body: "Every reviewer is waiting for the catch. Volunteer it and you buy credibility for the rest of the answer; withhold it and the review becomes a hunt.\n\n*“This design accepts replication lag on profile reads — a member may see their old avatar for a second after uploading a new one. I'm choosing that over a synchronous fan-out because the write path would then depend on every replica being up.”*\n\nThat sentence does three things at once. It names the user-visible consequence, it names the alternative that was rejected, and it explains why the alternative was worse. Most design disagreements are not about the choice — they are about whether the chooser knew.\n\nNetflix does this in the post, unprompted: *“while we have hit some inevitable rough patches in the cloud.”* One clause, and the document stops reading like marketing.",
        },
        {
          kind: "concept",
          title: "Name your uncertainty",
          body: "The strongest sentence in a design review is *“I don't know the write rate; if it is above 2,000 per second this design changes.”*\n\nUncertainty stated is a question somebody can answer. Uncertainty hidden becomes an assumption the whole design rests on, discovered during an incident. The sentence also does something subtler: it tells the room which number would change your mind, which is the definition of a decision someone can actually review.\n\nThere is a wrong way to do it — *“I'm not sure about anything, it depends”* — which is not uncertainty, it is abdication. The right form always pairs the unknown with its consequence: *unknown → threshold → what changes*.",
        },
        {
          kind: "concept",
          title: "Write the wrap-up first",
          body: "Before you draw, write the three sentences you want the room to leave with: what you chose, what it costs, and what breaks first. Then build the diagram backwards from them.\n\nThis is not a presentation trick. Writing the summary first forces the design to have a claim, and a design with a claim can be argued with — which is the point of reviewing it. It also catches the most common structural defect early: a design whose most important component cannot be described in one sentence is usually a design that has not decided what it is for.\n\nAt the end of a 45-minute interview, the interviewer remembers roughly three sentences. Choose them deliberately rather than discovering them in the last two minutes.",
        },
        {
          kind: "video",
          videoId: "EDOK1DWYy4I",
          title:
            "System Design in Bangla | High-Level Architecture of a Video Streaming Platform",
          caption:
            "A narrated walkthrough of a video-platform architecture — the habit this lesson teaches, in Bangla: constraint, then component, then cost. Watch it as a second pass, then try to narrate your own diagram in the same order.",
        },
        {
          kind: "your_turn",
          prompt:
            "Record yourself for three minutes explaining a design you have built. No diagram at first — only sentences: constraint, choice, cost, what breaks first. Then listen back and count how many sentences are claims you could defend with a number.",
        },
        {
          kind: "compare",
          body: "The beginner narration describes the picture: *“here's the client, here's the load balancer, here's the database.”* It is accurate and it teaches the listener nothing, because a picture already shows the boxes.\n\nThe engineer's narration explains the *decisions*: what the numbers said, which alternative was rejected, what it costs, and what would change their mind. Same diagram, different content — and only one of them is a design review.",
        },
        {
          kind: "recap",
          points: [
            "A finished design can be written as four headings: what broke, what we chose, what it cost, what we got",
            "Say the constraint before the component — evidence before trust",
            "Volunteer the cost, and name the alternative you rejected",
            "Pair every uncertainty with its threshold and what would change",
            "Write the wrap-up first and build the diagram backwards from it",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "Walk me through how you would approach designing a video platform from scratch.",
    strongAnswer:
      "I start with requirements, not boxes: who uses it, how many, and which non-functional requirement would hurt most if it failed. Then one estimate — peak requests per second and bytes per second — because that decides whether I need a cache, a queue and a CDN at all. I draw the read path and the write path separately, adding one component at a time and naming the constraint each one answers. Then I deep-dive where my own numbers pointed, usually the read path for a catalogue or the write path for anything that must not duplicate. I close with what breaks first, what I would do next, and what I would measure. Throughout I say the cost of each choice before I am asked, because a trade nobody can disagree with is not a decision.",
    trap: "Starting with technology — Kafka, Redis, Kubernetes — before stating a single constraint. And skipping the wrap-up: naming what breaks first turns a hole into a trade-off, and it is the part reviewers remember.",
  },
  task: {
    brief:
      "The review's last question is always the same: what breaks first? This design works at 1,800 requests per second with zero errors — and the app server is already at 90% of its capacity. Put one door in front, give yourself room, and make the numbers show it.",
    startGraph: {
      nodes: [
        { ...defaultNode("client", "client-1", 60, 180), label: "Members" },
        {
          ...defaultNode("app_server", "app-1", 300, 180),
          label: "Playback API",
        },
        {
          ...defaultNode("database", "db-1", 520, 180),
          label: "Title store",
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
          label: "reads",
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 1_800,
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
          ...defaultNode("load_balancer", "lb-1", 240, 180),
          label: "One door",
        },
        {
          ...defaultNode("app_server", "app-1", 420, 180),
          label: "Playback API",
          replicas: 2,
        },
        {
          ...defaultNode("database", "db-1", 620, 180),
          label: "Title store",
        },
      ],
      edges: [
        {
          id: "e1",
          from: "client-1",
          to: "lb-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e2",
          from: "lb-1",
          to: "app-1",
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
        {
          id: "e3",
          from: "app-1",
          to: "db-1",
          label: "reads",
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 1_800,
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
        id: "one-door",
        title: "Put one door in front",
        brief:
          "Every client request should arrive at a single entry point, and nothing should reach the app server directly — a load balancer that can be bypassed is decoration.",
        hint: "Add a load balancer, wire the client to it, then delete the direct client → app edge.",
        reveal:
          "Client → load balancer → app server. The direct edge is the one that lets a client skip the door during a deploy.",
        check: (g) => {
          const lb = g.nodes.find((n) => n.type === "load_balancer");
          if (!lb) return { passed: false, progress: "Add a load balancer" };
          const wired = g.edges.some(
            (edge) =>
              edge.to === lb.id &&
              g.nodes.find((n) => n.id === edge.from)?.type === "client",
          );
          const bypass = g.edges.some((edge) => {
            const from = g.nodes.find((n) => n.id === edge.from);
            const to = g.nodes.find((n) => n.id === edge.to);
            return from?.type === "client" && to?.type === "app_server";
          });
          if (!wired)
            return {
              passed: false,
              progress: "Connect a client to the balancer",
            };
          return {
            passed: !bypass,
            progress: bypass
              ? "Remove the direct client → app server edge"
              : "✓ One door, no bypass",
          };
        },
      },
      {
        id: "headroom",
        title: "Leave headroom at peak",
        brief:
          "1,800 requests per second, no component above 80% utilisation. One instance serves 2,000.",
        hint: "The app server's replicas live in the Inspector.",
        reveal:
          "1,800 ÷ 0.8 = 2,250 requests per second of required capacity. Two instances give 4,000, which is 45% utilisation — room for a burst and a deploy.",
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
        label: "Error rate = 0% at 1,800 requests per second",
        required: true,
        explain:
          "The start design already reaches this, and that is the point: a design can be error-free and still one burst away from shedding. The next criterion is the review question.",
        assert: (r) => r.valid && r.errorRate === 0,
      },
      {
        id: "headroom",
        label: "No component above 80% utilisation at peak",
        required: true,
        explain:
          "The app starts at 90%. At that level a single extra request lengthens the queue, and queue wait is what turns a working design into a cliff. This is the module 2 rule applied as a review question: what breaks first?",
        assert: (r) => r.valid && r.perNode.every((n) => n.utilisation <= 0.8),
      },
    ],
  },
  recap: [
    "A design is a sequence of phases with checkpoints, not one decision",
    "Requirements, estimate, diagram, deep dive, wrap-up — and the wrap-up is the remembered part",
    "Every box is a trade: gain, cost, and the condition that reverses it",
    "Netflix moved for elasticity, not cost; saying the wrong reason puts a project on the wrong scorecard",
    "Anti-patterns are responses that never named their constraint",
    "Constraint first, component second, cost unprompted, uncertainty paired with its threshold",
  ],
  attribution:
    "Synthesised from Netflix's own account of completing its cloud migration, Hello Interview's interview structure, the system-design-primer, Martin Fowler on the microservice premium, Martin Kleppmann's CAP retrospective and Google's SRE Book. Sources are linked per lesson. Netflix quotations are as published; every other framework is a teaching device and labelled as one.",
};

export default module;
