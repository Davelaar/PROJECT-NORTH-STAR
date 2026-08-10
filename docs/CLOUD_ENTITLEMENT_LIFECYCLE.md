# Cloud entitlement lifecycle

Statuses: `inactive` → `active` → `grace_period` → `read_only` → `expired` (also `refunded` / `disputed` / `revoked`).

Access modes:

- `full` / `grace` — Cloud write + sync
- `read_only` — export only
- `none` — no Cloud inventory access after deletion

Calendar arithmetic uses UTC month clamping (28/29/30/31).

Idempotency: unique grant per `payment_id`; duplicate webhooks cannot stack twice.
