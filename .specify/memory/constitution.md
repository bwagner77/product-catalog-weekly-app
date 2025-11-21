# Shoply Project Constitution

<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0
- Modified principles: III User Experience (branding + modals), I Code Quality (clarified single responsibility), II Testing (removed test doc bullet, aligned with current automation wording), V Deployment (explicit .env.example requirement retained), VI Technology Choices (added seed data rule)
- Added sections:
	- VII Deferred & Non-Goals
	- IX Suggested Updates to Tasks Template (relocated & expanded guidance)
- Removed sections:
	- "Development Workflow, Review Process, and Tasks Guidance" (content redistributed to IX and Governance)
- Templates requiring updates:
	- .specify/templates/plan-template.md ⚠ add explicit Shoply branding check
	- .specify/templates/spec-template.md ⚠ reference brand name in UX/acceptance criteria
	- .specify/templates/tasks-template.md ✅ already supports [P], may add branding mention
	- README.md ⚠ replace old product name with Shoply branding & navbar/logo requirement
	- docs/quickstart.md ⚠ ensure environment references brand Shoply
	- Any UI copy guidelines (if present) ⚠ align with Shoply naming
- Follow-up TODOs: None (all placeholders resolved)
-->

## Core Principles

### I. Code Quality

The codebase MUST be clean, readable, maintainable, and emphasize simplicity.

- Meaningful, consistent naming for variables, functions, components.
- Decompose large components into small, reusable units (modularization).
- Each function/component MUST have a single responsibility.
- Enforce consistent formatting via Prettier (2 spaces indentation).
- Eliminate duplication (DRY principle); refactor when duplication detected.
- Comments MUST explain intent and rationale, not restate obvious code behavior.
- Implement basic error handling for key functionality (e.g., API calls).

Rationale: Modular, intention‑revealing code accelerates reviews and reduces defects.

### II. Testing Standards

The system MUST be protected by unit and integration tests.

- Unit tests isolate logic and avoid external side effects.
- Integration tests validate component + API boundaries.
- Maintain ≥ 80% coverage emphasizing critical paths (logic, data integrity, error handling).
- Mock external or volatile dependencies (network, time) where deterministic outcomes needed.
- Automated test execution MUST occur in the build pipeline.
- End-to-end (E2E) tests are deferred; do not add until a future phase.

Rationale: Layered automated tests catch regressions early and sustain delivery velocity.

### III. User Experience Consistency

The UI MUST be simple, intuitive, accessible, and consistently branded as **Shoply**.

- Mobile-first responsive layout scaling from phones to desktops.
- TailwindCSS for all layout/styling; avoid ad-hoc color palettes or raw CSS overrides.
- Clear visual feedback for all user actions (loading, validation, disabled states).
- Actionable error messages (e.g., "Product out of stock").
- Key pages load under 2 seconds on typical broadband.
- Accessibility: WCAG alignment (ARIA roles, keyboard navigation, contrast compliance).
- Brand identity: Use the name **Shoply** uniformly in navigation, titles, and user-facing text.
- Navigation bar MUST present the brand name **Shoply** and a logo with accessible text alternative.
- Application-wide modals MUST include an accessible dismissal: close icon + clearly labeled button.

Rationale: Consistent, accessible branding reduces cognitive load and increases user trust.

### IV. Performance Requirements

The application MUST feel fast for common interactions without premature optimization.

- Key pages render in ≤ 2–3 seconds.
- Typical API responses complete in < 1 second.
- No caching layer at this stage; fetch fresh per session.
- Optimize image dimensions & compression; introduce advanced formats (e.g., WebP) only when justified.
- Avoid unnecessary lazy loading of large assets; prefer selective loading tied to user intent.

Rationale: Simple performance thresholds maintain responsiveness while avoiding over-engineering.

### V. Deployment Strategy

Use Docker for reproducible environments and a frictionless local → cloud path.

- Containerize frontend, backend, and database separately.
- Orchestrate with docker-compose.yml; a single command brings environment up.
- Store configuration in `.env`; supply synchronized `.env.example` (no secrets) updated with each new variable.
- Optional cloud deployment (e.g., Azure) reuses identical images.
- Provide concise deployment documentation (local & cloud hints).

Rationale: Containerization stabilizes environments, simplifying onboarding and deployment.

### VI. Technology Choices & Constraints

Adopt a modern, mainstream stack enabling modularity, testing, containerization, and rapid iteration.

- Select mature, widely adopted libraries with active maintenance.
- Favor tooling that integrates seamlessly with Docker and CI.
- Seed data MUST remain schema‑complete and updated whenever persistent schema fields evolve.

Rationale: Stable, common tooling reduces integration risk and accelerates feature delivery.

### VII. Deferred & Non-Goals (Current Phase)

- Excluded: End-to-end (E2E) testing, cross-service caching, CDN, advanced image pipelines, full CI/CD automation.
- No cross-service caching layer or CDN yet.
- Skip advanced image transformations (e.g., WebP) unless future justification.
- CI/CD pipeline setup deferred to later iteration.

Rationale: Focus on core value delivery; defer complexity until validated need emerges.

### VIII. Governance

This Constitution is the final authority for development standards and evolution.

- Amend via Pull Request including: rationale, changes, version bump, migration notes if needed.
- Versioning:
  - MAJOR: Breaking principle redefinitions or removals.
  - MINOR: New sections or substantial expansions.
  - PATCH: Clarifications, wording, minor non-semantic edits.
- All changes MUST be documented and reviewed for compliance.

Rationale: Transparent, versioned governance prevents uncontrolled drift.

### IX. Suggested Updates to Tasks Template

- Organize tasks by user story with explicit dependencies.
- Deliver an MVP early; iterate after validation (MVP First).
- Keep tasks granular (1–2 hours) to maintain flow and predictability.
- Mark parallel-safe tasks with [P]; ensure no hidden dependencies before parallel execution.
- Include branding impact checks (Shoply name & navbar presence) in story acceptance where relevant.

Rationale: Structured, granular task management sustains momentum and enables safe parallel work.

**Version**: 1.1.0 | **Ratified**: 2025-11-10 | **Last Amended**: 2025-11-21
