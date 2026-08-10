import { and, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { normalizeNameKey } from "@open-filament/domain";
import type { AppDb } from "./client.js";
import * as schema from "./schema.js";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
}

function uniqueSlug(base: string, exists: (slug: string) => boolean): string {
  let slug = slugify(base);
  if (!exists(slug)) return slug;
  for (let i = 2; i < 1000; i++) {
    const candidate = `${slug}-${i}`;
    if (!exists(candidate)) return candidate;
  }
  return `${slug}-${uuid().slice(0, 8)}`;
}

/** Find or create a community-contributed manufacturer (unverified). */
export function resolveOrCreateManufacturer(
  db: AppDb,
  nameRaw: string,
): { uuid: string; name: string; created: boolean } {
  const name = nameRaw.trim().replace(/\s+/g, " ");
  if (name.length < 1 || name.length > 120) {
    throw new Error("Manufacturer name must be 1–120 characters");
  }
  const key = normalizeNameKey(name);
  const all = db.select().from(schema.manufacturers).all();
  const existing = all.find((m) => normalizeNameKey(m.name) === key);
  if (existing) {
    return { uuid: existing.uuid, name: existing.name, created: false };
  }
  const manufacturerUuid = uuid();
  const slug = uniqueSlug(name, (s) =>
    Boolean(all.find((m) => m.slug === s)),
  );
  db.insert(schema.manufacturers)
    .values({
      uuid: manufacturerUuid,
      name,
      slug,
      verified: false,
      description: "Community-contributed brand",
    })
    .run();
  const row = db
    .select()
    .from(schema.manufacturers)
    .where(eq(schema.manufacturers.uuid, manufacturerUuid))
    .get()!;
  db.insert(schema.manufacturerAliases)
    .values({
      manufacturerId: row.id,
      alias: name,
      normalizedAlias: key,
    })
    .run();
  return { uuid: manufacturerUuid, name, created: true };
}

export function resolveOrCreateFilamentProduct(
  db: AppDb,
  input: {
    manufacturerUuid: string;
    materialCode: string;
    productName: string;
  },
): { uuid: string; productName: string; created: boolean } {
  const productName = input.productName.trim().replace(/\s+/g, " ");
  if (productName.length < 1 || productName.length > 200) {
    throw new Error("Product name must be 1–200 characters");
  }
  const mfr = db
    .select()
    .from(schema.manufacturers)
    .where(eq(schema.manufacturers.uuid, input.manufacturerUuid))
    .get();
  if (!mfr) throw new Error("Unknown manufacturer");
  const material = db
    .select()
    .from(schema.materialFamilies)
    .where(eq(schema.materialFamilies.code, input.materialCode.trim().toUpperCase()))
    .get();
  if (!material) throw new Error("Unknown material code");

  const existing = db
    .select()
    .from(schema.filamentProducts)
    .where(
      and(
        eq(schema.filamentProducts.manufacturerId, mfr.id),
        eq(schema.filamentProducts.materialFamilyId, material.id),
      ),
    )
    .all()
    .find(
      (p) => normalizeNameKey(p.productName) === normalizeNameKey(productName),
    );
  if (existing) {
    return {
      uuid: existing.uuid,
      productName: existing.productName,
      created: false,
    };
  }

  const productUuid = uuid();
  const siblings = db
    .select()
    .from(schema.filamentProducts)
    .where(eq(schema.filamentProducts.manufacturerId, mfr.id))
    .all();
  const slug = uniqueSlug(productName, (s) =>
    Boolean(siblings.find((p) => p.slug === s)),
  );
  db.insert(schema.filamentProducts)
    .values({
      uuid: productUuid,
      manufacturerId: mfr.id,
      materialFamilyId: material.id,
      productName,
      slug,
      sourceType: "community",
      sourceReference: "community_submit",
      verified: false,
    })
    .run();
  return { uuid: productUuid, productName, created: true };
}

export function resolveOrCreateFilamentVariant(
  db: AppDb,
  input: {
    filamentProductUuid: string;
    variantName: string;
    colorName?: string | null;
    primaryColorHex?: string | null;
  },
): { uuid: string; variantName: string; created: boolean } {
  const variantName = input.variantName.trim().replace(/\s+/g, " ");
  if (variantName.length < 1 || variantName.length > 200) {
    throw new Error("Colour / variant name must be 1–200 characters");
  }
  const product = db
    .select()
    .from(schema.filamentProducts)
    .where(eq(schema.filamentProducts.uuid, input.filamentProductUuid))
    .get();
  if (!product) throw new Error("Unknown filament product");

  const siblings = db
    .select()
    .from(schema.filamentVariants)
    .where(eq(schema.filamentVariants.filamentProductId, product.id))
    .all();
  const existing = siblings.find(
    (v) => normalizeNameKey(v.variantName) === normalizeNameKey(variantName),
  );
  if (existing) {
    return {
      uuid: existing.uuid,
      variantName: existing.variantName,
      created: false,
    };
  }

  const variantUuid = uuid();
  const slug = uniqueSlug(variantName, (s) =>
    Boolean(siblings.find((v) => v.slug === s)),
  );
  let hex = input.primaryColorHex?.trim() || null;
  if (hex && !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error("Colour hex must look like #RRGGBB");
  }
  db.insert(schema.filamentVariants)
    .values({
      uuid: variantUuid,
      filamentProductId: product.id,
      variantName,
      slug,
      colorName: input.colorName?.trim() || variantName,
      primaryColorHex: hex,
      notes: "Community-contributed colour",
      verified: false,
    })
    .run();
  return { uuid: variantUuid, variantName, created: true };
}
