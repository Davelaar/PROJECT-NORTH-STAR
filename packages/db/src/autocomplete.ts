import { and, eq, like, ne, or } from "drizzle-orm";
import type { AppDb } from "./client.js";
import * as schema from "./schema.js";
import { isPlaceholderIdentifier } from "./catalog-public.js";

export type AutocompleteHit = {
  type: "manufacturer" | "product" | "variant" | "material";
  uuid: string;
  label: string;
  sublabel?: string;
  href: string;
};

const publicProductWhere = and(
  eq(schema.filamentProducts.isSyntheticFixture, false),
  ne(schema.filamentProducts.sourceType, "synthetic_fixture"),
);

/**
 * Bounded catalog autocomplete — max 12 suggestions, excludes fixtures/placeholders.
 */
export function searchAutocomplete(
  db: AppDb,
  query: string,
  limit = 12,
): AutocompleteHit[] {
  const q = query.trim();
  if (q.length < 2) return [];
  const capped = Math.min(12, Math.max(1, limit));
  const pattern = `%${q}%`;
  const hits: AutocompleteHit[] = [];

  const materials = db
    .select({
      uuid: schema.materialFamilies.uuid,
      code: schema.materialFamilies.code,
      name: schema.materialFamilies.name,
    })
    .from(schema.materialFamilies)
    .where(
      or(
        like(schema.materialFamilies.code, pattern),
        like(schema.materialFamilies.name, pattern),
      ),
    )
    .limit(4)
    .all();

  for (const m of materials) {
    hits.push({
      type: "material",
      uuid: m.uuid,
      label: m.code,
      sublabel: m.name,
      href: `/materials/${m.uuid}`,
    });
  }

  const brands = db
    .select({
      uuid: schema.manufacturers.uuid,
      name: schema.manufacturers.name,
    })
    .from(schema.manufacturers)
    .where(
      and(
        eq(schema.manufacturers.isSyntheticFixture, false),
        like(schema.manufacturers.name, pattern),
      ),
    )
    .limit(4)
    .all();

  for (const b of brands) {
    hits.push({
      type: "manufacturer",
      uuid: b.uuid,
      label: b.name,
      href: `/manufacturers/${b.uuid}`,
    });
  }

  const products = db
    .select({
      uuid: schema.filamentProducts.uuid,
      productName: schema.filamentProducts.productName,
      brand: schema.manufacturers.name,
      material: schema.materialFamilies.code,
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
    .where(and(publicProductWhere, like(schema.filamentProducts.productName, pattern)))
    .limit(6)
    .all();

  for (const p of products) {
    hits.push({
      type: "product",
      uuid: p.uuid,
      label: p.productName,
      sublabel: `${p.brand} · ${p.material}`,
      href: `/filaments/${p.uuid}`,
    });
  }

  const variants = db
    .select({
      uuid: schema.filamentVariants.uuid,
      variantName: schema.filamentVariants.variantName,
      colorName: schema.filamentVariants.colorName,
      sku: schema.filamentVariants.manufacturerSku,
      productName: schema.filamentProducts.productName,
      brand: schema.manufacturers.name,
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
    .where(
      and(
        publicProductWhere,
        eq(schema.filamentVariants.isSyntheticFixture, false),
        or(
          like(schema.filamentVariants.variantName, pattern),
          like(schema.filamentVariants.colorName, pattern),
          like(schema.filamentVariants.manufacturerSku, pattern),
        ),
      ),
    )
    .limit(6)
    .all();

  for (const v of variants) {
    if (v.sku && isPlaceholderIdentifier(v.sku)) continue;
    hits.push({
      type: "variant",
      uuid: v.uuid,
      label: v.colorName || v.variantName,
      sublabel: `${v.brand} · ${v.productName}`,
      href: `/variants/${v.uuid}`,
    });
  }

  return hits.slice(0, capped);
}
