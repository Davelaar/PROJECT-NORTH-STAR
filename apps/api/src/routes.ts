import type { FastifyInstance } from "fastify";
import { and, eq, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { z } from "zod";
import {
  schema,
  searchDocuments,
  searchVariantsByColor,
  listPrinterBrands,
  resolveOrCreatePrinter,
  ensureCommunityUser,
  getCatalogPreview,
  searchCatalogProducts,
  isPlaceholderIdentifier,
  provenanceForProfile,
  type AppDb,
} from "@open-filament/db";
import {
  aggregateProfileFields,
  failureCategories,
  compareCatalogLabels,
  buildExportFilename,
} from "@open-filament/domain";
import {
  toCanonicalFromRevision,
  openFilamentProfileV1Schema,
} from "@open-filament/canonical-profile";
import { convertCanonicalToCrealityUserPreset, buildCrealityInfoFile, suggestCompatiblePrinter } from "@open-filament/slicer-creality";
import { convertCanonicalToOrcaFilamentPreset } from "@open-filament/slicer-orca";
import { convertCanonicalToPrusaConfigBundle } from "@open-filament/slicer-prusa";
import { convertCanonicalToBambuFilamentPreset } from "@open-filament/slicer-bambu";
import { CrealityCfsCodec } from "@open-filament/rfid-cfs";
import { mapCatalogToOpenPrintTagMain } from "@open-filament/rfid-openprinttag";
import { applyAmazonAffiliateToPurchaseLinks } from "@open-filament/domain";
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

  app.get("/api/v1/health", async () => {
    const manufacturers = db().select().from(schema.manufacturers).all().length;
    const products = db().select().from(schema.filamentProducts).all().length;
    const variants = db().select().from(schema.filamentVariants).all().length;
    const ofdProducts = db()
      .select()
      .from(schema.filamentProducts)
      .where(eq(schema.filamentProducts.sourceType, "open_filament_database"))
      .all().length;
    return {
      ok: true,
      service: "open-filament-api",
      time: new Date().toISOString(),
      catalog: {
        manufacturers,
        products,
        variants,
        ofdProducts,
        fixtureOnly: ofdProducts === 0 && manufacturers > 0 && manufacturers < 10,
      },
    };
  });

  app.get("/openapi.json", async (req) => {
    const host = req.headers.host ?? "127.0.0.1:8787";
    const proto = (req.headers["x-forwarded-proto"] as string) ?? "http";
    return buildOpenApiDocument(`${proto}://${host}`);
  });

  app.get("/api/v1/manufacturers", async () => {
    return db().select().from(schema.manufacturers).all();
  });

  app.post("/api/v1/community/manufacturers", {
    config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
      const body = z
        .object({ name: z.string().min(1).max(120) })
        .safeParse(req.body);
      if (!body.success) return badRequest(reply, "Invalid body", body.error.flatten());
      try {
        const { resolveOrCreateManufacturer } = await import("@open-filament/db");
        const result = resolveOrCreateManufacturer(db(), body.data.name);
        return reply.status(result.created ? 201 : 200).send(result);
      } catch (e) {
        return badRequest(reply, e instanceof Error ? e.message : "Could not create brand");
      }
    },
  });

  app.post("/api/v1/community/filaments", {
    config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
      const body = z
        .object({
          manufacturerUuid: z.string().uuid(),
          materialCode: z.string().min(1).max(40),
          productName: z.string().min(1).max(200),
        })
        .safeParse(req.body);
      if (!body.success) return badRequest(reply, "Invalid body", body.error.flatten());
      try {
        const { resolveOrCreateFilamentProduct } = await import("@open-filament/db");
        const result = resolveOrCreateFilamentProduct(db(), body.data);
        return reply.status(result.created ? 201 : 200).send(result);
      } catch (e) {
        return badRequest(reply, e instanceof Error ? e.message : "Could not create product");
      }
    },
  });

  app.post("/api/v1/community/variants", {
    config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
      const body = z
        .object({
          filamentProductUuid: z.string().uuid(),
          variantName: z.string().min(1).max(200),
          colorName: z.string().max(120).optional().nullable(),
          primaryColorHex: z.string().max(7).optional().nullable(),
        })
        .safeParse(req.body);
      if (!body.success) return badRequest(reply, "Invalid body", body.error.flatten());
      try {
        const { resolveOrCreateFilamentVariant } = await import("@open-filament/db");
        const result = resolveOrCreateFilamentVariant(db(), body.data);
        return reply.status(result.created ? 201 : 200).send(result);
      } catch (e) {
        return badRequest(reply, e instanceof Error ? e.message : "Could not create colour");
      }
    },
  });

  app.post<{ Params: { uuid: string } }>(
    "/api/v1/community/variants/:uuid/purchase-links",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      handler: async (req, reply) => {
        const body = z
          .object({
            storeName: z.string().min(1).max(120),
            url: z.string().min(1).max(2000),
          })
          .safeParse(req.body);
        if (!body.success) {
          return badRequest(reply, "Invalid body", body.error.flatten());
        }
        try {
          const { addPurchaseLinkToVariant } = await import("@open-filament/db");
          const result = addPurchaseLinkToVariant(db(), {
            variantUuid: req.params.uuid,
            storeName: body.data.storeName,
            url: body.data.url,
          });
          return reply.status(result.created ? 201 : 200).send({
            ...result,
            purchaseLinks: applyAmazonAffiliateToPurchaseLinks(
              result.purchaseLinks,
            ),
          });
        } catch (e) {
          return badRequest(
            reply,
            e instanceof Error ? e.message : "Could not add shop link",
          );
        }
      },
    },
  );

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

  app.get<{
    Querystring: {
      manufacturerUuid?: string;
      materialCode?: string;
      includeFixtures?: string;
    };
  }>("/api/v1/filaments", async (req) => {
    const { manufacturerUuid, materialCode, includeFixtures } = req.query;
    const includeDemo = includeFixtures === "1" || includeFixtures === "true";
    const rows = db()
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
        sourceType: schema.filamentProducts.sourceType,
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
    return rows
      .filter((r) => {
        if (
          !includeDemo &&
          (r.isSyntheticFixture || r.sourceType === "synthetic_fixture")
        ) {
          return false;
        }
        if (manufacturerUuid && r.manufacturerUuid !== manufacturerUuid)
          return false;
        if (materialCode && r.materialCode !== materialCode) return false;
        return true;
      })
      .sort((a, b) =>
        compareCatalogLabels(
          a.manufacturerName,
          a.productName,
          b.manufacturerName,
          b.productName,
        ),
      );
  });

  app.get("/api/v1/catalog/preview", async () => {
    return getCatalogPreview(db(), { limit: 12 });
  });

  app.get<{
    Querystring: {
      q?: string;
      brand?: string;
      material?: string;
      page?: string;
      pageSize?: string;
    };
  }>("/api/v1/catalog/search", async (req) => {
    const page = Number(req.query.page ?? "1");
    const pageSize = Number(req.query.pageSize ?? "24");
    return searchCatalogProducts(db(), {
      q: req.query.q,
      brand: req.query.brand,
      material: req.query.material,
      page: Number.isFinite(page) ? page : 1,
      pageSize: Number.isFinite(pageSize) ? pageSize : 24,
    });
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
          productSourceType: schema.filamentProducts.sourceType,
          productSourceReference: schema.filamentProducts.sourceReference,
          diameterMm: schema.filamentProducts.diameterMm,
          diameterToleranceMm: schema.filamentProducts.diameterToleranceMm,
          minNozzleDiameterMm: schema.filamentProducts.minNozzleDiameterMm,
          densityGCm3: schema.filamentProducts.densityGCm3,
          datasheetUrl: schema.filamentProducts.datasheetUrl,
          safetySheetUrl: schema.filamentProducts.safetySheetUrl,
          mfrNozzleTempMinC: schema.filamentProducts.mfrNozzleTempMinC,
          mfrNozzleTempMaxC: schema.filamentProducts.mfrNozzleTempMaxC,
          mfrBedTempMinC: schema.filamentProducts.mfrBedTempMinC,
          mfrBedTempMaxC: schema.filamentProducts.mfrBedTempMaxC,
          mfrChamberTempC: schema.filamentProducts.mfrChamberTempC,
          mfrChamberTempMinC: schema.filamentProducts.mfrChamberTempMinC,
          mfrChamberTempMaxC: schema.filamentProducts.mfrChamberTempMaxC,
          mfrPreheatTempC: schema.filamentProducts.mfrPreheatTempC,
          dryingTempC: schema.filamentProducts.dryingTempC,
          dryingDurationHours: schema.filamentProducts.dryingDurationHours,
          shrinkagePercentXy: schema.filamentProducts.shrinkagePercentXy,
          shrinkagePercentZ: schema.filamentProducts.shrinkagePercentZ,
          shoreHardnessA: schema.filamentProducts.shoreHardnessA,
          shoreHardnessD: schema.filamentProducts.shoreHardnessD,
          abrasive: schema.filamentProducts.abrasive,
          manufacturerUuid: schema.manufacturers.uuid,
          manufacturerName: schema.manufacturers.name,
          materialCode: schema.materialFamilies.code,
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
      const hasMaterial = Boolean(row.materialCode);
      const hasNozzleTemp =
        row.mfrNozzleTempMinC != null || row.mfrNozzleTempMaxC != null;
      const hasBedTemp =
        row.mfrBedTempMinC != null || row.mfrBedTempMaxC != null;
      const hasColor = Boolean(row.variant.primaryColorHex);
      return {
        ...row.variant,
        productUuid: row.productUuid,
        productName: row.productName,
        manufacturerUuid: row.manufacturerUuid,
        manufacturerName: row.manufacturerName,
        materialCode: row.materialCode,
        sourceType: row.productSourceType,
        sourceReference: row.productSourceReference,
        diameterMm: row.diameterMm,
        diameterToleranceMm: row.diameterToleranceMm,
        densityGCm3: row.densityGCm3,
        datasheetUrl: row.datasheetUrl,
        safetySheetUrl: row.safetySheetUrl,
        abrasive: row.abrasive,
        defaultNozzleDiameterMm: 0.4,
        identifiers: {
          sku: row.variant.manufacturerSku,
          ean: row.variant.ean,
          upc: row.variant.upc,
          gtin: row.variant.gtin,
        },
        purchaseLinks: applyAmazonAffiliateToPurchaseLinks(
          parsePurchaseLinks(row.variant.purchaseLinksJson),
        ),
        preview: {
          imageUrl: row.variant.previewImageUrl,
          colorHex: row.variant.primaryColorHex,
          swatchPath: `/api/v1/variants/${row.variant.uuid}/swatch.svg`,
        },
        manufacturerSpecs: {
          nozzleTempMinC: row.mfrNozzleTempMinC,
          nozzleTempMaxC: row.mfrNozzleTempMaxC,
          bedTempMinC: row.mfrBedTempMinC,
          bedTempMaxC: row.mfrBedTempMaxC,
          chamberTempC: row.mfrChamberTempC,
          chamberTempMinC: row.mfrChamberTempMinC,
          chamberTempMaxC: row.mfrChamberTempMaxC,
          preheatTempC: row.mfrPreheatTempC,
          dryingTempC: row.dryingTempC,
          dryingDurationHours: row.dryingDurationHours,
          shrinkagePercentXy: row.shrinkagePercentXy,
          shrinkagePercentZ: row.shrinkagePercentZ,
          shoreHardnessA: row.shoreHardnessA,
          shoreHardnessD: row.shoreHardnessD,
          minNozzleDiameterMm: row.minNozzleDiameterMm,
          note: "Manufacturer / catalog claims — not community calibration",
        },
        catalogMinimums: {
          material: hasMaterial,
          nozzleTemp: hasNozzleTemp,
          bedTemp: hasBedTemp,
          color: hasColor,
          defaultNozzleSizeMm: 0.4,
          complete: hasMaterial && hasNozzleTemp && hasBedTemp && hasColor,
        },
        isSyntheticFixture:
          row.variant.isSyntheticFixture || row.productSynthetic,
        catalogLinks: {
          openFilamentDatabase: "https://openfilamentdatabase.org",
          openFilamentDatabaseApi: "https://api.openfilamentdatabase.org/",
          openPrintTagSpec: "https://specs.openprinttag.org/",
        },
      };
    },
  );

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/variants/:uuid/swatch.svg",
    async (req, reply) => {
      const row = db()
        .select({
          hex: schema.filamentVariants.primaryColorHex,
          name: schema.filamentVariants.variantName,
        })
        .from(schema.filamentVariants)
        .where(eq(schema.filamentVariants.uuid, req.params.uuid))
        .get();
      if (!row) return notFound(reply, "Variant not found");
      const fill = sanitizeHex(row.hex) ?? "#9a958c";
      const label = escapeXml((row.name ?? "filament").slice(0, 28));
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480" role="img" aria-label="${label}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${fill}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${fill}" stop-opacity="0.72"/>
    </linearGradient>
  </defs>
  <rect width="480" height="480" fill="#f3efe6"/>
  <circle cx="240" cy="210" r="150" fill="url(#g)" stroke="#1c1a17" stroke-opacity="0.18" stroke-width="4"/>
  <text x="240" y="420" text-anchor="middle" font-family="Georgia, serif" font-size="28" fill="#1c1a17">${label}</text>
  <text x="240" y="452" text-anchor="middle" font-family="ui-sans-serif, system-ui, sans-serif" font-size="18" fill="#5c564c">${fill}</text>
</svg>`;
      return reply
        .header("content-type", "image/svg+xml; charset=utf-8")
        .header("cache-control", "public, max-age=86400")
        .send(svg);
    },
  );

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/variants/:uuid/openprinttag",
    async (req, reply) => {
      const row = db()
        .select({
          variant: schema.filamentVariants,
          productUuid: schema.filamentProducts.uuid,
          productName: schema.filamentProducts.productName,
          productSourceType: schema.filamentProducts.sourceType,
          diameterMm: schema.filamentProducts.diameterMm,
          manufacturerUuid: schema.manufacturers.uuid,
          manufacturerName: schema.manufacturers.name,
          materialCode: schema.materialFamilies.code,
          mfrNozzleTempMinC: schema.filamentProducts.mfrNozzleTempMinC,
          mfrNozzleTempMaxC: schema.filamentProducts.mfrNozzleTempMaxC,
          mfrBedTempMinC: schema.filamentProducts.mfrBedTempMinC,
          mfrBedTempMaxC: schema.filamentProducts.mfrBedTempMaxC,
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

      const fromOfd = row.productSourceType === "open_filament_database";
      const materialDisplayName = `${row.productName} ${row.variant.variantName}`.trim();
      const fields = mapCatalogToOpenPrintTagMain({
        brandName: row.manufacturerName,
        brandUuid: fromOfd ? row.manufacturerUuid : null,
        materialCode: row.materialCode,
        materialDisplayName,
        materialUuid: fromOfd ? row.productUuid : null,
        variantUuid: row.variant.uuid,
        colorHex: row.variant.primaryColorHex,
        nozzleMinC: row.mfrNozzleTempMinC,
        nozzleMaxC: row.mfrNozzleTempMaxC,
        bedMinC: row.mfrBedTempMinC,
        bedMaxC: row.mfrBedTempMaxC,
        diameterMm: row.diameterMm,
        ofdVariantUuid: fromOfd ? row.variant.uuid : null,
      });

      return {
        variantUuid: row.variant.uuid,
        scheme: "OpenPrintTag",
        spec: "https://specs.openprinttag.org/",
        catalog: "https://openfilamentdatabase.org",
        fields,
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
          printerManufacturer: schema.printerModels.manufacturerName,
          printerModel: schema.printerModels.model,
          printerName: sql<string>`${schema.printerModels.manufacturerName} || ' ' || ${schema.printerModels.model}`,
          nozzleDiameterMm: schema.toolheadConfigs.nozzleDiameterMm,
          currentRevisionUuid: schema.calibrationRevisions.uuid,
          notes: schema.calibrationRevisions.notes,
          status: schema.calibrationRevisions.status,
          updatedAt: schema.calibrationRevisions.updatedAt,
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
        .all()
        .filter((p) => {
          const prov = provenanceForProfile({
            isSyntheticFixture: p.isSyntheticFixture,
            title: p.title,
            notes: p.notes,
          });
          return prov !== "test" && prov !== "demo";
        })
        .map((p) => ({
          ...p,
          provenance: provenanceForProfile({
            isSyntheticFixture: p.isSyntheticFixture,
            title: p.title,
            notes: p.notes,
          }),
        }));
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
          title: schema.calibrationProfiles.title,
          notes: schema.calibrationRevisions.notes,
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
        .all()
        .filter((r) => {
          const prov = provenanceForProfile({
            isSyntheticFixture: r.isSyntheticFixture,
            title: r.title,
            notes: r.notes,
          });
          return prov !== "test" && prov !== "demo" && prov !== "starter";
        });

      const aggregation = aggregateProfileFields(revisions);
      return {
        variantUuid: variant.uuid,
        sampleProfileCount: revisions.length,
        syntheticSampleCount: 0,
        measuredSampleCount: revisions.length,
        warning: null,
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
        nozzleTempMinC: num(params.nozzleTempMinC),
        nozzleTempMaxC: num(params.nozzleTempMaxC),
        bedTempFirstLayerC: num(params.bedTempFirstLayerC),
        bedTempOtherLayersC: num(params.bedTempOtherLayersC),
        chamberTempC: num(params.chamberTempC),
        enclosureRecommended:
          typeof params.enclosureRecommended === "boolean"
            ? params.enclosureRecommended
            : null,
        chamberHeaterActive:
          typeof params.chamberHeaterActive === "boolean"
            ? params.chamberHeaterActive
            : false,
        flowRatio: num(params.flowRatio),
        pressureAdvance: num(params.pressureAdvance),
        maxVolumetricFlowMm3s: num(params.maxVolumetricFlowMm3s),
        fanMinPercent: num(params.fanMinPercent),
        fanMaxPercent: num(params.fanMaxPercent),
        retractionDistanceMm: num(params.retractionDistanceMm),
        shrinkagePercentXy: num(params.shrinkagePercentXy),
        shrinkagePercentZ: num(params.shrinkagePercentZ),
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

  /**
   * Public community calibration submit — no login.
   * Required: nozzle temp range, calibrated nozzle diameter, tested bed temp;
   * chamber heater + set temp when chamber heater was used.
   */
  app.post("/api/v1/community/profiles", async (req, reply) => {
    const ip =
      (req.headers["x-forwarded-for"] as string | undefined)
        ?.split(",")[0]
        ?.trim() ||
      req.ip ||
      "unknown";
    if (!allowCommunitySubmit(ip)) {
      return reply.status(429).send({
        error: {
          message: "Too many submissions from this address. Try again later.",
        },
      });
    }

    const bodySchema = z
      .object({
        filamentVariantUuid: z.string().uuid(),
        printerBrand: z.string().min(1).max(120),
        printerModel: z.string().min(1).max(120),
        nozzleDiameterMm: z.number().positive().max(2),
        nozzleTempMinC: z.number().min(0).max(500),
        nozzleTempMaxC: z.number().min(0).max(500),
        bedTempC: z.number().min(0).max(200),
        chamberHeaterActive: z.boolean(),
        chamberTempC: z.number().min(0).max(200).optional().nullable(),
        title: z.string().min(1).max(200).optional(),
        notes: z.string().max(4000).optional(),
        contributorName: z.string().max(120).optional(),
        flowRatio: z.number().positive().max(2).optional(),
        pressureAdvance: z.number().min(0).max(2).optional(),
      })
      .superRefine((val, ctx) => {
        if (val.nozzleTempMaxC < val.nozzleTempMinC) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "nozzleTempMaxC must be >= nozzleTempMinC",
            path: ["nozzleTempMaxC"],
          });
        }
        if (
          val.chamberHeaterActive &&
          (val.chamberTempC == null || !Number.isFinite(val.chamberTempC))
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "chamberTempC is required when chamber heater was used",
            path: ["chamberTempC"],
          });
        }
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
    if (!variant) return badRequest(reply, "Unknown filament variant");

    let resolved;
    try {
      resolved = resolveOrCreatePrinter({
        brand: body.printerBrand,
        model: body.printerModel,
        nozzleDiameterMm: body.nozzleDiameterMm,
      });
    } catch (err) {
      return badRequest(
        reply,
        err instanceof Error ? err.message : "Could not resolve printer",
      );
    }

    const printerRow = db()
      .select()
      .from(schema.printerModels)
      .where(eq(schema.printerModels.uuid, resolved.printer.uuid))
      .get();
    const toolheadRow = db()
      .select()
      .from(schema.toolheadConfigs)
      .where(eq(schema.toolheadConfigs.uuid, resolved.toolhead.uuid))
      .get();
    if (!printerRow || !toolheadRow) {
      return badRequest(reply, "Printer resolve failed");
    }

    const community = await ensureCommunityUser(db());
    const title =
      body.title?.trim() ||
      `Community · ${body.printerBrand} ${body.printerModel} · ${body.nozzleDiameterMm} mm`;

    const noteParts = [
      "Community submission (no account).",
      body.contributorName ? `By: ${body.contributorName}` : null,
      body.notes?.trim() || null,
    ].filter(Boolean);

    const [profile] = db()
      .insert(schema.calibrationProfiles)
      .values({
        uuid: uuid(),
        filamentVariantId: variant.id,
        printerModelId: printerRow.id,
        toolheadConfigId: toolheadRow.id,
        createdByUserId: community.id,
        title,
        isSyntheticFixture: false,
      })
      .returning()
      .all();

    const midNozzle = (body.nozzleTempMinC + body.nozzleTempMaxC) / 2;
    const [rev] = db()
      .insert(schema.calibrationRevisions)
      .values({
        uuid: uuid(),
        profileId: profile!.id,
        revisionNumber: 1,
        createdByUserId: community.id,
        status: "published",
        notes: noteParts.join("\n"),
        nozzleTempMinC: body.nozzleTempMinC,
        nozzleTempMaxC: body.nozzleTempMaxC,
        nozzleTempFirstLayerC: body.nozzleTempMaxC,
        nozzleTempOtherLayersC: midNozzle,
        bedTempFirstLayerC: body.bedTempC,
        bedTempOtherLayersC: body.bedTempC,
        chamberHeaterActive: body.chamberHeaterActive,
        chamberTempC: body.chamberHeaterActive
          ? (body.chamberTempC ?? null)
          : null,
        enclosureRecommended: body.chamberHeaterActive,
        flowRatio: body.flowRatio ?? null,
        pressureAdvance: body.pressureAdvance ?? null,
        userConfidence: 0.4,
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
      status: "published",
      printer: {
        brand: resolved.printer.manufacturerName,
        model: resolved.printer.model,
        nozzleDiameterMm: resolved.toolhead.nozzleDiameterMm,
      },
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
      if (!profile) return notFound(reply, "Profile not found");
      const published = db()
        .select()
        .from(schema.calibrationRevisions)
        .where(
          and(
            eq(schema.calibrationRevisions.profileId, profile.id),
            eq(schema.calibrationRevisions.status, "published"),
          ),
        )
        .get();
      const revisionId = published?.id ?? profile.currentRevisionId;
      if (!revisionId) return notFound(reply, "No revision to confirm");
      const body = (req.body ?? {}) as { notes?: string };
      try {
        const [row] = db()
          .insert(schema.profileConfirmations)
          .values({
            uuid: uuid(),
            revisionId,
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
      if (!profile) return notFound(reply, "Profile not found");
      const published = db()
        .select()
        .from(schema.calibrationRevisions)
        .where(
          and(
            eq(schema.calibrationRevisions.profileId, profile.id),
            eq(schema.calibrationRevisions.status, "published"),
          ),
        )
        .get();
      const revisionId = published?.id ?? profile.currentRevisionId;
      if (!revisionId) return notFound(reply, "No revision for failure report");
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
          revisionId,
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

  app.get("/api/v1/printer-brands", async () => {
    return listPrinterBrands();
  });

  app.post("/api/v1/printers/resolve", async (req, reply) => {
    const user = await requireAuth(req);
    if (!user) return unauthorized(reply);
    const bodySchema = z.object({
      brand: z.string().min(1).max(120),
      model: z.string().min(1).max(120),
      nozzleDiameterMm: z.number().min(0).max(2),
      hotendName: z.string().min(1).max(80).optional(),
      technology: z.enum(["fff", "resin", "sls", "other"]).optional(),
    });
    const parsed = bodySchema.safeParse(req.body);
    if (!parsed.success) {
      return badRequest(reply, "Invalid body", parsed.error.flatten());
    }
    try {
      const result = resolveOrCreatePrinter(parsed.data);
      return reply.status(result.created.printer || result.created.toolhead ? 201 : 200).send(result);
    } catch (err) {
      return badRequest(
        reply,
        err instanceof Error ? err.message : "Could not resolve printer",
      );
    }
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

  app.get<{
    Querystring: {
      q?: string;
      limit?: string;
      page?: string;
      pageSize?: string;
      material?: string;
    };
  }>("/api/v1/search", async (req) => {
      const q = req.query.q ?? "";
      const material = (req.query.material ?? "").trim();
      const pageRaw = Number(req.query.page ?? "1");
      const pageSizeRaw = Number(
        req.query.pageSize ?? req.query.limit ?? "24",
      );
      const page =
        Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
      const pageSize =
        Number.isFinite(pageSizeRaw) && pageSizeRaw > 0
          ? Math.min(48, Math.floor(pageSizeRaw))
          : 24;

      const color = searchVariantsByColor(db(), q, {
        page,
        pageSize,
        material: material || undefined,
      });
      if (color) {
        return {
          query: q,
          mode: "color" as const,
          color: {
            hex: color.parsed.hex,
            kind: color.parsed.kind,
            label: color.parsed.label,
          },
          page: color.page,
          pageSize: color.pageSize,
          total: color.total,
          materialFacets: color.materialFacets,
          results: color.results,
        };
      }

      const limitRaw = Number(req.query.limit ?? "40");
      const limit =
        Number.isFinite(limitRaw) && limitRaw > 0
          ? Math.min(100, Math.floor(limitRaw))
          : 40;

      return {
        query: q,
        mode: "text" as const,
        results: searchDocuments(db(), q, Math.min(limit, 40)),
      };
    },
  );

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
    const suggestedFileName = buildExportFilename({
      formatId: "creality",
      manufacturerName: canonical.profile.filament.manufacturerName,
      productName: canonical.profile.filament.productName,
      variantName: canonical.profile.filament.variantName,
      printerModel: canonical.profile.context.printerModel,
      nozzleDiameterMm: canonical.profile.context.nozzleDiameterMm,
    });
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
    const suggestedFileName = buildExportFilename({
      formatId: "orca",
      manufacturerName: canonical.profile.filament.manufacturerName,
      productName: canonical.profile.filament.productName,
      variantName: canonical.profile.filament.variantName,
      printerModel: canonical.profile.context.printerModel,
      nozzleDiameterMm: canonical.profile.context.nozzleDiameterMm,
    });
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

  app.post("/api/v1/exports/prusaslicer", async (req, reply) => {
    const canonical = await resolveCanonical(db(), req.body);
    if (!canonical.ok) return badRequest(reply, canonical.message);
    const ini = convertCanonicalToPrusaConfigBundle(canonical.profile);
    const suggestedFileName = buildExportFilename({
      formatId: "prusaslicer",
      manufacturerName: canonical.profile.filament.manufacturerName,
      productName: canonical.profile.filament.productName,
      variantName: canonical.profile.filament.variantName,
      printerModel: canonical.profile.context.printerModel,
      nozzleDiameterMm: canonical.profile.context.nozzleDiameterMm,
    });
    return {
      format: "prusaslicer-filament-ini",
      presetText: ini,
      suggestedFileName,
      importHint:
        "Import via PrusaSlicer: File → Import → Import Config Bundle… (or place .ini in the filament folder).",
      bridgeInstallPayload: {
        slicer: "prusaslicer",
        presetText: ini,
        fileName: suggestedFileName,
      },
    };
  });

  app.post("/api/v1/exports/bambu", async (req, reply) => {
    const canonical = await resolveCanonical(db(), req.body);
    if (!canonical.ok) return badRequest(reply, canonical.message);
    const optsBody = z
      .object({
        nozzleDiameterMm: z.number().optional(),
        printerModel: z.string().optional(),
      })
      .safeParse(req.body ?? {});
    const opts = optsBody.success ? optsBody.data : {};
    const preset = convertCanonicalToBambuFilamentPreset(canonical.profile, opts);
    const suggestedFileName = buildExportFilename({
      formatId: "bambu",
      manufacturerName: canonical.profile.filament.manufacturerName,
      productName: canonical.profile.filament.productName,
      variantName: canonical.profile.filament.variantName,
      printerModel: canonical.profile.context.printerModel,
      nozzleDiameterMm: canonical.profile.context.nozzleDiameterMm,
    });
    return {
      format: "bambu-studio-filament-user-preset",
      preset,
      suggestedFileName,
      inherits: String(preset.inherits),
      bridgeInstallPayload: {
        slicer: "bambu_studio",
        presetJson: preset,
        fileName: suggestedFileName,
      },
    };
  });

  app.post("/api/v1/exports/openfilamentprofile", async (req, reply) => {
    const canonical = await resolveCanonical(db(), req.body);
    if (!canonical.ok) return badRequest(reply, canonical.message);
    const suggestedFileName = buildExportFilename({
      formatId: "openfilamentprofile",
      manufacturerName: canonical.profile.filament.manufacturerName,
      productName: canonical.profile.filament.productName,
      variantName: canonical.profile.filament.variantName,
      printerModel: canonical.profile.context.printerModel,
      nozzleDiameterMm: canonical.profile.context.nozzleDiameterMm,
    });
    return {
      format: "openfilament-profile-v1",
      profile: canonical.profile,
      suggestedFileName,
    };
  });

  app.post("/api/v1/auth/login", {
    config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
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
    },
  });

  app.post("/api/v1/auth/register", {
    config: { rateLimit: { max: 10, timeWindow: "1 hour" } },
    handler: async (req, reply) => {
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
    },
  });
}

function num(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}

/** Simple IP rate limit for anonymous community submits. */
const communitySubmitHits = new Map<string, number[]>();
function allowCommunitySubmit(ip: string, maxPerHour = 8): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const prev = (communitySubmitHits.get(ip) ?? []).filter(
    (t) => now - t < windowMs,
  );
  if (prev.length >= maxPerHour) {
    communitySubmitHits.set(ip, prev);
    return false;
  }
  prev.push(now);
  communitySubmitHits.set(ip, prev);
  return true;
}

function parsePurchaseLinks(
  raw: string | null | undefined,
): Array<{ storeName: string; url: string; storeSlug?: string }> {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(
        (x): x is { storeName: string; url: string; storeSlug?: string } =>
          Boolean(
            x &&
              typeof x === "object" &&
              typeof (x as { storeName?: unknown }).storeName === "string" &&
              typeof (x as { url?: unknown }).url === "string",
          ),
      )
      .slice(0, 48);
  } catch {
    return [];
  }
}

function sanitizeHex(input: string | null | undefined): string | null {
  if (!input) return null;
  const m = input.trim().match(/^#?([0-9a-fA-F]{6})$/);
  return m ? `#${m[1]!.toLowerCase()}` : null;
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
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
    shrinkagePercentXy: rev.shrinkagePercentXy,
    shrinkagePercentZ: rev.shrinkagePercentZ,
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
