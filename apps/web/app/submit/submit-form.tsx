"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useMessages } from "@/app/components/messages-provider";
import { SearchableSelect } from "@/app/components/searchable-select";
import { apiGet, apiPost } from "@/lib/api";

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
type VariantDetail = Variant & {
  productUuid: string;
  productName: string;
  manufacturerUuid: string;
  manufacturerName: string;
  materialCode: string;
  diameterMm?: number | null;
  densityGCm3?: number | null;
  manufacturerSpecs: {
    nozzleTempMinC: number | null;
    nozzleTempMaxC: number | null;
    bedTempMinC: number | null;
    bedTempMaxC: number | null;
    chamberTempC: number | null;
    chamberTempMinC: number | null;
    chamberTempMaxC: number | null;
    shrinkagePercentXy?: number | null;
    shrinkagePercentZ?: number | null;
  };
};
type PrinterBrand = { name: string; models: Array<{ name: string }> };

const NOZZLE_OPTIONS = ["0.2", "0.25", "0.4", "0.6", "0.8", "1.0"];

function fillName(template: string, name: string) {
  return template.replace("{name}", name);
}

function optionalNumber(raw: string): number | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : undefined;
}

export function SubmitProfileForm({
  initialVariantUuid = "",
}: {
  initialVariantUuid?: string;
}) {
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
  const [nozzleTempFirstLayerC, setNozzleTempFirstLayerC] = useState("");
  const [nozzleTempOtherLayersC, setNozzleTempOtherLayersC] = useState("");
  const [bedTempFirstLayerC, setBedTempFirstLayerC] = useState("");
  const [bedTempOtherLayersC, setBedTempOtherLayersC] = useState("");
  const [flowRatio, setFlowRatio] = useState("");
  const [pressureAdvance, setPressureAdvance] = useState("");
  const [maxVolumetricFlowMm3s, setMaxVolumetricFlowMm3s] = useState("");
  const [minVolumetricFlowMm3s, setMinVolumetricFlowMm3s] = useState("");
  const [fanMinPercent, setFanMinPercent] = useState("");
  const [fanMaxPercent, setFanMaxPercent] = useState("");
  const [bridgeFanPercent, setBridgeFanPercent] = useState("");
  const [fanDisableFirstLayers, setFanDisableFirstLayers] = useState("");
  const [shrinkagePercentXy, setShrinkagePercentXy] = useState("");
  const [shrinkagePercentZ, setShrinkagePercentZ] = useState("");
  const [filamentDiameterMm, setFilamentDiameterMm] = useState("");
  const [filamentDensityGCm3, setFilamentDensityGCm3] = useState("");
  const [retractionDistanceMm, setRetractionDistanceMm] = useState("");
  const [retractionSpeedMms, setRetractionSpeedMms] = useState("");

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [profileUuid, setProfileUuid] = useState<string | null>(null);

  async function reloadManufacturers() {
    const mfr = await apiGet<Manufacturer[]>("/api/v1/manufacturers");
    setManufacturers([...mfr].sort((a, b) => a.name.localeCompare(b.name)));
    return mfr;
  }

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
    if (initialVariantUuid) setVariantUuid(initialVariantUuid);
  }, [initialVariantUuid]);

  useEffect(() => {
    if (!variantUuid) return;
    apiGet<VariantDetail>(`/api/v1/variants/${variantUuid}`)
      .then((variant) => {
        setManufacturerUuid(variant.manufacturerUuid);
        setMaterialCode(variant.materialCode);
        setFilamentUuid(variant.productUuid);
        setVariants((rows) => {
          if (rows.some((row) => row.uuid === variant.uuid)) return rows;
          return [
            ...rows,
            {
              uuid: variant.uuid,
              variantName: variant.variantName,
              colorName: variant.colorName,
              primaryColorHex: variant.primaryColorHex,
            },
          ].sort((a, b) =>
            (a.colorName ?? a.variantName).localeCompare(
              b.colorName ?? b.variantName,
            ),
          );
        });
        const specs = variant.manufacturerSpecs;
        if (specs.nozzleTempMinC != null) {
          setNozzleTempMinC((prev) => prev || String(specs.nozzleTempMinC));
        }
        if (specs.nozzleTempMaxC != null) {
          setNozzleTempMaxC((prev) => prev || String(specs.nozzleTempMaxC));
        }
        const bedTemp = specs.bedTempMinC ?? specs.bedTempMaxC;
        if (bedTemp != null) setBedTempC((prev) => prev || String(bedTemp));
        const chamberTemp =
          specs.chamberTempC ?? specs.chamberTempMinC ?? specs.chamberTempMaxC;
        if (chamberTemp != null) {
          setChamberHeaterActive(true);
          setChamberTempC((prev) => prev || String(chamberTemp));
        }
        if (specs.shrinkagePercentXy != null) {
          setShrinkagePercentXy((prev) => prev || String(specs.shrinkagePercentXy));
        }
        if (specs.shrinkagePercentZ != null) {
          setShrinkagePercentZ((prev) => prev || String(specs.shrinkagePercentZ));
        }
        if (variant.diameterMm != null) {
          setFilamentDiameterMm((prev) => prev || String(variant.diameterMm));
        }
        if (variant.densityGCm3 != null) {
          setFilamentDensityGCm3((prev) => prev || String(variant.densityGCm3));
        }
        setTitle((prev) =>
          prev ||
            [
              variant.manufacturerName,
              variant.productName,
              variant.colorName ?? variant.variantName,
            ]
              .filter(Boolean)
              .join(" "),
        );
      })
      .catch(() => undefined);
  }, [variantUuid]);

  useEffect(() => {
    if (!manufacturerUuid) {
      setFilaments([]);
      return;
    }
    const qs = new URLSearchParams({ manufacturerUuid });
    if (materialCode) qs.set("materialCode", materialCode);
    apiGet<Filament[]>(`/api/v1/filaments?${qs}`)
      .then((rows) =>
        [...rows].sort((a, b) => a.productName.localeCompare(b.productName)),
      )
      .then((rows) => {
        setFilaments(rows);
        if (!filamentUuid && rows.length === 1) {
          setFilamentUuid(rows[0]!.uuid);
          setVariantUuid("");
        }
      })
      .catch(() => setFilaments([]));
  }, [manufacturerUuid, materialCode, filamentUuid]);

  useEffect(() => {
    if (!filamentUuid) {
      setVariants([]);
      return;
    }
    apiGet<Variant[]>(`/api/v1/filaments/${filamentUuid}/variants`)
      .then((rows) =>
        [...rows].sort((a, b) =>
          (a.colorName ?? a.variantName).localeCompare(
            b.colorName ?? b.variantName,
          ),
        ),
      )
      .then((rows) => {
        setVariants(rows);
        if (!variantUuid && rows.length === 1) {
          setVariantUuid(rows[0]!.uuid);
        }
      })
      .catch(() => setVariants([]));
  }, [filamentUuid, variantUuid]);

  const printerModels = useMemo(() => {
    const brand = printerBrands.find((b) => b.name === printerBrand);
    return brand?.models.map((row) => row.name) ?? [];
  }, [printerBrands, printerBrand]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setProfileUuid(null);
    if (!termsAccepted) {
      setError(m.termsRequired);
      return;
    }
    setBusy(true);
    try {
      await apiPost("/api/v1/contributions/terms", {
        termsVersion:
          process.env.NEXT_PUBLIC_CONTRIBUTION_TERMS_VERSION ?? "2026-08-10",
        contributionRef: variantUuid || undefined,
      });
      const data = await apiPost<{ profileUuid?: string }>(
        "/api/v1/community/profiles",
        {
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
          nozzleTempFirstLayerC: optionalNumber(nozzleTempFirstLayerC),
          nozzleTempOtherLayersC: optionalNumber(nozzleTempOtherLayersC),
          bedTempFirstLayerC: optionalNumber(bedTempFirstLayerC),
          bedTempOtherLayersC: optionalNumber(bedTempOtherLayersC),
          flowRatio: optionalNumber(flowRatio),
          pressureAdvance: optionalNumber(pressureAdvance),
          maxVolumetricFlowMm3s: optionalNumber(maxVolumetricFlowMm3s),
          minVolumetricFlowMm3s: optionalNumber(minVolumetricFlowMm3s),
          fanMinPercent: optionalNumber(fanMinPercent),
          fanMaxPercent: optionalNumber(fanMaxPercent),
          bridgeFanPercent: optionalNumber(bridgeFanPercent),
          fanDisableFirstLayers: optionalNumber(fanDisableFirstLayers),
          shrinkagePercentXy: optionalNumber(shrinkagePercentXy),
          shrinkagePercentZ: optionalNumber(shrinkagePercentZ),
          retractionDistanceMm: optionalNumber(retractionDistanceMm),
          retractionSpeedMms: optionalNumber(retractionSpeedMms),
          diameterMm: optionalNumber(filamentDiameterMm),
          densityGCm3: optionalNumber(filamentDensityGCm3),
        },
      );
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
          allowCreate
          createLabel={(name) => fillName(m.addBrand, name)}
          creatingText={m.creating}
          onCreate={async (name) => {
            const created = await apiPost<{ uuid: string; name: string }>(
              "/api/v1/community/manufacturers",
              { name },
            );
            await reloadManufacturers();
            setManufacturerUuid(created.uuid);
            setFilamentUuid("");
            setVariantUuid("");
          }}
          required
        />
        <SearchableSelect
          label={f.material}
          value={materialCode}
          onChange={(v) => {
            setMaterialCode(v);
            if (filamentUuid) {
              const product = filaments.find((row) => row.uuid === filamentUuid);
              if (product && product.materialCode !== v) {
                setFilamentUuid("");
                setVariantUuid("");
              }
            } else {
              setFilamentUuid("");
              setVariantUuid("");
            }
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
            const product = filaments.find((row) => row.uuid === v);
            setFilamentUuid(v);
            setVariantUuid("");
            if (product?.materialCode) setMaterialCode(product.materialCode);
          }}
          options={filaments.map((x) => ({
            value: x.uuid,
            label: materialCode
              ? x.productName
              : `${x.productName} (${x.materialCode})`,
          }))}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
          disabled={!manufacturerUuid}
          allowCreate={Boolean(manufacturerUuid && materialCode)}
          createLabel={(name) => fillName(m.addProduct, name)}
          creatingText={m.creating}
          onCreate={async (name) => {
            const created = await apiPost<{ uuid: string; productName: string }>(
              "/api/v1/community/filaments",
              {
                manufacturerUuid,
                materialCode,
                productName: name,
              },
            );
            const qs = new URLSearchParams({ manufacturerUuid, materialCode });
            const rows = await apiGet<Filament[]>(`/api/v1/filaments?${qs}`);
            setFilaments(
              [...rows].sort((a, b) =>
                a.productName.localeCompare(b.productName),
              ),
            );
            setFilamentUuid(created.uuid);
            setVariantUuid("");
          }}
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
          allowCreate={Boolean(filamentUuid)}
          createLabel={(name) => fillName(m.addColour, name)}
          creatingText={m.creating}
          onCreate={async (name) => {
            const created = await apiPost<{ uuid: string; variantName: string }>(
              "/api/v1/community/variants",
              {
                filamentProductUuid: filamentUuid,
                variantName: name,
                colorName: name,
              },
            );
            const rows = await apiGet<Variant[]>(
              `/api/v1/filaments/${filamentUuid}/variants`,
            );
            setVariants(
              [...rows].sort((a, b) =>
                (a.colorName ?? a.variantName).localeCompare(
                  b.colorName ?? b.variantName,
                ),
              ),
            );
            setVariantUuid(created.uuid);
          }}
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
          allowCreate
          createLabel={(name) => fillName(m.addPrinterBrand, name)}
          creatingText={m.creating}
          onCreate={async (name) => {
            const trimmed = name.trim();
            setPrinterBrands((prev) => {
              if (prev.some((b) => b.name.toLowerCase() === trimmed.toLowerCase())) {
                return prev;
              }
              return [...prev, { name: trimmed, models: [] }].sort((a, b) =>
                a.name.localeCompare(b.name),
              );
            });
            setPrinterBrand(trimmed);
            setPrinterModel("");
          }}
          required
        />
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
          allowCreate={Boolean(printerBrand)}
          createLabel={(name) => fillName(m.addPrinterModel, name)}
          creatingText={m.creating}
          onCreate={async (name) => {
            const trimmed = name.trim();
            setPrinterBrands((prev) =>
              prev.map((b) => {
                if (b.name !== printerBrand) return b;
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
            setPrinterModel(trimmed);
          }}
          required
        />
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
        <p className="muted">{m.optionalCalibrationLead}</p>
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

        <h3>{m.printTempsHeading}</h3>
        <label>
          {m.nozzleTempFirstLayer}
          <input
            type="number"
            inputMode="decimal"
            value={nozzleTempFirstLayerC}
            onChange={(e) => setNozzleTempFirstLayerC(e.target.value)}
            min={0}
            max={500}
            placeholder="—"
          />
        </label>
        <label>
          {m.nozzleTempOtherLayers}
          <input
            type="number"
            inputMode="decimal"
            value={nozzleTempOtherLayersC}
            onChange={(e) => setNozzleTempOtherLayersC(e.target.value)}
            min={0}
            max={500}
            placeholder="—"
          />
        </label>
        <label>
          {m.bedTempFirstLayer}
          <input
            type="number"
            inputMode="decimal"
            value={bedTempFirstLayerC}
            onChange={(e) => setBedTempFirstLayerC(e.target.value)}
            min={0}
            max={200}
            placeholder="—"
          />
        </label>
        <label>
          {m.bedTempOtherLayers}
          <input
            type="number"
            inputMode="decimal"
            value={bedTempOtherLayersC}
            onChange={(e) => setBedTempOtherLayersC(e.target.value)}
            min={0}
            max={200}
            placeholder="—"
          />
        </label>

        <h3>{m.extrusionHeading}</h3>
        <label>
          {m.flowRatio}
          <input
            type="number"
            step="0.01"
            min={0.5}
            max={2}
            value={flowRatio}
            onChange={(e) => setFlowRatio(e.target.value)}
            placeholder="—"
          />
        </label>
        <label>
          {m.pressureAdvance}
          <input
            type="number"
            step="0.001"
            min={0}
            max={2}
            value={pressureAdvance}
            onChange={(e) => setPressureAdvance(e.target.value)}
            placeholder="—"
          />
        </label>
        <label>
          {m.maxVolumetricFlow}
          <input
            type="number"
            step="0.1"
            min={0}
            max={200}
            value={maxVolumetricFlowMm3s}
            onChange={(e) => setMaxVolumetricFlowMm3s(e.target.value)}
            placeholder="—"
          />
        </label>
        <label>
          {m.minVolumetricFlow}
          <input
            type="number"
            step="0.1"
            min={0}
            max={200}
            value={minVolumetricFlowMm3s}
            onChange={(e) => setMinVolumetricFlowMm3s(e.target.value)}
            placeholder="—"
          />
        </label>

        <h3>{m.coolingHeading}</h3>
        <label>
          {m.fanMin}
          <input
            type="number"
            min={0}
            max={100}
            value={fanMinPercent}
            onChange={(e) => setFanMinPercent(e.target.value)}
            placeholder="—"
          />
        </label>
        <label>
          {m.fanMax}
          <input
            type="number"
            min={0}
            max={100}
            value={fanMaxPercent}
            onChange={(e) => setFanMaxPercent(e.target.value)}
            placeholder="—"
          />
        </label>
        <label>
          {m.bridgeFan}
          <input
            type="number"
            min={0}
            max={100}
            value={bridgeFanPercent}
            onChange={(e) => setBridgeFanPercent(e.target.value)}
            placeholder="—"
          />
        </label>
        <label>
          {m.fanDisableFirstLayers}
          <input
            type="number"
            min={0}
            max={20}
            step={1}
            value={fanDisableFirstLayers}
            onChange={(e) => setFanDisableFirstLayers(e.target.value)}
            placeholder="—"
          />
        </label>

        <h3>{m.dimensionalHeading}</h3>
        <label>
          {m.filamentDiameter}
          <input
            type="number"
            step="0.01"
            min={0.5}
            max={5}
            value={filamentDiameterMm}
            onChange={(e) => setFilamentDiameterMm(e.target.value)}
            placeholder="1.75"
          />
        </label>
        <label>
          {m.filamentDensity}
          <input
            type="number"
            step="0.01"
            min={0.1}
            max={5}
            value={filamentDensityGCm3}
            onChange={(e) => setFilamentDensityGCm3(e.target.value)}
            placeholder="—"
          />
        </label>
        <label>
          {m.shrinkageXy}
          <input
            type="number"
            step="0.01"
            min={-5}
            max={20}
            value={shrinkagePercentXy}
            onChange={(e) => setShrinkagePercentXy(e.target.value)}
            placeholder="—"
          />
        </label>
        <label>
          {m.shrinkageZ}
          <input
            type="number"
            step="0.01"
            min={-5}
            max={20}
            value={shrinkagePercentZ}
            onChange={(e) => setShrinkagePercentZ(e.target.value)}
            placeholder="—"
          />
        </label>

        <h3>{m.retractionHeading}</h3>
        <label>
          {m.retractionDistance}
          <input
            type="number"
            step="0.01"
            min={0}
            max={20}
            value={retractionDistanceMm}
            onChange={(e) => setRetractionDistanceMm(e.target.value)}
            placeholder="—"
          />
        </label>
        <label>
          {m.retractionSpeed}
          <input
            type="number"
            step="1"
            min={0}
            max={200}
            value={retractionSpeedMms}
            onChange={(e) => setRetractionSpeedMms(e.target.value)}
            placeholder="—"
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
          {m.termsAcceptPrefix}{" "}
          <Link href="/terms">{m.termsAcceptLink}</Link>{" "}
          {m.termsAcceptSuffix}
        </span>
      </label>

      <button
        type="submit"
        className="button"
        disabled={busy || !variantUuid || !termsAccepted}
      >
        {busy ? messages.common.loading : m.submit}
      </button>
      <p className="muted">{m.ofdNote}</p>
    </form>
  );
}
