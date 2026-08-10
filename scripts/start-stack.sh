#!/usr/bin/env bash
# Reliable local stack: API + Web (+ optional Bridge). Survives terminal close via nohup.
set -euo pipefail
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:$PATH"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
RUN_DIR="$ROOT/.run"
mkdir -p "$RUN_DIR" "$ROOT/data" /tmp/of-filament-test

export OF_BRIDGE_TOKEN="${OF_BRIDGE_TOKEN:-local-dev-token}"
export OF_BRIDGE_FILAMENT_ROOT_OVERRIDE="${OF_BRIDGE_FILAMENT_ROOT_OVERRIDE:-/tmp/of-filament-test}"
export WEB_ORIGIN="${WEB_ORIGIN:-http://127.0.0.1:3000}"
export API_HOST="${API_HOST:-127.0.0.1}"
export API_PORT="${API_PORT:-8787}"
export API_INTERNAL_URL="${API_INTERNAL_URL:-http://127.0.0.1:8787}"
export API_REWRITE_TARGET="${API_REWRITE_TARGET:-http://127.0.0.1:8787}"
# Empty = browser uses same-origin /api via Next rewrites
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-}"

stop_port() {
  local port="$1"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    kill $pids 2>/dev/null || true
    sleep 0.5
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "$pids" ]]; then kill -9 $pids 2>/dev/null || true; fi
  fi
}

echo "== stopping old listeners =="
stop_port 3000
stop_port 8787
stop_port 8788

if [[ ! -f "$ROOT/data/open-filament.sqlite" ]]; then
  echo "== seeding database =="
  pnpm db:reset
fi

echo "== building packages (if needed) =="
pnpm -r --filter './packages/*' build >/dev/null

echo "== starting API =="
nohup pnpm --filter @open-filament/api dev \
  >"$RUN_DIR/api.log" 2>&1 &
echo $! >"$RUN_DIR/api.pid"

echo "== starting Web =="
nohup pnpm --filter @open-filament/web dev \
  >"$RUN_DIR/web.log" 2>&1 &
echo $! >"$RUN_DIR/web.pid"

echo "== starting Bridge =="
nohup cargo run -p open-filament-bridge \
  >"$RUN_DIR/bridge.log" 2>&1 &
echo $! >"$RUN_DIR/bridge.pid"

echo "== waiting for health =="
ok=0
for i in $(seq 1 30); do
  if curl -sf "http://127.0.0.1:8787/api/v1/health" >/dev/null \
    && curl -sf "http://127.0.0.1:3000" >/dev/null \
    && curl -sf "http://127.0.0.1:8788/health" >/dev/null; then
    ok=1
    break
  fi
  sleep 1
done

if [[ "$ok" -ne 1 ]]; then
  echo "FAILED to become healthy. Logs:"
  tail -40 "$RUN_DIR/api.log" || true
  tail -40 "$RUN_DIR/web.log" || true
  tail -40 "$RUN_DIR/bridge.log" || true
  exit 1
fi

cat <<EOF
STACK_OK
  Web:    http://127.0.0.1:3000
  API:    http://127.0.0.1:8787/api/v1/health
  Bridge: http://127.0.0.1:8788/health
  Logs:   $RUN_DIR/*.log
  Stop:   ./scripts/stop-stack.sh
EOF
