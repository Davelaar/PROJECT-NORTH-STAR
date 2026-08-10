import { and, desc, eq, isNotNull } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import type { AppDb } from "./client.js";
import {
  cloudAdminAuditLog,
  cloudEntitlementGrants,
  cloudEntitlements,
  cloudPayments,
  type CloudEntitlementStatus,
  type CloudPaymentStatus,
} from "./schema.js";

export type CloudAccessMode = "none" | "full" | "grace" | "read_only";

export type CloudConfig = {
  priceCents: number;
  currency: string;
  accessMonths: number;
  graceDays: number;
  retentionDays: number;
  priceDisplayMode: "vat_inclusive" | "vat_exclusive" | "unspecified";
};

export function loadCloudConfigFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): CloudConfig {
  const priceCents = Number(env.MY_SPOOLS_CLOUD_PRICE_EUR_CENTS ?? "1999");
  const accessMonths = Number(env.MY_SPOOLS_CLOUD_ACCESS_MONTHS ?? "12");
  const graceDays = Number(env.MY_SPOOLS_CLOUD_GRACE_DAYS ?? "14");
  const retentionDays = Number(env.MY_SPOOLS_CLOUD_RETENTION_DAYS ?? "90");
  const mode = (env.CLOUD_PRICE_DISPLAY_MODE ?? "unspecified") as
    | "vat_inclusive"
    | "vat_exclusive"
    | "unspecified";
  if (!Number.isFinite(priceCents) || priceCents <= 0) {
    throw new Error("MY_SPOOLS_CLOUD_PRICE_EUR_CENTS must be a positive integer");
  }
  if (!Number.isFinite(accessMonths) || accessMonths <= 0) {
    throw new Error("MY_SPOOLS_CLOUD_ACCESS_MONTHS must be a positive integer");
  }
  return {
    priceCents: Math.round(priceCents),
    currency: (env.MY_SPOOLS_CLOUD_CURRENCY ?? "eur").toLowerCase(),
    accessMonths: Math.round(accessMonths),
    graceDays: Math.max(0, Math.round(graceDays)),
    retentionDays: Math.max(1, Math.round(retentionDays)),
    priceDisplayMode: ["vat_inclusive", "vat_exclusive", "unspecified"].includes(
      mode,
    )
      ? mode
      : "unspecified",
  };
}

/** Add calendar months in UTC, clamping end-of-month (28/29/30/31). */
export function addCalendarMonthsUtc(iso: string, months: number): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid ISO timestamp: ${iso}`);
  }
  const day = d.getUTCDate();
  const hours = d.getUTCHours();
  const minutes = d.getUTCMinutes();
  const seconds = d.getUTCSeconds();
  const ms = d.getUTCMilliseconds();
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + months;
  const targetYear = y + Math.floor(m / 12);
  const targetMonth = ((m % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const clampedDay = Math.min(day, lastDay);
  return new Date(
    Date.UTC(targetYear, targetMonth, clampedDay, hours, minutes, seconds, ms),
  ).toISOString();
}

export function addDaysUtc(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

function nowIso(now?: Date): string {
  return (now ?? new Date()).toISOString();
}

export function ensureCloudEntitlementRow(db: AppDb, userId: number) {
  const existing = db
    .select()
    .from(cloudEntitlements)
    .where(eq(cloudEntitlements.userId, userId))
    .get();
  if (existing) return existing;
  db.insert(cloudEntitlements)
    .values({
      uuid: uuid(),
      userId,
      status: "inactive",
    })
    .run();
  return db
    .select()
    .from(cloudEntitlements)
    .where(eq(cloudEntitlements.userId, userId))
    .get()!;
}

export function listActiveGrants(db: AppDb, userId: number) {
  return db
    .select()
    .from(cloudEntitlementGrants)
    .where(
      and(
        eq(cloudEntitlementGrants.userId, userId),
        eq(cloudEntitlementGrants.status, "active"),
      ),
    )
    .all();
}

export function maxPaidUntilFromGrants(
  grants: { endsAt: string; status: string }[],
): string | null {
  const active = grants.filter((g) => g.status === "active");
  if (!active.length) return null;
  return active.reduce(
    (max, g) => (g.endsAt > max ? g.endsAt : max),
    active[0]!.endsAt,
  );
}

export function deriveEntitlementStatus(input: {
  paidUntil: string | null;
  graceDays: number;
  retentionDays: number;
  disputed?: boolean;
  revoked?: boolean;
  now?: Date;
}): {
  status: CloudEntitlementStatus;
  accessMode: CloudAccessMode;
  graceUntil: string | null;
  readOnlyFrom: string | null;
  deletionScheduledAt: string | null;
} {
  const now = nowIso(input.now);
  if (input.revoked) {
    return {
      status: "revoked",
      accessMode: "none",
      graceUntil: null,
      readOnlyFrom: null,
      deletionScheduledAt: null,
    };
  }
  if (input.disputed && (!input.paidUntil || input.paidUntil <= now)) {
    return {
      status: "disputed",
      accessMode: "read_only",
      graceUntil: null,
      readOnlyFrom: now,
      deletionScheduledAt: null,
    };
  }
  if (!input.paidUntil) {
    return {
      status: "inactive",
      accessMode: "none",
      graceUntil: null,
      readOnlyFrom: null,
      deletionScheduledAt: null,
    };
  }
  if (input.paidUntil > now) {
    return {
      status: "active",
      accessMode: "full",
      graceUntil: addDaysUtc(input.paidUntil, input.graceDays),
      readOnlyFrom: addDaysUtc(input.paidUntil, input.graceDays),
      deletionScheduledAt: addDaysUtc(
        input.paidUntil,
        input.graceDays + input.retentionDays,
      ),
    };
  }
  const graceUntil = addDaysUtc(input.paidUntil, input.graceDays);
  const readOnlyFrom = graceUntil;
  const deletionScheduledAt = addDaysUtc(
    input.paidUntil,
    input.graceDays + input.retentionDays,
  );
  if (now <= graceUntil) {
    return {
      status: "grace_period",
      accessMode: "grace",
      graceUntil,
      readOnlyFrom,
      deletionScheduledAt,
    };
  }
  if (now < deletionScheduledAt) {
    return {
      status: "read_only",
      accessMode: "read_only",
      graceUntil,
      readOnlyFrom,
      deletionScheduledAt,
    };
  }
  return {
    status: "expired",
    accessMode: "none",
    graceUntil,
    readOnlyFrom,
    deletionScheduledAt,
  };
}

export function recomputeCloudEntitlement(
  db: AppDb,
  userId: number,
  config: CloudConfig,
  now?: Date,
) {
  ensureCloudEntitlementRow(db, userId);
  const grants = listActiveGrants(db, userId);
  const paidUntil = maxPaidUntilFromGrants(grants);
  const disputed = db
    .select()
    .from(cloudPayments)
    .where(
      and(eq(cloudPayments.userId, userId), eq(cloudPayments.status, "disputed")),
    )
    .all().length > 0;
  const derived = deriveEntitlementStatus({
    paidUntil,
    graceDays: config.graceDays,
    retentionDays: config.retentionDays,
    disputed: disputed && !paidUntil,
    now,
  });
  const startsAt =
    grants.length > 0
      ? grants.reduce(
          (min, g) => (g.startsAt < min ? g.startsAt : min),
          grants[0]!.startsAt,
        )
      : null;
  db.update(cloudEntitlements)
    .set({
      status: derived.status,
      startsAt,
      paidUntil,
      graceUntil: derived.graceUntil,
      readOnlyFrom: derived.readOnlyFrom,
      deletionScheduledAt: derived.deletionScheduledAt,
      updatedAt: nowIso(now),
    })
    .where(eq(cloudEntitlements.userId, userId))
    .run();
  return getCloudEntitlementView(db, userId, config, now);
}

export type CloudEntitlementView = {
  status: CloudEntitlementStatus;
  accessMode: CloudAccessMode;
  paidUntil: string | null;
  graceUntil: string | null;
  readOnlyFrom: string | null;
  deletionScheduledAt: string | null;
  canWriteCloud: boolean;
  canExportCloud: boolean;
  canSyncCloud: boolean;
  expiryRemindersEnabled: boolean;
  priceCents: number;
  currency: string;
  accessMonths: number;
  priceDisplayMode: CloudConfig["priceDisplayMode"];
  noAutomaticRenewal: true;
};

export function getCloudEntitlementView(
  db: AppDb,
  userId: number,
  config: CloudConfig,
  now?: Date,
): CloudEntitlementView {
  const row = ensureCloudEntitlementRow(db, userId);
  const derived = deriveEntitlementStatus({
    paidUntil: row.paidUntil,
    graceDays: config.graceDays,
    retentionDays: config.retentionDays,
    now,
  });
  // Prefer live derivation over stale row for access decisions.
  const status = derived.status;
  const accessMode = derived.accessMode;
  const canWrite =
    accessMode === "full" || accessMode === "grace";
  const canSync = canWrite;
  const canExport =
    accessMode === "full" ||
    accessMode === "grace" ||
    accessMode === "read_only" ||
    Boolean(row.paidUntil);
  return {
    status,
    accessMode,
    paidUntil: row.paidUntil,
    graceUntil: derived.graceUntil,
    readOnlyFrom: derived.readOnlyFrom,
    deletionScheduledAt: derived.deletionScheduledAt,
    canWriteCloud: canWrite,
    canExportCloud: canExport || status === "disputed" || status === "refunded",
    canSyncCloud: canSync,
    expiryRemindersEnabled: row.expiryRemindersEnabled,
    priceCents: config.priceCents,
    currency: config.currency,
    accessMonths: config.accessMonths,
    priceDisplayMode: config.priceDisplayMode,
    noAutomaticRenewal: true,
  };
}

export function createPendingCloudPayment(
  db: AppDb,
  input: {
    userId: number;
    amountCents: number;
    currency: string;
    accessMonths: number;
    idempotencyKey: string;
    providerCheckoutId?: string | null;
  },
) {
  const existing = db
    .select()
    .from(cloudPayments)
    .where(eq(cloudPayments.idempotencyKey, input.idempotencyKey))
    .get();
  if (existing) return existing;

  const paymentUuid = uuid();
  db.insert(cloudPayments)
    .values({
      uuid: paymentUuid,
      userId: input.userId,
      provider: "stripe",
      providerCheckoutId: input.providerCheckoutId ?? null,
      amountCents: input.amountCents,
      currency: input.currency,
      accessMonths: input.accessMonths,
      status: "pending",
      idempotencyKey: input.idempotencyKey,
      rawProviderStatus: "checkout_pending",
    })
    .run();
  return db
    .select()
    .from(cloudPayments)
    .where(eq(cloudPayments.uuid, paymentUuid))
    .get()!;
}

/**
 * Apply a paid one-time purchase exactly once (unique on paymentId grant).
 * Stacks 12 months onto current paid_until when still active; otherwise from paidAt.
 */
export function applyPaidCloudPayment(
  db: AppDb,
  input: {
    paymentUuid: string;
    providerPaymentId: string;
    providerCheckoutId?: string | null;
    providerCustomerId?: string | null;
    providerReceiptUrl?: string | null;
    paidAt?: string;
    amountCents: number;
    currency: string;
    accessMonths: number;
    config: CloudConfig;
  },
): { applied: boolean; entitlement: CloudEntitlementView; reason?: string } {
  const payment = db
    .select()
    .from(cloudPayments)
    .where(eq(cloudPayments.uuid, input.paymentUuid))
    .get();
  if (!payment) {
    throw new Error("Payment not found");
  }
  if (payment.amountCents !== input.amountCents) {
    throw new Error("Payment amount mismatch");
  }
  if (payment.currency.toLowerCase() !== input.currency.toLowerCase()) {
    throw new Error("Payment currency mismatch");
  }

  const existingGrant = db
    .select()
    .from(cloudEntitlementGrants)
    .where(eq(cloudEntitlementGrants.paymentId, payment.id))
    .get();
  if (existingGrant || payment.status === "paid") {
    const entitlement = recomputeCloudEntitlement(
      db,
      payment.userId,
      input.config,
    );
    return { applied: false, entitlement, reason: "already_applied" };
  }

  const paidAt = input.paidAt ?? nowIso();
  const current = recomputeCloudEntitlement(db, payment.userId, input.config);
  const stackFrom =
    current.paidUntil && current.paidUntil > paidAt
      ? current.paidUntil
      : paidAt;
  const endsAt = addCalendarMonthsUtc(stackFrom, input.accessMonths);

  db.transaction((tx) => {
    tx.update(cloudPayments)
      .set({
        status: "paid",
        paidAt,
        providerPaymentId: input.providerPaymentId,
        providerCheckoutId:
          input.providerCheckoutId ?? payment.providerCheckoutId,
        providerCustomerId:
          input.providerCustomerId ?? payment.providerCustomerId,
        providerReceiptUrl:
          input.providerReceiptUrl ?? payment.providerReceiptUrl,
        rawProviderStatus: "paid",
        updatedAt: nowIso(),
      })
      .where(eq(cloudPayments.id, payment.id))
      .run();

    tx.insert(cloudEntitlementGrants)
      .values({
        uuid: uuid(),
        userId: payment.userId,
        paymentId: payment.id,
        startsAt: stackFrom,
        endsAt,
        status: "active",
        source: "payment",
      })
      .run();
  });

  const entitlement = recomputeCloudEntitlement(
    db,
    payment.userId,
    input.config,
  );
  return { applied: true, entitlement };
}

export function revokeGrantForPayment(
  db: AppDb,
  paymentId: number,
  reason: string,
  config: CloudConfig,
) {
  const grant = db
    .select()
    .from(cloudEntitlementGrants)
    .where(eq(cloudEntitlementGrants.paymentId, paymentId))
    .get();
  if (grant && grant.status === "active") {
    db.update(cloudEntitlementGrants)
      .set({
        status: "revoked",
        revokedAt: nowIso(),
        revocationReason: reason,
        updatedAt: nowIso(),
      })
      .where(eq(cloudEntitlementGrants.id, grant.id))
      .run();
  }
  const payment = db
    .select()
    .from(cloudPayments)
    .where(eq(cloudPayments.id, paymentId))
    .get();
  if (!payment) return null;
  return recomputeCloudEntitlement(db, payment.userId, config);
}

export function markPaymentRefunded(
  db: AppDb,
  providerPaymentId: string,
  config: CloudConfig,
  partial: boolean,
) {
  const payment = db
    .select()
    .from(cloudPayments)
    .where(eq(cloudPayments.providerPaymentId, providerPaymentId))
    .get();
  if (!payment) return { found: false as const };

  if (partial) {
    db.update(cloudPayments)
      .set({
        status: "partially_refunded",
        adminReviewRequired: true,
        adminReviewNote: "Partial refund — entitlement unchanged pending review",
        updatedAt: nowIso(),
      })
      .where(eq(cloudPayments.id, payment.id))
      .run();
    return {
      found: true as const,
      partial: true as const,
      entitlement: getCloudEntitlementView(db, payment.userId, config),
    };
  }

  db.update(cloudPayments)
    .set({
      status: "refunded",
      refundedAt: nowIso(),
      updatedAt: nowIso(),
    })
    .where(eq(cloudPayments.id, payment.id))
    .run();
  const entitlement = revokeGrantForPayment(
    db,
    payment.id,
    "full_refund",
    config,
  );
  return { found: true as const, partial: false as const, entitlement };
}

export function markPaymentDisputed(
  db: AppDb,
  providerPaymentId: string,
  config: CloudConfig,
) {
  const payment = db
    .select()
    .from(cloudPayments)
    .where(eq(cloudPayments.providerPaymentId, providerPaymentId))
    .get();
  if (!payment) return null;
  db.update(cloudPayments)
    .set({
      status: "disputed",
      disputedAt: nowIso(),
      adminReviewRequired: true,
      updatedAt: nowIso(),
    })
    .where(eq(cloudPayments.id, payment.id))
    .run();
  // Keep grant until resolved; restrict writes via disputed flag when no other grants.
  return recomputeCloudEntitlement(db, payment.userId, config);
}

export function listCloudPaymentsForUser(db: AppDb, userId: number) {
  return db
    .select()
    .from(cloudPayments)
    .where(eq(cloudPayments.userId, userId))
    .orderBy(desc(cloudPayments.createdAt))
    .all()
    .map((p) => {
      const grant = p.id
        ? db
            .select()
            .from(cloudEntitlementGrants)
            .where(eq(cloudEntitlementGrants.paymentId, p.id))
            .get()
        : null;
      return {
        uuid: p.uuid,
        status: p.status as CloudPaymentStatus,
        amountCents: p.amountCents,
        currency: p.currency,
        accessMonths: p.accessMonths,
        paidAt: p.paidAt,
        refundedAt: p.refundedAt,
        disputedAt: p.disputedAt,
        receiptUrl: p.providerReceiptUrl,
        accessStartsAt: grant?.startsAt ?? null,
        accessEndsAt: grant?.endsAt ?? null,
        grantStatus: grant?.status ?? null,
        provider: p.provider,
        automaticRenewal: false as const,
      };
    });
}

export function findOpenPendingCheckout(db: AppDb, userId: number) {
  const cutoff = addDaysUtc(nowIso(), -1);
  return db
    .select()
    .from(cloudPayments)
    .where(
      and(eq(cloudPayments.userId, userId), eq(cloudPayments.status, "pending")),
    )
    .orderBy(desc(cloudPayments.createdAt))
    .all()
    .find(
      (p) =>
        p.providerCheckoutId &&
        p.createdAt >= cutoff &&
        p.provider === "stripe",
    );
}

export function getPaymentByUuid(db: AppDb, paymentUuid: string) {
  return db
    .select()
    .from(cloudPayments)
    .where(eq(cloudPayments.uuid, paymentUuid))
    .get();
}

export function getPaymentByCheckoutId(db: AppDb, checkoutId: string) {
  return db
    .select()
    .from(cloudPayments)
    .where(eq(cloudPayments.providerCheckoutId, checkoutId))
    .get();
}

export function recordAdminCloudAction(
  db: AppDb,
  input: {
    adminUserId: number;
    targetUserId: number | null;
    action: string;
    reason: string;
    before: unknown;
    after: unknown;
  },
) {
  db.insert(cloudAdminAuditLog)
    .values({
      uuid: uuid(),
      adminUserId: input.adminUserId,
      targetUserId: input.targetUserId,
      action: input.action,
      reason: input.reason,
      beforeJson: JSON.stringify(input.before),
      afterJson: JSON.stringify(input.after),
    })
    .run();
}

export function grantManualCloudAccess(
  db: AppDb,
  input: {
    userId: number;
    months: number;
    reason: string;
    adminUserId: number;
    config: CloudConfig;
  },
) {
  const before = getCloudEntitlementView(db, input.userId, input.config);
  const now = nowIso();
  const stackFrom =
    before.paidUntil && before.paidUntil > now ? before.paidUntil : now;
  const endsAt = addCalendarMonthsUtc(stackFrom, input.months);
  db.insert(cloudEntitlementGrants)
    .values({
      uuid: uuid(),
      userId: input.userId,
      paymentId: null,
      startsAt: stackFrom,
      endsAt,
      status: "active",
      source: "manual_admin",
    })
    .run();
  const after = recomputeCloudEntitlement(db, input.userId, input.config);
  recordAdminCloudAction(db, {
    adminUserId: input.adminUserId,
    targetUserId: input.userId,
    action: "manual_grant",
    reason: input.reason,
    before,
    after,
  });
  return after;
}

export function revokeManualCloudAccess(
  db: AppDb,
  input: {
    userId: number;
    grantUuid: string;
    reason: string;
    adminUserId: number;
    config: CloudConfig;
  },
) {
  const before = getCloudEntitlementView(db, input.userId, input.config);
  const grant = db
    .select()
    .from(cloudEntitlementGrants)
    .where(eq(cloudEntitlementGrants.uuid, input.grantUuid))
    .get();
  if (!grant || grant.userId !== input.userId) {
    throw new Error("Grant not found");
  }
  db.update(cloudEntitlementGrants)
    .set({
      status: "revoked",
      revokedAt: nowIso(),
      revocationReason: input.reason,
      updatedAt: nowIso(),
    })
    .where(eq(cloudEntitlementGrants.id, grant.id))
    .run();
  const after = recomputeCloudEntitlement(db, input.userId, input.config);
  recordAdminCloudAction(db, {
    adminUserId: input.adminUserId,
    targetUserId: input.userId,
    action: "revoke_grant",
    reason: input.reason,
    before,
    after,
  });
  return after;
}

export function listCloudEntitlementsForAdmin(db: AppDb, limit = 100) {
  return db
    .select()
    .from(cloudEntitlements)
    .orderBy(desc(cloudEntitlements.updatedAt))
    .all()
    .slice(0, limit);
}

export function listCloudPaymentsForAdmin(db: AppDb, limit = 100) {
  return db
    .select()
    .from(cloudPayments)
    .orderBy(desc(cloudPayments.createdAt))
    .all()
    .slice(0, limit)
    .map((p) => ({
      uuid: p.uuid,
      userId: p.userId,
      status: p.status,
      amountCents: p.amountCents,
      currency: p.currency,
      paidAt: p.paidAt,
      refundedAt: p.refundedAt,
      disputedAt: p.disputedAt,
      adminReviewRequired: p.adminReviewRequired,
      providerCheckoutId: p.providerCheckoutId,
      providerPaymentId: p.providerPaymentId,
      // Never expose secrets; IDs are opaque Stripe refs for support.
    }));
}

export function paymentsWithReceipts(db: AppDb) {
  return db
    .select()
    .from(cloudPayments)
    .where(isNotNull(cloudPayments.providerReceiptUrl))
    .all();
}
