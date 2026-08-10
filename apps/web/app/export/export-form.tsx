"use client";

import { useState } from "react";
import { getApiBase } from "@/lib/api";
import { messages } from "@/lib/messages/en";

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
  const [error, setError] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult("");
    try {
      const res = await fetch(`${getApiBase()}/api/v1/exports/${format}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileUuid }),
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
      </form>
      {error ? <div className="banner-warn">{error}</div> : null}
      {result ? <pre>{result}</pre> : null}
    </div>
  );
}
