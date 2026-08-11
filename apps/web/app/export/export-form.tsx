"use client";

import Link from "next/link";
import { useMessages } from "@/app/components/messages-provider";
import { SearchableSelect } from "@/app/components/searchable-select";
import { useEffect, useMemo, useState } from "react";
import { getApiBase, apiGet } from "@/lib/api";
import {
  detectBrowserCapabilities,
  slicerSaveMode,
} from "@/lib/capabilities";
import {
  getSlicerEntry,
  listInterchangeFormats,
  listSlicerPresets,
  type SlicerFormatId,
} from "@open-filament/domain";

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
  materialCode: string;
};
type ProfileRow = {
  uuid: string;
  title: string;
  printerName: string;
  nozzleDiameterMm: number;
};
type ProfileBundle = {
  uuid: string;
  variantUuid: string;
};

function downloadBlob(filename: string, contents: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function formatLabel(
  id: SlicerFormatId,
  formats: Record<string, string>,
): string {
  return formats[id] ?? id;
}

export function ExportForm({
  initialProfileUuid,
  initialFormat,
}: {
  initialProfileUuid: string;
  initialFormat?: string;
}) {
  const messages = useMessages();
  const m = messages.export;
  const f = messages.fields;
  const slicers = listSlicerPresets();
  const interchange = listInterchangeFormats();

  const initial =
    (initialFormat && getSlicerEntry(initialFormat)?.id) || "creality";

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [manufacturerUuid, setManufacturerUuid] = useState("");
  const [materialCode, setMaterialCode] = useState("");
  const [filamentUuid, setFilamentUuid] = useState("");
  const [variantUuid, setVariantUuid] = useState("");
  const [profileUuid, setProfileUuid] = useState(initialProfileUuid);
  const [format, setFormat] = useState<SlicerFormatId>(initial as SlicerFormatId);
  const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [downloaded, setDownloaded] = useState(false);
  const [canFs, setCanFs] = useState(false);

  const entry = getSlicerEntry(format);

  useEffect(() => {
    const caps = detectBrowserCapabilities();
    setCanFs(slicerSaveMode(caps) === "save_to_folder");
  }, []);

  useEffect(() => {
    Promise.all([
      apiGet<Manufacturer[]>("/api/v1/manufacturers"),
      apiGet<Material[]>("/api/v1/materials"),
    ])
      .then(([mfr, mats]) => {
        setManufacturers([...mfr].sort((a, b) => a.name.localeCompare(b.name)));
        setMaterials([...mats].sort((a, b) => a.code.localeCompare(b.code)));
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!initialProfileUuid) return;
    apiGet<ProfileBundle>(`/api/v1/profiles/${initialProfileUuid}`)
      .then((profile) => apiGet<VariantDetail>(`/api/v1/variants/${profile.variantUuid}`))
      .then((variant) => {
        setManufacturerUuid(variant.manufacturerUuid);
        setMaterialCode(variant.materialCode);
        setFilamentUuid(variant.productUuid);
        setVariantUuid(variant.uuid);
      })
      .catch(() => undefined);
  }, [initialProfileUuid]);

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
          setProfiles([]);
        }
      })
      .catch(() => setFilaments([]));
  }, [manufacturerUuid, materialCode, initialProfileUuid, filamentUuid]);

  useEffect(() => {
    if (!filamentUuid) {
      setVariants([]);
      return;
    }
    apiGet<Variant[]>(`/api/v1/filaments/${filamentUuid}/variants`)
      .then((rows) =>
        [...rows].sort((a, b) => a.variantName.localeCompare(b.variantName)),
      )
      .then((rows) => {
        setVariants(rows);
        if (!variantUuid && rows.length === 1) {
          setVariantUuid(rows[0]!.uuid);
          setProfiles([]);
        }
      })
      .catch(() => setVariants([]));
  }, [filamentUuid, variantUuid]);

  useEffect(() => {
    if (!variantUuid) {
      setProfiles([]);
      return;
    }
    apiGet<ProfileRow[]>(`/api/v1/variants/${variantUuid}/profiles`)
      .then((rows) => {
        setProfiles(rows);
        if (!profileUuid && rows.length === 1) {
          setProfileUuid(rows[0]!.uuid);
        }
      })
      .catch(() => setProfiles([]));
  }, [variantUuid, profileUuid]);

  const suggestedName = useMemo(() => {
    if (!payload) return entry ? `openfilament${entry.extension}` : "preset";
    return String(
      payload.suggestedFileName ??
        (format === "prusaslicer"
          ? "openfilament-filament.ini"
          : "openfilament-profile.json"),
    );
  }, [payload, format, entry]);

  const manufacturerOptions = useMemo(
    () => manufacturers.map((x) => ({ value: x.uuid, label: x.name })),
    [manufacturers],
  );
  const materialOptions = useMemo(
    () =>
      materials.map((x) => ({
        value: x.code,
        label: `${x.code} — ${x.name}`,
      })),
    [materials],
  );
  const filamentOptions = useMemo(
    () =>
      filaments.map((x) => ({
        value: x.uuid,
        label: materialCode
          ? x.productName
          : `${x.productName} (${x.materialCode})`,
      })),
    [filaments, materialCode],
  );
  const variantOptions = useMemo(
    () =>
      variants.map((x) => ({
        value: x.uuid,
        label: `${x.colorName || x.variantName}${
          x.primaryColorHex ? ` (${x.primaryColorHex})` : ""
        }`,
      })),
    [variants],
  );
  const profileOptions = useMemo(() => {
    const rows = profiles.map((p) => ({
      value: p.uuid,
      label: `${p.title} — ${p.printerName}, ${p.nozzleDiameterMm} mm`,
    }));
    if (
      initialProfileUuid &&
      !rows.some((p) => p.value === initialProfileUuid)
    ) {
      rows.push({
        value: initialProfileUuid,
        label: `${f.profile} (${initialProfileUuid.slice(0, 8)}…)`,
      });
    }
    return rows;
  }, [profiles, initialProfileUuid, f.profile]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setPayload(null);
    setStatusMsg("");
    setDownloaded(false);
    if (!profileUuid) {
      setError(
        variantUuid && profiles.length === 0
          ? m.starterEmptyHeading
          : m.chooseProfile,
      );
      return;
    }
    if (!entry?.downloadEnabled) {
      setError(m.plannedDisabled);
      return;
    }
    try {
      const res = await fetch(`${getApiBase()}/api/v1/exports/${format}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profileUuid }),
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      const json = JSON.parse(text) as Record<string, unknown>;
      setPayload(json);
      setStatusMsg(m.presetCreated);
    } catch (err) {
      setError(err instanceof Error ? err.message : messages.common.error);
    }
  }

  function fileContents(): string {
    if (!payload) return "";
    if (format === "prusaslicer") return String(payload.presetText ?? "");
    if (format === "openfilamentprofile") {
      return JSON.stringify(payload.profile ?? payload, null, 2);
    }
    return JSON.stringify(payload.preset ?? payload, null, 2);
  }

  function downloadProfile() {
    setError("");
    if (!payload || !entry) {
      setError(m.exportFirst);
      return;
    }
    downloadBlob(suggestedName, fileContents(), entry.mimeType);
    setDownloaded(true);
    setStatusMsg(m.noInstallClaim);
  }

  async function saveWithFileSystemAccess() {
    setError("");
    if (!payload || !entry) {
      setError(m.exportFirst);
      return;
    }
    const w = window as Window & {
      showSaveFilePicker?: (opts: unknown) => Promise<FileSystemFileHandle>;
    };
    if (!w.showSaveFilePicker) return;
    try {
      const handle = await w.showSaveFilePicker({
        suggestedName,
        types: [
          {
            description: entry.name,
            accept: {
              [entry.mimeType]: [entry.extension],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(fileContents());
      await writable.close();
      setDownloaded(true);
      setStatusMsg(m.noInstallClaim);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : messages.common.error);
    }
  }

  const statusText =
    entry?.status === "beta"
      ? "Beta"
      : entry?.status === "interchange"
        ? "Interchange"
        : entry?.status === "supported"
          ? "Supported"
          : entry?.status === "planned"
            ? "Planned"
            : "";

  return (
    <div className="stack">
      <div className="banner-warn">{m.banner}</div>
      <p>
        <Link href="/docs/slicers">{m.supportedSlicersLink}</Link>
      </p>

      <form className="stack panel" onSubmit={onSubmit}>
        <SearchableSelect
          label={f.manufacturer}
          value={manufacturerUuid}
          onChange={(v) => {
            setManufacturerUuid(v);
            setFilamentUuid("");
            setVariantUuid("");
            setProfiles([]);
            setProfileUuid("");
          }}
          options={manufacturerOptions}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
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
                setProfiles([]);
                setProfileUuid("");
              }
            } else {
              setFilamentUuid("");
              setVariantUuid("");
              setProfiles([]);
              setProfileUuid("");
            }
          }}
          options={materialOptions}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
        />
        <SearchableSelect
          label={f.product}
          value={filamentUuid}
          onChange={(v) => {
            const product = filaments.find((row) => row.uuid === v);
            setFilamentUuid(v);
            setVariantUuid("");
            setProfiles([]);
            setProfileUuid("");
            if (product?.materialCode) setMaterialCode(product.materialCode);
          }}
          options={filamentOptions}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
          disabled={!manufacturerUuid}
        />
        <SearchableSelect
          label={f.variant}
          value={variantUuid}
          onChange={(v) => {
            setVariantUuid(v);
            setProfiles([]);
            setProfileUuid("");
          }}
          options={variantOptions}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
          disabled={!filamentUuid}
        />
        <SearchableSelect
          label={f.profile}
          value={profileUuid}
          onChange={setProfileUuid}
          options={profileOptions}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
          disabled={!variantUuid && !initialProfileUuid}
        />

        {variantUuid && profiles.length === 0 && !profileUuid ? (
          <div className="panel" role="status">
            <h3>{m.starterEmptyHeading}</h3>
            <p>{m.starterEmptyBody}</p>
            <div className="home-cta-links">
              {entry?.downloadEnabled ? (
                <a
                  className="button"
                  href={`${getApiBase()}/api/v1/variants/${variantUuid}/exports/starter?format=${encodeURIComponent(format)}&nozzleDiameterMm=0.4`}
                >
                  {m.downloadStarter} — {formatLabel(format, m.formats)}
                </a>
              ) : null}
              <Link className="button secondary" href={`/variants/${variantUuid}`}>
                {messages.variant.manufacturerSpecs}
              </Link>
            </div>
          </div>
        ) : null}

        <fieldset className="format-fieldset">
          <legend>{m.format}</legend>
          <p className="muted">{m.slicerPresets}</p>
          <div className="format-options" role="radiogroup" aria-label={m.slicerPresets}>
            {slicers.map((s) => {
              const disabled = !s.downloadEnabled;
              return (
                <label
                  key={s.id}
                  className={`format-option${format === s.id ? " selected" : ""}${disabled ? " disabled" : ""}`}
                >
                  <input
                    type="radio"
                    name="format"
                    value={s.id}
                    checked={format === s.id}
                    disabled={disabled}
                    onChange={() => {
                      setFormat(s.id);
                      setPayload(null);
                      setDownloaded(false);
                      setStatusMsg("");
                    }}
                  />
                  <span>
                    <strong>{formatLabel(s.id, m.formats)}</strong>
                    <span className={`badge badge-status-${s.status}`}>
                      {statusText && s.id === format ? statusText : s.status}
                    </span>
                    <span className="muted">
                      {" "}
                      {m.versionsLabel}: {s.supportedVersions.join(", ")} ·{" "}
                      {m.extensionLabel}: {s.extension}
                    </span>
                    {s.docsPath ? (
                      <Link href={s.docsPath}>
                        {m.viewInstructionsNamed.replace("{name}", s.name)}
                      </Link>
                    ) : null}
                    {disabled ? (
                      <span className="muted"> — {m.plannedDisabled}</span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
          <p className="muted">{m.portableData}</p>
          <div className="format-options">
            {interchange.map((s) => (
              <label
                key={s.id}
                className={`format-option${format === s.id ? " selected" : ""}`}
              >
                <input
                  type="radio"
                  name="format"
                  value={s.id}
                  checked={format === s.id}
                  onChange={() => {
                    setFormat(s.id);
                    setPayload(null);
                    setDownloaded(false);
                    setStatusMsg("");
                  }}
                />
                  <span>
                    <strong>{formatLabel(s.id, m.formats)}</strong>
                    <span className={`badge badge-status-${s.status}`}>
                      {s.status === "interchange"
                        ? m.portableData
                        : s.status}
                    </span>
                  </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit">{m.submit}</button>
        {payload ? (
          <>
            <button type="button" onClick={downloadProfile}>
              {m.download}
            </button>
            {canFs ? (
              <button
                type="button"
                className="secondary"
                onClick={saveWithFileSystemAccess}
              >
                {m.savePicker}
              </button>
            ) : null}
          </>
        ) : null}
      </form>

      {error ? (
        <div className="banner-warn" role="alert">
          {error}
        </div>
      ) : null}
      <div aria-live="polite" className="visually-hidden">
        {statusMsg}
      </div>
      {statusMsg ? <div className="panel">{statusMsg}</div> : null}

      {payload && entry ? (
        <section
          className="panel export-ready"
          aria-labelledby="export-ready-title"
        >
          <h2 id="export-ready-title">
            {m.readyTitle.replace("{name}", entry.name)}
          </h2>
          <p>
            <strong>{m.readyToImport}</strong> — {m.noInstallClaim}
          </p>
          <p>
            {m.filenameLabel}: <code className="wrap-code">{suggestedName}</code>
          </p>
          <p>{m.readyNext}:</p>
          <ol>
            <li>{m.readyStepOpen.replace("{name}", entry.name)}</li>
            <li>{m.readyStepImport}</li>
            <li>{m.readyStepPrinter}</li>
            <li>{m.readyStepSelect}</li>
            {entry.group === "slicer" ? <li>{m.readyStepMap}</li> : null}
          </ol>
          <div className="home-cta-links">
            {entry.docsPath ? (
              <Link className="button" href={entry.docsPath}>
                {m.viewInstructionsNamed.replace("{name}", entry.name)}
              </Link>
            ) : null}
            <button type="button" className="secondary" onClick={downloadProfile}>
              {m.downloadAgain}
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => {
                setPayload(null);
                setDownloaded(false);
                setStatusMsg("");
              }}
            >
              {m.chooseAnother}
            </button>
          </div>
          {downloaded ? null : (
            <p className="muted">{m.download}</p>
          )}
        </section>
      ) : null}
    </div>
  );
}
