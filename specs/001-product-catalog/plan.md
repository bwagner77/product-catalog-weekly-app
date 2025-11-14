# Implementation Plan: Product Catalog

**Branch**: `001-product-catalog` | **Date**: 2025-11-14 | **Spec**: ./spec.md
**Input**: Feature specification from `/specs/001-product-catalog/spec.md`

## Summary

MVP delivers a read‑only product catalog. A React 18 + TypeScript + Vite + TailwindCSS frontend renders a list of products (name, description, price) from a TypeScript Express API `GET /api/products` backed by MongoDB (Mongoose). At least 5 products are seeded idempotently on first run. UI is clean, responsive, and accessible; prices display a currency symbol with two decimals. Clarification: up to 100 items, no pagination.

## Technical Context

**Language/Version**: TypeScript (ES2022), Node.js 20.x, React 18  
**Primary Dependencies**: Express, Mongoose, uuid, cors, Vite, React, TailwindCSS, Jest, Supertest, Vitest, React Testing Library, ESLint, Prettier, ts-node-dev  
**Storage**: MongoDB (Mongoose ODM)  
**Testing**: Backend: Jest + Supertest; Frontend: Vitest + React Testing Library; Coverage ≥80% on critical paths  
**Target Platform**: Docker Compose (frontend 5173, backend 3000, MongoDB 27017)  
**Project Type**: Web application (separate backend + frontend)  
**Performance Goals**: Frontend initial render ≤2s p95 (typical ≤1s); API GET /api/products ≤1s p95 (typical ≤500ms local)  
**Constraints**: Read‑only scope; no authentication; no caching/CDN; Tailwind‑only styling; prices formatted to two decimals; immutable UUID id; idempotent seed; lean Mongo queries; product volume ≤100 items, no pagination  
**Scale/Scope**: ≤100 products visible; low concurrency (developer local)

## Constitution Check

Gate evaluation per Constitution (v1.0.0):

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| Code Quality | Single responsibility, Prettier 2‑space enforced | PASS | ESLint + Prettier planned; modular components/services |
| Testing Standards | Unit + integration, ≥80% coverage, no E2E | PASS | Jest/Vitest configured; thresholds enforced |
| UX Consistency | Mobile‑first, Tailwind‑only, accessibility | PASS | Responsive layout and a11y checks included |
| Performance | Page ≤2s, API ≤1s | PASS | Targets documented and validated manually |
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
│       └── products.ts   # API utilities for ProductList
└── test/
    └── setup.ts
```

**Structure Decision**: Web application split into `backend/` and `frontend/` with shared `contracts/`. Tests colocated as per constitution.

## Implementation Notes (by phase)

Phase 0 (Research): Completed — decisions for stack, observability, performance validation documented in `research.md`.

Phase 1 (Design & Contracts): Completed — `data-model.md`, `contracts/openapi.yaml`, and `quickstart.md` present. Clarification integrated: ≤100 items, no pagination.

Backend specifics:
- Express + TypeScript with ts-node-dev (`--respawn --transpile-only`).
- CORS: enable with origin `${FRONTEND_URL:-http://localhost:5173}`; methods [GET] sufficient for MVP.

Frontend specifics:
- Vite + React 18 + TS + Tailwind; use `import.meta.env.VITE_API_BASE_URL` directly.
- Components: ProductCard, Loading, ErrorMessage, EmptyState; page: ProductList.
- Create `src/api/products.ts` for fetch utilities to isolate data layer.
- Accessibility: semantic markup, keyboard navigation; minimal ARIA.

Testing:
- Backend: Jest + Supertest; thresholds ≥80% (branches/functions/lines/statements).
- Frontend: Vitest + RTL (+ jsdom, jest-dom); thresholds ≥80%.
- State tests: loading/empty/error; a11y checks; model validation; seed idempotency.

Performance validation:
- Manual local checks (Playwright): page render ≤2s p95; API latency ≤1s p95; steps recorded in `research.md`.

Containerization:
- Docker Compose with frontend, backend, mongo services; health checks via `/health` endpoints.
- Environment mapping via `.env`; optional build arg for Vite `VITE_API_BASE_URL` in frontend image.

## Complexity Tracking

No violations or exceptional complexity introduced. MVP scope constrained to a single read‑only list.
