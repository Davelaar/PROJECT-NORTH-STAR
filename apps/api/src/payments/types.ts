/**
 * Provider-neutral one-time Cloud access payments.
 * Implementations must NEVER create subscriptions or store payment methods for off-session charges.
 */

export type CreateCloudCheckoutInput = {
  accountId: string;
  internalPaymentUuid: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
  customerEmail?: string | null;
  priceId: string;
  amountCents: number;
  currency: string;
  accessMonths: number;
  checkoutVersion: string;
};

export type CheckoutResult = {
  provider: "stripe" | "paypal" | "manual" | "merchant_of_record";
  checkoutId: string;
  checkoutUrl: string;
  expiresAt: string | null;
};

export type RawWebhookInput = {
  rawBody: Buffer | string;
  signatureHeader: string | undefined;
};

export type VerifiedPaymentEvent =
  | {
      type: "checkout_paid";
      providerEventId: string;
      checkoutId: string;
      paymentIntentId: string;
      customerId: string | null;
      receiptUrl: string | null;
      amountCents: number;
      currency: string;
      accountId: string;
      paymentUuid: string;
      paidAt: string;
    }
  | {
      type: "shop_checkout_paid";
      providerEventId: string;
      checkoutId: string;
      paymentIntentId: string;
      customerId: string | null;
      receiptUrl: string | null;
      amountCents: number;
      currency: string;
      orderUuid: string;
      paidAt: string;
      shippingJson: string | null;
    }
  | {
      type: "shop_checkout_pending";
      providerEventId: string;
      checkoutId: string;
      orderUuid: string | null;
    }
  | {
      type: "shop_checkout_failed";
      providerEventId: string;
      checkoutId: string;
      orderUuid: string | null;
    }
  | {
      type: "shop_checkout_expired";
      providerEventId: string;
      checkoutId: string;
    }
  | {
      type: "checkout_pending";
      providerEventId: string;
      checkoutId: string;
      accountId: string | null;
      paymentUuid: string | null;
    }
  | {
      type: "checkout_failed";
      providerEventId: string;
      checkoutId: string;
      accountId: string | null;
      paymentUuid: string | null;
    }
  | {
      type: "checkout_expired";
      providerEventId: string;
      checkoutId: string;
    }
  | {
      type: "payment_refunded";
      providerEventId: string;
      paymentIntentId: string;
      partial: boolean;
    }
  | {
      type: "payment_disputed";
      providerEventId: string;
      paymentIntentId: string;
    }
  | {
      type: "ignored";
      providerEventId: string;
      reason: string;
    };

export type PaymentStatus = {
  id: string;
  status: string;
  paid: boolean;
};

export type RefundResult = {
  id: string;
  status: string;
};

export interface OneTimeCloudAccessPaymentProvider {
  readonly providerName: "stripe" | "paypal" | "manual" | "merchant_of_record";
  createCheckout(input: CreateCloudCheckoutInput): Promise<CheckoutResult>;
  verifyWebhook(input: RawWebhookInput): Promise<VerifiedPaymentEvent>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
  createRefund?(paymentId: string, amount?: number): Promise<RefundResult>;
}
