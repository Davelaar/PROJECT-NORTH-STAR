import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { withAmazonAffiliateTag, normalizeNameKey } from "@open-filament/domain";
import { createDb, resolveDbPath, type AppDb } from "./client.js";
import { ensureMigrated } from "./migrate.js";
import * as schema from "./schema.js";
import { rebuildSearchIndex } from "./search.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type OfdBrand = {
  uuid: string;
  id: string;
  name: string;
  website?: string | null;
  origin?: string | null;
  slug: string;
};

type OfdMaterial = {
  uuid: string;
  id: string;
  material: string;
  brand_id: string;
  slug: string;
  default_max_dry_temperature?: number | null;
  default_slicer_settings?: Record<string, unknown> | null;
};

type OfdFilament = {
  uuid: string;
  id: string;
  name: string;
  slug: string;
  material: string;
  material_id?: string;
  brand_id: string;
  density?: number | null;
  diameter_tolerance?: number | null;
  min_print_temperature?: number | null;
  max_print_temperature?: number | null;
  min_bed_temperature?: number | null;
  max_bed_temperature?: number | null;
  chamber_temperature?: number | null;
  min_chamber_temperature?: number | null;
  max_chamber_temperature?: number | null;
  max_dry_temperature?: number | null;
  min_nozzle_diameter?: number | null;
  preheat_temperature?: number | null;
  shore_hardness_a?: number | null;
  shore_hardness_d?: number | null;
  data_sheet_url?: string | null;
  safety_sheet_url?: string | null;
  slicer_settings?: Record<string, unknown> | null;
  discontinued?: boolean;
};

type OfdVariant = {
  uuid: string;
  id: string;
  name: string;
  slug: string;
  color_hex?: string | null;
  filament_id: string;
  discontinued?: boolean;
  traits?: Record<string, unknown> | null;
};

type OfdSize = {
  uuid: string;
  id: string;
  variant_id: string;
  diameter?: number | null;
  filament_weight?: number | null;
  empty_spool_weight?: number | null;
  article_number?: string | null;
  gtin?: string | number | null;
  discontinued?: boolean;
};

type OfdStore = {
  uuid: string;
  id: string;
  name: string;
  slug: string;
  storefront_url?: string | null;
};

type OfdPurchaseLink = {
  id: string;
  store_id: string;
  size_id: string;
  url: string;
  spool_refill?: boolean;
};

type OfdDataset = {
  version?: string;
  generated_at?: string;
  brands: OfdBrand[];
  materials?: OfdMaterial[];
  filaments: OfdFilament[];
  variants: OfdVariant[];
  sizes?: OfdSize[];
  stores?: OfdStore[];
  purchase_links?: OfdPurchaseLink[];
};

function defaultDatasetPath(): string {
  if (process.env.OFD_DATASET_PATH) return process.env.OFD_DATASET_PATH;
  return path.resolve(__dirname, "../../../data/external/ofd-all.json");
}

function materialCodeFromName(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 32);
}

function materialCategory(code: string): string {
  if (code.startsWith("PLA") || code === "PETG" || code === "PET") return "commodity";
  if (code === "TPU" || code === "TPE" || code === "TPC" || code === "PEBA") {
    return "flexible";
  }
  if (code.includes("CF") || code.includes("GF")) return "composite";
  if (
    ["ABS", "ASA", "PC", "PA", "PA6", "PA11", "PA12", "PPA", "PPS", "PEEK", "PEI"].some(
      (p) => code === p || code.startsWith(p),
    )
  ) {
    return "engineering";
  }
  return "other";
}

function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "item"
  );
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function traitTrue(traits: Record<string, unknown>, ...keys: string[]): boolean {
  return keys.some((k) => Boolean(traits[k]));
}

/** Prefer most common diameter among OFD sizes for a filament's variants. */
function diameterByFilamentId(
  sizes: OfdSize[],
  variants: OfdVariant[],
): Map<string, number> {
  const filamentByVariant = new Map(
    variants.map((v) => [v.id, v.filament_id] as const),
  );
  const counts = new Map<string, Map<number, number>>();
  for (const size of sizes) {
    const filamentId = filamentByVariant.get(size.variant_id);
    if (!filamentId || size.diameter == null) continue;
    const d = size.diameter;
    const m = counts.get(filamentId) ?? new Map();
    m.set(d, (m.get(d) ?? 0) + 1);
    counts.set(filamentId, m);
  }
  const out = new Map<string, number>();
  for (const [fid, m] of counts) {
    let best = 1.75;
    let bestN = -1;
    for (const [d, n] of m) {
      if (n > bestN) {
        best = d;
        bestN = n;
      }
    }
    out.set(fid, best);
  }
  return out;
}

function spoolWeightByVariantId(sizes: OfdSize[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const size of sizes) {
    if (size.filament_weight == null) continue;
    if (!out.has(size.variant_id)) out.set(size.variant_id, size.filament_weight);
  }
  return out;
}

function articleByVariantId(sizes: OfdSize[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const size of sizes) {
    if (!size.article_number) continue;
    if (!out.has(size.variant_id)) out.set(size.variant_id, size.article_number);
  }
  return out;
}

function gtinByVariantId(sizes: OfdSize[]): Map<string, string> {
  const out = new Map<string, string>();
  for (const size of sizes) {
    if (size.gtin == null || size.gtin === "") continue;
    const g = String(size.gtin).replace(/\D/g, "");
    if (!g) continue;
    if (!out.has(size.variant_id)) out.set(size.variant_id, g);
  }
  return out;
}

export type CatalogPurchaseLink = {
  storeName: string;
  storeSlug?: string;
  url: string;
};

function purchaseLinksByVariantId(
  sizes: OfdSize[],
  stores: OfdStore[],
  links: OfdPurchaseLink[],
): Map<string, CatalogPurchaseLink[]> {
  const storeById = new Map(stores.map((s) => [s.id, s] as const));
  const sizeById = new Map(sizes.map((s) => [s.id, s] as const));
  const out = new Map<string, CatalogPurchaseLink[]>();
  const seen = new Map<string, Set<string>>();

  for (const link of links) {
    const size = sizeById.get(link.size_id);
    const store = storeById.get(link.store_id);
    if (!size || !store || !link.url) continue;
    const variantId = size.variant_id;
    const keySet = seen.get(variantId) ?? new Set();
    if (keySet.has(link.url)) continue;
    keySet.add(link.url);
    seen.set(variantId, keySet);
    const list = out.get(variantId) ?? [];
    list.push({
      storeName: store.name,
      storeSlug: store.slug,
      url: withAmazonAffiliateTag(link.url),
    });
    out.set(variantId, list);
  }
  return out;
}

function identifiersFromGtin(gtin: string | null): {
  gtin: string | null;
  ean: string | null;
  upc: string | null;
} {
  if (!gtin) return { gtin: null, ean: null, upc: null };
  const digits = gtin.replace(/\D/g, "");
  return {
    gtin: digits || null,
    ean: digits.length === 13 ? digits : digits.length === 8 ? digits : null,
    upc: digits.length === 12 ? digits : null,
  };
}

function extractHintTemps(
  hints: Record<string, unknown> | null | undefined,
): { nozzle?: number; bed?: number; firstNozzle?: number; firstBed?: number } {
  if (!hints) return {};
  for (const key of ["orcaslicer", "generic", "prusaslicer", "bambustudio", "creality"]) {
    const block = hints[key];
    if (!block || typeof block !== "object") continue;
    const o = block as Record<string, unknown>;
    const nozzle = num(o.nozzle_temp);
    const bed = num(o.bed_temp);
    const firstNozzle = num(o.first_layer_nozzle_temp);
    const firstBed = num(o.first_layer_bed_temp);
    return {
      ...(nozzle != null ? { nozzle } : {}),
      ...(bed != null ? { bed } : {}),
      ...(firstNozzle != null ? { firstNozzle } : {}),
      ...(firstBed != null ? { firstBed } : {}),
    };
  }
  return {};
}

/** Import OpenFilamentCollective open-filament-database (MIT). */
export async function importOfdCatalog(
  dbPath?: string,
  datasetPath = defaultDatasetPath(),
): Promise<{
  brands: number;
  materials: number;
  products: number;
  variants: number;
  version: string | null;
}> {
  ensureMigrated(dbPath);
  if (!fs.existsSync(datasetPath)) {
    throw new Error(
      `OFD dataset not found at ${datasetPath}. Run: ./scripts/fetch-ofd-catalog.sh`,
    );
  }

  const raw = JSON.parse(fs.readFileSync(datasetPath, "utf8")) as OfdDataset;
  const db = createDb(dbPath);
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  const materialsById = new Map(
    (raw.materials ?? []).map((m) => [m.id, m] as const),
  );
  const diameterByFilament = diameterByFilamentId(
    raw.sizes ?? [],
    raw.variants,
  );
  const spoolByVariant = spoolWeightByVariantId(raw.sizes ?? []);
  const articleByVariant = articleByVariantId(raw.sizes ?? []);
  const gtinByVariant = gtinByVariantId(raw.sizes ?? []);
  const buysByVariant = purchaseLinksByVariantId(
    raw.sizes ?? [],
    raw.stores ?? [],
    raw.purchase_links ?? [],
  );

  console.log(
    `Importing OFD ${raw.version ?? "unknown"} (${raw.brands.length} brands, ${raw.filaments.length} filaments, ${raw.variants.length} variants)…`,
  );

  const brandByOfdId = new Map<string, number>();
  const materialByCode = new Map<string, number>();
  const productByOfdId = new Map<string, number>();
  const manufacturerSlugs = new Set<string>();
  const productSlugs = new Map<number, Set<string>>();
  const variantSlugs = new Map<number, Set<string>>();

  for (const row of db.select().from(schema.materialFamilies).all()) {
    materialByCode.set(row.code, row.id);
  }
  for (const row of db.select().from(schema.manufacturers).all()) {
    manufacturerSlugs.add(row.slug);
  }
  for (const row of db.select().from(schema.filamentProducts).all()) {
    const set = productSlugs.get(row.manufacturerId) ?? new Set();
    set.add(row.slug);
    productSlugs.set(row.manufacturerId, set);
  }
  for (const row of db.select().from(schema.filamentVariants).all()) {
    const set = variantSlugs.get(row.filamentProductId) ?? new Set();
    set.add(row.slug);
    variantSlugs.set(row.filamentProductId, set);
  }

  const existingBrandUuid = new Map(
    db.select().from(schema.manufacturers).all().map((r) => [r.uuid, r] as const),
  );
  const existingProductUuid = new Map(
    db.select().from(schema.filamentProducts).all().map((r) => [r.uuid, r] as const),
  );
  const existingVariantUuid = new Map(
    db.select().from(schema.filamentVariants).all().map((r) => [r.uuid, r] as const),
  );

  let materialsCreated = 0;
  for (const code of new Set(
    raw.filaments.map((f) => materialCodeFromName(f.material || "UNKNOWN")),
  )) {
    if (materialByCode.has(code)) continue;
    const [row] = db
      .insert(schema.materialFamilies)
      .values({
        uuid: randomUUID(),
        code,
        name: code.replace(/_/g, " "),
        category: materialCategory(code),
      })
      .returning()
      .all();
    materialByCode.set(code, row!.id);
    materialsCreated += 1;
  }

  let brandsUpserted = 0;
  // Also index existing brands by normalized name for seed/OFD merges
  const existingByNormalizedName = new Map<
    string,
    (typeof schema.manufacturers.$inferSelect)
  >();
  for (const row of db.select().from(schema.manufacturers).all()) {
    existingByNormalizedName.set(normalizeNameKey(row.name), row);
  }

  for (const brand of raw.brands) {
    const existing =
      existingBrandUuid.get(brand.uuid) ??
      existingByNormalizedName.get(normalizeNameKey(brand.name));
    if (existing) {
      db.update(schema.manufacturers)
        .set({
          // Keep nicer casing if OFD has mixed case; avoid ALLCAPS stomping
          name:
            brand.name === brand.name.toUpperCase() &&
            existing.name !== existing.name.toUpperCase()
              ? existing.name
              : brand.name,
          website: brand.website ?? existing.website,
          country: brand.origin ?? existing.country,
          updatedAt: now,
        })
        .where(eq(schema.manufacturers.id, existing.id))
        .run();
      brandByOfdId.set(brand.id, existing.id);
      existingBrandUuid.set(brand.uuid, existing);
      existingByNormalizedName.set(normalizeNameKey(brand.name), existing);
    } else {
      let slug = brand.slug || slugify(brand.name);
      if (manufacturerSlugs.has(slug)) slug = `${slug}-${brand.uuid.slice(0, 8)}`;
      manufacturerSlugs.add(slug);
      const [row] = db
        .insert(schema.manufacturers)
        .values({
          uuid: brand.uuid,
          name: brand.name,
          slug,
          website: brand.website ?? null,
          country: brand.origin ?? null,
          description: `Imported from Open Filament Database (${raw.version ?? "ofd"})`,
          verified: false,
          isSyntheticFixture: false,
        })
        .returning()
        .all();
      brandByOfdId.set(brand.id, row!.id);
      productSlugs.set(row!.id, new Set());
      existingBrandUuid.set(brand.uuid, row!);
      existingByNormalizedName.set(normalizeNameKey(brand.name), row!);
    }
    brandsUpserted += 1;
  }

  let productsUpserted = 0;
  for (const filament of raw.filaments) {
    const manufacturerId = brandByOfdId.get(filament.brand_id);
    if (manufacturerId == null) continue;
    const matCode = materialCodeFromName(filament.material || "UNKNOWN");
    const materialFamilyId = materialByCode.get(matCode);
    if (materialFamilyId == null) continue;

    const existing = existingProductUuid.get(filament.uuid);
    const material = filament.material_id
      ? materialsById.get(filament.material_id)
      : undefined;
    const materialHints = material?.default_slicer_settings ?? null;
    const filamentHints = filament.slicer_settings ?? null;
    const hintTemps = {
      ...extractHintTemps(materialHints),
      ...extractHintTemps(filamentHints),
    };

    const nozzleMin =
      filament.min_print_temperature ?? hintTemps.nozzle ?? hintTemps.firstNozzle ?? null;
    const nozzleMax =
      filament.max_print_temperature ?? hintTemps.nozzle ?? hintTemps.firstNozzle ?? null;
    const bedMin =
      filament.min_bed_temperature ?? hintTemps.bed ?? hintTemps.firstBed ?? null;
    const bedMax =
      filament.max_bed_temperature ?? hintTemps.bed ?? hintTemps.firstBed ?? null;

    const chamber =
      filament.chamber_temperature ??
      filament.min_chamber_temperature ??
      filament.max_chamber_temperature ??
      null;

    const slicerHints = {
      filament: filamentHints,
      materialDefaults: materialHints,
    };

    const base = {
      manufacturerId,
      materialFamilyId,
      productName: filament.name,
      productLine: filament.material,
      description: filament.discontinued
        ? "Marked discontinued in Open Filament Database"
        : null,
      diameterMm: diameterByFilament.get(filament.id) ?? 1.75,
      diameterToleranceMm: filament.diameter_tolerance ?? null,
      minNozzleDiameterMm: filament.min_nozzle_diameter ?? null,
      densityGCm3: filament.density ?? null,
      datasheetUrl: filament.data_sheet_url ?? null,
      safetySheetUrl: filament.safety_sheet_url ?? null,
      mfrNozzleTempMinC: nozzleMin,
      mfrNozzleTempMaxC: nozzleMax,
      mfrBedTempMinC: bedMin,
      mfrBedTempMaxC: bedMax,
      mfrChamberTempC: chamber,
      mfrChamberTempMinC: filament.min_chamber_temperature ?? null,
      mfrChamberTempMaxC: filament.max_chamber_temperature ?? null,
      mfrPreheatTempC: filament.preheat_temperature ?? null,
      dryingTempC:
        filament.max_dry_temperature ??
        material?.default_max_dry_temperature ??
        null,
      shoreHardnessA: filament.shore_hardness_a ?? null,
      shoreHardnessD: filament.shore_hardness_d ?? null,
      catalogSlicerHintsJson: JSON.stringify(slicerHints),
      sourceType: "open_filament_database",
      sourceReference: `ofd:${raw.version ?? "unknown"}:${filament.id}`,
      verified: false,
      isSyntheticFixture: false,
      updatedAt: now,
    };

    if (existing) {
      db.update(schema.filamentProducts)
        .set(base)
        .where(eq(schema.filamentProducts.id, existing.id))
        .run();
      productByOfdId.set(filament.id, existing.id);
    } else {
      const slugSet = productSlugs.get(manufacturerId) ?? new Set();
      let slug = filament.slug || slugify(filament.name);
      if (slugSet.has(slug)) slug = `${slug}-${filament.uuid.slice(0, 8)}`;
      slugSet.add(slug);
      productSlugs.set(manufacturerId, slugSet);
      const [row] = db
        .insert(schema.filamentProducts)
        .values({
          uuid: filament.uuid,
          slug,
          ...base,
        })
        .returning()
        .all();
      productByOfdId.set(filament.id, row!.id);
      variantSlugs.set(row!.id, new Set());
      existingProductUuid.set(filament.uuid, row!);
    }
    productsUpserted += 1;
  }

  let variantsUpserted = 0;
  for (const variant of raw.variants) {
    const productId = productByOfdId.get(variant.filament_id);
    if (productId == null) continue;
    const traits = variant.traits ?? {};
    const existing = existingVariantUuid.get(variant.uuid);
    const carbon = traitTrue(
      traits,
      "contains_carbon_fiber",
      "contains_carbon",
      "contains_carbon_nano_tubes",
      "carbon_fiber",
      "cf",
    );
    const glass = traitTrue(traits, "contains_glass_fiber", "glass_fiber", "gf");
    const wood = traitTrue(traits, "contains_wood", "contains_pine", "contains_cork", "wood");
    const metal = traitTrue(
      traits,
      "contains_metal",
      "contains_aluminium",
      "contains_aluminum",
      "contains_bronze",
      "contains_copper",
      "contains_iron",
      "contains_steel",
      "contains_magnetite",
      "metal",
    );

    const ids = identifiersFromGtin(gtinByVariant.get(variant.id) ?? null);
    const buys = buysByVariant.get(variant.id) ?? [];

    const base = {
      filamentProductId: productId,
      variantName: variant.name,
      colorName: variant.name,
      primaryColorHex: variant.color_hex ?? null,
      finish: typeof traits.finish === "string" ? traits.finish : null,
      translucency: traitTrue(traits, "translucent", "transparent")
        ? "translucent"
        : null,
      silk: traitTrue(traits, "silk"),
      matte: traitTrue(traits, "matte"),
      glitter: traitTrue(traits, "glitter", "sparkle", "pearlescent", "iridescent"),
      glowInDark: traitTrue(traits, "glow", "glow_in_the_dark", "illuminescent_color_change"),
      carbonFilled: carbon,
      glassFilled: glass,
      woodFilled: wood,
      metalFilled: metal,
      appearanceKind: traits.gradual_color_change
        ? "gradient"
        : traits.dual_color || traits.coextruded
          ? "dual"
          : "solid",
      manufacturerSku: articleByVariant.get(variant.id) ?? null,
      gtin: ids.gtin,
      ean: ids.ean,
      upc: ids.upc,
      purchaseLinksJson: buys.length > 0 ? JSON.stringify(buys.slice(0, 12)) : null,
      spoolWeightG: spoolByVariant.get(variant.id) ?? null,
      discontinued: Boolean(variant.discontinued),
      notes: variant.discontinued
        ? "Marked discontinued in Open Filament Database"
        : `Imported from Open Filament Database (${raw.version ?? "ofd"})`,
      verified: false,
      isSyntheticFixture: false,
      updatedAt: now,
    };

    // Propagate abrasive trait onto product when present
    if (traitTrue(traits, "abrasive", "contains_carbon_fiber", "contains_glass_fiber")) {
      db.update(schema.filamentProducts)
        .set({ abrasive: true, updatedAt: now })
        .where(eq(schema.filamentProducts.id, productId))
        .run();
    }

    if (existing) {
      db.update(schema.filamentVariants)
        .set(base)
        .where(eq(schema.filamentVariants.id, existing.id))
        .run();
    } else {
      const slugSet = variantSlugs.get(productId) ?? new Set();
      let slug = variant.slug || slugify(variant.name);
      if (slugSet.has(slug)) slug = `${slug}-${variant.uuid.slice(0, 8)}`;
      slugSet.add(slug);
      variantSlugs.set(productId, slugSet);
      const [row] = db
        .insert(schema.filamentVariants)
        .values({
          uuid: variant.uuid,
          slug,
          ...base,
        })
        .returning()
        .all();
      existingVariantUuid.set(variant.uuid, row!);
    }
    variantsUpserted += 1;
    if (variantsUpserted % 2000 === 0) {
      console.log(`  … ${variantsUpserted} variants`);
    }
  }

  rebuildSearchIndex(db);
  ensureOpenPrintTagScheme(db);

  const summary = {
    brands: brandsUpserted,
    materials: materialsCreated,
    products: productsUpserted,
    variants: variantsUpserted,
    version: raw.version ?? null,
  };
  console.log(
    `OFD import complete: ${summary.brands} brands, ${summary.materials} new materials, ${summary.products} products, ${summary.variants} variants → ${resolveDbPath(dbPath)}`,
  );
  return summary;
}

const OPENPRINTTAG_SCHEME_UUID = "88888888-8888-4888-8888-888888888802";

function ensureOpenPrintTagScheme(db: AppDb) {
  const existing = db
    .select()
    .from(schema.rfidSchemes)
    .where(eq(schema.rfidSchemes.uuid, OPENPRINTTAG_SCHEME_UUID))
    .get();
  if (existing) {
    db.update(schema.rfidSchemes)
      .set({
        encodingVersion: "ndef-cbor-v1",
        notes:
          "OpenPrintTag (ISO 15693 + NDEF application/vnd.openprinttag + CBOR). UUID/field mapping and NDEF/CBOR encode ship in software; physical writes depend on browser and tag support. Spec: https://specs.openprinttag.org/ Catalog: https://openfilamentdatabase.org — see docs/OPENPRINTTAG.md. Not CFS.",
      })
      .where(eq(schema.rfidSchemes.uuid, OPENPRINTTAG_SCHEME_UUID))
      .run();
    return;
  }
  db.insert(schema.rfidSchemes)
    .values({
      uuid: OPENPRINTTAG_SCHEME_UUID,
      name: "OpenPrintTag",
      vendor: "OpenPrintTag",
      version: "fields-0",
      tagTechnology: "ISO15693",
      tagCapacityBytes: null,
      requiresAuthentication: false,
      encodingVersion: "ndef-cbor-v1",
      status: "active",
      notes:
        "OpenPrintTag (ISO 15693 + NDEF application/vnd.openprinttag + CBOR). UUID/field mapping and NDEF/CBOR encode ship in software; physical writes depend on browser and tag support. Spec: https://specs.openprinttag.org/ Catalog: https://openfilamentdatabase.org — see docs/OPENPRINTTAG.md. Not CFS.",
    })
    .run();
}

const isDirect =
  process.argv[1]?.endsWith("import-ofd.ts") ||
  process.argv[1]?.endsWith("import-ofd.js");
if (isDirect) {
  importOfdCatalog().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
