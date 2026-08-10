import { and, eq, isNull, ne } from "drizzle-orm";
import { createHash } from "node:crypto";
import { v4 as uuid } from "uuid";
import type { AppDb } from "./client.js";
import * as schema from "./schema.js";
import { purgeAllUserSpools } from "./user-spools.js";

function nowIso() {
  return new Date().toISOString();
}

function hashIp(ip: string | undefined): string | null {
  if (!ip) return null;
  return createHash("sha256").update(`of-ip:${ip}`).digest("hex").slice(0, 32);
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function exportUserData(db: AppDb, userId: number) {
  const user = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .get();
  if (!user) return null;

  const tokens = db
    .select({
      uuid: schema.apiTokens.uuid,
      name: schema.apiTokens.name,
      scopes: schema.apiTokens.scopes,
      createdAt: schema.apiTokens.createdAt,
      expiresAt: schema.apiTokens.expiresAt,
      revokedAt: schema.apiTokens.revokedAt,
      lastUsedAt: schema.apiTokens.lastUsedAt,
      userAgent: schema.apiTokens.userAgent,
    })
    .from(schema.apiTokens)
    .where(eq(schema.apiTokens.userId, userId))
    .all();

  const spools = db
    .select()
    .from(schema.userSpools)
    .where(
      and(eq(schema.userSpools.userId, userId), isNull(schema.userSpools.deletedAt)),
    )
    .all()
    .map((row) => {
      const drying = db
        .select()
        .from(schema.userSpoolDryingEvents)
        .where(eq(schema.userSpoolDryingEvents.spoolId, row.id))
        .all();
      const identities = db
        .select()
        .from(schema.userSpoolIdentities)
        .where(eq(schema.userSpoolIdentities.spoolId, row.id))
        .all();
      const usageTransactions = db
        .select()
        .from(schema.userSpoolUsageTransactions)
        .where(eq(schema.userSpoolUsageTransactions.spoolId, row.id))
        .all();
      return {
        uuid: row.uuid,
        clientId: row.clientId,
        manufacturerName: row.manufacturerName,
        productName: row.productName,
        variantName: row.variantName,
        colorHex: row.colorHex,
        materialCode: row.materialCode,
        initialNetWeightG: row.initialNetWeightG,
        currentWeightG: row.currentWeightG,
        tareWeightG: row.tareWeightG,
        remainingPercent: row.remainingPercent,
        purchaseDate: row.purchaseDate,
        openedDate: row.openedDate,
        batchLot: row.batchLot,
        notes: row.notes,
        storageLocation: row.storageLocation,
        status: row.status,
        preferredPrinterUuid: row.preferredPrinterUuid,
        preferredNozzleMm: row.preferredNozzleMm,
        archivedAt: row.archivedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        dryingEvents: drying,
        identities: identities.map((i) => ({
          uuid: i.uuid,
          kind: i.kind,
          value: i.value,
          label: i.label,
        })),
        usageTransactions: usageTransactions.map((tx) => ({
          uuid: tx.uuid,
          spoolId: row.uuid,
          printJobId: tx.printJobId,
          eventId: tx.eventId,
          slicer: tx.slicer,
          slicerVersion: tx.slicerVersion,
          printerIntegrationType: tx.printerIntegrationType,
          status: tx.status,
          predicted: parseJson(tx.predictedJson, {}),
          printerReported: parseJson(tx.printerReportedJson, {}),
          deducted: parseJson(tx.deductedJson, {}),
          materialDensityGcm3: tx.materialDensityGcm3,
          filamentDiameterMm: tx.filamentDiameterMm,
          usageSource: tx.usageSource,
          confidence: tx.confidence,
          recordedAt: tx.recordedAt,
          automaticallyGenerated: tx.automaticallyGenerated,
          manuallyConfirmed: tx.manuallyConfirmed,
          originalValues: parseJson(tx.originalValuesJson, {}),
          correctionOfTransactionUuid: tx.correctionOfTransactionUuid,
          notes: tx.notes,
        })),
      };
    });

  const profiles = db
    .select({
      uuid: schema.calibrationProfiles.uuid,
      title: schema.calibrationProfiles.title,
      createdAt: schema.calibrationProfiles.createdAt,
    })
    .from(schema.calibrationProfiles)
    .where(eq(schema.calibrationProfiles.createdByUserId, userId))
    .all();

  const privacy = db
    .select()
    .from(schema.userPrivacyPrefs)
    .where(eq(schema.userPrivacyPrefs.userId, userId))
    .get();

  const terms = db
    .select({
      termsVersion: schema.contributionTermsAcceptances.termsVersion,
      acceptedAt: schema.contributionTermsAcceptances.acceptedAt,
      contributionRef: schema.contributionTermsAcceptances.contributionRef,
    })
    .from(schema.contributionTermsAcceptances)
    .where(eq(schema.contributionTermsAcceptances.userId, userId))
    .all();

  return {
    exportedAt: nowIso(),
    schemaVersion: 1,
    account: {
      uuid: user.uuid,
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      role: user.role,
      locale: user.locale,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
    sessions: tokens,
    spools,
    contributions: { profiles },
    privacyPreferences: privacy
      ? {
          consentVersion: privacy.consentVersion,
          analytics: privacy.analytics,
          marketing: privacy.marketing,
          preferences: privacy.preferences,
          locale: privacy.locale,
          decidedAt: privacy.decidedAt,
        }
      : null,
    contributionTermsAcceptances: terms,
  };
}

/**
 * Hard-delete private data; anonymize public contributions.
 * Conflict policy: licensed community calibrations remain with anonymous attribution.
 */
export function deleteUserAccount(
  db: AppDb,
  userId: number,
  opts?: { ip?: string },
) {
  const user = db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .get();
  if (!user) return null;

  const jobUuid = uuid();
  db.insert(schema.accountDeletionJobs)
    .values({
      uuid: jobUuid,
      userId,
      status: "pending",
      notes: opts?.ip ? `ip_hash=${hashIp(opts.ip)}` : null,
    })
    .run();

  db.update(schema.apiTokens)
    .set({ revokedAt: nowIso() })
    .where(eq(schema.apiTokens.userId, userId))
    .run();

  purgeAllUserSpools(db, userId);

  db.delete(schema.userPrivacyPrefs)
    .where(eq(schema.userPrivacyPrefs.userId, userId))
    .run();

  const anonName = `deleted-user-${user.uuid.slice(0, 8)}`;
  db.update(schema.users)
    .set({
      username: anonName,
      displayName: "Deleted user",
      email: `${anonName}@deleted.invalid`,
      passwordHash: null,
      status: "deleted",
      deletedAt: nowIso(),
      updatedAt: nowIso(),
    })
    .where(eq(schema.users.id, userId))
    .run();

  db.update(schema.accountDeletionJobs)
    .set({ status: "completed", completedAt: nowIso() })
    .where(eq(schema.accountDeletionJobs.uuid, jobUuid))
    .run();

  return { jobUuid, anonymizedUsername: anonName };
}

export function listActiveSessions(db: AppDb, userId: number) {
  return db
    .select({
      uuid: schema.apiTokens.uuid,
      name: schema.apiTokens.name,
      createdAt: schema.apiTokens.createdAt,
      lastUsedAt: schema.apiTokens.lastUsedAt,
      userAgent: schema.apiTokens.userAgent,
      expiresAt: schema.apiTokens.expiresAt,
    })
    .from(schema.apiTokens)
    .where(
      and(
        eq(schema.apiTokens.userId, userId),
        isNull(schema.apiTokens.revokedAt),
      ),
    )
    .all();
}

export function revokeSession(
  db: AppDb,
  userId: number,
  tokenUuid: string,
  exceptHash?: string,
) {
  const row = db
    .select()
    .from(schema.apiTokens)
    .where(
      and(
        eq(schema.apiTokens.userId, userId),
        eq(schema.apiTokens.uuid, tokenUuid),
      ),
    )
    .get();
  if (!row) return false;
  if (exceptHash && row.tokenHash === exceptHash) return false;
  db.update(schema.apiTokens)
    .set({ revokedAt: nowIso() })
    .where(eq(schema.apiTokens.id, row.id))
    .run();
  return true;
}

export function revokeOtherSessions(
  db: AppDb,
  userId: number,
  currentTokenHash: string,
) {
  const rows = db
    .select()
    .from(schema.apiTokens)
    .where(
      and(
        eq(schema.apiTokens.userId, userId),
        isNull(schema.apiTokens.revokedAt),
        ne(schema.apiTokens.tokenHash, currentTokenHash),
      ),
    )
    .all();
  for (const row of rows) {
    db.update(schema.apiTokens)
      .set({ revokedAt: nowIso() })
      .where(eq(schema.apiTokens.id, row.id))
      .run();
  }
  return rows.length;
}

export function upsertPrivacyPrefs(
  db: AppDb,
  userId: number,
  input: {
    consentVersion: string;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
    locale: string;
  },
) {
  const existing = db
    .select()
    .from(schema.userPrivacyPrefs)
    .where(eq(schema.userPrivacyPrefs.userId, userId))
    .get();
  const decidedAt = nowIso();
  if (existing) {
    db.update(schema.userPrivacyPrefs)
      .set({ ...input, decidedAt, updatedAt: decidedAt })
      .where(eq(schema.userPrivacyPrefs.id, existing.id))
      .run();
  } else {
    db.insert(schema.userPrivacyPrefs)
      .values({ userId, ...input, decidedAt })
      .run();
  }
  return db
    .select()
    .from(schema.userPrivacyPrefs)
    .where(eq(schema.userPrivacyPrefs.userId, userId))
    .get();
}

export function recordContributionTerms(
  db: AppDb,
  opts: {
    userId: number | null;
    termsVersion: string;
    contributionRef?: string;
    ip?: string;
  },
) {
  db.insert(schema.contributionTermsAcceptances)
    .values({
      uuid: uuid(),
      userId: opts.userId,
      termsVersion: opts.termsVersion,
      contributionRef: opts.contributionRef ?? null,
      ipHash: hashIp(opts.ip),
    })
    .run();
}

/** Retention helpers — purge soft-deleted spools older than N days. */
export function purgeSoftDeletedSpools(db: AppDb, olderThanDays = 30) {
  const cutoff = new Date(
    Date.now() - olderThanDays * 24 * 60 * 60 * 1000,
  ).toISOString();
  const rows = db.select().from(schema.userSpools).all();
  let n = 0;
  for (const row of rows) {
    if (row.deletedAt && row.deletedAt < cutoff) {
      db.delete(schema.userSpools).where(eq(schema.userSpools.id, row.id)).run();
      n += 1;
    }
  }
  return n;
}

export function revokeExpiredTokens(db: AppDb) {
  const now = nowIso();
  const rows = db.select().from(schema.apiTokens).all();
  let n = 0;
  for (const row of rows) {
    if (!row.revokedAt && row.expiresAt && row.expiresAt < now) {
      db.update(schema.apiTokens)
        .set({ revokedAt: now })
        .where(eq(schema.apiTokens.id, row.id))
        .run();
      n += 1;
    }
  }
  return n;
}
