# Phase 3 — AI Mentor

## Purpose

AI-powered chat for coding help, debugging, and career guidance using free AI providers.

## Pages & Routes

| Route | Purpose |
|-------|---------|
| `/mentor` | AI chat interface |

## Components

### Chat Interface (`/mentor`)
- Chat message list (user + AI bubbles)
- Text input + send button
- Suggested prompt chips (pre-written questions)
- "Ask about code" button (opens small textarea for pasting code)

### Prompt Suggestions
- "Help me debug this code..."
- "Explain closures in JavaScript"
- "What should I learn after React?"
- "Review my resume suggestions"

## AI Integration

### Providers (round-robin fallback)
1. **Gemini Flash** (primary — 60 req/min free)
2. **Groq** (fallback — 30 req/min free, very fast)

### Endpoints
- `POST /api/mentor/chat` — sends message, streams response
- Rate limit: 10 messages per user per minute
- Context window: last 10 messages (to stay within free tier token limits)

### Implementation
- Streaming response using ReadableStream
- No conversation history stored in DB (to save space)
- Session context maintained in client state (last 10 messages)
- Optional: save favorite Q&As to user_notes

## Free Tier Optimizations

- **No DB writes** for chat history — purely client-side session
- **Rate limiting** — 10 req/min per user (protects free tier quota)
- **Short context** — last 10 messages only
- **Streaming** — users see response faster, reduces timeout issues
- **Prompt templates** — system prompt optimized for concise answers (fewer tokens = more free usage)
