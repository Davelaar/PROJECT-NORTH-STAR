"use client";

import { useState } from "react";
import { getApiBase } from "@/lib/api";
import { messages } from "@/lib/messages/en";

const BRIDGE = "http://127.0.0.1:8788";
const BRIDGE_TOKEN =
  process.env.NEXT_PUBLIC_OF_BRIDGE_TOKEN ?? "local-dev-token";

export function RfidForm() {
  const m = messages.rfid;
  const [materialCode, setMaterialCode] = useState("100007");
  const [colorToken, setColorToken] = useState("#6B5E54");
  const [weight, setWeight] = useState("1kg");
  const [serial, setSerial] = useState("219722");
  const [uid, setUid] = useState("35B94A19");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [readers, setReaders] = useState("");
  const [resolveInfo, setResolveInfo] = useState("");

  const payload = () => ({
    material: materialCode,
    color: colorToken,
    weightOrLength: weight,
    serial,
    uid,
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult("");
    try {
      const res = await fetch(`${getApiBase()}/api/v1/rfid/encode`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload()),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      setResult(JSON.stringify(JSON.parse(text), null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    }
  }

  async function bridgePost(path: string) {
    setError("");
    setResult("");
    try {
      const res = await fetch(`${BRIDGE}${path}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-OF-Bridge-Token": BRIDGE_TOKEN,
        },
        body: JSON.stringify(payload()),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      setResult(JSON.stringify(JSON.parse(text), null, 2));
    } catch (err) {
      setError(
        err instanceof Error
          ? `Bridge failed (is bridge running?): ${err.message}`
          : messages.common.error,
      );
    }
  }

  async function listReaders() {
    setError("");
    try {
      const res = await fetch(`${BRIDGE}/v1/rfid/readers`, {
        headers: { "X-OF-Bridge-Token": BRIDGE_TOKEN },
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      setReaders(JSON.stringify(JSON.parse(text), null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    }
  }

  async function resolveAndInstall() {
    setError("");
    setResolveInfo("");
    try {
      const resolved = await fetch(
        `${getApiBase()}/api/v1/rfid/resolve?material=${encodeURIComponent(materialCode)}&color=${encodeURIComponent(colorToken)}`,
      );
      const resolveJson = (await resolved.json()) as {
        filamentVariantUuid?: string;
        profiles?: { uuid: string; title: string }[];
        error?: { message: string };
      };
      if (!resolved.ok) {
        throw new Error(resolveJson.error?.message ?? JSON.stringify(resolveJson));
      }
      setResolveInfo(JSON.stringify(resolveJson, null, 2));
      const profileUuid = resolveJson.profiles?.[0]?.uuid;
      if (!profileUuid) throw new Error("No mapped profile for this RFID identity");
      const exported = await fetch(`${getApiBase()}/api/v1/exports/creality`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileUuid }),
      });
      const exp = (await exported.json()) as {
        bridgeInstallPayload?: Record<string, unknown>;
      };
      if (!exported.ok || !exp.bridgeInstallPayload) {
        throw new Error("Export failed for mapped profile");
      }
      const install = await fetch(`${BRIDGE}/v1/rfid/map-install`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-OF-Bridge-Token": BRIDGE_TOKEN,
        },
        body: JSON.stringify({ bridgeInstallPayload: exp.bridgeInstallPayload }),
      });
      const text = await install.text();
      if (!install.ok) throw new Error(text);
      setResult(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    }
  }

  return (
    <div className="stack">
      <div className="banner-warn">
        Physical write requires a MIFARE reader, bridge built with{" "}
        <code>--features pcsc</code>, and <code>FEATURE_RFID_WRITE=true</code>.
        Simulate always verifies encode→write→read-back in memory.
      </div>
      <form className="stack panel" onSubmit={onSubmit}>
        <label>
          {m.materialCode}
          <input
            value={materialCode}
            onChange={(e) => setMaterialCode(e.target.value)}
            required
          />
        </label>
        <label>
          {m.colorToken}
          <input
            value={colorToken}
            onChange={(e) => setColorToken(e.target.value)}
            required
          />
        </label>
        <label>
          {m.weight}
          <input value={weight} onChange={(e) => setWeight(e.target.value)} />
        </label>
        <label>
          {m.serial}
          <input
            value={serial}
            maxLength={6}
            onChange={(e) => setSerial(e.target.value)}
          />
        </label>
        <label>
          {m.uid}
          <input value={uid} onChange={(e) => setUid(e.target.value)} />
        </label>
        <button type="submit">{m.submit}</button>
        <button type="button" onClick={() => bridgePost("/v1/rfid/simulate-write")}>
          {m.simulate}
        </button>
        <button type="button" onClick={() => bridgePost("/v1/rfid/write")}>
          Write RFID (policy-gated)
        </button>
        <button type="button" onClick={listReaders}>
          Detect readers
        </button>
        <button type="button" onClick={resolveAndInstall}>
          Resolve CFS → install profile
        </button>
      </form>
      {error ? <div className="banner-warn">{error}</div> : null}
      {readers ? (
        <div className="panel">
          <h3>Readers</h3>
          <pre>{readers}</pre>
        </div>
      ) : null}
      {resolveInfo ? (
        <div className="panel">
          <h3>RFID resolve</h3>
          <pre>{resolveInfo}</pre>
        </div>
      ) : null}
      {result ? <pre>{result}</pre> : null}
    </div>
  );
}
