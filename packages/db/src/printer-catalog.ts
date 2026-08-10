/**
 * Seed curated printer brands/models and resolve-or-create user printers.
 */
import { and, eq, isNull, or } from "drizzle-orm";
import { v5 as uuidv5 } from "uuid";
import {
  displayNameFromInput,
  matchNormalizedName,
  normalizeNameKey,
} from "@open-filament/domain";
import { createDb, resolveDbPath } from "./client.js";
import { ensureMigrated } from "./migrate.js";
import * as schema from "./schema.js";
import {
  DEFAULT_NOZZLE_DIAMETERS_MM,
  PRINTER_CATALOG,
} from "./printer-catalog-data.js";
import { rebuildSearchIndex } from "./search.js";
import { canonicalPrinterBrand } from "./dedupe-brands.js";

const NS = "a1b2c3d4-e5f6-4789-a012-3456789abcde";

function slugify(parts: string[]): string {
  return parts
    .map((p) =>
      normalizeNameKey(p)
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, ""),
    )
    .filter(Boolean)
    .join("-")
    .slice(0, 120);
}

function ensureToolheads(
  db: ReturnType<typeof createDb>,
  printerId: number,
  printerUuid: string,
  diameters: readonly number[] = DEFAULT_NOZZLE_DIAMETERS_MM,
): void {
  for (const mm of diameters) {
    const existing = db
      .select()
      .from(schema.toolheadConfigs)
      .where(
        and(
          eq(schema.toolheadConfigs.printerModelId, printerId),
          eq(schema.toolheadConfigs.nozzleDiameterMm, mm),
          eq(schema.toolheadConfigs.hotendName, "Stock"),
        ),
      )
      .get();
    if (existing) continue;
    const uuid = uuidv5(`toolhead:${printerUuid}:stock:${mm}`, NS);
    db.insert(schema.toolheadConfigs)
      .values({
        uuid,
        printerModelId: printerId,
        hotendName: "Stock",
        nozzleDiameterMm: mm,
        nozzleMaterial: "brass",
        nozzleType: "standard",
      })
      .run();
  }
}

export function ensurePrinterCatalog(dbPath?: string): {
  brands: number;
  printers: number;
} {
  ensureMigrated(dbPath);
  const db = createDb(dbPath);
  let brands = 0;
  let printers = 0;

  for (const brand of PRINTER_CATALOG) {
    if (brand.models.length === 0) continue;
    brands += 1;
    for (const model of brand.models) {
      const slug = slugify([brand.name, model, "1"]);
      let row = db
        .select()
        .from(schema.printerModels)
        .where(
          and(
            eq(schema.printerModels.manufacturerName, brand.name),
            eq(schema.printerModels.model, model),
            or(
              eq(schema.printerModels.revision, "1"),
              isNull(schema.printerModels.revision),
            ),
          ),
        )
        .get();

      if (!row) {
        // Also match by slug collision
        const bySlug = db
          .select()
          .from(schema.printerModels)
          .where(eq(schema.printerModels.slug, slug))
          .get();
        if (bySlug) {
          row = bySlug;
        } else {
          const uuid = uuidv5(`printer:${brand.name}:${model}`, NS);
          const [inserted] = db
            .insert(schema.printerModels)
            .values({
              uuid,
              manufacturerName: brand.name,
              model,
              revision: "1",
              slug,
              notes: "Community printer catalog entry",
              isSyntheticFixture: false,
            })
            .returning()
            .all();
          row = inserted!;
          printers += 1;
        }
      }
      ensureToolheads(db, row.id, row.uuid);
    }
  }

  rebuildSearchIndex(db);
  console.log(
    `Printer catalog: ensured ${brands} brands, created ${printers} new printers → ${resolveDbPath(dbPath)}`,
  );
  return { brands, printers };
}

function brandCandidatesFromDb(db: ReturnType<typeof createDb>) {
  const fromDb = new Map<string, { canonical: string; keys: string[] }>();
  for (const brand of PRINTER_CATALOG) {
    fromDb.set(normalizeNameKey(brand.name), {
      canonical: brand.name,
      keys: brand.aliases ?? [],
    });
  }
  for (const row of db.select().from(schema.printerModels).all()) {
    const key = normalizeNameKey(row.manufacturerName);
    const existing = fromDb.get(key);
    if (existing) {
      if (
        !existing.keys.some(
          (k) => normalizeNameKey(k) === normalizeNameKey(row.manufacturerName),
        ) &&
        normalizeNameKey(existing.canonical) !== key
      ) {
        existing.keys.push(row.manufacturerName);
      }
    } else {
      fromDb.set(key, { canonical: row.manufacturerName, keys: [] });
    }
  }
  return [...fromDb.values()];
}

export type ResolvePrinterInput = {
  brand: string;
  model: string;
  nozzleDiameterMm: number;
  hotendName?: string;
  technology?: "fff" | "resin" | "sls" | "other";
  /** Optional printer capability hints (community contributions). */
  maxNozzleTempC?: number | null;
  maxBedTempC?: number | null;
  chamberCapable?: boolean | null;
  typicalNozzleTempC?: number | null;
  typicalBedTempC?: number | null;
  notes?: string | null;
};

export type ResolvePrinterResult = {
  printer: {
    uuid: string;
    manufacturerName: string;
    model: string;
  };
  toolhead: {
    uuid: string;
    nozzleDiameterMm: number;
    hotendName: string;
  };
  brandMatch: "exact" | "alias" | "fuzzy" | "created";
  created: {
    printer: boolean;
    toolhead: boolean;
  };
};

export function resolveOrCreatePrinter(
  input: ResolvePrinterInput,
  dbPath?: string,
): ResolvePrinterResult {
  ensureMigrated(dbPath);
  const db = createDb(dbPath);

  const brandRaw = input.brand.trim();
  const modelRaw = input.model.trim();
  if (!brandRaw || !modelRaw) {
    throw new Error("Brand and model are required");
  }
  if (!(input.nozzleDiameterMm >= 0) || input.nozzleDiameterMm > 2) {
    throw new Error("Nozzle diameter must be between 0 and 2 mm");
  }

  const brandMatch = matchNormalizedName(brandRaw, brandCandidatesFromDb(db));
  const manufacturerName =
    brandMatch.canonical ?? displayNameFromInput(brandRaw);
  const brandMatchKind = brandMatch.canonical
    ? brandMatch.kind === "none"
      ? "created"
      : brandMatch.kind
    : "created";

  const modelsForBrand = db
    .select()
    .from(schema.printerModels)
    .all()
    .filter(
      (p) =>
        normalizeNameKey(p.manufacturerName) ===
        normalizeNameKey(manufacturerName),
    );

  const modelCandidates = modelsForBrand.map((p) => ({
    canonical: p.model,
    keys: [p.model],
  }));
  // Also include catalog models for this brand
  const catalogBrand = PRINTER_CATALOG.find(
    (b) => normalizeNameKey(b.name) === normalizeNameKey(manufacturerName),
  );
  for (const m of catalogBrand?.models ?? []) {
    if (!modelCandidates.some((c) => c.canonical === m)) {
      modelCandidates.push({ canonical: m, keys: [m] });
    }
  }

  const modelMatch = matchNormalizedName(modelRaw, modelCandidates);
  const model = modelMatch.canonical ?? displayNameFromInput(modelRaw);

  let printer = modelsForBrand.find(
    (p) => normalizeNameKey(p.model) === normalizeNameKey(model),
  );
  let createdPrinter = false;

  if (!printer) {
    // Prefer revision "1" unique constraint
    const slugBase = slugify([manufacturerName, model, "1"]);
    let slug = slugBase;
    let n = 2;
    while (
      db
        .select()
        .from(schema.printerModels)
        .where(eq(schema.printerModels.slug, slug))
        .get()
    ) {
      slug = `${slugBase}-${n}`;
      n += 1;
    }
    const uuid = uuidv5(`printer-user:${manufacturerName}:${model}`, NS);
    try {
      const [inserted] = db
        .insert(schema.printerModels)
        .values({
          uuid,
          manufacturerName,
          model,
          revision: "1",
          slug,
          technology: input.technology ?? "fff",
          maxNozzleTempC: input.maxNozzleTempC ?? null,
          maxBedTempC: input.maxBedTempC ?? null,
          chamberCapable: Boolean(input.chamberCapable),
          typicalNozzleTempC: input.typicalNozzleTempC ?? null,
          typicalBedTempC: input.typicalBedTempC ?? null,
          notes:
            input.notes?.trim() ||
            "Added by community — printer settings welcome",
          isSyntheticFixture: false,
          sourceType: "community",
        })
        .returning()
        .all();
      printer = inserted!;
      createdPrinter = true;
    } catch {
      printer = db
        .select()
        .from(schema.printerModels)
        .where(
          and(
            eq(schema.printerModels.manufacturerName, manufacturerName),
            eq(schema.printerModels.model, model),
          ),
        )
        .get();
      if (!printer) throw new Error("Could not create printer");
    }
  }

  // Fill missing capability fields from community input (never overwrite known values).
  const patch: Partial<typeof schema.printerModels.$inferInsert> = {};
  if (input.maxNozzleTempC != null && printer.maxNozzleTempC == null) {
    patch.maxNozzleTempC = input.maxNozzleTempC;
  }
  if (input.maxBedTempC != null && printer.maxBedTempC == null) {
    patch.maxBedTempC = input.maxBedTempC;
  }
  if (input.typicalNozzleTempC != null && printer.typicalNozzleTempC == null) {
    patch.typicalNozzleTempC = input.typicalNozzleTempC;
  }
  if (input.typicalBedTempC != null && printer.typicalBedTempC == null) {
    patch.typicalBedTempC = input.typicalBedTempC;
  }
  if (input.chamberCapable === true && !printer.chamberCapable) {
    patch.chamberCapable = true;
  }
  if (input.technology && !printer.technology) {
    patch.technology = input.technology;
  }
  if (Object.keys(patch).length > 0) {
    patch.updatedAt = new Date().toISOString();
    db.update(schema.printerModels)
      .set(patch)
      .where(eq(schema.printerModels.id, printer.id))
      .run();
    printer = db
      .select()
      .from(schema.printerModels)
      .where(eq(schema.printerModels.id, printer.id))
      .get()!;
  }

  ensureToolheads(db, printer.id, printer.uuid);

  const tech =
    input.technology ??
    (printer.technology as ResolvePrinterInput["technology"]) ??
    "fff";
  const defaultHotend =
    tech === "resin" ? "Vat" : tech === "fff" ? "Stock" : "Standard";
  const hotendName = (input.hotendName?.trim() || defaultHotend).slice(0, 80);
  const mm =
    tech === "fff" ? Math.round(input.nozzleDiameterMm * 1000) / 1000 : 0;

  let toolhead = db
    .select()
    .from(schema.toolheadConfigs)
    .where(
      and(
        eq(schema.toolheadConfigs.printerModelId, printer.id),
        eq(schema.toolheadConfigs.nozzleDiameterMm, mm),
        eq(schema.toolheadConfigs.hotendName, hotendName),
      ),
    )
    .get();

  let createdToolhead = false;
  if (!toolhead) {
    const uuid = uuidv5(
      `toolhead-user:${printer.uuid}:${hotendName}:${mm}`,
      NS,
    );
    const [inserted] = db
      .insert(schema.toolheadConfigs)
      .values({
        uuid,
        printerModelId: printer.id,
        hotendName,
        nozzleDiameterMm: mm,
        nozzleMaterial: "brass",
        nozzleType: "standard",
      })
      .returning()
      .all();
    toolhead = inserted!;
    createdToolhead = true;
  }

  if (createdPrinter || createdToolhead) {
    rebuildSearchIndex(db);
  }

  return {
    printer: {
      uuid: printer.uuid,
      manufacturerName: printer.manufacturerName,
      model: printer.model,
    },
    toolhead: {
      uuid: toolhead.uuid,
      nozzleDiameterMm: toolhead.nozzleDiameterMm,
      hotendName: toolhead.hotendName,
    },
    brandMatch: brandMatchKind as ResolvePrinterResult["brandMatch"],
    created: {
      printer: createdPrinter,
      toolhead: createdToolhead,
    },
  };
}

export function listPrinterBrands(dbPath?: string): Array<{
  name: string;
  models: Array<{ name: string; technology: string | null }>;
}> {
  ensureMigrated(dbPath);
  const db = createDb(dbPath);
  /** key = normalizeNameKey(canonical brand) */
  const byBrand = new Map<
    string,
    { name: string; models: Map<string, string | null> }
  >();

  function bucket(rawName: string) {
    const name = canonicalPrinterBrand(rawName);
    const key = normalizeNameKey(name);
    let entry = byBrand.get(key);
    if (!entry) {
      entry = { name, models: new Map() };
      byBrand.set(key, entry);
    }
    return entry;
  }

  for (const brand of PRINTER_CATALOG) {
    const entry = bucket(brand.name);
    for (const m of brand.models) {
      if (!entry.models.has(m)) entry.models.set(m, "fff");
    }
  }

  for (const row of db.select().from(schema.printerModels).all()) {
    const entry = bucket(row.manufacturerName);
    const tech = row.technology ?? entry.models.get(row.model) ?? null;
    entry.models.set(row.model, tech);
  }

  return [...byBrand.values()]
    .map((entry) => ({
      name: entry.name,
      models: [...entry.models.entries()]
        .map(([modelName, technology]) => ({ name: modelName, technology }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

const isDirect =
  process.argv[1]?.endsWith("printer-catalog.ts") ||
  process.argv[1]?.endsWith("printer-catalog.js");
if (isDirect) {
  ensurePrinterCatalog();
}
