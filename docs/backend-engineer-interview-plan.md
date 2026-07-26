# Backend Engineer Interview Questions — Build Plan

## Overview

Add 6 chapters (~120 Q&A pairs) to the Backend Engineer interview category.

## Chapters

| # | Chapter | Est. Questions | Status |
|---|---------|:-------------:|--------|
| 1 | **Database Design & Optimization** | ~20 | Chapter defined, needs Q&A |
| 2 | **API Design & RESTful Services** | ~20 | Chapter defined, needs Q&A |
| 3 | **Spring Boot & Java Ecosystem** | ~20 | Chapter added, needs Q&A |
| 4 | **.NET / ASP.NET Core** | ~20 | Chapter added, needs Q&A |
| 5 | **Laravel (PHP)** | ~20 | Chapter added, needs Q&A |
| 6 | **Django (Python)** | ~20 | Chapter added, needs Q&A |

## Existing Questions to Remap

~26 questions already in `seed-data.ts` under `backend-engineer` — most are Spring/Java or general backend topics. These need to be moved into the appropriate chapters above (mainly Database Design, API Design, and Spring Boot).

## Implementation Order

1. `chapters-seed-data.ts` — ✅ Added 4 new chapters (Spring Boot, .NET, Laravel, Django)
2. `seed-data.ts` — Populate Q&A for all 6 chapters (~20 each = ~120 total)
3. Remap existing ~26 questions into proper chapters
4. Run `tsc --noEmit`
5. Run `npx tsx config/seed-interview.ts` to reseed
6. Verify in browser

## Chapter Details

### 1. Database Design & Optimization

- Schema design, normalization (1NF-3NF) vs denormalization
- Indexing strategies (B-tree, hash, GiST, composite, covering)
- Query optimization (EXPLAIN ANALYZE, slow query tuning)
- Connection pooling (PgBouncer, ProxySQL)
- Read replicas, replication lag
- Partitioning (range, list, hash) and sharding
- Transaction isolation levels (Read Committed, Repeatable Read, Serializable)
- N+1 query problem
- ACID properties
- SQL vs NoSQL trade-offs

### 2. API Design & RESTful Services

- REST principles (resources, methods, statelessness)
- HTTP methods and status codes
- Versioning strategies (URL, header, query param)
- Pagination (cursor vs offset)
- Error handling (RFC 7807 Problem Details)
- Rate limiting (token bucket, sliding window)
- Authentication (JWT, OAuth2, API keys)
- Idempotency keys
- HATEOAS
- OpenAPI/Swagger documentation
- WebSocket upgrade
- CORS

### 3. Spring Boot & Java Ecosystem

- Auto-configuration and @SpringBootApplication
- Dependency injection (constructor vs field)
- Spring Data JPA (repositories, @Entity, @Transactional)
- Spring Security (SecurityFilterChain, JWT, OAuth2)
- AOP (aspects, pointcuts, advice types)
- Testing slices (@WebMvcTest, @DataJpaTest, @SpringBootTest)
- Actuator (health, metrics, info)
- Bean lifecycle (@PostConstruct, @PreDestroy, BeanPostProcessor)
- Profiles and external configuration
- Caching (@Cacheable, @CacheEvict, @CachePut)
- Spring Cloud (service discovery, config server, circuit breaker)
- WebFlux vs MVC
- Exception handling (@ControllerAdvice, @ExceptionHandler)
- Database migrations (Flyway, Liquibase)
- REST API design with Spring Boot

### 4. .NET / ASP.NET Core

- Middleware pipeline
- Dependency injection (AddSingleton, AddScoped, AddTransient)
- Entity Framework Core (DbContext, migrations, LINQ)
- Eager/lazy/explicit loading
- JWT authentication (AddJwtBearer)
- Minimal APIs vs Controller-based
- SignalR (real-time WebSocket)
- Testing with WebApplicationFactory
- IHostedService, BackgroundService
- Options pattern (IOptions, IOptionsSnapshot, IOptionsMonitor)
- Caching (IMemoryCache, IDistributedCache + Redis)
- Rate limiting middleware
- Clean architecture in .NET
- Global error handling (ExceptionHandlerMiddleware)
- CORS configuration
- Model binding and validation (Data Annotations, FluentValidation)

### 5. Laravel (PHP)

- MVC architecture (Routes, Controllers, Models, Blade)
- Eloquent ORM (relationships, accessors, mutators, scopes)
- Eager loading and N+1 prevention
- Migrations and seeders
- Artisan CLI
- Sanctum (SPA auth) vs Passport (OAuth2)
- API Resources
- Queues with Horizon
- Events and listeners
- Form Requests (validation + authorization)
- Service container and dependency injection
- Service providers
- Facades vs DI
- Caching (Cache::remember, Redis/file drivers)
- Laravel Octane
- Testing (PHPUnit, HTTP tests, factories)
- Scheduler
- File storage (local vs S3)

### 6. Django (Python)

- MVT architecture (Models, Views, Templates)
- ORM querysets (lazy evaluation, chaining)
- select_related vs prefetch_related
- Django REST Framework (ViewSets, Serializers, Routers)
- Migrations
- Authentication (Session, Token, JWT)
- Middleware
- Class-based vs function-based views
- Celery + Redis/RabbitMQ for async tasks
- Admin customization
- Testing (TestCase, pytest-django, Factory Boy)
- Signals (post_save, pre_delete)
- Database optimization (indexes, annotations, aggregations)
- Pagination (PageNumber vs Cursor)
- Custom management commands
- File uploads
- Security (CSRF, XSS, SQL injection)
- Django Channels for WebSocket
- Performance optimization workflow

## Notes

- Use the existing chapter structure pattern (overview, realLifeScenario, explanation, keyPoints, tips, sampleQuestions)
- Answers should be concise but thorough, with code examples where applicable
- Difficulty distribution per chapter: ~30% easy, ~50% medium, ~20% hard
- Existing Spring questions in seed-data.ts will be remapped into Spring Boot chapter (with possible redistribution to API Design chapter)
