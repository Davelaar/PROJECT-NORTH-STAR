#!/usr/bin/env bash
# Software acceptance path for master spec §53 (no physical NFC required).
set -euo pipefail
export PATH="/opt/homebrew/opt/node@22/bin:/opt/homebrew/bin:$PATH"

API="${API:-http://127.0.0.1:8787}"
BRIDGE="${BRIDGE:-http://127.0.0.1:8788}"
TOKEN="${OF_BRIDGE_TOKEN:-local-dev-token}"
VARIANT="33333333-3333-4333-8333-333333333301"
PROFILE="66666666-6666-4666-8666-666666666601"

echo "== health =="
curl -sf "$API/api/v1/health" >/dev/null
curl -sf "$BRIDGE/health" >/dev/null

echo "== search Flashforge Burnt Titanium =="
curl -sf "$API/api/v1/search?q=Flashforge%20Burnt%20Titanium" | grep -q "$VARIANT"

echo "== recommendation K2 / 0.4 =="
curl -sf "$API/api/v1/variants/$VARIANT/recommendation" | grep -q "maxVolumetricFlowMm3s\|algorithmVersion\|of-agg"

echo "== export creality + bridge install =="
EXPORT=$(curl -sf -X POST "$API/api/v1/exports/creality" \
  -H 'content-type: application/json' \
  -d "{\"profileUuid\":\"$PROFILE\"}")
echo "$EXPORT" | grep -q 'Flashforge ASA Burnt Titanium'
PAYLOAD=$(python3 -c 'import json,sys; d=json.load(sys.stdin); print(json.dumps(d["bridgeInstallPayload"]))' <<<"$EXPORT")
TMP=$(mktemp -d)
export OF_BRIDGE_FILAMENT_ROOT_OVERRIDE="$TMP"
curl -sf -X POST "$BRIDGE/v1/presets/install" \
  -H "content-type: application/json" \
  -H "X-OF-Bridge-Token: $TOKEN" \
  -d "$PAYLOAD" | grep -q '"ok":true\|json_path'

echo "== CFS encode + simulate verify =="
curl -sf -X POST "$BRIDGE/v1/rfid/simulate-write" \
  -H "content-type: application/json" \
  -H "X-OF-Bridge-Token: $TOKEN" \
  -d '{"material":"ASA","color":"#6B5E54","weightOrLength":"1kg","serial":"219722","uid":"35B94A19"}' \
  | grep -q '"verified":true'

echo "== rfid resolve + map-install =="
RESOLVE=$(curl -sf "$API/api/v1/rfid/resolve?material=100007&color=%236B5E54")
echo "$RESOLVE" | grep -q "$VARIANT"
MAP_EXPORT=$(curl -sf -X POST "$API/api/v1/exports/creality" \
  -H 'content-type: application/json' \
  -d "{\"profileUuid\":\"$PROFILE\"}")
MAP_PAYLOAD=$(python3 -c 'import json,sys; d=json.load(sys.stdin); print(json.dumps({"bridgeInstallPayload": d["bridgeInstallPayload"]}))' <<<"$MAP_EXPORT")
curl -sf -X POST "$BRIDGE/v1/rfid/map-install" \
  -H "content-type: application/json" \
  -H "X-OF-Bridge-Token: $TOKEN" \
  -d "$MAP_PAYLOAD" | grep -q '"ok":true\|json_path'

echo "== auth login + confirm =="
LOGIN=$(curl -sf -X POST "$API/api/v1/auth/login" \
  -H 'content-type: application/json' \
  -d '{"username":"admin","password":"admin-change-me"}')
BEARER=$(python3 -c 'import json,sys; print(json.load(sys.stdin)["token"])' <<<"$LOGIN")
curl -sf -X POST "$API/api/v1/profiles/$PROFILE/confirm" \
  -H "authorization: Bearer $BEARER" \
  -H 'content-type: application/json' \
  -d '{}' >/dev/null || true

echo "== e2e create→publish→export =="
PRINTERS=$(curl -sf "$API/api/v1/printers")
PRINTER=$(python3 -c 'import json,sys; print(json.load(sys.stdin)[0]["uuid"])' <<<"$PRINTERS")
TOOLS=$(curl -sf "$API/api/v1/toolheads?printerUuid=$PRINTER")
TOOL=$(python3 -c 'import json,sys; print(json.load(sys.stdin)[0]["uuid"])' <<<"$TOOLS")
CREATED=$(curl -sf -X POST "$API/api/v1/profiles" \
  -H "authorization: Bearer $BEARER" \
  -H 'content-type: application/json' \
  -d "{\"filamentVariantUuid\":\"$VARIANT\",\"printerModelUuid\":\"$PRINTER\",\"toolheadConfigUuid\":\"$TOOL\",\"title\":\"E2E calib\",\"parameters\":{\"nozzleTempOtherLayersC\":255,\"flowRatio\":0.95,\"maxVolumetricFlowMm3s\":24}}")
NEW_PROFILE=$(python3 -c 'import json,sys; print(json.load(sys.stdin)["profileUuid"])' <<<"$CREATED")
curl -sf -X POST "$API/api/v1/profiles/$NEW_PROFILE/publish" \
  -H "authorization: Bearer $BEARER" >/dev/null
curl -sf -X POST "$API/api/v1/exports/openfilamentprofile" \
  -H 'content-type: application/json' \
  -d "{\"profileUuid\":\"$NEW_PROFILE\"}" | grep -q 'OpenFilamentProfile\|schemaVersion\|openFilamentProfile'

echo "ACCEPTANCE_SOFTWARE_OK"
