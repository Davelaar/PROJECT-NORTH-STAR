"use client";

import { useEffect, useState } from "react";
import { SearchableSelect } from "@/app/components/searchable-select";
import { apiGet, apiPost } from "@/lib/api";

export type CatalogSelection = {
  manufacturerUuid: string;
  manufacturerName: string;
  materialCode: string;
  productUuid: string;
  productName: string;
  variantUuid: string;
  variantName: string;
  colorHex: string | null;
};

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

type Labels = {
  manufacturer: string;
  material: string;
  product: string;
  variant: string;
  selectPlaceholder: string;
  searchPlaceholder: string;
  noMatches: string;
  addBrand: string;
  addProduct: string;
  addColour: string;
  creating: string;
  wizardLead: string;
};

type Props = {
  labels: Labels;
  value: Partial<CatalogSelection>;
  onChange: (next: CatalogSelection | Partial<CatalogSelection>) => void;
  disabled?: boolean;
};

function fillName(template: string, name: string) {
  return template.replace("{name}", name);
}

/**
 * Cascading catalog picker: brand → material → product → colour.
 * Uses SearchableSelect + resolve-or-create community endpoints so
 * free-text duplicate brands/colours are hard to introduce by accident.
 */
export function FilamentCatalogPicker({
  labels: L,
  value,
  onChange,
  disabled = false,
}: Props) {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  const manufacturerUuid = value.manufacturerUuid ?? "";
  const materialCode = value.materialCode ?? "";
  const productUuid = value.productUuid ?? "";
  const variantUuid = value.variantUuid ?? "";

  async function reloadManufacturers() {
    const mfr = await apiGet<Manufacturer[]>("/api/v1/manufacturers");
    const sorted = [...mfr].sort((a, b) => a.name.localeCompare(b.name));
    setManufacturers(sorted);
    return sorted;
  }

  useEffect(() => {
    Promise.all([
      apiGet<Manufacturer[]>("/api/v1/manufacturers"),
      apiGet<Material[]>("/api/v1/materials"),
    ])
      .then(([mfr, mats]) => {
        setManufacturers(
          [...mfr].sort((a, b) => a.name.localeCompare(b.name)),
        );
        setMaterials([...mats].sort((a, b) => a.code.localeCompare(b.code)));
      })
      .catch(() => undefined);
  }, []);

  // Rehydrate material + names when editing a spool that already has catalog UUIDs.
  useEffect(() => {
    if (!productUuid || materialCode) return;
    apiGet<Filament>(`/api/v1/filaments/${productUuid}`)
      .then((row) => {
        onChange({
          ...value,
          manufacturerUuid: row.manufacturerUuid || manufacturerUuid,
          materialCode: row.materialCode,
          productUuid: row.uuid,
          productName: row.productName,
        });
      })
      .catch(() => undefined);
    // Intentionally only when product is set without material.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- hydrate once per product
  }, [productUuid, materialCode]);

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
        if (!productUuid && rows.length === 1) {
          emitPartial({
            productUuid: rows[0]!.uuid,
            productName: rows[0]!.productName,
            variantUuid: "",
            variantName: "",
            colorHex: null,
          });
        }
      })
      .catch(() => setFilaments([]));
  }, [manufacturerUuid, materialCode, productUuid]);

  useEffect(() => {
    if (!productUuid) {
      setVariants([]);
      return;
    }
    apiGet<Variant[]>(`/api/v1/filaments/${productUuid}/variants`)
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
          const variant = rows[0]!;
          const mfr = manufacturers.find((x) => x.uuid === manufacturerUuid);
          const product = filaments.find((x) => x.uuid === productUuid);
          if (mfr && product) {
            emitComplete({
              manufacturerUuid,
              manufacturerName: mfr.name,
              materialCode,
              productUuid,
              productName: product.productName,
              variantUuid: variant.uuid,
              variantName: variant.colorName ?? variant.variantName,
              colorHex: variant.primaryColorHex,
            });
          } else {
            emitPartial({
              variantUuid: variant.uuid,
              variantName: variant.colorName ?? variant.variantName,
              colorHex: variant.primaryColorHex,
            });
          }
        }
      })
      .catch(() => setVariants([]));
  }, [productUuid, variantUuid, manufacturers, filaments, manufacturerUuid, materialCode]);

  function emitPartial(patch: Partial<CatalogSelection>) {
    onChange({ ...value, ...patch });
  }

  function emitComplete(sel: CatalogSelection) {
    onChange(sel);
  }

  return (
    <fieldset className="catalog-picker stack" disabled={disabled}>
      <legend className="visually-hidden">{L.wizardLead}</legend>
      <p className="muted">{L.wizardLead}</p>

      <SearchableSelect
        label={L.manufacturer}
        value={manufacturerUuid}
        disabled={disabled}
        onChange={(v) => {
          const mfr = manufacturers.find((x) => x.uuid === v);
          emitPartial({
            manufacturerUuid: v,
            manufacturerName: mfr?.name ?? "",
            productUuid: "",
            productName: "",
            variantUuid: "",
            variantName: "",
            colorHex: null,
          });
        }}
        options={manufacturers.map((x) => ({
          value: x.uuid,
          label: x.name,
        }))}
        placeholder={L.selectPlaceholder}
        searchPlaceholder={L.searchPlaceholder}
        emptyText={L.noMatches}
        allowCreate
        createLabel={(name) => fillName(L.addBrand, name)}
        creatingText={L.creating}
        onCreate={async (name) => {
          const created = await apiPost<{ uuid: string; name: string }>(
            "/api/v1/community/manufacturers",
            { name },
          );
          await reloadManufacturers();
          emitPartial({
            manufacturerUuid: created.uuid,
            manufacturerName: created.name,
            productUuid: "",
            productName: "",
            variantUuid: "",
            variantName: "",
            colorHex: null,
          });
        }}
        required
      />

      <SearchableSelect
        label={L.material}
        value={materialCode}
        disabled={disabled}
        onChange={(v) => {
          const patch: Partial<CatalogSelection> = {
            materialCode: v,
          };
          if (productUuid) {
            const product = filaments.find((row) => row.uuid === productUuid);
            if (product && product.materialCode !== v) {
              patch.productUuid = "";
              patch.productName = "";
              patch.variantUuid = "";
              patch.variantName = "";
              patch.colorHex = null;
            }
          } else {
            patch.productUuid = "";
            patch.productName = "";
            patch.variantUuid = "";
            patch.variantName = "";
            patch.colorHex = null;
          }
          emitPartial(patch);
        }}
        options={materials.map((x) => ({
          value: x.code,
          label: `${x.code} — ${x.name}`,
        }))}
        placeholder={L.selectPlaceholder}
        searchPlaceholder={L.searchPlaceholder}
        emptyText={L.noMatches}
        required
      />

      <SearchableSelect
        label={L.product}
        value={productUuid}
        disabled={disabled || !manufacturerUuid}
        onChange={(v) => {
          const product = filaments.find((x) => x.uuid === v);
          emitPartial({
            productUuid: v,
            productName: product?.productName ?? "",
            materialCode: product?.materialCode ?? materialCode,
            variantUuid: "",
            variantName: "",
            colorHex: null,
          });
        }}
        options={filaments.map((x) => ({
          value: x.uuid,
          label: materialCode
            ? x.productName
            : `${x.productName} (${x.materialCode})`,
        }))}
        placeholder={L.selectPlaceholder}
        searchPlaceholder={L.searchPlaceholder}
        emptyText={L.noMatches}
        allowCreate={Boolean(manufacturerUuid && materialCode)}
        createLabel={(name) => fillName(L.addProduct, name)}
        creatingText={L.creating}
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
          emitPartial({
            productUuid: created.uuid,
            productName: created.productName,
            variantUuid: "",
            variantName: "",
            colorHex: null,
          });
        }}
        required
      />

      <SearchableSelect
        label={L.variant}
        value={variantUuid}
        disabled={disabled || !productUuid}
        onChange={(v) => {
          const variant = variants.find((x) => x.uuid === v);
          const mfr = manufacturers.find((x) => x.uuid === manufacturerUuid);
          const product = filaments.find((x) => x.uuid === productUuid);
          if (!variant || !mfr || !product) {
            emitPartial({
              variantUuid: v,
              variantName: "",
              colorHex: null,
            });
            return;
          }
          emitComplete({
            manufacturerUuid,
            manufacturerName: mfr.name,
            materialCode,
            productUuid,
            productName: product.productName,
            variantUuid: variant.uuid,
            variantName: variant.colorName ?? variant.variantName,
            colorHex: variant.primaryColorHex,
          });
        }}
        options={variants.map((x) => ({
          value: x.uuid,
          label: x.colorName ?? x.variantName,
        }))}
        placeholder={L.selectPlaceholder}
        searchPlaceholder={L.searchPlaceholder}
        emptyText={L.noMatches}
        allowCreate={Boolean(productUuid)}
        createLabel={(name) => fillName(L.addColour, name)}
        creatingText={L.creating}
        onCreate={async (name) => {
          const created = await apiPost<{
            uuid: string;
            variantName: string;
            colorName?: string | null;
            primaryColorHex?: string | null;
          }>("/api/v1/community/variants", {
            filamentProductUuid: productUuid,
            variantName: name,
            colorName: name,
          });
          const rows = await apiGet<Variant[]>(
            `/api/v1/filaments/${productUuid}/variants`,
          );
          setVariants(
            [...rows].sort((a, b) =>
              (a.colorName ?? a.variantName).localeCompare(
                b.colorName ?? b.variantName,
              ),
            ),
          );
          const mfr = manufacturers.find((x) => x.uuid === manufacturerUuid);
          const product = filaments.find((x) => x.uuid === productUuid);
          const row =
            rows.find((x) => x.uuid === created.uuid) ??
            ({
              uuid: created.uuid,
              variantName: created.variantName,
              colorName: created.colorName ?? name,
              primaryColorHex: created.primaryColorHex ?? null,
            } satisfies Variant);
          if (mfr && product) {
            emitComplete({
              manufacturerUuid,
              manufacturerName: mfr.name,
              materialCode,
              productUuid,
              productName: product.productName,
              variantUuid: row.uuid,
              variantName: row.colorName ?? row.variantName,
              colorHex: row.primaryColorHex,
            });
          } else {
            emitPartial({
              variantUuid: row.uuid,
              variantName: row.colorName ?? row.variantName,
              colorHex: row.primaryColorHex,
            });
          }
        }}
        required
      />
    </fieldset>
  );
}
