import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import {
  applyPaidCloudPayment,
  beginWebhookEvent,
  createDb,
  createPendingCloudPayment,
  ensureMigrated,
  finishWebhookEvent,
  getCloudEntitlementView,
  hashPassword,
  loadCloudConfigFromEnv,
  schema,
} from "@open-filament/db";
import { assertCloudWriteAccess } from "./payments/access.js";

describe("cloud billing integration", () => {
  let dbPath: string;
  const config = loadCloudConfigFromEnv({
    MY_SPOOLS_CLOUD_PRICE_EUR_CENTS: "1999",
    MY_SPOOLS_CLOUD_ACCESS_MONTHS: "12",
    MY_SPOOLS_CLOUD_GRACE_DAYS: "14",
    MY_SPOOLS_CLOUD_RETENTION_DAYS: "90",
  });

  beforeEach(() => {
    dbPath = path.join(
      os.tmpdir(),
      `of-api-cloud-${Date.now()}-${Math.random().toString(16).slice(2)}.sqlite`,
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

  it("blocks cloud writes without entitlement and allows after payment", async () => {
    const db = createDb(dbPath);
    const userUuid = uuid();
    db.insert(schema.users)
      .values({
        uuid: userUuid,
        username: "payer",
        displayName: "Payer",
        email: "payer@example.com",
        passwordHash: await hashPassword("password-payer"),
        role: "registered",
      })
      .run();
    const user = db
      .select()
      .from(schema.users)
      .where(eq(schema.users.uuid, userUuid))
      .get()!;

    expect(assertCloudWriteAccess(db, user.id).ok).toBe(false);

    const payment = createPendingCloudPayment(db, {
      userId: user.id,
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      idempotencyKey: "api-idem-1",
      providerCheckoutId: "cs_test_x",
    });
    applyPaidCloudPayment(db, {
      paymentUuid: payment.uuid,
      providerPaymentId: "pi_test_x",
      amountCents: 1999,
      currency: "eur",
      accessMonths: 12,
      paidAt: new Date().toISOString(),
      config,
    });
    expect(assertCloudWriteAccess(db, user.id).ok).toBe(true);
    const view = getCloudEntitlementView(db, user.id, config);
    expect(view.noAutomaticRenewal).toBe(true);
  });

  it("webhook event idempotency records duplicates", () => {
    const db = createDb(dbPath);
    const first = beginWebhookEvent(db, {
      provider: "stripe",
      providerEventId: "evt_1",
      eventType: "checkout_paid",
    });
    expect(first.alreadyProcessed).toBe(false);
    finishWebhookEvent(db, first.id, "processed");
    const second = beginWebhookEvent(db, {
      provider: "stripe",
      providerEventId: "evt_1",
      eventType: "checkout_paid",
    });
    expect(second.alreadyProcessed).toBe(true);
  });
});
