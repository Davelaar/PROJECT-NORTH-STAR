# Cookie consent implementation

## Model

- Consent version: `NEXT_PUBLIC_CONSENT_VERSION` (default `2026-08-10`)
- Storage: `of_consent` cookie + `of_consent_v1` localStorage
- Categories: Necessary (always on), Preferences, Analytics, Marketing (unused/disabled)
- Default: analytics and marketing **denied**
- UI: Accept all · Reject non-essential · Manage preferences (equal prominence)
- No cookie wall; core features work after reject

## Script blocking

- GA4 loads **only** after analytics consent (`initAnalyticsIfAllowed`)
- No Advanced Consent Mode cookieless pings before consent
- Withdrawal calls `disableAnalytics()` and clears `_ga*` cookies where possible
- Measurement ID from `NEXT_PUBLIC_GA_MEASUREMENT_ID` only; disabled in test and local unless `NEXT_PUBLIC_ENABLE_GA_IN_DEV=true`

## Tests

- Unit: `apps/web/lib/consent/consent.test.ts`
- E2E network checks: `e2e/consent.spec.ts` (Playwright)
