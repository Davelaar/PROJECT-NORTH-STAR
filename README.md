# Open Filament

Open community filament intelligence platform: canonical filament database, measured calibration evidence, calculated starter profiles, slicer adapters, QR/RFID identification, and My Spools inventory tools — delivered as a **web-first Progressive Web App**.

**Production:** [https://openfilament.nl](https://openfilament.nl) (HTTPS via Caddy — see `docs/DEPLOYMENT.md`).

**Invariant:** The filament / calibration database is the source of truth. Slicer presets and RFID payloads are adapters — never the canonical model.

**Doctrine:** Fully browser-based wherever reliable. No required desktop app or OS installer for core use. An optional local helper may exist only for documented browser gaps (see [`docs/LOCAL_BRIDGE.md`](docs/LOCAL_BRIDGE.md)).

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | pnpm workspaces + Cargo workspace |
| DB | SQLite via `@open-filament/db` (Drizzle) |
| API | Fastify (`apps/api`) on `127.0.0.1:8787` |
| Web / PWA | Next.js 15 App Router (`apps/web`) on `:3000` |
| Optional helper | Rust axum (`apps/bridge`) on `127.0.0.1:8788` |

## Prerequisites

- Node.js 22+
- pnpm 9+
- Rust toolchain **only if** you run the optional helper

## Quick start

```bash
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:$PATH"

pnpm install
pnpm -r --filter './packages/*' build
pnpm db:reset

# Recommended: detached local stack (API + web; bridge optional)
pnpm stack:start
# stop with: pnpm stack:stop
```

Or foreground (dies when the shell dies): `pnpm dev`

Then open the **web UI**:

- Web: http://127.0.0.1:3000
- API health: http://127.0.0.1:8787/api/v1/health

Deploy web+API to a VPS: see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Optional helper (advanced — not required for download/import or catalog use):

```bash
cargo run -p open-filament-bridge
# optional dry-run install root:
# export OF_BRIDGE_FILAMENT_ROOT_OVERRIDE=/tmp/of-filament-test
```

Default helper token: `local-dev-token` (header `X-OF-Bridge-Token`).

### Public site

Browse, search, export, QR, RFID, compatibility and usage-tracking docs need **no login**. The public site is localized in English, Dutch, German, French, Spanish, Portuguese, Russian, Ukrainian and Simplified Chinese. Contributions (data and code) go through GitHub — see [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) and [/contribute](https://openfilament.nl/contribute).

### Seed logins (operators only)

Maintainer routes (`/login`, `/admin`) are optional and not linked in the main menu. Login accepts `username` or `email` plus `password`.

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

### What works

Working: catalog DB, calibrations + revisions + evidence, search, community aggregation, submit/import/admin web UI, REST API + OpenAPI, OpenFilamentProfile import/export, **slicer preset download** (Orca / Creality / Prusa / Bambu), calculated starter-profile exports for missing exact matches, optional File System Access save, PWA shell, QR short links + **label PNG/SVG/PDF** + **camera scan**, CFS RFID encode/resolve/**browser write+verify**, OpenPrintTag NDEF/CBOR encode + Web NFC write path, My Spools Local manual inventory with gram-based usage ledger, and optional My Spools Cloud sync/billing.

Print-usage tracking is transparent by design: slicer values are estimates, completed-print deductions require confirmation unless a compatible printer/print-host integration reports usage, and “actual usage” is reserved for physical measurement. See `docs/PRINT_USAGE_TRACKING_SOURCES.md` and `/compatibility`.

Optional helper: Creality/Orca/etc. allowlisted install + CFS simulate / policy-gated PC/SC write.

See `docs/ROADMAP.md` and `docs/CURRENT_STATE.md`.

### Environment

| Variable | Default | Used by |
|----------|---------|---------|
| `DATABASE_URL` | `data/open-filament.sqlite` | API / db |
| `API_HOST` / `API_PORT` | `127.0.0.1` / `8787` | API |
| `WEB_ORIGIN` | `http://127.0.0.1:3000` (prod: `https://openfilament.nl,…`) | API CORS |
| `NEXT_PUBLIC_API_URL` | `http://127.0.0.1:8787` (empty in Docker same-origin) | Web |
| `OF_BRIDGE_TOKEN` | `local-dev-token` | Optional helper |
| `OF_BRIDGE_FILAMENT_ROOT_OVERRIDE` | unset | Helper test install dir |
| `SESSION_SECRET` / `ACME_EMAIL` | see `.env.example` | Production Compose / Caddy |

Catalog import ([Open Filament Database](https://openfilamentdatabase.org), MIT) + OpenPrintTag linkage ([spec](https://specs.openprinttag.org/)):

```bash
pnpm db:fetch-ofd
pnpm db:import-ofd
```

See `docs/EXTERNAL_CATALOG.md`, `docs/FILAMENT_PARAMETERS.md`, `docs/OPENPRINTTAG.md`, and `docs/DEPLOYMENT.md`.

## Packages

- `packages/domain` — validation, aggregation, quality
- `packages/db` — schema, migrate, seed, search
- `packages/canonical-profile` — OpenFilamentProfile v1
- `packages/slicer-creality` / `slicer-orca` / `slicer-prusa` / `slicer-bambu` — exporters
- `packages/rfid-cfs` — CFS-compatible codec (community RE; not affiliated with Creality)
- `packages/rfid-openprinttag` — OpenPrintTag UUID derivation + catalog field mapping + NDEF/CBOR encode

## License

Apache-2.0
