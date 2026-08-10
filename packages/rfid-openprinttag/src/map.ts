import { deriveBrandUuid, deriveMaterialUuid } from "./uuid.js";

export type OpenPrintTagMainFields = {
  material_class: "FFF";
  brand_name: string;
  brand_uuid: string;
  material_name: string;
  material_uuid: string;
  /** Prefer OFD / OpenFilament stable UUID when available. */
  openfilament_variant_uuid?: string;
  ofd_variant_uuid?: string;
  material_type?: string;
  primary_color?: string;
  min_print_temperature?: number | null;
  max_print_temperature?: number | null;
  min_bed_temperature?: number | null;
  max_bed_temperature?: number | null;
  filament_diameter?: number;
  nominal_netto_full_weight?: number | null;
  mime_type: "application/vnd.openprinttag";
  tag_technology: "ISO15693";
  status: "fields_ready_encode_planned";
  notes: string[];
};

/**
 * Map OpenFilament (+ optional OFD) catalog rows to OpenPrintTag main-region fields.
 * Full NDEF/CBOR encode is planned — this produces the semantic payload first.
 */
export function mapCatalogToOpenPrintTagMain(input: {
  brandName: string;
  /** Prefer OFD brand UUID when imported; else derive from brand name. */
  brandUuid?: string | null;
  materialCode: string;
  materialDisplayName: string;
  /** Prefer OFD filament/variant UUID when present. */
  materialUuid?: string | null;
  variantUuid: string;
  colorHex?: string | null;
  nozzleMinC?: number | null;
  nozzleMaxC?: number | null;
  bedMinC?: number | null;
  bedMaxC?: number | null;
  diameterMm?: number | null;
  spoolWeightG?: number | null;
  ofdVariantUuid?: string | null;
}): OpenPrintTagMainFields {
  const brand_uuid = input.brandUuid || deriveBrandUuid(input.brandName);
  const material_uuid =
    input.materialUuid ||
    deriveMaterialUuid(brand_uuid, input.materialDisplayName);

  return {
    material_class: "FFF",
    brand_name: input.brandName.slice(0, 31),
    brand_uuid,
    material_name: input.materialDisplayName.slice(0, 63),
    material_uuid,
    openfilament_variant_uuid: input.variantUuid,
    ofd_variant_uuid: input.ofdVariantUuid ?? undefined,
    material_type: input.materialCode || undefined,
    primary_color: input.colorHex ?? undefined,
    min_print_temperature: input.nozzleMinC ?? null,
    max_print_temperature: input.nozzleMaxC ?? null,
    min_bed_temperature: input.bedMinC ?? null,
    max_bed_temperature: input.bedMaxC ?? null,
    filament_diameter: input.diameterMm ?? 1.75,
    nominal_netto_full_weight: input.spoolWeightG ?? null,
    mime_type: "application/vnd.openprinttag",
    tag_technology: "ISO15693",
    status: "fields_ready_encode_planned",
    notes: [
      "OpenPrintTag uses ISO/IEC 15693 + NDEF + CBOR (not MIFARE Classic / CFS).",
      "Web NFC may apply for NDEF on supported phones; CFS remains a separate adapter.",
      "Full binary encode/write is planned — see docs/OPENPRINTTAG.md.",
      "Spec: https://specs.openprinttag.org/",
      "Catalog: https://openfilamentdatabase.org",
    ],
  };
}
