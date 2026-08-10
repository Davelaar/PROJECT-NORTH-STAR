"use client";

import { useState } from "react";
import { getApiBase } from "@/lib/api";

const BRIDGE = "http://127.0.0.1:8788";
const BRIDGE_TOKEN =
  process.env.NEXT_PUBLIC_OF_BRIDGE_TOKEN ?? "local-dev-token";

export function InstallProfileButton({ profileUuid }: { profileUuid: string }) {
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function install() {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const res = await fetch(`${getApiBase()}/api/v1/exports/creality`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileUuid }),
      });
      const data = (await res.json()) as {
        bridgeInstallPayload?: Record<string, unknown>;
        error?: { message: string };
      };
      if (!res.ok) throw new Error(data.error?.message ?? JSON.stringify(data));
      if (!data.bridgeInstallPayload) throw new Error("No bridgeInstallPayload");
      const install = await fetch(`${BRIDGE}/v1/presets/install`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-OF-Bridge-Token": BRIDGE_TOKEN,
        },
        body: JSON.stringify(data.bridgeInstallPayload),
      });
      const text = await install.text();
      if (!install.ok) throw new Error(text);
      setMsg(`Installed via bridge: ${text}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Install failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <button type="button" onClick={install} disabled={busy}>
        {busy ? "Installing…" : "Install profile (Creality Print)"}
      </button>
      {msg ? <div className="panel">{msg}</div> : null}
      {err ? <div className="banner-warn">{err}</div> : null}
    </div>
  );
}
