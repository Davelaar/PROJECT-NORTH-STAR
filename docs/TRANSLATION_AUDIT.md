# Translation audit — OpenFilament

Address style: informal `je/jij` (NL), `du` (DE), `tu`/`tú` (FR/ES), European Portuguese `tu`; Simplified Chinese; distinct RU vs UK.

Canonical product names (untranslated): **OpenFilament**, **My Spools**, **My Spools Local**, **My Spools Cloud**, Stripe, QR, RFID, CFS, AMS, IndexedDB, slicer product names, API, JSON, UUID, SKU, EAN, GTIN, WebUSB/Serial/HID/NFC, MIFARE Classic 1K, PWA, Google Analytics, Trust center (branded section name).

Portuguese variant: **European Portuguese** (`pt`).

## Locale status

| Locale | Key parity | Cloud prepaid copy | Consent / spools / account / footer | Usage/starter profile copy | Visual | Native legal review |
|--------|------------|--------------------|-------------------------------------|----------------------------|--------|---------------------|
| en | automatically_verified | automatically_verified | automatically_verified | automatically_verified | visually_verified (desktop smoke) | native_review_recommended |
| nl | automatically_verified | automatically_verified | automatically_verified (`prod-nl`) | automatically_verified | visually_verified (desktop smoke) | native_review_recommended |
| de | automatically_verified | automatically_verified | automatically_verified (`prod-de`) | automatically_verified | native_review_recommended | native_review_recommended |
| fr | automatically_verified | automatically_verified | automatically_verified (`prod-fr`) | automatically_verified | native_review_recommended | native_review_recommended |
| es | automatically_verified | automatically_verified | automatically_verified (`prod-es`) | automatically_verified | native_review_recommended | native_review_recommended |
| pt (EU) | automatically_verified | automatically_verified | automatically_verified (`prod-pt`) | automatically_verified | native_review_recommended | native_review_recommended |
| ru | automatically_verified | automatically_verified | automatically_verified (`prod-ru`) | automatically_verified | native_review_recommended | native_review_recommended |
| uk | automatically_verified | automatically_verified | automatically_verified (`prod-uk`) | automatically_verified | native_review_recommended | native_review_recommended |
| zh-Hans | automatically_verified | automatically_verified | automatically_verified (`prod-zh`) | automatically_verified | native_review_recommended | native_review_recommended |

## Known remaining work

- Legal page bodies are now structured locale content for `/privacy`, `/terms`, `/cookies`, `/security` and `/trust`; human legal review is still required before treating translations as binding legal advice.
- Reminder / transactional email templates still lean English for full MIME bodies; expand when mail templates are split per locale.
- Admin Cloud console remains English (operator tooling).
- Not claimed: `native_review_completed` for any locale.

## Formatting

Dates/amounts on Cloud UI use `Intl` with `document.documentElement.lang` / locale utilities. Currency display for Cloud is €19.99 / locale-aware separators in copy.

## Automated checks

- `apps/web/lib/messages/parity.test.ts` — key parity, non-empty values, no subscription sell language, non-EN cloud/consent/spools differ from EN, RU≠UK on shared blocks.
- `apps/web/lib/usage-tracking-copy.test.ts` — usage-tracking locale coverage and overclaim checks.
