import type { FastifyInstance } from "fastify";
import { and, eq, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import {
  schema,
  searchDocuments,
  type AppDb,
} from "@open-filament/db";
import {
  aggregateProfileFields,
  failureCategories,
} from "@open-filament/domain";
import {
  toCanonicalFromRevision,
  openFilamentProfileV1Schema,
} from "@open-filament/canonical-profile";
import { convertCanonicalToCrealityUserPreset, buildCrealityInfoFile, suggestCompatiblePrinter, suggestedCrealityFileName } from "@open-filament/slicer-creality";
import { convertCanonicalToOrcaFilamentPreset, suggestedOrcaFileName } from "@open-filament/slicer-orca";
import { CrealityCfsCodec } from "@open-filament/rfid-cfs";
import { randomBytes } from "node:crypto";
import {
  loginWithPassword,
  registerUser,
  resolveBearerUser,
  type AuthUser,
} from "./auth.js";
import { badRequest, notFound, sendError, unauthorized } from "./errors.js";
import { buildOpenApiDocument } from "./openapi.js";

declare module "fastify" {
  interface FastifyInstance {
    db: AppDb;
  }
}

async function requireAuth(request: {
  headers: { authorization?: string };
  server: FastifyInstance;
}): Promise<AuthUser | null> {
  return resolveBearerUser(request.server.db, request.headers.authorization);
}

function publicUser(u: AuthUser) {
  return {
    uuid: u.uuid,
    username: u.username,
    role: u.role,
    trustScore: u.trustScore,
  };
}

export async function registerRoutes(app: FastifyInstance) {
  const db = () => app.db;

  app.get("/api/v1/health", async () => ({
    ok: true,
    service: "open-filament-api",
    time: new Date().toISOString(),
  }));

  app.get("/openapi.json", async (req) => {
    const host = req.headers.host ?? "127.0.0.1:8787";
    const proto = (req.headers["x-forwarded-proto"] as string) ?? "http";
    return buildOpenApiDocument(`${proto}://${host}`);
  });

  app.get("/api/v1/manufacturers", async () => {
    return db().select().from(schema.manufacturers).all();
  });

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/manufacturers/:uuid",
    async (req, reply) => {
      const row = db()
        .select()
        .from(schema.manufacturers)
        .where(eq(schema.manufacturers.uuid, req.params.uuid))
        .get();
      if (!row) return notFound(reply, "Manufacturer not found");
      return row;
    },
  );

  app.get("/api/v1/materials", async () => {
    return db().select().from(schema.materialFamilies).all();
  });

  app.get("/api/v1/filaments", async () => {
    return db()
      .select({
        uuid: schema.filamentProducts.uuid,
        productName: schema.filamentProducts.productName,
        slug: schema.filamentProducts.slug,
        diameterMm: schema.filamentProducts.diameterMm,
        description: schema.filamentProducts.description,
        mfrNozzleTempMinC: schema.filamentProducts.mfrNozzleTempMinC,
        mfrNozzleTempMaxC: schema.filamentProducts.mfrNozzleTempMaxC,
        mfrBedTempMinC: schema.filamentProducts.mfrBedTempMinC,
        mfrBedTempMaxC: schema.filamentProducts.mfrBedTempMaxC,
        isSyntheticFixture: schema.filamentProducts.isSyntheticFixture,
        manufacturerUuid: schema.manufacturers.uuid,
        manufacturerName: schema.manufacturers.name,
        materialCode: schema.materialFamilies.code,
        materialName: schema.materialFamilies.name,
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
  });

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/filaments/:uuid",
    async (req, reply) => {
      const row = db()
        .select({
          product: schema.filamentProducts,
          manufacturerUuid: schema.manufacturers.uuid,
          manufacturerName: schema.manufacturers.name,
          materialCode: schema.materialFamilies.code,
          materialName: schema.materialFamilies.name,
        })
        .from(schema.filamentProducts)
        .innerJoin(
          schema.manufacturers,
          eq(schema.filamentProducts.manufacturerId, schema.manufacturers.id),
        )
        .innerJoin(
          schema.materialFamilies,
          eq(
            schema.filamentProducts.materialFamilyId,
            schema.materialFamilies.id,
          ),
        )
        .where(eq(schema.filamentProducts.uuid, req.params.uuid))
        .get();
      if (!row) return notFound(reply, "Filament product not found");
      return {
        ...row.product,
        manufacturerUuid: row.manufacturerUuid,
        manufacturerName: row.manufacturerName,
        materialCode: row.materialCode,
        materialName: row.materialName,
      };
    },
  );

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/filaments/:uuid/variants",
    async (req, reply) => {
      const product = db()
        .select()
        .from(schema.filamentProducts)
        .where(eq(schema.filamentProducts.uuid, req.params.uuid))
        .get();
      if (!product) return notFound(reply, "Filament product not found");
      return db()
        .select()
        .from(schema.filamentVariants)
        .where(eq(schema.filamentVariants.filamentProductId, product.id))
        .all();
    },
  );

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/variants/:uuid",
    async (req, reply) => {
      const row = db()
        .select({
          variant: schema.filamentVariants,
          productUuid: schema.filamentProducts.uuid,
          productName: schema.filamentProducts.productName,
          manufacturerUuid: schema.manufacturers.uuid,
          manufacturerName: schema.manufacturers.name,
          materialCode: schema.materialFamilies.code,
          mfrNozzleTempMinC: schema.filamentProducts.mfrNozzleTempMinC,
          mfrNozzleTempMaxC: schema.filamentProducts.mfrNozzleTempMaxC,
          mfrBedTempMinC: schema.filamentProducts.mfrBedTempMinC,
          mfrBedTempMaxC: schema.filamentProducts.mfrBedTempMaxC,
          mfrChamberTempC: schema.filamentProducts.mfrChamberTempC,
          dryingTempC: schema.filamentProducts.dryingTempC,
          dryingDurationHours: schema.filamentProducts.dryingDurationHours,
          productSynthetic: schema.filamentProducts.isSyntheticFixture,
        })
        .from(schema.filamentVariants)
        .innerJoin(
          schema.filamentProducts,
          eq(
            schema.filamentVariants.filamentProductId,
            schema.filamentProducts.id,
          ),
        )
        .innerJoin(
          schema.manufacturers,
          eq(schema.filamentProducts.manufacturerId, schema.manufacturers.id),
        )
        .innerJoin(
          schema.materialFamilies,
          eq(
            schema.filamentProducts.materialFamilyId,
            schema.materialFamilies.id,
          ),
        )
        .where(eq(schema.filamentVariants.uuid, req.params.uuid))
        .get();
      if (!row) return notFound(reply, "Variant not found");
      return {
        ...row.variant,
        productUuid: row.productUuid,
        productName: row.productName,
        manufacturerUuid: row.manufacturerUuid,
        manufacturerName: row.manufacturerName,
        materialCode: row.materialCode,
        manufacturerSpecs: {
          nozzleTempMinC: row.mfrNozzleTempMinC,
          nozzleTempMaxC: row.mfrNozzleTempMaxC,
          bedTempMinC: row.mfrBedTempMinC,
          bedTempMaxC: row.mfrBedTempMaxC,
          chamberTempC: row.mfrChamberTempC,
          dryingTempC: row.dryingTempC,
          dryingDurationHours: row.dryingDurationHours,
          note: "Manufacturer / catalog claims — not community calibration",
        },
        isSyntheticFixture:
          row.variant.isSyntheticFixture || row.productSynthetic,
      };
    },
  );

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/variants/:uuid/profiles",
    async (req, reply) => {
      const variant = db()
        .select()
        .from(schema.filamentVariants)
        .where(eq(schema.filamentVariants.uuid, req.params.uuid))
        .get();
      if (!variant) return notFound(reply, "Variant not found");
      return db()
        .select({
          uuid: schema.calibrationProfiles.uuid,
          title: schema.calibrationProfiles.title,
          isSyntheticFixture: schema.calibrationProfiles.isSyntheticFixture,
          printerUuid: schema.printerModels.uuid,
          printerName: sql<string>`${schema.printerModels.manufacturerName} || ' ' || ${schema.printerModels.model}`,
          nozzleDiameterMm: schema.toolheadConfigs.nozzleDiameterMm,
          currentRevisionUuid: schema.calibrationRevisions.uuid,
        })
        .from(schema.calibrationProfiles)
        .innerJoin(
          schema.printerModels,
          eq(schema.calibrationProfiles.printerModelId, schema.printerModels.id),
        )
        .innerJoin(
          schema.toolheadConfigs,
          eq(
            schema.calibrationProfiles.toolheadConfigId,
            schema.toolheadConfigs.id,
          ),
        )
        .leftJoin(
          schema.calibrationRevisions,
          eq(
            schema.calibrationProfiles.currentRevisionId,
            schema.calibrationRevisions.id,
          ),
        )
        .where(eq(schema.calibrationProfiles.filamentVariantId, variant.id))
        .all();
    },
  );

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/variants/:uuid/recommendation",
    async (req, reply) => {
      const variant = db()
        .select()
        .from(schema.filamentVariants)
        .where(eq(schema.filamentVariants.uuid, req.params.uuid))
        .get();
      if (!variant) return notFound(reply, "Variant not found");

      const revisions = db()
        .select({
          nozzleTempOtherLayersC:
            schema.calibrationRevisions.nozzleTempOtherLayersC,
          bedTempOtherLayersC: schema.calibrationRevisions.bedTempOtherLayersC,
          flowRatio: schema.calibrationRevisions.flowRatio,
          pressureAdvance: schema.calibrationRevisions.pressureAdvance,
          maxVolumetricFlowMm3s:
            schema.calibrationRevisions.maxVolumetricFlowMm3s,
          trustScore: schema.users.trustScore,
          isSyntheticFixture: schema.calibrationRevisions.isSyntheticFixture,
        })
        .from(schema.calibrationProfiles)
        .innerJoin(
          schema.calibrationRevisions,
          eq(
            schema.calibrationProfiles.currentRevisionId,
            schema.calibrationRevisions.id,
          ),
        )
        .innerJoin(
          schema.users,
          eq(schema.calibrationRevisions.createdByUserId, schema.users.id),
        )
        .where(
          and(
            eq(schema.calibrationProfiles.filamentVariantId, variant.id),
            eq(schema.calibrationRevisions.status, "published"),
          ),
        )
        .all();

      const aggregation = aggregateProfileFields(revisions);
      return {
        variantUuid: variant.uuid,
        sampleProfileCount: revisions.length,
        syntheticSampleCount: revisions.filter((r) => r.isSyntheticFixture)
          .length,
        warning:
          revisions.some((r) => r.isSyntheticFixture)
            ? "Includes seed catalog samples — not measured community data"
            : null,
        recommendation: aggregation,
      };
    },
  );

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/profiles/:uuid",
    async (req, reply) => {
      const profile = loadProfileBundle(db(), req.params.uuid);
      if (!profile) return notFound(reply, "Profile not found");
      return profile;
    },
  );

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/profiles/:uuid/revisions",
    async (req, reply) => {
      const profile = db()
        .select()
        .from(schema.calibrationProfiles)
        .where(eq(schema.calibrationProfiles.uuid, req.params.uuid))
        .get();
      if (!profile) return notFound(reply, "Profile not found");
      return db()
        .select()
        .from(schema.calibrationRevisions)
        .where(eq(schema.calibrationRevisions.profileId, profile.id))
        .all();
    },
  );

  app.post("/api/v1/profiles", async (req, reply) => {
    const user = await requireAuth(req);
    if (!user) return unauthorized(reply);

    const bodySchema = z.object({
      filamentVariantUuid: z.string().uuid(),
      printerModelUuid: z.string().uuid(),
      toolheadConfigUuid: z.string().uuid(),
      buildPlateUuid: z.string().uuid().optional(),
      title: z.string().min(1),
      parameters: z.record(z.unknown()).optional(),
      notes: z.string().optional(),
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(reply, "Invalid body", parsed.error.flatten());
    }
    const body = parsed.data;

    const variant = db()
      .select()
      .from(schema.filamentVariants)
      .where(eq(schema.filamentVariants.uuid, body.filamentVariantUuid))
      .get();
    const printer = db()
      .select()
      .from(schema.printerModels)
      .where(eq(schema.printerModels.uuid, body.printerModelUuid))
      .get();
    const toolhead = db()
      .select()
      .from(schema.toolheadConfigs)
      .where(eq(schema.toolheadConfigs.uuid, body.toolheadConfigUuid))
      .get();
    if (!variant || !printer || !toolhead) {
      return badRequest(reply, "Unknown variant, printer, or toolhead");
    }
    let buildPlateId: number | null = null;
    if (body.buildPlateUuid) {
      const plate = db()
        .select()
        .from(schema.buildPlates)
        .where(eq(schema.buildPlates.uuid, body.buildPlateUuid))
        .get();
      if (!plate) return badRequest(reply, "Unknown build plate");
      buildPlateId = plate.id;
    }

    const [profile] = db()
      .insert(schema.calibrationProfiles)
      .values({
        uuid: uuid(),
        filamentVariantId: variant.id,
        printerModelId: printer.id,
        toolheadConfigId: toolhead.id,
        buildPlateId,
        createdByUserId: user.id,
        title: body.title,
        isSyntheticFixture: false,
      })
      .returning()
      .all();

    const params = (body.parameters ?? {}) as Record<string, unknown>;
    const [rev] = db()
      .insert(schema.calibrationRevisions)
      .values({
        uuid: uuid(),
        profileId: profile!.id,
        revisionNumber: 1,
        createdByUserId: user.id,
        status: "draft",
        notes: body.notes,
        nozzleTempFirstLayerC: num(params.nozzleTempFirstLayerC),
        nozzleTempOtherLayersC: num(params.nozzleTempOtherLayersC),
        bedTempFirstLayerC: num(params.bedTempFirstLayerC),
        bedTempOtherLayersC: num(params.bedTempOtherLayersC),
        flowRatio: num(params.flowRatio),
        pressureAdvance: num(params.pressureAdvance),
        maxVolumetricFlowMm3s: num(params.maxVolumetricFlowMm3s),
        isSyntheticFixture: false,
      })
      .returning()
      .all();

    db()
      .update(schema.calibrationProfiles)
      .set({ currentRevisionId: rev!.id })
      .where(eq(schema.calibrationProfiles.id, profile!.id))
      .run();

    return reply.status(201).send({
      profileUuid: profile!.uuid,
      revisionUuid: rev!.uuid,
      status: "draft",
    });
  });

  app.post<{ Params: { uuid: string } }>(
    "/api/v1/profiles/:uuid/confirm",
    async (req, reply) => {
      const user = await requireAuth(req);
      if (!user) return unauthorized(reply);
      const profile = db()
        .select()
        .from(schema.calibrationProfiles)
        .where(eq(schema.calibrationProfiles.uuid, req.params.uuid))
        .get();
      if (!profile?.currentRevisionId) {
        return notFound(reply, "Profile not found");
      }
      const body = (req.body ?? {}) as { notes?: string };
      try {
        const [row] = db()
          .insert(schema.profileConfirmations)
          .values({
            uuid: uuid(),
            revisionId: profile.currentRevisionId,
            userId: user.id,
            notes: body.notes,
          })
          .returning()
          .all();
        return reply.status(201).send(row);
      } catch {
        return sendError(reply, 409, "conflict", "Already confirmed");
      }
    },
  );

  app.post<{ Params: { uuid: string } }>(
    "/api/v1/profiles/:uuid/failure",
    async (req, reply) => {
      const user = await requireAuth(req);
      if (!user) return unauthorized(reply);
      const profile = db()
        .select()
        .from(schema.calibrationProfiles)
        .where(eq(schema.calibrationProfiles.uuid, req.params.uuid))
        .get();
      if (!profile?.currentRevisionId) {
        return notFound(reply, "Profile not found");
      }
      const bodySchema = z.object({
        category: z.enum(failureCategories),
        notes: z.string().optional(),
      });
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(reply, "Invalid body", parsed.error.flatten());
      }
      const [row] = db()
        .insert(schema.profileFailureReports)
        .values({
          uuid: uuid(),
          revisionId: profile.currentRevisionId,
          userId: user.id,
          category: parsed.data.category,
          notes: parsed.data.notes,
        })
        .returning()
        .all();
      return reply.status(201).send(row);
    },
  );

  app.get("/api/v1/printers", async () => {
    return db().select().from(schema.printerModels).all();
  });

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/printers/:uuid",
    async (req, reply) => {
      const printer = db()
        .select()
        .from(schema.printerModels)
        .where(eq(schema.printerModels.uuid, req.params.uuid))
        .get();
      if (!printer) return notFound(reply, "Printer not found");
      const toolheads = db()
        .select()
        .from(schema.toolheadConfigs)
        .where(eq(schema.toolheadConfigs.printerModelId, printer.id))
        .all();
      return { ...printer, toolheads };
    },
  );

  app.get<{ Querystring: { q?: string } }>("/api/v1/search", async (req) => {
    const q = req.query.q ?? "";
    return { query: q, results: searchDocuments(db(), q) };
  });

  app.get("/api/v1/rfid/schemes", async () => {
    return db().select().from(schema.rfidSchemes).all();
  });

  app.post("/api/v1/rfid/encode", async (req, reply) => {
    const bodySchema = z.object({
      material: z.string().min(1).optional(),
      materialCode: z.string().min(1).optional(),
      color: z.string().min(1).optional(),
      colorToken: z.string().min(1).optional(),
      weightOrLength: z.union([z.string(), z.number()]).optional(),
      serial: z.string().optional(),
      batch: z.string().optional(),
      date: z.string().optional(),
      supplier: z.string().optional(),
      uid: z.string().optional(),
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(reply, "Invalid body", parsed.error.flatten());
    }
    const material = parsed.data.material ?? parsed.data.materialCode;
    const color = parsed.data.color ?? parsed.data.colorToken;
    if (!material || !color) {
      return badRequest(reply, "material (or materialCode) and color (or colorToken) are required");
    }
    try {
      const codec = new CrealityCfsCodec();
      const encoded = codec.encode({
        material,
        color,
        weightOrLength: parsed.data.weightOrLength ?? "1kg",
        serial: parsed.data.serial,
        batch: parsed.data.batch,
        date: parsed.data.date,
        supplier: parsed.data.supplier,
        uid: parsed.data.uid,
      });
      return {
        format: encoded.format,
        plaintextAscii: encoded.plaintextAscii,
        plaintextHex: encoded.plaintextHex,
        ciphertextHex: encoded.ciphertextHex,
        blocksHex: encoded.blocksHex,
        fields: encoded.fields,
        uidKeyAHex: encoded.uidKeyAHex,
        notes: encoded.notes,
      };
    } catch (err) {
      return badRequest(
        reply,
        err instanceof Error ? err.message : "CFS encode failed",
      );
    }
  });

  app.post("/api/v1/rfid/verify", async (req, reply) => {
    const bodySchema = z.object({
      ciphertextHex: z.string().min(32),
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(reply, "Invalid body", parsed.error.flatten());
    }
    try {
      const codec = new CrealityCfsCodec();
      const verified = codec.verify(parsed.data.ciphertextHex);
      return {
        ok: verified.ok,
        plaintextAscii: verified.plaintextAscii,
        fields: verified.fields,
      };
    } catch (err) {
      return badRequest(
        reply,
        err instanceof Error ? err.message : "CFS verify failed",
      );
    }
  });

  app.post("/api/v1/exports/creality", async (req, reply) => {
    const canonical = await resolveCanonical(db(), req.body);
    if (!canonical.ok) return badRequest(reply, canonical.message);
    const optsBody = z
      .object({
        nozzleDiameterMm: z.number().optional(),
        printerModel: z.string().optional(),
        userId: z.string().optional(),
      })
      .safeParse(req.body ?? {});
    const opts = optsBody.success ? optsBody.data : {};
    const preset = convertCanonicalToCrealityUserPreset(canonical.profile, opts);
    const suggestedFileName = suggestedCrealityFileName(canonical.profile, opts);
    const inherits = String(preset.inherits);
    const userId = opts.userId ?? "local";
    const settingId = randomBytes(12).toString("hex");
    const infoFile = buildCrealityInfoFile({
      userId,
      settingId,
      baseId: String(preset.base_id ?? "GFSA04"),
    });
    const printer = suggestCompatiblePrinter(canonical.profile, opts);
    return {
      format: "creality-print-user-filament-preset",
      preset,
      suggestedFileName,
      infoFile,
      inherits,
      suggestedPrinter: printer,
      bridgeInstallPayload: {
        slicer: "creality_print",
        presetJson: preset,
        infoText: infoFile,
        fileName: suggestedFileName,
        userId,
      },
    };
  });

  app.post("/api/v1/exports/orca", async (req, reply) => {
    const canonical = await resolveCanonical(db(), req.body);
    if (!canonical.ok) return badRequest(reply, canonical.message);
    const optsBody = z
      .object({
        nozzleDiameterMm: z.number().optional(),
        printerModel: z.string().optional(),
      })
      .safeParse(req.body ?? {});
    const opts = optsBody.success ? optsBody.data : {};
    const preset = convertCanonicalToOrcaFilamentPreset(canonical.profile, opts);
    const suggestedFileName = suggestedOrcaFileName(canonical.profile, opts);
    return {
      format: "orca-filament-user-preset",
      preset,
      suggestedFileName,
      inherits: String(preset.inherits),
      bridgeInstallPayload: {
        slicer: "orca",
        presetJson: preset,
        fileName: suggestedFileName,
      },
    };
  });

  app.post("/api/v1/exports/openfilamentprofile", async (req, reply) => {
    const canonical = await resolveCanonical(db(), req.body);
    if (!canonical.ok) return badRequest(reply, canonical.message);
    return canonical.profile;
  });

  app.post("/api/v1/auth/login", async (req, reply) => {
    const bodySchema = z
      .object({
        username: z.string().min(1).optional(),
        email: z.string().min(1).optional(),
        password: z.string().min(1),
      })
      .refine((b) => Boolean(b.username || b.email), {
        message: "username or email is required",
      });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(reply, "Invalid body", parsed.error.flatten());
    }
    const result = await loginWithPassword(
      db(),
      parsed.data.username ?? parsed.data.email!,
      parsed.data.password,
    );
    if (!result) return unauthorized(reply, "Invalid credentials");
    return { token: result.token, user: publicUser(result.user) };
  });

  app.post("/api/v1/auth/register", async (req, reply) => {
    const bodySchema = z.object({
      username: z.string().min(3).max(64),
      email: z.string().email(),
      password: z.string().min(8),
      displayName: z.string().optional(),
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(reply, "Invalid body", parsed.error.flatten());
    }
    try {
      const result = await registerUser(db(), parsed.data);
      return reply.status(201).send({
        token: result.token,
        user: publicUser(result.user),
      });
    } catch (err) {
      return sendError(reply, 409, "conflict", "Username or email already exists", {
        cause: err instanceof Error ? err.message : String(err),
      });
    }
  });
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

function loadProfileBundle(database: AppDb, profileUuid: string) {
  const row = database
    .select({
      profile: schema.calibrationProfiles,
      revision: schema.calibrationRevisions,
      variantUuid: schema.filamentVariants.uuid,
      variantName: schema.filamentVariants.variantName,
      colorName: schema.filamentVariants.colorName,
      primaryColorHex: schema.filamentVariants.primaryColorHex,
      productName: schema.filamentProducts.productName,
      diameterMm: schema.filamentProducts.diameterMm,
      densityGCm3: schema.filamentProducts.densityGCm3,
      manufacturerName: schema.manufacturers.name,
      materialCode: schema.materialFamilies.code,
      printerManufacturer: schema.printerModels.manufacturerName,
      printerModel: schema.printerModels.model,
      printerRevision: schema.printerModels.revision,
      printerUuid: schema.printerModels.uuid,
      nozzleDiameterMm: schema.toolheadConfigs.nozzleDiameterMm,
      nozzleMaterial: schema.toolheadConfigs.nozzleMaterial,
      buildPlate: schema.buildPlates.name,
    })
    .from(schema.calibrationProfiles)
    .leftJoin(
      schema.calibrationRevisions,
      eq(
        schema.calibrationProfiles.currentRevisionId,
        schema.calibrationRevisions.id,
      ),
    )
    .innerJoin(
      schema.filamentVariants,
      eq(
        schema.calibrationProfiles.filamentVariantId,
        schema.filamentVariants.id,
      ),
    )
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
    .innerJoin(
      schema.printerModels,
      eq(schema.calibrationProfiles.printerModelId, schema.printerModels.id),
    )
    .innerJoin(
      schema.toolheadConfigs,
      eq(schema.calibrationProfiles.toolheadConfigId, schema.toolheadConfigs.id),
    )
    .leftJoin(
      schema.buildPlates,
      eq(schema.calibrationProfiles.buildPlateId, schema.buildPlates.id),
    )
    .where(eq(schema.calibrationProfiles.uuid, profileUuid))
    .get();

  if (!row) return null;

  const canonical = row.revision
    ? toCanonicalFromRevision({
        uuid: row.revision.uuid,
        title: row.profile.title,
        isSyntheticFixture:
          row.profile.isSyntheticFixture || row.revision.isSyntheticFixture,
        notes: row.revision.notes,
        createdAt: row.revision.createdAt,
        slicerName: row.revision.slicerName,
        slicerVersion: row.revision.slicerVersion,
        manufacturerName: row.manufacturerName,
        productName: row.productName,
        variantName: row.variantName,
        materialCode: row.materialCode,
        diameterMm: row.diameterMm,
        colorName: row.colorName,
        primaryColorHex: row.primaryColorHex,
        densityGCm3: row.densityGCm3,
        printerManufacturer: row.printerManufacturer,
        printerModel: row.printerModel,
        printerRevision: row.printerRevision,
        nozzleDiameterMm: row.nozzleDiameterMm,
        nozzleMaterial: row.nozzleMaterial,
        buildPlate: row.buildPlate,
        ...pickRevisionParams(row.revision),
      })
    : null;

  return {
    ...row.profile,
    variantUuid: row.variantUuid,
    printerUuid: row.printerUuid,
    currentRevision: row.revision,
    openFilamentProfile: canonical,
  };
}

function pickRevisionParams(rev: typeof schema.calibrationRevisions.$inferSelect) {
  return {
    nozzleTempFirstLayerC: rev.nozzleTempFirstLayerC,
    nozzleTempOtherLayersC: rev.nozzleTempOtherLayersC,
    nozzleTempMinC: rev.nozzleTempMinC,
    nozzleTempMaxC: rev.nozzleTempMaxC,
    bedTempFirstLayerC: rev.bedTempFirstLayerC,
    bedTempOtherLayersC: rev.bedTempOtherLayersC,
    chamberTempC: rev.chamberTempC,
    enclosureRecommended: rev.enclosureRecommended,
    flowRatio: rev.flowRatio,
    pressureAdvance: rev.pressureAdvance,
    linearAdvance: rev.linearAdvance,
    maxVolumetricFlowMm3s: rev.maxVolumetricFlowMm3s,
    minVolumetricFlowMm3s: rev.minVolumetricFlowMm3s,
    fanMinPercent: rev.fanMinPercent,
    fanMaxPercent: rev.fanMaxPercent,
    bridgeFanPercent: rev.bridgeFanPercent,
    fanDisableFirstLayers: rev.fanDisableFirstLayers,
    retractionDistanceMm: rev.retractionDistanceMm,
    retractionSpeedMms: rev.retractionSpeedMms,
    deretractionSpeedMms: rev.deretractionSpeedMms,
    wipe: rev.wipe,
    zHopMm: rev.zHopMm,
    dryingTempC: rev.dryingTempC,
    dryingDurationHours: rev.dryingDurationHours,
    recommendedMaxRhPercent: rev.recommendedMaxRhPercent,
    prePrintDryingRequired: rev.prePrintDryingRequired,
    annealingNotes: rev.annealingNotes,
    postProcessingNotes: rev.postProcessingNotes,
    adhesiveRecommendation: rev.adhesiveRecommendation,
    brimRecommended: rev.brimRecommended,
    buildSurfaceNotes: rev.buildSurfaceNotes,
  };
}

async function resolveCanonical(
  database: AppDb,
  body: unknown,
): Promise<
  | { ok: true; profile: ReturnType<typeof toCanonicalFromRevision> }
  | { ok: false; message: string }
> {
  const schemaBody = z.union([
    z.object({ profileUuid: z.string().uuid() }),
    z.object({ revisionUuid: z.string().uuid() }),
    z.object({ profile: openFilamentProfileV1Schema }),
  ]);
  const parsed = schemaBody.safeParse(body);
  if (!parsed.success) {
    return {
      ok: false,
      message: "Provide profileUuid, revisionUuid, or profile document",
    };
  }
  const data = parsed.data;
  if ("profile" in data) {
    return { ok: true, profile: data.profile };
  }
  if ("profileUuid" in data) {
    const bundle = loadProfileBundle(database, data.profileUuid);
    if (!bundle?.openFilamentProfile) {
      return { ok: false, message: "Profile not found or has no revision" };
    }
    return { ok: true, profile: bundle.openFilamentProfile };
  }
  const rev = database
    .select()
    .from(schema.calibrationRevisions)
    .where(eq(schema.calibrationRevisions.uuid, data.revisionUuid))
    .get();
  if (!rev) return { ok: false, message: "Revision not found" };
  const profile = database
    .select()
    .from(schema.calibrationProfiles)
    .where(eq(schema.calibrationProfiles.id, rev.profileId))
    .get();
  if (!profile) return { ok: false, message: "Profile not found" };
  const bundle = loadProfileBundle(database, profile.uuid);
  if (!bundle?.openFilamentProfile) {
    return { ok: false, message: "Could not build canonical profile" };
  }
  return { ok: true, profile: bundle.openFilamentProfile };
}
