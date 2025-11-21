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
```

Optional overrides:
- SEED_PRODUCT_COUNT=20 (default if unset)
- SEED_CATEGORY_COUNT=5 (default if unset)

## Run Locally

Start all services:

```powershell
docker compose up --build
```

Endpoints:
- Products: http://localhost:3000/api/products
- Categories: http://localhost:3000/api/categories
- Orders: http://localhost:3000/api/orders (POST)
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
- Search: case-insensitive substring on name + description.
- Category deletion blocked if products exist (409 Conflict).
- Cart persists in localStorage; stock=0 disables add-to-cart.
- Orders capture product snapshot (name, price, quantity, total) without adjusting stock.
- Accessibility: all images have descriptive alt text; fallback indicates unavailability.
