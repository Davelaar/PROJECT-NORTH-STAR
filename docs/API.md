# API

Base URL default: `http://127.0.0.1:8787`

OpenAPI: `GET /openapi.json`

## Conventions

- Prefix: `/api/v1/`
- Errors: `{ "error": { "code", "message", "details?" } }`
- Auth:
  - Browser web app: httpOnly `of_session` cookie from `/auth/login` or `/auth/register`; mutating requests include `X-CSRF-Token` matching the readable `of_csrf` cookie.
  - API/script clients: `Authorization: Bearer <token>` remains supported; raw tokens are hashed in DB.
- Rate limit: `@fastify/rate-limit` (default enabled)
- Scopes: `read:filaments`, `write:profiles`, `write:calibrations`, `write:rfid`, `moderate`

## Endpoints (summary)

| Method | Path | Auth |
|--------|------|------|
| GET | `/health`, `/features` | no |
| GET | `/manufacturers`, `/materials`, `/filaments`, `/variants/:uuid` | no |
| GET | `/variants/:uuid/recommendation`, `/qr` | no |
| GET | `/profiles/:uuid`, `/revisions` | no |
| POST | `/profiles` | yes |
| POST | `/profiles/:uuid/publish`, `/revise`, `/fork` | yes |
| POST | `/profiles/:uuid/confirm`, `/failure` | yes (targets published revision) |
| POST | `/revisions/:uuid/observations`, `/evidence` | yes |
| GET | `/printers`, `/toolheads`, `/build-plates` | no |
| GET | `/search?q=` | no |
| GET | `/rfid/schemes`, `/rfid/resolve` | no |
| POST | `/rfid/encode`, `/verify`, `/resolve-and-export` | encode/verify public |
| GET | `/variants/:uuid/openprinttag` | no |
| POST | `/variants/:uuid/openprinttag/encode` | no |
| POST | `/exports/{creality,orca,prusaslicer,bambu,openfilamentprofile}` | no |
| GET | `/variants/:uuid/exports/starter?format=...` | no |
| POST | `/imports/{creality,openfilamentprofile}` | yes |
| POST | `/auth/login`, `/auth/register`, `/auth/logout` | no / session for logout |
| GET | `/me/contributions`, `/admin/summary` | yes |

CORS allows `WEB_ORIGIN` (default `http://127.0.0.1:3000`).
