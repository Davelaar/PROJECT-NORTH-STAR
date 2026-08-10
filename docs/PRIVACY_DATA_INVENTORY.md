# Privacy data inventory

**Effective draft:** 2026-08-10  
**Status:** Technical inventory. Owner/legal review required before claiming GDPR compliance.

Placeholders marked `[OWNER MUST PROVIDE …]` are launch blockers.

| Category | Data | Purpose | Legal basis | Storage | Processor | Retention | Deletion | Export | Required | EEA transfer | Safeguards |
|----------|------|---------|-------------|---------|-----------|-----------|----------|--------|----------|--------------|------------|
| Accounts | uuid, username, display name, email, password hash, role, timestamps | Provide account features | Contract | SQLite on VPS | [OWNER MUST PROVIDE HOSTING PROVIDER] | Until account deletion | Anonymize + revoke | Yes (`/api/v1/me/export`) | Optional (browse without account) | Hosting region [OWNER MUST PROVIDE] | Access control, hashed passwords |
| Email | email address | Login / contact | Contract | SQLite | Same | Until deletion | Anonymized on delete | Yes | For accounts | Same | Not logged in app logs by default |
| Sessions | hashed API tokens, UA, last used | Authentication | Contract / security | SQLite | Same | Until revoke / expiry | Revoke on logout/delete | Metadata only (no raw token) | For signed-in use | Same | Hashed at rest |
| My Spools (local) | Full spool records in IndexedDB | Local inventory | Contract / consent to feature | Browser | User device | Until user clears | User clear/export | Local JSON export | Optional | N/A | Not uploaded automatically |
| My Spools (cloud) | Same + ownership | Cross-device sync | Contract | SQLite | Hosting | Soft-delete then purge (~30d) | Soft + hard delete; account delete purges | Yes | Optional | Same | Ownership checks |
| QR / RFID identities | identity values linked to spool | Identification | Contract | SQLite / local | Hosting / device | With spool | With spool | Yes | Optional | Same | Public resolve omits private fields |
| Contributions | profiles/revisions, display attribution | Community catalog | Consent / contract at submit | SQLite | Hosting | Long-lived public data | Anonymize author on account delete | Titles/status | Optional | Same | Email not public |
| Moderation | audit_log | Abuse / integrity | Legitimate interest | SQLite | Hosting | See DATA_RETENTION | Admin tools | Limited | Ops | Same | Minimize PII in metadata |
| Server logs | request metadata | Ops / security | Legitimate interest | Host logs | Hosting | Short (see retention) | Rotate | No | Ops | Same | Redact secrets |
| Analytics | GA4 events after consent | Product improvement | Consent | Google | Google | GA retention config | Withdrawal stops future; cookie clear | N/A | Optional | Possible US | Consent Mode; no PII events |
| Backups | DB snapshots | Disaster recovery | Legitimate interest | [OWNER MUST PROVIDE] | [OWNER MUST PROVIDE] | Backup window | Expiry (not instant) | N/A | Ops | [OWNER] | Encryption at rest if configured |
| Email delivery | Not implemented | — | — | — | — | — | — | — | — | — | Magic links deferred |
| Uploads / evidence | evidence_assets refs | Calibration evidence | Contract | SQLite + files if used | Hosting | With contribution policy | Documented | Limited | Optional | Same | Access controls |

Contact for data-subject requests: `[OWNER MUST PROVIDE PRIVACY CONTACT EMAIL]` (env `NEXT_PUBLIC_LEGAL_PRIVACY_EMAIL`).
