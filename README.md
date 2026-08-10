# Open Filament

Open community filament intelligence platform: canonical filament database, calibration evidence, slicer adapters, and optional RFID research stubs.

**Invariant:** The filament / calibration database is the source of truth. Slicer presets and RFID payloads are adapters — never the canonical model.

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | pnpm workspaces + Cargo workspace |
| DB | SQLite via `@open-filament/db` (Drizzle) |
| API | Fastify (`apps/api`) on `127.0.0.1:8787` |
| Web | Next.js 15 App Router (`apps/web`) on `:3000` |
| Bridge | Rust axum stub (`apps/bridge`) on `127.0.0.1:8788` |

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

Bridge stub:

```bash
cargo run -p open-filament-bridge
```

### Seed logins

Login accepts `username` or `email` plus `password`.

| Username | Email | Password |
|----------|-------|----------|
| `admin` | `admin@openfilament.local` | `admin-change-me` |
| `fixture_contributor` | `contributor@openfilament.local` | `contributor-change-me` |

Seed includes **SYNTHETIC** Flashforge ASA Burnt Titanium fixtures — not measured facts.

| Entity | Stable UUID |
|--------|-------------|
| Variant Burnt Titanium | `33333333-3333-4333-8333-333333333301` |
| Profile (primary TEST) | `66666666-6666-4666-8666-666666666601` |
| Revision 1 | `77777777-7777-4777-8777-777777777701` |

### What “done” means for v0.1

Working: catalog DB, calibrations + revisions, search, community aggregation, web UI, REST API, OpenFilamentProfile export, Creality/Orca **user-preset JSON export**, auth tokens.

Intentionally stubbed / research-only: real Creality Print disk install, real CFS RFID hardware protocol, bridge NFC transports. See `docs/ROADMAP.md`.

### Environment

| Variable | Default | Used by |
|----------|---------|---------|
| `DATABASE_URL` | `data/open-filament.sqlite` | API / db |
| `API_HOST` / `API_PORT` | `127.0.0.1` / `8787` | API |
| `WEB_ORIGIN` | `http://127.0.0.1:3000` | API CORS |
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8787` | Web |

## Packages

- `packages/domain` — validation, aggregation, quality
- `packages/db` — schema, migrate, seed, search
- `packages/canonical-profile` — OpenFilamentProfile v1
- `packages/slicer-creality` / `slicer-orca` — user preset exporters
- `packages/rfid-cfs` — CFS **research stub** codec (not real CFS)

## Docs

See [`docs/`](docs/) — start with [ARCHITECTURE.md](docs/ARCHITECTURE.md), [DEVELOPMENT.md](docs/DEVELOPMENT.md), and [RFID_ARCHITECTURE.md](docs/RFID_ARCHITECTURE.md).

## License

Apache-2.0
