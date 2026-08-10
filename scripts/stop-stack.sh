#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
RUN_DIR="$ROOT/.run"

stop_port() {
  local port="$1"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [[ -n "$pids" ]]; then
    kill $pids 2>/dev/null || true
    sleep 0.3
    pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
    if [[ -n "$pids" ]]; then kill -9 $pids 2>/dev/null || true; fi
  fi
}

if [[ -d "$RUN_DIR" ]]; then
  for f in api.pid web.pid bridge.pid; do
    if [[ -f "$RUN_DIR/$f" ]]; then
      kill "$(cat "$RUN_DIR/$f")" 2>/dev/null || true
      rm -f "$RUN_DIR/$f"
    fi
  done
fi

stop_port 3000
stop_port 8787
stop_port 8788
echo "STACK_STOPPED"
