# Database

SQLite file store via Drizzle ORM (`packages/db`). Path from `DATABASE_URL` or default `data/open-filament.sqlite`.

## Core tables

| Area | Tables |
|------|--------|
| Auth | `users`, `api_tokens` |
| Catalog | `manufacturers`, `material_families`, `filament_products`, `filament_variants` |
| Printers | `printer_models`, `toolhead_configs`, `build_plates` |
| Calibration | `calibration_profiles`, `calibration_revisions`, `raw_observations`, `evidence_assets` |
| Feedback | `profile_confirmations`, `profile_failure_reports` |
| RFID | `rfid_schemes`, `rfid_mappings` |
| Search | `search_documents` |
| Audit | `audit_log` |

Public IDs are UUIDs; internal PKs are integers.

Catalog + calibration parameter details: [`FILAMENT_PARAMETERS.md`](./FILAMENT_PARAMETERS.md). Default nozzle size for profiles: **0.4 mm**.

## Commands

```bash
pnpm db:generate   # drizzle-kit generate
pnpm db:migrate
pnpm db:seed       # no-op if already seeded
pnpm db:reset      # delete file + migrate + seed
pnpm db:fetch-ofd && pnpm db:import-ofd
```

Startup of the API calls `ensureMigrated` and seeds when the catalog is empty.

## Synthetic fixtures

Seed marks fixture rows with `is_synthetic_fixture = true`. Never present those temperatures/flows as measured community data.
