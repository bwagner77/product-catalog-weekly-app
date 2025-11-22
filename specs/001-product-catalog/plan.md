# Implementation Plan: Shoply Product Catalog (Extended: E-commerce, Images, Navigation, Gating)

**Branch**: `001-product-catalog` | **Date**: 2025-11-14 (updated 2025-11-21 for Shoply branding, gating, dual modal dismissal; extended 2025-11-21 for Admin JWT Auth & Product Management) | **Spec**: ./spec.md
**Input**: Feature specification from `/specs/001-product-catalog/spec.md`

## Summary

Initial MVP delivered read‑only product listing. This extension adds categories (CRUD – now environment‑gated for write operations), product search & filtering, stock display and cart gating, client‑side cart with persistence, order submission with snapshot semantics and inventory stock decrement, deterministic product images plus fallback behavior, responsive layout refinements (grid breakpoints, collapsible cart sidebar, navigation bar), Shoply branding (logo + name), and dual dismissal for the order confirmation modal. Seed volume increases (≥20 products, ≥5 categories) to better exercise filtering and search. Product images use deterministic placeholder filenames (`product<N>.jpg`); no upload or transformation pipeline. Performance, accessibility, and containerization principles remain unchanged.

## Technical Context

**Language/Version**: TypeScript (ES2022), Node.js 20.x, React 18  
**Primary Dependencies**: Express, Mongoose, uuid, cors, Vite, React, TailwindCSS, Jest, Supertest, Vitest, React Testing Library, ESLint, Prettier, ts-node-dev (unchanged)  
**Added Concerns**: Client-side cart (localStorage), order snapshot logic, category CRUD flows, image display + fallback  
**Storage**: MongoDB (Mongoose ODM) — collections: products, categories, orders (orders store snapshots)  
**Testing**: Backend: Jest + Supertest; Frontend: Vitest + RTL; ≥80% coverage (must include new flows: search/filter, cart persistence, category CRUD, order creation, image fallback)  
**Target Platform**: Docker Compose (frontend 5173, backend 3000, MongoDB 27017)  
**Performance Goals**: Frontend initial render ≤2s p95 (typical ≤1s); API list/search ≤1s p95; cart ops & order submission ≤500ms typical; navigation view switch (Products ↔ Categories) median ≤200ms p95 ≤400ms; image loading/fallback ≤1s detection  
**Constraints**: Admin authentication via JWT (HS256, ≥1h expiration, role claim `admin`, no refresh tokens); no image upload; no caching/CDN; Tailwind-only; prices two decimals; UUID immutable; idempotent extended seed; lean queries; product volume ≤200 (search/filter) without pagination  
**Scale/Scope**: ≤200 products; low concurrency; cart local-only (no multi-user sync)  
**Out-of-Scope**: Advanced image optimization, pagination, discounting, tax, payments.

## Constitution Check (Pre-Extension Re-evaluated / Auth Extension)

Gate evaluation per Constitution (v1.1.0):

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| Code Quality | Single responsibility, Prettier 2‑space enforced | PASS | ESLint + Prettier planned; modular components/services |
| Testing Standards | Unit + integration, ≥80% coverage, no E2E | PASS | Jest/Vitest configured; thresholds enforced |
| UX Consistency | Mobile‑first, Tailwind‑only, accessibility, Shoply branding, dual modal dismissal | PASS | Branding tasks planned; modal has two dismissal controls |
| Performance | Page ≤2s, API ≤1s, cart/order ops ≤500ms | PASS | New ops targets added; still feasible locally |
| Security & RBAC | Admin-only write ops protected | PENDING | Enforce via JWT middleware + transitional env gating |
| Deployment Strategy | Docker Compose multi‑service | PASS | One‑command up via compose, .env used |
| Technology Choices | Mature, testable, container‑friendly | PASS | Express, React, Mongoose, Vite |
| Governance | Versioning, plan/spec/tasks artifacts | PASS | Plan/spec/contracts/data‑model/quickstart present |

Violations: None. Proceed to Phase 0/1 deliverables.

## Project Structure

### Documentation (this feature)

```text
specs/001-product-catalog/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 (decisions and rationale)
├── data-model.md        # Phase 1 (entities & validation)
├── quickstart.md        # Phase 1 (local run)
├── contracts/
│   └── openapi.yaml     # API contract
├── tasks.md             # (/speckit.tasks output)
└── spec.md              # Feature specification
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── routes/
│   │   └── products.ts
│   ├── models/
│   │   └── product.ts
│   ├── seed/
│   │   └── seedProducts.ts
│   ├── utils/
│   │   └── traceId.ts
│   └── config/
│       └── db.ts
└── tests/
    ├── api/
    │   └── products.test.ts
    ├── models/
    │   └── productModel.test.ts
    ├── seed/
    │   └── seedProducts.test.ts
    └── utils/
        ├── traceId.test.ts
        └── traceIdMiddleware.test.ts

frontend/
├── index.html
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── pages/
│   │   └── ProductList.tsx
│   ├── components/
│   │   ├── ProductCard.tsx
│   │   ├── Loading.tsx
│   │   ├── ErrorMessage.tsx
│   │   └── EmptyState.tsx
│   ├── types/
│   │   └── product.ts
│   ├── __tests__/
│   │   ├── ProductList.test.tsx
│   │   ├── ProductCard.test.tsx
│   │   ├── states.test.tsx
│   │   └── a11y.test.tsx
│   └── api/
│       └── products.ts   # (planned; see T050) API utilities for ProductList
└── test/
    └── setup.ts
```

**Structure Decision**: Web application split into `backend/` and `frontend/` with shared `contracts/`. Tests colocated as per constitution.

## Implementation Notes (by phase)

Phase 0 (Research): Completed — decisions for stack, observability, performance validation documented in `research.md`.

Phase 1 (Design & Contracts): Completed — `data-model.md`, `contracts/openapi.yaml`, and `quickstart.md` present. Clarification updated: ≤200 items, no pagination (legacy ≤100 superseded; consolidated in spec FR-012).

### Backend specifics (Extended):
- Express + TypeScript with ts-node-dev (`--respawn --transpile-only`).
- CORS: origin `${FRONTEND_URL:-http://localhost:5173}`; methods [GET, POST, PUT, DELETE] for category/order operations.
- Routes added: `/api/categories` (CRUD), `/api/orders` (POST + GET by id), extended `/api/products` with `search`, `categoryId` query params.
- Validation layers: product (stock >=0, imageUrl non-empty), category (name non-empty), order (items array not empty, each quantity >=1).
- Search: case-insensitive substring on name + description (phrase semantics).
- Error handling: 400 (validation), 404 (not found), 409 (category deletion conflict).
- Stock Decrement (UPDATED 2025-11-21): Order submission performs atomic stock decrement via Mongo `bulkWrite` with conditional filters per line item. Failure of any filter (insufficient stock or race) aborts the entire operation with 409; snapshot persisted only on success. Concurrency validated in test T121.
 - Admin Authentication (NEW 2025-11-21):
   - Endpoint `POST /api/auth/login` accepts JSON `{ username, password }` validated against env `ADMIN_USERNAME`, `ADMIN_PASSWORD`.
   - Issues JWT (HS256) with claims: `{ role: 'admin', iat, exp }`, with `exp` ≥ 1 hour; secret `JWT_SECRET`.
   - Middleware `authAdmin` validates Bearer token (presence, signature, expiration, role === 'admin'); on failure returns 401 JSON `{ "error": "admin_auth_required", "message": "Admin authentication required" }`.
   - All protected write endpoints (category/product POST/PUT/DELETE) require valid token; legacy `ENABLE_CATEGORY_ADMIN` flag still honored for transitional gating (403 when disabled, even if token valid).
   - Failed login attempts logged (optional); placeholder for future rate limiting.
   - No refresh tokens; client must re-authenticate after expiration.

### Frontend specifics (Extended & Updated 2025-11-21):
- Vite + React 18 + TS + Tailwind; use `import.meta.env.VITE_API_BASE_URL`.
- New pages/components:
  - **NavBar**:
    - Fixed at top of page, full-width.
    - Left: site logo SVG + brand name "Shoply" (accessible alt "Shoply logo").
    - Right: navigation controls (Products, Categories), cart count indicator.
    - Responsive: collapses menu on mobile; sticky behavior.
  - **SearchBar + CategoryFilter**:
    - Positioned at top of ProductList page, horizontally aligned.
    - Filters/search query backend dynamically.
  - **ProductList**:
    - Main content area, grid layout.
    - Breakpoints: 1 column mobile, 2 columns tablet, 3–4 columns desktop.
  - **ProductCard**:
    - Displays `imageUrl` with consistent width/height (e.g., 200x200px), `object-fit: cover`.
    - Fallback placeholder if image missing/broken (required).
    - Stock = 0 disables add-to-cart and shows explicit “Out of stock” (required).
  - **CartSidebar**:
    - Right-hand side on desktop.
    - Collapsible/hidden on mobile; toggled via icon in NavBar.
    - Displays current items, quantities, and totals in real time (required).
  - **OrderConfirmation**:
    - Modal after order submission.
    - Displays product images, names, quantities, total price (required).
    - Dual dismissal: close icon (×) + explicit "Close" button (both keyboard accessible).
  - **CategoryManagement**:
    - Admin-style CRUD interface for categories.
    - Navigation reachable via NavBar button (no page reload).
    - Write operations (create/update/delete) subject to environment flag `ENABLE_CATEGORY_ADMIN` (disabled in production by default; reads always allowed).
- Local cart hook/module manages state + persistence (add/remove/update, total computation, required).
- Order flow: capture snapshot, then decrement product stock atomically per ordered quantity, then clear cart. If any requested quantity exceeds current stock, reject order (409) with explanatory message; no partial fulfillment.
- Accessibility:
    - Alt text for images (required), keyboard focus preserved after cart updates (required), focus order includes logo then navigation then main content logically.
- Layout responsiveness:
  - Grid adapts per breakpoints, sidebar collapsible, top components sticky/responsive (required).
- Interactions/UX:
   - Admin Auth & Management (NEW 2025-11-21):
     - Login Page collects credentials, calls `/api/auth/login`, stores JWT in `localStorage` (or `sessionStorage`) under key `shoply_admin_token`.
     - Route Guard `PrivateRoute` restricts `CategoryManagement` and `ProductManagement`; checks token presence/exp and role claim.
     - ProductManagement Page provides CRUD with fields: name, description, price, imageUrl, stock, category (dropdown of all categories via GET /api/categories).
     - NavBar hides admin-only links unless token present and valid.
     - Expired token triggers automatic logout (clear storage) and redirect to login with user messaging.
     - Unauthorized responses surface standardized error messaging.
  - Add-to-cart triggers toast/notification (optional animation/enhancement).
  - Zero-stock products clearly labeled; add-to-cart button disabled (required).
  - Empty cart triggers `EmptyState` component (required).
  - Failed order submission shows `ErrorMessage` with guidance (required).

### Testing (Extended & Updated):
- Backend: Add tests for category CRUD, product search/filter queries (including zero-results), order creation (snapshot integrity, validation failures), imageUrl presence, stock decrement success, insufficient stock rejection, post-order stock consistency.
- Frontend: Add tests for cart persistence (localStorage), quantity updates, disabled add-to-cart for stock 0, search + filter interactions, image fallback rendering, responsive layout breakpoints, order confirmation view, dual modal dismissal (both controls), Shoply branding (logo alt text + name), navigation switching (Products ↔ Categories) with aria-current, category gating disabled state messaging.
 - Frontend (Auth Additions): Tests for login success (token stored + exp decoded), invalid credentials (error shown), route guarding (redirect/deny), nav visibility toggling, ProductManagement CRUD flows, category dropdown completeness, token expiry logout, unauthorized write attempt shows branded message.
 - Backend (Auth Additions): Tests for `/api/auth/login` success & 401 invalid creds, protected product/category write endpoints return 401 (missing/invalid) or 403 (legacy gating disabled), expired token scenario, standardized error response body, logging of failed attempts (mock logger), OpenAPI bearerAuth alignment.
- Performance probe remains opt-in; consider adding lightweight cart operation timing (skipped by default) using environment flag.

### Performance validation (Extended):
- Manual checks expanded: ensure cart add/remove and order submission typical latency ≤500ms (including stock decrement updates); navigation view switches achieve median ≤200ms p95 ≤400ms across ≥50 toggles; image loading does not push page render beyond 2s p95; fallback substitution <1s.

### Containerization (Unchanged Mechanics):
- Docker Compose unchanged but backend now exposes additional routes; verify health check unaffected.
- Add placeholder images to `frontend/public/images/` (e.g., product1.jpg .. product20.jpg) or single fallback for missing references.

## Phase Plan

| Phase | Focus | Outputs | Exit Criteria |
|-------|-------|---------|---------------|
| 0 | Research extensions | Updated `research.md` decisions | All new decisions documented (search, images, cart, categories) |
| 1 | Data & Contracts | Updated `data-model.md`, extended `openapi.yaml` | Entities & endpoints reflect extensions |
| 2 | Implementation scaffolding | Code mods: models, routes, frontend components structure, seed updates | All new artifacts compile & baseline tests pass |
| 3 | Feature completion | Cart, search/filter, category CRUD, images, order flow fully implemented | Functional tests green, coverage ≥80% |
| 4 | Performance & polish | Optional perf probes, accessibility audits, docs updates | Success criteria SC-001..SC-020 met |

## Task Breakdown (High-Level)

1. Extend Product model (categoryId, stock, imageUrl) & migration seed logic.
2. Create Category model + CRUD route + validation tests.
3. Augment products route with search & category filtering query params.
4. Implement Order model & POST/GET routes (snapshot logic, total calc, validations).
5. Update frontend types (Product includes new fields; Order, Category types).
6. Implement NavBar, SearchBar, CategoryFilter, CartSidebar, OrderConfirmation components.
7. Enhance ProductCard: image, stock gating, alt/fallback behavior.
8. Cart state module/hook with localStorage persistence & quantity updates.
9. Order submission flow (snapshot + stock decrement) & success confirmation modal (dual dismissal).
10. Accessibility review (focus order after cart updates, alt text correctness, zero-results messaging distinct from empty state, logo + nav accessible order, modal dual dismissal).
11. Tests: backend (search/filter, categories, orders), frontend (cart persistence, images, search + filter interactions, order confirmation dual dismissal, navigation switching, branding, category gating disabled state).
12. Performance sampling scripts update (optional) to include cart & order timings + navigation view switch.
13. Documentation updates (`quickstart.md`, README additions for new features & branding).
14. Frontend cleanup: verify single `import React` in `App.tsx` (remove duplicate) and update plan references (DONE).
15. Seed consistency: ensure first 5 seeded products include `imageUrl` & `stock` (value 5); update seed script & backend seed test assertions.
16. Modal enhancement: add explicit "Close" button to `OrderConfirmation` component; tests assert both dismissal paths restore focus.
17. Branding integration: add `public/images/logo.svg` asset; update NavBar to display Shoply name + logo alt text; tests confirm presence.
18. Navigation integration: add Products & Categories buttons with aria-current state; tests validate switching without reload and focus retention.
19. Category admin gating: implement environment flag `ENABLE_CATEGORY_ADMIN`; when false, write endpoints return 403/405; tests cover disabled mode (production simulation) and enabled mode (development).
20. Product response validation: extend backend tests to assert `imageUrl` non-empty and `stock >= 0` for all products.
21. Image fallback validation: tests for broken/missing image substituting `fallback.jpg` within 1s.
22. Navigation SLO refinement: capture timing metrics for view switches; enforce median ≤200ms, p95 ≤400ms across ≥50 toggles, aligning with SC‑023.
23. Update spec & plan references for new FR-044..FR-051 and SC-021..SC-025 alignment.
24. Backend: Implement `POST /api/auth/login` (env credentials, issue HS256 JWT ≥1h exp, return `{ token, expiresInSeconds }`).
25. Backend: Implement `authAdmin` middleware (parse Authorization bearer, verify signature/exp/role, attach `req.admin = true`, handle failures with branded 401/403).
26. Backend: Apply `authAdmin` to category POST/PUT/DELETE and product POST/PUT/DELETE (add product write endpoints if missing); honor legacy `ENABLE_CATEGORY_ADMIN` gating (403 when disabled even with token).
27. Backend: Extend OpenAPI (`contracts/openapi.yaml`) adding `bearerAuth` security scheme, `/api/auth/login`, and security requirements for protected endpoints.
28. Backend: Product CRUD validation tests (create/update/delete) including category association and stock non-negative enforcement under auth.
29. Backend: Add failed login attempt logging (count metric or log line) + test verifying log output format.
30. Frontend: Create Login Page + form submission to `/api/auth/login`; store JWT in `localStorage`; provide auth context/provider.
31. Frontend: Implement `PrivateRoute` guard for CategoryManagement & ProductManagement (redirect to login or show Access Denied if unauthenticated/invalid).
32. Frontend: Implement ProductManagement page (list products, create/edit/delete forms, category dropdown loads all categories via GET /api/categories).
33. Frontend: Hide admin-only nav links when no valid token; show after auth; update nav tests.
34. Frontend: Token expiry handling (check exp on navigation & on 401 responses; clear token + redirect to login); test simulated expired token.
35. Frontend: Add branded unauthorized error display for blocked CRUD attempts (consistent JSON parsing).
36. Frontend Tests: Route guarding, nav visibility, login success/failure, ProductManagement CRUD, category dropdown completeness, token expiry logout.
37. Backend Tests: Auth middleware valid/invalid/expired token paths; protected endpoints permission matrix; product/category CRUD under auth.
38. Docs: Update `quickstart.md` with auth env vars (`ADMIN_USERNAME`, `ADMIN_PASSWORD`, `JWT_SECRET`), login instructions, token storage note, transitional gating deprecation note.
39. Docs: Update `research.md` with JWT decision (HS256, ≥1h expiry, no refresh, rationale & alternatives) and future rate limiting note.
40. Docs: Update `data-model.md` with AdminUser pseudo entity and JWT claims breakdown.
41. Plan: Add success criterion reference SC-029 (unauthorized write blocking) to Completion Criteria if not already present.
42. Refactor: Centralize auth error responses and integrate with existing error handler.
43. Future-proofing: Note potential consolidation of additional roles via the same `/api/auth/login` endpoint; no changes now beyond admin.

## Risk & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Search performance with 200 products | Moderate | Keep substring search simple; add indexes if slowdown observed |
| Image load delays | Layout shift | Reserve space with fixed height classes; fallback image immediate |
| Cart persistence corruption | User confusion | Validate stored JSON shape; fall back to empty cart with notice |
| Category deletion conflicts | Data integrity loss | Explicit 409 response + UI messaging |
| Order total mismatch after price changes | User trust | Snapshot price & name at order time; never recompute |
| Stock race conditions on concurrent orders | Inventory integrity | Conditional bulkWrite; all line filters must pass or request aborts (409). Test T121 ensures only one succeeds. |

## Updated Complexity Tracking

Complexity increased moderately (additional entities, client persistence, filtering, stock mutation). Mitigated by: clear boundaries (no auth/uploads), deterministic seed, atomic stock decrement, local-only cart. No constitution violations.

## Completion Criteria (Extended)

Release of extended e‑commerce scope requires:
1. All tasks through Phase 11 including stock decrement implementation & tests (order creation rejects insufficient stock, decrements inventory accurately, no negative stock values).
2. Post-order product list reflects updated stock on refresh (manual verification + automated test).
3. Backend tests cover: snapshot integrity, insufficient stock (409), concurrent decrement path (simulated sequential requests), total accuracy after decrement.
4. Frontend tests cover: disabled add-to-cart when stock hits zero after order, order confirmation unaffected by subsequent stock changes.
5. Success criteria SC‑001..SC‑025 remain green; no new performance regressions introduced by stock writes or navigation/branding additions.
6. Documentation (quickstart, research) aligned with stock decrement behavior.
7. Auth artifacts complete: login endpoint, middleware, protected endpoints, ProductManagement page, route guard, and docs/tests for auth flows.
8. Unauthorized write blocking validated end-to-end: 100% unauthorized attempts produce correct 401/403 with branded body; 0 mutations.
9. Transitional gating documented (legacy flag) and interacts correctly with JWT (disabled flag forces 403 on writes even with valid token).
