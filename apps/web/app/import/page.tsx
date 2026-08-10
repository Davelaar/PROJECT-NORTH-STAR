"use client";

import { useState } from "react";
import { apiPost } from "@/lib/api";
import { authToken } from "@/lib/auth";

export default function ImportPage() {
  const [raw, setRaw] = useState("");
  const [kind, setKind] = useState<"creality" | "openfilamentprofile">("creality");
  const [out, setOut] = useState("");
  const [err, setErr] = useState("");

  async function run(dryRun: boolean) {
    setErr("");
    setOut("");
    const token = authToken();
    if (!token) {
      setErr("Login required");
      return;
    }
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const body =
        kind === "creality"
          ? { preset: parsed, dryRun }
          : { profile: parsed, dryRun };
      const res = await apiPost<unknown>(`/api/v1/imports/${kind}`, body, token);
      setOut(JSON.stringify(res, null, 2));
    } catch (e) {
      setErr(String(e));
    }
  }

  return (
    <div className="stack">
      <h1>Import preset</h1>
      <p className="muted">Imports create personal drafts — never auto-published as community truth.</p>
      <label>
        Format
        <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="creality">Creality Print JSON</option>
          <option value="openfilamentprofile">OpenFilamentProfile</option>
        </select>
      </label>
      <textarea rows={16} value={raw} onChange={(e) => setRaw(e.target.value)} />
      <div className="search-row">
        <button type="button" onClick={() => run(true)}>Dry run</button>
        <button type="button" onClick={() => run(false)}>Import draft</button>
      </div>
      {err ? <div className="banner-warn">{err}</div> : null}
      {out ? <pre>{out}</pre> : null}
    </div>
  );
}
