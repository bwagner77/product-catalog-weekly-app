# Quickstart: Product Catalog MVP

This quickstart gets the Product Catalog running locally with Docker Compose.

## Prerequisites
- Docker and Docker Compose
- Node.js 20.x (optional for local dev outside containers)

## Environment
- Create `.env` at repo root with:
  - VITE_API_BASE_URL=http://localhost:3000
  - MONGODB_URI=mongodb://mongo:27017/product_catalog
  - PORT_BACKEND=3000
  - PORT_FRONTEND=5173

## Run locally

- Start all services:
  - `docker compose up --build`
- Frontend: http://localhost:5173
- Backend: http://localhost:3000/api/products

## Health checks
- Frontend: GET http://localhost:5173/health (to be implemented)
- Backend: GET http://localhost:3000/health (to be implemented)

## Tests
- Backend: `npm run test` in backend/ (Jest + Supertest)
- Frontend: `npm run test` in frontend/ (Vitest + RTL)

## Notes
- Styling uses TailwindCSS only.
- Prices display with $ and 2 decimals.
- Seed inserts at least 5 products idempotently on first run.
