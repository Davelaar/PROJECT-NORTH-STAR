# SEO notes (2026)

## Titles
- Every public page sets unique `generateMetadata` via `buildPageMetadata`.
- Titles are **absolute** and branded as `{page} · OpenFilament` (clipped ~52 chars before brand).
- Homepage uses the home H1 (clipped), not bare "OpenFilament".

## Multilingual indexing
- **Crawlable locale URLs:** English unprefixed (`/identify`); other locales prefixed (`/nl/identify`, `/de/...`, …).
- Middleware rewrites prefixed URLs and sets `x-of-locale` + `Content-Language`.
- `hreflang` (+ `x-default` → English) points at distinct URLs — not the same path nine times.
- `html lang` uses BCP 47 (`zh-Hans` for Chinese).
- Open Graph: `og:locale` + `alternateLocale`.
- Language switcher navigates to the prefixed URL; nav/footer use `LocaleLink`.
- Sitemap entries include `alternates.languages` for all 9 locales.

## Community / catalog depth
- Sitemap includes manufacturers, filaments, **variants**, materials, printers.
- `/contribute` and `/submit` prioritized in sitemap.

## Indexing
- `robots.ts` + per-page `noIndex` for account/auth/export/tools.
- Submit `https://openfilament.nl/sitemap.xml` in Search Console after deploy.
- Validate hreflang with URL Inspection on `/` and `/nl/`.

## Structured data
- Sitewide: `WebSite` + `WebApplication` JSON-LD (`inLanguage` per locale).
- Filament/variant: `Product` + `BreadcrumbList`.
- Manufacturer: `Organization`.
