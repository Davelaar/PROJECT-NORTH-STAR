"use client";

import { useState } from "react";
import { getApiBase } from "@/lib/api";
import { messages } from "@/lib/messages/en";

const BRIDGE = "http://127.0.0.1:8788";
const BRIDGE_TOKEN =
  process.env.NEXT_PUBLIC_OF_BRIDGE_TOKEN ?? "local-dev-token";

export function RfidForm() {
  const m = messages.rfid;
  const [materialCode, setMaterialCode] = useState("ASA");
  const [colorToken, setColorToken] = useState("#A52A2A");
  const [weight, setWeight] = useState("1kg");
  const [serial, setSerial] = useState("000001");
  const [uid, setUid] = useState("35B94A19");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult("");
    try {
      const res = await fetch(`${getApiBase()}/api/v1/rfid/encode`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          material: materialCode,
          color: colorToken,
          weightOrLength: weight,
          serial,
          uid,
        }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      setResult(JSON.stringify(JSON.parse(text), null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    }
  }

  async function simulateWrite() {
    setError("");
    setResult("");
    try {
      const res = await fetch(`${BRIDGE}/v1/rfid/simulate-write`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "X-OF-Bridge-Token": BRIDGE_TOKEN,
        },
        body: JSON.stringify({
          material: materialCode,
          color: colorToken,
          weightOrLength: weight,
          serial,
          uid,
        }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      setResult(JSON.stringify(JSON.parse(text), null, 2));
    } catch (err) {
      setError(
        err instanceof Error
          ? `Simulate failed (is bridge running?): ${err.message}`
          : messages.common.error,
      );
    }
  }

  return (
    <div className="stack">
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
          <input
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
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
        <button type="button" onClick={simulateWrite}>
          {m.simulate}
        </button>
      </form>
      {error ? <div className="banner-warn">{error}</div> : null}
      {result ? <pre>{result}</pre> : null}
    </div>
  );
}
