import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { eq } from "drizzle-orm";
import { v5 as uuidv5 } from "uuid";
import { normalizeNameKey } from "@open-filament/domain";
import { createDb, resolveDbPath, type AppDb } from "./client.js";
import { ensureMigrated } from "./migrate.js";
import * as schema from "./schema.js";
import { rebuildSearchIndex } from "./search.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SPOOLMANDB_NAMESPACE = "65e71a97-cd73-40c4-8da4-2b2cd3bc4c15";

type SpoolmanColor = {
  name: string;
  hex?: string;
  hexes?: string[];
  finish?: string | null;
  multi_color_direction?: string | null;
  pattern?: string | null;
  translucent?: boolean;
  glow?: boolean;
};

type SpoolmanWeight = {
  weight: number;
  spool_weight?: number | null;
  spool_type?: string | null;
};

type SpoolmanFilament = {
  name: string;
  material: string;
  density: number;
  weights: SpoolmanWeight[];
  diameters: number[];
  extruder_temp?: number;
  extruder_temp_range?: [number, number];
  bed_temp?: number;
  bed_temp_range?: [number, number];
  fill?: string | null;
  finish?: string | null;
  multi_color_direction?: string | null;
  pattern?: string | null;
  translucent?: boolean;
  glow?: boolean;
  colors: SpoolmanColor[];
};

type SpoolmanFile = {
  manufacturer: string;
  filaments: SpoolmanFilament[];
};

function defaultDatasetPath(): string {
  if (process.env.SPOOLMANDB_DATASET_PATH) return process.env.SPOOLMANDB_DATASET_PATH;
  return path.resolve(__dirname, "../../../data/external/spoolmandb/filaments");
}

function materialCodeFromName(name: string): string {
  return (
    name
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_|_$/g, "")
      .slice(0, 32) || "UNKNOWN"
  );
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
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "item"
  );
}

function productNameFromTemplate(template: string, material: string): string {
  const cleaned = template
    .replace(/\{color_name\}/gi, "")
    .replace(/\s+/g, " ")
    .replace(/\s+-\s+$/g, "")
    .trim();
  return cleaned || material;
}

function productKey(brandId: number, materialCode: string, productName: string): string {
  return `${brandId}:${materialCode}:${normalizeNameKey(productName)}`;
}

function variantKey(productId: number, colorName: string): string {
  return `${productId}:${normalizeNameKey(colorName)}`;
}

function tempRange(single?: number, range?: [number, number]): [number | null, number | null] {
  if (range) return [range[0], range[1]];
  return single == null ? [null, null] : [single, single];
}

function fillFlags(
  filament: SpoolmanFilament,
): Pick<
  typeof schema.filamentVariants.$inferInsert,
  "carbonFilled" | "glassFilled" | "woodFilled" | "metalFilled"
> {
  const marker = `${filament.material} ${filament.fill ?? ""}`.toLowerCase();
  return {
    carbonFilled: marker.includes("carbon") || marker.includes("cf"),
    glassFilled: marker.includes("glass") || marker.includes("gf"),
    woodFilled: marker.includes("wood"),
    metalFilled: marker.includes("metal"),
  };
}

function appearanceKind(filament: SpoolmanFilament, color: SpoolmanColor): string {
  const direction = color.multi_color_direction ?? filament.multi_color_direction;
  if (direction === "longitudinal") return "gradient";
  if (direction === "coaxial" || (color.hexes?.length ?? 0) > 1) return "dual";
  return "solid";
}

function firstWeight(filament: SpoolmanFilament): SpoolmanWeight | undefined {
  return filament.weights.find((w) => w.weight > 0) ?? filament.weights[0];
}

function readFiles(datasetPath: string): Array<{ file: string; data: SpoolmanFile }> {
  return fs
    .readdirSync(datasetPath)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => ({
      file,
      data: JSON.parse(fs.readFileSync(path.join(datasetPath, file), "utf8")) as SpoolmanFile,
    }));
}

function mapExisting(db: AppDb) {
  const brandsByName = new Map(
    db
      .select()
      .from(schema.manufacturers)
      .all()
      .map((row) => [normalizeNameKey(row.name), row] as const),
  );
  const materialsByCode = new Map(
    db
      .select()
      .from(schema.materialFamilies)
      .all()
      .map((row) => [row.code, row] as const),
  );
  const productsByKey = new Map<string, typeof schema.filamentProducts.$inferSelect>();
  for (const row of db.select().from(schema.filamentProducts).all()) {
    const material = db
      .select()
      .from(schema.materialFamilies)
      .where(eq(schema.materialFamilies.id, row.materialFamilyId))
      .get();
    if (!material) continue;
    productsByKey.set(productKey(row.manufacturerId, material.code, row.productName), row);
  }
  const variantsByKey = new Map<string, typeof schema.filamentVariants.$inferSelect>();
  for (const row of db.select().from(schema.filamentVariants).all()) {
    variantsByKey.set(variantKey(row.filamentProductId, row.colorName ?? row.variantName), row);
  }
  return { brandsByName, materialsByCode, productsByKey, variantsByKey };
}

/** Import Donkie/SpoolmanDB (MIT) as unverified catalog data. */
export async function importSpoolmanDbCatalog(
  dbPath?: string,
  datasetPath = defaultDatasetPath(),
): Promise<{
  brandsCreated: number;
  materialsCreated: number;
  productsCreated: number;
  productsUpdated: number;
  variantsCreated: number;
  variantsUpdated: number;
}> {
  ensureMigrated(dbPath);
  if (!fs.existsSync(datasetPath)) {
    throw new Error(
      `SpoolmanDB dataset not found at ${datasetPath}. Add data/external/spoolmandb or set SPOOLMANDB_DATASET_PATH.`,
    );
  }

  const files = readFiles(datasetPath);
  const db = createDb(dbPath);
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const { brandsByName, materialsByCode, productsByKey, variantsByKey } = mapExisting(db);
  const manufacturerSlugs = new Set(
    db.select().from(schema.manufacturers).all().map((row) => row.slug),
  );
  const productSlugs = new Map<number, Set<string>>();
  for (const row of db.select().from(schema.filamentProducts).all()) {
    const set = productSlugs.get(row.manufacturerId) ?? new Set();
    set.add(row.slug);
    productSlugs.set(row.manufacturerId, set);
  }
  const variantSlugs = new Map<number, Set<string>>();
  for (const row of db.select().from(schema.filamentVariants).all()) {
    const set = variantSlugs.get(row.filamentProductId) ?? new Set();
    set.add(row.slug);
    variantSlugs.set(row.filamentProductId, set);
  }

  let brandsCreated = 0;
  let materialsCreated = 0;
  let productsCreated = 0;
  let productsUpdated = 0;
  let variantsCreated = 0;
  let variantsUpdated = 0;

  for (const { file, data } of files) {
    const normalizedBrand = normalizeNameKey(data.manufacturer);
    let brand = brandsByName.get(normalizedBrand);
    if (!brand) {
      let slug = slugify(data.manufacturer);
      if (manufacturerSlugs.has(slug)) slug = `${slug}-spoolmandb`;
      manufacturerSlugs.add(slug);
      const [created] = db
        .insert(schema.manufacturers)
        .values({
          uuid: uuidv5(`spoolmandb:brand:${normalizedBrand}`, SPOOLMANDB_NAMESPACE),
          name: data.manufacturer,
          slug,
          description: "Imported from SpoolmanDB (MIT); unverified catalog source.",
          verified: false,
          isSyntheticFixture: false,
        })
        .returning()
        .all();
      brand = created!;
      brandsByName.set(normalizedBrand, brand);
      productSlugs.set(brand.id, new Set());
      brandsCreated += 1;
    }

    for (const [index, filament] of data.filaments.entries()) {
      const materialCode = materialCodeFromName(filament.material);
      let material = materialsByCode.get(materialCode);
      if (!material) {
        const [created] = db
          .insert(schema.materialFamilies)
          .values({
            uuid: uuidv5(`spoolmandb:material:${materialCode}`, SPOOLMANDB_NAMESPACE),
            code: materialCode,
            name: filament.material,
            category: materialCategory(materialCode),
          })
          .returning()
          .all();
        material = created!;
        materialsByCode.set(materialCode, material);
        materialsCreated += 1;
      }

      const productName = productNameFromTemplate(filament.name, filament.material);
      const key = productKey(brand.id, materialCode, productName);
      const [nozzleMin, nozzleMax] = tempRange(
        filament.extruder_temp,
        filament.extruder_temp_range,
      );
      const [bedMin, bedMax] = tempRange(filament.bed_temp, filament.bed_temp_range);
      const weight = firstWeight(filament);
      const metadata = {
        source: "spoolmandb",
        file,
        sourceIndex: index,
        originalNameTemplate: filament.name,
        weights: filament.weights,
        diameters: filament.diameters,
      };

      let product = productsByKey.get(key);
      const productBase = {
        manufacturerId: brand.id,
        materialFamilyId: material.id,
        productName,
        productLine: filament.material,
        description: "Imported from SpoolmanDB (MIT); unverified catalog data.",
        diameterMm: filament.diameters[0] ?? 1.75,
        nominalSpoolWeightG: weight?.weight ?? null,
        densityGCm3: filament.density ?? null,
        mfrNozzleTempMinC: nozzleMin,
        mfrNozzleTempMaxC: nozzleMax,
        mfrBedTempMinC: bedMin,
        mfrBedTempMaxC: bedMax,
        abrasive:
          materialCode.includes("CF") ||
          materialCode.includes("GF") ||
          filament.fill === "carbon fiber" ||
          filament.fill === "glass fiber",
        catalogSlicerHintsJson: JSON.stringify(metadata),
        sourceType: "spoolmandb",
        sourceReference: `spoolmandb:${file}:${index}`,
        verified: false,
        isSyntheticFixture: false,
        updatedAt: now,
      };
      if (!product) {
        const slugSet = productSlugs.get(brand.id) ?? new Set();
        let slug = slugify(productName);
        if (slugSet.has(slug)) slug = `${slug}-${uuidv5(key, SPOOLMANDB_NAMESPACE).slice(0, 8)}`;
        slugSet.add(slug);
        productSlugs.set(brand.id, slugSet);
        const [created] = db
          .insert(schema.filamentProducts)
          .values({
            uuid: uuidv5(`spoolmandb:product:${key}`, SPOOLMANDB_NAMESPACE),
            slug,
            ...productBase,
          })
          .returning()
          .all();
        product = created!;
        productsByKey.set(key, product);
        variantSlugs.set(product.id, new Set());
        productsCreated += 1;
      } else {
        db.update(schema.filamentProducts)
          .set({
            densityGCm3: product.densityGCm3 ?? productBase.densityGCm3,
            nominalSpoolWeightG:
              product.nominalSpoolWeightG ?? productBase.nominalSpoolWeightG,
            mfrNozzleTempMinC: product.mfrNozzleTempMinC ?? productBase.mfrNozzleTempMinC,
            mfrNozzleTempMaxC: product.mfrNozzleTempMaxC ?? productBase.mfrNozzleTempMaxC,
            mfrBedTempMinC: product.mfrBedTempMinC ?? productBase.mfrBedTempMinC,
            mfrBedTempMaxC: product.mfrBedTempMaxC ?? productBase.mfrBedTempMaxC,
            catalogSlicerHintsJson:
              product.catalogSlicerHintsJson ?? productBase.catalogSlicerHintsJson,
            updatedAt: now,
          })
          .where(eq(schema.filamentProducts.id, product.id))
          .run();
        productsUpdated += 1;
      }

      for (const color of filament.colors) {
        const vKey = variantKey(product.id, color.name);
        const existingVariant = variantsByKey.get(vKey);
        const hexes = color.hexes ?? [];
        const primaryColorHex = color.hex ?? hexes[0] ?? null;
        const secondaryColorHex = hexes[1] ?? null;
        const flags = fillFlags(filament);
        const variantBase = {
          filamentProductId: product.id,
          variantName: color.name,
          colorName: color.name,
          primaryColorHex,
          secondaryColorHex,
          finish: color.finish ?? filament.finish ?? color.pattern ?? filament.pattern ?? null,
          translucency:
            color.translucent || filament.translucent ? "translucent" : null,
          glitter: color.pattern === "sparkle" || filament.pattern === "sparkle",
          glowInDark: Boolean(color.glow ?? filament.glow),
          appearanceKind: appearanceKind(filament, color),
          spoolWeightG: weight?.spool_weight ?? null,
          spoolMaterial: weight?.spool_type ?? null,
          notes: "Imported from SpoolmanDB (MIT); unverified catalog data.",
          verified: false,
          isSyntheticFixture: false,
          updatedAt: now,
          ...flags,
        };
        if (!existingVariant) {
          const slugSet = variantSlugs.get(product.id) ?? new Set();
          let slug = slugify(color.name);
          if (slugSet.has(slug)) slug = `${slug}-${uuidv5(vKey, SPOOLMANDB_NAMESPACE).slice(0, 8)}`;
          slugSet.add(slug);
          variantSlugs.set(product.id, slugSet);
          const [created] = db
            .insert(schema.filamentVariants)
            .values({
              uuid: uuidv5(`spoolmandb:variant:${vKey}`, SPOOLMANDB_NAMESPACE),
              slug,
              ...variantBase,
            })
            .returning()
            .all();
          variantsByKey.set(vKey, created!);
          variantsCreated += 1;
        } else {
          db.update(schema.filamentVariants)
            .set({
              primaryColorHex:
                existingVariant.primaryColorHex ?? variantBase.primaryColorHex,
              secondaryColorHex:
                existingVariant.secondaryColorHex ?? variantBase.secondaryColorHex,
              spoolWeightG: existingVariant.spoolWeightG ?? variantBase.spoolWeightG,
              spoolMaterial:
                existingVariant.spoolMaterial ?? variantBase.spoolMaterial,
              finish: existingVariant.finish ?? variantBase.finish,
              translucency:
                existingVariant.translucency ?? variantBase.translucency,
              glitter: existingVariant.glitter || variantBase.glitter,
              glowInDark: existingVariant.glowInDark || variantBase.glowInDark,
              carbonFilled:
                existingVariant.carbonFilled || variantBase.carbonFilled,
              glassFilled: existingVariant.glassFilled || variantBase.glassFilled,
              woodFilled: existingVariant.woodFilled || variantBase.woodFilled,
              metalFilled: existingVariant.metalFilled || variantBase.metalFilled,
              updatedAt: now,
            })
            .where(eq(schema.filamentVariants.id, existingVariant.id))
            .run();
          variantsUpdated += 1;
        }
      }
    }
  }

  rebuildSearchIndex(db);

  const summary = {
    brandsCreated,
    materialsCreated,
    productsCreated,
    productsUpdated,
    variantsCreated,
    variantsUpdated,
  };
  console.log(
    `SpoolmanDB import complete: ${summary.brandsCreated} brands, ${summary.materialsCreated} materials, ${summary.productsCreated} products, ${summary.variantsCreated} variants (${summary.productsUpdated} products and ${summary.variantsUpdated} variants enriched) → ${resolveDbPath(dbPath)}`,
  );
  return summary;
}

const isDirect =
  process.argv[1]?.endsWith("import-spoolmandb.ts") ||
  process.argv[1]?.endsWith("import-spoolmandb.js");
if (isDirect) {
  importSpoolmanDbCatalog().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
