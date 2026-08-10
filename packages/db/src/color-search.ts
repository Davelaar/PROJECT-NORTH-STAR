import { eq } from "drizzle-orm";
import {
  materialPopularityRank,
  parseColorQuery,
  rgbDistance,
  type ParsedColorQuery,
} from "@open-filament/domain";
import type { AppDb } from "./client.js";
import * as schema from "./schema.js";

export type ColorSearchHit = {
  entityType: "filament_variant";
  entityUuid: string;
  title: string;
  score: number;
  hex: string | null;
  materialCode: string;
  distance: number;
  matchKind: ParsedColorQuery["kind"];
  matchLabel: string;
};

export type ColorMaterialFacet = {
  code: string;
  count: number;
};

export type ColorSearchResult = {
  parsed: ParsedColorQuery;
  results: ColorSearchHit[];
  total: number;
  page: number;
  pageSize: number;
  materialFacets: ColorMaterialFacet[];
};

const DEFAULT_MAX_DISTANCE = 72;
const DEFAULT_PAGE_SIZE = 24;

export function searchVariantsByColor(
  db: AppDb,
  query: string,
  opts?: {
    /** @deprecated prefer pageSize */
    limit?: number;
    page?: number;
    pageSize?: number;
    maxDistance?: number;
    material?: string;
  },
): ColorSearchResult | null {
  const parsed = parseColorQuery(query);
  if (!parsed) return null;

  const pageSize = Math.min(
    48,
    Math.max(
      1,
      opts?.pageSize ?? opts?.limit ?? DEFAULT_PAGE_SIZE,
    ),
  );
  const page = Math.max(1, opts?.page ?? 1);
  const maxDistance = opts?.maxDistance ?? DEFAULT_MAX_DISTANCE;
  const materialFilter = (opts?.material ?? "").trim().toUpperCase();

  const rows = db
    .select({
      uuid: schema.filamentVariants.uuid,
      variantName: schema.filamentVariants.variantName,
      colorName: schema.filamentVariants.colorName,
      primaryColorHex: schema.filamentVariants.primaryColorHex,
      secondaryColorHex: schema.filamentVariants.secondaryColorHex,
      productName: schema.filamentProducts.productName,
      mfrName: schema.manufacturers.name,
      materialCode: schema.materialFamilies.code,
      materialName: schema.materialFamilies.name,
      isSyntheticFixture: schema.filamentProducts.isSyntheticFixture,
      sourceType: schema.filamentProducts.sourceType,
      variantFixture: schema.filamentVariants.isSyntheticFixture,
    })
    .from(schema.filamentVariants)
    .innerJoin(
      schema.filamentProducts,
      eq(schema.filamentVariants.filamentProductId, schema.filamentProducts.id),
    )
    .innerJoin(
      schema.manufacturers,
      eq(schema.filamentProducts.manufacturerId, schema.manufacturers.id),
    )
    .innerJoin(
      schema.materialFamilies,
      eq(schema.filamentProducts.materialFamilyId, schema.materialFamilies.id),
    )
    .all()
    .filter(
      (r) =>
        !r.isSyntheticFixture &&
        !r.variantFixture &&
        r.sourceType !== "synthetic_fixture",
    );

  const scored: ColorSearchHit[] = [];
  for (const row of rows) {
    const candidates = [row.primaryColorHex, row.secondaryColorHex].filter(
      Boolean,
    ) as string[];
    let bestDist = Number.POSITIVE_INFINITY;
    let bestHex: string | null = null;
    for (const hex of candidates) {
      const d = rgbDistance(parsed.hex, hex);
      if (d != null && d < bestDist) {
        bestDist = d;
        bestHex = hex;
      }
    }
    if (!bestHex || bestDist > maxDistance) continue;

    const matRank = materialPopularityRank(row.materialCode);
    const score = Math.round(10_000 - matRank * 20 - bestDist * 5);

    scored.push({
      entityType: "filament_variant",
      entityUuid: row.uuid,
      title: `${row.mfrName} ${row.productName} ${row.variantName}`,
      score,
      hex: bestHex,
      materialCode: row.materialCode,
      distance: Math.round(bestDist * 10) / 10,
      matchKind: parsed.kind,
      matchLabel: parsed.label,
    });
  }

  scored.sort((a, b) => {
    const ra = materialPopularityRank(a.materialCode);
    const rb = materialPopularityRank(b.materialCode);
    if (ra !== rb) return ra - rb;
    if (a.distance !== b.distance) return a.distance - b.distance;
    return a.title.localeCompare(b.title);
  });

  const facetMap = new Map<string, number>();
  for (const hit of scored) {
    facetMap.set(hit.materialCode, (facetMap.get(hit.materialCode) ?? 0) + 1);
  }
  const materialFacets = [...facetMap.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => {
      const ra = materialPopularityRank(a.code);
      const rb = materialPopularityRank(b.code);
      if (ra !== rb) return ra - rb;
      return b.count - a.count;
    });

  const filtered = materialFilter
    ? scored.filter((h) => h.materialCode.toUpperCase() === materialFilter)
    : scored;

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const results = filtered.slice(start, start + pageSize);

  return {
    parsed,
    results,
    total,
    page,
    pageSize,
    materialFacets,
  };
}
