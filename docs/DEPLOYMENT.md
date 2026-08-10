# Deployment

OpenFilament’s **standard** deployment is the **web app + API** behind HTTPS. The local bridge is optional and must stay on workstations.

| Layer | Where it runs | Why |
|-------|---------------|-----|
| **Web / PWA + API** | VPS / Docker + Caddy | Public catalog, profiles, search, downloads, docs |
| **Optional helper** | Your Mac/PC (`127.0.0.1:8788`) | Only for PC/SC RFID or allowlisted slicer-dir install |

Do **not** expose the helper on the public internet. Do **not** require users to run it for core website use.

**Production domain:** [https://openfilament.nl](https://openfilament.nl) (and `www`).

---

## Local (reliable)

Background processes with logs under `.run/`:

```bash
./scripts/start-stack.sh   # API :8787, Web :3000, Bridge :8788 (helper optional)
./scripts/stop-stack.sh
```

Open **http://127.0.0.1:3000**. The browser talks to `/api/*` on the same origin; Next.js rewrites to the API.

---

## Production via Docker Compose (HTTPS)

On the VPS (DNS A/AAAA for `openfilament.nl` / `www` already pointed at the host):

```bash
git clone git@github.com:Davelaar/PROJECT-NORTH-STAR.git
cd PROJECT-NORTH-STAR

export SESSION_SECRET="$(openssl rand -hex 32)"
export WEB_ORIGIN='https://openfilament.nl,https://www.openfilament.nl'
export ACME_EMAIL='admin@openfilament.nl'

# Public ports 80/443 via Caddy; web stays on loopback :3000
docker compose --profile proxy up -d --build
```

Caddy (`deploy/Caddyfile`) obtains Let’s Encrypt certificates, redirects HTTP→HTTPS for public hosts, and sets HSTS + baseline security headers.

### Import the filament catalog (required for eSUN etc.)

A fresh seed only creates demo fixtures (Flashforge / Creality). The real catalog comes from [openfilamentdatabase.org](https://openfilamentdatabase.org):

```bash
# on the VPS, inside the repo / API container:
./scripts/bootstrap-catalog.sh
# or:
docker compose exec api ./scripts/bootstrap-catalog.sh
```

That downloads `all.json.gz` and runs `pnpm db:import-ofd` (~150 brands / ~14k variants, including **eSUN 3D**).

Check: `curl -s https://openfilament.nl/api/v1/search?q=esun | head`

`GET /api/v1/health` reports `catalog.fixtureOnly: true` until OFD is imported.

---

## Environment

| Variable | Service | Notes |
|----------|---------|-------|
| `WEB_ORIGIN` | API | CORS allowlist (comma-separated). Production: `https://openfilament.nl,https://www.openfilament.nl` |
| `API_HOST` | API | Use `0.0.0.0` in containers |
| `DATABASE_URL` | API | `file:/data/...` in Docker |
| `API_INTERNAL_URL` / `API_REWRITE_TARGET` | Web | `http://api:8787` in Compose |
| `NEXT_PUBLIC_API_URL` | Web | Leave empty for same-origin `/api` |
| `SESSION_SECRET` | Compose | Required for production compose; rotate regularly |
| `ACME_EMAIL` | Caddy | Let’s Encrypt contact |
| `AMAZON_AFFILIATE_TAG` | API / OFD import | Default `3dapeldoorn-21` — appended as `tag=` on Amazon where-to-buy links |
| `OF_BRIDGE_TOKEN` | Optional helper (local only) | Matches advanced web helper calls |

---

## Security checklist (public site)

1. Only expose **80/443** publicly (Caddy). Keep API on the Docker network; do not publish `:8787`.
2. Set `WEB_ORIGIN` to your HTTPS origins only.
3. Change seed credentials (`admin` / `fixture_contributor`).
4. Never run `apps/bridge` on the VPS public interface.
5. Prefer `docker compose --profile proxy` so the Next port is loopback-only.

See [`SECURITY.md`](./SECURITY.md).

---

## Managed hosts (no Docker on your Mac)

Any Node 22 host works:

1. `pnpm install && pnpm -r --filter './packages/*' build`
2. `pnpm --filter @open-filament/api build && pnpm --filter @open-filament/web build`
3. Run API (`API_HOST=0.0.0.0`) and Web (`next start`) under systemd / PM2
4. Point Caddy/nginx at the web process with TLS
5. Optionally run the Rust helper on workstations that need PC/SC RFID or allowlisted installs

---

## Why local `pnpm dev` “keeps dying” in Cursor

`pnpm dev` started from a chat/agent shell is often killed when that session ends (exit 137). Use `./scripts/start-stack.sh` so processes are detached with `nohup`, or deploy web+API to the VPS.
