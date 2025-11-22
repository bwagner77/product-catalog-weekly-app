# Feature Specification: Shoply Product Catalog

**Feature Branch**: `001-product-catalog`  
**Created**: 2025-11-10  
**Status**: Draft  
**Input**: User description: "Product Catalog app: frontend lists products (name, description, price), fetch from API; backend exposes GET /api/products returning JSON; persistent DB with 'products' collection; preload at least 5 sample products; clean responsive accessible UI; prices formatted to 2 decimals; tests in frontend/src/__tests__/ and backend/tests/."

## Clarifications

### Session 2025-11-20 (updated 2025-11-21 for Shoply branding, navigation, modal; amended 2025-11-21 RBAC)

- Q: What is the product search matching rule? → A: Case-insensitive partial substring match across both name and description fields; multiple words treated as a single phrase (no token AND logic).
- Q: What pattern is used for seeded product images? → A: Deterministic placeholder filenames using the pattern "product<N>.jpg" starting at 1 (e.g., product1.jpg) matching seed insertion order; stable across runs.
- Q: Were initial first 5 seeded products missing imageUrl/stock? → A: Earlier drafts omitted them; all seeded products now include non-empty imageUrl and non-negative stock (example first 5 may use stock 5) and remain stable across runs.
- Q: How is Category Management accessed? → A: Via top navigation banner button "Categories" beside the Shoply brand/logo.
- Q: How can the order confirmation modal be dismissed? → A: Either the top-right × control or an explicit "Close" button; both accessible and keyboard operable.
- Q: What branding changes apply? → A: Navigation banner shows **Shoply** name plus logo (accessible alt "Shoply logo").
 - Q: Are category/product management operations still open to anonymous users? → A: No. Prior assumption of open CRUD is overridden. Category and Product management (create/update/delete) now require authenticated admin role.
 - Q: Is full authentication implemented now? → A: A simplified admin login (stub) exists via `POST /api/auth/login` issuing a JWT; no environment flag gating remains. Full multi-user auth deferred.
 - Q: What is the response for unauthorized admin operations? → A: 403 JSON `{ "error": "Admin access required" }` (branded messaging enforced).
 - Q: Can anonymous users still browse and order? → A: Yes. Anonymous users retain read-only catalog (products/categories), search/filter, cart interactions, and order submission.
 - Q: Does category deletion logic change under RBAC? → A: Guard remains: 409 when products reference category; only admins may invoke deletion.

### Session 2025-11-21

- Q: How are category name duplicates handled? → A: Case-insensitive uniqueness enforced; create/update attempts with a name differing only by case from an existing category return 409 with JSON `{ "error": "Category name already exists" }` (no mutation).
 - Q: What customer PII (email, address, name) is stored with orders? → A: None; orders remain anonymous snapshots (id/items/total/status/createdAt) with no PII fields; PII-like fields in payload are rejected (400) in this phase.
 - Q: Which authentication login endpoint path is used? → A: Use unified `POST /api/auth/login` issuing a JWT with `{ role: 'admin', iat, exp }`.
 - Q: What is the admin JWT expiry duration? → A: 1 hour; requires re-login after expiry (no silent silent auto-refresh in this phase).

### Session 2025-11-14 (updated 2025-11-20)

- Q: What is the expected product list size and pagination approach? → A: Up to 200 items, no pagination (server-enforced cap; pagination deferred).
- Q: What exact fields does GET /api/products return? → A: id, name, description, price, createdAt, updatedAt.

### Session 2025-11-10

- Q: What observability signals are required for the MVP? → A: Basic request logging + error count metric + seed verification log.

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - View Product List (Priority: P1)

As a shopper, I can view a list of products with name, description, and price so that I can browse offerings.

**Why this priority**: Core value of the catalog is to display products; without it the app has no utility.

**Independent Test**: Start app with seeded data → visit catalog page → products render with formatted prices.

**Acceptance Scenarios**:

1. Given seeded products exist, When I open the catalog, Then I see a list of products with name, description, price, and images or fallbacks under the Shoply banner.
2. Given a product price exists, When displayed, Then it shows a currency symbol and exactly two decimal places.

---

### User Story 2 - Handle Loading, Empty, and Error States (Priority: P2)

As a shopper, I receive clear feedback while products load, if none are available, or if an error occurs.

**Why this priority**: Ensures a predictable and accessible experience and reduces confusion.

**Independent Test**: Simulate slow API, empty database, and API error; verify loading indicator, empty state message, and error message render.

**Acceptance Scenarios**:

1. Given the API request is pending, When I open the catalog, Then I see a loading indicator.
2. Given no products exist, When I open the catalog, Then I see an empty state message.
3. Given the API returns an error, When I open the catalog, Then I see an actionable error message and no crash.

---

### User Story 3 - Accessibility and Responsiveness (Priority: P3)

As a shopper using any device, I can access and navigate the catalog with keyboard and assistive tech.

**Why this priority**: Accessibility and responsiveness are core non-functional requirements.

**Independent Test**: Verify keyboard navigation, ARIA labels, color contrast, and responsive layout across breakpoints.

**Acceptance Scenarios**:

1. Given I use only a keyboard, When navigating the page, Then I can reach navigation (Products, Categories), product items, and controls in a logical order.
2. Given a small screen, When viewing the catalog, Then layout adapts without horizontal scrolling.

---

[Add more user stories as needed, each with an assigned priority]

### User Story 4 - Manage Categories (Priority: P4)
As a catalog maintainer (authenticated admin), I can view, create, edit, and remove product categories so that products can be organized for shopper filtering.

**Independent Test**: Log in or enable admin stub; perform create, edit, delete on categories; verify unauthorized (anonymous) attempts are blocked; verify deletion blocking when products assigned.

**Acceptance Scenarios**:

1. Given I am an authenticated admin and categories exist, When I activate the Categories navigation button, Then I see a management view list showing id and name.
2. Given I am an authenticated admin, When I submit a valid new category name, Then the category appears in the list with status 201.
3. Given I am an authenticated admin and a category has no assigned products, When I delete it, Then it is removed (204) and subsequent GET by id returns 404.
4. Given I am an authenticated admin and a category has assigned products, When I attempt deletion, Then the system returns 409 and shows a clear message (no deletion performed).
5. Given I am anonymous, When I attempt to access the CategoryManagement page or invoke POST/PUT/DELETE /api/categories endpoints, Then I receive 403 with actionable branded message and no data mutation.

### User Story 5 - Search & Filter Products (Priority: P4)

As a shopper, I can search products by text and filter by category so that I can quickly narrow down relevant items.

**Independent Test**: Seed products across categories; execute text search and category filter separately and combined; verify results set and state messaging for zero matches.

**Acceptance Scenarios**:

1. Given products exist, When I enter a search term matching name, Then only matching products display.
2. Given products exist, When I select a category filter, Then only products in that category display.
3. Given no products match my search and/or filter, When results render, Then I see a zero-results message (distinct from empty catalog state).

### User Story 6 - Manage Shopping Cart (Priority: P5)

As a shopper, I can add, update, and remove products in a cart that persists across refresh so that I can prepare an order.

**Independent Test**: Add multiple items, adjust quantities (including setting to zero to remove), refresh page, verify persistence, compute total.

**Acceptance Scenarios**:

1. Given a product is displayed, When I add it to the cart, Then the cart icon count increases.
2. Given an item is in the cart, When I change its quantity, Then the total updates accurately.
3. Given the browser is refreshed, When I return to the cart, Then previously added items remain.
4. Given a product has stock = 0, When I attempt to add it, Then the system prevents addition and shows out-of-stock status.
5. Given I reduce an item's quantity to zero, When I confirm update, Then the item no longer appears in the cart.

### User Story 7 - Submit Order (Priority: P6)

As a shopper, I can place an order containing my cart items and view a confirmation so that I can complete a purchase intent flow (without payment in this phase).

**Independent Test**: Prepare cart; submit order; verify confirmation displays immutable order snapshot including item details and total.

**Acceptance Scenarios**:

1. Given my cart contains valid items, When I place the order, Then I see a confirmation with order id, items, quantities, total, and two dismissal controls (× and Close button).
2. Given I have just placed an order, When I revisit the order confirmation, Then data matches submission snapshot (quantity, total) even if product catalog changes afterwards.
3. Given my cart is empty, When I attempt to place an order, Then the system prevents submission and shows guidance to add items.
4. Given product stock is sufficient for all requested quantities, When I submit the order, Then product stock decrements exactly by ordered quantities and never below zero.
5. Given at least one product has insufficient remaining stock for the requested quantity, When I submit the order, Then the order is rejected with a 409 response and a clear message (no partial fulfillment; no stock changes).
6. Given two sequential order submissions exhausting a product’s stock in the first, When I submit the second order, Then it is rejected with insufficient stock messaging.

### User Story 8 - View Product Images (Priority: P4)

As a shopper, I can see a product image alongside its name, description, price, and stock status so that I can visually assess items quickly.

**Independent Test**: Load catalog with seeded products; verify each product card shows image with correct alt text; simulate missing imageUrl to see fallback.

**Acceptance Scenarios**:

1. Given a product has an imageUrl, When the catalog loads, Then its image displays with consistent dimensions and alt text equal to the product name.
2. Given a product image fails to load or imageUrl is missing, When the catalog loads, Then a fallback placeholder image of the same dimensions displays with alt text indicating the product name plus "image unavailable".
3. Given viewport changes (mobile to desktop), When images resize, Then aspect ratio is preserved and layout remains stable (no overlap or distortion).

### User Story 9 - Admin Product Management (Priority: P4/P5)

As an authenticated admin, I can create, view, update, and delete products (including stock adjustments) so that I can maintain accurate catalog data for shoppers.

**Why this priority**: Enables ongoing catalog curation and stock accuracy, foundational for scaling operations.

**Independent Test**: Authenticate (stub/flag). Perform product create (with imageUrl, stock), update name/description/price/stock, delete product without dependencies. Attempt unauthorized (anonymous) operations and verify 403 and no mutation.

**Acceptance Scenarios**:

1. Given I am an authenticated admin, When I open ProductManagement, Then I see a list of products with edit/delete controls.
2. Given valid product data, When I submit a create form, Then the product is added and visible with non-negative stock.
3. Given I am an authenticated admin, When I update product stock to a new non-negative value, Then the change persists and is reflected in subsequent product browsing.
4. Given I attempt to set stock below 0, When I submit, Then the system rejects with a validation message (no partial update).
5. Given I am anonymous, When I attempt product create/update/delete, Then I receive 403 JSON error and product data remains unchanged.
6. Given normal network conditions, When I perform a valid product CRUD operation, Then the response completes within ≤ 2 seconds (p95).

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- API returns an empty list
- API request fails (network/server error)
- Very long product name/description truncation or wrapping
- Prices with more than two decimals (rounding to two)
- Non-USD locale assumption (assume USD for this phase)
- Product stock = 0 (display "Out of Stock", prevent cart addition)
- Attempting to add quantity exceeding available stock (prevent and message)
- Concurrent orders exhausting stock (second order rejected without partial fulfillment)
- Removing category with assigned products (blocked per assumption)
- Search term yields zero results (distinct message from empty catalog)
- Combining search + category filter yields zero results
- Cart persistence failure (fallback: empty cart with explanatory notice)
- Order submission with stale product data (use cart snapshot values)
- Large cart quantity updates (total recalculates without precision drift)
- Rounding total when sum involves fractional cents (round to two decimals)
- Missing imageUrl (fallback placeholder shown)
- Invalid or broken image URL (fallback placeholder shown)
- Duplicate image filenames referencing different products (acceptable for placeholders; uniqueness not required)
- Optional image tooltip on hover (non-functional enhancement; may be deferred)
- Extremely long product name impacting alt text readability (wrap without truncation)
- Image loading slower than text (text appears first; layout reserves space to prevent shift)
- Mixed presence of images and fallbacks in the same view
 - Both modal dismissal mechanisms operate independently (× and Close button)
 - Navigation focus order includes brand logo without skipping interactive elements
 - Admin attempts to set negative stock (rejected with clear validation messaging)
 - Anonymous attempts product CRUD (blocked 403, logged, no mutation)
 - Anonymous attempts category CRUD (blocked 403, no mutation)
 - Admin deletes product referenced only in cart (allowed; cart snapshot retains stale name/price)
 - Attempt to create/update a category whose name differs only by casing from an existing one (blocked 409 Conflict with explanatory JSON message)
 - Order submission including disallowed PII fields (email/name/address/phone) (rejected 400; order not created)

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST display a list of products showing name, description, and price.
- **FR-002**: System MUST fetch products from an API and render results when available.
- **FR-003**: System MUST format prices with a currency symbol and exactly two decimal places.
- **FR-004**: System MUST provide loading, empty, and error states with clear, accessible messages.
- **FR-005**: System MUST meet basic accessibility standards (keyboard navigation, ARIA, color contrast).
- **FR-006**: API MUST expose GET /api/products that returns a JSON array of products with fields: id (UUID string), name (string), description (string), price (number), createdAt (ISO date-time), updatedAt (ISO date-time).
- **FR-007**: Database MUST persist products in a collection/table named "products".
- **FR-008**: System MUST preload at least twenty (≥20) sample products available on first run to support search/filter realism (was ≥5; aligned across artifacts).
- **FR-009**: Frontend tests MUST reside in frontend/src/__tests__/ covering rendering, formatting, and accessibility.
- **FR-010**: Backend tests MUST reside in backend/tests/ covering unit logic, integration for the endpoint, and seed validation.
- **FR-011**: System MUST log each GET /api/products request with status code and duration (format: `[timestamp] [traceId] [method] [path] [status] [duration_ms]`), emit a one-time startup seed verification log entry, and increment an error counter metric on failed requests; tests MUST validate log format and error counter increments.
- **FR-012**: MVP assumes up to 200 products returned by the list endpoint and no pagination; the UI presents a single-page list. (Consolidates prior FR-031.)
- **FR-013**: System MUST expose simple health endpoints for frontend and backend to support container healthchecks.
- **FR-014**: Product entity MUST include categoryId (string) and stock (non-negative integer/number) fields; stock values < 0 MUST be rejected.
- **FR-015**: System MUST display stock status labels only ("In Stock" when stock > 0, "Out of Stock" when stock = 0).
- **FR-016**: System MUST prevent cart additions or quantity increases that would exceed available stock (reject with clear message) and block out-of-stock products entirely.
- **FR-017**: System MUST allow creation, viewing, listing, updating, and deletion of categories (subject to assumption blocking deletion when products assigned) with explicit status codes: 200 (list/get/update), 201 (create), 400 (validation failure), 404 (not found), 409 (deletion blocked due to assigned products).
- **FR-018**: Category list MUST display id and name and provide edit and delete actions.
- **FR-019**: Category form MUST require a non-empty name and show validation feedback on submit failure.
- **FR-020**: Product browsing MUST support case-insensitive partial substring text search across name and description and filtering by category independently and in combination; multiple words are matched as one contiguous phrase.
- **FR-021**: System MUST show a distinct zero-results message when search/filter returns no matches (different from empty catalog initial state).
- **FR-022**: Cart MUST support add, remove, quantity update, and clear behaviors via user interactions.
- **FR-023**: Cart MUST persist across browser refresh (local persistence) and restore state automatically on load.
- **FR-024**: Cart icon/component MUST display current total item count (sum of quantities) and reflect updates within 1 second of change.
- **FR-025**: Order submission MUST create an immutable order snapshot containing id, items (productId, name, price at time of submission, quantity), total, status = "submitted", and created timestamp. Snapshot captured BEFORE any stock decrement and independent of post-submission mutations.
- **FR-026**: Order confirmation view MUST present order id, item list, per-item subtotals, and total.
- **FR-027**: System MUST prevent order submission with an empty cart.
- **FR-028**: Backend logic MUST compute order total as sum(quantity * price) for all items, then apply a single rounding step to two decimals (banker's rounding not required; use standard half-up). Centralize in a helper (see task T122) to avoid precision drift.
- **FR-029**: Search and cart operations MUST maintain accessibility (focus states, ARIA labels) consistent with existing standards.
- **FR-030**: Tests MUST cover: product search/filter behaviors, category CRUD flows (including blocked deletion), cart state updates, cart persistence, and order creation snapshot integrity.
- **FR-031**: (Reserved; consolidated into FR-012 to remove duplication.)
- **FR-032**: Deleting a category with assigned products MUST be blocked with a clear explanation (assumption) rather than silent failure.
- **FR-033**: Product entity MUST include imageUrl (non-empty string) representing a relative or absolute path to an image asset; all product-related API responses MUST include a non-empty imageUrl for each product. (Consolidates prior FR-035.)
- **FR-034**: Seed process MUST assign deterministic placeholder image filenames following pattern product<N>.jpg starting at 1 and stable across runs.
- **FR-035**: (Reserved; consolidated into FR-033 to avoid duplication.)
- **FR-036**: Product display MUST render an accessible image for each product using alt text equal to the product name; fallback placeholder variant MUST use exact pattern: `<product name> – image unavailable` (en dash, single space on both sides) when original missing/broken.
- **FR-037**: Product images MUST render inside a fixed 200x200px square container (e.g., Tailwind `w-[200px] h-[200px]` or utility abstraction) using object-cover to preserve aspect ratio without distortion; responsive scaling MAY reduce size below 200px on narrow viewports but MUST preserve square aspect (width = height). Tests MUST assert container square dimensions and absence of distortion.
- **FR-038**: Layout MUST remain responsive: images scale down with max-width: 100% rules, avoiding overflow at all supported breakpoints.
- **FR-039**: A fallback placeholder image (asset path `public/images/fallback.jpg`) MUST display whenever imageUrl is missing or fails to load without causing layout shift beyond reserved 200x200px space.
- **FR-040**: Image rendering MUST not regress existing accessibility (focus order, alt text presence, contrast unaffected).
- **FR-041**: Tests MUST validate image requirements (presence per FR-033, deterministic pattern FR-034, alt text FR-036, dimensions FR-037, fallback FR-039, broken image swap FR-042). (Clarified as test coverage aggregation; not a separate functional rule.)
- **FR-042**: Broken image load events MUST trigger automatic fallback substitution within 1 second.
**FR-043**: Order submission MUST atomically decrement product stock for each line item (never producing negative stock); MUST reject the order with a 409 if any requested quantity exceeds current stock; MUST maintain snapshot immutability independent of post-submission stock changes. Chosen implementation: single MongoDB `bulkWrite` with per-line conditional filters `{ stock: { $gte: quantity } }`; if any filter fails all updates abort (no partial fulfillment). Concurrency mitigation: second order after stock exhaustion returns 409.
 - **FR-044**: Navigation banner MUST display Shoply brand name and logo image with accessible alt text ("Shoply logo").
 - **FR-045**: Navigation MUST provide buttons/links for Products and CategoryManagement pages enabling view switching without full page reload.
 - **FR-046**: Order confirmation modal MUST provide two accessible dismissal controls: top-right close (×) and a "Close" action button.
 - **FR-047**: All seeded products MUST include non-empty imageUrl and non-negative stock fields (example: some initial products may use stock 5) and remain idempotent on reseeding (applies to full ≥20 product seed set, not only first 5).
 - **FR-048**: CategoryManagement page MUST be reachable via navigation and render its management heading after activation.
 - **FR-049**: New/updated UI elements (brand/logo, navigation buttons, modal Close button) MUST meet accessibility standards (focus order, roles/ARIA, alt text, keyboard operability).
 - **FR-050**: Acceptance tests MUST cover: dual modal dismissal (each independently closes and restores focus), navigation switching (Products ↔ Categories), presence of Shoply brand & logo, and backend product response including imageUrl & stock ≥ 0.
 - **FR-051** (updated): Category write operations (POST, PUT, DELETE) MUST be restricted to authenticated admin users. Unauthorized attempts return 403 JSON `{ "error": "Admin access required" }` and perform no mutation. Reads/list remain public.
 - **FR-052**: ProductManagement CRUD interface MUST be accessible only to authenticated admin users; anonymous attempts to access page or invoke POST/PUT/DELETE product endpoints return 403 JSON `{ "error": "Admin access required" }`.
 - **FR-053**: Admin users MUST be able to update product stock ensuring resulting value is a non-negative integer; attempts to set stock < 0 are rejected with validation messaging (no partial update).
 - **FR-054**: All admin product CRUD operations (create, update, delete) MUST complete within ≤ 2 seconds (p95 in typical environment) and return appropriate status codes: 201 create, 200 update, 204 delete, 400 validation failure, 403 unauthorized, 404 not found.
 - **FR-055**: Category create/update MUST enforce case-insensitive name uniqueness; duplicates (including those differing only by case) return 409 JSON `{ "error": "Category name already exists" }` with no mutation.
 - **FR-056**: Order persistence MUST NOT include customer PII (email, name, address, phone). Incoming payloads containing any such fields MUST be rejected with 400 validation and not stored; orders remain anonymous.
 - **FR-057**: System MUST provide a unified admin login endpoint `POST /api/auth/login` issuing a JWT containing role `admin`, `iat`, and `exp` claims with a 1 hour expiry.
 - **FR-058**: Authenticated admin session state (role, authenticated flag, token reference) MUST persist across page reloads until explicit logout or token expiry; logout MUST clear all persisted state.
 - **FR-059**: Admin-only areas (CategoryManagement, ProductManagement) MUST enforce access control and present branded "Access Denied" messaging (or safe redirect) to non-admin users without rendering privileged controls.
 - **FR-060**: All unauthorized protected write attempts (category/product POST/PUT/DELETE by anonymous, non-admin, or expired token) MUST return a consistent structured JSON error body with machine-readable `error` and human-readable `message` fields and produce zero mutations.

### Error Codes (Structured Responses)

All protected and validation error responses MUST use the standardized JSON schema:

```json
{ "error": "<machine_code>", "message": "<human readable actionable text>" }
```

Canonical machine codes for this phase:
- `admin_auth_required` – Missing/invalid/expired token when admin authentication is required (status 401).
- `forbidden_admin_role` – Authenticated token present but lacks required admin role (status 403).
- `invalid_credentials` – Login attempt failed (status 401).
- `token_expired` – Token recognized but `exp` is in the past (status 401).
- `validation_error` – Request body failed schema/business validation (status 400).
- `category_name_conflict` – Case-insensitive duplicate category name on create/update (status 409).
- `stock_conflict` – Order line(s) insufficient stock during atomic decrement (status 409).
- `insufficient_stock` – Same as `stock_conflict` (alias kept for clarity in order endpoint tests; may consolidate later) (status 409).
- `unauthorized_write` – Generic fallback for protected write when specific code above not emitted (status 403).
- `not_found` – Entity requested but not found (status 404) (optional message wording).

Status code decision tree (protected write):
1. No/invalid signature OR expired → 401 `admin_auth_required` or `token_expired` (explicit expiry case).
2. Valid token, role != admin → 403 `forbidden_admin_role`.
3. Valid admin token, business validation fails → 400 `validation_error`.
4. Valid admin token, domain conflict (e.g., delete category with products) → 409 domain-specific code (`category_name_conflict`, `stock_conflict`).

FR-058 Clarification: Storage key MUST be `shoply_admin_token`; logout MUST clear this key and any derived user state (role, exp) and redirect focus to the login page heading.
FR-059 Clarification: "Safe redirect" means client navigates to `/login?denied=<resource>` OR renders inline AccessDenied component retaining accessible focus management; implementation MUST avoid flashing privileged controls (no intermediate render).
FR-060 Clarification: All emitted error codes MUST appear in the table above; tests assert schema shape and membership (SC-033).

Edge Case Addition: Token expiry mid-request results in auth middleware treating token as expired (status 401 `token_expired`); no partial write occurs.

### Key Entities *(include if feature involves data)*

- **Product**: An item in the catalog with attributes:
  - id: UUID string (immutable)
  - name: string
  - description: string
  - price: decimal number (two decimal places)
  - createdAt: ISO date-time string
  - updatedAt: ISO date-time string
  - categoryId: string (references Category id; optional if uncategorized)
  - stock: non-negative integer/number (0 indicates out of stock)
  - imageUrl: non-empty string (placeholder or actual asset path)

- **Category**: Organizational label applied to products.
  - id: UUID or unique string
  - name: string (case-insensitive unique; duplicates differing only by case rejected with 409 Conflict)
  - Performance & Feedback References: SC-007 (≤2s p95 for allowed create/update/delete) and SC-013 (explanatory messaging for 100% blocked deletions when products assigned)

- **CartItem**: A shopper-selected intended purchase item.
  - productId: Product id
  - name: snapshot of product name at time added (for resilience against later changes)
  - price: snapshot of product price at time added
  - quantity: integer ≥ 1

- **Order**: Immutable record of submitted cart.
  - id: unique string
  - items: array of { productId, name, price, quantity }
  - total: decimal (two decimals)
  - status: "submitted" (only state in this phase)
  - createdAt: ISO date-time string
  - PII: none (no email/name/address/phone captured in this phase)

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 95% of catalog page loads complete in ≤ 2 seconds in the "typical environment" (local Docker Compose, loopback latency <10ms, no artificial throttling).
- **SC-002**: 99% of API responses for GET /api/products complete in ≤ 1 second in the typical environment (local Docker Compose, seeded DB, no throttling, ≤200 products).
- **SC-003**: 100% of visible prices display a currency symbol and exactly two decimal places.
- **SC-004**: 0 critical accessibility violations in automated checks; keyboard navigation covers primary flows.
- **SC-005**: On first run, at least five products are visible without manual data entry.
- **SC-006**: 100% of failed GET /api/products requests increment the error counter; a single seed verification log entry appears at startup; 95% of request log entries include status and duration.
- **SC-007**: 95% of category management operations (create, update, delete allowed) complete in ≤ 2 seconds in typical environment.
- **SC-008**: 100% attempts to add out-of-stock items are blocked with clear messaging.
- **SC-009**: 95% of valid cart modifications (add/update/remove) persist and restore after refresh in ≤ 1 second.
- **SC-010**: 100% order totals reflect accurate sum of line items with correct rounding to two decimals (no cumulative precision drift > $0.01 across 100 sequential orders).
- **SC-011**: 95% of search/filter interactions return updated results view in ≤ 1 second given ≤ 200 products.
- **SC-012**: Zero critical accessibility violations introduced by new cart, search, and category UI components.
- **SC-013**: 100% of blocked category deletions (with assigned products) provide explanatory feedback.
- **SC-014**: 100% orders retain original item prices despite subsequent product price changes (verified after mutating product price post-submission).
- **SC-015**: 100% products returned from list endpoint include a non-empty imageUrl field.
- **SC-016**: 100% product cards display an image or fallback without broken image icon artifacts.
- **SC-017**: 100% missing or broken images show fallback within ≤ 1 second of detection.
- **SC-018**: 95% catalog page loads display all images/fallbacks in ≤ 2 seconds (typical environment) with cumulative layout shift (CLS) < 0.1 and no content overlap.
- **SC-019**: Zero critical accessibility violations introduced by images (all have alt text meeting specified rules and fallback alt pattern correctness).
- **SC-020**: 0% of image renderings cause horizontal scroll at standard breakpoints.
 - **SC-021**: 100% sampled products (≥5) include non-empty imageUrl and stock ≥ 0.
 - **SC-022**: 100% initial catalog views display Shoply brand name, logo, and navigation controls.
 - **SC-023**: Navigation view switches (Products ↔ Categories) median latency ≤ 200ms and p95 latency ≤ 400ms over ≥50 consecutive switches in typical environment.
 - **SC-024**: 100% order confirmations present both dismissal controls (× and Close) and either control dismisses with correct focus behavior.
 - **SC-025**: 100% category write attempts by anonymous (non-admin) users return 403 and perform no data mutation.
 - **SC-026**: 100% ProductManagement access attempts by anonymous users are blocked with 403 and actionable messaging (no mutation).
 - **SC-027**: 100% admin stock updates persist and never produce negative stock; invalid (<0) attempts rejected with clear message.
 - **SC-028**: 95% admin product CRUD operations complete within ≤ 2 seconds (p95) under typical environment conditions.
 - **SC-029**: 100% unauthorized protected write attempts (category/product POST/PUT/DELETE by anonymous, non-admin, or expired user state) return 403 with branded structured error body and produce zero mutations.
 - **SC-030**: 100% expired admin token attempts to perform protected writes result in 401 (invalid/expired) or 403 (unauthorized) and zero mutations; successful re-login restores access immediately.
 - **SC-031**: 95% cart add/update/remove interactions reflect updated UI state (icon count, totals) in ≤ 500ms in typical environment.
 - **SC-032**: 95% successful order submissions display confirmation modal with snapshot details in ≤ 1 second in typical environment.
 - **SC-033**: 100% unauthorized protected write responses use documented error codes and structured `{ error, message }` body.
 - **SC-034**: 100% expired token admin page access attempts hide privileged controls and show Access Denied messaging without flicker.

## Assumptions

- Currency symbol: USD ($) for this phase. Future localization may adjust.
 - RBAC introduced: two roles (anonymous, admin). Anonymous retains browse/search/cart/order; admin gains category & product CRUD.
- Persistent storage available per project deployment environment.
- Product volume ≤ 200 items; single-page list with no pagination.
- Long product names/descriptions should wrap across lines (no truncation required in MVP).
- “Typical load” for performance measurements refers to local development with Docker Compose, seeded database, and no network throttling.
- Category deletion is blocked if any products reference the category (chosen for data integrity in absence of cascade rule).
- Category names are enforced case-insensitive unique; duplicates (including those differing only by case) return 409 with JSON error `{ "error": "Category name already exists" }`.
 - Orders are anonymous: no customer PII stored (reduces compliance scope for MVP).
 - Authentication mechanism uses a simplified login (stub) via `POST /api/auth/login` returning a JWT with role claim; no legacy environment flag gating is used; full multi-user auth deferred.
 - Prior assumption of open CRUD without authentication is overridden: only authenticated admin may perform category or product create/update/delete.
- No pricing adjustments (tax, discounts, promotions) applied; totals are simple sums.
- Stock decrementation on order submission is in scope: orders reduce stock atomically; insufficient stock rejects order (no partial fulfillment).
- No pagination required up to 200 products, search expected to be instantaneous within success criteria.
- Cart storage uses a client-side persistence mechanism (e.g., browser storage) without server synchronization (technology details omitted in spec).
- Only single currency (USD) throughout extended features.
- Placeholder image assets exist in a static/public location; spec does not define storage technology.
- No image upload or management in this phase; images are read-only references.
- Fallback image is a single shared asset for all missing/broken cases.
- Square target dimension (visual box) is consistent reference for layout; exact pixel size may adapt per responsive design (200x200 illustrative).
- Fallback image asset path standardized as `public/images/fallback.jpg`.
 - Navigation switching is client-side state only (no router dependency required this phase) and performance target defined (SC-023 median ≤200ms, p95 ≤400ms).
 - Logo asset is a static SVG placed in public images directory.
 - Dual modal dismissal requires no confirmation; future enhancement may add animations.
 - Category/Product administration enforcement derives solely from user state (JWT role claim) validated on each protected request; unauthorized attempts receive consistent branded 403 error.
 - Admin authentication login endpoint is standardized to a unified `POST /api/auth/login` that issues a JWT for admins (role claim `admin`).
 - Admin JWT lifetime is 1 hour; operations after expiry require re-login (no silent refresh cycle in scope).
 - Fallback alt text MUST use en dash (–) in pattern `<product name> – image unavailable`.
