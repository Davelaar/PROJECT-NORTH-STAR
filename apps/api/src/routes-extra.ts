import type { FastifyInstance } from "fastify";
import { and, desc, eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import QRCode from "qrcode";
import { schema, type AppDb } from "@open-filament/db";
import { openFilamentProfileV1Schema } from "@open-filament/canonical-profile";
import { convertCrealityUserPresetToCanonicalPartial } from "@open-filament/slicer-creality";
import { convertCanonicalToCrealityUserPreset, buildCrealityInfoFile, suggestedCrealityFileName } from "@open-filament/slicer-creality";
import { toCanonicalFromRevision } from "@open-filament/canonical-profile";
import {
  hasScope,
  resolveBearerUser,
  type AuthUser,
} from "./auth.js";
import { badRequest, notFound, sendError, unauthorized } from "./errors.js";

function db(app: FastifyInstance): AppDb {
  return app.db;
}

async function auth(
  request: { headers: { authorization?: string }; server: FastifyInstance },
): Promise<AuthUser | null> {
  return resolveBearerUser(request.server.db, request.headers.authorization);
}

function forbid(reply: { status: (c: number) => { send: (b: unknown) => unknown } }, msg = "Missing scope") {
  return sendError(reply as never, 403, "forbidden", msg);
}

function featureFlags() {
  return {
    rfidWrite: process.env.FEATURE_RFID_WRITE === "true",
    slicerAutoInstall: process.env.FEATURE_SLICER_AUTO_INSTALL === "true",
  };
}

function audit(
  database: AppDb,
  actorUserId: number | null,
  action: string,
  entityType: string,
  entityUuid?: string,
  reason?: string,
  metadata?: unknown,
) {
  database
    .insert(schema.auditLog)
    .values({
      uuid: uuid(),
      actorUserId,
      action,
      entityType,
      entityUuid,
      reason,
      metadataJson: metadata ? JSON.stringify(metadata) : null,
    })
    .run();
}

function num(v: unknown): number | null {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function publishedRevision(database: AppDb, profileId: number) {
  return database
    .select()
    .from(schema.calibrationRevisions)
    .where(
      and(
        eq(schema.calibrationRevisions.profileId, profileId),
        eq(schema.calibrationRevisions.status, "published"),
      ),
    )
    .orderBy(desc(schema.calibrationRevisions.revisionNumber))
    .get();
}

export async function registerExtraRoutes(app: FastifyInstance) {
  app.get("/api/v1/features", async () => featureFlags());

  app.get("/api/v1/build-plates", async () =>
    db(app).select().from(schema.buildPlates).all(),
  );

  app.get<{ Querystring: { printerUuid?: string } }>(
    "/api/v1/toolheads",
    async (req) => {
      if (!req.query.printerUuid) {
        return db(app).select().from(schema.toolheadConfigs).all();
      }
      const printer = db(app)
        .select()
        .from(schema.printerModels)
        .where(eq(schema.printerModels.uuid, req.query.printerUuid))
        .get();
      if (!printer) return [];
      return db(app)
        .select()
        .from(schema.toolheadConfigs)
        .where(eq(schema.toolheadConfigs.printerModelId, printer.id))
        .all();
    },
  );

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/materials/:uuid",
    async (req, reply) => {
      const row = db(app)
        .select()
        .from(schema.materialFamilies)
        .where(eq(schema.materialFamilies.uuid, req.params.uuid))
        .get();
      if (!row) return notFound(reply, "Material not found");
      return row;
    },
  );

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/variants/:uuid/qr",
    async (req, reply) => {
      const variant = db(app)
        .select()
        .from(schema.filamentVariants)
        .where(eq(schema.filamentVariants.uuid, req.params.uuid))
        .get();
      if (!variant) return notFound(reply, "Variant not found");
      const web = process.env.WEB_ORIGIN ?? "http://127.0.0.1:3000";
      const url = `${web.replace(/\/$/, "")}/f/${variant.uuid}`;
      const dataUrl = await QRCode.toDataURL(url, { margin: 1, width: 256 });
      return { url, path: `/f/${variant.uuid}`, qrDataUrl: dataUrl };
    },
  );

  app.get<{ Querystring: { material?: string; color?: string; scheme?: string; printerUuid?: string; nozzleDiameterMm?: string } }>(
    "/api/v1/rfid/resolve",
    async (req, reply) => {
      const material = req.query.material;
      const color = req.query.color;
      if (!material) return badRequest(reply, "material query required");
      const mappings = db(app)
        .select({
          mapping: schema.rfidMappings,
          variant: schema.filamentVariants,
          scheme: schema.rfidSchemes,
        })
        .from(schema.rfidMappings)
        .innerJoin(
          schema.filamentVariants,
          eq(schema.rfidMappings.filamentVariantId, schema.filamentVariants.id),
        )
        .innerJoin(
          schema.rfidSchemes,
          eq(schema.rfidMappings.rfidSchemeId, schema.rfidSchemes.id),
        )
        .all()
        .filter((row) => {
          if (row.mapping.materialIdentifier !== material) return false;
          if (color && row.mapping.colorEncoding && row.mapping.colorEncoding !== color) {
            // allow case-insensitive hex
            if (row.mapping.colorEncoding.toLowerCase() !== color.toLowerCase()) return false;
          }
          return true;
        });
      if (mappings.length === 0) return notFound(reply, "No RFID mapping found");
      const hit = mappings[0]!;
      const profiles = db(app)
        .select()
        .from(schema.calibrationProfiles)
        .where(eq(schema.calibrationProfiles.filamentVariantId, hit.variant.id))
        .all();
      return {
        filamentVariantUuid: hit.variant.uuid,
        variantName: hit.variant.variantName,
        materialIdentifier: hit.mapping.materialIdentifier,
        colorEncoding: hit.mapping.colorEncoding,
        lossyColorMapping: hit.mapping.lossyColorMapping,
        profiles: profiles.map((p) => ({
          uuid: p.uuid,
          title: p.title,
          currentRevisionId: p.currentRevisionId,
        })),
      };
    },
  );

  app.post("/api/v1/rfid/resolve-and-export", async (req, reply) => {
    const body = z
      .object({
        material: z.string(),
        color: z.string().optional(),
        profileUuid: z.string().uuid().optional(),
      })
      .safeParse(req.body);
    if (!body.success) return badRequest(reply, "Invalid body", body.error.flatten());
    const resolveUrl = new URL("http://local/api/v1/rfid/resolve");
    resolveUrl.searchParams.set("material", body.data.material);
    if (body.data.color) resolveUrl.searchParams.set("color", body.data.color);
    // inline resolve
    const mapping = db(app)
      .select({
        mapping: schema.rfidMappings,
        variant: schema.filamentVariants,
      })
      .from(schema.rfidMappings)
      .innerJoin(
        schema.filamentVariants,
        eq(schema.rfidMappings.filamentVariantId, schema.filamentVariants.id),
      )
      .all()
      .find((row) => {
        if (row.mapping.materialIdentifier !== body.data.material) return false;
        if (
          body.data.color &&
          row.mapping.colorEncoding?.toLowerCase() !== body.data.color.toLowerCase()
        )
          return false;
        return true;
      });
    if (!mapping) return notFound(reply, "No RFID mapping found");
    const profile =
      (body.data.profileUuid
        ? db(app)
            .select()
            .from(schema.calibrationProfiles)
            .where(eq(schema.calibrationProfiles.uuid, body.data.profileUuid))
            .get()
        : null) ??
      db(app)
        .select()
        .from(schema.calibrationProfiles)
        .where(
          eq(
            schema.calibrationProfiles.filamentVariantId,
            mapping.variant.id,
          ),
        )
        .all()[0];
    if (!profile?.currentRevisionId) {
      return badRequest(reply, "No profile available for mapped variant");
    }
    const rev = db(app)
      .select()
      .from(schema.calibrationRevisions)
      .where(eq(schema.calibrationRevisions.id, profile.currentRevisionId))
      .get();
    if (!rev) return badRequest(reply, "Revision missing");
    // Build minimal canonical via existing export path fields
    const printer = db(app)
      .select()
      .from(schema.printerModels)
      .where(eq(schema.printerModels.id, profile.printerModelId))
      .get();
    const toolhead = db(app)
      .select()
      .from(schema.toolheadConfigs)
      .where(eq(schema.toolheadConfigs.id, profile.toolheadConfigId))
      .get();
    const product = db(app)
      .select()
      .from(schema.filamentProducts)
      .where(eq(schema.filamentProducts.id, mapping.variant.filamentProductId))
      .get();
    const mfr = product
      ? db(app)
          .select()
          .from(schema.manufacturers)
          .where(eq(schema.manufacturers.id, product.manufacturerId))
          .get()
      : null;
    const material = product
      ? db(app)
          .select()
          .from(schema.materialFamilies)
          .where(eq(schema.materialFamilies.id, product.materialFamilyId))
          .get()
      : null;
    const canonical = toCanonicalFromRevision({
      uuid: rev.uuid,
      title: profile.title,
      isSyntheticFixture: rev.isSyntheticFixture,
      notes: rev.notes,
      createdAt: rev.createdAt,
      slicerName: rev.slicerName,
      slicerVersion: rev.slicerVersion,
      manufacturerName: mfr?.name ?? null,
      productName: product?.productName ?? null,
      variantName: mapping.variant.variantName,
      materialCode: material?.code ?? null,
      diameterMm: product?.diameterMm ?? null,
      colorName: mapping.variant.colorName,
      primaryColorHex: mapping.variant.primaryColorHex,
      densityGCm3: product?.densityGCm3 ?? null,
      printerManufacturer: printer?.manufacturerName ?? null,
      printerModel: printer?.model ?? null,
      printerRevision: printer?.revision ?? null,
      nozzleDiameterMm: toolhead?.nozzleDiameterMm ?? null,
      nozzleMaterial: toolhead?.nozzleMaterial ?? null,
      nozzleTempFirstLayerC: rev.nozzleTempFirstLayerC,
      nozzleTempOtherLayersC: rev.nozzleTempOtherLayersC,
      bedTempFirstLayerC: rev.bedTempFirstLayerC,
      bedTempOtherLayersC: rev.bedTempOtherLayersC,
      chamberTempC: rev.chamberTempC,
      flowRatio: rev.flowRatio,
      pressureAdvance: rev.pressureAdvance,
      maxVolumetricFlowMm3s: rev.maxVolumetricFlowMm3s,
      fanMinPercent: rev.fanMinPercent,
      fanMaxPercent: rev.fanMaxPercent,
      bridgeFanPercent: rev.bridgeFanPercent,
      fanDisableFirstLayers: rev.fanDisableFirstLayers,
      retractionDistanceMm: rev.retractionDistanceMm,
      retractionSpeedMms: rev.retractionSpeedMms,
    });
    const preset = convertCanonicalToCrealityUserPreset(canonical);
    const fileName = suggestedCrealityFileName(canonical);
    const infoFile = buildCrealityInfoFile({
      userId: "local",
      settingId: uuid().replace(/-/g, "").slice(0, 24),
      baseId: String(preset.base_id ?? "GFSA04"),
    });
    return {
      filamentVariantUuid: mapping.variant.uuid,
      profileUuid: profile.uuid,
      bridgeInstallPayload: {
        slicer: "creality_print",
        presetJson: preset,
        infoText: infoFile,
        fileName,
        userId: "local",
      },
    };
  });

  app.post<{ Params: { uuid: string } }>(
    "/api/v1/profiles/:uuid/publish",
    async (req, reply) => {
      const user = await auth(req);
      if (!user) return unauthorized(reply);
      if (!hasScope(user, "write:profiles")) return forbid(reply);
      const profile = db(app)
        .select()
        .from(schema.calibrationProfiles)
        .where(eq(schema.calibrationProfiles.uuid, req.params.uuid))
        .get();
      if (!profile?.currentRevisionId) return notFound(reply, "Profile not found");
      const current = db(app)
        .select()
        .from(schema.calibrationRevisions)
        .where(eq(schema.calibrationRevisions.id, profile.currentRevisionId))
        .get();
      if (!current) return notFound(reply, "Revision not found");
      if (current.status !== "draft" && current.status !== "published") {
        return badRequest(reply, `Cannot publish status=${current.status}`);
      }
      for (const old of db(app)
        .select()
        .from(schema.calibrationRevisions)
        .where(
          and(
            eq(schema.calibrationRevisions.profileId, profile.id),
            eq(schema.calibrationRevisions.status, "published"),
          ),
        )
        .all()) {
        if (old.id === current.id) continue;
        db(app)
          .update(schema.calibrationRevisions)
          .set({ status: "superseded" })
          .where(eq(schema.calibrationRevisions.id, old.id))
          .run();
      }
      db(app)
        .update(schema.calibrationRevisions)
        .set({ status: "published" })
        .where(eq(schema.calibrationRevisions.id, current.id))
        .run();
      audit(db(app), user.id, "profile.publish", "calibration_profile", profile.uuid);
      return { ok: true, profileUuid: profile.uuid, revisionUuid: current.uuid, status: "published" };
    },
  );

  app.post<{ Params: { uuid: string } }>(
    "/api/v1/profiles/:uuid/revisions",
    async (req, reply) => {
      const user = await auth(req);
      if (!user) return unauthorized(reply);
      if (!hasScope(user, "write:calibrations")) return forbid(reply);
      const profile = db(app)
        .select()
        .from(schema.calibrationProfiles)
        .where(eq(schema.calibrationProfiles.uuid, req.params.uuid))
        .get();
      if (!profile) return notFound(reply, "Profile not found");
      const latest = db(app)
        .select()
        .from(schema.calibrationRevisions)
        .where(eq(schema.calibrationRevisions.profileId, profile.id))
        .orderBy(desc(schema.calibrationRevisions.revisionNumber))
        .get();
      const body = z.object({
        parameters: z.record(z.unknown()).optional(),
        notes: z.string().optional(),
        changelog: z.string().optional(),
      }).safeParse(req.body ?? {});
      if (!body.success) return badRequest(reply, "Invalid body", body.error.flatten());
      const params = (body.data.parameters ?? {}) as Record<string, unknown>;
      const [rev] = db(app)
        .insert(schema.calibrationRevisions)
        .values({
          uuid: uuid(),
          profileId: profile.id,
          revisionNumber: (latest?.revisionNumber ?? 0) + 1,
          parentRevisionId: latest?.id ?? null,
          createdByUserId: user.id,
          status: "draft",
          changelog: body.data.changelog,
          notes: body.data.notes,
          nozzleTempFirstLayerC: num(params.nozzleTempFirstLayerC) ?? latest?.nozzleTempFirstLayerC ?? null,
          nozzleTempOtherLayersC: num(params.nozzleTempOtherLayersC) ?? latest?.nozzleTempOtherLayersC ?? null,
          bedTempFirstLayerC: num(params.bedTempFirstLayerC) ?? latest?.bedTempFirstLayerC ?? null,
          bedTempOtherLayersC: num(params.bedTempOtherLayersC) ?? latest?.bedTempOtherLayersC ?? null,
          flowRatio: num(params.flowRatio) ?? latest?.flowRatio ?? null,
          pressureAdvance: num(params.pressureAdvance) ?? latest?.pressureAdvance ?? null,
          maxVolumetricFlowMm3s: num(params.maxVolumetricFlowMm3s) ?? latest?.maxVolumetricFlowMm3s ?? null,
        })
        .returning()
        .all();
      db(app)
        .update(schema.calibrationProfiles)
        .set({ currentRevisionId: rev!.id })
        .where(eq(schema.calibrationProfiles.id, profile.id))
        .run();
      audit(db(app), user.id, "profile.revise", "calibration_revision", rev!.uuid);
      return reply.status(201).send({ revisionUuid: rev!.uuid, revisionNumber: rev!.revisionNumber, status: "draft" });
    },
  );

  app.post<{ Params: { uuid: string } }>(
    "/api/v1/profiles/:uuid/fork",
    async (req, reply) => {
      const user = await auth(req);
      if (!user) return unauthorized(reply);
      if (!hasScope(user, "write:profiles")) return forbid(reply);
      const profile = db(app)
        .select()
        .from(schema.calibrationProfiles)
        .where(eq(schema.calibrationProfiles.uuid, req.params.uuid))
        .get();
      if (!profile?.currentRevisionId) return notFound(reply, "Profile not found");
      const src = db(app)
        .select()
        .from(schema.calibrationRevisions)
        .where(eq(schema.calibrationRevisions.id, profile.currentRevisionId))
        .get();
      if (!src) return notFound(reply, "Revision not found");
      const [forked] = db(app)
        .insert(schema.calibrationProfiles)
        .values({
          uuid: uuid(),
          filamentVariantId: profile.filamentVariantId,
          printerModelId: profile.printerModelId,
          toolheadConfigId: profile.toolheadConfigId,
          buildPlateId: profile.buildPlateId,
          createdByUserId: user.id,
          title: `${profile.title} (fork)`,
        })
        .returning()
        .all();
      const [rev] = db(app)
        .insert(schema.calibrationRevisions)
        .values({
          uuid: uuid(),
          profileId: forked!.id,
          revisionNumber: 1,
          forkedFromRevisionId: src.id,
          createdByUserId: user.id,
          status: "draft",
          changelog: `Forked from ${src.uuid}`,
          nozzleTempFirstLayerC: src.nozzleTempFirstLayerC,
          nozzleTempOtherLayersC: src.nozzleTempOtherLayersC,
          bedTempFirstLayerC: src.bedTempFirstLayerC,
          bedTempOtherLayersC: src.bedTempOtherLayersC,
          flowRatio: src.flowRatio,
          pressureAdvance: src.pressureAdvance,
          maxVolumetricFlowMm3s: src.maxVolumetricFlowMm3s,
          fanMinPercent: src.fanMinPercent,
          fanMaxPercent: src.fanMaxPercent,
          retractionDistanceMm: src.retractionDistanceMm,
        })
        .returning()
        .all();
      db(app)
        .update(schema.calibrationProfiles)
        .set({ currentRevisionId: rev!.id })
        .where(eq(schema.calibrationProfiles.id, forked!.id))
        .run();
      audit(db(app), user.id, "profile.fork", "calibration_profile", forked!.uuid, undefined, {
        from: profile.uuid,
      });
      return reply.status(201).send({
        profileUuid: forked!.uuid,
        revisionUuid: rev!.uuid,
        status: "draft",
      });
    },
  );

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/revisions/:uuid/observations",
    async (req, reply) => {
      const rev = db(app)
        .select()
        .from(schema.calibrationRevisions)
        .where(eq(schema.calibrationRevisions.uuid, req.params.uuid))
        .get();
      if (!rev) return notFound(reply, "Revision not found");
      return db(app)
        .select()
        .from(schema.rawObservations)
        .where(eq(schema.rawObservations.revisionId, rev.id))
        .all();
    },
  );

  app.post<{ Params: { uuid: string } }>(
    "/api/v1/revisions/:uuid/observations",
    async (req, reply) => {
      const user = await auth(req);
      if (!user) return unauthorized(reply);
      if (!hasScope(user, "write:calibrations")) return forbid(reply);
      const rev = db(app)
        .select()
        .from(schema.calibrationRevisions)
        .where(eq(schema.calibrationRevisions.uuid, req.params.uuid))
        .get();
      if (!rev) return notFound(reply, "Revision not found");
      const parsed = z
        .object({
          testType: z.string().min(1),
          testStart: z.number().optional(),
          testEnd: z.number().optional(),
          increment: z.number().optional(),
          observedLimit: z.number().optional(),
          chosenOperatingLimit: z.number().optional(),
          safetyMargin: z.number().optional(),
          unit: z.string().optional(),
          notes: z.string().optional(),
        })
        .safeParse(req.body);
      if (!parsed.success) return badRequest(reply, "Invalid body", parsed.error.flatten());
      const [row] = db(app)
        .insert(schema.rawObservations)
        .values({ uuid: uuid(), revisionId: rev.id, ...parsed.data })
        .returning()
        .all();
      return reply.status(201).send(row);
    },
  );

  app.post("/api/v1/imports/creality", async (req, reply) => {
    const user = await auth(req);
    if (!user) return unauthorized(reply);
    if (!hasScope(user, "write:calibrations")) return forbid(reply);
    const parsed = z
      .object({
        preset: z.record(z.unknown()),
        dryRun: z.boolean().optional(),
        filamentVariantUuid: z.string().uuid().optional(),
        printerModelUuid: z.string().uuid().optional(),
        toolheadConfigUuid: z.string().uuid().optional(),
      })
      .safeParse(req.body);
    if (!parsed.success) return badRequest(reply, "Invalid body", parsed.error.flatten());
    const mapped = convertCrealityUserPresetToCanonicalPartial(parsed.data.preset);
    if (parsed.data.dryRun) {
      return { dryRun: true, mapped };
    }
    if (
      !parsed.data.filamentVariantUuid ||
      !parsed.data.printerModelUuid ||
      !parsed.data.toolheadConfigUuid
    ) {
      return badRequest(
        reply,
        "Import requires filamentVariantUuid, printerModelUuid, toolheadConfigUuid (or dryRun)",
      );
    }
    const variant = db(app)
      .select()
      .from(schema.filamentVariants)
      .where(eq(schema.filamentVariants.uuid, parsed.data.filamentVariantUuid))
      .get();
    const printer = db(app)
      .select()
      .from(schema.printerModels)
      .where(eq(schema.printerModels.uuid, parsed.data.printerModelUuid))
      .get();
    const toolhead = db(app)
      .select()
      .from(schema.toolheadConfigs)
      .where(eq(schema.toolheadConfigs.uuid, parsed.data.toolheadConfigUuid))
      .get();
    if (!variant || !printer || !toolhead) return badRequest(reply, "Unknown catalog refs");
    const [profile] = db(app)
      .insert(schema.calibrationProfiles)
      .values({
        uuid: uuid(),
        filamentVariantId: variant.id,
        printerModelId: printer.id,
        toolheadConfigId: toolhead.id,
        createdByUserId: user.id,
        title: mapped.title,
      })
      .returning()
      .all();
    const [rev] = db(app)
      .insert(schema.calibrationRevisions)
      .values({
        uuid: uuid(),
        profileId: profile!.id,
        revisionNumber: 1,
        createdByUserId: user.id,
        status: "draft",
        notes: mapped.notes,
        nozzleTempOtherLayersC: mapped.thermal.nozzleTempOtherLayersC,
        nozzleTempFirstLayerC: mapped.thermal.nozzleTempFirstLayerC,
        bedTempOtherLayersC: mapped.thermal.bedTempOtherLayersC,
        bedTempFirstLayerC: mapped.thermal.bedTempFirstLayerC,
        flowRatio: mapped.extrusion.flowRatio,
        pressureAdvance: mapped.extrusion.pressureAdvance,
        maxVolumetricFlowMm3s: mapped.extrusion.maxVolumetricFlowMm3s,
      })
      .returning()
      .all();
    db(app)
      .update(schema.calibrationProfiles)
      .set({ currentRevisionId: rev!.id })
      .where(eq(schema.calibrationProfiles.id, profile!.id))
      .run();
    audit(db(app), user.id, "import.creality", "calibration_profile", profile!.uuid);
    return reply.status(201).send({
      profileUuid: profile!.uuid,
      revisionUuid: rev!.uuid,
      status: "draft",
      mapped,
    });
  });

  app.post("/api/v1/imports/openfilamentprofile", async (req, reply) => {
    const user = await auth(req);
    if (!user) return unauthorized(reply);
    if (!hasScope(user, "write:calibrations")) return forbid(reply);
    const parsed = z
      .object({
        profile: openFilamentProfileV1Schema,
        dryRun: z.boolean().optional(),
        filamentVariantUuid: z.string().uuid().optional(),
        printerModelUuid: z.string().uuid().optional(),
        toolheadConfigUuid: z.string().uuid().optional(),
      })
      .safeParse(req.body);
    if (!parsed.success) return badRequest(reply, "Invalid body", parsed.error.flatten());
    if (parsed.data.dryRun) {
      return { dryRun: true, profile: parsed.data.profile };
    }
    if (
      !parsed.data.filamentVariantUuid ||
      !parsed.data.printerModelUuid ||
      !parsed.data.toolheadConfigUuid
    ) {
      return badRequest(reply, "Import requires catalog UUIDs or dryRun");
    }
    const variant = db(app)
      .select()
      .from(schema.filamentVariants)
      .where(eq(schema.filamentVariants.uuid, parsed.data.filamentVariantUuid))
      .get();
    const printer = db(app)
      .select()
      .from(schema.printerModels)
      .where(eq(schema.printerModels.uuid, parsed.data.printerModelUuid))
      .get();
    const toolhead = db(app)
      .select()
      .from(schema.toolheadConfigs)
      .where(eq(schema.toolheadConfigs.uuid, parsed.data.toolheadConfigUuid))
      .get();
    if (!variant || !printer || !toolhead) return badRequest(reply, "Unknown catalog refs");
    const ofp = parsed.data.profile;
    const [profile] = db(app)
      .insert(schema.calibrationProfiles)
      .values({
        uuid: uuid(),
        filamentVariantId: variant.id,
        printerModelId: printer.id,
        toolheadConfigId: toolhead.id,
        createdByUserId: user.id,
        title: ofp.title,
      })
      .returning()
      .all();
    const [rev] = db(app)
      .insert(schema.calibrationRevisions)
      .values({
        uuid: uuid(),
        profileId: profile!.id,
        revisionNumber: 1,
        createdByUserId: user.id,
        status: "draft",
        notes: ofp.provenance.sourceNotes ?? null,
        nozzleTempOtherLayersC: ofp.thermal.nozzleTempOtherLayersC ?? null,
        nozzleTempFirstLayerC: ofp.thermal.nozzleTempFirstLayerC ?? null,
        bedTempOtherLayersC: ofp.thermal.bedTempOtherLayersC ?? null,
        bedTempFirstLayerC: ofp.thermal.bedTempFirstLayerC ?? null,
        flowRatio: ofp.extrusion.flowRatio ?? null,
        pressureAdvance: ofp.extrusion.pressureAdvance ?? null,
        maxVolumetricFlowMm3s: ofp.extrusion.maxVolumetricFlowMm3s ?? null,
      })
      .returning()
      .all();
    db(app)
      .update(schema.calibrationProfiles)
      .set({ currentRevisionId: rev!.id })
      .where(eq(schema.calibrationProfiles.id, profile!.id))
      .run();
    audit(db(app), user.id, "import.openfilamentprofile", "calibration_profile", profile!.uuid);
    return reply.status(201).send({
      profileUuid: profile!.uuid,
      revisionUuid: rev!.uuid,
      status: "draft",
    });
  });

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/users/:uuid/contributions",
    async (req, reply) => {
      const user = db(app)
        .select()
        .from(schema.users)
        .where(eq(schema.users.uuid, req.params.uuid))
        .get();
      if (!user) return notFound(reply, "User not found");
      const profiles = db(app)
        .select()
        .from(schema.calibrationProfiles)
        .where(eq(schema.calibrationProfiles.createdByUserId, user.id))
        .all();
      return {
        user: {
          uuid: user.uuid,
          username: user.username,
          role: user.role,
          trustScore: user.trustScore,
        },
        profiles,
      };
    },
  );

  app.get("/api/v1/admin/summary", async (req, reply) => {
    const user = await auth(req);
    if (!user) return unauthorized(reply);
    if (!hasScope(user, "moderate")) return forbid(reply);
    return {
      users: db(app).select().from(schema.users).all().length,
      manufacturers: db(app).select().from(schema.manufacturers).all().length,
      variants: db(app).select().from(schema.filamentVariants).all().length,
      profiles: db(app).select().from(schema.calibrationProfiles).all().length,
      rfidMappings: db(app).select().from(schema.rfidMappings).all().length,
    };
  });

  app.post<{ Params: { uuid: string } }>(
    "/api/v1/revisions/:uuid/evidence",
    async (req, reply) => {
    const user = await auth(req);
    if (!user) return unauthorized(reply);
    if (!hasScope(user, "write:calibrations")) return forbid(reply);
    const body = z
      .object({
        kind: z.enum([
          "test_print",
          "tower",
          "screenshot",
          "result",
          "other",
        ]),
        mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
        base64: z.string().min(1),
        caption: z.string().max(500).optional(),
        observationUuid: z.string().uuid().optional(),
      })
      .safeParse(req.body);
    if (!body.success) return badRequest(reply, "Invalid body", body.error.flatten());

    const revision = db(app)
      .select()
      .from(schema.calibrationRevisions)
      .where(eq(schema.calibrationRevisions.uuid, req.params.uuid))
      .get();
    if (!revision) return notFound(reply, "Revision not found");

    const profile = db(app)
      .select()
      .from(schema.calibrationProfiles)
      .where(eq(schema.calibrationProfiles.id, revision.profileId))
      .get();
    if (!profile || (profile.createdByUserId !== user.id && !hasScope(user, "moderate"))) {
      return forbid(reply, "Not owner of revision");
    }

    let observationId: number | undefined;
    if (body.data.observationUuid) {
      const obs = db(app)
        .select()
        .from(schema.rawObservations)
        .where(eq(schema.rawObservations.uuid, body.data.observationUuid))
        .get();
      if (!obs || obs.revisionId !== revision.id) {
        return badRequest(reply, "observationUuid not on this revision");
      }
      observationId = obs.id;
    }

    const { storeEvidenceImage } = await import("@open-filament/evidence");
    const buf = Buffer.from(body.data.base64, "base64");
    let stored;
    try {
      stored = await storeEvidenceImage(buf, body.data.mimeType);
    } catch (e) {
      return badRequest(reply, e instanceof Error ? e.message : "store failed");
    }

    const [row] = db(app)
      .insert(schema.evidenceAssets)
      .values({
        uuid: uuid(),
        revisionId: revision.id,
        observationId,
        kind: body.data.kind,
        mimeType: stored.mimeType,
        storageKey: stored.storageKey,
        byteSize: stored.byteSize,
        caption: body.data.caption,
      })
      .returning()
      .all();

    audit(db(app), user.id, "evidence.upload", "calibration_revision", revision.uuid, undefined, {
      storageKey: stored.storageKey,
      kind: body.data.kind,
    });

    return reply.status(201).send({
      uuid: row!.uuid,
      storageKey: stored.storageKey,
      mimeType: stored.mimeType,
      byteSize: stored.byteSize,
      width: stored.width,
      height: stored.height,
    });
  });
}
