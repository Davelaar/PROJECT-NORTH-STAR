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
    nominalSpoolWeightG: real("nominal_spool_weight_g"),
    densityGCm3: real("density_g_cm3"),
    datasheetUrl: text("datasheet_url"),
    mfrNozzleTempMinC: real("mfr_nozzle_temp_min_c"),
    mfrNozzleTempMaxC: real("mfr_nozzle_temp_max_c"),
    mfrBedTempMinC: real("mfr_bed_temp_min_c"),
    mfrBedTempMaxC: real("mfr_bed_temp_max_c"),
    mfrChamberTempC: real("mfr_chamber_temp_c"),
    dryingTempC: real("drying_temp_c"),
    dryingDurationHours: real("drying_duration_hours"),
    storageRecommendation: text("storage_recommendation"),
    abrasive: integer("abrasive", { mode: "boolean" }).notNull().default(false),
    hygroscopicRating: text("hygroscopic_rating"),
    foodContactDocumented: integer("food_contact_documented", {
      mode: "boolean",
    }),
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
    isSyntheticFixture: integer("is_synthetic_fixture", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps,
  },
  (t) => [
    index("profile_variant_idx").on(t.filamentVariantId),
    index("profile_printer_idx").on(t.printerModelId),
    index("profile_toolhead_idx").on(t.toolheadConfigId),
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
