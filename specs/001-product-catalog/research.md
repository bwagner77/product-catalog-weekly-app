# Phase 0 Research: Product Catalog

Date: 2025-11-10
Branch: 001-product-catalog

## Unknowns and Questions

- Cloud deployment specifics: Deferred for MVP (local Docker only).
- Performance validation tooling: Choose Playwright for manual local measures.

## Decisions

### Frontend Stack
- Decision: React 18 + TypeScript + Vite + TailwindCSS
- Rationale: Fast dev experience, Tailwind-only styling per constitution, Vite for DX and dev server with proxy.
- Alternatives considered: CRA (deprecated), Next.js (overkill), plain React + Webpack (heavier).

### Backend Stack
- Decision: Express + TypeScript + Mongoose
- Rationale: Mature, widely adopted, easy to containerize; Type safety; lean Mongo queries.
- Alternatives considered: Fastify (perf gain not needed), NestJS (extra complexity), Koa (less common).

### Data Model
- Decision: Product { id (UUID immutable), name, description, price, createdAt, updatedAt }
- Rationale: UUID prevents collisions across environments; timestamps via Mongoose `timestamps: true`.
- Alternatives considered: Mongo ObjectId only (kept but expose UUID as primary id field in API), composite keys (unnecessary).

### Seeding Strategy
- Decision: Idempotent seed using upsert on UUID or name+price tuple; if products exist (count >= 5) skip insert.
- Rationale: Ensures first run visibility; no duplicates across restarts.
- Alternatives considered: Blind insert (duplicates), Drop collection (destructive).

### Observability
- Decision: Basic request logging + error counter + startup seed verification log (per Clarification Q1).
- Rationale: Meets MVP simplicity and constitution's Code Quality and Testing principles.
- Alternatives considered: Full tracing (overkill), metrics suite (deferred).

### Testing Approach
- Decision: Backend Jest + Supertest; Frontend Vitest + RTL; ≥80% coverage on critical paths; place tests in required directories.
- Rationale: Aligns with constitution and request; wide community support.
- Alternatives considered: Mocha/Chai (less integrated), Cypress E2E (out of scope).

### Performance Targets
- Decision: Frontend render ≤2s p95 (typical ≤1s); API latency ≤1s p95.
- Rationale: Matches spec and constitution; feasible locally.
- Validation: Manual via Playwright scripts measuring render and API timings.

## Tasks for Research Execution

- Create simple Playwright script to capture page load to first list render (manual run).
- Document how to collect API latency locally (curl or small Node script). Record p95 estimates.

## Outcomes

All NEEDS CLARIFICATION resolved or deferred explicitly with rationale. Proceed to Phase 1 design.
