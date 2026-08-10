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

- [ ] `NEXT_PUBLIC_LEGAL_OWNER_NAME`
- [ ] `NEXT_PUBLIC_LEGAL_PRIVACY_EMAIL` / security email
- [ ] `NEXT_PUBLIC_LEGAL_HOSTING_PROVIDER` + region
- [ ] Confirm subprocessors + DPAs
- [ ] Optional: `NEXT_PUBLIC_GA_MEASUREMENT_ID` + GA retention settings
- [ ] Backup schedule + deletion-replay runbook
- [ ] Legal review of Privacy / Terms (NL AVG)
- [ ] Rotate seed admin passwords in production

## Legal review recommended

- [ ] Contribution anonymization policy
- [ ] Affiliate disclosure if Amazon links remain
- [ ] Supervisory authority text for non-NL operators

## Blocked until owner config

Production builds show a visible banner when legal placeholders remain. Do not treat placeholder pages as final legal text.
