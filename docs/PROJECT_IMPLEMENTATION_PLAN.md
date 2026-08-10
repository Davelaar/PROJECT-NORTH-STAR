# PROJECT IMPLEMENTATION PLAN — Open Filament Platform

> **Superseding note (2026-08-10):** Platform doctrine is now **web-first / PWA**. See [`ARCHITECTURE.md`](./ARCHITECTURE.md) and [`ROADMAP.md`](./ROADMAP.md). OS installers and a general desktop app are **out** of the default architecture. Sections below that describe the local bridge as a required layer are **historical**; treat the bridge as an optional compatibility helper only. Phases 1–5 in ROADMAP are the active plan.

**Status:** Implementation largely delivered for web foundation; this file retains historical planning detail.  
**Companion audit:** [`CURRENT_STATE.md`](./CURRENT_STATE.md)  
**Spec reference:** Master Build Specification + web-first / PWA migration brief

---

## 1. Current repository state

| Fact | Detail |
|------|--------|
| Project root | `/Users/raymonddavelaar/Projects/open-filament` |
| Prior code | **None** — greenfield |
| Accidental prior workspace | `kraken-scalper` (Rust Kraken trading bot) — unrelated; see CURRENT_STATE.md |
| Commits | None |
| Stack scaffold | Not yet present |

**Hard rule from audit:** Do not inherit architecture, deploy scripts, DB, or conventions from `kraken-scalper`.

---

## 2. Proposed target architecture

### 2.1 North-star layering

```
┌─────────────────────────────────────────────────────────────┐
│  Web app (community UI)                                      │
│  Public REST API /api/v1                                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ canonical IDs + OpenFilamentProfile
┌──────────────────────────▼──────────────────────────────────┐
│  Domain services (filament, calibration, trust, search)      │
│  PostgreSQL = SOURCE OF TRUTH                                │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
     ┌──────────▼──────────┐       ┌──────────▼──────────┐
     │ Slicer adapters     │       │ RFID codecs         │
     │ (Creality, Orca,…)  │       │ (CFS, future OF…)   │
     └──────────┬──────────┘       └──────────┬──────────┘
                │                             │
                └──────────────┬──────────────┘
                               │ localhost, authenticated
                    ┌──────────▼──────────┐
                    │ OpenFilament Bridge │
                    │ (OS adapters,       │
                    │  TagTransport HAL)  │
                    └─────────────────────┘
```

**Invariants**

1. Database / domain model is canonical — not slicer JSON, not RFID bytes.
2. Slicer and RFID are adapters behind interfaces.
3. Web never talks to NFC hardware or arbitrary filesystem paths directly.
4. Profiles are bound to filament + printer/toolhead/nozzle context — never to “the PC that created them.”
5. Unknown values are `null`, never sentinel zeros.
6. Manufacturer claims and community observations remain distinguishable.

### 2.2 Recommended technology stack

These are **proposed defaults** for a production open-source community platform. They are not yet implemented. Alternatives are listed under unresolved questions where a choice is still open.

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Monorepo | `pnpm` workspaces + Cargo workspace for Rust crates | Shared types/schemas; separate deployables |
| Canonical DB | **PostgreSQL 16+** | Scale targets (§70), FKs, full-text + `pg_trgm`, JSONB for extensions only |
| Migrations | **Drizzle Kit** (or equivalent SQL migrations checked into git) | Forward migrations, indexes, reviewable SQL |
| API | **TypeScript + Fastify** (or Hono) on Node 22 LTS | OpenAPI generation, rapid REST iteration, strong Zod validation |
| Domain validation | **Zod** (API) + mirrored JSON Schema for OpenFilamentProfile | Explicit contracts; no silent coercion of unknowns to 0 |
| Web | **Next.js** (App Router) + React | SSR/SEO for filament pages, i18n-ready |
| Styling | Tailwind + accessible components (library TBD; avoid card-heavy marketing chrome) | Consistent, maintainable UI |
| i18n | `next-intl` (EN first; NL/DE/FR prepared) | Spec §38 |
| Auth | Session cookies (web) + opaque scoped API tokens (hashed at rest) | Spec §42; OAuth deferred |
| Object storage | S3-compatible (MinIO locally; provider later) | Evidence images with EXIF strip pipeline |
| Search (v1) | PostgreSQL FTS + trigram on normalized aliases | Avoid early Meilisearch ops cost; upgrade path documented |
| Local bridge | **Rust** (`axum` localhost TLS or loopback HTTP + strict origin checks) | Filesystem/NFC safety, Windows/macOS/Linux adapters |
| RFID codecs | **Rust** crates, pure functions, binary fixtures | Deterministic encode/decode; no hardware in unit tests |
| Slicer adapters (v1) | TypeScript packages calling shared canonical schema; bridge performs install | Conversion pure; install privileged in bridge |
| Tests | Vitest / Playwright (TS); `cargo test` (Rust); Testcontainers Postgres | Spec §45 |
| CI | GitHub Actions: lint, typecheck, unit, migration, e2e smoke | Spec §75 |
| Observability | Structured JSON logs + request IDs; metrics hooks later | Spec §68 |
| Feature flags | Env + DB-backed flags for RFID write / auto-install | Spec §74 |

**Explicitly rejected for v1**

- Storing the system as slicer blob-primary documents.
- Coupling API business logic to Creality field names outside `extensions.creality`.
- Electron as the only bridge form (native Rust service first; UI can wrap later).
- Building inside the trading bot repo.

### 2.3 Proposed monorepo layout

```
open-filament/
  apps/
    web/                 # Next.js UI
    api/                 # Fastify REST /api/v1
    bridge/              # Rust OpenFilament Bridge
  packages/
    db/                  # Drizzle schema, migrations, seed fixtures
    domain/              # shared TS domain types + validators
    canonical-profile/   # OpenFilamentProfile JSON Schema + versioning
    slicer-core/         # SlicerAdapter interface + shared helpers
    slicer-creality/     # Creality Print adapter (after research)
    slicer-orca/         # OrcaSlicer adapter (MVP-adjacent)
    rfid-core/           # RfidAdapter + TagTransport interfaces (TS bindings / FFI later)
    eslint-config/
    tsconfig/
  crates/
    of-rfid-core/        # Rust RFID traits
    of-rfid-cfs/         # Creality CFS codec + fixtures
    of-bridge/           # bridge binary (may live under apps/bridge)
    of-slicer-paths/     # OS path allowlists
  docs/                  # architecture & phase docs (this file, etc.)
  schemas/               # published JSON Schemas
  fixtures/              # synthetic Flashforge ASA Burnt Titanium, RFID dumps
  .github/workflows/
```

Exact package names may be adjusted at scaffold time; boundaries must remain.

---

## 3. Domain model

### 3.1 Core entities (Phase 1+)

| Entity | Purpose |
|--------|---------|
| `users` | Auth identity, role, trust/reputation scores, locale, status |
| `manufacturers` | Canonical brand; aliases table |
| `material_families` | Hierarchical materials (PLA → PLA Silk, PA → PA6 → PA6-CF) |
| `filament_products` | Commercial product family (Flashforge ASA) — not a color |
| `filament_variants` | Purchasable SKU/color/appearance (Burnt Titanium) |
| `printer_models` | Canonical printers (Creality K2 Plus) — independent of filament OEM |
| `toolhead_configs` | Hotend/nozzle/material/high-flow context |
| `build_plates` | Optional adhesion surface catalog |
| `aliases` / `external_identifiers` | Name aliases, EAN/UPC/GTIN, barcodes |
| `provenance_sources` | Source type + reference for factual claims |

### 3.2 Calibration & community (Phase 2–3)

| Entity | Purpose |
|--------|---------|
| `calibration_profiles` | Logical profile identity (immutable revisions beneath) |
| `calibration_revisions` | Immutable versioned parameter sets + lifecycle status |
| `calibration_parameters` | Normalized thermal/extrusion/cooling/retraction/prep fields (columns or typed JSON with schema — prefer typed columns for aggregatable metrics) |
| `raw_observations` | Test runs (temp tower, flow, PA, max flow, …) with start/end/limit/chosen |
| `evidence_assets` | Images/artifacts metadata (object storage keys) |
| `profile_confirmations` | Success votes bound to **revision**, with context |
| `profile_failure_reports` | Categorized failures bound to revision |
| `community_recommendations` | Materialized or on-read aggregation outputs + algorithm version |
| `quality_scores` | Transparent completeness dimensions |

### 3.3 RFID (Phase 10+)

| Entity | Purpose |
|--------|---------|
| `rfid_schemes` | Vendor/scheme metadata |
| `rfid_mappings` | Variant ↔ scheme encoding parameters (lossy color mapping flagged) |
| `rfid_write_audit` | Optional audit of encode requests (no secrets) |

### 3.4 Cross-cutting

- Soft deletes where historical references must survive.
- UUIDs for public stable IDs; internal bigint PKs allowed.
- SI units only in storage.
- Collaborative ownership of catalog records; authorship on calibrations.
- Batch/lot optional on submissions without forcing schema redesign later.

### 3.5 Reference fixture (synthetic — never presented as measured fact)

```
Manufacturer: Flashforge
Product:      ASA
Variant:      Burnt Titanium
Printer:      Creality K2 Plus
Nozzle:       0.4 mm
TEST nozzle:  255 °C
TEST bed:     100 °C
TEST flow:    0.95
TEST PA:      0.03
TEST max VF:  28 mm³/s
```

All fixture rows marked `is_synthetic_fixture = true` (or equivalent provenance).

---

## 4. Migration sequence

Migrations are additive and reviewable. Suggested ordered batches:

### M0 — platform bootstrap

- extensions: `pgcrypto` / `citext` / `pg_trgm` as needed
- `schema_migrations` bookkeeping (via Drizzle)

### M1 — identity & RBAC

- `users`, roles enum/table, sessions, API tokens + scopes

### M2 — catalog foundation

- `manufacturers`, `manufacturer_aliases`
- `material_families` (self-FK parent)
- `filament_products`, `filament_variants`
- identifiers / barcodes / aliases
- provenance tables

### M3 — hardware context

- `printer_models` (+ printer manufacturer text or FK to manufacturers with type flag)
- `toolhead_configs`, `build_plates`
- uniqueness indexes for (manufacturer, model, revision)

### M4 — calibration engine

- profiles, revisions, parameters, observations, evidence
- revision immutability enforced in application + DB checks (no UPDATE of published parameter rows)

### M5 — trust & community signals

- confirmations, failures, reputation events, audit_log

### M6 — search helpers

- `search_documents` materialized view or denormalized table
- GIN/trgm indexes

### M7 — RFID metadata

- schemes, mappings (codecs remain in code)

### M8 — bridge device registry (later)

- user devices metadata (no public filesystem paths)

Each migration: forward SQL, indexes, FKs, uniqueness; rollback scripts where safe; never hand-mutate production.

---

## 5. API architecture

### 5.1 Surface

- Prefix: `/api/v1/`
- JSON only; consistent error envelope:
  ```json
  { "error": { "code": "VALIDATION_FAILED", "message": "...", "details": [] } }
  ```
- Pagination: cursor or limit/offset with stable sort defaults
- Filtering/sorting whitelisted per resource
- Rate limiting (IP + token)
- OpenAPI 3 generated and published at `/api/v1/openapi.json` (+ docs UI)

### 5.2 Endpoint groups (aligned with spec §17)

| Group | Examples |
|-------|----------|
| Catalog | manufacturers, materials, filaments, variants |
| Hardware | printers, toolheads, build plates |
| Profiles | CRUD-ish with revision semantics; confirm/failure |
| Calibrations | observations + submission |
| RFID | schemes, encode (server-side payload generation); write via bridge |
| Export | `/exports/{adapter}` from **canonical** only |
| Auth | register/login, tokens, scopes |

### 5.3 AuthZ model

Roles: anonymous → registered → trusted contributor → moderator → administrator  

Scopes: `read:filaments`, `write:profiles`, `write:calibrations`, `write:rfid`, `moderate`, …  

Trust/reputation influence ranking/aggregation weights — **never** hide raw evidence.

### 5.4 Validation

- Zod (or equivalent) on every write path
- Physical bounds (temps, flow, PA) + optional printer capability checks
- Reject absurd values (e.g. 900 °C nozzle) or flag with explicit status — policy documented in TESTING/SECURITY docs

---

## 6. Frontend architecture

### 6.1 Apps

`apps/web` — Next.js App Router

### 6.2 Core routes (spec §27)

Home, Search, Manufacturer, Material, Filament product, Variant, Printer, Profile, Compare, Submit, User, Contributions, Moderation, Admin, API docs, RFID writer, Slicer integration.

### 6.3 UX rules (product-critical)

- Product page: **Manufacturer specs** vs **Community calibrated** visually separated (§28).
- Compare table highlights meaningful deltas (§29).
- Calibration wizard later (Phase 4+); allow partial submissions.
- i18n keys from day one for UI strings; product names stay canonical.
- RFID write UI talks only to authenticated local bridge.

### 6.4 Data access

- Server components / route handlers call API or shared domain services
- No direct RFID/hardware from browser beyond bridge localhost protocol

---

## 7. Local bridge architecture (`OpenFilament Bridge`)

### 7.1 Responsibilities

- Health / version
- Auth session with web origin validation
- Slicer detection + list/install/remove user presets (allowlisted paths)
- Timestamped backup → change → validate → rollback capability
- NFC TagTransport operations
- Offline cache of downloaded profiles / pending submission queue (Phase 14+)
- Device registration metadata for multi-PC sync UX (later)

### 7.2 Security (non-negotiable)

- Loopback only by default
- CSRF + origin allowlist
- Explicit user approval for destructive ops
- No arbitrary command execution
- No arbitrary path writes — OS-specific allowlists for slicer dirs
- Audit log (local), secrets redacted
- Signed updates (design in SECURITY.md; implement when distribution exists)

### 7.3 OS adapters

Windows first, then macOS, Linux — path logic isolated behind traits/modules.

---

## 8. Slicer adapter architecture

### 8.1 Interface (conceptual)

```
detectInstalledSlicer()
supportedVersions()
importPreset() / exportPreset()
convertCanonicalProfileToPreset()
convertPresetToCanonicalProfile()
installPreset() / validatePreset() / removePreset() / listInstalledPresets()
```

Install/list/remove that touch disk run **in the bridge**. Pure conversion may run in API or bridge.

### 8.2 Correct data flow

```
Canonical → Creality
Canonical → Orca
Canonical → Prusa (future)
```

Never Creality → Orca → Prusa chains.

### 8.3 Phase discipline

1. **Phase 7:** Creality Print research only → `CREALITY_PRINT_RESEARCH.md` (KNOWN / OBSERVED / INFERRED / UNKNOWN).
2. **Phase 8:** Adapter with backup/install/validate/rollback.
3. Orca parallelized after Creality path is credible.

---

## 9. RFID architecture

### 9.1 Split

| Concern | Component |
|---------|-----------|
| Encoding semantics | `RfidCodec` (e.g. `CrealityCfsCodec`) |
| Hardware I/O | `TagTransport` (PC/SC, PN532, …) |
| Scheme registry | DB `rfid_schemes` + mappings |
| Identity | Canonical filament UUID ≠ tag UID ≠ vendor payload |

### 9.2 Write workflow (always)

detect → read → backup → encode → write → read-back → verify → success  

No success without verification.

### 9.3 Research before codec

Phase 10 produces `CREALITY_CFS_RFID_RESEARCH.md` with citations. Phase 11 implements pure codec + binary fixtures. No copying of incompatible licensed code; reimplement from documented protocol knowledge.

### 9.4 OpenFilament native RFID (optional, deferred)

Tiny payload: schema + version + filament UUID + checksum. Full profile stays server/cache-side.

---

## 10. Community aggregation (Phase 3)

Do **not** arithmetic-mean all submissions.

Planned deterministic algorithm (document in `docs/AGGREGATION.md` when implemented):

1. Filter to matching context (printer revision, nozzle diameter, …).
2. Drop incomplete metrics (nulls never treated as 0).
3. Weight by trust score within bounded influence (cap so one user cannot dominate).
4. IQR-based outlier exclusion (or MAD); record excluded count.
5. Aggregate with **median** (primary) / trimmed mean (secondary report).
6. Emit: recommended value, observed range, n, excluded outliers, confidence derived from **explicit rules** (sample size + dispersion thresholds), algorithm version.

Example from spec: `{29,30,31,31,45}` → recommend ~30–31, exclude 45, high confidence if rules met.

---

## 11. Phased implementation sequence

Aligned with master spec §49. Each phase ends with: tests, lint, migration check, API contract check (when applicable), change report, remaining issues.

| Phase | Name | Deliverable |
|-------|------|-------------|
| **0** | Repository audit | CURRENT_STATE.md + this plan (**done**) |
| **1** | Domain foundation | Users, manufacturers, materials, products, variants, printers, toolheads, plates; migrations; fixtures; API models; tests |
| **2** | Calibration engine | Profiles, observations, versioning, evidence, lifecycle |
| **3** | Community aggregation | Confirm/fail, trust, robust recommend, documented algorithm |
| **4** | Web application | Search, pages, submit, compare, contribution history |
| **5** | Public API hardening | OpenAPI, rate limits, tokens, scopes |
| **6** | OpenFilamentProfile v1 | JSON Schema, validate, import/export |
| **7** | Creality Print research | CREALITY_PRINT_RESEARCH.md only |
| **8** | Creality Print adapter | Canonical ↔ preset; backup/rollback |
| **9** | Local bridge | Health, auth, slicer detect/install, backups |
| **10** | CFS RFID research | CREALITY_CFS_RFID_RESEARCH.md |
| **11** | CFS RFID codec | Pure encode/decode + fixtures |
| **12** | RFID hardware transport | First TagTransport + verify workflow |
| **13** | Website RFID workflow | Write UI via bridge |
| **14** | CFS profile mapping | Tag → DB UUID → installed preset mapping |

**MVP gate (spec §51):** Phases 1–6 + Creality export path sufficiently usable (research+adapter may partially land) before RFID.

---

## 12. Documentation plan (§48)

Create as phases land (do not invent empty stubs that claim completeness):

| Doc | When |
|-----|------|
| README.md | Scaffold |
| ARCHITECTURE.md | After scaffold + Phase 1 |
| DATABASE.md | With M1–M3 |
| API.md | Phase 5 (draft earlier) |
| CANONICAL_PROFILE_SCHEMA.md | Phase 6 |
| SLICER_ADAPTERS.md | Phase 7–8 |
| CREALITY_INTEGRATION.md | Phase 8 |
| CREALITY_PRINT_RESEARCH.md | Phase 7 |
| RFID_ARCHITECTURE.md | Phase 10–11 |
| CREALITY_CFS_RFID.md / RESEARCH | Phase 10–11 |
| PRODUCT_ACCESSIBILITY_AND_IDENTIFICATION.md | Product/UX companion (QR + RFID parity, progressive UX) |
| LOCAL_BRIDGE.md | Phase 9 |
| SECURITY.md | Bridge + API auth |
| CONTRIBUTING.md / DEVELOPMENT.md / TESTING.md | Scaffold |
| ROADMAP.md | Mirror phases |
| AGGREGATION.md | Phase 3 |

---

## 13. Major technical risks

| Risk | Mitigation |
|------|------------|
| Creality preset/CFS formats undocumented or change often | Research phases with source citations; adapter version matrix; feature flags |
| CFS RFID auth/encryption unknown or legally messy | Research + license review; fixtures; no incompatible code copy |
| Lossy color mapping for vendor RFID | Explicit UI warning; store mapping confidence |
| Bridge security holes (filesystem/NFC) | Allowlists, origin checks, no shell-out, threat model in SECURITY.md |
| Aggregation gamed by sockpuppets | Trust caps, revision-bound confirms, moderation |
| Premature multi-slicer scope | Creality + Orca only until MVP |
| Search quality | Normalized aliases + trigram; evaluate Meilisearch later |
| Dual language monorepo friction | Clear package boundaries; JSON Schema as lingua franca |
| Users expect invented “real” calibrations | Synthetic fixtures only; provenance required |

---

## 14. Unresolved questions

Decisions needed before or during early scaffolding (do not silently invent production facts):

1. **Public project name / package namespace / domain** — `open-filament` working title; trademark check later.
2. **API framework final pick** — Fastify vs Hono vs Nest (lean Fastify).
3. **ORM** — Drizzle vs Prisma (lean Drizzle for SQL transparency).
4. **Bridge TLS** — `https://localhost` with local CA vs loopback HTTP + strict token; prefer secure local protocol design in SECURITY.md before Phase 9.
5. **First NFC hardware** — ACR122U/PC/SC vs PN532; decide after Phase 10 research and availability.
6. **Hosting** — self-host vs managed Postgres/object storage for production community instance.
7. **License** — Apache-2.0 vs MIT vs AGPL (community + adapter implications); decide before accepting external contributions/code.
8. **Creality Print source availability** — which version/repo to trace in Phase 7; mirror policy.
9. **Whether printer manufacturers share the `manufacturers` table** or a separate `printer_manufacturers` table (recommend single table + `entity_kinds` / role flags).
10. **Parameter storage shape** — wide typed columns vs JSONB + JSON Schema; recommend **typed columns for aggregatable fields**, JSONB only under versioned `extensions`.

---

## 15. Explicit non-goals for Phase 1

Phase 1 implements **domain foundation only**. Out of scope:

- RFID encode/write/hardware
- Slicer install / bridge
- Community aggregation algorithm
- Full calibration wizard UX
- OpenFilamentProfile v1 publication (schema stub OK only if needed for types)
- Creality/Orca conversion
- Social features, commerce, ads, AI recommendations
- New slicer / firmware / cloud slicing / remote printer control
- Meilisearch / multi-region deploy
- OAuth providers
- Automatic merge of duplicate filaments
- Inventing real-world calibration numbers for Flashforge ASA Burnt Titanium

Phase 1 **does** include: migrations, validation, seed/fixtures (synthetic), API read/write models for catalog entities, unit/integration tests against Postgres, CONTRIBUTING/DEVELOPMENT stubs, README.

---

## 16. Definition of ready to start Phase 1

- [x] Repository audit complete (`CURRENT_STATE.md`)
- [x] This plan internally consistent
- [ ] User confirmation of stack defaults (or requested changes)
- [ ] License choice recorded
- [ ] Scaffold monorepo + CI skeleton
- [ ] First migration M1–M3 implemented with tests

**Implementation must not begin generating application code until stack/license confirmation**, unless the user explicitly authorizes proceeding with the defaults in §2.2 and a provisional license (e.g. Apache-2.0).

---

## 17. Immediate next actions (after approval)

1. Confirm stack + license.
2. Scaffold monorepo (`apps/api`, `apps/web`, `packages/db`, docs README).
3. Add CI: typecheck, lint, test, migrate.
4. Implement Phase 1 domain tables + synthetic Flashforge/Creality fixtures.
5. Stop and report before Phase 2.

---

## 18. Success criterion (ongoing)

> Can a user calibrate a third-party filament once and reuse that trustworthy profile across computers, slicers, and compatible identification systems without being locked into a proprietary filament ecosystem?

Every design review must answer that question. If a change makes vendor lock-in easier or treats RFID/slicer blobs as source of truth, reject it.
