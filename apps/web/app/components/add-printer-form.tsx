"use client";

import { useEffect, useState } from "react";
import { SearchableSelect } from "@/app/components/searchable-select";
import { useMessages } from "@/app/components/messages-provider";
import { apiGet, apiPost } from "@/lib/api";

type PrinterBrand = { name: string; models: Array<{ name: string }> };

const NOZZLES = ["0.2", "0.25", "0.4", "0.6", "0.8", "1.0"];

function fillName(template: string, name: string) {
  return template.replace("{name}", name);
}

/** Standalone community form: add printer brand/model + optional settings. */
export function AddPrinterForm() {
  const messages = useMessages();
  const m = messages.submitProfile;
  const f = messages.fields;
  const p = messages.printers;

  const [brands, setBrands] = useState<PrinterBrand[]>([]);
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [nozzle, setNozzle] = useState("0.4");
  const [maxNozzle, setMaxNozzle] = useState("");
  const [maxBed, setMaxBed] = useState("");
  const [chamber, setChamber] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    apiGet<PrinterBrand[]>("/api/v1/printer-brands")
      .then((rows) =>
        setBrands([...rows].sort((a, b) => a.name.localeCompare(b.name))),
      )
      .catch(() => undefined);
  }, []);

  const models =
    brands.find((b) => b.name === brand)?.models.map((x) => x.name) ?? [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const res = await apiPost<{
        created: { printer: boolean; toolhead: boolean };
        printer: { uuid: string; manufacturerName: string; model: string };
      }>("/api/v1/community/printers", {
        brand,
        model,
        nozzleDiameterMm: Number(nozzle),
        maxNozzleTempC: maxNozzle ? Number(maxNozzle) : null,
        maxBedTempC: maxBed ? Number(maxBed) : null,
        chamberCapable: chamber,
      });
      setStatus(
        res.created.printer
          ? p.addSuccessNew.replace(
              "{name}",
              `${res.printer.manufacturerName} ${res.printer.model}`,
            )
          : p.addSuccessExisting.replace(
              "{name}",
              `${res.printer.manufacturerName} ${res.printer.model}`,
            ),
      );
      const refreshed = await apiGet<PrinterBrand[]>("/api/v1/printer-brands");
      setBrands([...refreshed].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      setError(err instanceof Error ? err.message : p.addError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel stack add-printer-form" onSubmit={(e) => void onSubmit(e)}>
      <h2>{p.addHeading}</h2>
      <p className="muted">{p.addLead}</p>
      <SearchableSelect
        label={m.printerBrand}
        value={brand}
        onChange={(v) => {
          setBrand(v);
          setModel("");
        }}
        options={brands.map((x) => ({ value: x.name, label: x.name }))}
        placeholder={f.selectPlaceholder}
        searchPlaceholder={f.searchPlaceholder}
        emptyText={f.noMatches}
        allowCreate
        createLabel={(name) => fillName(m.addPrinterBrand, name)}
        creatingText={m.creating}
        onCreate={async (name) => {
          const trimmed = name.trim();
          setBrands((prev) => {
            if (prev.some((b) => b.name.toLowerCase() === trimmed.toLowerCase())) {
              return prev;
            }
            return [...prev, { name: trimmed, models: [] }].sort((a, b) =>
              a.name.localeCompare(b.name),
            );
          });
          setBrand(trimmed);
          setModel("");
        }}
        required
      />
      <SearchableSelect
        label={m.printerModel}
        value={model}
        onChange={setModel}
        options={models.map((name) => ({ value: name, label: name }))}
        placeholder={f.selectPlaceholder}
        searchPlaceholder={f.searchPlaceholder}
        emptyText={f.noMatches}
        disabled={!brand}
        allowCreate={Boolean(brand)}
        createLabel={(name) => fillName(m.addPrinterModel, name)}
        creatingText={m.creating}
        onCreate={async (name) => {
          const trimmed = name.trim();
          setBrands((prev) =>
            prev.map((b) => {
              if (b.name !== brand) return b;
              if (b.models.some((row) => row.name.toLowerCase() === trimmed.toLowerCase())) {
                return b;
              }
              return {
                ...b,
                models: [...b.models, { name: trimmed }].sort((a, c) =>
                  a.name.localeCompare(c.name),
                ),
              };
            }),
          );
          setModel(trimmed);
        }}
        required
      />
      <label>
        {m.nozzleDiameter}
        <select value={nozzle} onChange={(e) => setNozzle(e.target.value)} required>
          {NOZZLES.map((n) => (
            <option key={n} value={n}>
              {n} mm
            </option>
          ))}
        </select>
      </label>
      <label>
        {p.maxNozzleTemp}
        <input
          type="number"
          value={maxNozzle}
          onChange={(e) => setMaxNozzle(e.target.value)}
          min={0}
          max={500}
          placeholder="—"
        />
      </label>
      <label>
        {p.maxBedTemp}
        <input
          type="number"
          value={maxBed}
          onChange={(e) => setMaxBed(e.target.value)}
          min={0}
          max={200}
          placeholder="—"
        />
      </label>
      <label className="check-row">
        <input
          type="checkbox"
          checked={chamber}
          onChange={(e) => setChamber(e.target.checked)}
        />
        {p.chamberCapable}
      </label>
      {error ? <p role="alert">{error}</p> : null}
      {status ? <p role="status">{status}</p> : null}
      <button type="submit" className="btn" disabled={busy}>
        {busy ? m.creating : p.addCta}
      </button>
    </form>
  );
}
