"use client";

import { useState } from "react";
import { getApiBase } from "@/lib/api";
import { messages } from "@/lib/messages/en";

const BRIDGE = "http://127.0.0.1:8788";
const BRIDGE_TOKEN =
  process.env.NEXT_PUBLIC_OF_BRIDGE_TOKEN ?? "local-dev-token";

export function ExportForm({
  initialProfileUuid,
}: {
  initialProfileUuid: string;
}) {
  const m = messages.export;
  const [profileUuid, setProfileUuid] = useState(initialProfileUuid);
  const [format, setFormat] = useState<
    "openfilamentprofile" | "creality" | "orca"
  >("openfilamentprofile");
  const [result, setResult] = useState<string>("");
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string>("");
  const [installMsg, setInstallMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult("");
    setPayload(null);
    setInstallMsg("");
    try {
      const res = await fetch(`${getApiBase()}/api/v1/exports/${format}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileUuid }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      const json = JSON.parse(text) as Record<string, unknown>;
      setResult(JSON.stringify(json, null, 2));
      setPayload(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    }
  }

  async function installViaBridge() {
    setInstallMsg("");
    setError("");
    const bridgePayload = payload?.bridgeInstallPayload as
      | Record<string, unknown>
      | undefined;
    if (!bridgePayload) {
      setError("Export a creality or orca preset first (needs bridgeInstallPayload).");
      return;
    }
    try {
      const res = await fetch(`${BRIDGE}/v1/presets/install`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-OF-Bridge-Token": BRIDGE_TOKEN,
        },
        body: JSON.stringify(bridgePayload),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      setInstallMsg(`${m.installOk}: ${text}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${m.installFail} ${err.message}`
          : m.installFail,
      );
    }
  }

  const canInstall =
    payload != null &&
    (format === "creality" || format === "orca") &&
    Boolean(payload.bridgeInstallPayload);

  return (
    <div className="stack">
      <form className="stack panel" onSubmit={onSubmit}>
        <label>
          {m.profileUuid}
          <input
            value={profileUuid}
            onChange={(e) => setProfileUuid(e.target.value)}
            required
          />
        </label>
        <label>
          {m.format}
          <select
            value={format}
            onChange={(e) =>
              setFormat(e.target.value as typeof format)
            }
          >
            <option value="openfilamentprofile">
              {m.formats.openfilamentprofile}
            </option>
            <option value="creality">{m.formats.creality}</option>
            <option value="orca">{m.formats.orca}</option>
          </select>
        </label>
        <button type="submit">{m.submit}</button>
        {canInstall ? (
          <button type="button" onClick={installViaBridge}>
            {m.installBridge}
          </button>
        ) : null}
      </form>
      {error ? <div className="banner-warn">{error}</div> : null}
      {installMsg ? <div className="panel">{installMsg}</div> : null}
      {result ? <pre>{result}</pre> : null}
    </div>
  );
}
