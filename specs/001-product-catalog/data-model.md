# Data Model: Product Catalog

Date: 2025-11-10
Branch: 001-product-catalog

## Entities

### Product
| Field | Type | Required | Constraints | Notes |
|-------|------|----------|-------------|-------|
| id | UUID string | YES | Immutable after creation | Generated via uuid v4 |
| name | String | YES | Non-empty, length <= 120 | Display name |
| description | String | YES | Length <= 1000 | Basic text, no HTML |
| price | Decimal (Number) | YES | >= 0, two decimal places | Stored as Number; formatted on output |
| createdAt | Date | YES | Auto via timestamps | ISO string in API |
| updatedAt | Date | YES | Auto via timestamps | ISO string in API |

## Validation Rules
- name: trim whitespace; reject empty or >120 chars.
- description: trim; allow empty? NO (must be meaningful), reject >1000 chars.
- price: must be number >= 0; round/format to two decimals in presentation layer.
- id: UUID v4; set once at creation; never modified.

## Indexing
- Consider index on `name` for future search (deferred).
- Unique index on `id` (primary identifier).

## State Transitions
- Products are static read-only in this phase; only initial seed insertion state.
- No update/delete flows; `updatedAt` changes only if future modifications introduced (stable now).

## Relationships
- None in MVP (single entity).

## Assumptions
- Future localization or currency conversion deferred.
- Price precision limited to two decimals; no tax calculation in this phase.

## Open Questions (Deferred)
- Bulk import strategy (future).
- Extended product attributes (images, inventory) future scope.
