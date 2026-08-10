# Subprocessors

Do not invent signed DPAs. Status must be confirmed by the site owner.

| Provider | Purpose | Data | Region | Transfer mechanism | DPA status | Deletion config | Owner action |
|----------|---------|------|--------|--------------------|------------|-----------------|--------------|
| [OWNER MUST PROVIDE HOSTING PROVIDER] | Web + API + SQLite | All server data | [OWNER MUST PROVIDE] | — | **Missing** | Backup policy TBD | Confirm + DPA |
| Google Analytics (optional) | Product analytics | Pseudonymous usage after consent | Google regions | SCCs / Google terms | **Missing until GA enabled** | GA retention UI | Configure measurement ID + DPA review |
| Amazon Associates (affiliate links) | Where-to-buy links | Click-out only | Amazon | Amazon terms | Review | N/A | Confirm tag `AMAZON_AFFILIATE_TAG` |
| Let's Encrypt | TLS certs | ACME email | Public CA | — | N/A | Cert lifecycle | Confirm `ACME_EMAIL` |
| Email provider | Not implemented | — | — | — | N/A | — | Choose before magic links |

CDN / object storage / error monitoring: **not currently used** in production stack (Caddy + Node on VPS).
