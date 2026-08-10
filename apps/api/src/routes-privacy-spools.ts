import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  deleteUserAccount,
  exportUserData,
  getOwnedSpool,
  hardDeleteUserSpool,
  hashToken,
  listActiveSessions,
  listUserSpools,
  recordContributionTerms,
  resolvePublicSpoolByIdentity,
  revokeOtherSessions,
  revokeSession,
  schema,
  searchAutocomplete,
  softDeleteUserSpool,
  upsertPrivacyPrefs,
  upsertUserSpool,
  verifyPassword,
  type AppDb,
} from "@open-filament/db";
import { resolveRequestUser, type AuthUser } from "./auth.js";
import { badRequest, notFound, unauthorized } from "./errors.js";
import { assertCloudWriteAccess } from "./payments/access.js";

function db(app: FastifyInstance): AppDb {
  return app.db;
}

const usageQuantitySchema = z.object({
  lengthMm: z.number().nullable().optional(),
  volumeMm3: z.number().nullable().optional(),
  weightG: z.number().nullable().optional(),
});

const usageTransactionSchema = z.object({
  uuid: z.string().uuid(),
  spoolId: z.string().min(1),
  printJobId: z.string().nullable().optional(),
  eventId: z.string().nullable().optional(),
  slicer: z.string().nullable().optional(),
  slicerVersion: z.string().nullable().optional(),
  printerIntegrationType: z.string().nullable().optional(),
  status: z.enum([
    "queued",
    "printing",
    "completed",
    "failed",
    "cancelled",
    "interrupted",
    "unknown",
  ]),
  predicted: usageQuantitySchema,
  printerReported: usageQuantitySchema,
  deducted: usageQuantitySchema,
  materialDensityGcm3: z.number().positive(),
  filamentDiameterMm: z.number().positive(),
  usageSource: z.enum([
    "slicer_estimate",
    "completed_print_estimate",
    "printer_reported_usage",
    "manual_correction",
    "scale_measured_usage",
  ]),
  confidence: z.enum([
    "slicer_estimate",
    "completed_print_estimate",
    "printer_reported_extrusion",
    "rough_estimate",
    "manual",
    "scale_measured_actual",
  ]),
  recordedAt: z.string(),
  automaticallyGenerated: z.boolean(),
  manuallyConfirmed: z.boolean(),
  originalValues: z.record(z.unknown()),
  correctionOfTransactionUuid: z.string().nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
});

async function requireUser(
  request: {
    headers: { authorization?: string; cookie?: string };
    server: FastifyInstance;
  },
  reply: { status: (c: number) => { send: (b: unknown) => unknown } },
): Promise<AuthUser | null> {
  const user = await resolveRequestUser(request.server.db, request.headers);
  if (!user) {
    unauthorized(reply as never, "Authentication required");
    return null;
  }
  return user;
}

const spoolBodySchema = z.object({
  uuid: z.string().uuid().optional(),
  clientId: z.string().min(1).max(128).nullable().optional(),
  manufacturerUuid: z.string().nullable().optional(),
  manufacturerName: z.string().nullable().optional(),
  productUuid: z.string().nullable().optional(),
  productName: z.string().nullable().optional(),
  variantUuid: z.string().nullable().optional(),
  variantName: z.string().nullable().optional(),
  colorHex: z.string().nullable().optional(),
  materialCode: z.string().nullable().optional(),
  initialNetWeightG: z.number().nullable().optional(),
  currentWeightG: z.number().nullable().optional(),
  tareWeightG: z.number().nullable().optional(),
  remainingPercent: z.number().nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
  openedDate: z.string().nullable().optional(),
  batchLot: z.string().nullable().optional(),
  notes: z.string().max(4000).nullable().optional(),
  storageLocation: z.string().max(500).nullable().optional(),
  status: z
    .enum([
      "sealed",
      "open",
      "active",
      "drying",
      "stored",
      "low",
      "empty",
      "archived",
    ])
    .optional(),
  preferredPrinterUuid: z.string().nullable().optional(),
  preferredNozzleMm: z.number().nullable().optional(),
  archivedAt: z.string().nullable().optional(),
  syncVersion: z.number().int().positive().optional(),
  dryingEvents: z
    .array(
      z.object({
        uuid: z.string().uuid().optional(),
        startedAt: z.string(),
        endedAt: z.string().nullable().optional(),
        tempC: z.number().nullable().optional(),
        durationHours: z.number().nullable().optional(),
        notes: z.string().nullable().optional(),
      }),
    )
    .optional(),
  identities: z
    .array(
      z.object({
        uuid: z.string().uuid().optional(),
        kind: z.enum(["qr", "rfid"]),
        value: z.string().min(1).max(512),
        label: z.string().nullable().optional(),
      }),
    )
    .optional(),
  usageTransactions: z.array(usageTransactionSchema).max(1000).optional(),
});

export async function registerPrivacySpoolRoutes(app: FastifyInstance) {
  app.get("/api/v1/catalog/autocomplete", {
    config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    handler: async (req) => {
      const q = String((req.query as { q?: string }).q ?? "");
      const limit = Number((req.query as { limit?: string }).limit ?? "12");
      return {
        query: q,
        results: searchAutocomplete(
          db(app),
          q,
          Number.isFinite(limit) ? limit : 12,
        ),
      };
    },
  });

  app.get("/api/v1/spools", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const query = req.query as {
      page?: string;
      pageSize?: string;
      includeArchived?: string;
    };
    return listUserSpools(db(app), user.id, {
      page: Number(query.page ?? "1"),
      pageSize: Number(query.pageSize ?? "50"),
      includeArchived: query.includeArchived === "1",
    });
  });

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/spools/:uuid",
    async (req, reply) => {
      const user = await requireUser(req, reply);
      if (!user) return;
      const spool = getOwnedSpool(db(app), user.id, req.params.uuid);
      if (!spool) return notFound(reply, "Spool not found");
      return spool;
    },
  );

  app.post("/api/v1/spools", {
    config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
      const user = await requireUser(req, reply);
      if (!user) return;
      const access = assertCloudWriteAccess(db(app), user.id);
      if (!access.ok) {
        return reply.status(access.status).send({
          error: { code: "cloud_access_required", message: access.message },
        });
      }
      const parsed = spoolBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(reply, "Invalid spool", parsed.error.flatten());
      }
      const spool = upsertUserSpool(db(app), user.id, parsed.data);
      return reply.status(201).send(spool);
    },
  });

  app.put<{ Params: { uuid: string } }>(
    "/api/v1/spools/:uuid",
    async (req, reply) => {
      const user = await requireUser(req, reply);
      if (!user) return;
      const access = assertCloudWriteAccess(db(app), user.id);
      if (!access.ok) {
        return reply.status(access.status).send({
          error: { code: "cloud_access_required", message: access.message },
        });
      }
      const parsed = spoolBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return badRequest(reply, "Invalid spool", parsed.error.flatten());
      }
      const existing = getOwnedSpool(db(app), user.id, req.params.uuid);
      if (!existing) return notFound(reply, "Spool not found");
      return upsertUserSpool(db(app), user.id, {
        ...parsed.data,
        uuid: req.params.uuid,
      });
    },
  );

  app.post("/api/v1/spools/sync", {
    config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
      const user = await requireUser(req, reply);
      if (!user) return;
      const access = assertCloudWriteAccess(db(app), user.id);
      if (!access.ok) {
        return reply.status(access.status).send({
          error: { code: "cloud_access_required", message: access.message },
        });
      }
      const body = z
        .object({
          spools: z.array(spoolBodySchema).max(200),
        })
        .safeParse(req.body);
      if (!body.success) {
        return badRequest(reply, "Invalid sync payload", body.error.flatten());
      }
      const results = [];
      for (const item of body.data.spools) {
        results.push(upsertUserSpool(db(app), user.id, item));
      }
      return {
        synced: results.length,
        conflictPolicy: "last-write-wins-by-syncVersion",
        items: results,
      };
    },
  });

  app.delete<{ Params: { uuid: string } }>(
    "/api/v1/spools/:uuid",
    async (req, reply) => {
      const user = await requireUser(req, reply);
      if (!user) return;
      const access = assertCloudWriteAccess(db(app), user.id);
      if (!access.ok) {
        return reply.status(access.status).send({
          error: { code: "cloud_access_required", message: access.message },
        });
      }
      const hard = (req.query as { hard?: string }).hard === "1";
      const ok = hard
        ? hardDeleteUserSpool(db(app), user.id, req.params.uuid)
        : softDeleteUserSpool(db(app), user.id, req.params.uuid);
      if (!ok) return notFound(reply, "Spool not found");
      return { ok: true, hard };
    },
  );

  app.get("/api/v1/public/spools/resolve", {
    config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
      const query = req.query as { kind?: string; value?: string };
      if (query.kind !== "qr" && query.kind !== "rfid") {
        return badRequest(reply, "kind must be qr or rfid");
      }
      if (!query.value?.trim()) return badRequest(reply, "value is required");
      const hit = resolvePublicSpoolByIdentity(
        db(app),
        query.kind,
        query.value.trim(),
      );
      if (!hit) return notFound(reply, "Spool identity not found");
      return hit;
    },
  });

  app.get("/api/v1/me/export", {
    config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
      const user = await requireUser(req, reply);
      if (!user) return;
      const data = exportUserData(db(app), user.id);
      if (!data) return notFound(reply, "User not found");
      reply.header(
        "content-disposition",
        `attachment; filename="openfilament-export-${user.uuid}.json"`,
      );
      return data;
    },
  });

  app.get("/api/v1/me/sessions", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    return { sessions: listActiveSessions(db(app), user.id) };
  });

  app.post("/api/v1/me/sessions/revoke-others", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const auth = req.headers.authorization ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
    const n = revokeOtherSessions(db(app), user.id, hashToken(token));
    return { revoked: n };
  });

  app.post<{ Params: { uuid: string } }>(
    "/api/v1/me/sessions/:uuid/revoke",
    async (req, reply) => {
      const user = await requireUser(req, reply);
      if (!user) return;
      const ok = revokeSession(db(app), user.id, req.params.uuid);
      if (!ok) return notFound(reply, "Session not found");
      return { ok: true };
    },
  );

  app.post("/api/v1/me/delete", {
    config: { rateLimit: { max: 5, timeWindow: "1 hour" } },
    handler: async (req, reply) => {
      const user = await requireUser(req, reply);
      if (!user) return;
      const body = z
        .object({
          confirm: z.literal("DELETE"),
          password: z.string().min(1).optional(),
        })
        .safeParse(req.body);
      if (!body.success) {
        return badRequest(
          reply,
          'Send { "confirm": "DELETE" } to permanently delete your account',
        );
      }
      if (body.data.password) {
        const row = db(app)
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, user.id))
          .get();
        if (
          !row?.passwordHash ||
          !verifyPassword(body.data.password, row.passwordHash)
        ) {
          return unauthorized(reply, "Password confirmation failed");
        }
      }
      const result = deleteUserAccount(db(app), user.id, { ip: req.ip });
      return { ok: true, ...result };
    },
  });

  app.put("/api/v1/me/privacy", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const body = z
      .object({
        consentVersion: z.string().min(1),
        analytics: z.boolean(),
        marketing: z.boolean(),
        preferences: z.boolean(),
        locale: z.string().min(2).max(8),
      })
      .safeParse(req.body);
    if (!body.success) {
      return badRequest(reply, "Invalid privacy prefs", body.error.flatten());
    }
    return upsertPrivacyPrefs(db(app), user.id, body.data);
  });

  app.post("/api/v1/contributions/terms", async (req, reply) => {
    const user = await resolveRequestUser(db(app), req.headers);
    const body = z
      .object({
        termsVersion: z.string().min(1),
        contributionRef: z.string().optional(),
      })
      .safeParse(req.body);
    if (!body.success) return badRequest(reply, "Invalid body");
    recordContributionTerms(db(app), {
      userId: user?.id ?? null,
      termsVersion: body.data.termsVersion,
      contributionRef: body.data.contributionRef,
      ip: req.ip,
    });
    return { ok: true };
  });

  app.get("/api/v1/legal/status", async () => {
    const missing = [
      process.env.LEGAL_OWNER_NAME ? null : "LEGAL_OWNER_NAME",
      process.env.LEGAL_PRIVACY_EMAIL ? null : "LEGAL_PRIVACY_EMAIL",
      process.env.LEGAL_HOSTING_REGION ? null : "LEGAL_HOSTING_REGION",
    ].filter(Boolean);
    return {
      consentVersion: process.env.CONSENT_VERSION ?? "2026-08-10",
      contributionTermsVersion:
        process.env.CONTRIBUTION_TERMS_VERSION ?? "2026-08-10",
      analyticsConfigured: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
      legalPlaceholdersMissing: missing,
      productionBlocked: missing.length > 0,
    };
  });
}
