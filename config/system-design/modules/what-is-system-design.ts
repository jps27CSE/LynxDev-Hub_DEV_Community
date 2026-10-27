import type { SdModule } from "../types";
import { defaultNode } from "@/lib/system-design/nodes";

/**
 * Module 1 — the mindset module, and the first converted to the leaf model
 * (plan 17, slice B1).
 *
 * **Running case study: Netflix.** Not a photo-sharing app, and not this site —
 * a system whose failures, numbers and decisions are published by the company
 * that lived them. Every claim below traces to one of these:
 *
 *   - `about.netflix.com/news/completing-the-netflix-cloud-migration` — Netflix's
 *     own account of the August 2008 database corruption, the "vertically scaled
 *     single points of failure" phrase, the forklift-vs-rebuild choice, the
 *     seven-year timeline, the January 2016 completion, and the "hundreds of
 *     micro-services" description.
 *   - `openconnect.netflix.com` — Open Connect, the CDN they built because the
 *     last mile is where video bytes become expensive.
 *
 * Chaos Monkey and Hystrix also anchor this case study, but not here: deliberate
 * failure injection is Module 15's subject and the circuit breaker is Module 13's.
 * Module 1 mentions reliability once, in prose, and deliberately cites neither —
 * a source attached to a claim the lesson does not make is decoration.
 *
 * Numbers that are *ours* (the connection-pool arithmetic, the percentile table)
 * are labelled as teaching models, not measurements. The distinction matters:
 * a lesson that dresses an assumption as a benchmark teaches the learner to
 * trust prose instead of checking it.
 */
const module: SdModule = {
  slug: "what-is-system-design",
  order: 1,
  part: 0,
  partTitle: "Mindset",
  kind: "sim",
  title: "What is system design?",
  description:
    "Design is a set of constraints written down, and every box you add carries a price tag. Start with the three days in 2008 when Netflix could not ship a DVD, and learn to read an architecture as a list of trades.",
  story:
    "It is August 2008. You are on the platform team at Netflix, and the company still ships DVDs by post. At 3 a.m. a database corruption takes out the ordering system, and for the next three days not a single envelope leaves a warehouse — no orders, no replacements, nothing. You did not write the corrupting code. You did not choose the single database that everything queued behind. But the design you inherited is the reason one bad block became a company-wide stop, and over the next eight years you are going to rebuild almost all of it: off the vertically scaled databases in your own data centre, onto horizontally scalable services in someone else's cloud, into hundreds of micro-services, and finally — in January 2016 — into a design where the last data-centre machine is switched off. This module is about the thinking that made that rebuild possible, and the thinking that would have avoided the three days altogether.",
  chapters: [
    {
      slug: "thinking-in-constraints",
      title: "Thinking in constraints",
      description:
        "Why a design is a list of numbers before it is a diagram, and why every added component costs something you are not measuring.",
      children: [
        {
          slug: "choices-not-boxes-chapter",
          title: "Choices, not boxes",
          description:
            "A design is a set of constraints you can check, not a collection of fashionable components.",
          lessonSlug: "choices-not-boxes",
        },
        {
          slug: "performance-vs-scalability-chapter",
          title: "Performance vs scalability",
          description:
            "Performance is one number at one load. Scalability is the shape of the curve as load grows.",
          lessonSlug: "performance-vs-scalability",
        },
      ],
    },
    {
      slug: "measuring-before-growing",
      title: "Measuring before growing",
      description:
        "The three numbers people confuse on a video platform, and the four patterns that decide whether adding capacity actually helps.",
      children: [
        {
          slug: "latency-throughput-bandwidth-chapter",
          title: "Latency, throughput and bandwidth",
          description:
            "Three terms used interchangeably in meetings that mean three different things, measured on a playback start.",
          lessonSlug: "latency-vs-throughput-vs-bandwidth",
        },
        {
          slug: "scalability-patterns-chapter",
          title: "Scalability patterns",
          description:
            "Vertical, horizontal, and the option nobody mentions: not doing the work at all.",
          lessonSlug: "scalability-patterns",
        },
      ],
    },
  ],
  lessons: [
    // ---------------------------------------------------------------------
    {
      slug: "choices-not-boxes",
      title: "System design is about choices, not boxes",
      attribution:
        "Synthesised from Netflix's own account of its cloud migration and Wikipedia's Netflix entry. No source text reproduced; the design vocabulary is our own.",
      sources: [
        {
          label: "Netflix — completing the cloud migration (their own account)",
          url: "https://about.netflix.com/news/completing-the-netflix-cloud-migration",
        },
        {
          label: "Wikipedia — Netflix",
          url: "https://en.wikipedia.org/wiki/Netflix",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Three days without an envelope",
          body: "In August 2008, Netflix could not ship a single DVD for three days. The cause was a database corruption. The company's own account is one sentence, and it is worth reading twice: *“we experienced a major database corruption and for three days could not ship DVDs to our members.”*\n\nNotice what is *not* there: no bad deploy, no traffic spike, no attacker. The code was doing what it was built to do. What failed was a **design decision made years earlier and never revisited**: one database, in one data centre, scaled by buying a bigger machine, with the entire ordering path queued behind it.\n\nSystem design is not the art of drawing boxes. It is predicting which of your choices will cost you three days of shipping — before it does.",
        },
        {
          kind: "concept",
          title: "A design is a list of constraints before it is a diagram",
          body: "“It should be fast and highly available” is not a constraint. Nobody can check it, so nobody can fail it, so it survives review and breaks in production.\n\nA constraint worth writing down has a number and a condition. Four lines cover most systems:\n\n1. **Load** — how many at once, and what a burst looks like. Christmas in 2008; a same-day launch in 130+ countries in 2016.\n2. **Shape** — the mix of reads and writes. A catalogue is read constantly and written rarely; an order is the opposite. Reads can be copied and cached across many machines. Writes must agree with each other — a harder problem.\n3. **Latency target** — stated as a percentile, e.g. *p95 playback start under 2 seconds on a mobile connection*. p95, never the mean: the mean hides the requests people complain about.\n4. **Budget** — money, machine count, or a physical limit. Netflix's 2008 constraint was not cash: *“we simply could not have racked the servers fast enough.”* Lead time shapes a design more than dollars.\n\nFour checkable lines. A constraint that rules nothing out has ruled nothing in.",
        },
        {
          kind: "concept",
          title: "A single point of failure is a choice with a price tag",
          body: "The 2008 design bought something real: one schema, one backup, one place where the truth lives, no distributed transactions to write. It charged with a **total** failure mode — not *some requests fail*, but *the company stops*.\n\nThe opposite choice charges differently. Many small machines, each replaceable, buy you the ability to lose one without noticing. They charge you coordination: which machine has the truth, how do two of them agree, what does a request do when one is unreachable? Netflix's engineers named the trade exactly in their migration post, describing what they were leaving behind: *“vertically scaled single points of failure, like relational databases in our datacenter.”*\n\nEvery component has this shape — a capability bought, a failure mode charged:\n\n- **A cache** buys speed and charges **staleness**. Somebody will read a page that no longer exists.\n- **A read replica** buys read capacity and charges **lag**. A member updates a profile, reloads, and the copy has not heard yet.\n- **A queue** buys the ability to absorb a spike and charges **eventual consistency** plus a backlog that may never drain.\n- **A CDN** buys distance and charges **a fleet you do not own**, in buildings you do not control.\n\nWhen you add a box, you are not adding a capability. You are accepting a new way to be wrong.",
        },
        {
          kind: "concept",
          title: "The forklift trap",
          body: "The obvious response to 2008 is *move to a cloud*. Netflix did — and then took **seven years** to finish, completing in January 2016 and switching off the last data-centre machines.\n\nWhy so long? A choice most teams get wrong, in Netflix's own words:\n\n> *“Arguably, the easiest way to move to the cloud is to forklift all of the systems, unchanged, out of the data center and drop them in AWS. But in doing so, you end up moving all the problems and limitations of the data center along with it.”*\n\nForklift the database and you have a database in a rented building — still one, still a vertical failure mode, now with a bill. They chose the harder path: *“hundreds of micro-services”*, a denormalised NoSQL model, and teams deploying independently.\n\n**A migration that changes the address of your server has not changed your design.** Ask the boring question in every review: *what fails first after this change, and is it the same thing that fails today?* If yes, you moved boxes.",
        },
        {
          kind: "diagram",
          caption:
            "2008 versus 2016. The change is not the number of boxes — it is which failure is survivable, and where the video bytes stop touching a region at all.",
          graph: {
            nodes: [
              {
                ...defaultNode("client", "client-1", 40, 180),
                label: "Members",
              },
              {
                ...defaultNode("load_balancer", "lb-1", 250, 180),
                label: "Edge",
              },
              {
                ...defaultNode("app_server", "app-1", 460, 120),
                label: "Playback service",
              },
              {
                ...defaultNode("app_server", "app-2", 460, 240),
                label: "Membership service",
              },
              {
                ...defaultNode("cache", "cache-1", 670, 120),
                label: "Cache",
              },
              {
                ...defaultNode("database", "db-1", 670, 240),
                label: "Sharded store",
              },
            ],
            edges: [
              {
                id: "e1",
                from: "client-1",
                to: "lb-1",
                label: "one door",
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
                from: "lb-1",
                to: "app-2",
                label: null,
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e4",
                from: "app-1",
                to: "cache-1",
                label: "read path",
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e5",
                from: "app-1",
                to: "db-1",
                label: "miss",
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
              {
                id: "e6",
                from: "app-2",
                to: "db-1",
                label: "write path",
                retry: { attempts: 0, backoffMs: 0, jitter: false },
                partitioned: false,
              },
            ],
            scenario: {
              arrivalRate: 400,
              writeShare: 0.05,
              mediaShare: 0.7,
              bytesPerMediaRequest: 5_000_000,
              abusiveShare: 0,
              latencyJitterMs: 0,
              cacheColdStart: false,
              replicaLagMs: 0,
            },
          },
        },
        {
          kind: "video",
          videoId: "DzAt0wd3oWM",
          title:
            "System Design Basics in Bangla | Client–Server Model + Database + Scaling Explained",
          caption:
            'Bangla walkthrough of the client–server model, where the database sits, and what "scaling" means. Useful as a second pass over this lesson in your first language.',
        },
        {
          kind: "your_turn",
          prompt:
            "You inherit the 2008 design: one database, one data centre, one ordering application. Write the four constraint lines you would put to the team, name the choice that produced the three-day outage, and say what removing it would have cost in 2008.",
        },
        {
          kind: "compare",
          body: "A beginner opens the canvas and asks *which box do I add?*. An engineer asks *which constraint is failing, and what will this box cost me?*\n\n“Move to AWS” is not a design decision — it is a purchase. Netflix's decision was narrower and harder: *give up the single database as the source of truth, accept eventual consistency between services, and rebuild the data model so one corrupt block can never stop the company again*. The first sentence is a vendor. The second is a design.",
        },
        {
          kind: "recap",
          points: [
            "A design is a list of checkable constraints before it is a diagram",
            "The 2008 outage was a design decision, not a bad disk",
            "Every component buys a capability and charges a failure mode",
            "A migration that only moves boxes moves the limitations with them",
            "If a change cannot be checked against a number, it is a preference",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "performance-vs-scalability",
      title: "Performance vs scalability",
      attribution:
        "Synthesised from Netflix's cloud-migration account, Wikipedia's treatment of scalability and the AWS Builders' Library. The capacity arithmetic is a labelled teaching model, not a measurement of Netflix.",
      sources: [
        {
          label: "Wikipedia — scalability",
          url: "https://en.wikipedia.org/wiki/Scalability",
        },
        {
          label: "AWS Builders' Library",
          url: "https://aws.amazon.com/builders-library/",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "Two complaints in the same week",
          body: "January 2016. Netflix switches on service in more than 130 countries in a single day.\n\nTwo complaints arrive that week. First: *a title takes eight seconds to start on hotel Wi-Fi* — one member, one playback, every time. Second: *everything got slower the week we launched* — the code is unchanged, but p95 has walked up across the board as membership grew.\n\nBoth are reported as “the site is slow”. They are different problems, and a fix for one does nothing for the other. The first is **performance**. The second is **scalability**.",
        },
        {
          kind: "concept",
          title: "Performance is one number at one load",
          body: "Performance answers: *how long does one request take at the load we have right now?* A measurement is meaningless without its conditions. “Playback starts in 400 ms” says nothing. “Playback start is 400 ms at p95 with 50,000 concurrent streams in one region” is a claim you can check.\n\nMost performance work is **local**: shrink a payload, add an index, drop a round trip, precompute a response. All of those make *the same request* cheaper at *the same load*. None change how the system behaves when the number of requests grows.\n\nNetflix's migration post makes the point sideways: capacity expansion went from multi-week hardware provisioning to minutes. That is not a latency fix — nothing got faster. What changed is how the system responds to *more*.",
        },
        {
          kind: "concept",
          title: "Scalability is the shape of the curve",
          body: "Scalability answers a different question: *what happens to latency as load increases, and does adding resources move the curve back down?*\n\nThree systems, identical 200 ms at 1,000 concurrent streams:\n\n| Concurrent streams | Flat | Degrading | Cliff |\n| --- | --- | --- | --- |\n| 1,000 | 200 ms | 200 ms | 200 ms |\n| 10,000 | 200 ms | 500 ms | 2,400 ms |\n| 50,000 | 200 ms | 1,600 ms | errors |\n\nAll three are equally “fast” at the load they were measured at. Only the first is scalable — and you discover which you have by pushing load, not by reading code.\n\nBelow the limit, all is fine. At the limit, requests queue. Past it, every arrival lengthens the queue, everything gets slower, and the system falls over doing almost no useful work. Cliffs are made of queues, and queues are made of a shared resource somebody added *one* of.",
        },
        {
          kind: "concept",
          title: "The arithmetic that explains both complaints",
          body: "A teaching model, not a Netflix measurement: a service holds **100 database connections**, and a request keeps one for **20 ms**.\n\n```\nceiling = 100 connections / 0.020 s = 5,000 database-bound requests per second\n```\n\nAt 1,000 requests per second you are nowhere near it. At 6,000 you are past it, and latency does not rise gently — it queues.\n\n**Adding application servers does not move that number.** Fifty instances still share one hundred connections, and the queue grows while CPU sits idle. The next move is fewer round trips per request, a cache before the read path, or a partitioned write path.\n\nThe other complaint is the opposite shape: one playback, eight seconds, fleet idle. That is a request expensive on its own — too many hops, a licence check on the critical path, a manifest fetched so late the first segment starts afterwards. No amount of horizontal scaling fixes it.",
        },
        {
          kind: "concept",
          title: "Why the distinction pays for itself",
          body: "The two labels lead to different budgets and owners.\n\n**Performance** work is cheap, local and safe — and it is the work that gets skipped, because no architecture diagram changes.\n\n**Scalability** work is structural and expensive, and it gets *deferred*, because at today's load the measurements look fine. That is exactly what a cliff looks like from the top.\n\nThe tell is in the complaint. One person, once, is slow means performance, and the fix is invisible to architecture review. Everybody slow *together*, at particular moments, means scalability, and the fix changes the shape of the system. Treating the second as the first is how teams ship a year of micro-optimisations and still fall over on launch day.",
        },
        {
          kind: "your_turn",
          prompt:
            "Classify each fix as performance, scalability, or both, and name the number it changes: (a) precompute the manifest so playback start skips a database read, (b) split the catalogue by region so no single database serves every country, (c) raise the connection pool from 100 to 400 on a bigger instance, (d) re-encode the top 1,000 titles at a lower bitrate. Which still works when membership doubles?",
        },
        {
          kind: "compare",
          body: "The trap is treating “scalable” as a compliment. It is not — it is a claim about a curve. A system can be slow and scale perfectly: every request takes 900 ms, and it takes 900 ms at fifty thousand concurrent streams too. That system has a performance problem and no scalability problem, and fixing it is a completely different project.\n\nThe second trap is “we'll just add servers”. That sentence is only true when the bottleneck is the thing you are adding. The honest version names the shared resource: *we can add instances freely, and it will not help until the database stops being the shared limit — so the next change is to take reads off it entirely.*",
        },
        {
          kind: "recap",
          points: [
            "Performance is latency at a stated load; without the load the number means nothing",
            "Scalability is the shape of the latency curve, not one bigger number",
            "A cliff is a queue, and a queue exists because of a shared resource",
            "Adding stateless instances does not raise a state-bound ceiling",
            "One person slow is performance; everyone slow together is scalability",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "latency-vs-throughput-vs-bandwidth",
      title: "Latency, throughput and bandwidth",
      attribution:
        "Synthesised from Netflix's Open Connect documentation, Colin Scott's latency page and MDN's performance guidance. The bitrate arithmetic is a teaching model with stated assumptions.",
      sources: [
        {
          label: "Netflix Open Connect — the CDN Netflix built",
          url: "https://openconnect.netflix.com/en/",
        },
        {
          label: "Colin Scott — interactive latency numbers",
          url: "https://colin-scott.github.io/personal_website/research/interactive_latency.html",
        },
        {
          label: "MDN — understanding latency",
          url: "https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/Understanding_latency",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The spinner before the first frame",
          body: "Two members, same night, same title.\n\nThe first is on hotel Wi-Fi and waits eight seconds between tapping play and seeing a frame. The second is in a dense city at 8 p.m., with a clean picture that stalls every few minutes.\n\nBoth say “it's slow”, and both are wrong about which number is failing. The first is **latency** — the time before anything useful arrives. The second is **bandwidth** under contention — the bits arrive, but not fast enough to stay ahead of the playhead. Shrinking the startup payload fixes the first; raising the bitrate fixes the second and hurts anyone whose connection cannot carry it.",
        },
        {
          kind: "concept",
          title: "Latency is a sum of hops, not a single measurement",
          body: "Latency is the time from *I asked* to *I have the answer*, assembled from hops. A playback start walks through roughly these:\n\n| Hop | Typical cost | Why |\n| --- | --- | --- |\n| DNS lookup | 0–30 ms | cached by the OS or the CDN, sometimes not |\n| TCP + TLS handshake | 50–120 ms | two round trips before a single byte |\n| Playback API call | 20–150 ms | which title, which device, which plan |\n| Licence check | 20–200 ms | a separate service must agree you may watch |\n| Manifest fetch | 10–80 ms | the list of segments to fetch |\n| First segment | 100 ms–2 s | the actual bytes |\n\nAdd that up cold over bad Wi-Fi and eight seconds is unsurprising; warm, the first frame appears in under a second. Same code, different hops.\n\n**Latency is additive, so the fastest hop is the one you delete.** Re-encoding a title does not speed up the licence check; taking the licence check off the critical path does. For the last row, Netflix put the bytes physically inside the ISP — Open Connect, their own CDN, *“distributed globally to efficiently deliver our bits to members' devices”*. Not a faster hop. A shorter one.",
        },
        {
          kind: "concept",
          title: "Throughput is set by the narrowest stage",
          body: "Throughput is work completed per second, and it is not the sum of the stages — it is the **minimum**, because a chain moves as fast as its slowest link.\n\nA playback start has three stages: the API that says *play this*, the licence service that says *you may*, and the CDN that delivers segments. If they sustain 20,000, 8,000 and effectively unlimited per second, startup throughput is 8,000, and no amount of API capacity moves it.\n\nSo “we scaled the API” should always be followed by “and the bottleneck moved to…”. If it did not, the work bought nothing. Little's Law — throughput × latency = concurrency — says the same from the other side: at fixed throughput, halving latency halves the requests in flight, which is capacity you get for free.",
        },
        {
          kind: "concept",
          title: "Bandwidth only matters when bytes are the payload",
          body: "Bandwidth is bytes per second. For a two-kilobyte JSON response it is irrelevant — round trips dominate. For video it is the business.\n\nA teaching model, assumptions stated: 10,000 concurrent streams at 5 Mbps.\n\n```\n10,000 × 5 Mbps = 50,000 Mbps = 50 Gbps\n```\n\nFifty gigabits per second, continuously, for one title's audience at one moment. That is why a video company builds a CDN: pushing 50 Gbps out of a few regions means paying egress on every bit. Caches inside thousands of ISPs turn one 50 Gbps problem into thousands of 50 Mbps ones, each solved a few hops from the viewer.\n\nIt is also why the fix is rarely “add a server”. Serve a smaller file. Per-title encoding — a bitrate ladder per title instead of one ladder for all — lowers bytes without touching architecture.",
        },
        {
          kind: "concept",
          title: "The average is a lie you tell yourself",
          body: "A threshold is what people feel; a mean is what dashboards show. One hundred starts, ninety-nine at 200 ms and one at 10 seconds:\n\n```\naverage = (99 × 200 ms + 1 × 10,000 ms) / 100 = 298 ms\np50     = 200 ms\np99     = 10,000 ms\n```\n\nThe average says “about 300 ms, fine”. The p99 says one in a hundred members waited ten seconds — at a million starts a day that is ten thousand people, several times a minute. Averages hide the requests that generate complaints, and complaints generate churn. Hence p95 and p99 in every target on this path.",
        },
        {
          kind: "video",
          videoId: "7qWsnq2ecNE",
          title: "System Design Basics in Bangla | Throughput and Latency",
          caption:
            "Bangla explanation of the two numbers this lesson separates, with the pipe analogy most people find easier than the table.",
        },
        {
          kind: "your_turn",
          prompt:
            "For each, name the number that dominates: (a) tapping play on hotel Wi-Fi, (b) a stall every few minutes at 8 p.m. in a crowded city, (c) a licence service at 8,000 checks per second, (d) one title to 10,000 viewers at once. Then name the hop or stage you would remove first, and its cost.",
        },
        {
          kind: "compare",
          body: "The trap is quoting an average. “Average playback start is 300 ms” gets a design approved and fails in production, because it is compatible with one member in twenty waiting four seconds.\n\nThe second trap is blaming bandwidth for a latency problem. If the manifest is 40 KB and start takes eight seconds, the bytes are not the problem — the round trips or the licence check are. Measure the hops before shrinking the file.",
        },
        {
          kind: "recap",
          points: [
            "Latency is a sum of hops; the fastest hop is the one you delete",
            "Throughput is the minimum of the stages, not the sum",
            "Bandwidth dominates when the payload is video, and barely matters for JSON",
            "50 Gbps of video is an argument for a CDN, not for a bigger server",
            "Report p95/p99 — an average hides the requests that generate complaints",
          ],
        },
      ],
    },
    // ---------------------------------------------------------------------
    {
      slug: "scalability-patterns",
      title: "Scalability patterns",
      attribution:
        "Synthesised from the Twelve-Factor App, Netflix's migration account and Netflix Open Connect. Bitrate arithmetic is a teaching model.",
      sources: [
        {
          label: "The Twelve-Factor App",
          url: "https://12factor.net/",
        },
        {
          label: "Wikipedia — Netflix Open Connect",
          url: "https://en.wikipedia.org/wiki/Netflix_Open_Connect",
        },
      ],
      sections: [
        {
          kind: "scenario",
          title: "The decision that took seven years",
          body: "Go back to the sentence Netflix wrote about 2008. They did not say *our database was too small*. They said they had to move away from **“vertically scaled single points of failure”** towards horizontally scalable systems.\n\nThat is a scalability decision wearing the clothes of a hardware decision, and it took seven years — not because the cloud was slow, but because the pattern is not a purchase. You cannot buy horizontal scalability: you earn it by removing the state that ties a request to one machine, and everything in the code that assumed one machine was the only machine.\n\nFour patterns decide whether that works — the last is the one nobody puts on the slide.",
        },
        {
          kind: "concept",
          title: "Vertical first, horizontal when you must",
          body: "**Vertical scaling** means a bigger machine. Cheapest in engineering time — no code, no new failure mode — with a hard ceiling and a forgotten property: a bigger machine is still **one** machine.\n\n**Horizontal scaling** means more machines. It requires that any instance can serve any request, which sounds like hardware and is actually a property of your code. It also multiplies whatever the instances share: ten app servers hold the same number of database connections between them, and ten times the traffic on an unchanged shared resource is ten times the queue.\n\nThe answer that distinguishes a junior is not “horizontal”. It is: *horizontal, and here is the shared resource it will not help with.*",
        },
        {
          kind: "concept",
          title: "Stateless services are the precondition, not the goal",
          body: "A service is stateless when it keeps nothing between requests that the next request needs:\n\n- **Identity** arrives with the request, verified by a token or session store — not by a variable in the instance that handled the last one.\n- **Cached content** lives in a shared cache or at the edge, not in a module-level map.\n- **Progress** lives in a database, keyed by member.\n\nThis is the Twelve-Factor App's *processes* factor, and it is not taste: it is the difference between “add another instance” working and silently corrupting behaviour.\n\nThe classic failure is a rate limiter written as a `Map` in module scope. In development it is perfect. In production every instance keeps its own map: five instances mean five times the limit, and which one you hit is not something the client controls. The fix puts the counter where all instances can see it — slower per call, and the only version that is a rate limit.\n\n**If two requests must agree about anything, the agreement cannot live in an instance's memory.**",
        },
        {
          kind: "concept",
          title: "Load balancing, and why stickiness is a trap",
          body: "A load balancer spreads requests across instances. Two policies cover most of it:\n\n- **Round robin** — take turns. Fair when requests cost the same.\n- **Least connections** — send each request where the fewest are in flight. Better when requests cost wildly different amounts, which is always true here: a manifest fetch and a licence check are not the same size.\n\n**Sticky sessions** pin a member to one instance, usually because that instance holds something the member needs. That is the trap: stickiness is a workaround for state in the wrong place. It also turns one instance's crash into a lost session for everyone pinned to it, and makes deploys uneven — the instances draining traffic keep their members while the fresh ones get nobody.\n\nMove the state out, then balance freely. Balance first and pin later is how a system gets an outage with a load balancer in front of it.",
        },
        {
          kind: "concept",
          title: "The cheapest request is the one you never serve",
          body: "The fourth pattern is not usually on the list, and on video it is the biggest.\n\nTake 10,000 streams at 5 Mbps: 50 Gbps to deliver. If those bits leave a cloud region you pay egress on every one, own the congestion, and every viewer's quality depends on the path between one region and one ISP. Netflix's answer was Open Connect: cache appliances **inside** ISPs, so bytes travel the last mile from a box already there.\n\nThe work still happens — outside the system with the scaling problem, on boxes bought once and amortised for years. No request reaches a region, so none enters the accounting that matters.\n\nThe same move appears at every scale: **move work out of the request path into something prepared ahead of time.** Prerender the page, precompute the manifest, cache at the edge — each trades freshness for capacity you already paid for, and whoever updates the content pays it.",
        },
        {
          kind: "video",
          videoId: "nFbOxUJJeFo",
          title:
            "System Design in Bangla | Vertical vs Horizontal Scaling, Load Balancers & DNS Explained",
          caption:
            "Bangla walkthrough of vertical vs horizontal scaling and where a load balancer sits — a good second pass on this lesson's first two patterns.",
        },
        {
          kind: "your_turn",
          prompt:
            "You inherit a service holding per-member sessions in memory, behind a load balancer with sticky sessions on. Write three changes in order of cost: one that removes work, one that spreads it, one that adds capacity. For each, name the number it changes and the failure mode it introduces.",
        },
        {
          kind: "compare",
          body: "The trap is “just add instances”. It is not wrong, it is incomplete: it moves work to whichever resource is shared, and if that is the database you have purchased nothing. The sentence that shows you understand it is *add instances, and the bottleneck becomes the shared datastore, so the next change reduces work per request or partitions it*.",
        },
        {
          kind: "recap",
          points: [
            "Vertical scaling has a ceiling, and a bigger machine is still one machine",
            "Horizontal scaling multiplies whatever the instances share",
            "Stateless is a precondition for horizontal scaling, not a bonus",
            "Sticky sessions are a symptom of state in the wrong place",
            "Work moved out of the request path — a CDN, a prerender — is capacity you already own",
            "Reliability is proven by drills, not by architecture diagrams",
          ],
        },
      ],
    },
  ],
  interviewByte: {
    shape:
      "Explain the difference between performance and scalability using a number from a real system.",
    strongAnswer:
      "Performance is latency at a fixed load — 'p95 playback start is 400 ms at 50,000 concurrent streams' is a performance claim. Scalability is what happens to that number as load grows, and whether adding resources moves the curve. Netflix in 2008 had a single vertically scaled database; the failure mode was total, and the fix was not a faster database but removing the single point of failure — which took seven years and a rebuild into hundreds of micro-services. When I add instances, I always name the shared resource the instances still contend for, because if the bottleneck does not move, the instances bought nothing.",
    trap: "Saying 'scalable means fast'. A system can be slow and scale perfectly, and a system can be fast at 1,000 users and fall over at 50,000. The second mistake is 'we'll add servers' when the bottleneck is a shared dependency that more servers do not multiply.",
  },
  task: {
    brief:
      "Netflix, 2008, before the cloud. One application, one database, DVD orders to take and a promise that one machine dying does not stop the company. Build the smallest design the numbers actually justify — and be honest about what breaks first.",
    startGraph: {
      nodes: [
        { ...defaultNode("client", "client-1", 60, 180), label: "Members" },
        {
          ...defaultNode("app_server", "app-1", 300, 180),
          label: "Ordering app",
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
        arrivalRate: 100,
        writeShare: 0.1,
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
          ...defaultNode("app_server", "app-1", 280, 180),
          label: "Ordering app",
        },
        { ...defaultNode("database", "db-1", 500, 180), label: "Order store" },
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
          label: null,
          retry: { attempts: 0, backoffMs: 0, jitter: false },
          partitioned: false,
        },
      ],
      scenario: {
        arrivalRate: 100,
        writeShare: 0.1,
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
        id: "add-db",
        title: "Give the orders a place to live",
        brief:
          "Orders, member records and shipping status all have to survive a restart. Add storage.",
        hint: "Look at the Data section in the palette.",
        reveal:
          "Nothing is durable without storage: who ordered what, what shipped, what is owed. Add a Database node.",
        check: (g) => {
          const hasDb = g.nodes.some((n) => n.type === "database");
          return {
            passed: hasDb,
            progress: hasDb ? "✓ Database added" : "Add a database node",
          };
        },
      },
      {
        id: "wire-app-db",
        title: "Connect the app to the database",
        brief:
          "The ordering application needs to read and write. Draw the connection.",
        hint: "Drag an edge from the App Server to the Database.",
        reveal:
          "The flow every request takes: client → app → database. Add an edge from the app server to the database.",
        check: (g) => {
          const appNodes = g.nodes.filter((n) => n.type === "app_server");
          if (appNodes.length === 0)
            return { passed: false, progress: "Add an app server first" };
          const connected = appNodes.some((a) =>
            g.edges.some(
              (e) =>
                e.from === a.id &&
                g.nodes.find((n) => n.id === e.to)?.type === "database",
            ),
          );
          return {
            passed: connected,
            progress: connected
              ? "✓ App connected to database"
              : "Connect app server to database",
          };
        },
      },
    ],
    passCriteria: [
      {
        id: "latency-ok",
        label: "p95 < 50ms at 100 concurrent members",
        required: true,
        explain:
          "At this size ordering should feel instant. A higher number means something is wrong that more load will make much worse — which is exactly how 2008 started.",
        assert: (r) => r.valid && r.latency.p95 < 50,
      },
      {
        id: "no-errors",
        label: "Error rate = 0%",
        required: true,
        explain:
          "A minimal, correct design at 100 concurrent members should serve every request. Errors here are capacity, not traffic.",
        assert: (r) => r.valid && r.errorRate === 0,
      },
    ],
  },
  recap: [
    "A design is a set of checkable constraints before it is a diagram",
    "Netflix's 2008 outage was a design decision, not a bad disk",
    "Performance is latency at a stated load; scalability is the shape of the curve",
    "Latency is additive: a CDN wins by shortening the path, not speeding it up",
    "Every component buys a capability and charges a failure mode",
  ],
  attribution:
    "Synthesised from Netflix's own account of completing its cloud migration, Netflix Open Connect, the Twelve-Factor App, the AWS Builders' Library, MDN and Colin Scott's latency page. Sources are linked per lesson. No source text is reproduced; every number attributed to Netflix is a published claim, and every other number is labelled as a teaching model.",
};

export default module;
