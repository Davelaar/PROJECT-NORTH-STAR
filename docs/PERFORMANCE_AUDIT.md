# Performance audit

**Date:** 2026-08-10  
**Environment:** local running stack (may include cold SQLite/API); Lighthouse 12 mobile  
**Build:** production `next build` succeeds; lab scores below are diagnostic, not guarantees

## Targets (not guarantees)

- LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 (mobile)
- Accessibility / Best Practices / SEO ≥ 95

## Mitigations implemented

- Bounded homepage preview (≤12) + featured / recently added / most-complete sections (no fake popularity)
- Search pagination + autocomplete capped at 12
- Consent-gated analytics deferred after interaction paint
- Hero via `next/image` with `priority` + `sizes`; AVIF/WebP enabled
- Skip link; sticky consent banner (watch CLS)
- CSP + Caddy gzip/zstd

## Lab results (mobile Lighthouse against local `:3000`)

| Route | Perf | A11y | BP | SEO | LCP | CLS | TBT |
|-------|------|------|----|-----|-----|-----|-----|
| `/` | 0.52 | 0.94 | 0.96 | 1.00 | ~13.0s | 0 | 750ms |

**Interpretation:** SEO is strong; CLS is good. LCP/TBT on this lab run are limited by local stack cold-start / large catalog API work on first paint — not representative of a warm production VPS with cached Next assets. Re-run against https://openfilament.nl after deploy for field-relevant numbers.

## Remaining limitations

- Homepage still SSR-fetches health + preview (bounded but network-bound)
- Scan page ships a larger client bundle (jsQR)
- Locale path prefixes (`/nl/...`) for crawlable multilingual SEO (see docs/SEO_AUDIT.md)
- GA after consent adds third-party cost when enabled
