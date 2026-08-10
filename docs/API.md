# API

Base URL default: `http://127.0.0.1:8787`

OpenAPI: `GET /openapi.json`

## Conventions

- Prefix: `/api/v1/`
- Errors: `{ "error": { "code", "message", "details?" } }`
- Auth: `Authorization: Bearer <token>` from `/auth/login` or `/auth/register` (token hashed in DB)

## Endpoints (summary)

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | no |
| GET | `/manufacturers`, `/manufacturers/:uuid` | no |
| GET | `/materials` | no |
| GET | `/filaments`, `/filaments/:uuid`, `/filaments/:uuid/variants` | no |
| GET | `/variants/:uuid`, `/profiles`, `/recommendation` | no |
| GET | `/profiles/:uuid`, `/profiles/:uuid/revisions` | no |
| POST | `/profiles` | yes |
| POST | `/profiles/:uuid/confirm`, `/failure` | yes |
| GET | `/printers`, `/printers/:uuid` | no |
| GET | `/search?q=` | no |
| GET | `/rfid/schemes` | no |
| POST | `/rfid/encode` | no (CFS plaintext + ciphertext) |
| POST | `/rfid/verify` | no (decrypt + parse) |
| POST | `/exports/creality`, `/orca`, `/openfilamentprofile` | no (creality/orca include `bridgeInstallPayload`) |
| POST | `/auth/login`, `/auth/register` | no |

CORS allows `WEB_ORIGIN` (default `http://127.0.0.1:3000`).
