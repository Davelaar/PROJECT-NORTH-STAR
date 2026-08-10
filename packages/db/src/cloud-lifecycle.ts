import { and, eq } from "drizzle-orm";
import type { AppDb } from "./client.js";
import {
  cloudEntitlements,
  processedWebhookEvents,
  userSpools,
} from "./schema.js";
import {
  getCloudEntitlementView,
  loadCloudConfigFromEnv,
  recomputeCloudEntitlement,
  type CloudConfig,
} from "./cloud-entitlement.js";
import { purgeSoftDeletedSpools } from "./account-privacy.js";
import { purgeAllUserSpools } from "./user-spools.js";

export function beginWebhookEvent(
  db: AppDb,
  input: { provider: string; providerEventId: string; eventType: string },
): { alreadyProcessed: boolean; id: number } {
  const existing = db
    .select()
    .from(processedWebhookEvents)
    .where(
      and(
        eq(processedWebhookEvents.provider, input.provider),
        eq(processedWebhookEvents.providerEventId, input.providerEventId),
      ),
    )
    .get();
  if (existing) {
    return { alreadyProcessed: true, id: existing.id };
  }
  const result = db
    .insert(processedWebhookEvents)
    .values({
      provider: input.provider,
      providerEventId: input.providerEventId,
      eventType: input.eventType,
      processingStatus: "received",
    })
    .run();
  return { alreadyProcessed: false, id: Number(result.lastInsertRowid) };
}

export function finishWebhookEvent(
  db: AppDb,
  id: number,
  status: "processed" | "ignored" | "failed",
  errorSummary?: string,
) {
  db.update(processedWebhookEvents)
    .set({
      processingStatus: status,
      processedAt: new Date().toISOString(),
      errorSummary: errorSummary ?? null,
    })
    .where(eq(processedWebhookEvents.id, id))
    .run();
}

export type ReminderKind = "d30" | "d7" | "expired" | "deletion";

export function listEntitlementsNeedingReminders(
  db: AppDb,
  config: CloudConfig,
  now = new Date(),
) {
  const nowIso = now.toISOString();
  const rows = db.select().from(cloudEntitlements).all();
  const out: {
    userId: number;
    kind: ReminderKind;
    paidUntil: string | null;
    deletionScheduledAt: string | null;
  }[] = [];
  for (const row of rows) {
    if (!row.expiryRemindersEnabled || !row.paidUntil) continue;
    const view = getCloudEntitlementView(db, row.userId, config, now);
    const paid = new Date(row.paidUntil).getTime();
    const t = now.getTime();
    const d30 = paid - 30 * 86400000;
    const d7 = paid - 7 * 86400000;
    if (t >= d30 && t < paid && !row.reminder30SentAt) {
      out.push({
        userId: row.userId,
        kind: "d30",
        paidUntil: row.paidUntil,
        deletionScheduledAt: view.deletionScheduledAt,
      });
    }
    if (t >= d7 && t < paid && !row.reminder7SentAt) {
      out.push({
        userId: row.userId,
        kind: "d7",
        paidUntil: row.paidUntil,
        deletionScheduledAt: view.deletionScheduledAt,
      });
    }
    if (t >= paid && !row.reminderExpiredSentAt) {
      out.push({
        userId: row.userId,
        kind: "expired",
        paidUntil: row.paidUntil,
        deletionScheduledAt: view.deletionScheduledAt,
      });
    }
    if (
      view.deletionScheduledAt &&
      nowIso >= view.deletionScheduledAt &&
      !row.reminderDeletionSentAt
    ) {
      out.push({
        userId: row.userId,
        kind: "deletion",
        paidUntil: row.paidUntil,
        deletionScheduledAt: view.deletionScheduledAt,
      });
    }
  }
  return out;
}

export function markReminderSent(
  db: AppDb,
  userId: number,
  kind: ReminderKind,
) {
  const field =
    kind === "d30"
      ? "reminder30SentAt"
      : kind === "d7"
        ? "reminder7SentAt"
        : kind === "expired"
          ? "reminderExpiredSentAt"
          : "reminderDeletionSentAt";
  db.update(cloudEntitlements)
    .set({ [field]: new Date().toISOString(), updatedAt: new Date().toISOString() })
    .where(eq(cloudEntitlements.userId, userId))
    .run();
}

/** Delete cloud spool inventory after retention window; keep payment records. */
export function purgeExpiredCloudInventories(
  db: AppDb,
  config: CloudConfig = loadCloudConfigFromEnv(),
  now = new Date(),
) {
  const nowIso = now.toISOString();
  const rows = db.select().from(cloudEntitlements).all();
  let purgedUsers = 0;
  for (const row of rows) {
    recomputeCloudEntitlement(db, row.userId, config, now);
    const fresh = db
      .select()
      .from(cloudEntitlements)
      .where(eq(cloudEntitlements.userId, row.userId))
      .get();
    if (!fresh?.deletionScheduledAt) continue;
    if (fresh.deletionScheduledAt > nowIso) continue;
    if (fresh.deletedAt) continue;
    if (fresh.paidUntil && fresh.paidUntil > nowIso) continue;
    purgeAllUserSpools(db, row.userId);
    db.update(cloudEntitlements)
      .set({
        deletedAt: nowIso,
        status: "expired",
        updatedAt: nowIso,
      })
      .where(eq(cloudEntitlements.userId, row.userId))
      .run();
    purgedUsers += 1;
  }
  // Also run soft-delete spool purge hygiene
  purgeSoftDeletedSpools(db);
  return { purgedUsers };
}

export function countCloudSpools(db: AppDb, userId: number) {
  return db
    .select()
    .from(userSpools)
    .where(eq(userSpools.userId, userId))
    .all().length;
}
