import { and, eq, ne } from "drizzle-orm";
import { compareCatalogLabels } from "@open-filament/domain";
import type { AppDb } from "./client.js";
import * as schema from "./schema.js";

export type Provenance =
  | "measured"
  | "catalog"
  | "starter"
  | "demo"
  | "test"
  | "community";

export function provenanceForProduct(row: {
  isSyntheticFixture: boolean;
  sourceType: string | null;
}): Provenance {
  if (row.isSyntheticFixture || row.sourceType === "synthetic_fixture") {
    return "demo";
  }
  if (row.sourceType === "open_filament_database") return "catalog";
  if (row.sourceType === "community") return "community";
  return "catalog";
}

export function provenanceForProfile(row: {
  isSyntheticFixture: boolean;
  title: string;
  notes?: string | null;
}): Provenance {
  const title = row.title.toUpperCase();
  const notes = (row.notes ?? "").toLowerCase();
  if (row.isSyntheticFixture || title.startsWith("TEST ")) return "test";
  if (notes.includes("ofd-starter") || title.includes("STARTER")) return "starter";
  if (notes.includes("community submission")) return "community";
  return "measured";
}

export function isPlaceholderIdentifier(value: string | null | undefined): boolean {
  if (!value) return true;
  const v = value.trim();
  if (!v) return true;
  if (/^0+$/.test(v)) return true;
  if (/^0{8,}$/.test(v.replace(/\D/g, ""))) return true;
  return false;
}

const publicProductWhere = and(
  eq(schema.filamentProducts.isSyntheticFixture, false),
  ne(schema.filamentProducts.sourceType, "synthetic_fixture"),
);

export type CatalogPreviewItem = {
  uuid: string;
  manufacturerName: string;
  productName: string;
  materialCode: string;
  provenance: Provenance;
  variantCount: number;
};

export type CatalogPreviewSection = {
  id: string;
  items: CatalogPreviewItem[];
};

/** Bounded homepage preview — never returns the full catalog. */
export function getCatalogPreview(
  db: AppDb,
  opts?: { limit?: number },
): { sections: CatalogPreviewSection[]; totalLimit: number } {
  const limit = Math.min(Math.max(opts?.limit ?? 12, 1), 12);

  const products = db
    .select({
      uuid: schema.filamentProducts.uuid,
      productName: schema.filamentProducts.productName,
      manufacturerName: schema.manufacturers.name,
      materialCode: schema.materialFamilies.code,
      isSyntheticFixture: schema.filamentProducts.isSyntheticFixture,
      sourceType: schema.filamentProducts.sourceType,
      createdAt: schema.filamentProducts.createdAt,
    })
    .from(schema.filamentProducts)
    .innerJoin(
      schema.manufacturers,
      eq(schema.filamentProducts.manufacturerId, schema.manufacturers.id),
    )
    .innerJoin(
      schema.materialFamilies,
      eq(schema.filamentProducts.materialFamilyId, schema.materialFamilies.id),
    )
    .where(publicProductWhere)
    .all();

  const variantCounts = new Map<string, number>();
  const variants = db
    .select({
      productUuid: schema.filamentProducts.uuid,
      variantId: schema.filamentVariants.id,
    })
    .from(schema.filamentVariants)
    .innerJoin(
      schema.filamentProducts,
      eq(schema.filamentVariants.filamentProductId, schema.filamentProducts.id),
    )
    .where(publicProductWhere)
    .all();
  for (const v of variants) {
    variantCounts.set(v.productUuid, (variantCounts.get(v.productUuid) ?? 0) + 1);
  }

  const toItem = (p: (typeof products)[number]): CatalogPreviewItem => ({
    uuid: p.uuid,
    manufacturerName: p.manufacturerName,
    productName: p.productName,
    materialCode: p.materialCode,
    provenance: provenanceForProduct(p),
    variantCount: variantCounts.get(p.uuid) ?? 0,
  });

  // Featured materials: PLA / PETG / ABS first products alphabetically
  const featuredMaterials = ["PLA", "PETG", "ABS"];
  const featured: CatalogPreviewItem[] = [];
  for (const code of featuredMaterials) {
    const pool = products
      .filter((p) => p.materialCode.toUpperCase() === code)
      .sort((a, b) =>
        compareCatalogLabels(
          a.manufacturerName,
          a.productName,
          b.manufacturerName,
          b.productName,
        ),
      );
    if (pool[0]) featured.push(toItem(pool[0]));
  }

  // Recently added: by createdAt desc
  const recent = [...products]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, Math.max(0, limit - featured.length))
    .map(toItem);

  // Most complete: products with the most variants (deterministic stand-in until download popularity exists)
  const mostComplete = [...products]
    .sort(
      (a, b) =>
        (variantCounts.get(b.uuid) ?? 0) - (variantCounts.get(a.uuid) ?? 0) ||
        compareCatalogLabels(
          a.manufacturerName,
          a.productName,
          b.manufacturerName,
          b.productName,
        ),
    )
    .map(toItem);

  // Deduplicate by uuid while preserving order
  const seen = new Set<string>();
  const featuredSection: CatalogPreviewItem[] = [];
  for (const item of featured) {
    if (seen.has(item.uuid)) continue;
    seen.add(item.uuid);
    featuredSection.push(item);
  }
  const recentSection: CatalogPreviewItem[] = [];
  for (const item of recent) {
    if (seen.has(item.uuid)) continue;
    if (featuredSection.length + recentSection.length >= Math.ceil(limit * 0.7)) break;
    seen.add(item.uuid);
    recentSection.push(item);
  }
  const completeSection: CatalogPreviewItem[] = [];
  for (const item of mostComplete) {
    if (seen.has(item.uuid)) continue;
    if (
      featuredSection.length + recentSection.length + completeSection.length >=
      limit
    ) {
      break;
    }
    seen.add(item.uuid);
    completeSection.push(item);
  }

  const sections: CatalogPreviewSection[] = [];
  if (featuredSection.length) {
    sections.push({ id: "featuredMaterials", items: featuredSection });
  }
  if (recentSection.length) {
    sections.push({ id: "recentlyAdded", items: recentSection });
  }
  if (completeSection.length) {
    sections.push({ id: "mostComplete", items: completeSection });
  }

  return { sections, totalLimit: limit };
}

export type CatalogSearchProduct = {
  entityType: "filament_product";
  uuid: string;
  manufacturerName: string;
  productName: string;
  materialCode: string;
  provenance: Provenance;
  variantCount: number;
  profileCount: number;
  measuredProfileCount: number;
  nozzleTempMinC: number | null;
  nozzleTempMaxC: number | null;
  bedTempMinC: number | null;
  bedTempMaxC: number | null;
  sampleVariants: Array<{
    uuid: string;
    name: string;
    hex: string | null;
  }>;
};

export type CatalogSearchResult = {
  query: string;
  page: number;
  pageSize: number;
  total: number;
  results: CatalogSearchProduct[];
};

function normalizeQuery(q: string): string {
  return q
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Paginated product-centric catalog search with fixture exclusion + name dedupe. */
export function searchCatalogProducts(
  db: AppDb,
  opts: {
    q?: string;
    brand?: string;
    material?: string;
    page?: number;
    pageSize?: number;
  },
): CatalogSearchResult {
  const page = Math.max(1, opts.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, opts.pageSize ?? 24));
  const q = normalizeQuery(opts.q ?? "");
  const brandFilter = (opts.brand ?? "").trim().toLowerCase();
  const materialFilter = (opts.material ?? "").trim().toUpperCase();

  const products = db
    .select({
      id: schema.filamentProducts.id,
      uuid: schema.filamentProducts.uuid,
      productName: schema.filamentProducts.productName,
      manufacturerName: schema.manufacturers.name,
      materialCode: schema.materialFamilies.code,
      isSyntheticFixture: schema.filamentProducts.isSyntheticFixture,
      sourceType: schema.filamentProducts.sourceType,
      nozzleTempMinC: schema.filamentProducts.mfrNozzleTempMinC,
      nozzleTempMaxC: schema.filamentProducts.mfrNozzleTempMaxC,
      bedTempMinC: schema.filamentProducts.mfrBedTempMinC,
      bedTempMaxC: schema.filamentProducts.mfrBedTempMaxC,
      description: schema.filamentProducts.description,
    })
    .from(schema.filamentProducts)
    .innerJoin(
      schema.manufacturers,
      eq(schema.filamentProducts.manufacturerId, schema.manufacturers.id),
    )
    .innerJoin(
      schema.materialFamilies,
      eq(schema.filamentProducts.materialFamilyId, schema.materialFamilies.id),
    )
    .where(publicProductWhere)
    .all();

  // Prefer OFD/catalog over any lingering duplicates by (mfr, product) key
  const byKey = new Map<string, (typeof products)[number]>();
  for (const p of products) {
    const key = `${normalizeQuery(p.manufacturerName)}|${normalizeQuery(p.productName)}`;
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, p);
      continue;
    }
    const prefer =
      p.sourceType === "open_filament_database" &&
      existing.sourceType !== "open_filament_database"
        ? p
        : existing;
    byKey.set(key, prefer);
  }
  let list = [...byKey.values()];

  const variants = db
    .select({
      productId: schema.filamentVariants.filamentProductId,
      uuid: schema.filamentVariants.uuid,
      name: schema.filamentVariants.variantName,
      colorName: schema.filamentVariants.colorName,
      hex: schema.filamentVariants.primaryColorHex,
      sku: schema.filamentVariants.manufacturerSku,
      ean: schema.filamentVariants.ean,
      gtin: schema.filamentVariants.gtin,
    })
    .from(schema.filamentVariants)
    .innerJoin(
      schema.filamentProducts,
      eq(schema.filamentVariants.filamentProductId, schema.filamentProducts.id),
    )
    .where(publicProductWhere)
    .all();

  const variantsByProduct = new Map<number, typeof variants>();
  for (const v of variants) {
    const arr = variantsByProduct.get(v.productId) ?? [];
    arr.push(v);
    variantsByProduct.set(v.productId, arr);
  }

  if (brandFilter) {
    list = list.filter((p) =>
      p.manufacturerName.toLowerCase().includes(brandFilter),
    );
  }
  if (materialFilter) {
    list = list.filter((p) => p.materialCode.toUpperCase() === materialFilter);
  }
  if (q) {
    const tokens = q.split(" ").filter(Boolean);
    list = list.filter((p) => {
      const vars = variantsByProduct.get(p.id) ?? [];
      const variantHay = vars
        .map((v) =>
          [v.name, v.colorName, v.sku, v.ean, v.gtin].filter(Boolean).join(" "),
        )
        .join(" ");
      const hay = normalizeQuery(
        `${p.manufacturerName} ${p.productName} ${p.materialCode} ${p.description ?? ""} ${variantHay}`,
      );
      return tokens.every((t) => hay.includes(t));
    });
  }

  list.sort((a, b) =>
    compareCatalogLabels(
      a.manufacturerName,
      a.productName,
      b.manufacturerName,
      b.productName,
    ),
  );

  const total = list.length;
  const slice = list.slice((page - 1) * pageSize, page * pageSize);

  // Profile counts (exclude test/fixture profiles)
  const profileRows = db
    .select({
      productId: schema.filamentProducts.id,
      profileId: schema.calibrationProfiles.id,
      title: schema.calibrationProfiles.title,
      isSyntheticFixture: schema.calibrationProfiles.isSyntheticFixture,
      notes: schema.calibrationRevisions.notes,
    })
    .from(schema.calibrationProfiles)
    .innerJoin(
      schema.filamentVariants,
      eq(schema.calibrationProfiles.filamentVariantId, schema.filamentVariants.id),
    )
    .innerJoin(
      schema.filamentProducts,
      eq(schema.filamentVariants.filamentProductId, schema.filamentProducts.id),
    )
    .leftJoin(
      schema.calibrationRevisions,
      eq(
        schema.calibrationProfiles.currentRevisionId,
        schema.calibrationRevisions.id,
      ),
    )
    .where(publicProductWhere)
    .all();

  const profileStats = new Map<
    number,
    { total: number; measured: number }
  >();
  for (const row of profileRows) {
    const prov = provenanceForProfile(row);
    if (prov === "test" || prov === "demo") continue;
    const cur = profileStats.get(row.productId) ?? { total: 0, measured: 0 };
    cur.total += 1;
    if (prov === "measured" || prov === "community") cur.measured += 1;
    profileStats.set(row.productId, cur);
  }

  const results: CatalogSearchProduct[] = slice.map((p) => {
    const vars = variantsByProduct.get(p.id) ?? [];
    const stats = profileStats.get(p.id) ?? { total: 0, measured: 0 };
    return {
      entityType: "filament_product",
      uuid: p.uuid,
      manufacturerName: p.manufacturerName,
      productName: p.productName,
      materialCode: p.materialCode,
      provenance: provenanceForProduct(p),
      variantCount: vars.length,
      profileCount: stats.total,
      measuredProfileCount: stats.measured,
      nozzleTempMinC: p.nozzleTempMinC,
      nozzleTempMaxC: p.nozzleTempMaxC,
      bedTempMinC: p.bedTempMinC,
      bedTempMaxC: p.bedTempMaxC,
      sampleVariants: vars.slice(0, 6).map((v) => ({
        uuid: v.uuid,
        name: v.colorName ?? v.name,
        hex: v.hex,
      })),
    };
  });

  return {
    query: opts.q ?? "",
    page,
    pageSize,
    total,
    results,
  };
}

export function publicFilamentsOnly(
  db: AppDb,
): Array<{
  uuid: string;
  productName: string;
  manufacturerName: string;
  materialCode: string;
  isSyntheticFixture: boolean;
  sourceType: string | null;
}> {
  return db
    .select({
      uuid: schema.filamentProducts.uuid,
      productName: schema.filamentProducts.productName,
      manufacturerName: schema.manufacturers.name,
      materialCode: schema.materialFamilies.code,
      isSyntheticFixture: schema.filamentProducts.isSyntheticFixture,
      sourceType: schema.filamentProducts.sourceType,
    })
    .from(schema.filamentProducts)
    .innerJoin(
      schema.manufacturers,
      eq(schema.filamentProducts.manufacturerId, schema.manufacturers.id),
    )
    .innerJoin(
      schema.materialFamilies,
      eq(schema.filamentProducts.materialFamilyId, schema.materialFamilies.id),
    )
    .where(publicProductWhere)
    .all()
    .sort((a, b) =>
      compareCatalogLabels(
        a.manufacturerName,
        a.productName,
        b.manufacturerName,
        b.productName,
      ),
    );
}
