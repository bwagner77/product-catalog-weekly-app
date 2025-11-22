---

description: "Task list for Product Catalog MVP"

---

# Tasks: Shoply Product Catalog (Extended E‑commerce, Images, Navigation, Gating)

**Input**: Design documents from `/specs/001-product-catalog/`
**Prerequisites**: plan.md, spec.md (US1–US8), research.md, data-model.md, openapi.yaml (v1.1.0), constitution v1.1.0 (branding, dual modal dismissal, category gating)

**Tests**: Constitution requires ≥80% coverage; each user story has explicit test tasks before implementation tasks. Success criteria SC‑001..SC‑025 mapped (added SC‑021..SC‑025 for images, branding, navigation, gating, dual dismissal).

**Organization**: Phases progress from existing MVP through extended backend models/routes, then new frontend components and behaviors (categories, search/filter, cart, orders, images). Parallelizable tasks marked [P].

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Create repository directories per plan in repo root
- [X] T002 Initialize backend/package.json with TypeScript, ts-node-dev, Jest, Supertest in `backend/`
- [X] T003 Initialize frontend/package.json with Vite + React + TypeScript, Vitest, RTL, Tailwind in `frontend/`
- [X] T004 [P] Add ESLint + Prettier configs (2-space) in `backend/.eslintrc.cjs` `frontend/.eslintrc.cjs` `.prettierrc`
- [X] T005 Add root `.env.example` and `.env` with vars in repo root
 [X] T124 [P] (DEPRECATED – DO NOT IMPLEMENT) Historical only; legacy environment flag removed. Superseded by T166/T167 role-only enforcement tasks.
 [X] T130 [P] Update `research.md` with navigation SLO thresholds, dual dismissal accessibility rationale (FR-046, SC-024), CLS measurement plan (SC-018); remove legacy gating rationale.
 [X] T133 [P] [US4] (Replaced) Ensure category POST/PUT/DELETE protected via `authAdmin` only; legacy environment gating removed.
 [X] T134 [P] [US4] Frontend test: anonymous/unauthenticated category write attempts blocked with branded 403 message (FR-057, SC-025) in `frontend/src/__tests__/categoryAuth.test.tsx`
 [X] T132 [P] Update category endpoints in `specs/001-product-catalog/contracts/openapi.yaml` to require bearer auth for POST/PUT/DELETE and remove legacy flag gating notes; include 401/403 examples.
 [X] T142 [P] Backend auth tests: Ensure category POST/PUT/DELETE reject with 401 for missing/invalid/expired token and 403 for valid non-admin role; no writes occur when unauthorized. Create `backend/tests/api/categoriesAuth.test.ts` (FR-057, SC-025, SC-029, SC-030)
 [X] T154 [P] Create `frontend/src/pages/Login.tsx` (POST `/api/auth/login`; store JWT in `localStorage` key `shoply_admin_token`)
 [X] T155 [P] Add `frontend/src/context/AuthContext.tsx` (parse token, expose `{ role, authenticated, exp }`, check expiry)
 [X] T156 [P] Implement `frontend/src/components/PrivateRoute.tsx` guarding CategoryManagement & ProductManagement (redirect /login or render AccessDenied)
 [X] T157 [P] Hide admin-only nav links when unauthenticated in `frontend/src/App.tsx`
 [X] T158 [P] Handle 401/403: API interceptor in `frontend/src/api/http.ts` clears token + redirects to /login (expired or invalid)
- [X] T015 Add backend Jest config and scripts in `backend/jest.config.ts`
- [X] T016 Add frontend Vite config with /api proxy in `frontend/vite.config.ts`
- [X] T017 Setup Tailwind config and styles in `frontend/tailwind.config.js` `frontend/postcss.config.js` `frontend/src/index.css`
- [X] T018 Create frontend entry and shell in `frontend/index.html` `frontend/src/main.tsx` `frontend/src/App.tsx`

## Phase 3: User Story 1 - View Product List (Priority: P1) 🎯 MVP

**Goal**: Render list of products (name, description, price) from API with formatted prices.
**Independent Test**: Seeded data present → visit ProductList page → items render with $ and two decimals.

### Tests for User Story 1 (REQUIRED)

- [X] T019 [P] [US1] Backend integration test for GET /api/products in `backend/tests/api/products.test.ts` (placeholder until route implemented)
 - [X] T126 [P] [US1] Extend GET /api/products test to assert `imageUrl` & `stock >= 0` for sampled ≥5 products and aggregate all non-empty (FR-047, SC-021) in `backend/tests/api/products.test.ts`
- [X] T020 [P] [US1] Frontend render test for ProductList in `frontend/src/__tests__/ProductList.test.tsx` (todo placeholders)
- [X] T021 [P] [US1] Frontend unit test for price formatter in `frontend/src/__tests__/ProductCard.test.tsx` (todo placeholders)

### Implementation for User Story 1

- [X] T022 [US1] Implement products route with lean query in `backend/src/routes/products.ts`
- [X] T023 [US1] Register route and error handler in `backend/src/app.ts`
- [X] T024 [P] [US1] Create Product type in `frontend/src/types/product.ts`
- [X] T025 [P] [US1] Implement ProductCard component in `frontend/src/components/ProductCard.tsx`
- [X] T026 [US1] Implement ProductList page fetching from `${import.meta.env.VITE_API_BASE_URL}/api/products` in `frontend/src/pages/ProductList.tsx`
- [X] T127 [US1] Add branding (Shoply logo + name) and navigation controls in amended order (Products, Category Management, Product Management (admin only), Logout) to `frontend/src/App.tsx`; rename legacy label "Categories" → "Category Management" and ensure single `aria-current` and stable focus order (FR-044, FR-045, SC-022, SC-023, SC-035, SC-036)

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
 - [X] T128 [P] [US3] Add focus order test including logo → navigation → product grid → modal dismissal controls (SC-024) in `frontend/src/__tests__/a11y.test.tsx`

### Implementation for User Story 3

- [X] T034 [P] [US3] Apply semantic markup and ARIA labels to components in `frontend/src/components/*.tsx`
- [X] T035 [US3] Ensure Tailwind responsive classes on ProductList grid in `frontend/src/pages/ProductList.tsx`

## Phase N: Polish & Cross-Cutting

 - [X] T036 [P] Add /health endpoint in backend `backend/src/app.ts`
 - [X] T129 [P] Navigation latency perf probe: measure ≥50 Products↔Categories switches; assert median ≤200ms, p95 ≤400ms (SC-023) in `frontend/src/__tests__/navPerf.test.tsx`
 - [X] T037 [P] Add /health route or static health handler in frontend `frontend/src/App.tsx`
- [X] T038 [P] Implement Docker healthchecks for services in `docker-compose.yml`
 - [X] T039 [P] Add npm scripts: dev, test, prebuild coverage in `backend/package.json` `frontend/package.json`
 - [X] T040 [P] Add ESLint CI npm script and lint fixes in `backend/` `frontend/`
 - [X] T041 Document performance validation steps (Playwright) in `specs/001-product-catalog/research.md`
       <!-- Duplicate T130 removed; original recorded under Phase 1 Setup -->

### Coverage, Model, and Seed Verification (Critical)

 - [X] T042 [P] Configure Jest coverage thresholds (branches/functions/lines/statements ≥80%) in `backend/jest.config.ts`
 - [X] T043 [P] Configure Vitest coverage thresholds (branches/functions/lines/statements ≥80%) in `frontend/vitest.config.ts`
 - [X] T044 [P] [US1] Backend model validation tests for Product schema (UUID immutability, required fields) in `backend/tests/models/productModel.test.ts`
 - [X] T131 [P] [US1] Extend Product model tests for `imageUrl` non-empty & `stock >= 0` (FR-033, FR-014, SC-021) and alt fallback en dash pattern string constant reference in `backend/tests/models/productModel.test.ts`
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

 - [X] T049 [P] (Updated) Enforce ≤200 items in API response
        - Backend route `GET /api/products` applies `.limit(200)` per FR-012 (product cap alignment)
        - Extend integration test in `backend/tests/api/products.test.ts` to insert >200 products and assert response length ≤200
        - Acceptance: Even with >200 rows in DB, API returns at most 200; prior 100 cap deprecated; no pagination fields present

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

 - [X] T062 [P] [US4][US8] Extend Product Mongoose schema: add `categoryId`, `stock`, `imageUrl` with validation (non-negative stock, non-empty imageUrl)
 - [X] T063 [P] [US4] Create Category Mongoose schema (id UUID, name unique, timestamps)
 - [X] T064 [P] [US7] Create Order Mongoose schema (snapshot items, total, status="submitted")
 - [X] T065 [US4][US8] Update seed script: ≥20 products, deterministic `product<N>.jpg` imageUrl, realistic stock distribution (include some zero stock)
 - [X] T066 [P] [US4] New seed for categories (≥5) with stable UUIDs / names
 - [X] T067 [P] [US7] Seed sanity: ensure no orders created; add future placeholder comment
 - [X] T068 [P] Backend tests: Product schema new fields validation (stock >=0, imageUrl non-empty) in `backend/tests/models/productModel.test.ts`
 - [X] T069 Backend tests: Category schema validation + uniqueness in `backend/tests/models/categoryModel.test.ts`
 - [X] T070 Backend tests: Order schema snapshot & total calculation unit test in `backend/tests/models/orderModel.test.ts`
 - [X] T071 [P] Update openapi.yaml Product schema (categoryId, stock, imageUrl) confirmation (already spec'd) + ensure examples reflect new fields
 - [X] T132 [P] Update category endpoints in `specs/001-product-catalog/contracts/openapi.yaml` to require bearer auth for POST/PUT/DELETE and remove legacy flag gating notes; include 401/403 examples.

## Phase 7: User Story 4 - Manage Categories (Priority: P4)

Goal: Category CRUD with blocked deletion when products assigned.

- [X] T072 [P] [US4] Implement `/api/categories` router (GET list, GET by id, POST, PUT, DELETE)
 - [X] T133 [P] [US4] Ensure category POST/PUT/DELETE protected via `authAdmin` only; legacy environment gating removed.
- [X] T073 [US4] Add delete guard: 409 if products reference category
- [X] T074 [P] [US4] Integration tests for category CRUD + blocked deletion (SC-007, SC-013, FR-017) in `backend/tests/api/categories.test.ts`
- [X] T075 [P] [US4] Frontend Category types in `frontend/src/types/category.ts`
- [X] T076 [P] [US4] Category management API utilities `frontend/src/api/categories.ts`
 - [X] T077 [US4] CategoryManagement page basic layout + CRUD forms
 - [X] T078 [P] [US4] Frontend tests: create/update/delete flows + blocked deletion messaging in `frontend/src/__tests__/category.test.tsx`
 - [X] T134 [P] [US4] Frontend test: anonymous/unauthenticated category write attempts blocked with branded 403 message (FR-057, SC-025) in `frontend/src/__tests__/categoryAuth.test.tsx`
 - [X] T079 [US4] Docs: quickstart & spec success criteria references for category operations performance (SC-007, SC-013)

## Phase 8: User Story 5 - Search & Filter Products (Priority: P4)

Goal: Case-insensitive substring search + category filter (combinable) with zero-results state.

- [X] T080 [US5] Extend products route: query params `search`, `categoryId` (phrase match on name+description)
- [X] T081 [P] [US5] Backend tests: search only, category only, combined, zero-results in `backend/tests/api/productsSearch.test.ts`
- [X] T082 [P] [US5] Frontend SearchBar component
- [X] T083 [P] [US5] Frontend CategoryFilter component (dropdown)
- [X] T084 [US5] Wire search/filter state to API; distinct zero-results message
- [X] T085 [P] [US5] Frontend tests: search, filter, combined, zero-results message distinct from empty catalog in `frontend/src/__tests__/searchFilter.test.tsx`
 - [X] T086 [US5] Accessibility validation: focus order after search/filter interactions (extend a11y test)

## Phase 9: User Story 8 - Product Images (Priority: P4)

Goal: Display product images with fallback & alt text rules; no layout shift.

 - [X] T087 [US8] Add placeholder image assets `frontend/public/images/product1.jpg ... product20.jpg` (FR-034)
 - [X] T088 [P] [US8] Add single fallback image `frontend/public/images/fallback.jpg` (FR-039)
 - [X] T089 [US8] Enhance ProductCard: fixed 200x200 square container, `object-cover`, fallback on error/missing, alt text pattern `<name> – image unavailable` (FR-036, FR-037, FR-039, FR-042)
 - [X] T135 [P] [US8] Add explicit square dimension & no distortion test in `frontend/src/__tests__/imageDimensions.test.tsx` (FR-037, SC-018) including CLS observation (reserve box prevents shift)
 - [X] T090 [P] [US8] Frontend tests: image present, fallback path, broken image simulation (trigger onError), square dimension assertion, alt pattern validation (FR-036, FR-037, FR-039, FR-042, SC-016, SC-017, SC-018, SC-019)
 - [X] T091 [P] [US8] Backend test: all product API responses include non-empty `imageUrl` (FR-033, FR-034, SC-015)
 - [X] T092 [US8] Performance doc update referencing SC-015..SC-018 image criteria (FR-041)
 - [X] T093 [US8] Accessibility test alt text correctness & fallback pattern (FR-036, SC-019)

## Phase 10: User Story 6 - Shopping Cart (Priority: P5)

Goal: Add/update/remove items; persist across refresh; stock gating.

 - [X] T094 [US6] Implement cart hook/module `frontend/src/hooks/useCart.ts` (state, add, update qty, remove, clear)
 - [X] T095 [P] [US6] LocalStorage persistence & hydration logic with schema version
 - [X] T096 [US6] Stock gating: disable add-to-cart for stock=0 product & message; on order completion if stock decrements to 0 update ProductCard immediately (≤1s) to show "Out of Stock" and apply `disabled` + `aria-disabled="true"` (FR-015, FR-016, SC-037, SC-038)
 - [X] T097 [P] [US6] CartSidebar component (responsive, collapsible)
 - [X] T098 [P] [US6] Cart icon/count in NavBar component
 - [X] T099 [US6] Frontend tests (SC-008): add/update/remove/clear, persistence after refresh, stock gating (out-of-stock & exceeding-stock rejection) in `frontend/src/__tests__/cart.test.tsx`

## Phase 11: User Story 7 - Submit Order (Priority: P6)

Goal: Order submission snapshot + atomic stock decrement (FR-025, FR-028, FR-043) and tests.

- [X] T103 [US7] Implement `/api/orders` POST (FR-025, FR-043): validate non-empty cart; snapshot items BEFORE stock decrement; verify sufficient stock; atomic decrement via conditional bulkWrite; reject insufficient stock (409); implement GET by id.
- [X] T104 [P] [US7] Backend tests (SC-010, SC-014, FR-025, FR-028, FR-043): snapshot immutability, empty cart rejection, total rounding accuracy (single rounding step), price immutability post-change, stock decrement verification, insufficient stock (409), prevention of negative stock in `backend/tests/api/orders.test.ts`.
- [X] T105 [US7] Frontend OrderConfirmation component/modal: render snapshot (FR-025, SC-014) unaffected by later catalog changes.
 - [X] T136 [P] [US7] Dual dismissal tests (× & Close) restoring focus to initiating element; verify accessible names in `frontend/src/__tests__/orderModalDismiss.test.tsx` (FR-046, SC-024)
- [X] T106 [P] [US7] Frontend tests (SC-010, SC-014, FR-025, FR-043): submit flow, empty cart prevention, snapshot persistence after product change, cart clear in `frontend/src/__tests__/order.test.tsx`.
- [X] T107 [US7] Clear cart post-submission; verify persistence resets (SC-009).
- [X] T108 [P] [US7] Add Order types `frontend/src/types/order.ts`.
- [X] T109 [US7] Docs: quickstart & spec order endpoint examples & performance expectations (SC-010, SC-014) including atomic decrement behavior & concurrency mitigation.
- [X] T121 [P] [US7] Concurrency test (FR-043): simulate near-concurrent orders exhausting stock; assert second yields 409; documented bulkWrite conditional decrement approach.
- [X] T122 [P] [US7] Utility: shared rounding helper (`backend/src/utils/money.ts`) applying single half-up rounding step (FR-028); integrated into Order total computation.
 - [X] T137 [P] [US7] Micro-benchmark rounding helper: run 10k operations across varied price sets; assert cumulative drift < $0.01 (SC-010) in `backend/tests/utils/moneyPerf.test.ts`


## Added Test & Instrumentation Tasks (Cross-Cutting)

- [X] T110 [P] Perf sampling script/update (SC-001, SC-002, SC-010, SC-011): measure GET /api/products (list & search/filter) & order POST durations; log p95 locally; document typical environment factors (latency <10ms loopback). (Implemented: `backend/tests/api/perf.test.ts`, `orderPerf.test.ts`; p95s recorded.)
<!-- Removed T138 duplicate navigation performance task (merged into T129) -->
- [X] T111 [P] Image load timing & fallback substitution test (SC-015, SC-016, SC-017, SC-018, SC-019): instrument and assert fallback substitution <1000ms, reserved space prevents layout shift (CLS <0.1), alt pattern correctness. (Implemented: `frontend/src/__tests__/imageTiming.test.tsx` & `images.test.tsx`.)
- [X] T123 [P] Logging & metrics verification test (FR-011, SC-006): assert log format `[timestamp] [traceId] [method] [path] [status] [duration_ms]`, error counter increments on simulated failures in `backend/tests/api/loggingMetrics.test.ts`.

## Phase 12: Cross-Cutting Validation & Performance / Success Criteria

Goal: Ensure SC-001..SC-020 satisfied; finalize docs; perf & a11y audits.

- [X] T112 [P] Accessibility sweep: images, cart controls, search/filter inputs, order confirmation (no new violations) (Extended tests in `a11y.test.tsx` including focus management.)
 - [X] T139 [P] Verify dual dismissal accessibility: ensure both controls have accessible names & tab order (focus sequence preserved) in `frontend/src/__tests__/a11y.test.tsx` (FR-046, SC-024)
 - [X] T113 [P] Update README.md with extended features summary & run instructions additions (Completed: README now documents categories, search/filter, cart, orders, images, performance, accessibility, coverage.)
- [X] T114 [P] Update `quickstart.md`: environment variables for categories, orders, cart notes, image assets mention (Completed: PERF env, order id endpoint, concurrency & probes added.)
- [X] T115 [P] Update `research.md` with rationale for snapshot order model, rounding strategy, and concurrency mitigation (bulkWrite conditional updates) (Completed: coverage & instrumentation summary appended.)
- [X] T116 [P] Verify openapi.yaml examples: add request/response examples for category CRUD, order POST/GET (Completed: examples added; product cap corrected to 100.)
- [X] T117 [P] Coverage audit: ensure new tests raise coverage ≥80% after extensions (backend & frontend) (Backend branches 81.81%, overall >93%; Frontend statements 95.17%, branches 86.9%.)
- [X] T118 Consolidated success criteria checklist file update `checklists/requirements.md` with SC-015..SC-020 tracking (Completed: success criteria section appended, all marked.)
 - [X] T119 [P] Lint/Type cleanup: new files conform; run `npm run lint` in both packages and fix (Completed: removed unsafe any, unused vars, hook misuse.)
- [X] T120 Final seed audit: confirm counts (≥20 products, ≥5 categories, deterministic image filenames, mixed stock) in test (Completed: `seedAudit.test.ts` added and passing.)

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

Completion of extended scope requires prior tasks T062–T120 plus branding/gating tasks T124–T139 done, coverage ≥80%, success criteria SC‑001..SC‑025 verified, and updated documentation & contracts committed.
### Additional Remediation Tasks
 - [X] T140 [P] CLS measurement test capturing layout shifts <0.1 during image load & fallback in `frontend/src/__tests__/cls.test.tsx` (SC-018)
 - [X] T141 [P] Fallback alt en dash assertion test verifying `<name> – image unavailable` pattern in `frontend/src/__tests__/imagesAltPattern.test.tsx` (FR-036, SC-019)
       <!-- Duplicate T142 removed; primary definition in Phase 1 Setup -->

## Phase N+3: Remediation & Validation (Navigation, Dynamic Stock, RBAC Consistency)

- [X] T160 [P] Dynamic zero-stock UI update implementation: After successful order POST, optimistically decrement affected product stock locally and update ProductCard; fallback minimal refetch if discrepancies. Acceptance: product reaching stock 0 displays “Out of Stock” badge/text ≤1s (FR-015, SC-037).
- [X] T161 [P] Dynamic zero-stock accessibility test: Assert `disabled` attribute, `aria-disabled="true"", presence of status text (visible or sr-only), Tailwind classes `opacity-50 cursor-not-allowed`, and preserved focus order (FR-016, SC-038).
 - [X] T162 [P] Navigation label audit test: Render primary routes/components and assert no occurrences of legacy label “Categories”; expect “Category Management” (SC-036, FR-045).
 - [X] T163 [P] Multi-route navigation order test: Verify order (Products, Category Management, Product Management, Logout) and single `aria-current` across catalog, category, product management, login routes (SC-035, FR-045).
- [ ] T164 [P] Unauthorized navigation denial test: Non-admin direct route access yields AccessDenied or safe redirect without privileged control flash (SC-039, FR-059).
- [ ] T165 [P] Admin navigation persistence test: With valid token, reload retains admin-only nav links visibility (SC-040, FR-058).
- [ ] T166 [P] Flag absence repository scan: Automated test/utility greps for `ENABLE_CATEGORY_ADMIN` (excluding this tasks.md historical note) ensuring zero active references (SC-041).
- [ ] T167 [P] Role-only enforcement static analysis: Scan backend routes/middleware for conditional checks referencing removed flag; ensure all protected writes depend solely on `authAdmin` (SC-042).
 - [X] T168 [P] Consolidated error schema test: Table-driven scenarios exercise each error code (`admin_auth_required`, `token_expired`, `forbidden_admin_role`, `invalid_credentials`, `category_name_conflict`, `stock_conflict`) asserting JSON `{ error, message }` shape and absence of deprecated `insufficient_stock` (FR-060, SC-033).

---

## Phase N+2: Admin Authentication (Foundation for US4/US9)

Context: Introduce unified login endpoint and JWT protection for admin write operations (legacy environment flag removed).

- [X] T143 [P] Add `jsonwebtoken` and `@types/jsonwebtoken` to `backend/package.json`
- [X] T144 [P] Create `backend/src/routes/auth.ts` with `POST /api/auth/login` (env creds → issue HS256 JWT `{ role:'admin', iat, exp }` exp=1h)
- [X] T145 Wire auth routes in `backend/src/app.ts` (mount `/api/auth`)
- [X] T146 [P] Create `backend/src/middleware/authAdmin.ts` (validate Bearer JWT; role=admin; 401 missing/invalid/expired; attach `req.admin=true`)
- [X] T147 [P] Add helper `backend/src/utils/errors.ts` returning standardized JSON `{ error:'admin_auth_required', message:'Admin authentication required' }`
- [X] T148 Apply `authAdmin` to category writes in `backend/src/routes/categories.ts` (POST/PUT/DELETE); ensure zero legacy flag logic.
- [X] T149 Apply `authAdmin` to product writes in `backend/src/routes/products.ts` (POST/PUT/DELETE) (add missing write handlers if absent)
- [X] T150 Update OpenAPI `specs/001-product-catalog/contracts/openapi.yaml`: ensure `bearerAuth` present, secure writes annotated, `/api/auth/login` defined, structured error code examples added (admin_auth_required, token_expired, forbidden_admin_role, invalid_credentials, stock_conflict) aligning with FR-057..FR-060.
- [X] T151 [P] Docs: Update `specs/001-product-catalog/quickstart.md` with auth env vars (ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET), login flow, token storage key `shoply_admin_token`, expiry (1h), logout behavior.
- [X] T152 [P] Docs: Update `specs/001-product-catalog/research.md` with JWT decisions (HS256, 1h expiry, no refresh), security considerations, edge cases, and future enhancements.
- [X] T153 [P] Docs: Update `specs/001-product-catalog/data-model.md` with AdminUser pseudo-entity & JWT claim fields (completed; see AdminUser claims section)

---

## Phase N+3: Frontend Auth & Route Protection (Completed)

Purpose: Provide login UI and protect admin pages; keep public pages open.

- [X] T154 [P] Create `frontend/src/pages/Login.tsx` (POST `/api/auth/login`; store JWT in `localStorage` key `shoply_admin_token`)
- [X] T155 [P] Add `frontend/src/context/AuthContext.tsx` (parse token, expose `{ role, authenticated, exp }`, auto-expiry handling)
- [X] T156 [P] Implement `frontend/src/components/PrivateRoute.tsx` guarding CategoryManagement & ProductManagement (redirect /login or render AccessDenied)
- [X] T157 [P] Hide admin-only nav links when unauthenticated in `frontend/src/App.tsx`
- [X] T158 [P] Handle 401/403: API interceptor in `frontend/src/api/http.ts` clears token + redirects to /login (expired or invalid)
- [X] T166 [P] Add `frontend/src/components/AccessDenied.tsx` standardized message for blocked admin access
- [X] T167 Frontend test: token expiry simulation triggers logout + redirect in `frontend/src/__tests__/authExpiry.test.tsx`
- [X] T168 [P] Frontend test: AccessDenied component renders and no admin controls present in `frontend/src/__tests__/accessDenied.test.tsx`

---

## Phase N+4: User Story 9 — Admin Product Management (Priority: P4/P5)

Goal: Admin can CRUD products including stock and category selection; anonymous blocked.
Independent Test: Valid admin CRUD succeeds; anonymous/invalid token blocked; dropdown lists all categories.

- [X] T159 [P] [US9] Implement product POST/PUT/DELETE handlers in `backend/src/routes/products.ts` (validation: fields + categoryId optional)
- [X] T160 [US9] Create `frontend/src/pages/ProductManagement.tsx` (list + create/edit/delete; dropdown categories)
- [X] T161 [US9] Product management API utilities in `frontend/src/api/productsAdmin.ts` using Bearer token
- [X] T162 [US9] Secure writes via `authAdmin`; UI sends Authorization header
- [X] T169 [P] [US9] Frontend tests: product create/update/delete blocked when anonymous; success when admin (Implemented: `frontend/src/__tests__/productMgmtCrudAuth.test.tsx`)
- [X] T170 [US9] Backend tests: product CRUD with auth + 401/403 matrix in `backend/tests/api/productsAuth.test.ts` (Satisfied by T164; consolidated. See existing `backend/tests/api/productsAuth.test.ts`.)

---

## Phase N+5: Tests for Auth & Admin Flows (Targeted)

- [X] T163 [P] Backend tests: `/api/auth/login` 200 + 401 invalid credentials, token exp claim correctness in `backend/tests/api/auth.test.ts`
- [X] T164 [P] Backend tests: protected category/product writes 401 (missing/invalid/expired token) & 403 (non-admin) in `backend/tests/api/{categoriesAuth.test.ts,productsAuth.test.ts}` (SC-029, SC-030)
- [X] T165 [P] Frontend tests: route guard redirects unauthenticated access to `/login` and hides admin nav in `frontend/src/__tests__/authGuard.test.tsx`
- [X] T171 [P] Frontend test: categories API auth error mapping (token_expired, admin_auth_required, forbidden_admin_role) in `frontend/src/__tests__/categoriesApiAuthErrors.test.tsx`
- [X] T172 Backend tests: expired token returns 401 token_expired with zero mutation for category/product writes (covered in `backend/tests/api/categoriesAuth.test.ts` and `productsAuth.test.ts`) (SC-030)
- [X] T173 [P] Docs update: add SC-029/SC-030 mapping in `specs/001-product-catalog/checklists/requirements.md` (mapping present)


### Order Model Snapshot & Rounding (Documentation Addendum)
The order submission flow captures a snapshot of each line item (productId, name, price, quantity) at the moment of POST before any external mutations can occur. Stock decrement uses a Mongo bulkWrite with conditional filters `stock: { $gte: qty }` ensuring atomicity; if any filter fails due to concurrent changes the operation returns fewer matched docs and the route aborts with 409. Rounding applies exactly once using `roundCurrency` (half-up: Math.round(EPSILON-adjusted *100)/100) to the aggregate sum prior to persistence, satisfying SC-010 and preventing cumulative floating point drift. Concurrency test (T121) validates that only one of two simultaneous orders for a single-stock item succeeds (201 vs 409) enforcing FR-043. Future improvements (deferred) may consider Mongo transactions for multi-document atomicity when scaling beyond simple decrement logic.

---

## Phase N+6: RBAC Hardening & Documentation Additions (Updated)

Context: Close remaining RBAC traceability gaps (error code catalog, atomic denial for orders and multi-write attempts, explicit logging) and document intentional design decisions (no refresh tokens).

- [X] T174 [P] Closed: Order submission intentionally remains anonymous; RBAC not extended. Zero-mutation enforced by existing stock checks; auth test out of scope.
- [X] T175 [P] Closed: Expired token scenario for orders not applicable (no JWT required). Decision documented in spec & research.
- [X] T176 [P] Docs & contract: add error code catalog (`admin_auth_required`, `invalid_credentials`, `token_expired`, `forbidden_admin_role`, `validation_error`, `category_name_conflict`, `not_found`, `stock_conflict`) to `specs/001-product-catalog/spec.md` + OpenAPI examples; cross-reference in checklist (FR-060, SC-033)
- [X] T177 [P] Frontend a11y test: AccessDenied component ARIA semantics in `frontend/src/__tests__/accessDeniedA11y.test.tsx` (FR-059)
- [X] T178 [P] Backend tests: batch product write attempts with expired/missing token zero mutation in `backend/tests/api/productsBatchAuth.test.ts` (SC-029, SC-030)
- [X] T179 [P] Backend logging: auth failure structured log (`event=auth_failure`) including `traceId`, `reason` (error code), `path`; test in `backend/tests/api/authLogging.test.ts` (FR-011 extension)
- [X] T180 [P] Docs: clarify absence of refresh tokens & re-auth flow; add security note in `quickstart.md`, `research.md`, and README (FR-058–FR-060)

---

## RBAC & Performance Success Criteria Completion (Previously Future, now Completed)

- [X] T181 [P] SC-031 Cart latency perf test: measure add/update/remove operations median & p95 (<500ms typical) in `frontend/src/__tests__/cartPerf.test.tsx`.
- [X] T182 [P] SC-032 Order confirmation latency test: measure time from submit action to modal fully rendered (≤1s) in `frontend/src/__tests__/orderModalPerf.test.tsx`.
- [X] T183 [P] SC-033 Backend structured error codes test aggregating endpoints (`/api/auth/login`, protected writes, order conflicts) asserting `{ error, message }` membership in `backend/tests/api/errorCodes.test.ts`.
- [X] T184 [P] SC-033 Docs: Error Codes appendix cross-reference added to `checklists/requirements.md`.
- [X] T185 [P] SC-034 Expired token admin page access UX test in `frontend/src/__tests__/expiredAccessDenied.test.tsx`.
- [X] T186 [P] FR-058 Logout flow a11y test: focus returns to login heading in `frontend/src/__tests__/logoutFocus.test.tsx`.
- [X] T187 [P] FR-060 Expired token protected write attempt zero-mutation test in `backend/tests/api/expiredWrite.test.ts`.
- [X] T188 [P] FR-056 PII rejection test in `backend/tests/api/orderPii.test.ts`.
- D001 Image optimization (responsive srcset / WebP)
- D002 Pagination & server-side filtering beyond 200 products
<!-- Removed D003 (auth & role-based category management) as delivered via RBAC tasks T142, T149, T170 -->
- D005 Discount codes & tax calculations
- D006 Advanced search (tokenization, fuzzy)
- D007 CDN integration for static assets

## Meta Execution Tasks
- [X] Final validation: Full backend & frontend test suites executed; all tests pass; coverage thresholds (≥80%) exceeded.
- [X] Implementation summary & handoff: Comprehensive summary generated per speckit prompt step 9.

---

## Gap Remediation (Added After Mapping)

The following tasks are newly added to close uncovered requirement & success criteria gaps discovered during formal FR/SC ↔ task mapping (see `checklists/mapping-fr-sc-tasks.md`).

 - [X] T189 [P] Backend performance test for Category CRUD (SC-007, FR-054)
       - Implement `backend/tests/api/categoryPerf.test.ts` measuring create/update/delete allowed operations (excluding blocked 409 cases) across ≥20 iterations; compute median & p95; assert p95 ≤2000ms.
       - Logs formatted similar to existing perf tests; failure produces descriptive message.
       - Ensures explicit evidence for SC-007 and the performance portion of FR-054.
 - [X] T190 [P] Backend performance test for Product CRUD (SC-028, FR-054)
       - Implement `backend/tests/api/productCrudPerf.test.ts` covering create/update/delete for typical payload sizes; ≥20 iterations; assert p95 ≤2000ms.
       - Reuses rounding/helper where applicable; ensures product write timings tracked.
 - [X] T191 [P] Case-insensitive Category name uniqueness negative test (FR-055)
       - Extend or add `backend/tests/api/categoriesUnique.test.ts` creating a category then attempting same name with different casing; expect 409 and error code `category_name_conflict`; assert zero mutation.
       - Confirms explicit coverage separate from general CRUD tests.
- [X] T192 [P] Requirements checklist update referencing new perf & uniqueness tests
       - Update `specs/001-product-catalog/checklists/requirements.md` to mark SC-007, SC-028, FR-055 covered by T189–T191.
- [X] T193 [P] Add mapping artifact file `checklists/mapping-fr-sc-tasks.md` summarizing FR/SC ↔ task linkage for audit traceability.

---

## Phase N+7: ProductManagement Acceptance Criteria & Extended RBAC Tests

Context: Append tasks to fulfill explicit acceptance criteria for ProductManagement page (SC‑026, FR‑052, FR‑059) and strengthen admin role access control validation. Sequentially continues after T193.

- [X] T194 [P] [US9] Frontend test: ProductManagement category dropdown lists all categories (≥5) and reflects create/delete changes in `frontend/src/__tests__/productMgmtCategories.test.tsx` (FR‑052)
- [X] T195 [P] [US9] Frontend test: Unauthorized (anonymous & non-admin token) navigation to `/admin/product-management` shows branded AccessDenied and blocks form submission (SC‑026, FR‑059) in `frontend/src/__tests__/productMgmtUnauthorized.test.tsx`
- [X] T196 [P] [US9] Frontend test: Auth persistence across reload (admin remains until token expiry) in `frontend/src/__tests__/authPersistence.test.tsx` (FR‑052)
- [X] T197 [P] [US9] Frontend test: Negative stock input prevented (client validation) — submission blocked, API not called in `frontend/src/__tests__/productStockValidation.test.tsx` (FR‑052)
- [X] T198 [P] Backend test: Standardized unauthorized error body `{ error:'admin_auth_required', message:'Admin authentication required' }` for protected product/category writes (missing/invalid/expired token) in `backend/tests/api/unauthorizedErrorFormat.test.ts` (FR‑059, SC‑026)
- [X] T199 [P] [US9] Enhance `frontend/src/pages/ProductManagement.tsx` to render branded inline AccessDenied message when blocked (reuse `AccessDenied.tsx`) (FR‑059)
- [X] T200 [P] Requirements checklist update: mark SC‑026, FR‑052, FR‑059 covered (append rows) in `specs/001-product-catalog/checklists/requirements.md`
- [X] T201 [P] Mapping artifact augmentation: extend `specs/001-product-catalog/checklists/mapping-fr-sc-tasks.md` linking SC‑026, FR‑052, FR‑059 to tasks T159–T170, T194–T199
- [X] T202 [P] [US9] Accessibility test: Focus lands on login heading after unauthorized redirect (non-admin token) distinct from expired token path in `frontend/src/__tests__/unauthorizedFocus.test.tsx` (SC‑026, FR‑059)
- [X] T203 [P] Docs: Add RBAC rationale (legacy flag removed, JWT role only) to `specs/001-product-catalog/research.md` and `quickstart.md` (FR‑059)
- [X] T204 [P] [US9] Frontend test: NavBar admin link visibility (unauthenticated hidden, non-admin token hidden, admin token visible, post-logout hidden again) in `frontend/src/__tests__/navAdminLinkVisibility.test.tsx` (FR‑059, FR‑052)
- [X] T205 [P] [US9] Frontend test: Token expiry removes ProductManagement link & triggers redirect (distinct from manual logout) in `frontend/src/__tests__/navAdminLinkExpiry.test.tsx` (FR‑052)

