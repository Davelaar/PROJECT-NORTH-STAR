/**
 * Import public printer catalog from swordlab/open-3d-printer-database
 * (CC-BY-4.0). Maps FDM/SLA/SLS into OpenFilament printer_models.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { and, eq, or, isNull } from "drizzle-orm";
import { v5 as uuidv5 } from "uuid";
import {
  matchNormalizedName,
  normalizeNameKey,
} from "@open-filament/domain";
import { createDb, resolveDbPath } from "./client.js";
import { ensureMigrated } from "./migrate.js";
import * as schema from "./schema.js";
import { DEFAULT_NOZZLE_DIAMETERS_MM } from "./printer-catalog-data.js";
import { rebuildSearchIndex } from "./search.js";
import { canonicalPrinterBrand } from "./dedupe-brands.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const NS = "b2c3d4e5-f6a7-4890-b123-456789abcdef";

type O3dpPrinter = {
  full_name?: string;
  manufacturer?: string;
  model?: string;
  technology?: string;
  status?: string;
  specs?: {
    build_volume_mm?: { x?: number; y?: number; z?: number };
    build_volume_cm3?: number;
    nozzle_diameter_mm?: number;
    power_w?: number;
    heater_power_w?: number;
    max_speed_mm_s?: number;
    resolution_x?: number;
    resolution_y?: number;
    pixel_size_um?: number;
  };
  cost?: Record<string, unknown>;
  sources?: string[];
  temperatures?: {
    typical_bed_temp?: number;
    typical_nozzle_temp?: number;
  };
  contributed_by?: string;
};

/** Fix manufacturer/model splits and spelling variants in upstream data. */
const BRAND_FIXUPS: Array<{
  match: string;
  brand: string;
  modelPrefix?: string;
}> = [
  { match: "creality k1", brand: "Creality", modelPrefix: "K1" },
  { match: "elegoo neptune", brand: "Elegoo", modelPrefix: "Neptune" },
  { match: "flashforge", brand: "Flashforge" },
  { match: "flsun", brand: "Flsun" },
  { match: "prusa", brand: "Prusa Research" },
  { match: "prusa research", brand: "Prusa Research" },
  { match: "bambu", brand: "Bambu Lab" },
  { match: "bambu lab", brand: "Bambu Lab" },
  { match: "qidi", brand: "Qidi" },
  { match: "qidi tech", brand: "Qidi" },
  { match: "ultimaker", brand: "Ultimaker" },
  { match: "raise3d", brand: "Raise3D" },
  { match: "raise 3d", brand: "Raise3D" },
];

function mapTechnology(raw: string | undefined): string {
  const t = (raw ?? "").trim().toUpperCase();
  if (t === "FDM" || t === "FFF" || t === "FGF") return "fff";
  if (t === "SLA" || t === "MSLA" || t === "DLP" || t === "LCD" || t === "RESIN")
    return "resin";
  if (t === "SLS" || t === "MJF" || t === "BJ") return "sls";
  if (!t) return "other";
  return t.toLowerCase();
}

function technologyLabel(tech: string): string {
  switch (tech) {
    case "fff":
      return "FFF";
    case "resin":
      return "Resin";
    case "sls":
      return "SLS";
    default:
      return tech.toUpperCase();
  }
}

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

function stripBrandFromModel(brand: string, model: string): string {
  const escaped = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  let next = model
    .replace(new RegExp(`\\b${escaped}\\b`, "gi"), " ")
    .replace(/\s+/g, " ")
    .trim();
  const parts = next.split(" ").filter(Boolean);
  const deduped: string[] = [];
  for (const part of parts) {
    const prev = deduped[deduped.length - 1];
    if (prev && normalizeNameKey(prev) === normalizeNameKey(part)) continue;
    if (
      prev &&
      normalizeNameKey(part).startsWith(normalizeNameKey(prev)) &&
      normalizeNameKey(part).length > normalizeNameKey(prev).length
    ) {
      deduped[deduped.length - 1] = part;
      continue;
    }
    deduped.push(part);
  }
  return deduped.join(" ") || model.trim() || "Unknown";
}

function normalizeBrandModel(manufacturer: string, modelRaw: string): {
  brand: string;
  model: string;
} {
  const key = normalizeNameKey(manufacturer);
  for (const fix of BRAND_FIXUPS) {
    if (key === fix.match || key.startsWith(`${fix.match} `)) {
      const rest = modelRaw.trim();
      if (fix.modelPrefix) {
        const combined = rest
          ? `${fix.modelPrefix} ${rest}`.replace(/\s+/g, " ").trim()
          : fix.modelPrefix;
        return {
          brand: fix.brand,
          model: stripBrandFromModel(fix.brand, combined),
        };
      }
      return {
        brand: fix.brand,
        model: stripBrandFromModel(fix.brand, rest || manufacturer),
      };
    }
  }
  const candidates = BRAND_FIXUPS.map((f) => ({
    canonical: f.brand,
    keys: [f.match],
  }));
  const matched = matchNormalizedName(manufacturer, candidates);
  const brand = canonicalPrinterBrand(
    matched.canonical ?? manufacturer.trim(),
  );
  return {
    brand,
    model: stripBrandFromModel(brand, modelRaw.trim() || "Unknown"),
  };
}

function ensureToolheadsForTechnology(
  db: ReturnType<typeof createDb>,
  printerId: number,
  printerUuid: string,
  technology: string,
  defaultNozzleMm: number | null,
): void {
  if (technology === "fff") {
    const diameters = new Set<number>([...DEFAULT_NOZZLE_DIAMETERS_MM]);
    if (defaultNozzleMm && defaultNozzleMm > 0) diameters.add(defaultNozzleMm);
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
      db.insert(schema.toolheadConfigs)
        .values({
          uuid: uuidv5(`o3dp-tool:${printerUuid}:stock:${mm}`, NS),
          printerModelId: printerId,
          hotendName: "Stock",
          nozzleDiameterMm: mm,
          nozzleMaterial: "brass",
          nozzleType: "standard",
        })
        .run();
    }
    return;
  }

  // Non-FFF: one placeholder toolhead so profiles can still bind if needed.
  const hotendName = technology === "resin" ? "Vat" : "Standard";
  const existing = db
    .select()
    .from(schema.toolheadConfigs)
    .where(
      and(
        eq(schema.toolheadConfigs.printerModelId, printerId),
        eq(schema.toolheadConfigs.hotendName, hotendName),
      ),
    )
    .get();
  if (existing) return;
  db.insert(schema.toolheadConfigs)
    .values({
      uuid: uuidv5(`o3dp-tool:${printerUuid}:${hotendName}`, NS),
      printerModelId: printerId,
      hotendName,
      nozzleDiameterMm: 0,
      nozzleMaterial: technology === "resin" ? "n/a" : "n/a",
      nozzleType: technology,
    })
    .run();
}

export async function importOpenPrinterCatalog(
  dbPath?: string,
  catalogPath?: string,
): Promise<{ created: number; updated: number; total: number }> {
  ensureMigrated(dbPath);
  const db = createDb(dbPath);
  const resolvedCatalog =
    catalogPath ??
    process.env.OPEN_PRINTER_CATALOG_PATH ??
    path.resolve(__dirname, "../../../data/external/open-3d-printer-catalog.json");

  if (!fs.existsSync(resolvedCatalog)) {
    throw new Error(
      `Open printer catalog not found at ${resolvedCatalog}. Run ./scripts/fetch-open-printer-catalog.sh`,
    );
  }

  const raw = JSON.parse(fs.readFileSync(resolvedCatalog, "utf8")) as O3dpPrinter[];
  if (!Array.isArray(raw)) {
    throw new Error("Open printer catalog must be a JSON array");
  }

  let created = 0;
  let updated = 0;

  for (const entry of raw) {
    const mfrRaw = (entry.manufacturer ?? "").trim();
    const modelRaw = (entry.model ?? "").trim();
    if (!mfrRaw && !entry.full_name) continue;

    const { brand, model } = normalizeBrandModel(
      mfrRaw || "Unknown",
      modelRaw || entry.full_name || "Unknown",
    );
    if (!brand || !model) continue;

    const technology = mapTechnology(entry.technology);
    const specs = entry.specs ?? {};
    const bv = specs.build_volume_mm;
    const revision = "1";
    const uuid = uuidv5(`o3dp:${technology}:${brand}:${model}`, NS);
    const slugBase = slugify([brand, model, technology, revision]);

    let row = db
      .select()
      .from(schema.printerModels)
      .where(
        and(
          eq(schema.printerModels.manufacturerName, brand),
          eq(schema.printerModels.model, model),
          or(
            eq(schema.printerModels.revision, revision),
            isNull(schema.printerModels.revision),
          ),
        ),
      )
      .get();

    if (!row) {
      row = db
        .select()
        .from(schema.printerModels)
        .where(eq(schema.printerModels.uuid, uuid))
        .get();
    }

    const metadata = {
      fullName: entry.full_name ?? null,
      cost: entry.cost ?? null,
      sources: entry.sources ?? [],
      contributedBy: entry.contributed_by ?? null,
      buildVolumeCm3: specs.build_volume_cm3 ?? null,
      upstreamTechnology: entry.technology ?? null,
      attribution:
        "Open 3D Printer Database (CC-BY-4.0) — https://github.com/swordlab/open-3d-printer-database",
    };

    const values = {
      manufacturerName: brand,
      model,
      revision,
      buildVolumeXMm: bv?.x ?? null,
      buildVolumeYMm: bv?.y ?? null,
      buildVolumeZMm: bv?.z ?? null,
      technology,
      catalogStatus: entry.status ?? null,
      powerW: specs.power_w ?? null,
      heaterPowerW: specs.heater_power_w ?? null,
      maxSpeedMmS: specs.max_speed_mm_s ?? null,
      pixelSizeUm: specs.pixel_size_um ?? null,
      resolutionX: specs.resolution_x ?? null,
      resolutionY: specs.resolution_y ?? null,
      typicalNozzleTempC: entry.temperatures?.typical_nozzle_temp ?? null,
      typicalBedTempC: entry.temperatures?.typical_bed_temp ?? null,
      sourceType: "open_3d_printer_database",
      sourceReference:
        "https://github.com/swordlab/open-3d-printer-database (CC-BY-4.0)",
      metadataJson: JSON.stringify(metadata),
      notes: `${technologyLabel(technology)} printer from Open 3D Printer Database (CC-BY-4.0).`,
      isSyntheticFixture: false,
    };

    if (!row) {
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
      const [inserted] = db
        .insert(schema.printerModels)
        .values({ uuid, slug, ...values })
        .returning()
        .all();
      row = inserted!;
      created += 1;
    } else {
      db.update(schema.printerModels)
        .set({
          ...values,
          // Keep existing slug/uuid
        })
        .where(eq(schema.printerModels.id, row.id))
        .run();
      updated += 1;
      row = db
        .select()
        .from(schema.printerModels)
        .where(eq(schema.printerModels.id, row.id))
        .get()!;
    }

    ensureToolheadsForTechnology(
      db,
      row.id,
      row.uuid,
      technology,
      specs.nozzle_diameter_mm ?? null,
    );
  }

  rebuildSearchIndex(db);
  console.log(
    `Open printer catalog: created=${created}, updated=${updated}, total=${raw.length} → ${resolveDbPath(dbPath)}`,
  );
  return { created, updated, total: raw.length };
}

const isDirect =
  process.argv[1]?.endsWith("import-open-printers.ts") ||
  process.argv[1]?.endsWith("import-open-printers.js");
if (isDirect) {
  importOpenPrinterCatalog().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
