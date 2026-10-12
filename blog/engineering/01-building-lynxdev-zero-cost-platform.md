---
title: "Building LynxDEV: A Zero-Cost Developer Learning Platform"
date: "2025-10-12"
author: "LynxDEV Engineering"
description: "How we built a zero-cost developer learning platform on Next.js 16, TiDB, Clerk, and Mistral running entirely on free tiers."
slug: "building-lynxdev-zero-cost-platform"
tags: ["architecture", "nextjs", "free-tier", "performance", "security", "drizzle", "clerk"]
---

# Building LynxDEV: A Zero-Cost Developer Learning Platform

*Published: October 2025 | Author: LynxDEV Engineering*

## The Problem

We set out to build LynxDEV - a complete developer learning platform with courses, DSA practice, interview prep, AI mentorship, and community features. The constraint was simple: **run everything for $0/month** on free-tier infrastructure, without sacrificing performance or user experience for 500+ concurrent users.

This is the story of how we architected, implemented, and hardened LynxDEV to achieve that goal.

## Constraints

From day one, our design decisions were driven by hard free-tier limits:

| Service | Free Tier Limit | Impact |
|---|---|---|
| [Vercel Hobby](https://vercel.com/pricing) | 1M function invocations/month, 100GB bandwidth, 4 CPU-hours/month, 60s timeout | CPU time is the tightest bottleneck - estimated ~7 CPU-hours needed at scale without optimization |
| [TiDB Cloud Starter](https://tidbcloud.com/pricing) | 50M Request Units (RUs)/month, 400 concurrent connections, 5GiB storage | RUs become the limiting factor for DB-heavy operations |
| [Mistral AI](https://mistral.ai/technology) | 1 request/minute (free tier) | Critical bottleneck for AI mentor - only 1 user can chat per minute without queuing |
| [Clerk Hobby](https://clerk.com/pricing) | 50K Monthly Retained Users | More than enough for our needs |

The key insight: **not all limits are equal**. Mistral's 1 RPM hits first, followed by TiDB RUs and Vercel CPU time. Every architectural decision had to account for these constraints.

## Design Principles

We adopted five core principles:

1. **Server Components first** - Minimize client JavaScript. Only use `"use client"` for hooks, browser APIs, or interactivity.
2. **Cache aggressively** - Static seed content (courses, chapters, problems, interview questions) should be cached across requests using Next.js `unstable_cache`.
3. **Batch everything** - Avoid N+1 queries. Use `inArray()` and eager loading patterns.
4. **Fail-closed with observability** - Rate limits throw on failure, errors are logged, and every API request emits telemetry.
5. **Free-tier paranoia** - Every new feature is evaluated against RU cost, CPU time, and AI spend before implementation.

## Architecture Overview

LynxDEV is built on a modern, server-first stack:

| Layer | Technology | Rationale |
|---|---|---|
| Framework | [Next.js 16 (App Router)](https://nextjs.org/) | Server Components, built-in caching, zero-config on Vercel |
| Authentication | [Clerk](https://clerk.com/) | Local JWT verification with `auth()` (no external HTTP calls per render), free tier is generous |
| Database | [TiDB Cloud (MySQL)](https://tidbcloud.com/) + [Drizzle ORM](https://orm.drizzle.team/) | MySQL-compatible, serverless, and Drizzle provides type-safe queries with good performance |
| Styling | [Tailwind v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) | Zero runtime CSS, accessible components, dark mode by default |
| AI | [Mistral AI](https://mistral.ai/) | High quality, streaming support, with retry/backoff for resilience |
| Hosting | [Vercel](https://vercel.com/) | Edge runtime, great DX, free tier matches our constraints |
| Code Execution | [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) | Sandboxed JavaScript execution in the browser (no server-side code execution costs) |

## System Architecture at a Glance

![System Architecture Overview](/blog/architecture/system-design.jpg)

Our architecture balances serverless scalability with free-tier constraints. Every request flows through Clerk's auth middleware, hits our Next.js App Router handlers, and uses batched Drizzle queries against TiDB with aggressive caching.

## Performance Architecture

![Code Architecture](/blog/architecture/code-architecture.jpg)

We push as much work as possible to build time and server-side rendering. Static seed content is cached indefinitely with version-based invalidation, while user-specific data is fetched on-demand with request-level deduplication.

## Infrastructure Design

![Server Architecture](/blog/architecture/server-architecture.jpg)

Running entirely on free tiers means designing for cold starts, connection pooling, and RU conservation. Our tuned MySQL pool and retry logic ensure resilience even with TiDB serverless scale-to-zero behavior.
