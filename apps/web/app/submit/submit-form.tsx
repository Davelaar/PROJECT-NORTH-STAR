"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMessages } from "@/app/components/messages-provider";
import { SearchableSelect } from "@/app/components/searchable-select";
import { apiGet, getApiBase } from "@/lib/api";

type Manufacturer = { uuid: string; name: string };
type Material = { uuid: string; code: string; name: string };
type Filament = {
  uuid: string;
  productName: string;
  manufacturerUuid: string;
  materialCode: string;
};
type Variant = {
  uuid: string;
  variantName: string;
  colorName: string | null;
  primaryColorHex: string | null;
};
type PrinterBrand = { name: string; models: Array<{ name: string }> };

const NOZZLE_OPTIONS = ["0.2", "0.25", "0.4", "0.6", "0.8", "1.0"];

export function SubmitProfileForm() {
  const messages = useMessages();
  const m = messages.submitProfile;
  const f = messages.fields;

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [printerBrands, setPrinterBrands] = useState<PrinterBrand[]>([]);

  const [manufacturerUuid, setManufacturerUuid] = useState("");
  const [materialCode, setMaterialCode] = useState("");
  const [filamentUuid, setFilamentUuid] = useState("");
  const [variantUuid, setVariantUuid] = useState("");
  const [printerBrand, setPrinterBrand] = useState("");
  const [printerModel, setPrinterModel] = useState("");
  const [nozzleDiameterMm, setNozzleDiameterMm] = useState("0.4");
  const [nozzleTempMinC, setNozzleTempMinC] = useState("");
  const [nozzleTempMaxC, setNozzleTempMaxC] = useState("");
  const [bedTempC, setBedTempC] = useState("");
  const [chamberHeaterActive, setChamberHeaterActive] = useState(false);
  const [chamberTempC, setChamberTempC] = useState("");
  const [contributorName, setContributorName] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [flowRatio, setFlowRatio] = useState("");
  const [pressureAdvance, setPressureAdvance] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [profileUuid, setProfileUuid] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiGet<Manufacturer[]>("/api/v1/manufacturers"),
      apiGet<Material[]>("/api/v1/materials"),
      apiGet<PrinterBrand[]>("/api/v1/printer-brands"),
    ])
      .then(([mfr, mats, brands]) => {
        setManufacturers([...mfr].sort((a, b) => a.name.localeCompare(b.name)));
        setMaterials([...mats].sort((a, b) => a.code.localeCompare(b.code)));
        setPrinterBrands(
          [...brands].sort((a, b) => a.name.localeCompare(b.name)),
        );
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!manufacturerUuid || !materialCode) {
      setFilaments([]);
      return;
    }
    const qs = new URLSearchParams({ manufacturerUuid, materialCode });
    apiGet<Filament[]>(`/api/v1/filaments?${qs}`)
      .then((rows) =>
        setFilaments(
          [...rows].sort((a, b) => a.productName.localeCompare(b.productName)),
        ),
      )
      .catch(() => setFilaments([]));
  }, [manufacturerUuid, materialCode]);

  useEffect(() => {
    if (!filamentUuid) {
      setVariants([]);
      return;
    }
    apiGet<Variant[]>(`/api/v1/filaments/${filamentUuid}/variants`)
      .then((rows) =>
        setVariants(
          [...rows].sort((a, b) =>
            (a.colorName ?? a.variantName).localeCompare(
              b.colorName ?? b.variantName,
            ),
          ),
        ),
      )
      .catch(() => setVariants([]));
  }, [filamentUuid]);

  const printerModels = useMemo(() => {
    const brand = printerBrands.find((b) => b.name === printerBrand);
    return brand?.models.map((row) => row.name) ?? [];
  }, [printerBrands, printerBrand]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setProfileUuid(null);
    if (!termsAccepted) {
      setError("Accept the contribution terms to continue.");
      return;
    }
    setBusy(true);
    try {
      await fetch(`${getApiBase()}/api/v1/contributions/terms`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          termsVersion:
            process.env.NEXT_PUBLIC_CONTRIBUTION_TERMS_VERSION ?? "2026-08-10",
          contributionRef: variantUuid || undefined,
        }),
      });
      const res = await fetch(`${getApiBase()}/api/v1/community/profiles`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          filamentVariantUuid: variantUuid,
          printerBrand,
          printerModel,
          nozzleDiameterMm: Number(nozzleDiameterMm),
          nozzleTempMinC: Number(nozzleTempMinC),
          nozzleTempMaxC: Number(nozzleTempMaxC),
          bedTempC: Number(bedTempC),
          chamberHeaterActive,
          chamberTempC: chamberHeaterActive ? Number(chamberTempC) : null,
          title: title.trim() || undefined,
          notes: notes.trim() || undefined,
          contributorName: contributorName.trim() || undefined,
          flowRatio: flowRatio ? Number(flowRatio) : undefined,
          pressureAdvance: pressureAdvance
            ? Number(pressureAdvance)
            : undefined,
        }),
      });
      const data = (await res.json()) as {
        profileUuid?: string;
        error?: { message?: string };
      };
      if (!res.ok) {
        throw new Error(data.error?.message ?? m.errorGeneric);
      }
      setProfileUuid(data.profileUuid ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : m.errorGeneric);
    } finally {
      setBusy(false);
    }
  }

  if (profileUuid) {
    return (
      <div className="panel stack">
        <p>
          <strong>{m.success}</strong>
        </p>
        <Link className="button" href={`/profiles/${profileUuid}`}>
          {m.viewProfile}
        </Link>
      </div>
    );
  }

  return (
    <form className="stack" onSubmit={onSubmit}>
      <p className="muted">{m.noLogin}</p>
      <p>
        <strong>{m.requiredNote}</strong>
      </p>

      <section className="panel stack">
        <h2>{m.filamentHeading}</h2>
        <SearchableSelect
          label={f.manufacturer}
          value={manufacturerUuid}
          onChange={(v) => {
            setManufacturerUuid(v);
            setFilamentUuid("");
            setVariantUuid("");
          }}
          options={manufacturers.map((x) => ({
            value: x.uuid,
            label: x.name,
          }))}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
          required
        />
        <SearchableSelect
          label={f.material}
          value={materialCode}
          onChange={(v) => {
            setMaterialCode(v);
            setFilamentUuid("");
            setVariantUuid("");
          }}
          options={materials.map((x) => ({
            value: x.code,
            label: `${x.code} — ${x.name}`,
          }))}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
          required
        />
        <SearchableSelect
          label={f.product}
          value={filamentUuid}
          onChange={(v) => {
            setFilamentUuid(v);
            setVariantUuid("");
          }}
          options={filaments.map((x) => ({
            value: x.uuid,
            label: x.productName,
          }))}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
          disabled={!manufacturerUuid || !materialCode}
          required
        />
        <SearchableSelect
          label={f.variant}
          value={variantUuid}
          onChange={setVariantUuid}
          options={variants.map((x) => ({
            value: x.uuid,
            label: x.colorName ?? x.variantName,
          }))}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
          disabled={!filamentUuid}
          required
        />
      </section>

      <section className="panel stack">
        <h2>{m.printerHeading}</h2>
        <SearchableSelect
          label={m.printerBrand}
          value={printerBrand}
          onChange={(v) => {
            setPrinterBrand(v);
            setPrinterModel("");
          }}
          options={printerBrands.map((x) => ({
            value: x.name,
            label: x.name,
          }))}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
          required
        />
        {printerModels.length > 0 ? (
          <SearchableSelect
            label={m.printerModel}
            value={printerModel}
            onChange={setPrinterModel}
            options={printerModels.map((name) => ({
              value: name,
              label: name,
            }))}
            placeholder={f.selectPlaceholder}
            searchPlaceholder={f.searchPlaceholder}
            emptyText={f.noMatches}
            disabled={!printerBrand}
            required
          />
        ) : (
          <label>
            {m.printerModel}
            <input
              value={printerModel}
              onChange={(e) => setPrinterModel(e.target.value)}
              required
              disabled={!printerBrand}
              placeholder="K2 Plus"
            />
          </label>
        )}
        <label>
          {m.nozzleDiameter}
          <select
            value={nozzleDiameterMm}
            onChange={(e) => setNozzleDiameterMm(e.target.value)}
            required
          >
            {NOZZLE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} mm
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="panel stack">
        <h2>{m.tempsHeading}</h2>
        <label>
          {m.nozzleTempMin}
          <input
            type="number"
            inputMode="decimal"
            value={nozzleTempMinC}
            onChange={(e) => setNozzleTempMinC(e.target.value)}
            required
            min={0}
            max={500}
          />
        </label>
        <label>
          {m.nozzleTempMax}
          <input
            type="number"
            inputMode="decimal"
            value={nozzleTempMaxC}
            onChange={(e) => setNozzleTempMaxC(e.target.value)}
            required
            min={0}
            max={500}
          />
        </label>
        <label>
          {m.bedTemp}
          <input
            type="number"
            inputMode="decimal"
            value={bedTempC}
            onChange={(e) => setBedTempC(e.target.value)}
            required
            min={0}
            max={200}
          />
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            checked={chamberHeaterActive}
            onChange={(e) => setChamberHeaterActive(e.target.checked)}
          />
          {m.chamberHeater}
        </label>
        {chamberHeaterActive ? (
          <label>
            {m.chamberTemp}
            <input
              type="number"
              inputMode="decimal"
              value={chamberTempC}
              onChange={(e) => setChamberTempC(e.target.value)}
              required
              min={0}
              max={200}
            />
          </label>
        ) : null}
      </section>

      <section className="panel stack">
        <h2>{m.optionalHeading}</h2>
        <label>
          {m.contributorName}
          <input
            value={contributorName}
            onChange={(e) => setContributorName(e.target.value)}
          />
        </label>
        <label>
          {m.title}
          <input value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          {m.flowRatio}
          <input
            type="number"
            step="0.01"
            value={flowRatio}
            onChange={(e) => setFlowRatio(e.target.value)}
          />
        </label>
        <label>
          {m.pressureAdvance}
          <input
            type="number"
            step="0.001"
            value={pressureAdvance}
            onChange={(e) => setPressureAdvance(e.target.value)}
          />
        </label>
        <label>
          {m.notes}
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </label>
      </section>

      {error ? <div className="banner-warn">{error}</div> : null}

      <label className="terms-accept">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          required
        />
        <span>
          I accept the{" "}
          <Link href="/terms">contribution terms</Link> and understand my email
          stays private while the calibration may remain public if I later delete
          my account (anonymized attribution).
        </span>
      </label>

      <button
        type="submit"
        className="button"
        disabled={busy || !variantUuid || !termsAccepted}
      >        {busy ? messages.common.loading : m.submit}
      </button>
      <p className="muted">{m.ofdNote}</p>
    </form>
  );
}
