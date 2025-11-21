# Phase 0 Research: Product Catalog

Date: 2025-11-10
Branch: 001-product-catalog
Updated: 2025-11-20 (E-commerce + Images Extensions)

## Unknowns and Questions

- Cloud deployment specifics: Deferred for MVP (local Docker only).
- Performance validation tooling: Choose Playwright for manual local measures.
- Image optimization strategy: Deferred (use static placeholders, no resizing pipeline yet).
- Stock decrement behavior: For this phase, do NOT mutate stock on order submission (inventory accounting deferred).
- Category deletion with assigned products: Clarified as blocked to preserve integrity.

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
- Decision: Product { id (UUID immutable), name, description, price, categoryId, stock, imageUrl, createdAt, updatedAt }
- Rationale: Added categoryId for filtering organization; stock for availability display & cart rules; imageUrl for visual context; all fields align with extended spec.
- Alternatives considered: Use ObjectId references only (simpler but less explicit in API surface); exclude stock (would remove availability UX); omit imageUrl (reduces visual UX). Kept explicit fields for clarity.

### Seeding Strategy
- Decision: Idempotent seed using upsert; ensure ≥20 products with deterministic image filenames `product<N>.jpg` and ≥5 categories; skip inserts if counts satisfied.
- Rationale: Larger seed increases search/filter realism; deterministic image names simplify tests.
- Alternatives considered: Random image names (harder to assert), fewer products (less robust search/filter testing), seeding categories only when empty (kept idempotency logic).

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

### Images & Layout
- Decision: Square display box (approx 200x200) with object-fit cover; fallback placeholder for missing/broken images.
- Rationale: Consistent visual grid, prevents layout shift; cover cropping widely adopted.
- Alternatives considered: Contain (risk letterboxing), variable heights (causes masonry complexity), lazy loading (deferred until scale demands).

### Search Semantics
- Decision: Case-insensitive partial substring match across name + description; multi-word treated as single phrase.
- Rationale: Simple mental model, efficient with basic indexes; avoids complexity of tokenization.
- Alternatives considered: Token AND logic (increases complexity), fuzzy search (overkill), exact match (poor UX).

### Category Deletion Rule
- Decision: Block deletion if products reference category.
- Rationale: Prevent orphaned product references; simple integrity without cascade.
- Alternatives considered: Cascade removal (data loss risk), allow deletion (creates invalid state), soft-delete (unneeded complexity).

### Stock Handling
- Decision: Display stock and prevent cart additions when stock = 0 or requested quantity > stock; do NOT decrement stock on order submission in this phase.
- Rationale: Separates availability signaling from inventory accounting; simplifies order logic.
- Alternatives considered: Decrement stock immediately (needs concurrency/inventory logic), ignore stock (loss of UX clarity).

### Order Snapshot
- Decision: Capture name, price, quantity at submission; immutable total.
- Rationale: Guards against product changes post-order; stable audit view.
- Alternatives considered: Re-resolve product data on read (risk divergence), store only productIds (requires joins later).

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

All NEEDS CLARIFICATION resolved or deferred explicitly with rationale. Proceed to updated Phase 1 design for extended features.

## List Size and Pagination (Clarification A)

- Decision: Cap GET /api/products at ≤100 items; no pagination in MVP. UI presents a single-page list.
- Rationale: Simplicity and speed for MVP; small dataset assumption makes pagination unnecessary now.
- Trade-offs: Large lists may increase initial render time and scrolling. No server- or client-side paging means no incremental fetch or navigation controls.
- Future options: Add `limit`/`offset` or cursor-based pagination with sorting when scale or UX requirements change; update OpenAPI accordingly.

## T055: Performance Guidance and Probes

This section formalizes the “typical load,” targets, and adds an optional local probe to measure API latency. It complements the MVP Playwright notes above without introducing new runtime deps.

### Typical Load (Local)

- Environment: Local dev on Windows or macOS
- Services: Docker Compose up (MongoDB, backend, frontend) OR dev servers running locally
- Database: Seeded with default products (≥5)
- Network: localhost (no throttling)
- Browser: Chromium-based or Firefox (no extensions interfering)

### Targets (local, non-throttled)

- SC-001 API latency: GET /api/products p95 ≤ 1000 ms
- SC-002 Frontend first render to list visible: p95 ≤ 2000 ms

Notes: These are local sanity thresholds, not production SLOs. They aim to catch regressions and obvious slowdowns.

### Optional Backend API Probe (Jest + Supertest)

An opt-in test exists at `backend/tests/api/perf.test.ts`. It is skipped by default and activates only when the environment variable `PERF=1` is set. It warms up the route, measures N requests, and logs average and p95 in milliseconds.

Run (Windows PowerShell):

```powershell
cd backend
$env:PERF = '1'
# Optional: configure runs/thresholds
# $env:PERF_RUNS = '20'; $env:PERF_THRESHOLD_MS = '1000'; $env:PERF_ASSERT = '0'
npm test -- --runInBand backend/tests/api/perf.test.ts
```

Output example:

```
{"runs":20,"avg_ms":42,"p95_ms":85,"times_ms":[...]} 
```

To enforce a threshold locally (optional):

```powershell
$env:PERF='1'; $env:PERF_ASSERT='1'; $env:PERF_THRESHOLD_MS='1000'; npm test -- --runInBand backend/tests/api/perf.test.ts
```

### Optional Frontend Page Timing (Manual)

We avoid adding E2E deps in MVP. For a quick manual check, use DevTools Performance panel or run the Playwright snippet from the MVP section. Alternatively, use the browser console to approximate first render timing:

```js
performance.mark('start');
// reload the page from the address bar, then once products render:
const t = performance.measure('render', 'start'); console.log('ms', t.duration);
```

Recommendations:
- Warm up once before timing.
- Run at least 3 trials and consider the worst case.
- Close heavy background apps.
- Images: For performance sampling, treat placeholders as cacheable static assets; disregard optimization until future phase.
