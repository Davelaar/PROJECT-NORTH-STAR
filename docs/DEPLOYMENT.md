# Deployment

OpenFilament has two runtime layers:

| Layer | Where it runs | Why |
|-------|---------------|-----|
| **Web + API** | A web server / VPS / Docker | Public catalog, profiles, search, docs |
| **Local bridge** | Your Mac/PC (`127.0.0.1:8788`) | Creality/Orca install + RFID writer (must stay local) |

Do **not** expose the bridge on the public internet.

---

## Local (reliable)

Background processes with logs under `.run/`:

```bash
./scripts/start-stack.sh   # API :8787, Web :3000, Bridge :8788
./scripts/stop-stack.sh
```

Open **http://127.0.0.1:3000** (not the API port).

The browser talks to `/api/*` on the same origin; Next.js rewrites to the API.

---

## Web server via Docker Compose

On a VPS with Docker installed:

```bash
git clone git@github.com:Davelaar/PROJECT-NORTH-STAR.git
cd PROJECT-NORTH-STAR

# optional: set secrets
export SESSION_SECRET='long-random-string'
export WEB_ORIGIN='https://your.domain'

docker compose up -d --build
```

- Site: `http://SERVER:3000`
- With Caddy on port 80: `docker compose --profile proxy up -d --build`

Data (SQLite) persists in the `of-data` volume.

### First seed inside API container

```bash
docker compose exec api pnpm --filter @open-filament/db seed
# or reset:
docker compose exec api pnpm --filter @open-filament/db reset
```

Ensure `DATABASE_URL=file:/data/open-filament.sqlite` (compose default).

---

## Environment

| Variable | Service | Notes |
|----------|---------|-------|
| `WEB_ORIGIN` | API | CORS allowlist (comma-separated) |
| `API_HOST` | API | Use `0.0.0.0` in containers |
| `DATABASE_URL` | API | `file:/data/...` in Docker |
| `API_INTERNAL_URL` / `API_REWRITE_TARGET` | Web | `http://api:8787` in Compose |
| `NEXT_PUBLIC_API_URL` | Web | Leave empty for same-origin `/api` |
| `SESSION_SECRET` | API | Change in production |
| `OF_BRIDGE_TOKEN` | Bridge (local only) | Matches web bridge calls |

---

## Managed hosts (no Docker on your Mac)

Any Node 22 host works:

1. `pnpm install && pnpm -r --filter './packages/*' build`
2. `pnpm --filter @open-filament/api build && pnpm --filter @open-filament/web build`
3. Run API (`API_HOST=0.0.0.0`) and Web (`next start`) under systemd / PM2 / Railway / Fly / Render
4. Point a reverse proxy at the web process (port 3000)
5. Keep the Rust bridge on each workstation that installs presets / writes RFID

---

## Why it “keeps dying” in Cursor

`pnpm dev` started from a chat/agent shell is often killed when that session ends (exit 137). Use `./scripts/start-stack.sh` so processes are detached with `nohup`, or deploy web+API to a VPS.
