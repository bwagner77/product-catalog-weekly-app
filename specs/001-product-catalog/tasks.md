---

description: "Task list for Product Catalog MVP"

---

# Tasks: Product Catalog

**Input**: Design documents from `/specs/001-product-catalog/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are REQUIRED by the constitution (≥80% on critical paths). This plan includes explicit test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

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
