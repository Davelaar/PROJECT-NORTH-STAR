# My Spools Cloud architecture

## Local vs Cloud

| Mode | Price | Storage | Account |
|------|-------|---------|---------|
| My Spools Local | Free | Browser IndexedDB | Not required |
| My Spools Cloud | €19.99 / 12 months one-time | SQLite on OpenFilament VPS | Required |

Local remains complete for inventory. Cloud adds sync, server backup and multi-device access.

## Payment provider abstraction

`OneTimeCloudAccessPaymentProvider` (`apps/api/src/payments/types.ts`) is provider-neutral.
Current implementation: `StripeOneTimeCloudProvider` with **Checkout `mode: payment` only**.

Authorization for Cloud writes uses **internal entitlements/grants**, never a live Stripe call on each request.

## Stripe mode and live-payment gate

The offer endpoint reports `stripeMode`, `livePaymentsEnabled` and `checkoutAvailable` so the UI can distinguish:

- Stripe test mode: real payments are not enabled.
- Live keys present but `MY_SPOOLS_CLOUD_LIVE_PAYMENTS` is not `true`: checkout remains blocked by the production safety flag.
- Missing price/key configuration: checkout is unavailable until Stripe config is completed.

This is surfaced on `/my-spools/cloud`; the generic “configuration pending” message is only a fallback.

## Entitlement model

- `cloud_payments` — one row per Checkout attempt / payment
- `cloud_entitlement_grants` — ledger rows (one per successful payment; unique on `payment_id`)
- `cloud_entitlements` — derived status snapshot (`paid_until` = max active grant `ends_at`)

Stacking: while `paid_until` is in the future, a new payment adds 12 calendar months to `paid_until`.
After expiry, a new payment starts from the payment effective time.

## Retention lifecycle

1. Active until `paid_until`
2. Grace (`MY_SPOOLS_CLOUD_GRACE_DAYS`, default 14) — sync still allowed
3. Read-only until grace + retention — export allowed, writes blocked
4. Deletion of Cloud spool inventory; payment records retained

## Hard product rule

**My Spools Cloud never renews automatically.**
