# ROADMAP

Aligned with master build specification phases.

| Phase | Deliverable | Status |
|-------|-------------|--------|
| 0 | Repository audit | Done |
| 1 | Domain foundation | Done (SQLite; Postgres optional later) |
| 2 | Calibration engine | Done — publish/revise/fork, observations, evidence |
| 3 | Community aggregation | Done (median/IQR + trust-weighted) |
| 4 | Web application | Done — search/submit/import/compare/me/admin/RFID/QR |
| 5 | Public API hardening | Done — scopes, rate limit, OpenAPI |
| 6 | OpenFilamentProfile v1 | Done (+ import path) |
| 7 | Creality Print research | Done |
| 8 | Creality Print adapter | Done (export/import/backup/install/rollback) |
| 9 | Local bridge | Done |
| 10 | CFS RFID research | Done |
| 11 | CFS RFID codec | Done |
| 12 | RFID hardware transport | Done (simulate always; PC/SC optional feature) |
| 13 | Website RFID workflow | Done |
| 14 | CFS profile mapping | Done (resolve + map-install) |

## Remaining (post-MVP / hardware)

- Physical MIFARE write validation on ACR122U (or similar) against real blank tags
- CFS firmware recognition of third-party tags on K2 Plus (device-dependent)
- Postgres + FTS for multi-user production
- Full offline sync / device registration (§34, §56–57)
- Broader slicer adapters beyond Creality/Orca

## Non-goals (still)

- New slicer / firmware / cloud slicing
- Commerce / ads / recommendation AI
- Every RFID ecosystem / every slicer

## Acceptance

```bash
./scripts/acceptance-software.sh
```
