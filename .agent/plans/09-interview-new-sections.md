# Phase 2 — Interview Section: New Frontend Topics

## Purpose
Add 5 new topic sections under the Frontend Engineer interview category: **React**, **Angular**, **State Management** (Redux Toolkit, NgRx), **AI Basics** (Generative AI, RAG, MCP), and **Testing** (Jest, React Testing Library, Cypress). Each section gets curated Q&A, chapter content, and proper tags.

## Status Tracking
| Section | Questions | Chapters | Tags | Status |
|---------|-----------|----------|------|--------|
| React | 50 | 1 | react, hooks, jsx, virtual-dom, etc. | Pending |
| Angular | 30 | 1 | angular, components, rxjs, signals, etc. | Pending |
| State Management | 25 | 1 | redux, redux-toolkit, ngrx, zustand, etc. | Pending |
| AI Basics | 20 | 1 | generative-ai, rag, mcp, llm, prompt-engineering | Pending |
| Testing | 30 | 1 | testing, jest, rtl, cypress, playwright | Pending |

**Total new questions: 155** (seeded, zero AI cost)

---

## Files to Modify

### 1. `config/interview/seed-data.ts`
- Append new question arrays for "frontend-engineer" with tags for each new topic
- Each question: `{ question, answer, difficulty, tags, is_top50: false }`

### 2. `config/interview/chapters-seed-data.ts`
- Add 5 new chapter entries under `"frontend-engineer"` array
- Each chapter: `{ title, content: { overview, realLifeScenario, explanation, keyPoints, tips, sampleQuestions } }`

### 3. `config/seed-interview.ts`
- No changes needed — existing seed script already handles variable-length question arrays

### 4. `app/(routes)/interview/[category]/CategoryClient.tsx`
- May need to update tag filter chips if any new tags should appear as filter pills
- Currently uses dynamic tag extraction so likely no changes needed

---

## React — 50 Questions

### Topics to Cover

| Topic | Count | Difficulty |
|-------|-------|------------|
| JSX & Rendering | 3 | Easy |
| Components & Props | 4 | Easy |
| State & Lifecycle | 5 | Easy-Medium |
| Hooks (useState, useEffect, useRef, useMemo, useCallback, useContext, useReducer, custom hooks) | 10 | Medium |
| Virtual DOM & Reconciliation | 3 | Medium |
| Event Handling | 2 | Easy |
| Conditional Rendering & Lists | 2 | Easy |
| Forms & Controlled Components | 3 | Medium |
| React 19 Features (Server Components, Actions, use, useActionState, React Compiler) | 6 | Hard |
| Performance Optimization | 4 | Medium-Hard |
| Error Boundaries | 2 | Medium |
| Context API | 2 | Medium |
| React Router | 2 | Medium |
| Composition vs Inheritance | 1 | Medium |
| Higher-Order Components & Render Props | 1 | Medium |

### Sources
- [github/greatfrontend/top-reactjs-interview-questions](https://github.com/greatfrontend/top-reactjs-interview-questions)
- [greatfrontend.com — 100+ React Interview Questions](https://www.greatfrontend.com/blog/100-react-interview-questions-straight-from-ex-interviewers)
- [stackinterview.dev — Top 50 React Questions](https://stackinterview.dev/guides/react-interview-questions-2026)
- [interviewbit.com — 70+ React Questions](https://www.interviewbit.com/react-interview-questions/)

### Tags
`react`, `jsx`, `components`, `props`, `state`, `hooks`, `useState`, `useEffect`, `useRef`, `useMemo`, `useCallback`, `useContext`, `useReducer`, `virtual-dom`, `reconciliation`, `event-handling`, `forms`, `react-19`, `server-components`, `react-compiler`, `error-boundaries`, `context-api`, `react-router`, `composition`, `hoc`, `render-props`, `performance`

### Sample Questions
```
1. What is React and how does it differ from other JavaScript frameworks?
2. Explain the Virtual DOM and how React uses it for performance.
3. What is JSX and why is it used in React?
4. Difference between functional and class components.
5. What are props and how do they differ from state?
6. Explain the useState hook with an example.
7. How does useEffect work? What is the cleanup function?
8. What is the difference between useMemo and useCallback?
9. Explain useRef and its common use cases.
10. How does useContext work and when should you use it?
11. What is useReducer and when is it better than useState?
12. What are custom hooks? Write an example (useLocalStorage, useDebounce).
13. Explain React reconciliation and the key prop.
14. How does React handle events? What is synthetic events?
15. Controlled vs uncontrolled components — difference and use cases.
16. What are React Server Components (RSC)?
17. Explain the use() hook in React 19.
18. What is useActionState and how does it simplify forms?
19. How does the React Compiler (React Forget) work?
20. What are React 19 Actions?
21. How do you optimize React performance? (memo, useMemo, useCallback, lazy loading)
22. What are Error Boundaries and how do you create one?
23. Explain React Context API — when is it appropriate vs prop drilling?
24. How does React Router work? (BrowserRouter, Routes, Route, Link, NavLink)
25. Composition vs inheritance in React.
26. What are Higher-Order Components (HOCs) and Render Props?
```

---

## Angular — 30 Questions

### Topics to Cover

| Topic | Count | Difficulty |
|-------|-------|------------|
| Angular Basics (framework, CLI, architecture) | 4 | Easy |
| Components & Templates | 4 | Easy-Medium |
| Data Binding & Directives | 3 | Easy-Medium |
| Dependency Injection | 2 | Medium |
| Services & HttpClient | 2 | Medium |
| Routing & Navigation | 3 | Medium |
| Forms (Template-driven & Reactive) | 3 | Medium |
| Pipes | 1 | Easy |
| RxJS in Angular | 3 | Medium-Hard |
| Angular Signals | 3 | Hard |
| Standalone Components | 1 | Medium |
| Change Detection | 1 | Medium |
| Angular Universal (SSR) | 1 | Medium |
| Testing Angular Apps | 1 | Medium |

### Sources
- [github/greatfrontend/top-angular-interview-questions](https://github.com/greatfrontend/top-angular-interview-questions)
- [interviewbit.com — Top 65+ Angular Questions](https://www.interviewbit.com/angular-interview-questions/)
- [simplilearn.com — Angular Interview Questions 2026](https://www.simplilearn.com/tutorials/angular-tutorial/angular-interview-questions)
- [stackinterview.dev — Top 30 Angular Questions](https://stackinterview.dev/guides/angular-interview-questions-and-answers-2026)

### Tags
`angular`, `components`, `templates`, `data-binding`, `directives`, `dependency-injection`, `services`, `http-client`, `routing`, `forms`, `reactive-forms`, `pipes`, `rxjs`, `angular-signals`, `standalone-components`, `change-detection`, `angular-universal`, `ssr`, `testing`

### Sample Questions
```
1. What is Angular and how is it different from AngularJS?
2. Explain the architecture of an Angular application.
3. What are the main building blocks of Angular? (modules, components, templates, metadata, data binding, directives, services, DI)
4. What is a component in Angular and how do you create one?
5. Explain data binding in Angular (interpolation, property binding, event binding, two-way binding).
6. What are structural directives? (ngIf, ngFor, ngSwitch)
7. What are attribute directives? (ngClass, ngStyle, custom directives)
8. Explain Dependency Injection in Angular.
9. What are services in Angular and why are they used?
10. How does Angular HttpClient work?
11. Explain Angular Router and lazy loading.
12. What are route guards? (CanActivate, CanDeactivate, Resolve)
13. Template-driven vs Reactive forms — differences and use cases.
14. How do you implement form validation in Angular?
15. What are pipes in Angular? Built-in vs custom pipes.
16. How do you use RxJS Observables in Angular?
17. What are Angular Signals and how do they differ from RxJS?
18. What are standalone components and why replace NgModules?
19. Explain Angular's change detection strategy (Default vs OnPush).
20. What is Angular Universal and how does SSR work?
21. How do you test an Angular component/service?
```

---

## State Management — 25 Questions

### Topics to Cover

| Topic | Count | Difficulty |
|-------|-------|------------|
| State Management Fundamentals | 3 | Easy |
| Redux Core Concepts (store, actions, reducers) | 4 | Easy-Medium |
| Redux Data Flow & Immutability | 3 | Medium |
| Redux Toolkit (configureStore, createSlice, createAsyncThunk) | 5 | Medium |
| RTK Query | 2 | Medium-Hard |
| Middleware (Thunk, Saga) | 2 | Medium |
| NgRx (store, actions, reducers, effects, selectors, entity) | 4 | Medium-Hard |
| Zustand / Jotai (modern alternatives) | 2 | Medium |

### Sources
- [easyinterview.me — 50+ Redux Questions](https://easyinterview.me/blogs/the-interview-questions-that-matter/redux-interview-guide)
- [techbaithak.com — Top 41 Redux Questions](https://techbaithak.com/interview-questions/redux-state-management)
- [sharpskill.dev — NgRx Fundamentals](https://sharpskill.dev/en/technologies/angular/interview-questions/ngrx-fundamentals)
- [climbtheladder.com — 20 NgRx Questions](https://climbtheladder.com/ngrx-interview-questions/)
- [github/becodewala — 200 Redux Toolkit Questions](https://github.com/becodewala-youtube/200-Redux-Toolkit-Interview-Preparation-Questions-With-Answers)

### Tags
`state-management`, `redux`, `redux-toolkit`, `ngrx`, `zustand`, `jotai`, `store`, `actions`, `reducers`, `selectors`, `middleware`, `thunk`, `rtk-query`, `effects`, `entity-adapter`, `immutability`

### Sample Questions
```
1. What is state management and why is it needed in frontend applications?
2. Explain the core principles of Redux (single source of truth, state is read-only, changes via pure functions).
3. What is the Redux data flow? Draw/store → dispatch → reducer → store.
4. Difference between Redux and React Context API.
5. What is Redux Toolkit and how does it simplify Redux?
6. How does createSlice work in Redux Toolkit?
7. What is createAsyncThunk and how does it handle async actions?
8. What is RTK Query and how does it differ from createAsyncThunk?
9. What are selectors and why is memoization important? (createSelector / Reselect)
10. What is Redux middleware? Explain applyMiddleware and the middleware chain.
11. What is NgRx and what problems does it solve in Angular?
12. Explain NgRx Store, Actions, Reducers, and Selectors.
13. What are NgRx Effects and how do they handle side effects?
14. What is NgRx Entity and how does it simplify CRUD operations?
15. What is Zustand and how does it compare to Redux?
16. What is Jotai and what problem does it solve?
17. How do you test Redux reducers and async thunks?
```

---

## AI Basics (Generative AI, RAG, MCP) — 20 Questions

### Topics to Cover

| Topic | Count | Difficulty |
|-------|-------|------------|
| Generative AI Fundamentals | 4 | Easy |
| LLMs (Large Language Models) | 3 | Medium |
| RAG (Retrieval-Augmented Generation) | 5 | Medium-Hard |
| MCP (Model Context Protocol) | 4 | Hard |
| Prompt Engineering | 2 | Medium |
| AI in Frontend Apps | 2 | Medium |

### Sources
- [medium.com — GenAI Interview Questions](https://medium.com/@abdullah.iu.cse/rag-generative-ai-interview-questions-and-answers-0b673d2b56c1)
- [agentswarms.fyi — GenAI Interview Questions](https://agentswarms.fyi/interview-questions)
- [analyticsvidhya.com — 40 RAG Questions](https://www.analyticsvidhya.com/blog/2026/02/rag-interview-questions-and-answers/)
- [medium.com — GenAI FDE Interview: MCP, A2A, RAG](https://medium.com/@trivajay259/genai-forward-deployed-engineer-interview-questions-how-strong-candidates-answer-mcp-a2a-rag-8d4d8de2d4b0)
- [github/KalyanKS-NLP — RAG Interview Questions](https://github.com/KalyanKS-NLP/RAG-Interview-Questions-and-Answers-Hub)

### Tags
`generative-ai`, `llm`, `rag`, `mcp`, `prompt-engineering`, `embeddings`, `vector-database`, `langchain`, `ai-agents`, `tool-calling`, `model-context-protocol`

### Sample Questions
```
1. What is Generative AI and how does it differ from traditional AI/ML?
2. What are Large Language Models (LLMs) and how do they work?
3. What is a transformer architecture? (high-level: attention, encoder-decoder)
4. What is Retrieval-Augmented Generation (RAG)? Explain the pipeline.
5. What are embeddings and how are they used in RAG?
6. What is a vector database? Compare ChromaDB, Pinecone, pgvector.
7. Explain the RAG architecture: ingestion → chunking → embedding → retrieval → generation.
8. What is chunking and what strategies exist? (fixed-size, semantic, recursive)
9. What is the Model Context Protocol (MCP)? How does it standardize AI-tool communication?
10. Explain MCP architecture: Host, Client, Server, and JSON-RPC transport.
11. How does MCP differ from native function/tool calling?
12. What is an MCP server and how do you build one?
13. What are AI Agents and how do they differ from simple chatbots?
14. What is prompt engineering? (few-shot, chain-of-thought, system prompts)
15. How can you use AI/LLMs in frontend applications?
16. What is the difference between RAG and fine-tuning?
17. What are hallucinations in LLMs and how do RAG/grounding reduce them?
18. What is LangChain and what problems does it solve?
```

---

## Testing — 30 Questions

### Topics to Cover

| Topic | Count | Difficulty |
|-------|-------|------------|
| Testing Fundamentals (pyramid, types) | 3 | Easy |
| Jest (matchers, mocks, spies, snapshots) | 7 | Medium |
| React Testing Library (queries, userEvent, async) | 8 | Medium |
| Component Testing Patterns | 4 | Medium-Hard |
| End-to-End Testing (Cypress, Playwright) | 4 | Medium |
| Mocking Strategies (jest.mock, MSW) | 2 | Medium |
| Testing Best Practices | 2 | Medium |

### Sources
- [easyinterview.me — 50+ Frontend Testing Questions](https://easyinterview.me/blogs/the-interview-questions-that-matter/frontend-testing-interview-guide)
- [freecodecamp.org — Testing with Jest, RTL, Cypress](https://www.freecodecamp.org/news/test-a-react-app-with-jest-testing-library-and-cypress/)
- [learncodewithdurgesh.com — React Testing Questions](https://learncodewithdurgesh.com/tutorials/react-handbook/react-testing-top-interview-questions-answers)
- [techcoder.io — React Testing Questions](https://techcoder.io/interview-questions/react/testing-and-best-practices)
- [testmuai.com — Top 50 Jest Questions](https://www.testmuai.com/learning-hub/jest-interview-questions/)

### Tags
`testing`, `jest`, `react-testing-library`, `cypress`, `playwright`, `unit-testing`, `integration-testing`, `e2e`, `snapshot-testing`, `mocking`, `msw`, `tdd`, `testing-pyramid`

### Sample Questions
```
1. What is the testing pyramid and why does it matter?
2. Difference between unit, integration, and end-to-end tests.
3. What is Jest and what features does it provide?
4. What are Jest matchers? Common ones: toBe, toEqual, toBeTruthy, toContain, toThrow.
5. How do you create mocks and spies in Jest? (jest.fn(), jest.spyOn(), jest.mock())
6. What is snapshot testing and when should you use it?
7. How do you test async code in Jest? (callbacks, Promises, async/await, resolves/rejects)
8. What is React Testing Library (RTL) and what problems does it solve?
9. What is the query priority in RTL? (getByRole → getByLabelText → getByText → getByTestId)
10. Difference between getBy, queryBy, and findBy in RTL.
11. What is userEvent and why prefer it over fireEvent?
12. How do you test a component that makes API calls? (mock service, MSW)
13. How do you test custom hooks? (renderHook, act)
14. How do you test Error Boundaries?
15. How do you test forms and user interactions?
16. What is Cypress and how is it different from Jest?
17. How do you write a basic Cypress E2E test?
18. What is Playwright and how does it compare to Cypress?
19. How do you test component accessibility? (jest-axe)
20. What is MSW (Mock Service Worker) and why is it useful?
21. What are testing best practices? (avoid testing implementation details, test behavior, use meaningful assertions)
22. How do you set up CI/CD for frontend tests?
```

---

## Implementation Order

1. **React chapter + questions** — highest priority, most-asked topic
2. **Angular chapter + questions** — second frontend framework
3. **Testing chapter + questions** — foundational skill for any frontend role
4. **State Management chapter + questions** — spans both React and Angular
5. **AI Basics chapter + questions** — emerging topic, good-to-have

---

## Estimated Effort

| Section | Questions | Chapter Content | Total Est. |
|---------|-----------|-----------------|------------|
| React | 50 QA pairs | 1 chapter block | ~2,500 lines seed-data + ~150 lines chapters |
| Angular | 30 QA pairs | 1 chapter block | ~1,500 lines seed-data + ~150 lines chapters |
| State Management | 25 QA pairs | 1 chapter block | ~1,250 lines seed-data + ~150 lines chapters |
| AI Basics | 20 QA pairs | 1 chapter block | ~1,000 lines seed-data + ~150 lines chapters |
| Testing | 30 QA pairs | 1 chapter block | ~1,500 lines seed-data + ~150 lines chapters |
| **Total** | **155 QA pairs** | **5 chapters** | **~7,750 lines seed-data + ~750 lines chapters** |

---

## Verification

After implementation, verify with:
```bash
npx tsc --noEmit
npx next build
```

No DB migration needed — Drizzle schema is schema-less for questions (JSONB tags, text fields).
Run re-seed if needed:
```bash
npx tsx config/seed-interview.ts
```
