import { createHash, randomBytes } from "node:crypto";
import Stripe from "stripe";
import type {
  CheckoutResult,
  CreateCloudCheckoutInput,
  OneTimeCloudAccessPaymentProvider,
  PaymentStatus,
  RawWebhookInput,
  RefundResult,
  VerifiedPaymentEvent,
} from "./types.js";

export type StripeCloudConfig = {
  secretKey: string;
  webhookSecret: string;
  priceId: string;
  mode: "test" | "live";
  livePaymentsEnabled: boolean;
};

export function loadStripeCloudConfig(
  env: NodeJS.ProcessEnv = process.env,
): StripeCloudConfig | null {
  const secretKey = env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null;
  const mode = (env.STRIPE_MODE ?? "test").toLowerCase() === "live" ? "live" : "test";
  if (mode === "test" && !secretKey.startsWith("sk_test_")) {
    throw new Error("STRIPE_MODE=test requires sk_test_ secret key");
  }
  if (mode === "live" && !secretKey.startsWith("sk_live_")) {
    throw new Error("STRIPE_MODE=live requires sk_live_ secret key");
  }
  return {
    secretKey,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET?.trim() ?? "",
    priceId: env.STRIPE_MY_SPOOLS_CLOUD_PRICE_ID?.trim() ?? "",
    mode,
    livePaymentsEnabled: env.MY_SPOOLS_CLOUD_LIVE_PAYMENTS === "true",
  };
}

export function assertCheckoutAllowed(cfg: StripeCloudConfig) {
  if (cfg.mode === "live" && !cfg.livePaymentsEnabled) {
    throw new Error(
      "Live Cloud checkout is disabled until MY_SPOOLS_CLOUD_LIVE_PAYMENTS=true and legal/tax checklist is complete",
    );
  }
  if (!cfg.priceId) {
    throw new Error("STRIPE_MY_SPOOLS_CLOUD_PRICE_ID is not configured");
  }
}

function stripeClient(secretKey: string) {
  return new Stripe(secretKey);
}

/**
 * Stripe one-time Checkout only.
 * Hard guarantees: mode=payment, no setup_future_usage, no subscription.
 */
export class StripeOneTimeCloudProvider
  implements OneTimeCloudAccessPaymentProvider
{
  readonly providerName = "stripe" as const;
  private stripe: Stripe;
  private webhookSecret: string;

  constructor(cfg: StripeCloudConfig) {
    this.stripe = stripeClient(cfg.secretKey);
    this.webhookSecret = cfg.webhookSecret;
  }

  async createCheckout(input: CreateCloudCheckoutInput): Promise<CheckoutResult> {
    // Explicitly forbid subscription semantics at the call site.
    const session = await this.stripe.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [{ price: input.priceId, quantity: 1 }],
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
        client_reference_id: input.accountId,
        customer_email: input.customerEmail || undefined,
        // Do NOT set setup_future_usage / payment_intent_data.setup_future_usage.
        // Do NOT create subscriptions.
        metadata: {
          openfilament_account_id: input.accountId,
          openfilament_payment_uuid: input.internalPaymentUuid,
          purchase_type: "my_spools_cloud_12_months",
          checkout_version: input.checkoutVersion,
          access_months: String(input.accessMonths),
          amount_cents: String(input.amountCents),
          currency: input.currency,
        },
        payment_intent_data: {
          metadata: {
            openfilament_account_id: input.accountId,
            openfilament_payment_uuid: input.internalPaymentUuid,
            purchase_type: "my_spools_cloud_12_months",
          },
        },
      },
      { idempotencyKey: input.idempotencyKey },
    );

    if (!session.url) {
      throw new Error("Stripe Checkout Session missing URL");
    }

    return {
      provider: "stripe",
      checkoutId: session.id,
      checkoutUrl: session.url,
      expiresAt: session.expires_at
        ? new Date(session.expires_at * 1000).toISOString()
        : null,
    };
  }

  async verifyWebhook(input: RawWebhookInput): Promise<VerifiedPaymentEvent> {
    if (!this.webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    }
    if (!input.signatureHeader) {
      throw new Error("Missing Stripe-Signature header");
    }
    const event = this.stripe.webhooks.constructEvent(
      input.rawBody,
      input.signatureHeader,
      this.webhookSecret,
    );

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        return await this.mapPaidSession(event.id, session);
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          type: "checkout_failed",
          providerEventId: event.id,
          checkoutId: session.id,
          accountId: session.metadata?.openfilament_account_id ?? null,
          paymentUuid: session.metadata?.openfilament_payment_uuid ?? null,
        };
      }
      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        return {
          type: "checkout_expired",
          providerEventId: event.id,
          checkoutId: session.id,
        };
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (!pi) {
          return {
            type: "ignored",
            providerEventId: event.id,
            reason: "refund_without_payment_intent",
          };
        }
        const partial = charge.amount_refunded < charge.amount;
        return {
          type: "payment_refunded",
          providerEventId: event.id,
          paymentIntentId: pi,
          partial,
        };
      }
      case "charge.dispute.created": {
        const dispute = event.data.object as Stripe.Dispute;
        const chargeId =
          typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;
        if (!chargeId) {
          return {
            type: "ignored",
            providerEventId: event.id,
            reason: "dispute_without_charge",
          };
        }
        const charge = await this.stripe.charges.retrieve(chargeId);
        const pi =
          typeof charge.payment_intent === "string"
            ? charge.payment_intent
            : charge.payment_intent?.id;
        if (!pi) {
          return {
            type: "ignored",
            providerEventId: event.id,
            reason: "dispute_without_payment_intent",
          };
        }
        return {
          type: "payment_disputed",
          providerEventId: event.id,
          paymentIntentId: pi,
        };
      }
      default:
        return {
          type: "ignored",
          providerEventId: event.id,
          reason: `unhandled:${event.type}`,
        };
    }
  }

  private async mapPaidSession(
    providerEventId: string,
    session: Stripe.Checkout.Session,
  ): Promise<VerifiedPaymentEvent> {
    if (session.mode !== "payment") {
      return {
        type: "ignored",
        providerEventId,
        reason: "non_payment_mode_session",
      };
    }
    const purchaseType = session.metadata?.purchase_type;
    if (purchaseType !== "my_spools_cloud_12_months") {
      return {
        type: "ignored",
        providerEventId,
        reason: "wrong_purchase_type",
      };
    }

    // Do not grant on incomplete / unpaid sessions.
    if (session.payment_status !== "paid") {
      return {
        type: "checkout_pending",
        providerEventId,
        checkoutId: session.id,
        accountId: session.metadata?.openfilament_account_id ?? null,
        paymentUuid: session.metadata?.openfilament_payment_uuid ?? null,
      };
    }

    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id;
    if (!paymentIntentId) {
      return {
        type: "ignored",
        providerEventId,
        reason: "missing_payment_intent",
      };
    }

    const pi = await this.stripe.paymentIntents.retrieve(paymentIntentId);
    if (pi.status !== "succeeded") {
      return {
        type: "checkout_pending",
        providerEventId,
        checkoutId: session.id,
        accountId: session.metadata?.openfilament_account_id ?? null,
        paymentUuid: session.metadata?.openfilament_payment_uuid ?? null,
      };
    }

    let receiptUrl: string | null = null;
    if (pi.latest_charge) {
      const chargeId =
        typeof pi.latest_charge === "string"
          ? pi.latest_charge
          : pi.latest_charge.id;
      const charge = await this.stripe.charges.retrieve(chargeId);
      receiptUrl = charge.receipt_url ?? null;
    }

    const accountId = session.metadata?.openfilament_account_id;
    const paymentUuid = session.metadata?.openfilament_payment_uuid;
    if (!accountId || !paymentUuid) {
      return {
        type: "ignored",
        providerEventId,
        reason: "missing_account_or_payment_metadata",
      };
    }

    return {
      type: "checkout_paid",
      providerEventId,
      checkoutId: session.id,
      paymentIntentId,
      customerId:
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null,
      receiptUrl,
      amountCents: session.amount_total ?? pi.amount_received,
      currency: (session.currency ?? pi.currency).toLowerCase(),
      accountId,
      paymentUuid,
      paidAt: new Date((session.created || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    };
  }

  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    const pi = await this.stripe.paymentIntents.retrieve(paymentId);
    return {
      id: pi.id,
      status: pi.status,
      paid: pi.status === "succeeded",
    };
  }

  async createRefund(paymentId: string, amount?: number): Promise<RefundResult> {
    const refund = await this.stripe.refunds.create({
      payment_intent: paymentId,
      amount,
    });
    return { id: refund.id, status: refund.status ?? "unknown" };
  }
}

export function newCheckoutIdempotencyKey(accountId: string): string {
  const day = new Date().toISOString().slice(0, 10);
  const nonce = randomBytes(8).toString("hex");
  const hash = createHash("sha256")
    .update(`${accountId}:${day}:${nonce}`)
    .digest("hex")
    .slice(0, 24);
  return `cloud_co_${hash}`;
}

/** Audit helper: ensure session create payload never requests subscription. */
export function assertOneTimeCheckoutPayload(payload: Record<string, unknown>) {
  if (payload.mode !== "payment") {
    throw new Error("Checkout mode must be payment");
  }
  if ("subscription" in payload || "subscription_data" in payload) {
    throw new Error("Subscription fields are forbidden");
  }
  const piData = payload.payment_intent_data as Record<string, unknown> | undefined;
  if (piData?.setup_future_usage) {
    throw new Error("setup_future_usage is forbidden");
  }
}
