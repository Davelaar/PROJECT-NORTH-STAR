import { createDb, resolveDbPath } from "./client.js";
import { ensureMigrated } from "./migrate.js";
import * as schema from "./schema.js";
import { v4 as uuid } from "uuid";
import { hashPassword } from "./password.js";
import { rebuildSearchIndex } from "./search.js";
import fs from "node:fs";

export async function seed(dbPath?: string) {
  ensureMigrated(dbPath);
  const db = createDb(dbPath);

  const existing = db.select().from(schema.manufacturers).all();
  if (existing.length > 0) {
    console.log("Database already seeded; skipping.");
    return;
  }

  const adminPassword = await hashPassword("admin-change-me");
  const contributorPassword = await hashPassword("contributor-change-me");

  const [admin] = db
    .insert(schema.users)
    .values({
      uuid: uuid(),
      username: "admin",
      displayName: "Platform Admin",
      email: "admin@openfilament.local",
      passwordHash: adminPassword,
      role: "administrator",
      trustScore: 10,
      reputation: 100,
      locale: "en",
    })
    .returning()
    .all();

  const [contributor] = db
    .insert(schema.users)
    .values({
      uuid: uuid(),
      username: "fixture_contributor",
      displayName: "Fixture Contributor",
      email: "contributor@openfilament.local",
      passwordHash: contributorPassword,
      role: "trusted_contributor",
      trustScore: 5,
      reputation: 40,
      locale: "en",
    })
    .returning()
    .all();

  if (!admin || !contributor) throw new Error("Failed to seed users");

  const [flashforge] = db
    .insert(schema.manufacturers)
    .values({
      uuid: "11111111-1111-4111-8111-111111111101",
      name: "Flashforge",
      slug: "flashforge",
      website: "https://www.flashforge.com",
      country: "CN",
      description: "3D printer and filament manufacturer",
      verified: true,
      isSyntheticFixture: true,
    })
    .returning()
    .all();

  db.insert(schema.manufacturerAliases)
    .values([
      {
        manufacturerId: flashforge!.id,
        alias: "FlashForge",
        normalizedAlias: "flashforge",
      },
      {
        manufacturerId: flashforge!.id,
        alias: "Zhejiang Flashforge",
        normalizedAlias: "zhejiang flashforge",
      },
    ])
    .run();

  const [crealityMfr] = db
    .insert(schema.manufacturers)
    .values({
      uuid: "11111111-1111-4111-8111-111111111102",
      name: "Creality",
      slug: "creality",
      website: "https://www.creality.com",
      country: "CN",
      verified: true,
      isSyntheticFixture: true,
    })
    .returning()
    .all();

  const materials = [
    { code: "PLA", name: "PLA", category: "commodity", parent: null as string | null },
    { code: "PLA_SILK", name: "PLA Silk", category: "commodity", parent: "PLA" },
    { code: "PETG", name: "PETG", category: "commodity", parent: null },
    { code: "ASA", name: "ASA", category: "engineering", parent: null },
    { code: "ABS", name: "ABS", category: "engineering", parent: null },
    { code: "PA", name: "PA", category: "engineering", parent: null },
    { code: "PA6", name: "PA6", category: "engineering", parent: "PA" },
    { code: "PA6_CF", name: "PA6-CF", category: "composite", parent: "PA6" },
    { code: "TPU", name: "TPU", category: "flexible", parent: null },
  ] as const;

  const materialIds = new Map<string, number>();
  for (const m of materials) {
    const [row] = db
      .insert(schema.materialFamilies)
      .values({
        uuid: uuid(),
        code: m.code,
        name: m.name,
        category: m.category,
        parentMaterialId: m.parent ? materialIds.get(m.parent) ?? null : null,
      })
      .returning()
      .all();
    materialIds.set(m.code, row!.id);
  }

  const [asaProduct] = db
    .insert(schema.filamentProducts)
    .values({
      uuid: "22222222-2222-4222-8222-222222222201",
      manufacturerId: flashforge!.id,
      materialFamilyId: materialIds.get("ASA")!,
      productName: "ASA",
      productLine: "Standard",
      slug: "asa",
      description:
        "Flashforge ASA product family. Catalog temperatures from seed; replace with datasheet-backed values when available.",
      diameterMm: 1.75,
      nominalSpoolWeightG: 1000,
      densityGCm3: 1.07,
      mfrNozzleTempMinC: 240,
      mfrNozzleTempMaxC: 260,
      mfrBedTempMinC: 90,
      mfrBedTempMaxC: 110,
      dryingTempC: 80,
      dryingDurationHours: 4,
      abrasive: false,
      hygroscopicRating: "moderate",
      sourceType: "synthetic_fixture",
      sourceReference: "open-filament seed",
      verified: false,
      createdByUserId: admin.id,
      isSyntheticFixture: true,
    })
    .returning()
    .all();

  const [burntTitanium] = db
    .insert(schema.filamentVariants)
    .values({
      uuid: "33333333-3333-4333-8333-333333333301",
      filamentProductId: asaProduct!.id,
      variantName: "Burnt Titanium",
      slug: "burnt-titanium",
      colorName: "Burnt Titanium",
      primaryColorHex: "#6B5E54",
      secondaryColorHex: "#A09080",
      finish: "metallic",
      translucency: "opaque",
      appearanceKind: "solid",
      manufacturerSku: "FF-ASA-BT-SYN",
      ean: "0000000000000",
      spoolWeightG: 1000,
      notes: "Seed catalog variant — refine with packaging/SKU evidence.",
      verified: false,
      isSyntheticFixture: true,
    })
    .returning()
    .all();

  const [k2plus] = db
    .insert(schema.printerModels)
    .values({
      uuid: "44444444-4444-4444-8444-444444444401",
      manufacturerName: "Creality",
      model: "K2 Plus",
      revision: "1",
      slug: "creality-k2-plus",
      buildVolumeXMm: 350,
      buildVolumeYMm: 350,
      buildVolumeZMm: 350,
      firmwareFamily: "Creality OS",
      kinematics: "corexy",
      maxNozzleTempC: 350,
      maxBedTempC: 120,
      chamberCapable: true,
      extruderType: "direct_drive",
      notes: "Seed printer context for K2 Plus calibrations",
      isSyntheticFixture: true,
    })
    .returning()
    .all();

  const [toolhead] = db
    .insert(schema.toolheadConfigs)
    .values({
      uuid: "55555555-5555-4555-8555-555555555501",
      printerModelId: k2plus!.id,
      hotendName: "Stock",
      hotendRevision: "1",
      nozzleDiameterMm: 0.6,
      nozzleMaterial: "hardened_steel",
      nozzleType: "standard",
      highFlow: false,
      aftermarket: false,
    })
    .returning()
    .all();

  const [pei] = db
    .insert(schema.buildPlates)
    .values({
      uuid: uuid(),
      name: "Textured PEI",
      slug: "textured-pei",
      surfaceKind: "textured_pei",
    })
    .returning()
    .all();

  const [profile] = db
    .insert(schema.calibrationProfiles)
    .values({
      uuid: "66666666-6666-4666-8666-666666666601",
      filamentVariantId: burntTitanium!.id,
      printerModelId: k2plus!.id,
      toolheadConfigId: toolhead!.id,
      buildPlateId: pei!.id,
      createdByUserId: contributor.id,
      title: "TEST Flashforge ASA Burnt Titanium — K2 Plus 0.6",
      isSyntheticFixture: true,
    })
    .returning()
    .all();

  const [rev] = db
    .insert(schema.calibrationRevisions)
    .values({
      uuid: "77777777-7777-4777-8777-777777777701",
      profileId: profile!.id,
      revisionNumber: 1,
      createdByUserId: contributor.id,
      status: "published",
      changelog: "Initial SYNTHETIC TEST fixture revision",
      slicerName: "Creality Print",
      slicerVersion: "6.0-TEST",
      filamentDryingState: "dried",
      userConfidence: 0.8,
      notes: "Seed calibration values for local development — replace with measured submissions.",
      nozzleTempFirstLayerC: 255,
      nozzleTempOtherLayersC: 255,
      bedTempFirstLayerC: 100,
      bedTempOtherLayersC: 100,
      chamberTempC: 45,
      enclosureRecommended: true,
      flowRatio: 0.95,
      pressureAdvance: 0.03,
      maxVolumetricFlowMm3s: 28,
      fanMinPercent: 0,
      fanMaxPercent: 40,
      bridgeFanPercent: 50,
      fanDisableFirstLayers: 3,
      retractionDistanceMm: 0.8,
      retractionSpeedMms: 30,
      dryingTempC: 80,
      dryingDurationHours: 4,
      prePrintDryingRequired: true,
      brimRecommended: true,
      qualityScore: 0.72,
      isSyntheticFixture: true,
    })
    .returning()
    .all();

  const { eq } = await import("drizzle-orm");
  db.update(schema.calibrationProfiles)
    .set({ currentRevisionId: rev!.id })
    .where(eq(schema.calibrationProfiles.id, profile!.id))
    .run();

  db.insert(schema.rawObservations)
    .values({
      uuid: uuid(),
      revisionId: rev!.id,
      testType: "max_volumetric_flow",
      testStart: 10,
      testEnd: 35,
      increment: 1,
      observedLimit: 31,
      chosenOperatingLimit: 28,
      safetyMargin: 3,
      unit: "mm3/s",
      notes: "SYNTHETIC observation fixture",
    })
    .run();

  // Extra synthetic submissions for aggregation demo (including outlier)
  const flows = [29, 30, 31, 31, 45];
  for (const [i, flow] of flows.entries()) {
    const [p] = db
      .insert(schema.calibrationProfiles)
      .values({
        uuid: uuid(),
        filamentVariantId: burntTitanium!.id,
        printerModelId: k2plus!.id,
        toolheadConfigId: toolhead!.id,
        buildPlateId: pei!.id,
        createdByUserId: contributor.id,
        title: `TEST aggregate sample ${i + 1}`,
        isSyntheticFixture: true,
      })
      .returning()
      .all();
    const [r] = db
      .insert(schema.calibrationRevisions)
      .values({
        uuid: uuid(),
        profileId: p!.id,
        revisionNumber: 1,
        createdByUserId: contributor.id,
        status: "published",
        nozzleTempOtherLayersC: 255,
        bedTempOtherLayersC: 100,
        flowRatio: 0.95,
        pressureAdvance: 0.03,
        maxVolumetricFlowMm3s: flow,
        isSyntheticFixture: true,
        notes: "SYNTHETIC aggregation sample",
      })
      .returning()
      .all();
    db.update(schema.calibrationProfiles)
      .set({ currentRevisionId: r!.id })
      .where(eq(schema.calibrationProfiles.id, p!.id))
      .run();
  }

  const [cfs] = db
    .insert(schema.rfidSchemes)
    .values({
      uuid: "88888888-8888-4888-8888-888888888801",
      name: "Creality CFS Compatible",
      vendor: "Creality",
      version: "research-stub-0",
      tagTechnology: "ISO14443A",
      tagCapacityBytes: null,
      requiresAuthentication: true,
      encodingVersion: "unknown",
      status: "active",
      notes:
        "Creality CFS-compatible scheme. Codec implements community-verified AES-128-ECB sector payload (see docs/CREALITY_CFS_RFID.md).",
    })
    .returning()
    .all();

  db.insert(schema.rfidMappings)
    .values({
      uuid: uuid(),
      filamentVariantId: burntTitanium!.id,
      rfidSchemeId: cfs!.id,
      materialIdentifier: "100007",
      colorEncoding: "#6B5E54",
      lossyColorMapping: true,
      compatibilityNotes:
        "SYNTHETIC mapping placeholder — not a verified CFS color ID",
    })
    .run();

  rebuildSearchIndex(db);

  void crealityMfr;
  console.log(`Seeded synthetic fixtures into ${resolveDbPath(dbPath)}`);
  console.log("Users: admin / admin-change-me ; fixture_contributor / contributor-change-me");
}

const isDirect = process.argv[1]?.endsWith("seed.ts") || process.argv[1]?.endsWith("seed.js");
if (isDirect) {
  seed().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
