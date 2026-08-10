# Security

## Current MVP posture

- API tokens stored as SHA-256 hashes (`api_tokens.token_hash`).
- Passwords hashed with scrypt.
- CORS limited to `WEB_ORIGIN`.
- Bridge loopback-only; stub session is **not** a trust boundary.
- No RFID hardware writes in-tree.

## Threat notes

- Do not expose API or bridge to the public internet without authn/authz hardening.
- Synthetic seed passwords are for local demo only — change before any shared deploy.
- RFID encode endpoint returns research stubs; never imply hardware safety.

## Deferred

OAuth, rate limits, evidence EXIF stripping, bridge origin checks, path allowlists, audit completeness.
