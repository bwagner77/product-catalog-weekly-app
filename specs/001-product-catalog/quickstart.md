# Quickstart: Product Catalog (Extended E-commerce & Images)

This quickstart gets the Product Catalog running locally with Docker Compose.

## Prerequisites
- Docker and Docker Compose
- Node.js 20.x (optional for local dev outside containers)

## Environment
Create `.env` (repo root) with at minimum:

```
VITE_API_BASE_URL=http://localhost:3000
MONGODB_URI=mongodb://mongo:27017/product_catalog
PORT_BACKEND=3000
PORT_FRONTEND=5173
FRONTEND_URL=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secret
JWT_SECRET=dev_jwt_secret_value
```

Optional overrides:
- SEED_PRODUCT_COUNT=20 (default if unset)
- SEED_CATEGORY_COUNT=5 (default if unset)
- PERF=1 (enable performance probe tests `perf.test.ts` & `orderPerf.test.ts`)

## Run Locally

Start all services:

```powershell
docker compose up --build
```

Endpoints:
- Products: http://localhost:3000/api/products
- Categories: http://localhost:3000/api/categories
- Orders: http://localhost:3000/api/orders (POST)
- Order by Id: http://localhost:3000/api/orders/{id}
- Admin Login: http://localhost:3000/api/auth/login (POST)
- Health: http://localhost:3000/health | http://localhost:5173/health

## Health checks
- Frontend: GET http://localhost:5173/health (to be implemented)
- Backend: GET http://localhost:3000/health (to be implemented)

## Tests

Backend (Jest + Supertest):
```powershell
cd backend
npm test
```

Frontend (Vitest + RTL):
```powershell
cd frontend
npm test
```

Optional performance probe (API latency):
```powershell
cd backend
$env:PERF='1'
npm test -- --runInBand tests/api/perf.test.ts
```

## Notes
- Styling uses TailwindCSS only.
- Prices display with $ and 2 decimals.
- Extended seed inserts ≥20 products and ≥5 categories (idempotent).
- Images use deterministic placeholders (product<N>.jpg) plus a shared fallback image.
- Fallback alt pattern: `<Product Name> – image unavailable` (accessibility + degraded state clarity).
- Search: case-insensitive substring on name + description.
- Category deletion blocked if products exist (409 Conflict).
- Category management performance & feedback: Aim for SC-007 (≤2s p95 for allowed create/update/delete) and SC-013 (100% blocked deletions emit clear explanation).
- Cart persists in localStorage; stock=0 disables add-to-cart.
- Orders capture product snapshot (name, price, quantity, total) and atomically decrement stock using conditional `bulkWrite` filters (`stock: { $gte: qty }`). On conflict or insufficient stock the request returns 409 and no partial fulfillment occurs.
- Accessibility: all images have descriptive alt text; fallback indicates unavailability.
- Performance probes: set `PERF=1` to run latency sampling; p95 targets: API ≤1000ms, initial render ≤2000ms.
- Concurrency: simultaneous orders competing for limited stock yield one success (201) and one 409 rejection.
- Admin Authentication: Use `POST /api/auth/login` with `ADMIN_USERNAME`/`ADMIN_PASSWORD`; successful response returns JWT (HS256) exp=1h stored in `localStorage` key `shoply_admin_token`. Logout clears key; expired token triggers automatic removal and redirect to login.

## RBAC Behavior (Admin-only Writes)
- Product and Category POST/PUT/DELETE require a valid admin JWT (Bearer token). Missing/invalid/expired tokens return 401 with `{ error:'admin_auth_required' }` or `{ error:'token_expired' }`; non-admin role returns 403 `{ error:'forbidden_admin_role' }`.
- Frontend hides admin links for unauthenticated or non-admin users. Accessing `/admin/product-management` without admin shows an AccessDenied message; no privileged flicker.
- On 401/403 from protected endpoints, the app clears the token and navigates to Login. After re-authentication, admin links reappear and protected forms become usable.
