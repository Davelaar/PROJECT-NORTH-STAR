# Cloud retention and deletion

Env:

- `MY_SPOOLS_CLOUD_GRACE_DAYS` (default 14)
- `MY_SPOOLS_CLOUD_RETENTION_DAYS` (default 90)

Cron: `POST /api/v1/billing/cloud/reminders/run` with `X-Cron-Secret` or admin bearer.

Actions:

- Send expiry reminders (explicit “no automatic renewal / no payment will be taken”)
- Purge Cloud spool inventory after `deletion_scheduled_at`
- Keep `cloud_payments` / grant audit for accounting

Export remains available during grace and read-only windows.
