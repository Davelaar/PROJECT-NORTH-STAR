import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { v4 as uuid } from "uuid";
import {
  addCalendarMonthsUtc,
  applyPaidCloudPayment,
  createDb,
  createPendingCloudPayment,
  deriveEntitlementStatus,
  ensureMigrated,
  getCloudEntitlementView,
  hashPassword,
  loadCloudConfigFromEnv,
  markPaymentRefunded,
  schema,
} from "./index.js";

describe("calendar month arithmetic", () => {
  it("clamps Jan 31 + 1 month to Feb 28 (non-leap)", () => {
    expect(addCalendarMonthsUtc("2025-01-31T12:00:00.000Z", 1)).toBe(
      "2025-02-28T12:00:00.000Z",
    );
  });

  it("clamps Jan 31 + 1 month to Feb 29 (leap)", () => {
    expect(addCalendarMonthsUtc("2024-01-31T12:00:00.000Z", 1)).toBe(
      "2024-02-29T12:00:00.000Z",
    );
  });

  it("handles Feb 29 + 12 months", () => {
    expect(addCalendarMonthsUtc("2024-02-29T00:00:00.000Z", 12)).toBe(
      "2025-02-28T00:00:00.000Z",
    );
  });

  it("handles 30th across short months", () => {
    expect(addCalendarMonthsUtc("2025-03-30T08:00:00.000Z", 1)).toBe(
      "2025-04-30T08:00:00.000Z",
    );
  });
});

describe("cloud entitlement grants", () => {
  let dbPath: string;
  const config = {
    priceCents: 1999,
    currency: "eur",
    accessMonths: 12,
    graceDays: 14,
    retentionDays: 90,
    priceDisplayMode: "unspecified" as const,
  };

  beforeEach(() => {
    dbPath = path.join(
      os.tmpdir(),
      `of-cloud-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`,
    );
    ensureMigrated(dbPath);
  });

  afterEach(() => {
    try {
      fs.unlinkSync(dbPath);
    } catch {
      // ignore
    }
  });

  async function seedUser() {
    const db = createDb(dbPath);
    const { eq } = await import("drizzle-orm");
    const userUuid = uuid();
    db.insert(schema.users)
      .values({
        uuid: userUuid,
        username: "clouduser",
        displayName: "Cloud",
        email: "cloud@example.com",
        passwordHash: await hashPassword("password-cloud"),
        role: "registered",
      })
      .run();
    const row = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.uuid, userUuid))
      .get()!;
    return { db, user: row };
  }

  it("first purchase grants 12 months from paidAt", async () => {
    const { db, user } = await seedUser();
    const payment = createPendingCloudPayment(db, {
      userId: user.id,
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      idempotencyKey: "idem-1",
      providerCheckoutId: "cs_test_1",
    });
    const paidAt = "2026-03-15T10:00:00.000Z";
    const result = applyPaidCloudPayment(db, {
      paymentUuid: payment.uuid,
      providerPaymentId: "pi_test_1",
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      paidAt,
      config,
    });
    expect(result.applied).toBe(true);
    expect(result.entitlement.paidUntil).toBe(
      addCalendarMonthsUtc(paidAt, 12),
    );
    expect(result.entitlement.noAutomaticRenewal).toBe(true);
    expect(result.entitlement.status).toBe("active");
  });

  it("stacks another 12 months onto active paid_until", async () => {
    const { db, user } = await seedUser();
    const p1 = createPendingCloudPayment(db, {
      userId: user.id,
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      idempotencyKey: "idem-a",
      providerCheckoutId: "cs_a",
    });
    const paidAt = "2026-01-01T00:00:00.000Z";
    applyPaidCloudPayment(db, {
      paymentUuid: p1.uuid,
      providerPaymentId: "pi_a",
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      paidAt,
      config,
    });
    const firstUntil = addCalendarMonthsUtc(paidAt, 12);
    const p2 = createPendingCloudPayment(db, {
      userId: user.id,
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      idempotencyKey: "idem-b",
      providerCheckoutId: "cs_b",
    });
    const result = applyPaidCloudPayment(db, {
      paymentUuid: p2.uuid,
      providerPaymentId: "pi_b",
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      paidAt: "2026-06-01T00:00:00.000Z",
      config,
    });
    expect(result.applied).toBe(true);
    expect(result.entitlement.paidUntil).toBe(
      addCalendarMonthsUtc(firstUntil, 12),
    );
  });

  it("duplicate apply does not extend twice", async () => {
    const { db, user } = await seedUser();
    const payment = createPendingCloudPayment(db, {
      userId: user.id,
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      idempotencyKey: "idem-dup",
      providerCheckoutId: "cs_dup",
    });
    const paidAt = "2026-05-01T00:00:00.000Z";
    applyPaidCloudPayment(db, {
      paymentUuid: payment.uuid,
      providerPaymentId: "pi_dup",
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      paidAt,
      config,
    });
    const again = applyPaidCloudPayment(db, {
      paymentUuid: payment.uuid,
      providerPaymentId: "pi_dup",
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      paidAt,
      config,
    });
    expect(again.applied).toBe(false);
    expect(again.entitlement.paidUntil).toBe(addCalendarMonthsUtc(paidAt, 12));
  });

  it("full refund revokes only that grant", async () => {
    const { db, user } = await seedUser();
    const p1 = createPendingCloudPayment(db, {
      userId: user.id,
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      idempotencyKey: "idem-r1",
      providerCheckoutId: "cs_r1",
    });
    applyPaidCloudPayment(db, {
      paymentUuid: p1.uuid,
      providerPaymentId: "pi_r1",
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      paidAt: "2026-01-01T00:00:00.000Z",
      config,
    });
    const p2 = createPendingCloudPayment(db, {
      userId: user.id,
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      idempotencyKey: "idem-r2",
      providerCheckoutId: "cs_r2",
    });
    applyPaidCloudPayment(db, {
      paymentUuid: p2.uuid,
      providerPaymentId: "pi_r2",
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      paidAt: "2026-02-01T00:00:00.000Z",
      config,
    });
    const before = getCloudEntitlementView(db, user.id, config);
    markPaymentRefunded(db, "pi_r2", config, false);
    const after = getCloudEntitlementView(db, user.id, config);
    expect(after.paidUntil).toBe(addCalendarMonthsUtc("2026-01-01T00:00:00.000Z", 12));
    expect(after.paidUntil).not.toBe(before.paidUntil);
  });

  it("derives grace and read_only", () => {
    const paidUntil = "2026-01-01T00:00:00.000Z";
    const grace = deriveEntitlementStatus({
      paidUntil,
      graceDays: 14,
      retentionDays: 90,
      now: new Date("2026-01-05T00:00:00.000Z"),
    });
    expect(grace.status).toBe("grace_period");
    expect(grace.accessMode).toBe("grace");
    const ro = deriveEntitlementStatus({
      paidUntil,
      graceDays: 14,
      retentionDays: 90,
      now: new Date("2026-01-20T00:00:00.000Z"),
    });
    expect(ro.status).toBe("read_only");
  });

  it("loadCloudConfigFromEnv defaults to 1999 eur", () => {
    const c = loadCloudConfigFromEnv({});
    expect(c.priceCents).toBe(1999);
    expect(c.currency).toBe("eur");
    expect(c.accessMonths).toBe(12);
  });
});
