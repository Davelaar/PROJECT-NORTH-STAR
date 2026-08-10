# Stripe one-time payment (My Spools Cloud)

## Configuration

```text
STRIPE_SECRET_KEY=sk_test_… or sk_live_…
STRIPE_WEBHOOK_SECRET=whsec_…
STRIPE_MY_SPOOLS_CLOUD_PRICE_ID=price_…   # must be type=one_time
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_…
STRIPE_MODE=test|live
MY_SPOOLS_CLOUD_LIVE_PAYMENTS=false       # must be true for live checkout
MY_SPOOLS_CLOUD_PRICE_EUR_CENTS=1999
MY_SPOOLS_CLOUD_ACCESS_MONTHS=12
```

## Checkout

- API: `POST /api/v1/billing/cloud/checkout` (authenticated, rate-limited)
- Stripe Checkout Session: `mode: payment`
- Line item: server-selected `STRIPE_MY_SPOOLS_CLOUD_PRICE_ID`
- Metadata (minimal): `openfilament_account_id`, `openfilament_payment_uuid`, `purchase_type=my_spools_cloud_12_months`, `checkout_version`
- **Never** set `setup_future_usage`
- **Never** create Subscriptions / Billing Schedules / recurring Prices

## Code audit checklist

- [x] No `stripe.subscriptions.create`
- [x] No recurring Price in product setup script
- [x] No `setup_future_usage`
- [x] No off-session charge path
- [x] Entitlement only after verified webhook + `payment_status=paid` + PI `succeeded`

## Live enablement

Live checkout stays blocked until `MY_SPOOLS_CLOUD_LIVE_PAYMENTS=true` and legal/tax seller fields are completed (see `CLOUD_LAUNCH_CHECKLIST.md`).
