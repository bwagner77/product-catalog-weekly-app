# Phase 0 Research: Product Catalog

Date: 2025-11-10
Branch: 001-product-catalog
Updated: 2025-11-21 (E-commerce + Images + Navigation SLO + Gating + Dual Modal Dismissal)
Updated: 2025-11-22 (Mobile hamburger navigation FR-061..FR-068 + SC-043..SC-050)

## Unknowns and Questions

- Cloud deployment specifics: Deferred for MVP (local Docker only).
- Performance validation tooling: Choose Playwright for manual local measures.
- Image optimization strategy: Deferred (use static placeholders, no resizing pipeline yet).
- Stock decrement behavior (UPDATED 2025-11-21): Orders now atomically decrement stock via Mongo `bulkWrite` with per-line conditional filters (`stock: { $gte: quantity }`). If any filter fails (insufficient stock or race), the operation aborts and the API returns 409 with no partial fulfillment. Advanced inventory (reservations, restock flows) remains deferred.
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

### Performance & Navigation Targets
- Decision: Frontend render ≤2s p95 (typical ≤1s); API latency ≤1s p95; Navigation view switch (Products ↔ Categories) median ≤200ms p95 ≤400ms over ≥50 consecutive toggles; image fallback substitution <1s; CLS <0.1.
- Rationale: Ensures snappy SPA feel (navigation) while aligning with constitution responsiveness; explicit percentiles remove ambiguity.
- Validation: Perf probe test (T129) captures timestamps for switches; images timing tests assert fallback substitution and reserved box prevents layout shift (CLS observer or synthetic calculation). CLS test (T140) measures cumulative layout shift score; values ≥0.1 flagged.

### Images & Layout
 Decision: Square display box (200x200) with object-fit cover; deterministic placeholder images (`product<N>.jpg`) plus single shared `fallback.jpg` for missing/broken images; alt text pattern `<name> – image unavailable` on fallback.
 Rationale: Consistent grid, prevents layout shift (supports SC-018 CLS target <0.1); deterministic naming simplifies tests (SC-015..SC-017); explicit fallback alt pattern ensures accessibility (SC-019) and informs users of degraded state.
 Alternatives considered: Variable height (layout instability), per-product fallback variants (unnecessary complexity), lazy loading (deferred until scale), dynamic resizing service (out of scope phase).

 Validation: Manual via Playwright scripts measuring render and API timings; include visual completeness check that all images or fallbacks present ≤2s p95 (SC-018) and sample broken image simulation to ensure fallback substitution under 1s (SC-017).
- Decision: Case-insensitive partial substring match across name + description; multi-word treated as single phrase.
- Rationale: Simple mental model, efficient with basic indexes; avoids complexity of tokenization.
### Image Success Criteria References (FR-041)

 SC-015: Verify all `imageUrl` fields non-empty via backend test (`productsImages.test.ts`).
 SC-016: Frontend renders either image or fallback (use JSDOM + error event test).
 SC-017: Simulated error event triggers immediate source swap to `fallback.jpg` (assert synchronous handler behavior).
 SC-018: 200x200 reserved box prevents layout shift; measure CLS (<0.1) manually with Performance panel if desired.
 SC-019: Alt text pattern validated for fallback `<name> – image unavailable`.

Sampling Guidance:
 Run images test suite after seed to confirm deterministic asset references.
 For manual perf pass: throttle CPU 4x and network to Fast 3G; confirm placeholder + fallback still within SC-018 budget (local variance acceptable; treat >2.5s as investigation trigger).
- Alternatives considered: Token AND logic (increases complexity), fuzzy search (overkill), exact match (poor UX).

### Category Deletion Rule
- Decision: Block deletion if products reference category.
- Rationale: Prevent orphaned product references; simple integrity without cascade.
- Alternatives considered: Cascade removal (data loss risk), allow deletion (creates invalid state), soft-delete (unneeded complexity).

### Stock Handling (UPDATED 2025-11-21)
### Category Administration Gating (Replaced by JWT Role Enforcement 2025-11-21)
- Decision: Legacy environment flag removed; gating now enforced via JWT role claim (`role: 'admin'`).
- Rationale: Constitution mandates explicit role-based access; JWT offers stateless verification & clear expiry semantics.
- Alternatives considered: Environment flag (removed), API key (no role granularity), session cookie (requires store), full user directory (deferred).
- Validation: Auth middleware tests assert: 401 missing/invalid/expired token (`admin_auth_required` or `token_expired`), 403 non-admin (`forbidden_admin_role`), zero data mutation on failure.

### JWT Authentication (Added 2025-11-21)
- Decision: HS256 JWT issued by `POST /api/auth/login` containing `{ role: 'admin', iat, exp }`, exp = 1h.
- Rationale: Minimal complexity, single admin role, easy rotation of secret via env `JWT_SECRET`.
- Security: Token stored in `localStorage` key `shoply_admin_token` (acceptable for MVP; future migration to httpOnly cookie possible). Expired tokens purged client-side on detection.
- Edge Cases: Expiry mid-request yields 401 `token_expired`; malformed signature 401 `admin_auth_required`; valid token wrong role 403 `forbidden_admin_role`.
- No Refresh Tokens: User re-authenticates after expiry; reduces attack surface (no token pair lifecycle).
- Future: Introduce multi-role matrix, refresh flow, and revocation list.

### RBAC Rationale (2025-11-22)
- Background: A legacy environment flag previously gated write routes. This created ambiguity and brittle environments. We replaced it with explicit JWT role enforcement.
- Decision: Admin-only writes (categories/products) enforced by middleware verifying a Bearer JWT and role claim `role:'admin'`.
- Semantics: 401 `admin_auth_required` for missing/invalid signatures; 401 `token_expired` for expired tokens; 403 `forbidden_admin_role` for valid non-admin tokens. All return standardized `{ error, message }` and guarantee zero mutation.
- Client UX: Frontend clears tokens and routes to Login on 401/403; AccessDenied renders for blocked admin pages with no privileged flicker; admin nav links are hidden when unauthenticated/non-admin.
- Why this approach: Stateless, simple, and testable; aligns with constitution’s explicit RBAC and clear error semantics; avoids partial writes and minimizes stateful server requirements.
- Future: Expand to multiple roles (e.g., manager, auditor) via RBAC matrix and extend tests accordingly; consider moving storage to httpOnly cookies and adding refresh tokens when necessary.

### Dual Modal Dismissal Accessibility
- Decision: Provide both × icon and "Close" button for order confirmation modal.
- Rationale: Satisfies constitution requirement for accessible dismissal; supports users preferring explicit action labels.
- Validation: Tests T136 & T139 assert focus returns to triggering element and both controls operable via keyboard.

### Rounding Micro-Benchmark
- Decision: Benchmark `roundCurrency` with 10k mixed price inputs (small cents, large values, repeating decimals); acceptable cumulative drift < $0.01.
- Rationale: Ensures helper stability under load and varied values.
- Validation: Benchmark test T137 logs mean, stddev, final aggregate difference; fail if drift ≥ $0.01.

### CLS Measurement Plan
 - Decision: Use JSDOM + synthetic layout constants or Playwright visual diff to approximate layout shift; assert no unexpected reflow beyond reserved image container; treat cumulative layout shift score ≥0.1 as failure.
 - Validation: Implemented T135 (dimension reservation), T140 (CLS proxy test), and T141 (alt pattern en dash test) confirming image container stability and accessible fallback semantics. Optional Lighthouse run (manual) may further confirm CLS <0.1.
- Decision: Display stock, gate cart additions when stock = 0 or requested quantity > stock, and decrement stock atomically on successful order submission (bulkWrite conditional filters). No partial fulfillment.
- Rationale: Keeps catalog availability accurate post-purchase while preserving simple, low-contention integrity without full transactions.
- Alternatives considered: Deferred decrement (stale availability), non-atomic sequential updates (race window), multi-document transaction (unnecessary complexity at current scale).
- Concurrency: Simultaneous orders for limited stock yield one 201 success; subsequent conflicting submissions receive 409 (validated in T121).

## Coverage & Instrumentation Summary (Added 2025-11-21)
Backend test coverage: >94% statements / >81% branches (≥80% target). Frontend coverage: >95% statements / >86% branches. Performance probes (`perf.test.ts`, `orderPerf.test.ts`) gated behind `PERF=1` environment variable to avoid CI noise; they log average and p95 latencies. Logging & metrics test (`loggingMetrics.test.ts`) validates structured request log format and error counter increments. Image timing and fallback tests assert synchronous substitution (<1000ms) and alt pattern correctness ensuring SC-015..SC-019. Accessibility suite covers focus management for order confirmation dialog.

### Protected Admin Write Performance Sampling (Added 2025-11-22)
Purpose: Establish baseline latency for protected admin POST operations (categories & products) under local loopback conditions and confirm CRUD responsiveness meets SC-028 (<1000 ms p95).

Probe File: `backend/tests/api/protectedPerf.test.ts` (activated only when `PERF_PROTECTED=1`). Measures average and p95 over N authenticated POST requests to `/api/categories` and `/api/products` using a freshly issued admin JWT.

Environment Variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PERF_PROTECTED` | (unset) | Set to `1` to enable protected write probe describe blocks. |
| `PERF_PROTECTED_RUNS` | `10` | Number of iterations per endpoint. |
| `PERF_PROTECTED_ASSERT` | (unset) | Set to `1` to enable threshold assertions. |
| `PERF_PROTECTED_CATEGORY_THRESHOLD_MS` | `1000` | p95 threshold for category POST when asserting. |
| `PERF_PROTECTED_PRODUCT_THRESHOLD_MS` | `1000` | p95 threshold for product POST when asserting. |

Sample Local Results (Windows, Node 20, Mongo local):
```
POST /api/categories p95 ≈ 25 ms (avg ≈ 20 ms)
POST /api/products  p95 ≈ 13 ms (avg ≈ 13 ms)
```

Interpretation:
- First category POST in a run may be slower (index checks/JIT); subsequent stabilize.
- Both endpoints far below the 1000 ms guardrail; headroom for future complexity.
- Slight difference expected (product validation path warmed quickly, category name uniqueness check occasionally hits duplicate avoidance logic).

Execution (PowerShell):
```powershell
cd backend
$env:PERF_PROTECTED='1'; npm test -- --runTestsByPath ./tests/api/protectedPerf.test.ts

# With assertions
$env:PERF_PROTECTED='1'; $env:PERF_PROTECTED_ASSERT='1'; \
	$env:PERF_PROTECTED_CATEGORY_THRESHOLD_MS='1000'; \
	$env:PERF_PROTECTED_PRODUCT_THRESHOLD_MS='1000'; \
	npm test -- --runTestsByPath ./tests/api/protectedPerf.test.ts
```

Guidance:
- Investigate local p95 > 250 ms (may indicate locking or synchronous CPU work).
- Track p95 & avg; ignore pronounced cold-start outlier if isolated.
- For production SLO planning, add p50/p95/p99 histograms and segregate by endpoint.
- If drift occurs, profile auth middleware (JWT verify & expiration) and Mongo insert path (ensure indexes stable).

Future Enhancements (Deferred): Add PUT/DELETE probes, capture concurrency under load, and export histogram metrics (StatsD or Prometheus) instead of console JSON.

### Order Snapshot
- Decision: Capture name, price, quantity at submission; immutable total.
- Rationale: Guards against product changes post-order; stable audit view.
- Alternatives considered: Re-resolve product data on read (risk divergence), store only productIds (requires joins later).
- Implementation Detail (2025-11-21): Snapshot taken BEFORE bulkWrite decrement; total rounded exactly once via `roundCurrency`; if any line fails its stock filter the entire operation aborts (409) and snapshot is discarded.

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

### Mobile Hamburger Navigation (Added 2025-11-22)
Context: Provide accessible mobile (<768px) navigation replacing inline desktop links with a single hamburger button (FR-061). Expansion reveals ordered vertical menu items with gating (admin-only items omitted for non-admin sessions) and preserves single `aria-current` (FR-062, FR-063, SC-044, SC-046). Interactions must meet performance and accessibility success criteria SC-043..SC-050.

Functional Requirements:
- FR-061: Collapse desktop navigation into a single hamburger button on mobile (<768px) hiding individual nav items initially.
- FR-062: Accessible semantics: `aria-label="Menu"`, `aria-controls` referencing menu container id, dynamic `aria-expanded`.
- FR-063: Expanded menu lists items in canonical order and omits admin-only items for non-admin users without flash.
- FR-064: Collapsing hides items and returns focus to hamburger button.
- FR-065: Activating a menu item collapses menu and shifts focus to target view heading within ≤500ms.
- FR-066: Rapid toggling (≥50 cycles) remains stable (no duplicate containers or multiple `aria-current`).
- FR-067: Viewport transitions mobile→desktop→mobile preserve active route and avoid CLS >0.1.
- FR-068: Implementation avoids race conditions under rapid input.

Success Criteria (SC-043..SC-050):
- SC-043: Initial mobile render shows only hamburger button; no hidden focusable nav items.
- SC-044: Expanded menu shows vertical ordered items with single `aria-current`.
- SC-045: Toggle median latency ≤300ms (p95 ≤300ms) locally.
- SC-046: Non-admin users never see transient admin-only items.
- SC-047: Post-activation focus lands on target view heading reliably.
- SC-048: Rapid toggling preserves invariants (single container, single `aria-current`).
- SC-049: Viewport transitions do not cause CLS >0.1; state preserved.
- SC-050: Accessibility audit: zero critical violations; semantics valid.

Implementation Notes:
- Breakpoint detection via `useIsMobile` hook.
- Focus management: multi-delay attempts (0/10/25ms) mitigate test async rendering.
- Menu container `role="menu"`; items `role="menuitem"`.
- Rapid toggle stability validated by state-driven single render (T210).
- Viewport transition test (T212) ensures preserved active view.
- Optional performance micro-measure (T220) logs toggle duration anomalies (dev only).

Testing Mapping:
- T206–T213: Initial render, expand semantics/order, collapse focus, activation focus, rapid toggle, gating, viewport transitions, accessibility semantics.
- T214–T221: Implementation tasks (responsive logic, menu container, semantics, focus transfer, robustness, state preservation, perf measure, constants alignment).
- T222: Checklist update (pending).
- T223: This doc + quickstart updates.
- T224: Mapping file augmentation.

Future Considerations:
- Add prefers-reduced-motion transition.
- Evaluate analytics for interaction refinement.
- Potential NavBar component extraction for theming/i18n.
