import { eq } from "drizzle-orm";
import type { AppDb } from "./client.js";
import * as schema from "./schema.js";

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

export function rebuildSearchIndex(db: AppDb) {
  db.delete(schema.searchDocuments).run();

  const rows: Array<{
    entityType: string;
    entityUuid: string;
    title: string;
    body: string;
  }> = [];

  const manufacturers = db.select().from(schema.manufacturers).all();
  for (const m of manufacturers) {
    rows.push({
      entityType: "manufacturer",
      entityUuid: m.uuid,
      title: m.name,
      body: [m.name, m.slug, m.country, m.description].filter(Boolean).join(" "),
    });
  }

  const products = db
    .select({
      uuid: schema.filamentProducts.uuid,
      productName: schema.filamentProducts.productName,
      slug: schema.filamentProducts.slug,
      description: schema.filamentProducts.description,
      mfrName: schema.manufacturers.name,
      material: schema.materialFamilies.name,
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
    .all();

  for (const p of products) {
    rows.push({
      entityType: "filament_product",
      entityUuid: p.uuid,
      title: `${p.mfrName} ${p.productName}`,
      body: [p.mfrName, p.productName, p.material, p.slug, p.description]
        .filter(Boolean)
        .join(" "),
    });
  }

  const variants = db
    .select({
      uuid: schema.filamentVariants.uuid,
      variantName: schema.filamentVariants.variantName,
      colorName: schema.filamentVariants.colorName,
      sku: schema.filamentVariants.manufacturerSku,
      ean: schema.filamentVariants.ean,
      upc: schema.filamentVariants.upc,
      gtin: schema.filamentVariants.gtin,
      productName: schema.filamentProducts.productName,
      mfrName: schema.manufacturers.name,
      material: schema.materialFamilies.name,
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
    .all();

  for (const v of variants) {
    rows.push({
      entityType: "filament_variant",
      entityUuid: v.uuid,
      title: `${v.mfrName} ${v.productName} ${v.variantName}`,
      body: [
        v.mfrName,
        v.productName,
        v.variantName,
        v.colorName,
        v.material,
        v.sku,
        v.ean,
        v.upc,
        v.gtin,
      ]
        .filter(Boolean)
        .join(" "),
    });
  }

  const printers = db.select().from(schema.printerModels).all();
  for (const p of printers) {
    rows.push({
      entityType: "printer",
      entityUuid: p.uuid,
      title: `${p.manufacturerName} ${p.model}`,
      body: [p.manufacturerName, p.model, p.revision, p.slug].filter(Boolean).join(" "),
    });
  }

  for (const row of rows) {
    db.insert(schema.searchDocuments)
      .values({
        entityType: row.entityType,
        entityUuid: row.entityUuid,
        title: row.title,
        body: row.body,
        normalized: normalize(`${row.title} ${row.body}`),
      })
      .run();
  }
}

export function searchDocuments(db: AppDb, query: string, limit = 20) {
  const q = normalize(query);
  if (!q) return [];
  const tokens = q.split(" ").filter(Boolean);
  const all = db.select().from(schema.searchDocuments).all();
  const scored = all
    .map((doc) => {
      let score = 0;
      for (const token of tokens) {
        if (doc.normalized.includes(token)) score += 2;
        // simple typo tolerance: substring length >= 3
        if (token.length >= 3) {
          const parts = doc.normalized.split(" ");
          if (parts.some((p) => p.startsWith(token.slice(0, 3)))) score += 1;
        }
      }
      if (doc.normalized.includes(q)) score += 5;
      return { doc, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  return scored.map((s) => ({ ...s.doc, score: s.score }));
}

export { normalize as normalizeSearchText };
