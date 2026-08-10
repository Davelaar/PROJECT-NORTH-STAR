# Translation audit — OpenFilament

Address style: informal `je/jij` (NL), informal where natural in DE/FR/ES; European Portuguese; Simplified Chinese; distinct RU vs UK.

Canonical product names (untranslated): **OpenFilament**, **My Spools**, **My Spools Local**, **My Spools Cloud**, Stripe, QR, RFID, CFS, AMS, IndexedDB, slicer product names, API, JSON, UUID, SKU, EAN, GTIN, WebUSB/Serial/HID/NFC, MIFARE Classic 1K, PWA, Google Analytics.

## Locale status

| Locale | Key parity | Cloud prepaid copy | Consent/shared prod blocks | Visual | Native legal review |
|--------|------------|--------------------|----------------------------|--------|---------------------|
| en | automatically_verified | automatically_verified | automatically_verified | visually_verified (desktop) | native_review_recommended |
| nl | automatically_verified | automatically_verified | automatically_verified (prod-nl) | visually_verified (desktop) | native_review_recommended |
| de | automatically_verified | automatically_verified | native_review_recommended (still shares some EN consent/spools via prod-en) | native_review_recommended | native_review_recommended |
| fr | automatically_verified | automatically_verified | native_review_recommended | native_review_recommended | native_review_recommended |
| es | automatically_verified | automatically_verified | native_review_recommended | native_review_recommended | native_review_recommended |
| pt (European) | automatically_verified | automatically_verified | native_review_recommended | native_review_recommended | native_review_recommended |
| ru | automatically_verified | automatically_verified | native_review_recommended | native_review_recommended | native_review_recommended |
| uk | automatically_verified | automatically_verified | native_review_recommended | native_review_recommended | native_review_recommended |
| zh-Hans | automatically_verified | automatically_verified | native_review_recommended | native_review_recommended | native_review_recommended |

## Known remaining work

- DE/FR/ES/PT/RU/UK/ZH still import English `consentEn` / `spoolsEn` / `accountEn` / `footerEn` / `legalPagesEn` for those shared blocks (same pattern as pre-audit). Full native replacement tracked here — NL is complete via `prod-nl.ts`.
- Legal page body paragraphs on `/privacy` `/terms` remain primarily English server-rendered copy; structure is shared. Human legal translation required before treating as binding.
- Reminder emails are English templates with localized intent strings in code comments; expand when MAIL templates are split per locale.

## Formatting

Dates/amounts on Cloud UI use `Intl` with `document.documentElement.lang`.
