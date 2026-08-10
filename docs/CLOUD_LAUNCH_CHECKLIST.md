# Cloud launch checklist

## Implemented

- [x] One-time Stripe Checkout (`mode: payment`)
- [x] Internal entitlements + grant ledger
- [x] Webhook signature + idempotency
- [x] Purchase / success / billing UI
- [x] Local remains free
- [x] Live payments feature flag
- [x] Docs + automated entitlement tests

## Owner actions before live charges

- [ ] Complete Stripe account verification
- [ ] Create **live** one-time Product/Price (€19.99 EUR)
- [ ] Set live keys + webhook endpoint + `STRIPE_WEBHOOK_SECRET`
- [ ] Set `LEGAL_SELLER_NAME`, `LEGAL_SELLER_ADDRESS`, `LEGAL_TAX_ID`, `LEGAL_CONTACT_EMAIL`
- [ ] Decide `CLOUD_PRICE_DISPLAY_MODE=vat_inclusive|vat_exclusive`
- [ ] Configure Stripe Tax / receipts if required
- [ ] Approve refund policy with counsel
- [ ] Confirm grace/retention days
- [ ] Set `MY_SPOOLS_CLOUD_LIVE_PAYMENTS=true` only after the above

## Test mode today

Use `STRIPE_MODE=test` and test cards. Webhook forwarding: Stripe CLI
`stripe listen --forward-to localhost:8787/api/v1/billing/webhooks/stripe`

## Production readiness note

Last checked 2026-08-10: production still uses Stripe test keys
(`STRIPE_MODE=test`, `sk_test_`, `pk_test_`). Live charging is blocked until
live keys, live price, webhook secret, seller/tax/contact fields, and the legal
checklist above are complete. Do not treat `MY_SPOOLS_CLOUD_LIVE_PAYMENTS=true`
as sufficient by itself; `STRIPE_MODE=live` with `sk_live_` / `pk_live_` is
required before customers can be charged.
