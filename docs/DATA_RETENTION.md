# Data retention

| Data | Retention | Mechanism |
|------|-----------|-----------|
| Active accounts | Until user deletes | `/api/v1/me/delete` |
| Soft-deleted spools | 30 days then hard purge | `purgeSoftDeletedSpools` (ops job) |
| API tokens | Until revoke / optional expiry | Revoke on delete / session UI |
| Consent prefs (account) | Until overwrite / account delete | `user_privacy_prefs` |
| Local My Spools | Until user clears browser data | IndexedDB |
| Audit log | 180 days recommended | Ops rotation `[OWNER]` |
| Server access logs | 14–30 days recommended | Host logrotate `[OWNER]` |
| Analytics | GA property setting (prefer ≤14 months) | `[OWNER]` configure in GA |
| Backups | Backup window (e.g. 7–30 days) | `[OWNER]` — deletion not instant from backups |
| Contribution terms acceptances | With contribution / account policy | DB rows |

**Backup honesty:** Restored backups may temporarily resurrect deleted accounts until a deletion-replay job runs. Document operator runbook before promising instantaneous erasure.
