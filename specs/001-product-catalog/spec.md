# Feature Specification: Product Catalog

**Feature Branch**: `001-product-catalog`  
**Created**: 2025-11-10  
**Status**: Draft  
**Input**: User description: "Product Catalog app: frontend lists products (name, description, price), fetch from API; backend exposes GET /api/products returning JSON; persistent DB with 'products' collection; preload at least 5 sample products; clean responsive accessible UI; prices formatted to 2 decimals; tests in frontend/src/__tests__/ and backend/tests/."

## Clarifications

### Session 2025-11-20

- Q: What is the product search matching rule? → A: Case-insensitive partial substring match across both name and description fields; multiple words treated as a single phrase (no token AND logic).
- Q: What pattern is used for seeded product images? → A: Deterministic placeholder filenames using the pattern "product<N>.jpg" starting at 1 (e.g., product1.jpg) matching seed insertion order; stable across runs.

### Session 2025-11-14

- Q: What is the expected product list size and pagination approach? → A: Up to 100 items, no pagination.
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

1. Given seeded products exist, When I open the catalog, Then I see a list of products with name, description, and price.
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

1. Given I use only a keyboard, When navigating the page, Then I can reach product items and controls in a logical order.
2. Given a small screen, When viewing the catalog, Then layout adapts without horizontal scrolling.

---

[Add more user stories as needed, each with an assigned priority]

### User Story 4 - Manage Categories (Priority: P4)

As a catalog maintainer (non-authenticated in this phase), I can view, create, edit, and remove product categories so that products can be organized for shopper filtering.

**Independent Test**: Populate several categories; perform create, edit, delete; verify list updates and constraints honored.

**Acceptance Scenarios**:

1. Given categories exist, When I open the category management view, Then I see a list showing id and name.
2. Given I enter a valid category name, When I submit the create form, Then the new category appears in the list.
3. Given a category has no assigned products, When I delete it, Then it is removed from the list.
4. Given a category has assigned products, When I attempt deletion (per assumption), Then the system prevents deletion and shows a clear message.

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

1. Given my cart contains valid items, When I place the order, Then I see a confirmation with order id, items, quantities, and total.
2. Given I have just placed an order, When I revisit the order confirmation, Then data matches submission snapshot (quantity, total) even if product catalog changes afterwards.
3. Given my cart is empty, When I attempt to place an order, Then the system prevents submission and shows guidance to add items.

### User Story 8 - View Product Images (Priority: P4)

As a shopper, I can see a product image alongside its name, description, price, and stock status so that I can visually assess items quickly.

**Independent Test**: Load catalog with seeded products; verify each product card shows image with correct alt text; simulate missing imageUrl to see fallback.

**Acceptance Scenarios**:

1. Given a product has an imageUrl, When the catalog loads, Then its image displays with consistent dimensions and alt text equal to the product name.
2. Given a product image fails to load or imageUrl is missing, When the catalog loads, Then a fallback placeholder image of the same dimensions displays with alt text indicating the product name plus "image unavailable".
3. Given viewport changes (mobile to desktop), When images resize, Then aspect ratio is preserved and layout remains stable (no overlap or distortion).

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
- Extremely long product name impacting alt text readability (wrap without truncation)
- Image loading slower than text (text appears first; layout reserves space to prevent shift)
- Mixed presence of images and fallbacks in the same view

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
- **FR-008**: System MUST preload at least five sample products available on first run.
- **FR-009**: Frontend tests MUST reside in frontend/src/__tests__/ covering rendering, formatting, and accessibility.
- **FR-010**: Backend tests MUST reside in backend/tests/ covering unit logic, integration for the endpoint, and seed validation.
- **FR-011**: System MUST log each GET /api/products request with status code and duration, emit a one-time startup seed verification log entry, and increment an error counter metric on failed requests.
- **FR-012**: MVP assumes up to 100 products returned by the list endpoint and no pagination; the UI presents a single-page list.
- **FR-013**: System MUST expose simple health endpoints for frontend and backend to support container healthchecks.
- **FR-014**: Product entity MUST include categoryId (string) and stock (non-negative integer/number) fields; stock values < 0 MUST be rejected.
- **FR-015**: System MUST display stock status as "In Stock" when stock > 0 and "Out of Stock" when stock = 0.
- **FR-016**: System MUST prevent adding out-of-stock products or quantities greater than available stock to the cart.
- **FR-017**: System MUST allow creation, viewing, listing, updating, and deletion of categories (subject to assumption blocking deletion when products assigned).
- **FR-018**: Category list MUST display id and name and provide edit and delete actions.
- **FR-019**: Category form MUST require a non-empty name and show validation feedback on submit failure.
- **FR-020**: Product browsing MUST support case-insensitive partial substring text search across name and description and filtering by category independently and in combination; multiple words are matched as one contiguous phrase.
- **FR-021**: System MUST show a distinct zero-results message when search/filter returns no matches (different from empty catalog initial state).
- **FR-022**: Cart MUST support add, remove, quantity update, and clear behaviors via user interactions.
- **FR-023**: Cart MUST persist across browser refresh (local persistence) and restore state automatically on load.
- **FR-024**: Cart icon/component MUST display current total item count (sum of quantities) and reflect updates within 1 second of change.
- **FR-025**: Order submission MUST create an immutable order snapshot containing id, items (productId, name, price at time of submission, quantity), total, status = "submitted", and created timestamp.
- **FR-026**: Order confirmation view MUST present order id, item list, per-item subtotals, and total.
- **FR-027**: System MUST prevent order submission with an empty cart.
- **FR-028**: Backend logic MUST compute order total as sum(quantity * price) for all items and round to two decimals.
- **FR-029**: Search and cart operations MUST maintain accessibility (focus states, ARIA labels) consistent with existing standards.
- **FR-030**: Tests MUST cover: product search/filter behaviors, category CRUD flows (including blocked deletion), cart state updates, cart persistence, and order creation snapshot integrity.
- **FR-031**: System MUST handle up to 200 products without requiring pagination (performance expectation maintained).
- **FR-032**: Deleting a category with assigned products MUST be blocked with a clear explanation (assumption) rather than silent failure.
- **FR-033**: Product entity MUST include imageUrl (non-empty string) representing a relative or absolute path to an image asset.
- **FR-034**: Seed process MUST assign deterministic placeholder image filenames following pattern product<N>.jpg starting at 1 and stable across runs.
- **FR-035**: All product-related API responses MUST include imageUrl for each product.
- **FR-036**: Product display MUST render an accessible image for each product using alt text equal to product name (fallback variant includes suffix "image unavailable" when original missing/broken).
- **FR-037**: Product images MUST present consistent square display dimensions (e.g., target 200x200 visual box) while preserving aspect ratio via cover-style cropping; no distortion allowed.
- **FR-038**: Layout MUST remain responsive: images scale down with max-width: 100% rules, avoiding overflow at all supported breakpoints.
- **FR-039**: A fallback placeholder image MUST display whenever imageUrl is missing or fails to load without causing layout shift beyond reserved space.
- **FR-040**: Image rendering MUST not regress existing accessibility (focus order, alt text presence, contrast unaffected).
- **FR-041**: Tests MUST validate presence and validity of imageUrl in product API responses, correct seeding pattern, ProductCard image rendering, fallback behavior, and responsive dimension integrity.
- **FR-042**: Broken image load events MUST trigger automatic fallback substitution within 1 second.

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
  - name: string (unique within catalog; assumption)

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

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: 95% of catalog page loads complete in ≤ 2 seconds on a typical connection.
- **SC-002**: 99% of API responses for GET /api/products complete in ≤ 1 second under typical load (defined as local Docker Compose environment, seeded DB, no artificial network throttling).
- **SC-003**: 100% of visible prices display a currency symbol and exactly two decimal places.
- **SC-004**: 0 critical accessibility violations in automated checks; keyboard navigation covers primary flows.
- **SC-005**: On first run, at least five products are visible without manual data entry.
- **SC-006**: 100% of failed GET /api/products requests increment the error counter; a single seed verification log entry appears at startup; 95% of request log entries include status and duration.
- **SC-007**: 95% of category management operations (create, update, delete allowed) complete in ≤ 2 seconds in typical environment.
- **SC-008**: 100% attempts to add out-of-stock items are blocked with clear messaging.
- **SC-009**: 95% of valid cart modifications (add/update/remove) persist and restore after refresh in ≤ 1 second.
- **SC-010**: 100% order totals reflect accurate sum of line items with correct rounding to two decimals.
- **SC-011**: 95% of search/filter interactions return updated results view in ≤ 1 second given ≤ 200 products.
- **SC-012**: Zero critical accessibility violations introduced by new cart, search, and category UI components.
- **SC-013**: 100% of blocked category deletions (with assigned products) provide explanatory feedback.
- **SC-014**: 100% orders retain original item prices despite subsequent product price changes.
- **SC-015**: 100% products returned from list endpoint include a non-empty imageUrl field.
- **SC-016**: 100% product cards display an image or fallback without broken image icon artifacts.
- **SC-017**: 100% missing or broken images show fallback within ≤ 1 second of detection.
- **SC-018**: 95% catalog page loads display all images/fallbacks in ≤ 2 seconds (typical connection) without cumulative layout shift causing content overlap.
- **SC-019**: Zero critical accessibility violations introduced by images (all have alt text meeting specified rules).
- **SC-020**: 0% of image renderings cause horizontal scroll at standard breakpoints.

## Assumptions

- Currency symbol: USD ($) for this phase. Future localization may adjust.
- Single catalog view only; no CRUD or authentication in this iteration.
- Persistent storage available per project deployment environment.
- Product volume ≤ 100 items; single-page list with no pagination.
- Long product names/descriptions should wrap across lines (no truncation required in MVP).
- “Typical load” for performance measurements refers to local development with Docker Compose, seeded database, and no network throttling.
- Category deletion is blocked if any products reference the category (chosen for data integrity in absence of cascade rule).
- Category names are unique within the catalog (simplifies user recognition).
- No authentication or user accounts in this phase; all actions treated as open access within session.
- No pricing adjustments (tax, discounts, promotions) applied; totals are simple sums.
- Stock decrementation on order submission is out of scope (inventory not mutated).
- No pagination required up to 200 products, search expected to be instantaneous within success criteria.
- Cart storage uses a client-side persistence mechanism (e.g., browser storage) without server synchronization (technology details omitted in spec).
- Only single currency (USD) throughout extended features.
- Placeholder image assets exist in a static/public location; spec does not define storage technology.
- No image upload or management in this phase; images are read-only references.
- Fallback image is a single shared asset for all missing/broken cases.
- Square target dimension (visual box) is consistent reference for layout; exact pixel size may adapt per responsive design (200x200 illustrative).
