# Product Catalog Weekly App Constitution

<!--
Sync Impact Report
- Version change: 0.0.0 → 1.0.0
- Modified principles: N/A (initial ratification)
- Added sections:
	- Core Principles I–V
	- Technology Choices & Constraints
	- Development Workflow, Review Process, and Tasks Guidance
	- Governance
- Removed sections: None
- Templates requiring updates:
	- .specify/templates/plan-template.md ✅ aligned (Constitution Check present)
	- .specify/templates/spec-template.md ✅ aligned (stories and tests; no E2E requirement)
	- .specify/templates/tasks-template.md ✅ aligned ([P], user-story grouping, MVP flow)
	- .specify/templates/commands/* ⚠ N/A (no command files present)
	- README.md ✅ no conflicting guidance
- Follow-up TODOs: None
-->

## Core Principles

### I. Code Quality

- Use meaningful and consistent naming for variables, functions, and components.
- Break down large components into smaller, reusable ones (modularization).
- Keep functions and components small and focused; each has a single responsibility.
- Enforce consistent code formatting with Prettier (2 spaces indentation).
- Avoid duplication (DRY principle).
- Comments MUST explain why something is done, not what.
- Implement basic error handling for key functionality (e.g., API calls).

Rationale: Simpler, modular code is easier to maintain, faster to review, and less prone to errors.

### II. Testing Standards

- Unit tests MUST focus on isolated logic.
- Integration tests MUST validate interactions between components and APIs.
- Target ≥ 80% code coverage with focus on critical paths.
- Mock external API calls where appropriate.
- Tests MUST run automatically in the build pipeline.
- Document test purpose, steps, and how to run locally.
- Avoid end-to-end (E2E) tests in this phase; they are explicitly out of scope.

Rationale: Automated tests prevent regressions and catch issues early.

### III. User Experience Consistency

- Mobile-first, responsive layout that adapts from phones to desktops.
- Use TailwindCSS for all layout and styling; no custom color palettes or custom CSS.
- Provide clear visual feedback for user actions (loading, validation, states).
- Error messages MUST be clear and actionable (e.g., "Product out of stock").
- Key pages should load in under 2 seconds.
- Ensure accessibility per WCAG (ARIA, keyboard navigation, color contrast).

Rationale: Consistency and clarity minimize cognitive load and speed up task completion.

### IV. Performance Requirements

- Key pages must load in 2–3 seconds or less.
- API responses must complete in under 1 second for typical requests.
- No caching at this stage; fetch data dynamically per session.
- Optimize image sizes; use advanced techniques (e.g., WebP) only when necessary.
- Avoid lazy loading large assets by default.

Rationale: Clear performance targets maintain a responsive UX while keeping implementation simple.

### V. Deployment Strategy

- Containerize frontend, backend, and database as separate services.
- Use docker-compose.yml to orchestrate services.
- One command (Docker Compose) MUST bring up the full environment.
- Store environment variables in .env (e.g., DB URL, ports).
- Optional cloud deployment (e.g., Azure) uses the same containers.
- Provide a concise deployment guide for local run and cloud deployment.
- Provide .env.example and keep it in sync with .env usage.

Rationale: Containers provide consistent, reproducible environments for local and cloud.

## Technology Choices & Constraints

The system MUST use a consistent, modern stack for rapid MVP development. All technologies
MUST be mature, widely adopted, and support modularity, testing, and containerization.
Specific tools and frameworks are defined in the Implementation Plan for each feature.

Implications:
- Prefer mainstream frameworks with robust ecosystem and testing support.
- Ensure libraries integrate cleanly with Docker and CI runners.
- Select tooling that enables unit/integration testing and Prettier formatting.

## Development Workflow, Review Process, and Tasks Guidance

Quality Gates and Workflow:
- Constitution Check MUST pass in plans before Phase 0 research and be re-checked after
	Phase 1 design.
- Code review MUST verify compliance with Core Principles (Code Quality, Testing,
	UX, Performance, Deployment).
- Tests MUST run automatically in the build pipeline; coverage ≥ 80% on critical paths.

Tasks Template Updates:
- Task Dependencies: Tasks MUST be organized by user story with clear dependencies.
- MVP First: Deliver a working MVP early, validate, then expand.
- Granular Tasks: Break tasks into 1–2 hour units.
- Parallel Work: Tasks marked with [P] can be worked on in parallel with no dependency.

Documentation:
- Include test purpose, steps, and local run instructions in the repository docs.
- Provide a concise deployment guide for Docker Compose and optional cloud usage.

## Governance

This document is the final authority on development processes.

Amendments (via Pull Request):
- PR MUST include proposed changes and rationale.
- PR MUST include a version bump (MAJOR, MINOR, PATCH).
- Include migration notes when applicable.

Versioning Policy:
- MAJOR: Breaking changes or redefinitions.
- MINOR: New sections or substantial changes.
- PATCH: Minor clarifications or fixes.

Compliance and Review:
- All changes MUST be documented.
- All PRs/reviews MUST verify compliance with this Constitution.

**Version**: 1.0.0 | **Ratified**: 2025-11-10 | **Last Amended**: 2025-11-10
