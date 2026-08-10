# Security

## Current MVP posture

- API tokens stored as SHA-256 hashes (`api_tokens.token_hash`).
- Passwords hashed with scrypt.
- CORS limited to `WEB_ORIGIN`.
- Bridge loopback-only with `X-OF-Bridge-Token` shared secret and allowlisted filament directories.
- RFID: software encode/simulate only — no in-tree PC/SC hardware writes.

## Threat notes

- Do not expose API or bridge to the public internet without authn/authz hardening.
- Seed passwords are for local demo only — change before any shared deploy.
- CFS keys are community-published reverse-engineering constants for interoperability; treat tag writes as user-controlled device I/O.

## Deferred

OAuth, rate limits, evidence EXIF stripping, stronger bridge origin checks, audit completeness.
