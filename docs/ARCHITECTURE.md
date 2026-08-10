# Architecture

Open Filament separates **canonical domain data** from **adapters**.

```
Web (Next.js) ──HTTP──► API (Fastify) ──► SQLite (Drizzle)
                              │
                              ├── canonical-profile
                              ├── slicer-creality / slicer-orca
                              └── rfid-cfs (CFS-compatible codec)
Local Bridge (Rust, loopback) ── slicer install + RFID simulate
```

## Invariants

1. Database / domain model is source of truth.
2. Slicer JSON and RFID bytes are derived adapters.
3. Unknown numbers are `null`, never sentinel `0`.
4. Manufacturer claims ≠ community calibrations.
5. Seed / synthetic fixtures are always flagged.
6. Web never talks to arbitrary filesystem paths; bridge owns allowlisted installs and RFID simulate.

## Monorepo layout

- `apps/web`, `apps/api`, `apps/bridge`
- `packages/db`, `domain`, `canonical-profile`, `slicer-*`, `rfid-cfs`
- `schemas/` published OpenFilamentProfile JSON Schema copy
- `docs/` architecture and research notes

## Trust boundaries

- Public read APIs are unauthenticated.
- Profile create / confirm / failure require Bearer tokens (hashed in `api_tokens`).
- Bridge binds loopback only with shared-secret token + filament path allowlist (see SECURITY.md).
