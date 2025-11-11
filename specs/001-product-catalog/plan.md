# Implementation Plan: Product Catalog

**Branch**: `001-product-catalog` | **Date**: 2025-11-10 | **Spec**: ./spec.md
**Input**: Feature specification from `/specs/001-product-catalog/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

MVP delivers a read-only product catalog: frontend React 18 + TypeScript + Vite + TailwindCSS
renders a list of products (name, description, price) sourced from backend Express TypeScript API
`GET /api/products` backed by MongoDB (Mongoose). Minimum 5 seeded products on first run, idempotent
seeding. Observability: basic request logging with traceId and error counter + seed verification log.
Performance goals: page render ≤2s (p95 ≤2s, typical ≤1s), API latency ≤1s (p95 ≤1s). Deployment via
Docker Compose (frontend, backend, MongoDB) single command startup.

## Technical Context

**Language/Version**: TypeScript (ES2022), Node.js 20.x, React 18
**Primary Dependencies**: Express, Mongoose, uuid, Vite, React, TailwindCSS, Jest, Supertest, Vitest, React Testing Library, ESLint, Prettier, ts-node-dev
**Storage**: MongoDB (Mongoose ODM) local container
**Testing**: Backend: Jest + Supertest; Frontend: Vitest + React Testing Library; Coverage ≥80% critical paths
**Target Platform**: Local Docker containers (frontend: 5173, backend: 3000, MongoDB: 27017) – future optional cloud deploy (Azure) deferred
**Project Type**: Web application (separate backend + frontend)
**Performance Goals**: Frontend initial catalog render ≤2s p95 (typical ≤1s); API GET /api/products latency ≤1s p95 (typical ≤500ms local); zero blocking synchronous CPU tasks
**Constraints**: Read-only scope; No caching; No auth; Tailwind-only styling; Immutable UUID id per product; Idempotent seed logic; Use lean Mongoose queries
**Scale/Scope**: ≤100 products initial (seeded 5); Low concurrency (developer local) – scalability considerations deferred

NEEDS CLARIFICATION: Cloud deployment environment specifics (Azure vs others) deferred; acceptable to proceed without for MVP.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|-----------|------|--------|-------|
| Code Quality | Single responsibility, Prettier 2-space enforced | PASS | Plan includes ESLint + Prettier config tasks |
| Testing Standards | Unit + integration, ≥80% coverage, no E2E | PASS | Testing stack defined; coverage tasks planned |
| UX Consistency | Responsive, Tailwind-only, accessibility | PASS | ProductList responsive + accessibility tasks |
| Performance | Page ≤2s p95, API ≤1s | PASS | Targets defined; validation task added |
| Deployment Strategy | Docker Compose multi-service | PASS | Compose stack planned (frontend/backend/mongo) |
| Technology Choices | Mature, modular, testable stack | PASS | Widely adopted libs selected |
| Governance | Versioning, amendment via PR | PASS | No violations for feature-level plan |

Violations: None. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

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
│   └── config/ (future expansion if needed)
└── tests/
  ├── api/
  │   └── products.test.ts
  ├── models/
  │   └── productModel.test.ts
  └── seed/
    └── seedProducts.test.ts

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
│   └── __tests__/
│       ├── ProductList.test.tsx
│       ├── ProductCard.test.tsx
│       └── states.test.tsx
└── tailwind.config.js (generated)

contracts/
└── openapi.yaml
```

**Structure Decision**: Web application split into `backend/` (Express API) and `frontend/` (React UI) with shared `contracts/` for OpenAPI. Testing directories colocated as per constitution (backend/tests, frontend/src/__tests__).

## Complexity Tracking

No violations. Simplicity maintained: single backend service, single frontend app, one database.
