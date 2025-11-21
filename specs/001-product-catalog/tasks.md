---

description: "Task list for Product Catalog MVP"

---

# Tasks: Product Catalog (Extended E‑commerce & Images)

**Input**: Design documents from `/specs/001-product-catalog/`
**Prerequisites**: plan.md, spec.md (US1–US8), research.md, data-model.md, openapi.yaml (v1.1.0)

**Tests**: Constitution requires ≥80% coverage; each user story has explicit test tasks before implementation tasks. New success criteria SC‑001..SC‑020 mapped.

**Organization**: Phases progress from existing MVP through extended backend models/routes, then new frontend components and behaviors (categories, search/filter, cart, orders, images). Parallelizable tasks marked [P].

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Create repository directories per plan in repo root
- [X] T002 Initialize backend/package.json with TypeScript, ts-node-dev, Jest, Supertest in `backend/`
- [X] T003 Initialize frontend/package.json with Vite + React + TypeScript, Vitest, RTL, Tailwind in `frontend/`
- [X] T004 [P] Add ESLint + Prettier configs (2-space) in `backend/.eslintrc.cjs` `frontend/.eslintrc.cjs` `.prettierrc`
- [X] T005 Add root `.env.example` and `.env` with vars in repo root
- [X] T006 Create Dockerfiles for backend and frontend in `backend/Dockerfile` `frontend/Dockerfile`
- [X] T007 Create Docker Compose stack with health checks in `docker-compose.yml` (curl-based frontend check)

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T008 Configure backend tsconfig.json with strict + esModuleInterop + rootDir in `backend/tsconfig.json`
- [X] T009 Setup Express app and server bootstrap in `backend/src/app.ts` and `backend/src/server.ts`
- [X] T010 Implement traceId middleware and logger format including duration (ms) in `backend/src/utils/traceId.ts`
- [X] T011 Configure Mongo connection util with error handling in `backend/src/config/db.ts`
- [X] T012 Define Product model with UUID id and timestamps in `backend/src/models/product.ts`
- [X] T013 Implement idempotent seed script for ≥5 products using Mongoose query methods (findOne/upsert) in `backend/src/seed/seedProducts.ts`
- [X] T014 Wire seed on startup (one-time log) in `backend/src/server.ts`
- [X] T015 Add backend Jest config and scripts in `backend/jest.config.ts`
- [X] T016 Add frontend Vite config with /api proxy in `frontend/vite.config.ts`
- [X] T017 Setup Tailwind config and styles in `frontend/tailwind.config.js` `frontend/postcss.config.js` `frontend/src/index.css`
- [X] T018 Create frontend entry and shell in `frontend/index.html` `frontend/src/main.tsx` `frontend/src/App.tsx`

## Phase 3: User Story 1 - View Product List (Priority: P1) 🎯 MVP

**Goal**: Render list of products (name, description, price) from API with formatted prices.
**Independent Test**: Seeded data present → visit ProductList page → items render with $ and two decimals.

### Tests for User Story 1 (REQUIRED)

- [X] T019 [P] [US1] Backend integration test for GET /api/products in `backend/tests/api/products.test.ts` (placeholder until route implemented)
- [X] T020 [P] [US1] Frontend render test for ProductList in `frontend/src/__tests__/ProductList.test.tsx` (todo placeholders)
- [X] T021 [P] [US1] Frontend unit test for price formatter in `frontend/src/__tests__/ProductCard.test.tsx` (todo placeholders)

### Implementation for User Story 1

- [X] T022 [US1] Implement products route with lean query in `backend/src/routes/products.ts`
- [X] T023 [US1] Register route and error handler in `backend/src/app.ts`
- [X] T024 [P] [US1] Create Product type in `frontend/src/types/product.ts`
- [X] T025 [P] [US1] Implement ProductCard component in `frontend/src/components/ProductCard.tsx`
- [X] T026 [US1] Implement ProductList page fetching from `${import.meta.env.VITE_API_BASE_URL}/api/products` in `frontend/src/pages/ProductList.tsx`

## Phase 4: User Story 2 - Loading, Empty, Error States (Priority: P2)

**Goal**: Clear feedback for loading, empty list, and error scenarios.
**Independent Test**: Simulate pending, empty DB, and 500; verify indicators/messages.

### Tests for User Story 2 (REQUIRED)

- [X] T027 [P] [US2] Frontend state tests (loading/empty/error) in `frontend/src/__tests__/states.test.tsx`
- [X] T028 [P] [US2] Backend error path test increments error counter in `backend/tests/api/products.test.ts`

### Implementation for User Story 2

- [X] T029 [P] [US2] Implement Loading component in `frontend/src/components/Loading.tsx`
- [X] T030 [P] [US2] Implement EmptyState component in `frontend/src/components/EmptyState.tsx`
- [X] T031 [P] [US2] Implement ErrorMessage component in `frontend/src/components/ErrorMessage.tsx`
- [X] T032 [US2] Add loading/empty/error logic to ProductList in `frontend/src/pages/ProductList.tsx`

## Phase 5: User Story 3 - Accessibility and Responsiveness (Priority: P3)

**Goal**: Keyboard navigation, ARIA, color contrast; responsive layout across breakpoints.
**Independent Test**: Keyboard-only navigation works; no critical a11y violations; layout adapts.

### Tests for User Story 3 (REQUIRED)

- [X] T033 [P] [US3] Accessibility test utilities and checks in `frontend/src/__tests__/a11y.test.tsx`

### Implementation for User Story 3

- [X] T034 [P] [US3] Apply semantic markup and ARIA labels to components in `frontend/src/components/*.tsx`
- [X] T035 [US3] Ensure Tailwind responsive classes on ProductList grid in `frontend/src/pages/ProductList.tsx`

## Phase N: Polish & Cross-Cutting

 - [X] T036 [P] Add /health endpoint in backend `backend/src/app.ts`
 - [X] T037 [P] Add /health route or static health handler in frontend `frontend/src/App.tsx`
- [X] T038 [P] Implement Docker healthchecks for services in `docker-compose.yml`
 - [X] T039 [P] Add npm scripts: dev, test, prebuild coverage in `backend/package.json` `frontend/package.json`
 - [X] T040 [P] Add ESLint CI npm script and lint fixes in `backend/` `frontend/`
 - [X] T041 Document performance validation steps (Playwright) in `specs/001-product-catalog/research.md`

### Coverage, Model, and Seed Verification (Critical)

 - [X] T042 [P] Configure Jest coverage thresholds (branches/functions/lines/statements ≥80%) in `backend/jest.config.ts`
 - [X] T043 [P] Configure Vitest coverage thresholds (branches/functions/lines/statements ≥80%) in `frontend/vitest.config.ts`
 - [X] T044 [P] [US1] Backend model validation tests for Product schema (UUID immutability, required fields) in `backend/tests/models/productModel.test.ts`
 - [X] T045 [P] Seed verification tests (idempotency, ≥5 products on first run, seed verification log present) in `backend/tests/seed/seedProducts.test.ts`
 - [X] T046 [P] Remove duplicate Mongoose index warning by eliminating redundant index declaration in `backend/src/models/product.ts` and keep a single unique constraint on id

---

## Dependencies & Execution Order

### Phase Dependencies
- Setup → Foundational → US1 (MVP) → US2 → US3 → Polish

### User Story Dependencies
- US1 has no dependency besides Foundational
- US2 depends on US1 UI primitives existing (can be parallel for components)
- US3 can proceed in parallel with US2 after US1 skeleton exists

### Within Each User Story
- Tests first, ensure they fail → implement → pass
- Models before routes (backend); Components before pages (frontend)

### Parallel Opportunities
- [P] tasks across frontend/backend different files
- Component implementations in parallel
- Tests in parallel

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Setup + Foundational
2. Implement US1 tests → implementation
3. Verify MVP renders seeded products

### Incremental Delivery
1. Add US2 states → verify
2. Add US3 accessibility/responsiveness → verify
3. Polish and health checks

---

## Notes
- All tests reside in `frontend/src/__tests__/` and `backend/tests/` per constitution
- Observability: log format `[timestamp] [traceId] [method] [path] [status] [duration_ms]` and error counter per spec
- VITE_API_BASE_URL must be used directly via `import.meta.env`

## Phase N: Post-Implementation Fixes
- [X] T047 [P] Install and configure `@vitejs/plugin-react` in frontend
       - Run `npm install --save-dev @vitejs/plugin-react` in `frontend/`
       - Ensure `vite.config.ts` imports and uses `react()` in `plugins: [react()]`
       - This enables JSX support and React Fast Refresh in Vite

- [X] T048 [P] Fix TypeScript error for `process.env` in frontend
       - Install Node.js types: `npm install --save-dev @types/node`
       - Add `"node"` to `types` array in `frontend/tsconfig.json`
       - This enables TypeScript to recognize `process.env` in `vite.config.ts`


---

## Phase N+1: Clarifications Integration & Small Improvements

Context: Clarification decided “Up to 100 items, no pagination.” Plan also calls for a small API utility layer and explicit CORS env mapping.

- [X] T049 [P] Enforce ≤100 items in API response
       - Backend route `GET /api/products` must apply `.limit(100)` to the query
       - Add/extend integration test in `backend/tests/api/products.test.ts` to insert >100 products and assert response length ≤100
       - Acceptance: Even with >100 rows in DB, API returns at most 100; no pagination fields present

- [X] T050 [P] Frontend API utility for products
       - Create `frontend/src/api/products.ts` exporting `fetchProducts(): Promise<Product[]>`
       - Add unit test(s) for the utility (mock fetch) in `frontend/src/__tests__/ProductList.test.tsx` or a new `api.test.ts`
       - Refactor `ProductList.tsx` to use the utility (no behavior change)
       - Acceptance: All existing frontend tests still pass; no pagination UI introduced

- [X] T051 [P] CORS origin via env mapping
       - Configure backend CORS to use `FRONTEND_URL` (default `http://localhost:5173`)
       - Document env var in `specs/001-product-catalog/quickstart.md` and `.env.example`
       - Add a lightweight test or config assertion to ensure CORS middleware is registered
       - Acceptance: Requests from configured origin succeed; other origins blocked by default

- [X] T052 [P] Contract and docs reflect no pagination
       - Update `specs/001-product-catalog/contracts/openapi.yaml` description for `GET /api/products` to note “Returns up to 100 products. No pagination.”
       - Add a short note to `research.md` about tradeoff and potential future pagination
       - Acceptance: OpenAPI and docs synced with clarification

- [X] T053 [P] Compose env pass‑through for URLs
       - Ensure `docker-compose.yml` passes `VITE_API_BASE_URL` to frontend and `FRONTEND_URL` to backend
       - Verify `public/health` remains reachable and service healthchecks still pass
       - Acceptance: `docker compose up` yields healthy services; frontend fetches from backend using env URL

- [X] T054 [P] Long text rendering test (names/descriptions)
       - Add frontend test to render products with very long name/description and assert content is visible and wraps (no crash, no horizontal overflow)
       - Prefer Tailwind utilities already in use; no new plugins required in MVP
       - Acceptance: Test passes; UI remains readable without truncation

- [X] T055 [P] Performance measurement guidance and probes
       - Define “typical load” explicitly in `specs/001-product-catalog/research.md` (local dev, Docker Compose up, seeded DB, no throttling)
       - Add a minimal timing probe/log for API latency in backend integration test or a documented manual step with thresholds for SC‑001/SC‑002
       - Acceptance: Documentation includes exact steps and thresholds; optional probe produces timings within targets locally

- [X] T056 [P] Lint cleanup & config refinement
       - Adjust ESLint configs to allow flexible typing in test files without failing CI (`no-explicit-any`, `ban-types` disabled only in tests)
       - Remove unused vitest globals imports and variables in `frontend/src/__tests__/ProductList.test.tsx` and `frontend/vitest.config.ts`
       - Replace obvious `any` uses in backend source with safer `unknown` or specific types (error handlers, catches)
       - Acceptance: `npm run lint:ci` passes in both `backend/` and `frontend/` with 0 errors


---

## Phase N+2: Frontend Docker & Env Improvements

Context: Adjust Docker Compose and frontend code to correctly pass VITE_API_BASE_URL, simplify environment handling, and add missing dev dependency for tests.

- [X] T057 [P] Frontend Dockerfile ARG & ENV
  - Add `ARG VITE_API_BASE_URL` and `ENV VITE_API_BASE_URL=$VITE_API_BASE_URL` to `frontend/Dockerfile`
  - Acceptance: `docker build` passes; `VITE_API_BASE_URL` is available at build time and runtime inside the container

- [X] T058 [P] Pass API base URL via Docker build args
  - Update `docker-compose.yml` frontend service to use `build.args.VITE_API_BASE_URL` instead of `environment`
  - Remove `env_file` and `environment` sections for frontend
  - Acceptance: Frontend fetch requests use the correct base URL inside Docker container; no 404 errors

- [X] T059 [P] Standardize frontend port env var
  - Change `docker-compose.yml` frontend service to use `${PORT_FRONTEND:-5173}:80` for consistency with `.env.example` variable `PORT_FRONTEND`
  - Acceptance: `docker compose up` maps frontend container to host port defined in `.env.example` (`PORT_FRONTEND`)

- [X] T060 [P] Fix Vite env usage in frontend code
  - Update `frontend/src/api/products.ts` to use `const envBase = (import.meta.env.VITE_API_BASE_URL as string) || '';`
  - Acceptance: Frontend fetch requests use the correct API URL both in local development and inside Docker containers

- [X] T061 [P] Add missing dev dependency for testing
       - Add `"@testing-library/dom": "^10.4.1"` to `frontend/package.json` devDependencies
       - Acceptance: Unit tests for components relying on `@testing-library` run successfully without missing module errors

---

## Phase 6: Data & Model Extensions (Products + Categories + Images + Stock)

Goal: Extend Product schema (categoryId, stock, imageUrl); create Category & Order schemas; update seed logic for ≥20 products & ≥5 categories; deterministic image filenames.

- [ ] T062 [P] [US4][US8] Extend Product Mongoose schema: add `categoryId`, `stock`, `imageUrl` with validation (non-negative stock, non-empty imageUrl)
- [ ] T063 [P] [US4] Create Category Mongoose schema (id UUID, name unique, timestamps)
- [ ] T064 [P] [US7] Create Order Mongoose schema (snapshot items, total, status="submitted")
- [ ] T065 [US4][US8] Update seed script: ≥20 products, deterministic `product<N>.jpg` imageUrl, realistic stock distribution (include some zero stock)
- [ ] T066 [P] [US4] New seed for categories (≥5) with stable UUIDs / names
- [ ] T067 [P] [US7] Seed sanity: ensure no orders created; add future placeholder comment
- [ ] T068 [P] Backend tests: Product schema new fields validation (stock >=0, imageUrl non-empty) in `backend/tests/models/productModel.test.ts`
- [ ] T069 Backend tests: Category schema validation + uniqueness in `backend/tests/models/categoryModel.test.ts`
- [ ] T070 Backend tests: Order schema snapshot & total calculation unit test in `backend/tests/models/orderModel.test.ts`
- [ ] T071 [P] Update openapi.yaml Product schema (categoryId, stock, imageUrl) confirmation (already spec'd) + ensure examples reflect new fields

## Phase 7: User Story 4 - Manage Categories (Priority: P4)

Goal: Category CRUD with blocked deletion when products assigned.

- [ ] T072 [P] [US4] Implement `/api/categories` router (GET list, GET by id, POST, PUT, DELETE)
- [ ] T073 [US4] Add delete guard: 409 if products reference category
- [ ] T074 [P] [US4] Integration tests for category CRUD + blocked deletion (SC-007, SC-013, FR-017) in `backend/tests/api/categories.test.ts`
- [ ] T075 [P] [US4] Frontend Category types in `frontend/src/types/category.ts`
- [ ] T076 [P] [US4] Category management API utilities `frontend/src/api/categories.ts`
- [ ] T077 [US4] CategoryManagement page basic layout + CRUD forms
- [ ] T078 [P] [US4] Frontend tests: create/update/delete flows + blocked deletion messaging in `frontend/src/__tests__/category.test.tsx`
- [ ] T079 [US4] Docs: quickstart & spec success criteria references for category operations performance (SC-007, SC-013)

## Phase 8: User Story 5 - Search & Filter Products (Priority: P4)

Goal: Case-insensitive substring search + category filter (combinable) with zero-results state.

- [ ] T080 [US5] Extend products route: query params `search`, `categoryId` (phrase match on name+description)
- [ ] T081 [P] [US5] Backend tests: search only, category only, combined, zero-results in `backend/tests/api/productsSearch.test.ts`
- [ ] T082 [P] [US5] Frontend SearchBar component
- [ ] T083 [P] [US5] Frontend CategoryFilter component (dropdown)
- [ ] T084 [US5] Wire search/filter state to API; distinct zero-results message
- [ ] T085 [P] [US5] Frontend tests: search, filter, combined, zero-results message distinct from empty catalog in `frontend/src/__tests__/searchFilter.test.tsx`
- [ ] T086 [US5] Accessibility validation: focus order after search/filter interactions (extend a11y test)

## Phase 9: User Story 8 - Product Images (Priority: P4)

Goal: Display product images with fallback & alt text rules; no layout shift.

- [ ] T087 [US8] Add placeholder image assets `frontend/public/images/product1.jpg ... product20.jpg` (FR-034)
- [ ] T088 [P] [US8] Add single fallback image `frontend/public/images/fallback.jpg` (FR-039)
- [ ] T089 [US8] Enhance ProductCard: fixed 200x200 square container, `object-cover`, fallback on error/missing, alt text pattern `<name> – image unavailable` (FR-036, FR-037, FR-039, FR-042)
- [ ] T090 [P] [US8] Frontend tests: image present, fallback path, broken image simulation (trigger onError), square dimension assertion, alt pattern validation (FR-036, FR-037, FR-039, FR-042, SC-016, SC-017, SC-018, SC-019)
- [ ] T091 [P] [US8] Backend test: all product API responses include non-empty `imageUrl` (FR-033, FR-034, SC-015)
- [ ] T092 [US8] Performance doc update referencing SC-015..SC-018 image criteria (FR-041)
- [ ] T093 [US8] Accessibility test alt text correctness & fallback pattern (FR-036, SC-019)

## Phase 10: User Story 6 - Shopping Cart (Priority: P5)

Goal: Add/update/remove items; persist across refresh; stock gating.

- [ ] T094 [US6] Implement cart hook/module `frontend/src/hooks/useCart.ts` (state, add, update qty, remove, clear)
- [ ] T095 [P] [US6] LocalStorage persistence & hydration logic with schema version
- [ ] T096 [US6] Stock gating: disable add-to-cart for stock=0 product & message
- [ ] T097 [P] [US6] CartSidebar component (responsive, collapsible)
- [ ] T098 [P] [US6] Cart icon/count in NavBar component
- [ ] T099 [US6] Frontend tests (SC-008): add/update/remove/clear, persistence after refresh, stock gating (out-of-stock & exceeding-stock rejection) in `frontend/src/__tests__/cart.test.tsx`

## Phase 11: User Story 7 - Submit Order (Priority: P6)

Goal: Order submission snapshot + atomic stock decrement (FR-025, FR-028, FR-043) and tests.

- [ ] T103 [US7] Implement `/api/orders` POST (FR-025, FR-043): validate non-empty cart; snapshot items BEFORE stock decrement; verify sufficient stock; atomic decrement (transactional conditional updates); reject insufficient stock (409); implement GET by id.
- [ ] T104 [P] [US7] Backend tests (SC-010, SC-014, FR-025, FR-028, FR-043): snapshot immutability, empty cart rejection, total rounding accuracy (single rounding step), price immutability post-change, stock decrement verification, insufficient stock (409), prevention of negative stock in `backend/tests/api/orders.test.ts`.
- [ ] T105 [US7] Frontend OrderConfirmation component/page/modal: render snapshot (FR-025, SC-014) unaffected by later catalog changes.
- [ ] T106 [P] [US7] Frontend tests (SC-010, SC-014, FR-025, FR-043): submit flow, empty cart prevention, snapshot persistence after product change, post-order product list refresh showing decremented stock (disable add-to-cart if now zero) in `frontend/src/__tests__/order.test.tsx`.
- [ ] T107 [US7] Clear cart post-submission; verify persistence resets (SC-009).
- [ ] T108 [P] [US7] Add Order types `frontend/src/types/order.ts`.
- [ ] T109 [US7] Docs: quickstart & spec order endpoint examples & performance expectations (SC-010, SC-014) including atomic decrement behavior & concurrency mitigation.
- [ ] T121 [P] [US7] Concurrency test (FR-043): simulate near-concurrent orders (rapid sequential requests) exhausting stock; assert second yields 409; document chosen atomic decrement strategy & future parallel test approach.
- [ ] T122 [P] [US7] Utility: shared rounding + stock check helper (`backend/src/utils/orderHelpers.ts`) with unit tests (FR-028, FR-043) including precision edge cases.


## Added Test & Instrumentation Tasks (Cross-Cutting)

- [ ] T110 [P] Perf sampling script/update (SC-001, SC-002, SC-010, SC-011): measure GET /api/products (list & search/filter) & order POST durations; log p95 locally; document typical environment factors (latency <10ms loopback).
- [ ] T111 [P] Image load timing & fallback substitution test (SC-015, SC-016, SC-017, SC-018, SC-019): instrument and assert fallback substitution <1000ms, reserved space prevents layout shift (CLS <0.1), alt pattern correctness.
- [ ] T123 [P] Logging & metrics verification test (FR-011, SC-006): assert log format `[timestamp] [traceId] [method] [path] [status] [duration_ms]`, error counter increments on simulated failures in `backend/tests/api/loggingMetrics.test.ts`.

## Phase 12: Cross-Cutting Validation & Performance / Success Criteria

Goal: Ensure SC-001..SC-020 satisfied; finalize docs; perf & a11y audits.

- [ ] T110 [P] Perf sampling script/update: measure GET /api/products (with search/filter) & order POST durations (log p95 locally)
- [ ] T111 [P] Image load timing & fallback substitution test (<1s) instrumentation (optional util)
- [ ] T112 [P] Accessibility sweep: images, cart controls, search/filter inputs, order confirmation (no new violations)
- [ ] T113 [P] Update README.md with extended features summary & run instructions additions
- [ ] T114 [P] Update `quickstart.md`: environment variables for categories, orders, cart notes, image assets mention
- [ ] T115 [P] Update `research.md` with rationale for snapshot order model & fallback strategy final validation
- [ ] T116 [P] Verify openapi.yaml examples: add request/response examples for category CRUD, order POST/GET
- [ ] T117 [P] Coverage audit: ensure new tests raise coverage ≥80% after extensions (backend & frontend)
- [ ] T118 Consolidated success criteria checklist file update `checklists/requirements.md` with SC-015..SC-020 tracking
- [ ] T119 [P] Lint/Type cleanup: new files conform; run `npm run lint` in both packages and fix
- [ ] T120 Final seed audit: confirm counts (≥20 products, ≥5 categories, deterministic image filenames, mixed stock) in test

## Updated Dependencies

Order of execution after existing T001–T061:
1. Phase 6 (schemas & seed) → unlock phases 7–9.
2. Phases 7, 8, 9 can run largely in parallel (categories, search/filter, images) after Product schema extended.
3. Phase 10 (cart) depends on Product schema & images (for ProductCard enhancements) but not on orders.
4. Phase 11 (orders) depends on cart implementation & Order schema.
5. Phase 12 audits depend on completion of prior feature phases.

Parallelization Guidelines:
- Prefer running distinct backend & frontend test implementations concurrently ([P]).
- Avoid parallel edits to same file (coordinate ProductCard changes vs image fallback).
- Use isolated test files per feature to minimize merge friction.

## Risk Addendum (Extensions)

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Increased seed volume slows startup | Moderate | Lazy seed only when count below threshold; lean inserts |
| Search regex complexity increases CPU | Low | Use simple `RegExp` with escaped phrase; index later if needed |
| Cart persistence schema changes | Data loss | Version key in stored JSON; migrate or reset gracefully |
| Fallback image 404 | Visual regression | Include fallback asset in repo & Docker image; test presence |
| Order total precision drift | Inaccurate totals | Centralize rounding helper; unit test edge cases |

## Completion Criteria Extension

Completion of extended scope requires all tasks T062–T120 marked done, coverage ≥80%, success criteria SC‑001..SC‑020 verified, and updated documentation & contracts committed.

---

## Future (Deferred / Not In Scope Tasks) – For Tracking Only (Do NOT implement now)
- D001 Image optimization (responsive srcset / WebP)
- D002 Pagination & server-side filtering beyond 200 products
- D003 Auth & role-based category management
- D005 Discount codes & tax calculations
- D006 Advanced search (tokenization, fuzzy)
- D007 CDN integration for static assets
