import type { SdModule } from "../types";
import { defaultNode, getNodeTypeSpec } from "@/lib/system-design/nodes";

/**
 * Module 4 — back-of-the-envelope estimation, converted to the leaf model
 * (plan 17, slice B2).
 *
 * **Netflix anchor.** The migration post supplies the two facts this module
 * needs, and nothing else:
 *
 *   - *"On January 6, 2016, Netflix expanded its service to over 130 new
 *     countries"* — capacity had to be estimated before the demand existed;
 *   - *"we simply could not have racked the servers fast enough"* — lead time is
 *     one of the numbers, and it is the one that ends the argument;
 *   - *"eight times as many streaming members"* and viewing up *"three orders of
 *     magnitude in eight years"* — the unit of estimation is the exponent.
 *
 * **Every figure is a teaching model unless it is quoted.** The post publishes
 * growth ratios, not absolute totals, so the worked example uses a stated
 * 80-million-member assumption and says so at every step. That is the lesson's
 * own rule applied to itself: an assumption you can see is an argument; one you
 * cannot see is a trap.
 *
 * **The task's numbers were measured.** Start graph at 6,000 r/s: 33.3% errors,
 * app at 1.50 utilisation. Four app replicas plus one read replica: 0% errors,
 * 0.75. Capacity planning is the estimate turned into instance counts.
 *
 * The start graph is module 3's solution unchanged — same load balancer, two app
 * replicas, no read replica. That is deliberate: the previous module taught the
 * *structure*, and this one changes only the *numbers* it has to carry. A chain
 * that deleted the load balancer here would unteach the lesson one module later.
 */
const module: SdModule = {
  slug: "back-of-the-envelope",
  order: 4,
  part: 0,
  partTitle: "Mindset",
  kind: "sim",
  title: "Back-of-the-envelope estimation",
  description:
    "Estimate scale with arithmetic you can do on a whiteboard: powers of two, a latency ladder, QPS, storage, bandwidth and Little's Law — and what to do when you do not know the inputs.",
  story:
    "January 6, 2016. Netflix turns on service in more than 130 countries in a single day. Somewhere before that morning, a small group of people had to answer three questions in a meeting: how many requests per second will arrive, how many bytes per second will leave, and how long does it take to add capacity when the answer is wrong? None of those numbers existed yet. They were estimated — and the estimates decided where the boxes went. This module is that arithmetic, and the honesty about assumptions that makes it useful.",
  chapters: [
    {
      slug: "the-numbers",
      title: "The numbers",
      description:
        "The two ladders worth memorising — powers of two and latency — and the three sums every estimate is built from.",
      children: [
        {
          slug: "powers-of-two-and-latency-numbers-chapter",
          title: "Powers of two and latency",
          description:
            "Orders of magnitude, the hardware ladder, and why one removed hop beats a hundred micro-optimisations.",
          lessonSlug: "powers-of-two-and-latency-numbers",
        },
        {
          slug: "qps-storage-bandwidth-chapter",
          title: "QPS, storage, bandwidth",
          description:
            "Three sums, one worked example: 28,000 requests per second, 300 TB of video, 33 Tbps of egress.",
          lessonSlug: "qps-storage-bandwidth",
        },
      ],
    },
    {
      slug: "using-the-numbers",
      title: "Using the numbers",
      description:
        "Concurrency from Little's Law, and what to do when the inputs are guesses — which they always are.",
      children: [
        {
          slug: "littles-law-chapter",
          title: "Little's Law",
          description:
            "Concurrency = arrival rate × time in system, and why latency is a capacity problem.",
          lessonSlug: "littles-law",
        },
        {
          slug: "estimation-under-uncertainty-chapter",
          title: "Estimation under uncertainty",
          description:
            "Bracket the unknown, find the factor that decides, and write an estimate that survives being wrong.",
          lessonSlug: "estimation-under-uncertainty",
        },
      ],
    },
  ],
  lessons: [
    // ---------------------------------------------------------------------
    {
      slug: "powers-of-two-and-latency-numbers",
      title: "Powers of two & latency numbers",
      attribution:
        "Synthesised from Colin Scott's interactive latency page and the system-design-primer's latency-numbers section. The ladder is the standard teaching table; the scaled-up analogy is ours.",
      sources: [
        {
          label: "Colin Scott — interactive latency numbers",
          url: "https://colin-scott.github.io/personal_website/research/interactive_latency.html",
        },
        {
          label:
            "system-design-primer — latency numbers every programmer should know",
          url: "https://github.com/donnemartin/system-design-primer",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Three orders of magnitude",
          body: "Netflix's migration post reports growth in two units. Membership: *“eight times as many streaming members”*. Viewing: *“growing by three orders of magnitude in eight years.”*\n\nEight times is a factor you can plan for. A thousand times is a different universe, and the difference between the two sentences is the whole discipline of estimation: **get the exponent right, and the digits will not matter.**\n\nA back-of-the-envelope estimate is not a smaller version of a spreadsheet. It is a claim about which power of ten you are in, made fast enough to change the design in the same meeting.",
        },
        {
          kind: "concept",
          title: "Powers of two, rounded to something you can say",
          body: "Storage and memory are base-2; humans speak base-10. For estimation, the two are close enough that the rounding error is never the reason you are wrong:\n\n| Binary | Exact | Say | Error |\n| --- | --- | --- | --- |\n| 2^10 | 1,024 | 1 thousand (KB) | 2.4% |\n| 2^20 | 1,048,576 | 1 million (MB) | 4.9% |\n| 2^30 | 1,073,741,824 | 1 billion (GB) | 7.4% |\n| 2^40 | 1.0995 × 10^12 | 1 trillion (TB) | 10% |\n\nThat is the entire table worth memorising. It converts *“we need 1.4 TB”* into *“about a thousand gigabytes”* without a calculator, and the second sentence is the one you can say out loud while drawing.\n\nThe rule that follows: **never quote a precise number you estimated.** *“Roughly 300 TB”* is honest and adjustable. *“307.2 TB”* invites an argument about the third digit and hides the assumption underneath it.",
        },
        {
          kind: "concept",
          title: "The latency ladder",
          body: "Every design question is ultimately a question about how far data travels. Five rungs cover almost all of it:\n\n| Operation | Latency | Ratio to the rung above |\n| --- | --- | --- |\n| L1 cache reference | ~1 ns | — |\n| RAM reference | ~100 ns | 100× slower |\n| SSD random read | ~100 µs | 1,000× slower |\n| Same-datacentre round trip | ~0.5 ms | 5× slower |\n| Disk seek | ~10 ms | 20× slower |\n| Cross-continent round trip | ~150 ms | 15× slower |\n\nTwo cliffs matter more than the middle. **Memory to disk is a thousand-fold** — which is why the first cache you add is worth more than any code you optimise. **Machine to machine is a network hop**, which is why a design that moves work across a boundary pays for it on every request, not once.",
        },
        {
          kind: "concept",
          title: "The analogy that makes it stick",
          body: "Human brains are bad at nanoseconds. Scale the whole ladder by a billion, so an L1 reference takes one second:\n\n- RAM: **100 seconds** — under two minutes.\n- SSD read: **28 hours** — most of a day.\n- Same-datacentre round trip: **5.8 days**.\n- Disk seek: **116 days**.\n- Cross-continent round trip: **4.75 years**.\n\nNow the sentence *“we'll just fetch it over the network”* sounds like what it is: waiting four and a half years for a reply, in a design review that was supposed to take forty-five minutes.\n\nThis is not a gimmick. It is the reason a CDN exists (shorten the 4.75-year hop), the reason an index exists (avoid the 116-day one), and the reason caching is the first tool in every scaling story (avoid the 28-hour one).",
        },
        {
          kind: "concept",
          title: "What the ladder decides",
          body: "Comparisons only matter when they are multiplied by traffic. A hundred milliseconds saved on one request is nothing; on a million requests a day it is **27.8 hours** of human waiting.\n\n```\n1,000,000 requests × 0.1 s = 100,000 s = 27.8 hours\n```\n\nSo rank your options by *cost removed per request × how often the request happens*:\n\n- Removing one network hop: ~0.5 ms × every request.\n- Removing one database read: ~2 ms × the read share.\n- Shaving 10% off a JSON serializer: ~0.05 ms × the read share.\n\nThe arithmetic is not there to impress anyone. It is there to stop you spending a week on the third row while the first row is untouched — which is the most common way a performance project fails to move the number it was funded for.",
        },
        {
          kind: "your_turn",
          prompt:
            "Estimate, without a calculator: how long it takes to serve 10 million reads if each read makes one cross-continent round trip instead of one same-datacentre call. Then say which single change you would make first, and which you would refuse to fund.",
        },
        {
          kind: "compare",
          body: "A beginner quotes latency numbers to sound precise. An engineer uses two of them — memory versus disk, and one network hop — and gets the design right.\n\nThe trap is memorising the table and never applying it. If you can recite 150 ms but still put a chatty service call inside a loop that runs 50 times per request, you have learned trivia. The ladder is a decision tool: it tells you which boundary is expensive, and therefore which one to remove.",
        },
        {
          kind: "recap",
          points: [
            "Estimation is about the exponent; the digits rarely change the design",
            "2^10, 2^20, 2^30, 2^40 as thousand, million, billion, trillion — within 10%",
            "Memory-to-disk is a thousand-fold; machine-to-machine is a hop you pay on every request",
            "Scaled by a billion, a cross-continent round trip is 4.75 years",
            "Rank optimisations by cost removed × frequency, not by how clever they feel",
            "Never quote a precise number you estimated",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "qps-storage-bandwidth",
      title: "QPS, storage and bandwidth",
      attribution:
        "Synthesised from the system-design-primer's back-of-the-envelope section and Hello Interview's estimation guidance. The 80-million-member model is stated as an assumption; the formulas are standard.",
      sources: [
        {
          label: "system-design-primer — back-of-the-envelope calculations",
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
          title: "The three sums before a launch",
          body: "Before the January 2016 launch, three numbers had to exist: requests per second, bytes stored, and bits per second leaving the network. They answer different questions and fail in different ways.\n\nThis lesson does all three on one worked example. **The inputs are a teaching model, not Netflix's published figures** — the post gives growth ratios, not absolute totals. Assume **80 million members**, 10 actions per member per day, 95% reads, 2 hours of viewing a day at 5 Mbps. Every step below shows the assumption so you can move it.\n\nThat is the format: assumption, arithmetic, consequence. Three lines per number.",
        },
        {
          kind: "concept",
          title: "Requests per second, from a daily number",
          body: "```\nrequests/day   = 80,000,000 members × 10 actions = 800,000,000\nseconds/day    = 24 × 3,600                = 86,400\n average QPS   = 800,000,000 ÷ 86,400       ≈ 9,300 per second\n peak (3×)     = 27,900                     ≈ 28,000 per second\n```\n\nTwo habits turn arithmetic into a design. First, **peak is the number you plan for**, because capacity is provisioned for the worst hour and paid for all day. Three times average is a common planning factor for consumer traffic; the multiple is a question you ask, not a constant you assume.\n\nSecond, split it by read and write: 95% of 28,000 is **26,600 reads per second** and **1,400 writes**. That split is what decides your next two boxes. Reads can be copied — a cache, a replica — and writes cannot. One number became two, and the two have different shapes.",
        },
        {
          kind: "concept",
          title: "Storage is about the artefact, not the request",
          body: "Requests per second scale with people. Storage scales with **things** — and for video, one thing is enormous.\n\n```\ncatalogue      = 20,000 titles\nrenditions     = 5 per title (a bitrate ladder)\nsize           = 3 GB per rendition\nstorage        = 20,000 × 5 × 3 GB = 300,000 GB ≈ 300 TB\n```\n\nThen compare it with the metadata, which is what most people picture when they hear *“database”*:\n\n```\nmetadata       = 20,000 titles × 10 KB ≈ 200 MB\n```\n\n**300 TB of video, 200 MB of facts about it.** A factor of a million and a half, in one comparison. That is the entire argument for an object store: the row and the bytes have different sizes, different access patterns and different costs, so they belong in different systems. Putting video in a relational database is not a scaling mistake you discover later; the arithmetic shows it before you write code.",
        },
        {
          kind: "concept",
          title: "Bandwidth is concurrency × bitrate",
          body: "Bandwidth is not requests per second. It is *streams at once* multiplied by *bits per stream*.\n\n```\nconcurrent streams = 80,000,000 members × (2 h ÷ 24 h) ≈ 6,700,000\nbandwidth          = 6,700,000 × 5 Mbps = 33,500,000 Mbps ≈ 33 Tbps\n```\n\nThirty-three terabits per second, continuously, in the middle of the evening. No ordering of servers makes that number small, and no single region can serve it. The arithmetic does not suggest a CDN — it **ends the discussion**: the bytes have to be somewhere near the viewer, in thousands of locations, or the egress bill is the product.\n\nThis is why the formula matters more than the answer: at 1 hour of viewing it is 16 Tbps, at 10 Mbps it is 66 Tbps, and every version leads to the same decision — the sign of a robust estimate.",
        },
        {
          kind: "concept",
          title: "Three numbers, three consequences",
          body: "| Estimate | Rough size | What it forces |\n| --- | --- | --- |\n| Requests per second | 28,000 peak | replicas, a load balancer, a cache for the read share |\n| Storage | 300 TB of video, 200 MB of metadata | an object store for bytes, a database for facts, a CDN for delivery |\n| Bandwidth | 33 Tbps at peak | edge caching, not a bigger origin |\n\nThe third column is a list of boxes you now have permission to add. In a review, *“we need a CDN”* is an opinion; *“33 Tbps from one origin is not a design, it is a bill”* is an argument.\n\nNone of these numbers is precise, and none needs to be: each decision is stable across a factor of two, and that stability is the only accuracy an estimate owes you.",
        },
        {
          kind: "video",
          videoId: "WLYgEASg3Io",
          title:
            "System Design Basics in Bangla | Capacity Estimation Explained",
          caption:
            "A Bangla walkthrough of capacity estimation — the same three sums in your first language, with the arithmetic spoken rather than read.",
        },
        {
          kind: "your_turn",
          prompt:
            "Redo the three sums with your own assumptions: 40 million members, 3 hours of viewing, 4 Mbps, 5% writes. Then say which of the three answers changed by more than 2×, and which design decision did not change at all.",
        },
        {
          kind: "compare",
          body: "A weak estimate gives one number with no assumptions: *“about 30,000 requests per second.”* A strong one gives the assumption, the arithmetic and the consequence: *“at 80 million members and 10 actions a day, peak is about 28,000; that is 26,600 reads, which is why a cache is the first box.”*\n\nThe second trap is estimating the easy number. Requests per second is comfortable; bytes per second is where video companies live or die. If your estimate has no bandwidth line, you have estimated the part of the system that was never the problem.",
        },
        {
          kind: "recap",
          points: [
            "QPS = (users × actions per day) ÷ 86,400, then multiply by the peak factor",
            "Split reads from writes: reads can be copied, writes cannot",
            "Storage scales with artefacts, and video makes metadata look like a rounding error",
            "Bandwidth = concurrent streams × bitrate — 33 Tbps ends the CDN argument",
            "Each number licenses a box; without the number the box is an opinion",
            "An estimate is robust when a factor of two does not change the decision",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "littles-law",
      title: "Little's Law",
      attribution:
        "Synthesised from the standard treatment of Little's Law and the Erlang unit of offered load. The worked figures reuse the 80-million-member teaching model from the previous lesson.",
      sources: [
        {
          label: "Wikipedia — Little's law",
          url: "https://en.wikipedia.org/wiki/Little%27s_law",
        },
        {
          label: "Wikipedia — Erlang (unit)",
          url: "https://en.wikipedia.org/wiki/Erlang_%28unit%29",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "How many requests are in the air?",
          body: "You have estimated 28,000 requests per second. Now a different question, and it is the one that decides your connection pools, your thread counts and your memory: **how many of them are being worked on at this instant?**\n\nThe answer is not 28,000. It is 28,000 multiplied by how long each one takes. At a 40 ms read that is about 1,100 requests in flight. At 400 ms it is about 11,200 — same traffic, ten times the resources, because something got slower.\n\nThat relationship has a name, and it is the most useful line of arithmetic in capacity planning.",
        },
        {
          kind: "concept",
          title: "L = λW, in one line",
          body: "Little's Law, stated plainly:\n\n```\nL = λ × W\n\nL = items in the system right now    (concurrency)\nλ = arrival rate                     (requests per second)\nW = time each item spends inside     (seconds)\n```\n\nThe units are the proof: requests per second × seconds = requests. No distribution assumptions, no queueing model, no steady-state caveat you need to understand to use it. It holds for a checkout queue, a database connection pool and a CDN.\n\nRead it in the direction that helps. If you know the traffic and the latency, you know the concurrency. If you know the concurrency your pool allows and the latency, you know the maximum traffic. The second reading is how you find a capacity ceiling before it finds you.",
        },
        {
          kind: "concept",
          title: "The worked example that changes a design",
          body: "Using the module's model — 26,600 reads per second at peak:\n\n```\nW = 40 ms  →  L = 26,600 × 0.040 = 1,064 in flight\nW = 400 ms →  L = 26,600 × 0.400 = 10,640 in flight\n```\n\nNow put those against a connection pool of 1,000. At 40 ms the design fits with a little room. At 400 ms it needs more than ten thousand connections — and a tier-1 database instance holds far fewer, which is why it queues, which is why latency rises further, which is why the pool is now the thing that fell over while everyone stared at CPU graphs showing 20%.\n\nThis is the arithmetic behind *“the database was at 20% CPU and the site was down.”* The scarce resource was not compute. It was **slots**, and slots are concurrency, and concurrency is Little's Law.",
        },
        {
          kind: "concept",
          title: "Latency is a capacity problem",
          body: "The formula has an uncomfortable consequence: at fixed throughput, **halving latency halves the concurrency you need.** A performance fix is a capacity fix, purchased for free.\n\nThe reverse is the mechanism behind cascading failure. Something gets slower — a bad query, a cold cache, a noisy neighbour — so concurrency rises, so the pool saturates, so the queue lengthens, so latency rises further. Each turn of that loop makes the next turn worse, and the system does not recover when the original slowness ends; it recovers when the queue drains or the load is shed.\n\nThat is why a timeout is not a nicety. A caller waiting 30 seconds holds a slot for 30 seconds, and at 28,000 requests per second a 30-second timeout is a very large number of slots. Module 13 turns this into a policy; here it is only the arithmetic that says the policy is necessary.",
        },
        {
          kind: "concept",
          title: "The other direction: a ceiling you can compute",
          body: "The same equation answers *“how much traffic can this configuration take?”* — useful before a launch and in an interview.\n\n```\npool = 1,000 connections\nW    = 20 ms per request\nmax  = 1,000 ÷ 0.020 = 50,000 requests per second\n```\n\nIf the requirement is 60,000, you have three options and they are not equivalent: raise the pool (buys up to the store's own limit), cut W (buys proportionally and forever), or partition the work so the pool is not shared. The arithmetic tells you the size of each move; judgement tells you which one is temporary.\n\nWatch the trap: the ceiling is a **steady-state** number. Bursts, retries and slow queries all raise W, and W is in the denominator. A design sized exactly at its ceiling is a design whose first bad minute is an outage.",
        },
        {
          kind: "your_turn",
          prompt:
            "A service takes 120 ms per request at 4,000 requests per second. How many requests are in flight? If the connection pool holds 500, what happens at 5,000 requests per second, and which of the three fixes would you choose first — with a number to justify it?",
        },
        {
          kind: "compare",
          body: "Beginners size pools by feel: *“500 connections sounds like a lot.”* Engineers size them by arithmetic: *“at 5,000 per second and 120 ms, we need 600 in flight — 500 is already a queue.”*\n\nThe second gap is diagnostic. When latency rises and CPU is idle, most people look for a leak. Little's Law points at the real question: what are the requests waiting for, and how many slots does waiting consume? A pool graph answers it in ten seconds; a CPU graph never will.",
        },
        {
          kind: "recap",
          points: [
            "L = λW: concurrency equals arrival rate times time in the system",
            "28,000 reads per second at 40 ms is about 1,100 in flight; at 400 ms it is 10,600",
            "The database at 20% CPU can still be the outage — the scarce resource is slots, not cycles",
            "Halving latency halves the concurrency you need, which is free capacity",
            "A pool of 1,000 at 20 ms caps you at 50,000 requests per second",
            "Size for the bad minute, not the steady state",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "estimation-under-uncertainty",
      title: "Estimation under uncertainty",
      attribution:
        "Synthesised from the Fermi-problem method, the system-design-primer's estimation guidance and Netflix's migration account. The quoted figures are Netflix's; the bracketing method is ours.",
      sources: [
        {
          label: "Wikipedia — Fermi problem",
          url: "https://en.wikipedia.org/wiki/Fermi_problem",
        },
        {
          label: "system-design-primer — back-of-the-envelope calculations",
          url: "https://github.com/donnemartin/system-design-primer",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Nobody knew how many countries would say yes",
          body: "On January 6, 2016, Netflix launched in more than 130 countries on the same day. There was no demand curve for those markets — a plan, a marketing budget and a guess.\n\nThe post adds the sentence that makes estimation a design problem rather than a maths exercise: *“we simply could not have racked the servers fast enough.”* Lead time is one of the numbers. If demand can double in a quarter and a rack takes six weeks, then the estimate is not interesting for its accuracy — it is interesting for whether the response can be **changed after it is wrong**.\n\nThat is this lesson: what to do when the inputs are guesses, which is always.",
        },
        {
          kind: "concept",
          title: "Bracket first, then narrow",
          body: "A single point estimate is a guess wearing a suit. Two numbers are a decision.\n\n*“Starts per second at launch: between 2,000 and 20,000.”* That bracket is honest, and it already changes what you build: at 2,000 a single region is fine, at 20,000 it is not. So the next question is not *“which is it?”* — you cannot know — it is *“what does the design have to do for both to be survivable?”*\n\nThe bracket also tells you what to measure first. If the low end is 2,000 and the high end is 20,000, the thing you need in the first hour of launch is a live number, not a better forecast. Instrument the arrival rate before you need it; a launch is a measurement opportunity, not an exam.",
        },
        {
          kind: "concept",
          title:
            "Fermi decomposition: break the unknown into boundable factors",
          body: "You cannot guess *“how much traffic will a global launch produce?”* You can bound its factors.\n\n```\npeak starts/s = members × starts per member per day ÷ 86,400 × peak factor\n```\n\nEach factor has a plausible range, and they do not all need to be right. If members are 40M–80M, starts per member 0.5–2, and peak is 2–4×, then:\n\n```\nlow  = 40M × 0.5 ÷ 86,400 × 2   ≈   460 per second\nhigh = 80M × 2.0 ÷ 86,400 × 4   ≈ 7,400 per second\n```\n\nA sixteen-fold spread — and notice it is dominated by the middle factor, not by membership. That is the point of decomposing: **one factor usually decides**, and the rest are noise. Find the deciding factor, spend your research there, and accept rough numbers everywhere else.",
        },
        {
          kind: "concept",
          title: "Estimate to a decision, not to a number",
          body: "The test of an estimate is not accuracy. It is whether the decision it supports survives the estimate being wrong.\n\n*“Even at a tenth of our low bound, 5 Mbps × 460 streams is 2.3 Gbps; at the high bound it is 37 Gbps. Both are too much for one origin to serve politely, so the CDN decision does not depend on the estimate.”* That is a robust conclusion: the action is the same across the whole bracket.\n\nThe opposite — *“we need exactly 3,412 servers”* — is precise, fragile and usually political. Somebody will argue about the number instead of the design, and the argument will be settled by whoever is more confident, not whoever is more correct.\n\nSo write the estimate as: **bracket, deciding factor, and the decision that holds across the bracket.** If no decision holds across it, you have found the thing to go and measure.",
        },
        {
          kind: "concept",
          title: "Estimates expire, and lead time is part of them",
          body: "An estimate is a statement about a moment. Netflix's own post gives the expiry date: *“eight times as many streaming members”* and viewing up *“three orders of magnitude in eight years.”* Any capacity plan written in 2008 was wrong by construction — not because the engineers were careless, but because the thing being estimated changed by a factor of a thousand.\n\nThat is why the cloud argument in the post is about **elasticity**, not about a better forecast: *“Elasticity of the cloud allows us to add thousands of virtual servers and petabytes of storage within minutes.”* When the future is uncertain by an order of magnitude, the winning design is the one whose capacity can change after the estimate is proven wrong.\n\nSo put a date and an owner on every estimate, and treat lead time as one of its outputs. *“28,000 per second by March; if the launch moves, so does this”* is a plan. *“About 28,000”* is a rumour with a number in it.",
        },
        {
          kind: "video",
          videoId: "lf3J10_Lnfc",
          title:
            "System Design in Bangla | YouTube-Like Streaming Capacity Estimation (Step-by-Step)",
          caption:
            "A Bangla capacity-estimation walkthrough on a video platform — a second pass on the bracket-then-narrow method with different assumptions.",
        },
        {
          kind: "your_turn",
          prompt:
            "Write the launch estimate for a service going live in 130 countries: bracket the peak requests per second, name the factor that dominates the spread, and state the one design decision that holds across the whole bracket. Then give the estimate an expiry date.",
        },
        {
          kind: "compare",
          body: "A beginner hides uncertainty and gives a confident number, because confidence sounds competent. An engineer states the bracket, names the deciding factor, and says which decisions are insensitive to it — which is more useful, and harder.\n\nThe second trap is estimating once. An estimate with no date is a belief; a launched product invalidates it within a quarter. The habit that saves you is not better forecasting, it is a design whose capacity can be changed in minutes rather than weeks.",
        },
        {
          kind: "recap",
          points: [
            "A point estimate is a guess; a bracket is a decision",
            "Decompose until one factor dominates, then research that factor only",
            "Estimate to a decision: the action should hold across the whole bracket",
            "Watch for the deciding factor — it is rarely the one people argue about",
            "Lead time belongs in the estimate; capacity you cannot add in time is capacity you do not have",
            "Put an expiry date and an owner on every estimate",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "Estimate the capacity for a global video launch: requests per second, storage and bandwidth.",
    strongAnswer:
      "I start with assumptions and say them out loud: 80 million members, 10 actions per day, 95% reads, 2 hours of viewing at 5 Mbps. Requests: 800 million a day is about 9,300 per second average, and I plan for three times that at peak, so about 28,000 — 26,600 of them reads, which is why a cache comes first. Storage: 20,000 titles times 5 renditions times 3 GB is about 300 TB of video, against roughly 200 MB of metadata, which is the argument for an object store rather than a relational database. Bandwidth: 80 million members times 2 hours over 24 gives about 6.7 million concurrent streams, times 5 Mbps is about 33 Tbps — at that point a CDN is not an optimisation, it is the only design that exists. And I would say which of those numbers I trust least, because the decision should survive being wrong.",
    trap: "Giving one precise number with no assumptions, so nobody can check it or move it. And estimating only requests per second — bandwidth is what actually decides a video architecture, and it is the line most candidates forget.",
  },
  task: {
    brief:
      "The estimate says 6,000 requests per second at peak. That is the number you build against: zero errors, no component above 80% utilisation. Turn the estimate into instance counts — and notice that the store needs attention too.",
    startGraph: {
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
        arrivalRate: 6_000,
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
          label: "Edge",
        },
        {
          ...defaultNode("app_server", "app-1", 420, 180),
          label: "Playback API",
          replicas: 4,
        },
        {
          ...defaultNode("database", "db-1", 620, 180),
          label: "Title store",
          readReplicas: 1,
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
        arrivalRate: 6_000,
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
        id: "size-the-app-tier",
        title: "Size the app tier from the estimate",
        brief:
          "6,000 requests per second at 80% utilisation means 7,500 of capacity. One instance serves 2,000, and there are two of them.",
        hint: "Select the app server and raise its replicas — the load balancer from the last module is already in place.",
        reveal:
          "6,000 ÷ 0.8 = 7,500 requests per second. At 2,000 per instance that is four instances — three would sit at exactly 100% and become the first thing to fail.",
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
      {
        id: "size-the-store",
        title: "The store is the next number",
        brief:
          "One database serves 5,000 requests per second, and 80% of that is 4,000. The estimate is 6,000.",
        hint: "A read replica in the Inspector, or a cache on the read path, both move this.",
        reveal:
          "6,000 requests against a 5,000-per-second store is 120% utilisation — the store sheds before the app does. One read replica doubles the ceiling; a cache removes most of the read traffic instead.",
        check: (g) => {
          const load = g.scenario.arrivalRate;
          const storeCapacity = g.nodes
            .filter((n) => n.type === "database")
            .reduce(
              (total, node) =>
                total +
                getNodeTypeSpec("database").capacity * (1 + node.readReplicas),
              0,
            );
          const hasCache = g.nodes.some((n) => n.type === "cache");
          const needed = load / 0.8;
          return {
            passed: storeCapacity >= needed || hasCache,
            progress: hasCache
              ? "✓ Cache absorbs the read share"
              : `${storeCapacity.toLocaleString()} of ${Math.ceil(
                  needed,
                ).toLocaleString()} requests per second of store capacity`,
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "zero-errors",
        label: "Error rate = 0% at 6,000 requests per second",
        required: true,
        explain:
          "The estimate is the load you plan for. At 6,000 the two app instances run at 150% and shed a third of the traffic — the arithmetic was always going to say this, which is why you do it before the launch.",
        assert: (r) => r.valid && r.errorRate === 0,
      },
      {
        id: "headroom",
        label: "No component above 80% utilisation at peak",
        required: true,
        explain:
          "The same rule as modules 2 and 3, now as capacity planning: 6,000 ÷ 2,000 per instance ÷ 0.8 = four instances, not three. Three is a design at exactly 100%, and the first extra request in the peak minute is an error.",
        assert: (r) => r.valid && r.perNode.every((n) => n.utilisation <= 0.8),
      },
    ],
  },
  recap: [
    "Estimation is about the exponent; the digits rarely change the decision",
    "Powers of two and the latency ladder are the two tables worth memorising",
    "QPS from a daily number, storage from artefacts, bandwidth from concurrent streams × bitrate",
    "Little's Law turns latency into concurrency, and latency is a capacity problem",
    "Bracket the unknown, find the deciding factor, and choose an action that survives the bracket",
    "Lead time is part of the estimate — capacity you cannot add in time is capacity you do not have",
  ],
  attribution:
    "Synthesised from Netflix's own account of completing its cloud migration, the system-design-primer, Hello Interview's estimation guidance, Colin Scott's latency page, the standard treatment of Little's Law and the Fermi-problem method. Sources are linked per lesson. The 80-million-member model is labelled as an assumption throughout; every figure attributed to Netflix is quoted from the published post.",
};

export default module;
