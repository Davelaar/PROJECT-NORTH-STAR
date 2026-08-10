# Development

## Setup

```bash
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:$PATH"
pnpm install
pnpm --filter @open-filament/db exec drizzle-kit generate
pnpm db:reset
```

## Run

```bash
pnpm dev:api   # http://127.0.0.1:8787
pnpm dev:web   # http://127.0.0.1:3000
cargo run -p open-filament-bridge  # :8788
```

## Workspace protocol

Internal packages use `"workspace:*"` dependencies.

## Typecheck / test

```bash
pnpm typecheck
pnpm test
```
