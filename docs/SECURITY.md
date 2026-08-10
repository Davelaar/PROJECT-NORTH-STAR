# Security

## Production posture (openfilament.nl)

- **HTTPS only** in production via Caddy (`deploy/Caddyfile`) with Let’s Encrypt, HTTP→HTTPS redirect, and HSTS. This protects transport. It is separate from `httpOnly`, which is a cookie flag used to keep session tokens out of browser JavaScript.
- Headers: `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (camera/usb/serial/hid self for QR/RFID).
- CORS limited to `WEB_ORIGIN`.
- API not published publicly — reached via Next `/api` rewrites.
- Global API rate limit (`API_RATE_LIMIT_MAX`, default 300/min) plus tighter limits on auth, exports, spool sync, autocomplete.
- Optional helper (`apps/bridge`) is loopback-only — never expose on the VPS.

## Auth

- Passwords: scrypt (`packages/db/src/password.ts`); never plaintext.
- API tokens: SHA-256 hashed at rest; sessions listed/revoked under `/account`.
- Deleted/suspended users cannot authenticate.
- Browser sessions use httpOnly cookies plus CSRF tokens. Bearer tokens remain accepted for API/script clients, but the web UI must not persist raw tokens in `localStorage`.
- Account export: `GET /api/v1/me/export`. Account delete: `POST /api/v1/me/delete` with confirmation (+ password when provided).
- Public contributions may be **anonymized** on account deletion rather than hard-deleted.

## My Spools authorization

- Every cloud spool read/write checks `user_id` ownership server-side.
- Public QR/RFID resolve returns a **public projection** only (no notes, location, email, account id).
- Local IndexedDB mode never uploads without explicit sync confirmation.
- Usage transactions and print/job history are private inventory data. Cloud sync stores them owner-scoped under the spool and account export returns them only for the authenticated owner.
- Browser-first printer integrations must minimize data: local printer IPs, filenames, job metadata, API keys and tokens must not be sent to analytics and must not be public by default.
- Do not store local printer credentials in plaintext. Server-stored printer secrets require the approved secret-management/encryption design before any automatic integration is enabled.
- Integrations must be revocable. Experimental printer-reported usage must stay disabled unless the user explicitly configures and confirms it.

## Logging

- Do not log passwords, raw tokens, Authorization headers, full cookies, RFID/QR secrets, or private spool notes.
- Do not log local printer credentials, LAN addresses, printer tokens, job filenames or spool identifiers from usage tracking flows.
- Prefer structured Fastify logs without request bodies in production.

## Responsible disclosure

Report privately to the security contact configured as `NEXT_PUBLIC_LEGAL_SECURITY_EMAIL` (see `/security`).

## Deferred / residual

- Email magic links / passkeys (no email provider yet)
- Stronger CSP without `'unsafe-inline'`/`'unsafe-eval'` once Next nonce strategy lands
- Automated dependency scanning in CI
