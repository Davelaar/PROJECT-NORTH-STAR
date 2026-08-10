/**
 * One-shot: create exportable starter calibration profiles from OFD/catalog
 * manufacturer temperature ranges for standard nozzle diameters.
 * Not community-measured — clearly labeled.
 *
 * Nozzles: 0.2, 0.25, 0.4, 0.6, 0.8, 1.0 mm
 * Idempotent per product + nozzle size.
 */
import { eq } from "drizzle-orm";
import { v5 as uuidv5 } from "uuid";
import { createDb, resolveDbPath } from "./client.js";
import { ensureMigrated } from "./migrate.js";
import * as schema from "./schema.js";
import { rebuildSearchIndex } from "./search.js";

const NS = "6f7d485e-db8d-4979-904e-a231cd6602b2";
const STARTER_PRINTER_UUID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa01";
const STARTER_PLATE_UUID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa03";
const IMPORTER_USER_UUID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa04";

/** Standard nozzle sizes offered for catalog starter profiles. */
export const STARTER_NOZZLE_DIAMETERS_MM = [0.2, 0.25, 0.4, 0.6, 0.8, 1.0] as const;

function mid(min: number | null, max: number | null): number | null {
  if (min != null && max != null) return Math.round((min + max) / 2);
  return min ?? max ?? null;
}

function nozzleLabel(mm: number): string {
  return Number.isInteger(mm) ? String(mm) : String(mm);
}

export async function importOfdStarterProfiles(dbPath?: string): Promise<{
  created: number;
  skipped: number;
  nozzles: number[];
}> {
  ensureMigrated(dbPath);
  const db = createDb(dbPath);

  let user = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.uuid, IMPORTER_USER_UUID))
    .get();
  if (!user) {
    const existingAdmin = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, "admin"))
      .get();
    if (existingAdmin) {
      user = existingAdmin;
    } else {
      const [row] = db
        .insert(schema.users)
        .values({
          uuid: IMPORTER_USER_UUID,
          username: "catalog_importer",
          displayName: "Catalog importer",
          email: "catalog-importer@openfilament.local",
          passwordHash: "!",
          role: "administrator",
        })
        .returning()
        .all();
      user = row!;
    }
  }

  let printer = db
    .select()
    .from(schema.printerModels)
    .where(eq(schema.printerModels.uuid, STARTER_PRINTER_UUID))
    .get();
  if (!printer) {
    const [row] = db
      .insert(schema.printerModels)
      .values({
        uuid: STARTER_PRINTER_UUID,
        manufacturerName: "Generic",
        model: "FFF",
        revision: "1",
        slug: "generic-fff",
        notes:
          "Shared context for OFD catalog starter profiles (multiple nozzle sizes).",
        isSyntheticFixture: false,
      })
      .returning()
      .all();
    printer = row!;
  } else {
    db.update(schema.printerModels)
      .set({
        notes:
          "Shared context for OFD catalog starter profiles (0.2–1.0 mm nozzles).",
      })
      .where(eq(schema.printerModels.id, printer.id))
      .run();
  }

  const toolheadByMm = new Map<number, { id: number }>();
  for (const mm of STARTER_NOZZLE_DIAMETERS_MM) {
    const toolUuid = uuidv5(`ofd-starter-toolhead:${mm}`, NS);
    let toolhead = db
      .select()
      .from(schema.toolheadConfigs)
      .where(eq(schema.toolheadConfigs.uuid, toolUuid))
      .get();
    if (!toolhead) {
      const [row] = db
        .insert(schema.toolheadConfigs)
        .values({
          uuid: toolUuid,
          printerModelId: printer.id,
          hotendName: "Generic",
          nozzleDiameterMm: mm,
          nozzleMaterial: "brass",
          nozzleType: "standard",
        })
        .returning()
        .all();
      toolhead = row!;
    }
    toolheadByMm.set(mm, toolhead);
  }

  // Keep legacy 0.4 toolhead UUID in map if present (older imports)
  const legacyTool = db
    .select()
    .from(schema.toolheadConfigs)
    .where(eq(schema.toolheadConfigs.uuid, "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaa02"))
    .get();
  if (legacyTool && !toolheadByMm.has(0.4)) {
    toolheadByMm.set(0.4, legacyTool);
  }

  let plate = db
    .select()
    .from(schema.buildPlates)
    .where(eq(schema.buildPlates.uuid, STARTER_PLATE_UUID))
    .get();
  if (!plate) {
    const [row] = db
      .insert(schema.buildPlates)
      .values({
        uuid: STARTER_PLATE_UUID,
        name: "Generic PEI",
        slug: "generic-pei",
        surfaceKind: "smooth_pei",
      })
      .returning()
      .all();
    plate = row!;
  }

  const products = db
    .select({
      id: schema.filamentProducts.id,
      uuid: schema.filamentProducts.uuid,
      productName: schema.filamentProducts.productName,
      mfrNozzleTempMinC: schema.filamentProducts.mfrNozzleTempMinC,
      mfrNozzleTempMaxC: schema.filamentProducts.mfrNozzleTempMaxC,
      mfrBedTempMinC: schema.filamentProducts.mfrBedTempMinC,
      mfrBedTempMaxC: schema.filamentProducts.mfrBedTempMaxC,
      mfrChamberTempC: schema.filamentProducts.mfrChamberTempC,
      dryingTempC: schema.filamentProducts.dryingTempC,
      dryingDurationHours: schema.filamentProducts.dryingDurationHours,
      manufacturerName: schema.manufacturers.name,
    })
    .from(schema.filamentProducts)
    .innerJoin(
      schema.manufacturers,
      eq(schema.filamentProducts.manufacturerId, schema.manufacturers.id),
    )
    .all();

  let created = 0;
  let skipped = 0;

  for (const product of products) {
    const nozzleTemp = mid(product.mfrNozzleTempMinC, product.mfrNozzleTempMaxC);
    const bed = mid(product.mfrBedTempMinC, product.mfrBedTempMaxC);
    if (nozzleTemp == null || bed == null) {
      skipped += STARTER_NOZZLE_DIAMETERS_MM.length;
      continue;
    }

    const variant = db
      .select()
      .from(schema.filamentVariants)
      .where(eq(schema.filamentVariants.filamentProductId, product.id))
      .all()[0];
    if (!variant) {
      skipped += STARTER_NOZZLE_DIAMETERS_MM.length;
      continue;
    }

    for (const mm of STARTER_NOZZLE_DIAMETERS_MM) {
      const toolhead = toolheadByMm.get(mm);
      if (!toolhead) {
        skipped += 1;
        continue;
      }

      const profileUuid = uuidv5(
        `ofd-starter-profile:${product.uuid}:${mm}`,
        NS,
      );
      // Legacy single-nozzle (0.4) UUID from first import
      const legacyUuid =
        mm === 0.4
          ? uuidv5(`ofd-starter-profile:${product.uuid}`, NS)
          : null;

      const existing =
        db
          .select()
          .from(schema.calibrationProfiles)
          .where(eq(schema.calibrationProfiles.uuid, profileUuid))
          .get() ??
        (legacyUuid
          ? db
              .select()
              .from(schema.calibrationProfiles)
              .where(eq(schema.calibrationProfiles.uuid, legacyUuid))
              .get()
          : undefined);

      if (existing) {
        skipped += 1;
        continue;
      }

      const title = `${product.manufacturerName} ${product.productName} — catalog starter ${nozzleLabel(mm)} mm`;
      const [profile] = db
        .insert(schema.calibrationProfiles)
        .values({
          uuid: profileUuid,
          filamentVariantId: variant.id,
          printerModelId: printer.id,
          toolheadConfigId: toolhead.id,
          buildPlateId: plate.id,
          createdByUserId: user.id,
          title,
          isSyntheticFixture: false,
        })
        .returning()
        .all();

      const revUuid = uuidv5(`ofd-starter-rev:${product.uuid}:${mm}`, NS);
      const [rev] = db
        .insert(schema.calibrationRevisions)
        .values({
          uuid: revUuid,
          profileId: profile!.id,
          revisionNumber: 1,
          createdByUserId: user.id,
          status: "published",
          changelog: `OFD/catalog starter ${mm} mm from manufacturer temperature ranges`,
          slicerName: "OpenFilament",
          notes: `ofd-starter:${product.uuid}:${mm} — Manufacturer/catalog mid-range temps (not community-measured). Source: Open Filament Database.`,
          nozzleTempFirstLayerC: nozzleTemp,
          nozzleTempOtherLayersC: nozzleTemp,
          nozzleTempMinC: product.mfrNozzleTempMinC,
          nozzleTempMaxC: product.mfrNozzleTempMaxC,
          bedTempFirstLayerC: bed,
          bedTempOtherLayersC: bed,
          chamberTempC: product.mfrChamberTempC,
          dryingTempC: product.dryingTempC,
          dryingDurationHours: product.dryingDurationHours,
          isSyntheticFixture: false,
        })
        .returning()
        .all();

      db.update(schema.calibrationProfiles)
        .set({ currentRevisionId: rev!.id })
        .where(eq(schema.calibrationProfiles.id, profile!.id))
        .run();

      created += 1;
      if (created % 500 === 0) console.log(`  … ${created} starter profiles`);
    }
  }

  rebuildSearchIndex(db);
  console.log(
    `OFD starter profiles: created=${created}, skipped=${skipped}, nozzles=${STARTER_NOZZLE_DIAMETERS_MM.join(",")} → ${resolveDbPath(dbPath)}`,
  );
  return {
    created,
    skipped,
    nozzles: [...STARTER_NOZZLE_DIAMETERS_MM],
  };
}

const isDirect =
  process.argv[1]?.endsWith("import-ofd-starter-profiles.ts") ||
  process.argv[1]?.endsWith("import-ofd-starter-profiles.js");
if (isDirect) {
  importOfdStarterProfiles().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
