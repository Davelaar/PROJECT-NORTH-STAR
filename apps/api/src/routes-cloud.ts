import type { FastifyInstance } from "fastify";
import { eq } from "drizzle-orm";
import { z } from "zod";
import {
  applyPaidCloudPayment,
  beginWebhookEvent,
  createPendingCloudPayment,
  exportUserData,
  findOpenPendingCheckout,
  finishWebhookEvent,
  getCloudEntitlementView,
  getPaymentByCheckoutId,
  getPaymentByUuid,
  grantManualCloudAccess,
  listCloudEntitlementsForAdmin,
  listCloudPaymentsForAdmin,
  listCloudPaymentsForUser,
  listEntitlementsNeedingReminders,
  loadCloudConfigFromEnv,
  markPaymentDisputed,
  markPaymentRefunded,
  markReminderSent,
  purgeExpiredCloudInventories,
  recomputeCloudEntitlement,
  revokeManualCloudAccess,
  schema,
  type AppDb,
} from "@open-filament/db";
import { hasScope, resolveRequestUser, type AuthUser } from "./auth.js";
import { badRequest, forbidden, notFound, unauthorized } from "./errors.js";
import {
  assertCheckoutAllowed,
  loadStripeCloudConfig,
  newCheckoutIdempotencyKey,
  StripeOneTimeCloudProvider,
} from "./payments/stripe-provider.js";
import { sendCloudExpiryReminder } from "./payments/reminders.js";
import { assertCloudWriteAccess } from "./payments/access.js";

export { assertCloudWriteAccess };

function db(app: FastifyInstance): AppDb {
  return app.db;
}

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

function publicBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.WEB_ORIGIN?.split(",")[0]?.trim().replace(/\/$/, "") ||
    "https://openfilament.nl"
  );
}

function isSafeRelativePath(path: string): boolean {
  return path.startsWith("/") && !path.startsWith("//") && !path.includes("\\");
}

function getProvider() {
  const cfg = loadStripeCloudConfig();
  if (!cfg) return null;
  return { cfg, provider: new StripeOneTimeCloudProvider(cfg) };
}

export async function registerCloudBillingRoutes(app: FastifyInstance) {
  app.get("/api/v1/billing/cloud/offer", async () => {
    const config = loadCloudConfigFromEnv();
    const stripe = loadStripeCloudConfig();
    const liveBlocked =
      stripe?.mode === "live" && !stripe.livePaymentsEnabled;
    return {
      product: "My Spools Cloud — 12 Months",
      priceCents: config.priceCents,
      currency: config.currency,
      accessMonths: config.accessMonths,
      graceDays: config.graceDays,
      retentionDays: config.retentionDays,
        priceDisplayMode: config.priceDisplayMode,
      paymentType: "one_time",
      automaticRenewal: false,
      checkoutMode: "payment",
      provider: "stripe",
      checkoutAvailable: Boolean(stripe?.priceId) && !liveBlocked,
      livePaymentsEnabled: stripe?.livePaymentsEnabled ?? false,
      stripeMode: stripe?.mode ?? null,
      vatNotApplicable: config.priceDisplayMode === "not_applicable",
      copy: {
        price: `€${(config.priceCents / 100).toFixed(2)} for ${config.accessMonths} months`,
        oneTime: "One-time payment",
        noAutoRenewal: "No automatic renewal",
        neverChargeAgain:
          "We will never charge you again unless you choose to purchase another 12 months.",
      },
    };
  });

  app.get("/api/v1/billing/cloud/entitlement", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const config = loadCloudConfigFromEnv();
    return getCloudEntitlementView(db(app), user.id, config);
  });

  app.get("/api/v1/billing/cloud/payments", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    return { payments: listCloudPaymentsForUser(db(app), user.id) };
  });

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/billing/cloud/payments/:uuid",
    async (req, reply) => {
      const user = await requireUser(req, reply);
      if (!user) return;
      const payment = getPaymentByUuid(db(app), req.params.uuid);
      if (!payment || payment.userId !== user.id) {
        return notFound(reply, "Payment not found");
      }
      const entitlement = getCloudEntitlementView(
        db(app),
        user.id,
        loadCloudConfigFromEnv(),
      );
      return {
        uuid: payment.uuid,
        status: payment.status,
        amountCents: payment.amountCents,
        currency: payment.currency,
        accessMonths: payment.accessMonths,
        paidAt: payment.paidAt,
        receiptUrl: payment.providerReceiptUrl,
        automaticRenewal: false,
        entitlement,
      };
    },
  );

  app.post("/api/v1/billing/cloud/checkout", {
    config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
      const user = await requireUser(req, reply);
      if (!user) return;
      const body = z
        .object({
          successPath: z.string().optional(),
          cancelPath: z.string().optional(),
        })
        .safeParse(req.body ?? {});
      if (!body.success) return badRequest(reply, "Invalid body");

      const successPath = body.data.successPath ?? "/my-spools/cloud/success";
      const cancelPath = body.data.cancelPath ?? "/my-spools/cloud";
      if (!isSafeRelativePath(successPath) || !isSafeRelativePath(cancelPath)) {
        return badRequest(reply, "Unsafe redirect path");
      }

      const stripeBundle = getProvider();
      if (!stripeBundle) {
        return badRequest(reply, "Stripe is not configured");
      }
      try {
        assertCheckoutAllowed(stripeBundle.cfg);
      } catch (e) {
        return badRequest(reply, e instanceof Error ? e.message : "Checkout blocked");
      }

      const config = loadCloudConfigFromEnv();
      const existing = findOpenPendingCheckout(db(app), user.id);
      if (existing?.providerCheckoutId && existing.status === "pending") {
        db(app)
          .update(schema.cloudPayments)
          .set({
            status: "cancelled",
            rawProviderStatus: "superseded_by_new_checkout",
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.cloudPayments.id, existing.id))
          .run();
      }

      const idempotencyKey = newCheckoutIdempotencyKey(user.uuid);
      createPendingCloudPayment(db(app), {
        userId: user.id,
        amountCents: config.priceCents,
        currency: config.currency,
        accessMonths: config.accessMonths,
        idempotencyKey,
      });
      const pending = db(app)
        .select()
        .from(schema.cloudPayments)
        .where(eq(schema.cloudPayments.idempotencyKey, idempotencyKey))
        .get()!;

      const base = publicBaseUrl();
      const successUrl = `${base}${successPath}${successPath.includes("?") ? "&" : "?"}payment=${encodeURIComponent(pending.uuid)}`;
      const cancelUrl = `${base}${cancelPath}`;

      const userRow = db(app)
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, user.id))
        .get();

      let checkout;
      try {
        checkout = await stripeBundle.provider.createCheckout({
          accountId: user.uuid,
          internalPaymentUuid: pending.uuid,
          successUrl,
          cancelUrl,
          idempotencyKey,
          customerEmail: userRow?.email ?? null,
          priceId: stripeBundle.cfg.priceId,
          amountCents: config.priceCents,
          currency: config.currency,
          accessMonths: config.accessMonths,
          checkoutVersion: "1",
        });
      } catch (e) {
        req.log.error({ err: e }, "stripe_checkout_create_failed");
        return badRequest(reply, "Could not create Checkout Session");
      }

      db(app)
        .update(schema.cloudPayments)
        .set({
          providerCheckoutId: checkout.checkoutId,
          rawProviderStatus: "checkout_created",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.cloudPayments.id, pending.id))
        .run();

      return {
        checkoutUrl: checkout.checkoutUrl,
        checkoutId: checkout.checkoutId,
        paymentUuid: pending.uuid,
        amountCents: config.priceCents,
        currency: config.currency,
        accessMonths: config.accessMonths,
        automaticRenewal: false,
        mode: "payment",
      };
    },
  });

  app.post("/api/v1/billing/webhooks/stripe", {
    config: { rateLimit: { max: 300, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
      const stripeBundle = getProvider();
      if (!stripeBundle) {
        return reply.status(503).send({ error: "stripe_not_configured" });
      }
      const rawBody =
        (req as { rawBody?: Buffer }).rawBody ??
        Buffer.from(JSON.stringify(req.body ?? {}));
      let event;
      try {
        event = await stripeBundle.provider.verifyWebhook({
          rawBody,
          signatureHeader: req.headers["stripe-signature"] as string | undefined,
        });
      } catch (e) {
        req.log.warn(
          { err: e instanceof Error ? e.message : "verify_failed" },
          "stripe_webhook_signature_invalid",
        );
        return reply.status(400).send({ error: "invalid_signature" });
      }

      const started = beginWebhookEvent(db(app), {
        provider: "stripe",
        providerEventId: event.providerEventId,
        eventType: event.type,
      });
      if (started.alreadyProcessed) {
        return { ok: true, duplicate: true };
      }

      const config = loadCloudConfigFromEnv();
      try {
        switch (event.type) {
          case "checkout_paid": {
            const payment = getPaymentByUuid(db(app), event.paymentUuid);
            if (!payment) {
              finishWebhookEvent(
                db(app),
                started.id,
                "failed",
                "payment_row_missing",
              );
              return reply.status(500).send({ error: "payment_missing" });
            }
            const user = db(app)
              .select()
              .from(schema.users)
              .where(eq(schema.users.id, payment.userId))
              .get();
            if (!user || user.uuid !== event.accountId) {
              finishWebhookEvent(
                db(app),
                started.id,
                "failed",
                "account_mismatch",
              );
              return reply.status(400).send({ error: "account_mismatch" });
            }
            if (
              event.amountCents !== config.priceCents ||
              event.currency !== config.currency
            ) {
              finishWebhookEvent(
                db(app),
                started.id,
                "failed",
                "amount_or_currency_mismatch",
              );
              req.log.error(
                {
                  expected: config.priceCents,
                  got: event.amountCents,
                },
                "stripe_amount_mismatch",
              );
              return reply.status(400).send({ error: "amount_mismatch" });
            }
            applyPaidCloudPayment(db(app), {
              paymentUuid: payment.uuid,
              providerPaymentId: event.paymentIntentId,
              providerCheckoutId: event.checkoutId,
              providerCustomerId: event.customerId,
              providerReceiptUrl: event.receiptUrl,
              paidAt: event.paidAt,
              amountCents: event.amountCents,
              currency: event.currency,
              accessMonths: config.accessMonths,
              config,
            });
            break;
          }
          case "checkout_failed":
          case "checkout_expired": {
            const payment = getPaymentByCheckoutId(db(app), event.checkoutId);
            if (payment && payment.status === "pending") {
              db(app)
                .update(schema.cloudPayments)
                .set({
                  status: event.type === "checkout_expired" ? "expired" : "failed",
                  updatedAt: new Date().toISOString(),
                  rawProviderStatus: event.type,
                })
                .where(eq(schema.cloudPayments.id, payment.id))
                .run();
            }
            break;
          }
          case "checkout_pending": {
            // Wait for async success; do not grant.
            break;
          }
          case "payment_refunded": {
            markPaymentRefunded(
              db(app),
              event.paymentIntentId,
              config,
              event.partial,
            );
            break;
          }
          case "payment_disputed": {
            markPaymentDisputed(db(app), event.paymentIntentId, config);
            break;
          }
          case "ignored":
            finishWebhookEvent(db(app), started.id, "ignored", event.reason);
            return { ok: true, ignored: true, reason: event.reason };
        }
        finishWebhookEvent(db(app), started.id, "processed");
        return { ok: true };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "processing_error";
        finishWebhookEvent(db(app), started.id, "failed", msg.slice(0, 500));
        req.log.error({ err: msg }, "stripe_webhook_processing_failed");
        return reply.status(500).send({ error: "processing_failed" });
      }
    },
  });

  app.get("/api/v1/billing/cloud/export", {
    config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
      const user = await requireUser(req, reply);
      if (!user) return;
      const config = loadCloudConfigFromEnv();
      const view = getCloudEntitlementView(db(app), user.id, config);
      if (!view.canExportCloud) {
        return forbidden(reply, "No Cloud data available to export");
      }
      const data = exportUserData(db(app), user.id);
      if (!data) return notFound(reply, "User not found");
      reply.header(
        "content-disposition",
        `attachment; filename="openfilament-cloud-spools-${user.uuid}.json"`,
      );
      return {
        exportedAt: new Date().toISOString(),
        entitlementStatus: view.status,
        automaticRenewal: false,
        data,
      };
    },
  });

  app.post("/api/v1/billing/cloud/reminders/run", {
    config: { rateLimit: { max: 2, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
      const secret = process.env.CLOUD_CRON_SECRET?.trim();
      const header = req.headers["x-cron-secret"];
      const user = await resolveRequestUser(db(app), req.headers);
      const okCron = secret && header === secret;
      const okAdmin = user && hasScope(user, "moderate");
      if (!okCron && !okAdmin) return unauthorized(reply);
      const config = loadCloudConfigFromEnv();
      const due = listEntitlementsNeedingReminders(db(app), config);
      let sent = 0;
      for (const item of due) {
        const u = db(app)
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, item.userId))
          .get();
        if (!u?.email) continue;
        await sendCloudExpiryReminder({
          to: u.email,
          kind: item.kind,
          paidUntil: item.paidUntil,
          deletionScheduledAt: item.deletionScheduledAt,
        });
        markReminderSent(db(app), item.userId, item.kind);
        sent += 1;
      }
      const purged = purgeExpiredCloudInventories(db(app), config);
      return { remindersSent: sent, ...purged };
    },
  });

  app.get("/api/v1/admin/cloud/payments", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    if (!hasScope(user, "moderate")) return forbidden(reply);
    return { payments: listCloudPaymentsForAdmin(db(app)) };
  });

  app.get("/api/v1/admin/cloud/entitlements", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    if (!hasScope(user, "moderate")) return forbidden(reply);
    return { entitlements: listCloudEntitlementsForAdmin(db(app)) };
  });

  app.post("/api/v1/admin/cloud/grants", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    if (!hasScope(user, "moderate")) return forbidden(reply);
    const body = z
      .object({
        userUuid: z.string().uuid(),
        months: z.number().int().positive().max(120),
        reason: z.string().min(3).max(500),
      })
      .safeParse(req.body);
    if (!body.success) return badRequest(reply, "Invalid body", body.error.flatten());
    const target = db(app)
      .select()
      .from(schema.users)
      .where(eq(schema.users.uuid, body.data.userUuid))
      .get();
    if (!target) return notFound(reply, "User not found");
    const config = loadCloudConfigFromEnv();
    const entitlement = grantManualCloudAccess(db(app), {
      userId: target.id,
      months: body.data.months,
      reason: body.data.reason,
      adminUserId: user.id,
      config,
    });
    return { entitlement };
  });

  app.post("/api/v1/admin/cloud/grants/revoke", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    if (!hasScope(user, "moderate")) return forbidden(reply);
    const body = z
      .object({
        userUuid: z.string().uuid(),
        grantUuid: z.string().uuid(),
        reason: z.string().min(3).max(500),
      })
      .safeParse(req.body);
    if (!body.success) return badRequest(reply, "Invalid body", body.error.flatten());
    const target = db(app)
      .select()
      .from(schema.users)
      .where(eq(schema.users.uuid, body.data.userUuid))
      .get();
    if (!target) return notFound(reply, "User not found");
    const config = loadCloudConfigFromEnv();
    try {
      const entitlement = revokeManualCloudAccess(db(app), {
        userId: target.id,
        grantUuid: body.data.grantUuid,
        reason: body.data.reason,
        adminUserId: user.id,
        config,
      });
      return { entitlement };
    } catch (e) {
      return notFound(reply, e instanceof Error ? e.message : "Not found");
    }
  });

  // Health for entitlement refresh
  app.post("/api/v1/billing/cloud/entitlement/refresh", async (req, reply) => {
    const user = await requireUser(req, reply);
    if (!user) return;
    const config = loadCloudConfigFromEnv();
    return recomputeCloudEntitlement(db(app), user.id, config);
  });
}
