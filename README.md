# Shoply E-commerce Web Application

⚠️ This is a milestone submission for the **SDD Weekly Project**.

**Shoply** is a full-stack e-commerce web application that enables users to browse products, create orders, and view detailed product information. Admin users can manage products and categories, with full CRUD (Create, Read, Update, Delete) operations for both. The app fetches product data from a backend API and presents it in a responsive, accessible interface. Unit tests for both the frontend and backend ensure robustness, functionality, and code quality.

It was developed using the 🌱[GitHub Spec Kit](https://github.com/github/spec-kit) framework, powered by the **GPT-5 coding agent**, with no manual coding. By leveraging AI-driven automation, the development process eliminates human error, accelerates iteration, and maintains a seamless workflow across the entire project.

> Initialize → Constitution → Specify → Plan → Tasks → Implement (via Agents) → Validate → Containerize & Deploy → Document Everything

📂 Documentation including **design artifacts, screenshots, demo video, AI prompts, and AI outputs**, can be found in the project's [/docs](./docs) folder.

---

## 📌 Table of Contents

* [Design Artifacts](#design-artifacts)
* [Goals & Requirements](#goals-requirements)
* [User Journeys](#user-journeys)
* [Constraints (Constitution)](#constraints)
* [Plan → Tasks → Implement](#plan--tasks--implement)
* [Project Structure](#project-structure)
* [Tech Stack](#tech-stack)
* [API Summary](#api-summary)
* [Screenshots](#screenshots)
* [Containerize & Deploy](#containerize--deploy)
* [License](#license)
* [Attributions](#attributions)

---

<h2 id="design-artifacts">📦 Design Artifacts</h2>

- [**Use Case Diagram**](./docs/design-artifacts/shoply_use-case-diagram.jpg)  
  Captures the main interactions between actors (Shopper, Admin) and the system, outlining user goals and system functionality.

- [**System Sequence Diagram (SSD)**](./docs/design-artifacts/shopy_ssd.png)  
  Shows the high-level message flow between users and the Shoply system across key journeys (browsing, cart management, checkout, admin tasks, authentication, mobile navigation).

- [**Domain Model**](./docs/design-artifacts/shoply_domain-model.jpg)  
  Defines the entities, relationships, aggregates, and composites in the Shoply domain (User, Cart, CartItem, Order, OrderItem, Product, Category).

---

<h2 id="goals-requirements">📊 Goals & Requirements</h2>

### 🏆 Goals & Why

1. **Easy Product Browsing and Ordering**: Users should be able to quickly browse, filter, and purchase products.
2. **Seamless and Responsive User Experience**: The UI must be intuitive and accessible, with quick load times.
3. **Admin Control Over Products and Categories**: Admins should be able to easily manage products and categories.
4. **Smooth Cart and Checkout Experience**: Ensure that the cart system is easy to manage, with accurate stock updates.
5. **Intuitive Search and Navigation**: Users must be able to search for and filter products.
6. **Optimal Performance and Scalability**: Fast response times and scalability to handle growing traffic.
7. **Clear Feedback and Error Handling**: Provide actionable error messages and status updates.
8. **Secure Admin Access**: Implement role-based access control (RBAC) for secure admin workflows.
9. **Reliability Through Monitoring and Logging**: Implement monitoring and logging to ensure platform stability.

---

<h3 id="functional-requirements">🧾 Functional Requirements</h3>

* **Product Catalog**: The system must allow users to browse products with filters (e.g., by category).
* **User Authentication**: Admins must log in with JWT tokens to access restricted routes for managing products and categories.
* **Order Management**: Users should be able to place orders, with accurate stock decrements handled on the backend.
* **Admin Functionality**: Admins should be able to perform CRUD operations on products and categories.
* **Cart Management**: The cart system must support adding/removing items, updating quantities, and verifying stock.

---

<h3 id="non-functional-requirements">📊 Non-Functional Requirements</h3>

1. **Performance**: APIs must respond in under 1 second, and frontend pages should load in under 2 seconds.
2. **Scalability**: The application must scale to handle large product catalogs and growing user traffic.
3. **Security**: Ensure role-based access control (RBAC) for admin routes, and secure JWT token handling.
4. **Usability**: The app must be responsive and mobile-first, with WCAG accessibility standards followed.
5. **Testing**: Maintain ≥80% test coverage with automated unit and integration tests.

---

<h2 id="user-journeys">🧾 User Journeys</h2>

### **1. Product Browsing & Discovery**

**User Goal**: As a shopper, I want to browse products by searching or filtering, so I can find items that match my interests.

* **Journey Steps**: Shopper opens homepage → Shopper searches for a product by keyword or filters by category → System returns relevant products with details (name, price, stock) → Shopper selects a product to view details.
* **Emotions**: Curious, Interested, Impatient if the page loads slowly.
* **Pain Points**: Difficulty finding the right product if search/filter isn’t accurate.

### **2. Product Detail Viewing**

**User Goal**: As a shopper, I want to view detailed information about a product, so I can make an informed purchasing decision.

* **Journey Steps**: Shopper selects a product → System fetches and displays detailed product info (images, specs, reviews) → Shopper reads through the details and may add item to cart or continue browsing.
* **Emotions**: Confident, Satisfied when details are clear and complete.
* **Pain Points**: Missing or unclear product info, broken images.

### **3. Managing the Shopping Cart**

**User Goal**: As a shopper, I want to add, remove, or modify quantities of items in my cart, so I can manage my order before purchasing.

* **Journey Steps**: Shopper clicks "Add to Cart" → System updates the cart and displays the item → Shopper chooses to modify quantity or remove item → Shopper may proceed to checkout or continue shopping.
* **Emotions**: Empowered when cart is easy to manage, Frustrated if errors happen or stock is unavailable.
* **Pain Points**: Confusing cart UI, issues with stock validation, accidental additions.

### **4. Order Placement & Confirmation**

**User Goal**: As a shopper, I want to place my order, so I can purchase the items I’ve selected.

* **Journey Steps**: Shopper clicks "Checkout" → Shopper confirms items in the cart → Shopper enters shipping and payment details → System validates stock and processes the order → Shopper receives order confirmation with summary and delivery estimate.
* **Emotions**: Excited, Relieved when everything works smoothly.
* **Pain Points**: Delays or errors in payment processing, confusing confirmation.

### **5. Product & Category Management (Admin)**

**Admin Goal**: As an admin, I need to be able to manage products and categories so that I can keep the store’s offerings current.

* **Journey Steps**: Admin logs into the admin dashboard → Admin selects "Manage Products" → Admin views product list → Admin adds, updates, or deletes product listings.
* **Emotions**: In control, Empowered with a clear and efficient interface.
* **Pain Points**: Confusing UI, slow updates, difficulty finding specific products.

### **6. User Authentication & Authorization**

**Admin Goal**: As an admin, I need to securely log in to access protected admin features.

* **Journey Steps**: Admin clicks "Login" → Admin enters credentials → System authenticates the user and issues a JWT → Admin accesses secure admin features.
* **Emotions**: Secure, Confident in system security.
* **Pain Points**: Frustration if login fails or the system forgets login state.

### **7. Mobile Navigation**

**User Goal**: As a shopper on mobile, I want an easy-to-use navigation menu, so I can browse the site efficiently on a small screen.

* **Journey Steps**: Shopper opens site on mobile → Navigation collapses into hamburger menu → Shopper taps the hamburger icon → Shopper selects a category or product and proceeds to browse.
* **Emotions**: Frustrated if the navigation is difficult to use, Satisfied if it’s intuitive.
* **Pain Points**: Small text or hard-to-read layout, buttons that are too close together.

---

<h2 id="constraints">📊 Constraints (Constitution)</h2>

1. **Code Quality**: Codebase must be clean, maintainable, and follow best practices (e.g., Prettier formatting).
2. **Testing Standards**: Maintain ≥80% unit/integration test coverage; automated in CI.
3. **User Experience**: Mobile-first, WCAG-compliant UI with role-based access control (RBAC).
4. **Performance**: Ensure fast loading times (≤2s for pages, ≤1s for APIs).
5. **Deployment**: Docker for containerization, environment synchronization.
6. **Technology Choices**: Use widely adopted, mature tools; implement RBAC for admin functionality.
7. **Deferred Features**: No CDN or advanced image processing for now.
8. **Governance**: PRs required for changes, with versioning (major for breaking changes, minor for expansions).

---

<h2 id="plan--tasks--implement">🚀 Plan → Tasks → Implement</h2>

### Plan

* **API & Storage**: Implement a TypeScript + Express API with MongoDB for product, category, and order management (`GET /api/products`, `GET /api/categories`, `POST /api/orders`), including JWT authentication for admin routes.
* **Frontend**: React 18 + Vite + TailwindCSS for responsive UI. Implement components: NavBar, CategoryFilter, SearchBar, CartSidebar, OrderConfirmation.
* **Performance**: Ensure fast API responses (<1s) and frontend load times (≤2s).
* **Security**: Secure admin CRUD operations with JWT-based RBAC.

### Tasks

* **Create Product API**: Implement `GET /api/products` for searching and filtering products by category and stock.
* **Create Category API**: Implement CRUD operations for categories (admin-only).
* **Create Order API**: Implement `POST /api/orders` with stock decrement and order snapshot.
* **Admin Authentication API**: Implement JWT login for admin routes.
* **UI Components**: Build responsive UI components like NavBar, Product List, Cart Sidebar.
* **Product Card UI**: Implement stock checks and fallback images for out-of-stock items.
* **Cart & Order Flow**: Implement client-side cart persistence with localStorage.
* **Admin Management UI**: Build CRUD interfaces for managing products and categories (admin-only access).
* **Backend & Frontend Tests**: Add unit tests for APIs and frontend behavior (e.g., cart persistence, login).

### Implement

* **Spec Kit Agent**: Automates tasks based on predefined templates and specifications.
* **CI/CD**: Integrate continuous testing and deployment pipelines.
* **Admin Role Enforcement**: Ensure that admin routes are secured with JWT.

---

<h2 id="project-structure">🗂️ Project Structure</h2>

```
backend/
  src/ (app, routes, models, middleware, seed, utils)
  tests/ (api, models, utils, seed)
frontend/
  src/ (components, pages, hooks, context, api, __tests__)
docker-compose.yml
specs/ (specification, plans, tasks, checklists)
docs/ (design artifacts, screenshots, ai prompts)
```

---

<h2 id="tech-stack">🔌 Tech Stack</h2>

* **Frontend**: React 18, Vite, TailwindCSS
* **Backend**: Node.js, TypeScript, Express.js
* **Database**: MongoDB
* **Authentication**: JWT-based authentication (with role-based access control for admins)
* **Testing**: Jest, React Testing Library, Supertest
* **Containerization**: Docker, Docker Compose

---

<h2 id="api-summary">🔌 API Summary</h2>

Base: `/api`

| Method | Endpoint        | Purpose                               | Auth                  |
| ------ | --------------- | ------------------------------------- | --------------------- |
| GET    | /products       | List/search/filter products           | Public                |
| POST   | /orders         | Submit order (atomic stock decrement) | Public (cart context) |
| POST   | /auth/login     | Admin login (returns JWT)             | Public                |
| GET    | /categories     | List categories                       | Public                |
| POST   | /categories     | Create category                       | Admin                 |
| PUT    | /categories/:id | Update category                       | Admin                 |
| DELETE | /categories/:id | Delete (blocked if products assigned) | Admin                 |
| POST   | /products       | Create product                        | Admin                 |
| PUT    | /products/:id   | Update product                        | Admin                 |
| DELETE | /products/:id   | Delete product                        | Admin                 |

---

<h2 id="containerize--deploy">🚀 Containerize & Deploy</h2>

1. **Clone Repository**

```bash
git clone https://github.com/your-repo/shoply.git
cd shoply
```

2. **Build & Start Containers**

```bash
docker compose up --build
```

3. **Access Application**

* Frontend: [http://localhost:5173](http://localhost:5173)
* Backend API: [http://localhost:3000/api/products](http://localhost:3000/api/products)

4. **Run Tests**

```bash
docker compose run backend npm test
docker compose run frontend npm test
```

5. **Stop Containers**

```bash
docker compose down
```

*Notes:*

* MongoDB persisted via Docker volume.
* Logs available in the terminal.

---

<h2 id="license">License</h2>

This project is licensed under the **MIT License** – see the [LICENSE](./LICENSE) file for details.

---

<h2 id="attributions">Attributions</h2>

Developed under an AI‑assisted specification workflow 🌱[GitHub Spec Kit](https://github.com/github/spec-kit).

---
