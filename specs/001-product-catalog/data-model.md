# Data Model: Product Catalog

Date: 2025-11-10 (extended 2025-11-20, amended 2025-11-21 for JWT Admin Auth)
Branch: 001-product-catalog

## Entities

### Product
| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | UUID string | YES | Immutable after creation | Generated via uuid v4 |
| name | String | YES | Non-empty, length <= 120 | Display name |
| description | String | YES | Length <= 1000 | Basic text, no HTML |
| price | Decimal (Number) | YES | >= 0, two decimal places | Stored as Number; formatted on output |
| categoryId | String | NO | If present must reference existing Category id | Enables filtering (uncategorized allowed) |
| stock | Integer | YES | >= 0 | 0 => out of stock |
### AdminUser (Ephemeral JWT Claims)
| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| username | String | YES (login only) | Must match env `ADMIN_USERNAME` | Not persisted post-auth |
| password | String | YES (login only) | Must match env `ADMIN_PASSWORD` | Not persisted; used to issue JWT |
| role | String | YES | Fixed value 'admin' for this phase | Encoded in JWT payload |
| iat | Number (epoch seconds) | YES | Set at issuance | Standard JWT issued-at |
| exp | Number (epoch seconds) | YES | iat + 3600 (1h) | Token expiry; enforced on backend & client |

JWT Payload Shape (HS256 signed):
```json
{ "role": "admin", "iat": 1732166400, "exp": 1732170000 }
```

Storage Key: `shoply_admin_token` (localStorage). Logout or expiry detection MUST remove this key and dependent UI state.

Validation Rules (Auth):
- Login rejects missing or incorrect credentials with 401 `invalid_credentials`.
- Protected writes without valid admin JWT return 401 `admin_auth_required` or 401 `token_expired` if past exp.
- Non-admin (future roles) would receive 403 `forbidden_admin_role`.

Edge Case: Token expiry mid-interaction triggers immediate removal and access denial messaging (see spec Error Codes section).
| imageUrl | String | YES | Non-empty string; pattern optional (e.g., product<N>.jpg) | Placeholder or real asset path |
| createdAt | Date | YES | Auto via timestamps | ISO string in API |
| updatedAt | Date | YES | Auto via timestamps | ISO string in API |

## Validation Rules
- name: trim whitespace; reject empty or >120 chars.
- description: trim; must be non-empty; reject >1000 chars.
- price: number >= 0; store raw numeric; format at render.
- id: UUID v4; immutable.
- categoryId: if provided, MUST correspond to an existing Category id (referential integrity check at write time or deferred validation during category deletion attempts).
- stock: integer >= 0; disallow negative values; treat 0 as out-of-stock state (UI disables add-to-cart).
- imageUrl: non-empty string; deterministic placeholder pattern for seed; fallback used in UI if missing/broken (API still required to include field).

## Indexing
- Unique index on `id` (primary identifier).
- Optional compound index (future) on `name` + `description` for improved substring search (deferred until scaling beyond 200 products).
- Potential index on `categoryId` to accelerate filtering (recommended when categories > few).

## State Transitions
- Products: Primarily read-only; potential future update flows (category assignment or stock adjustments) deferred.
- Stock: Not decremented on order submission in this phase (inventory ops deferred). Out-of-stock state derived from stock=0.
- Image: imageUrl remains static placeholder unless future upload feature introduced.

## Relationships
- Product → Category (many-to-one; nullable categoryId).
- Order → Product snapshot (denormalized copy; no foreign key enforcement after snapshot).
- CartItem → Product (ephemeral client-side; refers by productId only).

## Assumptions
- Future localization or currency conversion deferred.
- Price precision limited to two decimals; no tax calculation in this phase.
- Unassigned products (categoryId absent) appear in "All" or "Uncategorized" view (UI decision).
- Image placeholders reside in a static/public directory served by frontend layer or CDN later.
- cart operations validate stock but do not mutate it.

## Open Questions (Deferred)
- Bulk import strategy (future).
- Full-text search vs substring scaling.
- Inventory management & stock decrement logic.
- Image optimization (responsive sources, formats).
