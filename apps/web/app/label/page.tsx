"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { useMessages } from "@/app/components/messages-provider";
import { SearchableSelect } from "@/app/components/searchable-select";

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

export default function LabelIndexPage() {
  const router = useRouter();
  const messages = useMessages();
  const m = messages.label;
  const f = messages.fields;
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [manufacturerUuid, setManufacturerUuid] = useState("");
  const [materialCode, setMaterialCode] = useState("");
  const [filamentUuid, setFilamentUuid] = useState("");
  const [variantUuid, setVariantUuid] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      apiGet<Manufacturer[]>("/api/v1/manufacturers"),
      apiGet<Material[]>("/api/v1/materials"),
    ])
      .then(([mfr, mats]) => {
        setManufacturers([...mfr].sort((a, b) => a.name.localeCompare(b.name)));
        setMaterials([...mats].sort((a, b) => a.code.localeCompare(b.code)));
      })
      .catch((e) => setError(String(e)));
  }, []);

  useEffect(() => {
    if (!manufacturerUuid || !materialCode) {
      setFilaments([]);
      setFilamentUuid("");
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
    setFilamentUuid("");
    setVariantUuid("");
  }, [manufacturerUuid, materialCode]);

  useEffect(() => {
    if (!filamentUuid) {
      setVariants([]);
      setVariantUuid("");
      return;
    }
    apiGet<Variant[]>(`/api/v1/filaments/${filamentUuid}/variants`)
      .then((rows) =>
        setVariants(
          [...rows].sort((a, b) => a.variantName.localeCompare(b.variantName)),
        ),
      )
      .catch(() => setVariants([]));
    setVariantUuid("");
  }, [filamentUuid]);

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
    () => filaments.map((x) => ({ value: x.uuid, label: x.productName })),
    [filaments],
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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!variantUuid) {
      setError(m.needVariant);
      return;
    }
    router.push(`/label/${variantUuid}`);
  }

  return (
    <div className="stack">
      <h1>{m.heading}</h1>
      <p className="muted">
        {m.lead}{" "}
        <Link href="/search">{messages.nav.search}</Link>
        {" · "}
        <Link href="/scan">{messages.nav.scan}</Link>
      </p>
      <form className="stack panel" onSubmit={onSubmit}>
        <SearchableSelect
          label={f.manufacturer}
          value={manufacturerUuid}
          onChange={setManufacturerUuid}
          options={manufacturerOptions}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
        />
        <SearchableSelect
          label={f.material}
          value={materialCode}
          onChange={setMaterialCode}
          options={materialOptions}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
          disabled={!manufacturerUuid}
        />
        <SearchableSelect
          label={f.product}
          value={filamentUuid}
          onChange={setFilamentUuid}
          options={filamentOptions}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
          disabled={!materialCode}
        />
        <SearchableSelect
          label={f.variant}
          value={variantUuid}
          onChange={setVariantUuid}
          options={variantOptions}
          placeholder={f.selectPlaceholder}
          searchPlaceholder={f.searchPlaceholder}
          emptyText={f.noMatches}
          disabled={!filamentUuid}
        />
        <button type="submit" disabled={!variantUuid}>
          {m.generate}
        </button>
      </form>
      {error ? <div className="banner-warn">{error}</div> : null}
    </div>
  );
}
