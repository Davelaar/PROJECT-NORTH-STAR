# CURRENT STATE

**Updated:** 2026-08-10

Open Filament lives at `/Users/raymonddavelaar/Projects/open-filament` (Apache-2.0).

## Runtime

| Service | URL |
|---------|-----|
| Web | http://127.0.0.1:3000 |
| API | http://127.0.0.1:8787/api/v1 |
| Bridge | http://127.0.0.1:8788 |

## Spec status (honest)

| Area | Status |
|------|--------|
| MVP §51 (accounts → Creality export/import) | **Done** |
| Phases 1–11, 13–14 (software) | **Done** |
| Phase 12 physical PC/SC write | **Implemented behind flag**; requires reader + `--features pcsc` + `FEATURE_RFID_WRITE=true` |
| §53 physical CFS→printer recognition | **Blocked on hardware** — software encode/simulate/resolve/map-install verified |

Software acceptance: `./scripts/acceptance-software.sh` → `ACCEPTANCE_SOFTWARE_OK`.

## Verified working

- Search → Flashforge ASA Burnt Titanium
- Community recommendation (median/IQR + trust-weighted secondary)
- Creality Print install (backup + install + rollback)
- CFS encode / simulate write+verify / resolve → map-install
- Auth, publish/revise/fork, confirm/failure on published revision
- Evidence upload (JPEG re-encode, EXIF stripped)
- Calibration submit wizard (partial steps)
- QR short links `/f/{uuid}`
- OpenAPI at `/openapi.json`

## Stack

pnpm monorepo · SQLite/Drizzle · Fastify · Next.js 15 · Rust bridge · CFS AES codec

## Docs (§48)

See `docs/` — ARCHITECTURE, API, DATABASE, CANONICAL_PROFILE_SCHEMA, SLICER_ADAPTERS, CREALITY_*, RFID_*, LOCAL_BRIDGE, SECURITY, TESTING, ROADMAP, CONTRIBUTING, DEVELOPMENT.
