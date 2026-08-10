import { describe, expect, it } from "vitest";
import {
  assertOneTimeCheckoutPayload,
  loadStripeCloudConfig,
} from "./stripe-provider.js";

describe("stripe one-time cloud checkout guards", () => {
  it("accepts payment mode without future usage", () => {
    expect(() =>
      assertOneTimeCheckoutPayload({
        mode: "payment",
        payment_intent_data: { metadata: { purchase_type: "my_spools_cloud_12_months" } },
      }),
    ).not.toThrow();
  });

  it("rejects subscription mode", () => {
    expect(() => assertOneTimeCheckoutPayload({ mode: "subscription" })).toThrow(
      /payment/,
    );
  });

  it("rejects setup_future_usage", () => {
    expect(() =>
      assertOneTimeCheckoutPayload({
        mode: "payment",
        payment_intent_data: { setup_future_usage: "off_session" },
      }),
    ).toThrow(/setup_future_usage/);
  });

  it("requires sk_test in test mode", () => {
    expect(() =>
      loadStripeCloudConfig({
        STRIPE_SECRET_KEY: "sk_live_x",
        STRIPE_MODE: "test",
      }),
    ).toThrow(/sk_test_/);
  });
});
