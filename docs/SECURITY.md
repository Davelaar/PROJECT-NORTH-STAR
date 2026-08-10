# Security

## Production posture (openfilament.nl)

- **HTTPS only** in production via Caddy (`deploy/Caddyfile`) with Let’s Encrypt, HTTP→HTTPS redirect, and HSTS.
- Headers: `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (camera/usb/serial/hid self for QR/RFID).
- CORS limited to `WEB_ORIGIN`.
- API not published publicly — reached via Next `/api` rewrites.
- Global API rate limit (`API_RATE_LIMIT_MAX`, default 300/min) plus tighter limits on auth, exports, spool sync, autocomplete.
- Optional helper (`apps/bridge`) is loopback-only — never expose on the VPS.

## Auth

- Passwords: scrypt (`packages/db/src/password.ts`); never plaintext.
- API tokens: SHA-256 hashed at rest; sessions listed/revoked under `/account`.
- Deleted/suspended users cannot authenticate.
- Bearer tokens currently live in **localStorage** (XSS residual risk). Prefer future httpOnly cookie sessions.
- Account export: `GET /api/v1/me/export`. Account delete: `POST /api/v1/me/delete` with confirmation (+ password when provided).
- Public contributions may be **anonymized** on account deletion rather than hard-deleted.

## My Spools authorization

- Every cloud spool read/write checks `user_id` ownership server-side.
- Public QR/RFID resolve returns a **public projection** only (no notes, location, email, account id).
- Local IndexedDB mode never uploads without explicit sync confirmation.

## Logging

- Do not log passwords, raw tokens, Authorization headers, full cookies, RFID/QR secrets, or private spool notes.
- Prefer structured Fastify logs without request bodies in production.

## Responsible disclosure

Report privately to the security contact configured as `NEXT_PUBLIC_LEGAL_SECURITY_EMAIL` (see `/security`).

## Deferred / residual

- httpOnly cookie sessions + CSRF tokens
- Email magic links / passkeys (no email provider yet)
- Stronger CSP without `'unsafe-inline'`/`'unsafe-eval'` once Next nonce strategy lands
- Automated dependency scanning in CI
