"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { authToken } from "@/lib/auth";
import { messages } from "@/lib/messages/en";

type Variant = { uuid: string; title?: string; entityUuid?: string };
type Printer = { uuid: string; manufacturerName: string; model: string };
type Toolhead = { uuid: string; nozzleDiameterMm: number; hotendName: string };

export default function SubmitPage() {
  const [step, setStep] = useState(1);
  const [q, setQ] = useState("Flashforge ASA");
  const [results, setResults] = useState<Variant[]>([]);
  const [variantUuid, setVariantUuid] = useState("");
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [printerUuid, setPrinterUuid] = useState("");
  const [toolheads, setToolheads] = useState<Toolhead[]>([]);
  const [toolheadUuid, setToolheadUuid] = useState("");
  const [dried, setDried] = useState(false);
  const [params, setParams] = useState({
    nozzleTempOtherLayersC: "255",
    bedTempOtherLayersC: "100",
    flowRatio: "0.95",
    pressureAdvance: "0.03",
    maxVolumetricFlowMm3s: "28",
  });
  const [obsLimit, setObsLimit] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    apiGet<Printer[]>("/api/v1/printers").then(setPrinters).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!printerUuid) return;
    apiGet<Toolhead[]>(`/api/v1/toolheads?printerUuid=${printerUuid}`)
      .then(setToolheads)
      .catch(() => setToolheads([]));
  }, [printerUuid]);

  async function search() {
    const res = await apiGet<{ results: Variant[] }>(`/api/v1/search?q=${encodeURIComponent(q)}`);
    setResults(res.results.filter((r) => (r as { entityType?: string }).entityType === "filament_variant" || !!r.entityUuid || !!r.uuid));
  }

  async function submit(publish: boolean) {
    setErr("");
    setMsg("");
    const token = authToken();
    if (!token) {
      setErr("Login required");
      return;
    }
    try {
      const created = await apiPost<{ profileUuid: string; revisionUuid: string }>(
        "/api/v1/profiles",
        {
          filamentVariantUuid: variantUuid,
          printerModelUuid: printerUuid,
          toolheadConfigUuid: toolheadUuid,
          title: `Calibration ${new Date().toISOString().slice(0, 10)}`,
          parameters: Object.fromEntries(
            Object.entries(params).map(([k, v]) => [k, v === "" ? null : Number(v)]),
          ),
          notes: dried ? "Filament dried before calibration" : "Drying state unknown",
        },
        token,
      );
      if (obsLimit) {
        await apiPost(
          `/api/v1/revisions/${created.revisionUuid}/observations`,
          {
            testType: "max_volumetric_flow",
            observedLimit: Number(obsLimit),
            chosenOperatingLimit: Number(params.maxVolumetricFlowMm3s),
            unit: "mm3/s",
          },
          token,
        ).catch(() => undefined);
      }
      if (publish) {
        await apiPost(`/api/v1/profiles/${created.profileUuid}/publish`, {}, token);
      }
      setMsg(`Saved profile ${created.profileUuid}${publish ? " (published)" : " (draft)"}`);
    } catch (e) {
      setErr(String(e));
    }
  }

  return (
    <div className="stack">
      <h1>Submit calibration</h1>
      <p className="muted">Partial calibrations are allowed.</p>
      {step === 1 && (
        <section className="panel stack">
          <h3>1. Filament</h3>
          <div className="search-row">
            <input value={q} onChange={(e) => setQ(e.target.value)} />
            <button type="button" onClick={() => search().catch((e) => setErr(String(e)))}>
              Search
            </button>
          </div>
          <ul className="list">
            {results.map((r) => {
              const id = r.entityUuid || r.uuid;
              return (
                <li key={id}>
                  <button type="button" onClick={() => { setVariantUuid(id); setStep(2); }}>
                    {(r as { title?: string }).title || id}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {step === 2 && (
        <section className="panel stack">
          <h3>2. Printer / nozzle</h3>
          <label>
            Printer
            <select value={printerUuid} onChange={(e) => setPrinterUuid(e.target.value)}>
              <option value="">Select…</option>
              {printers.map((p) => (
                <option key={p.uuid} value={p.uuid}>
                  {p.manufacturerName} {p.model}
                </option>
              ))}
            </select>
          </label>
          <label>
            Toolhead
            <select value={toolheadUuid} onChange={(e) => setToolheadUuid(e.target.value)}>
              <option value="">Select…</option>
              {toolheads.map((t) => (
                <option key={t.uuid} value={t.uuid}>
                  {t.hotendName} {t.nozzleDiameterMm} mm
                </option>
              ))}
            </select>
          </label>
          <button type="button" disabled={!printerUuid || !toolheadUuid} onClick={() => setStep(3)}>
            Next
          </button>
        </section>
      )}
      {step === 3 && (
        <section className="panel stack">
          <h3>3. Values</h3>
          <label>
            <input type="checkbox" checked={dried} onChange={(e) => setDried(e.target.checked)} />{" "}
            Filament was dried
          </label>
          {Object.entries(params).map(([k, v]) => (
            <label key={k}>
              {k}
              <input
                value={v}
                onChange={(e) => setParams({ ...params, [k]: e.target.value })}
              />
            </label>
          ))}
          <label>
            Observed max flow failure (optional)
            <input value={obsLimit} onChange={(e) => setObsLimit(e.target.value)} />
          </label>
          <div className="search-row">
            <button type="button" onClick={() => submit(false)}>
              Save draft
            </button>
            <button type="button" onClick={() => submit(true)}>
              Save & publish
            </button>
          </div>
        </section>
      )}
      {err ? <div className="banner-warn">{err}</div> : null}
      {msg ? <div className="panel">{msg}</div> : null}
      <p className="muted">{messages.common.backHome}</p>
    </div>
  );
}
