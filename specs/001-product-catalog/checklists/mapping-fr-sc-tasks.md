# FR / SC / Error Code ↔ Task Mapping

Generated: 2025-11-21
Source Artifacts: spec.md, plan.md, tasks.md, constitution v1.1.0
Purpose: Provide traceability matrix linking Functional Requirements (FR), Success Criteria (SC), and structured Error Codes to implementing & validating tasks.

## Legend
- Impl: Implementation task(s)
- Test: Validation / test task(s)
- Doc: Documentation / contract alignment task(s)
- Perf: Performance measurement task(s)
- A11y: Accessibility validation task(s)
- Gap: Newly added remediation task (pending)

## Functional Requirements
| FR | Summary | Tasks | Coverage Type | Gap |
|----|---------|-------|---------------|-----|
| FR-001 | Display product list | T022,T026,T025 | Impl |  |
| FR-002 | Fetch products from API | T022,T026,T050 | Impl |  |
| FR-003 | Price formatting ($, 2 decimals) | T021,T025 | Test/Impl |  |
| FR-004 | Loading/empty/error states | T027–T032 | Test/Impl |  |
| FR-005 | Accessibility basics | T033,T034,T035,T112 | A11y |  |
| FR-006 | GET /api/products fields | T022,T019,T044 | Impl/Test |  |
| FR-007 | Persist in products collection | T062,T065,T044,T045 | Impl/Test |  |
| FR-008 | ≥20 seeded products | T065,T045 | Impl/Test |  |
| FR-009 | Frontend tests location | T020,T021,T043 | Test |  |
| FR-010 | Backend tests location | T019,T042 | Test |  |
| FR-011 | Logging + metrics | T022,T123,T179 | Impl/Test |  |
| FR-012 | ≤200 product cap no pagination | T049 | Impl/Test |  |
| FR-013 | Health endpoints | T036,T037 | Impl |  |
| FR-014 | categoryId & non-negative stock | T062,T068,T126,T131 | Impl/Test |  |
| FR-015 | Stock status labels | T089,T096,T099 | Impl/Test |  |
| FR-016 | Prevent over-stock additions | T096,T099 | Impl/Test |  |
| FR-017 | Category CRUD + status codes | T072–T074 | Impl/Test |  |
| FR-018 | Category list display | T072,T077,T078 | Impl/Test |  |
| FR-019 | Category form validation | T077,T078 | Impl/Test |  |
| FR-020 | Search & category filter | T080–T085 | Impl/Test |  |
| FR-021 | Zero-results distinct message | T084,T085 | Impl/Test |  |
| FR-022 | Cart add/remove/update/clear | T094–T099 | Impl/Test |  |
| FR-023 | Cart persistence | T094,T095,T099 | Impl/Test |  |
| FR-024 | Cart icon count updates | T098,T099,T181 | Impl/Perf |  |
| FR-025 | Order snapshot immutability | T103–T106,T104 | Impl/Test |  |
| FR-026 | Order confirmation view | T105,T106,T136 | Impl/Test |  |
| FR-027 | Prevent empty cart order | T103,T104,T106 | Impl/Test |  |
| FR-028 | Total rounding helper | T122,T104,T137 | Impl/Test |  |
| FR-029 | A11y for search/cart ops | T086,T112 | A11y |  |
| FR-030 | Tests for search/filter/category/cart/order | T074,T081,T099,T104,T019 | Test |  |
| FR-031 | Reserved (merged into FR-012) | — | — |  |
| FR-032 | Blocked category deletion message | T073,T074 | Impl/Test |  |
| FR-033 | imageUrl presence | T062,T065,T089,T091,T126,T131 | Impl/Test |  |
| FR-034 | Deterministic image filenames | T065,T087,T091 | Impl/Test |  |
| FR-035 | Reserved (merged into FR-033) | — | — |  |
| FR-036 | Alt text & fallback pattern | T089,T090,T093,T141 | Impl/Test |  |
| FR-037 | Square image container | T089,T135,T090 | Impl/Test |  |
| FR-038 | Responsive image scaling | T035,T089,T135 | Impl/Test |  |
| FR-039 | Fallback image asset & behavior | T088,T089,T090 | Impl/Test |  |
| FR-040 | No a11y regressions (images) | T093,T112 | A11y |  |
| FR-041 | Image test aggregation | T090,T091,T093,T135,T140,T141 | Test |  |
| FR-042 | Broken image fallback ≤1s | T090,T111 | Test/Perf |  |
| FR-043 | Atomic stock decrement order | T103,T104,T121 | Impl/Test |  |
| FR-044 | Navigation branding & logo | T127,T128,T129 | Impl/Test/Perf |  |
| FR-045 | Navigation view switching | T127,T129 | Impl/Perf |  |
| FR-046 | Dual modal dismissal | T105,T136,T139,T128 | Impl/Test/A11y |  |
| FR-047 | Seeded products include imageUrl & stock | T065,T126,T131 | Impl/Test |  |
| FR-048 | CategoryManagement reachable via nav | T077,T127,T078,T129 | Impl/Test/Perf |  |
| FR-049 | A11y of new UI elements | T127,T105,T136,T139,T112 | A11y/Test |  |
| FR-050 | Acceptance tests for new UI | T126,T129,T136,T170 | Test |  |
| FR-051 | Restrict category writes (admin) | T146,T148,T142,T134,T164 | Impl/Test |  |
| FR-052 | Restrict product writes (admin) | T146,T149,T159,T160,T161,T162,T169,T170,T194,T195,T196,T197,T204,T205,T164 | Impl/Test |  |
| FR-053 | Non-negative stock update | T159,T170 | Impl/Test |  |
| FR-054 | Product CRUD performance ≤2s | T190 | Perf |  |
| FR-055 | Case-insensitive category uniqueness | T069,T191 | Impl/Test |  |
| FR-056 | Reject PII on orders | T103,T188 | Impl/Test |  |
| FR-057 | Admin login endpoint | T144,T145,T163 | Impl/Test |  |
| FR-058 | Session persistence until expiry | T154,T155,T165,T167 | Impl/Test |  |
| FR-059 | AccessDenied messaging | T156,T166,T168,T171,T177,T195,T199,T202,T204,T165 | Impl/Test/A11y |  |
| FR-060 | Structured error + zero mutation | T147,T164,T178,T183,T187 | Impl/Test |  |

## Success Criteria
| SC | Summary | Tasks | Gap |
|----|---------|-------|-----|
| SC-001 | Catalog load ≤2s | T110,T055 docs |  |
| SC-002 | GET /api/products ≤1s | T110 |  |
| SC-003 | Price formatting correct | T021,T020 |  |
| SC-004 | 0 critical a11y violations | T033,T112 |  |
| SC-005 | ≥5 products first run | T045,T065 |  |
| SC-006 | Logging completeness | T123 |  |
| SC-007 | Category ops ≤2s | T189 |  |
| SC-008 | Out-of-stock blocked | T096,T099 |  |
| SC-009 | Cart persistence restore ≤1s | T099,T181 |  |
| SC-010 | Order total rounding accuracy | T104,T137 |  |
| SC-011 | Search/filter update ≤1s | T110 |  |
| SC-012 | No new a11y violations (new UI) | T112 |  |
| SC-013 | Blocked deletion messaging | T074 |  |
| SC-014 | Order snapshot price immutability | T104,T106 |  |
| SC-015 | All products include imageUrl | T091,T126 |  |
| SC-016 | Image or fallback always | T090 |  |
| SC-017 | Fallback ≤1s | T090,T111 |  |
| SC-018 | CLS <0.1 images load | T135,T140 |  |
| SC-019 | Alt text correctness | T093,T141 |  |
| SC-020 | No horizontal scroll | T135,T054 |  |
| SC-021 | Sampled products imageUrl & stock | T126,T131 |  |
| SC-022 | Branding & nav present | T127,T128 |  |
| SC-023 | Navigation latency targets | T129 |  |
| SC-024 | Dual modal dismissal focus | T136,T139,T128 |  |
| SC-025 | Category writes blocked anonymous | T142,T134,T164 |  |
| SC-026 | ProductManagement blocked anonymous | T165,T169,T195,T202,T204,T205 |  |
| SC-027 | Stock updates non-negative | T170 |  |
| SC-028 | Product CRUD ops ≤2s | T190 |  |
| SC-029 | Unauthorized writes zero mutation | T164,T178,T183,T187 |  |
| SC-030 | Expired token blocked | T164,T172,T187,T167 |  |
| SC-031 | Cart UI latency ≤500ms | T181 |  |
| SC-032 | Order confirmation latency ≤1s | T182 |  |
| SC-033 | Structured error code schema | T183,T184,T147 |  |
| SC-034 | Expired token hides controls | T185,T168 |  |

## Structured Error Codes
| Code | Tasks Emitting / Testing |
|------|-------------------------|
| admin_auth_required | T147,T164,T183 |
| forbidden_admin_role | T164,T183 |
| invalid_credentials | T163,T183 |
| token_expired | T164,T172,T187 |
| validation_error | T170,T104 (order), T074 (category) |
| category_name_conflict | T074,T191 (NEW) |
| stock_conflict / insufficient_stock | T103,T104,T121,T183 |
| unauthorized_write (fallback) | T164,T178,T183 |
| not_found | T074,T170 (CRUD not-found paths) |

## Gaps & Added Tasks
Initial gaps remediated:
- FR-054 / SC-028: CRUD performance measurement → T190 (implemented).
- SC-007: Category operation latency measurement → T189 (implemented).
- FR-055: Case-insensitive uniqueness negative test → T191 (implemented, route updated to 409).
Pending checklist update (T192) and mapping artifact creation (T193) completed.

## Traceability Updates (2025-11-22)

- Mapping augmented per T201 to include recent admin ProductManagement and RBAC tasks:
	- FR‑052 now references T159–T162 (ProductManagement impl + API utils), T169 (auth tests), and T194–T197, T204–T205 (frontend acceptance and UX tests).
	- FR‑059 now references T166, T168 (AccessDenied UX), T171 (API error mapping), T195, T199, T202, T204 (frontend UX/accessibility), in addition to prior tasks.
	- SC‑026 (anonymous/non-admin blocked) now references T165, T169, T195, T202, T204, T205.

## Ambiguities / Conflicts
1. Unauthorized messaging inconsistency: Early spec clarification shows `{ "error": "Admin access required" }` while error code table mandates machine codes (`admin_auth_required`, `forbidden_admin_role`). Resolved by tests using structured codes (tasks T147,T164,T183). Recommend updating spec clarification block to reflect canonical codes.
2. 401 vs 403 semantics: Spec mixes 403 for missing/invalid token; error code decision tree clarifies missing/expired should be 401. Tests enforce decision tree; suggest spec wording adjustment.
3. FR-050 is an aggregation meta requirement; ensure not double-counted as functional gap.
4. `stock_conflict` vs `insufficient_stock` alias: Both present; consider consolidation to one code (tasks already handle membership).

## Recommendations
- Update spec.md clarifications section to replace raw 403 example with structured error code JSON (`{"error":"admin_auth_required","message":"Admin authentication required"}`) and add note on decision tree.
- Consolidate alias codes: choose `stock_conflict` and document `insufficient_stock` deprecated.
- Consider adding automated timing assertion for order atomic decrement (already covered indirectly via SC-032) if scaling.
- Add periodic CI job parsing this mapping for drift detection (future task).

## Traceability Status
All FRs & SCs now covered by implemented tasks; no open gaps. Remaining performance latency validations for cart/order (T181,T182) already present and passing.

---
End of mapping.
