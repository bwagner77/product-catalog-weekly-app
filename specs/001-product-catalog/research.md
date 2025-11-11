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

## Performance Validation Steps (Playwright) — MVP (T041)

Tools: Playwright (Chromium), Node 20. Run frontend (5173) and backend (3000) locally (Docker Compose or dev servers).

1) API latency sample (p95 rough):

```
// scripts/api-latency.mjs (optional scratch)
import { performance } from 'node:perf_hooks';

const runs = 10;
const times = [];
for (let i = 0; i < runs; i++) {
	const t0 = performance.now();
	const res = await fetch('http://localhost:3000/api/products');
	await res.json();
	times.push(performance.now() - t0);
}
times.sort((a, b) => a - b);
const p95 = times[Math.floor(0.95 * (times.length - 1))];
console.log({ runs, p95_ms: Math.round(p95), times_ms: times.map(t => Math.round(t)) });
```

2) Page render timing (catalog first paint to list ready):

```
// scripts/page-render.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test('ProductList first render under 2000ms (local)', async ({ page }) => {
	const t0 = Date.now();
	await page.goto('http://localhost:5173');
	await page.getByRole('list', { name: /product list/i }).waitFor({ state: 'visible' });
	const elapsed = Date.now() - t0;
	console.log('first render ms:', elapsed);
	expect(elapsed).toBeLessThanOrEqual(2000);
});
```

3) Notes:
- Warm-up one request before measuring to avoid cold-start artifact.
- Run 3× and average locally; capture worst-case.
- Ensure no other heavy processes during measurement.
- Network is localhost; cloud targets and budgets TBD in future scope.

## Tasks for Research Execution

- Create simple Playwright script to capture page load to first list render (manual run).
- Document how to collect API latency locally (curl or small Node script). Record p95 estimates.

## Outcomes

All NEEDS CLARIFICATION resolved or deferred explicitly with rationale. Proceed to Phase 1 design.
