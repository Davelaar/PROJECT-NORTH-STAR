# SEO notes (2026)

## Titles
- Every public page sets unique `generateMetadata` via `buildPageMetadata`.
- Titles are **absolute** and branded as `{page} · OpenFilament` (clipped ~52 chars before brand).
- Homepage uses the home H1 (clipped), not bare "OpenFilament".

## Indexing
- `robots.ts` + per-page `noIndex` for account/auth/export/tools.
- Sitemap: static routes + manufacturers + filament products.

## Structured data
- Sitewide: `WebSite` + `WebApplication` JSON-LD.
- Filament/variant: `Product` + `BreadcrumbList`.
- Manufacturer: `Organization`.

## Follow-ups (ops)
- Submit `https://openfilament.nl/sitemap.xml` in Search Console.
- Validate titles with URL Inspection / Rich Results Test.
