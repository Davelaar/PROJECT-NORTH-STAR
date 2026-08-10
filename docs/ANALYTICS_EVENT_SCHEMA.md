# Analytics event schema

GA4 is optional and consent-gated. Events must not include PII, account/spool UUIDs, emails, notes, free-form search strings, QR/RFID payloads, or full sensitive URLs.

| Event | When | Allowed properties |
|-------|------|--------------------|
| `catalog_search_submitted` | Search / autocomplete submit | `via` (`form` \| `autocomplete`) |
| `filter_selected` | Material/brand filter | `filter` (`material` \| `brand`) |
| `filament_viewed` | Product/variant view | `surface` (`product` \| `variant`) |
| `profile_download_started` | Export start | `format` (slicer id) |
| `profile_download_completed` | Export success | `format` |
| `slicer_format_selected` | Format radio | `format` |
| `qr_label_generated` | Label generated | `surface` |
| `rfid_workflow_opened` | RFID page open | none |
| `local_spool_created` | Local spool save | `status` |
| `cloud_sync_enabled` | Confirmed cloud sync | none |
| `contribution_started` | Submit form open | none |
| `contribution_completed` | Submit success | none |

Google Signals / ads personalization: denied. No User-ID. No Google Ads linking assumed.
