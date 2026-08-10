import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

const timestamps = {
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
};

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uuid: text("uuid").notNull().unique(),
  username: text("username").notNull().unique(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  role: text("role", {
    enum: [
      "anonymous",
      "registered",
      "trusted_contributor",
      "moderator",
      "administrator",
    ],
  })
    .notNull()
    .default("registered"),
  trustScore: real("trust_score").notNull().default(1),
  reputation: real("reputation").notNull().default(0),
  status: text("status", {
    enum: ["active", "suspended", "deleted"],
  })
    .notNull()
    .default("active"),
  locale: text("locale").notNull().default("en"),
  emailVerifiedAt: text("email_verified_at"),
  deletedAt: text("deleted_at"),
  ...timestamps,
});

export const apiTokens = sqliteTable(
  "api_tokens",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    name: text("name").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    scopes: text("scopes").notNull(), // JSON array
    expiresAt: text("expires_at"),
    revokedAt: text("revoked_at"),
    lastUsedAt: text("last_used_at"),
    userAgent: text("user_agent"),
    ...timestamps,
  },
  (t) => [index("api_tokens_user_idx").on(t.userId)],
);

export const manufacturers = sqliteTable("manufacturers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uuid: text("uuid").notNull().unique(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  website: text("website"),
  country: text("country"),
  description: text("description"),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  logoRef: text("logo_ref"),
  isSyntheticFixture: integer("is_synthetic_fixture", { mode: "boolean" })
    .notNull()
    .default(false),
  ...timestamps,
});

export const manufacturerAliases = sqliteTable(
  "manufacturer_aliases",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    manufacturerId: integer("manufacturer_id")
      .notNull()
      .references(() => manufacturers.id),
    alias: text("alias").notNull(),
    normalizedAlias: text("normalized_alias").notNull(),
  },
  (t) => [
    uniqueIndex("manufacturer_alias_unique").on(t.normalizedAlias),
    index("manufacturer_alias_mfr_idx").on(t.manufacturerId),
  ],
);

export const materialFamilies = sqliteTable("material_families", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uuid: text("uuid").notNull().unique(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  parentMaterialId: integer("parent_material_id"),
  category: text("category"),
  typicalProperties: text("typical_properties"), // JSON
  ...timestamps,
});

export const materialAliases = sqliteTable(
  "material_aliases",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    materialFamilyId: integer("material_family_id")
      .notNull()
      .references(() => materialFamilies.id),
    alias: text("alias").notNull(),
    normalizedAlias: text("normalized_alias").notNull(),
  },
  (t) => [uniqueIndex("material_alias_unique").on(t.normalizedAlias)],
);

export const filamentProducts = sqliteTable(
  "filament_products",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    manufacturerId: integer("manufacturer_id")
      .notNull()
      .references(() => manufacturers.id),
    materialFamilyId: integer("material_family_id")
      .notNull()
      .references(() => materialFamilies.id),
    productName: text("product_name").notNull(),
    productLine: text("product_line"),
    slug: text("slug").notNull(),
    description: text("description"),
    diameterMm: real("diameter_mm").notNull().default(1.75),
    diameterToleranceMm: real("diameter_tolerance_mm"),
    minNozzleDiameterMm: real("min_nozzle_diameter_mm"),
    nominalSpoolWeightG: real("nominal_spool_weight_g"),
    densityGCm3: real("density_g_cm3"),
    datasheetUrl: text("datasheet_url"),
    safetySheetUrl: text("safety_sheet_url"),
    mfrNozzleTempMinC: real("mfr_nozzle_temp_min_c"),
    mfrNozzleTempMaxC: real("mfr_nozzle_temp_max_c"),
    mfrBedTempMinC: real("mfr_bed_temp_min_c"),
    mfrBedTempMaxC: real("mfr_bed_temp_max_c"),
    mfrChamberTempC: real("mfr_chamber_temp_c"),
    mfrChamberTempMinC: real("mfr_chamber_temp_min_c"),
    mfrChamberTempMaxC: real("mfr_chamber_temp_max_c"),
    mfrPreheatTempC: real("mfr_preheat_temp_c"),
    dryingTempC: real("drying_temp_c"),
    dryingDurationHours: real("drying_duration_hours"),
    /** Manufacturer / catalog shrinkage claims (%). Community values live on revisions. */
    shrinkagePercentXy: real("shrinkage_percent_xy"),
    shrinkagePercentZ: real("shrinkage_percent_z"),
    shoreHardnessA: real("shore_hardness_a"),
    shoreHardnessD: real("shore_hardness_d"),
    storageRecommendation: text("storage_recommendation"),
    abrasive: integer("abrasive", { mode: "boolean" }).notNull().default(false),
    hygroscopicRating: text("hygroscopic_rating"),
    foodContactDocumented: integer("food_contact_documented", {
      mode: "boolean",
    }),
    /** JSON: OFD/material slicer hint blobs (temps, profile names) — not calibrations. */
    catalogSlicerHintsJson: text("catalog_slicer_hints_json"),
    sourceType: text("source_type"),
    sourceReference: text("source_reference"),
    verified: integer("verified", { mode: "boolean" }).notNull().default(false),
    createdByUserId: integer("created_by_user_id").references(() => users.id),
    isSyntheticFixture: integer("is_synthetic_fixture", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("filament_product_slug_unique").on(t.manufacturerId, t.slug),
    index("filament_product_mfr_idx").on(t.manufacturerId),
    index("filament_product_material_idx").on(t.materialFamilyId),
  ],
);

export const filamentVariants = sqliteTable(
  "filament_variants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    filamentProductId: integer("filament_product_id")
      .notNull()
      .references(() => filamentProducts.id),
    variantName: text("variant_name").notNull(),
    slug: text("slug").notNull(),
    colorName: text("color_name"),
    primaryColorHex: text("primary_color_hex"),
    secondaryColorHex: text("secondary_color_hex"),
    finish: text("finish"),
    translucency: text("translucency"),
    glitter: integer("glitter", { mode: "boolean" }).notNull().default(false),
    silk: integer("silk", { mode: "boolean" }).notNull().default(false),
    matte: integer("matte", { mode: "boolean" }).notNull().default(false),
    glowInDark: integer("glow_in_dark", { mode: "boolean" })
      .notNull()
      .default(false),
    carbonFilled: integer("carbon_filled", { mode: "boolean" })
      .notNull()
      .default(false),
    glassFilled: integer("glass_filled", { mode: "boolean" })
      .notNull()
      .default(false),
    woodFilled: integer("wood_filled", { mode: "boolean" })
      .notNull()
      .default(false),
    metalFilled: integer("metal_filled", { mode: "boolean" })
      .notNull()
      .default(false),
    appearanceKind: text("appearance_kind").notNull().default("solid"),
    manufacturerSku: text("manufacturer_sku"),
    ean: text("ean"),
    upc: text("upc"),
    gtin: text("gtin"),
    /** Optional product photo URL (HTTPS). Color swatch is the fallback preview. */
    previewImageUrl: text("preview_image_url"),
    /** JSON array: { storeName, url, storeSlug? }[] from catalog buy links. */
    purchaseLinksJson: text("purchase_links_json"),
    spoolWeightG: real("spool_weight_g"),
    spoolMaterial: text("spool_material"),
    notes: text("notes"),
    discontinued: integer("discontinued", { mode: "boolean" })
      .notNull()
      .default(false),
    verified: integer("verified", { mode: "boolean" }).notNull().default(false),
    isSyntheticFixture: integer("is_synthetic_fixture", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("filament_variant_slug_unique").on(t.filamentProductId, t.slug),
    index("filament_variant_product_idx").on(t.filamentProductId),
    index("filament_variant_ean_idx").on(t.ean),
    index("filament_variant_sku_idx").on(t.manufacturerSku),
  ],
);

export const printerModels = sqliteTable(
  "printer_models",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    manufacturerName: text("manufacturer_name").notNull(),
    model: text("model").notNull(),
    revision: text("revision"),
    slug: text("slug").notNull().unique(),
    buildVolumeXMm: real("build_volume_x_mm"),
    buildVolumeYMm: real("build_volume_y_mm"),
    buildVolumeZMm: real("build_volume_z_mm"),
    firmwareFamily: text("firmware_family"),
    kinematics: text("kinematics"),
    /** Printing technology: fff | resin | sls | other */
    technology: text("technology"),
    /** Upstream catalog status e.g. current / discontinued */
    catalogStatus: text("catalog_status"),
    powerW: real("power_w"),
    heaterPowerW: real("heater_power_w"),
    maxSpeedMmS: real("max_speed_mm_s"),
    pixelSizeUm: real("pixel_size_um"),
    resolutionX: integer("resolution_x"),
    resolutionY: integer("resolution_y"),
    typicalNozzleTempC: real("typical_nozzle_temp_c"),
    typicalBedTempC: real("typical_bed_temp_c"),
    sourceType: text("source_type"),
    sourceReference: text("source_reference"),
    /** JSON extras (cost, sources list, full_name, …) */
    metadataJson: text("metadata_json"),
    maxNozzleTempC: real("max_nozzle_temp_c"),
    maxBedTempC: real("max_bed_temp_c"),
    chamberCapable: integer("chamber_capable", { mode: "boolean" })
      .notNull()
      .default(false),
    extruderType: text("extruder_type"),
    notes: text("notes"),
    isSyntheticFixture: integer("is_synthetic_fixture", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("printer_model_unique").on(
      t.manufacturerName,
      t.model,
      t.revision,
    ),
  ],
);

export const toolheadConfigs = sqliteTable(
  "toolhead_configs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    printerModelId: integer("printer_model_id")
      .notNull()
      .references(() => printerModels.id),
    hotendName: text("hotend_name").notNull(),
    hotendRevision: text("hotend_revision"),
    heaterCapability: text("heater_capability"),
    extruder: text("extruder"),
    nozzleDiameterMm: real("nozzle_diameter_mm").notNull(),
    nozzleMaterial: text("nozzle_material"),
    nozzleType: text("nozzle_type"),
    highFlow: integer("high_flow", { mode: "boolean" }).notNull().default(false),
    aftermarket: integer("aftermarket", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (t) => [
    index("toolhead_printer_idx").on(t.printerModelId),
    index("toolhead_nozzle_idx").on(t.nozzleDiameterMm),
  ],
);

export const buildPlates = sqliteTable("build_plates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uuid: text("uuid").notNull().unique(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  surfaceKind: text("surface_kind").notNull(),
  notes: text("notes"),
  ...timestamps,
});

export const calibrationProfiles = sqliteTable(
  "calibration_profiles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    filamentVariantId: integer("filament_variant_id")
      .notNull()
      .references(() => filamentVariants.id),
    printerModelId: integer("printer_model_id")
      .notNull()
      .references(() => printerModels.id),
    toolheadConfigId: integer("toolhead_config_id")
      .notNull()
      .references(() => toolheadConfigs.id),
    buildPlateId: integer("build_plate_id").references(() => buildPlates.id),
    createdByUserId: integer("created_by_user_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    currentRevisionId: integer("current_revision_id"),
    /** Net thumbs score (up − down). Community-verified when ≥ 5. */
    voteScore: integer("vote_score").notNull().default(0),
    voteUpCount: integer("vote_up_count").notNull().default(0),
    voteDownCount: integer("vote_down_count").notNull().default(0),
    communityVerified: integer("community_verified", { mode: "boolean" })
      .notNull()
      .default(false),
    isSyntheticFixture: integer("is_synthetic_fixture", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (t) => [
    index("profile_variant_idx").on(t.filamentVariantId),
    index("profile_printer_idx").on(t.printerModelId),
    index("profile_toolhead_idx").on(t.toolheadConfigId),
    index("profile_vote_score_idx").on(t.voteScore),
  ],
);

export const calibrationRevisions = sqliteTable(
  "calibration_revisions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    profileId: integer("profile_id")
      .notNull()
      .references(() => calibrationProfiles.id),
    revisionNumber: integer("revision_number").notNull(),
    parentRevisionId: integer("parent_revision_id"),
    forkedFromRevisionId: integer("forked_from_revision_id"),
    createdByUserId: integer("created_by_user_id")
      .notNull()
      .references(() => users.id),
    status: text("status", {
      enum: [
        "draft",
        "published",
        "superseded",
        "deprecated",
        "rejected",
        "archived",
      ],
    })
      .notNull()
      .default("draft"),
    changelog: text("changelog"),
    slicerName: text("slicer_name"),
    slicerVersion: text("slicer_version"),
    firmwareVersion: text("firmware_version"),
    batchLot: text("batch_lot"),
    ambientTempC: real("ambient_temp_c"),
    ambientRhPercent: real("ambient_rh_percent"),
    filamentDryingState: text("filament_drying_state"),
    userConfidence: real("user_confidence"),
    notes: text("notes"),
    // Thermal (null = unknown — never store 0 as unknown)
    nozzleTempFirstLayerC: real("nozzle_temp_first_layer_c"),
    nozzleTempOtherLayersC: real("nozzle_temp_other_layers_c"),
    nozzleTempMinC: real("nozzle_temp_min_c"),
    nozzleTempMaxC: real("nozzle_temp_max_c"),
    bedTempFirstLayerC: real("bed_temp_first_layer_c"),
    bedTempOtherLayersC: real("bed_temp_other_layers_c"),
    chamberTempC: real("chamber_temp_c"),
    enclosureRecommended: integer("enclosure_recommended", { mode: "boolean" }),
    /** True when an active chamber heater was used during the test. */
    chamberHeaterActive: integer("chamber_heater_active", { mode: "boolean" })
      .notNull()
      .default(false),
    // Extrusion
    flowRatio: real("flow_ratio"),
    pressureAdvance: real("pressure_advance"),
    linearAdvance: real("linear_advance"),
    maxVolumetricFlowMm3s: real("max_volumetric_flow_mm3s"),
    minVolumetricFlowMm3s: real("min_volumetric_flow_mm3s"),
    // Cooling
    fanMinPercent: real("fan_min_percent"),
    fanMaxPercent: real("fan_max_percent"),
    bridgeFanPercent: real("bridge_fan_percent"),
    fanDisableFirstLayers: integer("fan_disable_first_layers"),
    // Retraction
    retractionDistanceMm: real("retraction_distance_mm"),
    retractionSpeedMms: real("retraction_speed_mms"),
    deretractionSpeedMms: real("deretraction_speed_mms"),
    wipe: integer("wipe", { mode: "boolean" }),
    zHopMm: real("z_hop_mm"),
    // Speed limits (filament-specific)
    recommendedOuterWallMaxMms: real("recommended_outer_wall_max_mms"),
    recommendedBridgeSpeedMms: real("recommended_bridge_speed_mms"),
    // Dimensional (slicer filament shrinkage)
    shrinkagePercentXy: real("shrinkage_percent_xy"),
    shrinkagePercentZ: real("shrinkage_percent_z"),
    // Preparation
    dryingTempC: real("drying_temp_c"),
    dryingDurationHours: real("drying_duration_hours"),
    recommendedMaxRhPercent: real("recommended_max_rh_percent"),
    prePrintDryingRequired: integer("pre_print_drying_required", {
      mode: "boolean",
    }),
    annealingNotes: text("annealing_notes"),
    postProcessingNotes: text("post_processing_notes"),
    adhesiveRecommendation: text("adhesive_recommendation"),
    brimRecommended: integer("brim_recommended", { mode: "boolean" }),
    buildSurfaceNotes: text("build_surface_notes"),
    qualityScore: real("quality_score"),
    isSyntheticFixture: integer("is_synthetic_fixture", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("revision_number_unique").on(t.profileId, t.revisionNumber),
    index("revision_profile_idx").on(t.profileId),
    index("revision_status_idx").on(t.status),
  ],
);

export const rawObservations = sqliteTable(
  "raw_observations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    revisionId: integer("revision_id")
      .notNull()
      .references(() => calibrationRevisions.id),
    testType: text("test_type").notNull(),
    testStart: real("test_start"),
    testEnd: real("test_end"),
    increment: real("increment"),
    observedLimit: real("observed_limit"),
    chosenOperatingLimit: real("chosen_operating_limit"),
    safetyMargin: real("safety_margin"),
    unit: text("unit"),
    notes: text("notes"),
    ...timestamps,
  },
  (t) => [index("observation_revision_idx").on(t.revisionId)],
);

export const evidenceAssets = sqliteTable("evidence_assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uuid: text("uuid").notNull().unique(),
  revisionId: integer("revision_id")
    .notNull()
    .references(() => calibrationRevisions.id),
  observationId: integer("observation_id").references(() => rawObservations.id),
  kind: text("kind").notNull(),
  mimeType: text("mime_type").notNull(),
  storageKey: text("storage_key").notNull(),
  byteSize: integer("byte_size"),
  caption: text("caption"),
  ...timestamps,
});

export const profileConfirmations = sqliteTable(
  "profile_confirmations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    revisionId: integer("revision_id")
      .notNull()
      .references(() => calibrationRevisions.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    printerModelId: integer("printer_model_id").references(() => printerModels.id),
    toolheadConfigId: integer("toolhead_config_id").references(
      () => toolheadConfigs.id,
    ),
    notes: text("notes"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("confirmation_unique").on(t.revisionId, t.userId),
    index("confirmation_revision_idx").on(t.revisionId),
  ],
);

export const profileFailureReports = sqliteTable(
  "profile_failure_reports",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    revisionId: integer("revision_id")
      .notNull()
      .references(() => calibrationRevisions.id),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id),
    category: text("category").notNull(),
    notes: text("notes"),
    ...timestamps,
  },
  (t) => [index("failure_revision_idx").on(t.revisionId)],
);

/** Thumbs up (+1) / thumbs down (−1) on a calibration profile. */
export const profileVotes = sqliteTable(
  "profile_votes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    profileId: integer("profile_id")
      .notNull()
      .references(() => calibrationProfiles.id, { onDelete: "cascade" }),
    /** Logged-in voter when present. */
    userId: integer("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    /**
     * Stable voter key: `user:<id>` or `anon:<fingerprint>`.
     * One vote per profile per voterKey (upsert / flip).
     */
    voterKey: text("voter_key").notNull(),
    value: integer("value").notNull(),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("profile_vote_unique").on(t.profileId, t.voterKey),
    index("profile_vote_profile_idx").on(t.profileId),
  ],
);

export const rfidSchemes = sqliteTable("rfid_schemes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  uuid: text("uuid").notNull().unique(),
  name: text("name").notNull(),
  vendor: text("vendor").notNull(),
  version: text("version").notNull(),
  tagTechnology: text("tag_technology"),
  tagCapacityBytes: integer("tag_capacity_bytes"),
  requiresAuthentication: integer("requires_authentication", {
    mode: "boolean",
  })
    .notNull()
    .default(false),
  encodingVersion: text("encoding_version"),
  status: text("status", { enum: ["active", "deprecated"] })
    .notNull()
    .default("active"),
  notes: text("notes"),
  ...timestamps,
});

export const rfidMappings = sqliteTable(
  "rfid_mappings",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    filamentVariantId: integer("filament_variant_id")
      .notNull()
      .references(() => filamentVariants.id),
    rfidSchemeId: integer("rfid_scheme_id")
      .notNull()
      .references(() => rfidSchemes.id),
    materialIdentifier: text("material_identifier"),
    colorEncoding: text("color_encoding"),
    vendorSpecificJson: text("vendor_specific_json"),
    lossyColorMapping: integer("lossy_color_mapping", { mode: "boolean" })
      .notNull()
      .default(false),
    compatibilityNotes: text("compatibility_notes"),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("rfid_mapping_unique").on(t.filamentVariantId, t.rfidSchemeId),
  ],
);

export const auditLog = sqliteTable(
  "audit_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    actorUserId: integer("actor_user_id").references(() => users.id),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityUuid: text("entity_uuid"),
    reason: text("reason"),
    metadataJson: text("metadata_json"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index("audit_entity_idx").on(t.entityType, t.entityUuid)],
);

export const searchDocuments = sqliteTable(
  "search_documents",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    entityType: text("entity_type").notNull(),
    entityUuid: text("entity_uuid").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    normalized: text("normalized").notNull(),
  },
  (t) => [
    uniqueIndex("search_entity_unique").on(t.entityType, t.entityUuid),
    index("search_normalized_idx").on(t.normalized),
  ],
);

export const SPOOL_STATUSES = [
  "sealed",
  "open",
  "active",
  "drying",
  "stored",
  "low",
  "empty",
  "archived",
] as const;

export type SpoolStatus = (typeof SPOOL_STATUSES)[number];

/** Cloud-synced personal spool inventory. Private; ownership enforced in API. */
export const userSpools = sqliteTable(
  "user_spools",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    /** Client-generated id for idempotent sync / import dedupe. */
    clientId: text("client_id"),
    manufacturerUuid: text("manufacturer_uuid"),
    manufacturerName: text("manufacturer_name"),
    productUuid: text("product_uuid"),
    productName: text("product_name"),
    variantUuid: text("variant_uuid"),
    variantName: text("variant_name"),
    colorHex: text("color_hex"),
    materialCode: text("material_code"),
    initialNetWeightG: real("initial_net_weight_g"),
    currentWeightG: real("current_weight_g"),
    tareWeightG: real("tare_weight_g"),
    remainingPercent: real("remaining_percent"),
    purchaseDate: text("purchase_date"),
    openedDate: text("opened_date"),
    batchLot: text("batch_lot"),
    notes: text("notes"),
    storageLocation: text("storage_location"),
    status: text("status", { enum: SPOOL_STATUSES }).notNull().default("sealed"),
    preferredPrinterUuid: text("preferred_printer_uuid"),
    preferredNozzleMm: real("preferred_nozzle_mm"),
    archivedAt: text("archived_at"),
    deletedAt: text("deleted_at"),
    syncVersion: integer("sync_version").notNull().default(1),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("user_spools_user_client_unique").on(t.userId, t.clientId),
    index("user_spools_user_idx").on(t.userId),
    index("user_spools_status_idx").on(t.userId, t.status),
  ],
);

export const userSpoolDryingEvents = sqliteTable(
  "user_spool_drying_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    spoolId: integer("spool_id")
      .notNull()
      .references(() => userSpools.id, { onDelete: "cascade" }),
    startedAt: text("started_at").notNull(),
    endedAt: text("ended_at"),
    tempC: real("temp_c"),
    durationHours: real("duration_hours"),
    notes: text("notes"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index("user_spool_drying_spool_idx").on(t.spoolId)],
);

export const userSpoolIdentities = sqliteTable(
  "user_spool_identities",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    spoolId: integer("spool_id")
      .notNull()
      .references(() => userSpools.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["qr", "rfid"] }).notNull(),
    value: text("value").notNull(),
    label: text("label"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    uniqueIndex("user_spool_identities_kind_value").on(t.kind, t.value),
    index("user_spool_identities_spool_idx").on(t.spoolId),
  ],
);

export const userPrivacyPrefs = sqliteTable("user_privacy_prefs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  consentVersion: text("consent_version").notNull(),
  analytics: integer("analytics", { mode: "boolean" }).notNull().default(false),
  marketing: integer("marketing", { mode: "boolean" }).notNull().default(false),
  preferences: integer("preferences", { mode: "boolean" })
    .notNull()
    .default(true),
  locale: text("locale").notNull().default("en"),
  decidedAt: text("decided_at").notNull(),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const accountDeletionJobs = sqliteTable(
  "account_deletion_jobs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", {
      enum: ["pending", "completed", "failed"],
    })
      .notNull()
      .default("pending"),
    requestedAt: text("requested_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    completedAt: text("completed_at"),
    notes: text("notes"),
  },
  (t) => [index("account_deletion_jobs_status_idx").on(t.status)],
);

export const contributionTermsAcceptances = sqliteTable(
  "contribution_terms_acceptances",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    userId: integer("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    termsVersion: text("terms_version").notNull(),
    acceptedAt: text("accepted_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    ipHash: text("ip_hash"),
    contributionRef: text("contribution_ref"),
  },
);

/** Prepaid My Spools Cloud — never an auto-renewing subscription. */
export const CLOUD_ENTITLEMENT_STATUSES = [
  "inactive",
  "pending",
  "active",
  "grace_period",
  "read_only",
  "expired",
  "refunded",
  "disputed",
  "revoked",
] as const;

export type CloudEntitlementStatus =
  (typeof CLOUD_ENTITLEMENT_STATUSES)[number];

export const CLOUD_PAYMENT_STATUSES = [
  "created",
  "pending",
  "paid",
  "failed",
  "expired",
  "refunded",
  "partially_refunded",
  "disputed",
  "cancelled",
] as const;

export type CloudPaymentStatus = (typeof CLOUD_PAYMENT_STATUSES)[number];

export const cloudEntitlements = sqliteTable(
  "cloud_entitlements",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    userId: integer("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    status: text("status", { enum: CLOUD_ENTITLEMENT_STATUSES })
      .notNull()
      .default("inactive"),
    startsAt: text("starts_at"),
    paidUntil: text("paid_until"),
    graceUntil: text("grace_until"),
    readOnlyFrom: text("read_only_from"),
    deletionScheduledAt: text("deletion_scheduled_at"),
    deletedAt: text("deleted_at"),
    reminder30SentAt: text("reminder_30_sent_at"),
    reminder7SentAt: text("reminder_7_sent_at"),
    reminderExpiredSentAt: text("reminder_expired_sent_at"),
    reminderDeletionSentAt: text("reminder_deletion_sent_at"),
    expiryRemindersEnabled: integer("expiry_reminders_enabled", {
      mode: "boolean",
    })
      .notNull()
      .default(true),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    index("cloud_entitlements_paid_until_idx").on(t.paidUntil),
    index("cloud_entitlements_status_idx").on(t.status),
  ],
);

export const cloudPayments = sqliteTable(
  "cloud_payments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("stripe"),
    providerCheckoutId: text("provider_checkout_id"),
    providerPaymentId: text("provider_payment_id"),
    providerCustomerId: text("provider_customer_id"),
    providerReceiptUrl: text("provider_receipt_url"),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull().default("eur"),
    accessMonths: integer("access_months").notNull().default(12),
    status: text("status", { enum: CLOUD_PAYMENT_STATUSES })
      .notNull()
      .default("created"),
    paidAt: text("paid_at"),
    refundedAt: text("refunded_at"),
    disputedAt: text("disputed_at"),
    rawProviderStatus: text("raw_provider_status"),
    idempotencyKey: text("idempotency_key").notNull(),
    adminReviewRequired: integer("admin_review_required", { mode: "boolean" })
      .notNull()
      .default(false),
    adminReviewNote: text("admin_review_note"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    uniqueIndex("cloud_payments_idempotency_unique").on(t.idempotencyKey),
    uniqueIndex("cloud_payments_checkout_unique").on(t.providerCheckoutId),
    uniqueIndex("cloud_payments_payment_id_unique").on(t.providerPaymentId),
    index("cloud_payments_user_idx").on(t.userId),
    index("cloud_payments_status_idx").on(t.status),
  ],
);

export const cloudEntitlementGrants = sqliteTable(
  "cloud_entitlement_grants",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    paymentId: integer("payment_id").references(() => cloudPayments.id, {
      onDelete: "set null",
    }),
    startsAt: text("starts_at").notNull(),
    endsAt: text("ends_at").notNull(),
    status: text("status", {
      enum: ["active", "revoked", "superseded"],
    })
      .notNull()
      .default("active"),
    revokedAt: text("revoked_at"),
    revocationReason: text("revocation_reason"),
    source: text("source").notNull().default("payment"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    updatedAt: text("updated_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [
    uniqueIndex("cloud_grants_payment_unique").on(t.paymentId),
    index("cloud_grants_user_idx").on(t.userId),
    index("cloud_grants_ends_idx").on(t.endsAt),
  ],
);

export const processedWebhookEvents = sqliteTable(
  "processed_webhook_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    provider: text("provider").notNull(),
    providerEventId: text("provider_event_id").notNull(),
    eventType: text("event_type").notNull(),
    receivedAt: text("received_at")
      .notNull()
      .default(sql`(datetime('now'))`),
    processedAt: text("processed_at"),
    processingStatus: text("processing_status", {
      enum: ["received", "processed", "ignored", "failed"],
    })
      .notNull()
      .default("received"),
    errorSummary: text("error_summary"),
  },
  (t) => [
    uniqueIndex("processed_webhook_provider_event_unique").on(
      t.provider,
      t.providerEventId,
    ),
    index("processed_webhook_type_idx").on(t.eventType),
  ],
);

export const cloudAdminAuditLog = sqliteTable(
  "cloud_admin_audit_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    uuid: text("uuid").notNull().unique(),
    adminUserId: integer("admin_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    targetUserId: integer("target_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: text("action").notNull(),
    reason: text("reason").notNull(),
    beforeJson: text("before_json"),
    afterJson: text("after_json"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (t) => [index("cloud_admin_audit_target_idx").on(t.targetUserId)],
);
