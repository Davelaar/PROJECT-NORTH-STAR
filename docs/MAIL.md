# Mail (Postfix + Dovecot + OpenDKIM)

OpenFilament mail is hosted on the same VPS as the website (`212.227.245.191`).

## Mailbox

| Address | Delivers to |
|---------|-------------|
| `info@openfilament.nl` | local user `info` (`/var/mail/info`) |
| `contact@openfilament.nl` | alias → `info` |
| `privacy@openfilament.nl` | alias → `info` |
| `security@openfilament.nl` | alias → `info` |

IMAP/SMTP hostname (after DNS): `mail.openfilament.nl`  
Ports: IMAPS `993`, SMTP submission `587` (STARTTLS) / `465` if enabled.

## DNS (TransIP)

See operator checklist in the deploy notes / chat response for MX, SPF, DKIM, DMARC.

## Server files

- `/etc/postfix/virtual` — alias map
- `/etc/opendkim/keys/openfilament.nl/` — DKIM key
- Signing selector: `default`
