# Open Filament

Open community filament intelligence platform: canonical filament database, calibration evidence, slicer adapters, and CFS-compatible RFID encode/simulate.

**Invariant:** The filament / calibration database is the source of truth. Slicer presets and RFID payloads are adapters — never the canonical model.

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | pnpm workspaces + Cargo workspace |
| DB | SQLite via `@open-filament/db` (Drizzle) |
| API | Fastify (`apps/api`) on `127.0.0.1:8787` |
| Web | Next.js 15 App Router (`apps/web`) on `:3000` |
| Bridge | Rust axum (`apps/bridge`) on `127.0.0.1:8788` |

## Prerequisites

- Node.js 22+
- pnpm 9+
- Rust toolchain (for bridge)

## Quick start

```bash
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:$PATH"

pnpm install
pnpm -r --filter './packages/*' build
pnpm db:reset
pnpm test
pnpm dev
```

Then open the **web UI** (not the API port):

- Web: http://127.0.0.1:3000
- API: http://127.0.0.1:8787/api/v1/health

`pnpm dev` starts **both**. Opening only `:8787` in a browser used to look like a 404; the API root now redirects browsers to the web UI.

Local bridge (preset install + CFS simulate):

```bash
cargo run -p open-filament-bridge
# optional dry-run install root:
# export OF_BRIDGE_FILAMENT_ROOT_OVERRIDE=/tmp/of-filament-test
```

Default bridge token: `local-dev-token` (header `X-OF-Bridge-Token`).

### Seed logins

Login accepts `username` or `email` plus `password`.

| Username | Email | Password |
|----------|-------|----------|
| `admin` | `admin@openfilament.local` | `admin-change-me` |
| `fixture_contributor` | `contributor@openfilament.local` | `contributor-change-me` |

Seed includes Flashforge ASA Burnt Titanium **seed catalog** fixtures — examples, not measured community facts.

| Entity | Stable UUID |
|--------|-------------|
| Variant Burnt Titanium | `33333333-3333-4333-8333-333333333301` |
| Profile (primary TEST) | `66666666-6666-4666-8666-666666666601` |
| Revision 1 | `77777777-7777-4777-8777-777777777701` |

### What works in v0.1+

Working: catalog DB, calibrations + revisions + evidence, search, community aggregation, submit/import/admin web UI, REST API + OpenAPI, OpenFilamentProfile import/export, **Creality Print / Orca install** (backup/rollback), **CFS RFID encode/simulate/write-policy/resolve→map-install**.

Physical PC/SC write is implemented behind `FEATURE_RFID_WRITE=true` + `--features pcsc`; without hardware, software §53 path is verified by `./scripts/acceptance-software.sh`.

See `docs/ROADMAP.md` and `docs/CURRENT_STATE.md`.

### Environment

| Variable | Default | Used by |
|----------|---------|---------|
| `DATABASE_URL` | `data/open-filament.sqlite` | API / db |
| `API_HOST` / `API_PORT` | `127.0.0.1` / `8787` | API |
| `WEB_ORIGIN` | `http://127.0.0.1:3000` | API CORS |
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8787` | Web |
| `OF_BRIDGE_TOKEN` | `local-dev-token` | Bridge |
| `OF_BRIDGE_FILAMENT_ROOT_OVERRIDE` | unset | Bridge test install dir |

## Packages

- `packages/domain` — validation, aggregation, quality
- `packages/db` — schema, migrate, seed, search
- `packages/canonical-profile` — OpenFilamentProfile v1
- `packages/slicer-creality` / `slicer-orca` — installable user preset exporters
- `packages/rfid-cfs` — CFS-compatible codec (community RE; not affiliated with Creality)

## Docs

See [`docs/`](docs/) — start with [ARCHITECTURE.md](docs/ARCHITECTURE.md), [DEVELOPMENT.md](docs/DEVELOPMENT.md), and [CREALITY_CFS_RFID.md](docs/CREALITY_CFS_RFID.md).

## License

Apache-2.0
