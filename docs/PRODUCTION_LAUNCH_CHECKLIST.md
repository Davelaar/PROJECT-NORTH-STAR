# Production launch checklist

## Implemented in code

- [x] My Spools local IndexedDB
- [x] Optional cloud sync with explicit confirm
- [x] Ownership checks + public QR projection
- [x] Account export / delete / sessions
- [x] Cookie consent UI (Accept / Reject / Manage)
- [x] GA4 gated behind analytics consent
- [x] Privacy / cookies / terms / security / trust pages
- [x] robots + sitemap + metadata helpers + JSON-LD
- [x] CSP + security headers
- [x] Search autocomplete + bounded homepage sections
- [x] Data inventory / retention / subprocessors docs

## Automatically tested

- [x] Unit consent defaults
- [x] Spool ownership / public projection / account delete (db tests)
- [ ] Playwright consent network (requires `pnpm e2e`)

## Owner input required (launch blockers)

- [ ] `NEXT_PUBLIC_LEGAL_OWNER_NAME` — legal person or company that operates the site (this is what drives the yellow banner)
- [x] Privacy / security email — `info@openfilament.nl`
- [x] Hosting — self-hosted VPS + SQLite on-server, EU (Germany); override via env if wrong
- [ ] Confirm subprocessors + DPAs (Stripe/Google only if enabled)
- [ ] Backup schedule + deletion-replay runbook
- [ ] Legal review of Privacy / Terms (NL AVG)
- [ ] Rotate seed admin passwords in production

## Optional: Google + Stripe for go-live

### Google (only if you want analytics)
- [ ] GA4 Measurement ID → `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXX` (consent-gated; omit = no Google Analytics)
- [ ] Optional Search Console (verification TXT may already exist)

### Stripe (only before real payments)
- [x] Test keys on server (`pk_test_` / `sk_test_`) for development
- [ ] Live keys `pk_live_` / `sk_live_` before charging customers
- [ ] Webhook secret `STRIPE_WEBHOOK_SECRET=whsec_…` when webhooks are wired
- [ ] Stripe Dashboard business profile (legal entity, support email, bank for payouts)

## Legal review recommended

- [ ] Contribution anonymization policy
- [ ] Affiliate disclosure if Amazon links remain
- [ ] Supervisory authority text for non-NL operators

## Banner behavior

Production shows a yellow banner until `NEXT_PUBLIC_LEGAL_OWNER_NAME` is set and the web app is rebuilt. Do not treat placeholder privacy text as final legal advice.
