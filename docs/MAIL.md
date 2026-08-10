# Mail (Postfix + Dovecot + OpenDKIM)

OpenFilament mail is hosted on the same VPS as the website (`212.227.245.191`).

## Mailbox

| Address | Delivers to |
|---------|-------------|
| `info@openfilament.nl` | local user `info` (`/var/mail/info`) |
| `contact@openfilament.nl` | alias → `info` |
| `privacy@openfilament.nl` | alias → `info` |
| `security@openfilament.nl` | alias → `info` |
| `admin@openfilament.nl` | alias → `info` |

IMAP/SMTP hostname (after DNS): `mail.openfilament.nl`  
Ports: IMAPS `993`, submission `587` (STARTTLS). Login: Linux user `info` (shared mailbox).

## DNS (TransIP) for zone `openfilament.nl`

| Type | Name | Content | TTL tip |
|------|------|---------|---------|
| A | `mail` | `212.227.245.191` | 300 |
| AAAA | `mail` | `2a01:239:31c:a00::1` | 300 |
| MX | `@` | `10 mail.openfilament.nl.` | 300 |
| TXT | `@` | `v=spf1 mx a:mail.openfilament.nl ip4:212.227.245.191 ~all` | 300 |
| TXT | `default._domainkey` | see DKIM below | 300 |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:info@openfilament.nl; adkim=r; aspf=r` | 300 |

Remove the old MX pointing at `openfilament.nl.` and the old SPF that mentions `co2vullen.nl` if still present.

### DKIM TXT (`default._domainkey`)

```text
v=DKIM1; h=sha256; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAn3iXt3ibd3L4iuQP1sIo2n3TuRVv51aioS+vZx8G8raoEbgmLnqX2pev6gMWfoNcfGRQj3K2N1uLbWUr/KVd5ZcXivJrf9J7lRAvUyXrJzUPj8H7KOtBjQh0WgSvEyyUgo1pADcTJrm3udBaJM4k+IFnGscIZJp1kiH2yomkZaXmWUCCNENjVlnItFHLTtLgHgq46BhATsJG5CCR6pPTvPpyrfg5oS4AEz4uLYrrz8bikjiOFhni2EN3hGvckUjEBuEs01YZsnhLBX1ffN9PtyoiWhjQiQ2Dy1Df6rCipfq3x6k5bnJznbzc1vOD/nNbgZYIOc7D9wH+ByPH+6VujwIDAQAB
```

### Common TransIP mistake

`default._domainkey` must be the **DKIM** string (`v=DKIM1; … p=…`), **not** the DMARC policy.  
If `dig TXT default._domainkey.openfilament.nl` returns `v=DMARC1…`, the DKIM record is wrong and signatures will fail.

### Mail TLS

`mail.openfilament.nl` uses a Let’s Encrypt cert managed by Caddy, synced to Postfix/Dovecot via `/usr/local/sbin/of-sync-mail-cert.sh`.

## Server files

- `/etc/postfix/virtual` — alias map  
- `/etc/opendkim/keys/openfilament.nl/` — DKIM key  
- Signing selector: `default`
