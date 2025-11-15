# Product Catalog (SDD Weekly Project)

⚠️ This is a milestone submission for the SDD Weekly Project, not the Final Project version.  

The Product Catalog is a simple web application that displays a list of products with names, descriptions, and prices. It fetches data from a backend API and presents it in a responsive, accessible interface. The app includes unit tests for frontend and backend, ensuring functionality and code quality. It is fully built using **GitHub Spec Kit**, with no manual coding, allowing automated generation of components, tasks, and tests.

This document follows the **Spec Kit Detailed Workflow**:

> Initialize → Constitution → Specify → Plan → Tasks → Implement (via Agents) → Validate → Containerize & Deploy → Document Everything

It outlines each step of the build process, including commands, validations, and output artifacts.


## 📌 Navigation

- [Design Artifacts](#design-artifacts)
- [Specification (SDD)](#specification-sdd)
  - [Goals & Why](#goals--why)
  - [Functional Requirements](#functional-requirements)
  - [Non-Functional Requirements](#non-functional-requirements)
- [User Journeys](#user-journeys)
- [Constraints (Constitution)](#constraints-constitution)
- [Plan → Tasks → Implement](#plan--tasks--implement)
  - [Plan](#plan)
  - [Tasks](#tasks)
  - [Implement](#implement)
- [Build Log](#build-log)
  - [Conversion of Design Artifacts to Spec](#1-conversion-of-design-artifacts-to-spec)
  - [Spec Kit Commands, Validation, Agent Handoffs](#2-spec-kit-commands-validation-agent-handoffs)
  - [Iteration Summary](#3-iteration-summary)
  - [Screenshots](#4-screenshots)
- [Containerize & Deploy](#containerize--deploy)


<h2 id="design-artifacts">📦 Design Artifacts</h2>

The Product Catalog System design artifacts were systematically transformed into actionable specifications using Spec Kit. Each artifact informs functional and non-functional requirements, API schema, frontend components, and automated tasks.

| Artifact            | Description                                                                                                      | Link                                                                  |
| ------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Class Diagram       | Represents the core data model, including the `Product` class and attributes.                                    | [class-diagram.png](/docs/design-artifacts/class-diagram.png)         |
| Component Diagram   | Shows high-level components: UI, Backend, Database, and their interactions.                                      | [component-diagram.png](/docs/design-artifacts/component-diagram.png) |
| Sequence Diagram    | Illustrates interactions between the User and Product Catalog App for requesting and displaying product details. | [sequence-diagram.png](/docs/design-artifacts/sequence-diagram.png)   |
| Use Case Diagram    | Depicts primary and secondary use cases, including “View Product List” and handling empty/loading/error states.  | [use-case-diagram.png](/docs/design-artifacts/use-case-diagram.png)   |
| Constitution Prompt | Defines project rules, constraints, and architecture principles for Spec Kit.                                    | [constitution.txt](/docs/ai-prompts/constitution.txt)                    |
| Specify Prompt      | Instructs the agent to create functional requirements, API contracts, and component definitions.                 | [specify.txt](/docs/ai-prompts/specify.txt)                              |
| Plan Prompt         | Guides the agent to generate a structured plan and gated phases for specification and implementation.            | [plan.txt](/docs/ai-prompts/plan.txt)                                    |



<h2 id="specification-sdd">📊 Specification (SDD)</h2>

<h3 id="goals--why">Goals & Why</h3>

The primary goal is to provide an **intuitive, accessible, and responsive experience** for users browsing products. The system fully leverages GitHub Spec Kit for automated generation, ensuring consistency, reducing human error, and accelerating development.

1. **Display Product Information**: Users can view products with name, description, and price.
   *Why*: Core functionality, ensures informed decisions.

2. **Responsive UI**: Interface must be intuitive, visually appealing, and display products correctly.
   *Why*: Fast, responsive UI improves user experience; page load <2s.

3. **Error Handling**: Display "No products available" if no products exist.
   *Why*: Provides clear user guidance during failures.

4. **Accessibility**: Full keyboard navigation and ARIA compliance.
   *Why*: Broadens potential user base to include users with disabilities.

5. **Performance**: API <1s, UI load <2s.
   *Why*: Crucial for user satisfaction and engagement.



<h3 id="functional-requirements">Functional Requirements</h3>

| ID     | Requirement                                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------------------------- |
| FR-001 | Display products with name, description, and price.                                                                 |
| FR-002 | Fetch products from API and render results.                                                                         |
| FR-003 | Format prices with currency symbol and two decimal places.                                                          |
| FR-004 | Provide loading, empty, and error states.                                                                           |
| FR-005 | Meet accessibility standards (keyboard, ARIA, color contrast).                                                      |
| FR-006 | Backend exposes `GET /api/products` returning JSON: `id`, `name`, `description`, `price`, `createdAt`, `updatedAt`. |
| FR-007 | Database must persist products.                                                                                     |
| FR-008 | Seed at least 5 sample products on first run.                                                                       |
| FR-009 | Frontend tests: rendering, formatting, accessibility.                                                               |
| FR-010 | Backend tests: unit logic, endpoint integration, seed verification.                                                 |
| FR-011 | Observability: log requests, startup seed verification, error metrics.                                              |
| FR-012 | Single-page UI, up to 100 products, no pagination.                                                                  |
| FR-013 | Health endpoints for frontend and backend container healthchecks.                                                   |



<h3 id="non-functional-requirements">Non-Functional Requirements</h3>

| ID      | Requirement                                                                                  |
| ------- | -------------------------------------------------------------------------------------------- |
| NFR-001 | Performance: API ≤1s, page load ≤2s, handle 1,000 calls <300ms under load.                   |
| NFR-002 | Accessibility: keyboard, ARIA, responsive layout (desktop, tablet, mobile).                  |
| NFR-003 | Reliability: graceful error handling, logging of requests and status codes.                  |
| NFR-004 | Security: future CRUD must require authentication and authorization.                         |
| NFR-005 | Maintainability: unit/integration tests, modular architecture, clear separation of concerns. |



<h2 id="user-journeys">🧾 User Journeys</h2>

### Use Case 1 – View Product List

* **Goal**: Shopper browses available products.
* **Actors**: Shopper
* **Steps**:

  1. Open catalog page.
  2. System retrieves product list from API.
  3. Display products (name, description, price).
  4. Layout adapts to device screen.
* **Acceptance**: All seeded products visible; page load ≤2s.

### Use Case 2 – Handle Loading, Empty, Error States

* **Goal**: Shopper wants feedback while loading, empty, or error states.
* **Steps**:

  1. Loading indicator while API request pending.
  2. Show "No products available" if empty.
  3. Show actionable error message if API fails.
* **Acceptance**: Clear feedback in all states.

### Use Case 3 – Accessibility & Responsiveness

* **Goal**: Shopper with assistive tech or mobile device can navigate catalog.
* **Steps**:

  1. Navigate using keyboard only.
  2. Use screen reader; details exposed correctly.
  3. Layout adapts to small screen.
* **Acceptance**: Full keyboard/screen reader access; responsive layout.



<h2 id="constraints-constitution">📊 Constraints (Constitution)</h2>

1. **Fixed Stack**: Must use specified frameworks; deviations require Constitution amendment.
2. **Code Quality & Testing**: ≥80% coverage; tests run automatically in CI; all tests must pass.
3. **Continuous Integration**: All branches pass CI, including linting, formatting, tests.
4. **Development Workflow**: Tasks follow MVP-first prioritization, small units, PR compliance.
5. **Governance & Versioning**: Amendments require PR with rationale; Constitution is authoritative.

*Rationale*: Ensures consistency, reliability, reproducibility, and governance adherence.



<h2 id="plan--tasks--implement">🛠️ Plan → Tasks → Implement</h2>

<h3 id="plan">Plan</h3>

- **API & Storage**: TypeScript + Express API `GET /api/products` with MongoDB.
- **Data Contracts**: Product schema (`id`, `name`, `description`, `price`) with OpenAPI specification.
- **Frontend**: React 18 + Vite + TailwindCSS; responsive, accessible product list.
- **Seeding**: ≥5 sample products, idempotent insertion.
- **Performance & Constraints**: ≤100 products, no pagination; UI render ≤2s, API ≤1s.

<h3 id="tasks">Tasks</h3>

| Task                           | Description                                  | User Story | Notes                                           |
| ------------------------------ | -------------------------------------------- | ---------- | ----------------------------------------------- |
| Create Products API            | `GET /api/products` with MongoDB integration | US1        | Match JSON schema                               |
| Seed Sample Products           | Idempotent insertion of ≥5 products          | US1        | Include UUID, price formatting                  |
| Frontend Product List UI       | Display products, responsive, accessible     | US1        | Components: ProductCard, Loading, ErrorMessage, EmptyState |
| Loading / Empty / Error States | Handle latency, empty results, and errors    | US2        | Visual feedback, keyboard focus, ARIA labels   |
| Unit & Integration Tests       | Backend & frontend, ≥80% coverage            | US1 + US2  | Jest + Supertest (backend), Vitest + RTL (frontend) |
| Observability & Logging        | Track API calls, errors, seed verification   | All        | Debugging, performance monitoring               |

<h3 id="implement">Implement</h3>

- Spec Kit agent executes tasks automatically based on templates.
- Implementation strictly follows Core Principles, Constraints, and NFRs.
- Continuous Integration ensures all tasks pass tests before merge/deploy.
- Observability and coverage checks are verified at build time.

*Rationale*: Ensures a repeatable, automated development pipeline that delivers a performant, accessible MVP.



<h2 id="build-log">📝 Build Log</h2>

<h3 id="1-conversion-of-design-artifacts-to-spec">1. Conversion of Design Artifacts to Spec</h3>

* Class Diagram → Backend schema + frontend TypeScript interfaces
* Component Diagram → Frontend components + backend routes
* Sequence Diagram → API endpoints + frontend state management
* Use Case Diagram → User stories, acceptance criteria
* Prompts ([Constitution](/docs/ai-prompts/constitution.txt), [Plan](/docs/ai-prompts/plan.txt), [Specify](/docs/ai-prompts/specify.txt)) guided agent to structured spec and tasks


<h3 id="2-spec-kit-commands-validation-agent-handoffs">2. Spec Kit Commands, Validation, Agent Handoffs</h3>

| Command                 | Description                                                                         | Validation                                                                                      | Agent Handoff                                           |
| ----------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| `/speckit.constitution` | Initialize project rules, constraints, architecture principles                      | • Verified rules applied in subsequent phases                                                  | GPT-5 generates constitution                             |
| `/speckit.specify`      | Converts artifacts into functional requirements, API contracts, frontend components | • Confirm FR-001 → FR-013 completed<br>• Endpoints, props, flows mapped<br>• `[Needs Clarification]` marked | GPT-5 generates `spec.md` and API YAML                  |
| `/speckit.clarify`      | Resolves `[Needs Clarification]` markers                                            | • Ambiguities resolved<br>• Spec coherent and traceable                                        | GPT-5 updates `spec.md`                                 |
| `/speckit.plan`         | Generates gated plan for specification, tasks, implementation                       | • Completeness reviewed<br>• Task sequencing validated<br>• Dependencies verified              | GPT-5 produces `plan.md`                                 |
| `/speckit.tasks`        | Breaks spec into discrete implementation tasks                                      | • Tasks validated against requirements<br>• Executed in batches                                  | GPT-5 outputs task list                                  |
| `/speckit.analyze`      | Reviews app for issues (severity: severe/high/medium)                               | • Code quality checked<br>• Coverage verified<br>• Spec compliance checked<br>• Severe/high/medium issues resolved | GPT-5 identifies issues pre-implementation             |
| `/speckit.implement`    | Implements code based on tasks and spec                                             | • Frontend/backend functionality verified<br>• State management correct<br>• MongoDB schema & seed artifacts generated<br>• All batch tasks implemented<br>• CI tests pass, coverage ≥80% | GPT-5 generates frontend/backend code and MongoDB artifacts |


<h3 id="3-iteration-summary">3. Iteration Summary</h3>

* Plan adjustments: task sequencing/dependencies refined
* Spec refinement: FR clarifications via `/clarify`
* Task re-batching: smaller batches per agent recommendations
* Validation feedback loop: `/analyze` feedback led to updates in plan/tasks
* Traceability improvements: enhanced links between artifacts, FRs, tasks


<h3 id="4-screenshots">4. Screenshots</h3>

* [**API Products Response 1**](/docs/screenshots/api-products-1.jpg) – Products API request with response headers.
* [**API Products Response 2**](/docs/screenshots/api-products-2.jpg) – JSON payload response of products from the API.
* [**Container Logs**](/docs/screenshots/container-logs.jpg) – Docker logs showing activity.
* [**Docker Build**](/docs/screenshots/docker-build.jpg) – Successful build output of frontend, backend, and MongoDB containers.
* [**Error State**](/docs/screenshots/error-state.jpg) – Frontend display when API fails.
* [**Loading State**](/docs/screenshots/loading-state.jpg) – Frontend display while API request is in progress.
* [**MongoDB Documents**](/docs/screenshots/mongo-documents.jpg) – Snapshot of seeded products stored in MongoDB.
* [**Product List**](/docs/screenshots/product-list.jpg) – Default catalog view showing all seeded products.
* [**Responsive Layout**](/docs/screenshots/responsive-layout.jpg) – Product list displayed on a smaller screen for responsiveness.
* [**Backend Tests Passed**](/docs/screenshots/tests-backend-passed.jpg) – Successful backend unit and integration test results.
* [**Frontend Tests Passed**](/docs/screenshots/tests-frontend-passed.jpg) – Successful frontend tests.



<h2 id="containerize--deploy">🚀 Containerize & Deploy</h2>

1. **Clone Repository**

```bash
git clone https://github.com/bwagner77/product-catalog-weekly-app.git
cd product-catalog
```

2. **Environment Variables**

```bash
cp .env.example .env
```

3. **Build & Start Containers**

```bash
docker compose up --build
```

4. **Access Application**

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:3000/api/products](http://localhost:3000/api/products)

5. **Run Tests**

```bash
docker compose run backend npm test
docker compose run frontend npm test
```

6. **Stop Containers**

```bash
docker compose down
```

*Notes*:

* MongoDB persisted via Docker volume
* Logs available in terminal
* Ensure ports 3000 (backend) & 5173 (frontend) are free
