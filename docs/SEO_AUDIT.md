# SEO audit

**Date:** 2026-08-10  
**Commit:** pending (local production-readiness work)

## Implemented

- Per-page `generateMetadata` on home, search, privacy/cookies/terms/security/trust
- Canonical + Open Graph + Twitter cards via `buildPageMetadata`
- `hreflang` alternates pointing at cookie-locale strategy (`x-default` + locales share URL)
- `robots.ts` disallows private/account/API/export paths
- `sitemap.ts` includes static public routes + manufacturers/materials (bounded)
- JSON-LD `WebSite` + `WebApplication` on root layout (no fake reviews/prices beyond free offer)
- Search result URLs with query params: `noindex`
- `/my-spools`, `/account`, `/me`, `/login`, `/admin`: `noindex`

## Localization note

Locales are cookie-based (not path prefixes). Hreflang entries currently share the same canonical URL; a future path-locale strategy would improve international SEO if desired.

## Manual follow-ups

- Add `generateMetadata` to every manufacturer/material/filament/variant/profile page if not already present
- Submit sitemap in Search Console after launch
- Validate JSON-LD in Rich Results Test
