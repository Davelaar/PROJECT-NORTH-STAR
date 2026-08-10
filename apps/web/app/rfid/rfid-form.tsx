"use client";

import { useState } from "react";
import { getApiBase } from "@/lib/api";
import { messages } from "@/lib/messages/en";

export function RfidForm() {
  const m = messages.rfid;
  const [materialCode, setMaterialCode] = useState("ASA");
  const [colorToken, setColorToken] = useState("BTITAN");
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
        body: JSON.stringify({ materialCode, colorToken }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      setResult(JSON.stringify(JSON.parse(text), null, 2));
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    }
  }

  return (
    <div className="stack">
      <form className="stack panel" onSubmit={onSubmit}>
        <label>
          {m.materialCode}
          <input
            value={materialCode}
            maxLength={8}
            onChange={(e) => setMaterialCode(e.target.value)}
            required
          />
        </label>
        <label>
          {m.colorToken}
          <input
            value={colorToken}
            maxLength={7}
            onChange={(e) => setColorToken(e.target.value)}
            required
          />
        </label>
        <button type="submit">{m.submit}</button>
      </form>
      {error ? <div className="banner-warn">{error}</div> : null}
      {result ? <pre>{result}</pre> : null}
    </div>
  );
}
