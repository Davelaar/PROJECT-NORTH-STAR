# Security

## Production posture (openfilament.nl)

- **HTTPS only** in production via Caddy (`deploy/Caddyfile`) with Let’s Encrypt, HTTP→HTTPS redirect, and HSTS.
- Baseline headers on the edge (Caddy) and in Next.js (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`).
- CORS limited to `WEB_ORIGIN` (set to `https://openfilament.nl,https://www.openfilament.nl`).
- API is **not** published publicly in Compose — only reachable via Next same-origin `/api` rewrites.
- Optional helper (`apps/bridge`) is loopback-only with `X-OF-Bridge-Token` — never expose it on the VPS.

## Auth MVP

- API tokens stored as SHA-256 hashes (`api_tokens.token_hash`).
- Passwords hashed with scrypt.
- Browser stores Bearer tokens in **localStorage** (not httpOnly cookies). HTTPS is therefore mandatory for production; XSS remains a residual risk until cookie sessions land.
- `SESSION_SECRET` in Compose is a deployment secret placeholder — change it; cookie sessions are not yet implemented.

## Application notes

- PWA service worker caches **app shell only** — do not put authenticated or sensitive API responses in the shared shell cache.
- Hardware permissions (camera, USB, serial, HID, file pickers) must follow an explicit user gesture.
- RFID: API encode + verify; physical PC/SC write only via optional helper behind feature flag. Report write success only after read-back verification.
- CFS keys are community-published reverse-engineering constants for interoperability; treat tag writes as user-controlled device I/O.
- Do not upload raw tag dumps to the server unless functionally required and clearly disclosed.
- Spool pages must not leak owner/device private data in public views.
- Seed passwords are for local demo only — change before any shared deploy.

## Threat notes

- Do not expose API or the optional helper to the public internet without authn/authz hardening.
- Keep Docker `WEB_BIND` on `127.0.0.1` when Caddy fronts the site.

## Deferred

OAuth / httpOnly cookie sessions, stronger rate limits, CSP tighten, audit completeness, browser RFID transport hardening once more hardware is validated.
