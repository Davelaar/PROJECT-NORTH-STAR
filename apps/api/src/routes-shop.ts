import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { eq } from "drizzle-orm";
import Stripe from "stripe";
import { z } from "zod";
import {
  attachShopImage,
  createPendingShopOrder,
  deleteShopImage,
  deleteShopProduct,
  getShopImage,
  getShopOrderByUuid,
  getShopOrderItems,
  getShopProductDetails,
  listShopOrders,
  listShopProducts,
  purgeExpiredShopOrders,
  schema,
  updateShopOrderCheckout,
  upsertShopProduct,
  type AppDb,
  type ShopContentLocale,
  type ShopPage,
} from "@open-filament/db";
import { badRequest, notFound, unauthorized } from "./errors.js";

const SHOP_ADMIN_COOKIE = "of_shop_admin";
const SHOP_SESSION_MAX_AGE = 60 * 60 * 8;
const IMAGE_DIR =
  process.env.SHOP_MEDIA_DIR ?? "/var/lib/open-filament/shop-media";

function db(app: FastifyInstance): AppDb {
  return app.db;
}

function publicBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    process.env.WEB_ORIGIN?.split(",")[0]?.trim().replace(/\/$/, "") ||
    "https://openfilament.nl"
  );
}

function cookieValue(header: string | undefined, name: string) {
  const prefix = `${name}=`;
  return header
    ?.split(";")
    .map((p) => p.trim())
    .find((p) => p.startsWith(prefix))
    ?.slice(prefix.length);
}

function adminSecret() {
  return process.env.SHOP_ADMIN_PASSWORD?.trim() || "";
}

function signSession(exp: number) {
  const nonce = randomBytes(16).toString("hex");
  const payload = `${exp}.${nonce}`;
  const sig = createHmac("sha256", adminSecret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verifySession(raw: string | undefined) {
  if (!raw || !adminSecret()) return false;
  const parts = raw.split(".");
  if (parts.length !== 3) return false;
  const [expRaw, nonce, sig] = parts;
  if (!expRaw || !nonce || !sig) return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000)) return false;
  const payload = `${expRaw}.${nonce}`;
  const expected = createHmac("sha256", adminSecret()).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

function requireShopAdmin(req: FastifyRequest, reply: FastifyReply) {
  if (!adminSecret()) {
    unauthorized(reply, "Shop admin is not configured");
    return false;
  }
  const ok = verifySession(cookieValue(req.headers.cookie, SHOP_ADMIN_COOKIE));
  if (!ok) {
    unauthorized(reply, "Shop admin login required");
    return false;
  }
  return true;
}

const pageSchema = z.enum(["filament", "hardware", "prints"]);
const shopContentLocaleSchema = z.enum(["en", "nl", "de", "fr"]);
const shippingCountrySchema = z.enum(["NL", "BE", "DE"]);
const shippingRatesCents: Record<z.infer<typeof shippingCountrySchema>, number> = {
  NL: 495,
  BE: 995,
  DE: 995,
};
const productSchema = z.object({
  uuid: z.string().uuid().optional(),
  page: pageSchema,
  title: z.string().min(1).max(160),
  description: z.string().max(2000).optional(),
  titleNl: z.string().max(160).nullable().optional(),
  titleEn: z.string().max(160).nullable().optional(),
  titleDe: z.string().max(160).nullable().optional(),
  titleFr: z.string().max(160).nullable().optional(),
  descriptionNl: z.string().max(2000).nullable().optional(),
  descriptionEn: z.string().max(2000).nullable().optional(),
  descriptionDe: z.string().max(2000).nullable().optional(),
  descriptionFr: z.string().max(2000).nullable().optional(),
  priceCents: z.number().int().min(0).max(1_000_000).optional(),
  currency: z.string().default("eur"),
  referralUrl: z.string().url().nullable().optional(),
  stock: z.number().int().min(0).max(9999).nullable().optional(),
  active: z.boolean().optional(),
  sortOrder: z.number().int().min(-9999).max(9999).optional(),
});

function assertProductRules(input: z.infer<typeof productSchema>) {
  if (input.page === "prints" && input.referralUrl) {
    throw new Error("Print products cannot have referral URLs");
  }
  if ((input.page === "filament" || input.page === "hardware") && !input.referralUrl) {
    throw new Error("Referral products need a referral URL");
  }
}

function stripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY?.trim();
  if (!secretKey) return null;
  const mode = (process.env.STRIPE_MODE ?? "test").toLowerCase() === "live" ? "live" : "test";
  if (mode === "live" && process.env.SHOP_LIVE_PAYMENTS !== "true") {
    throw new Error("Live shop checkout is disabled until SHOP_LIVE_PAYMENTS=true");
  }
  return new Stripe(secretKey);
}

export async function registerShopRoutes(app: FastifyInstance) {
  const cleanupTimer = setInterval(() => {
    try {
      purgeExpiredShopOrders(db(app));
    } catch (err) {
      app.log.warn({ err }, "shop_cleanup_failed");
    }
  }, 24 * 60 * 60 * 1000);
  cleanupTimer.unref?.();

  app.get<{ Querystring: { page?: ShopPage; locale?: ShopContentLocale } }>(
    "/api/v1/shop/products",
    async (req) => {
      const parsed = pageSchema.optional().safeParse(req.query.page);
      const locale = shopContentLocaleSchema.optional().safeParse(req.query.locale);
      const page = parsed.success ? parsed.data : undefined;
      return {
        products: listShopProducts(
          db(app),
          page,
          false,
          locale.success ? locale.data : undefined,
        ),
      };
    },
  );

  app.get<{
    Params: { uuid: string };
    Querystring: { locale?: ShopContentLocale };
  }>("/api/v1/shop/products/:uuid", async (req, reply) => {
    const locale = shopContentLocaleSchema.optional().safeParse(req.query.locale);
    const product = getShopProductDetails(
      db(app),
      req.params.uuid,
      locale.success ? locale.data : undefined,
    );
    if (!product) return notFound(reply, "Product not found");
    return { product };
  });

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/shop/media/:uuid",
    async (req, reply) => {
      const image = getShopImage(db(app), req.params.uuid);
      if (!image) return notFound(reply, "Image not found");
      if (!fs.existsSync(image.storagePath)) return notFound(reply, "Image not found");
      reply.header("content-type", image.mimeType);
      reply.header("cache-control", "public, max-age=31536000, immutable");
      return reply.send(fs.createReadStream(image.storagePath));
    },
  );

  app.post("/api/v1/shop/admin/login", {
    config: { rateLimit: { max: 8, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
      const body = z.object({ password: z.string().min(1) }).safeParse(req.body);
      if (!body.success) return badRequest(reply, "Invalid body");
      const secret = adminSecret();
      if (!secret || body.data.password !== secret) return unauthorized(reply);
      const exp = Math.floor(Date.now() / 1000) + SHOP_SESSION_MAX_AGE;
      reply.header(
        "set-cookie",
        `${SHOP_ADMIN_COOKIE}=${signSession(exp)}; Path=/; Max-Age=${SHOP_SESSION_MAX_AGE}; HttpOnly; SameSite=Lax; Secure`,
      );
      return { ok: true };
    },
  });

  app.post("/api/v1/shop/admin/logout", async (req, reply) => {
    reply.header(
      "set-cookie",
      `${SHOP_ADMIN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax; Secure`,
    );
    return { ok: true };
  });

  app.get("/api/v1/shop/admin/session", async (req) => {
    return {
      authenticated: verifySession(cookieValue(req.headers.cookie, SHOP_ADMIN_COOKIE)),
    };
  });

  app.get<{ Querystring: { page?: ShopPage } }>(
    "/api/v1/shop/admin/products",
    async (req, reply) => {
      if (!requireShopAdmin(req, reply)) return;
      const parsed = pageSchema.optional().safeParse(req.query.page);
      return {
        products: listShopProducts(db(app), parsed.success ? parsed.data : undefined, true),
      };
    },
  );

  app.post("/api/v1/shop/admin/products", async (req, reply) => {
    if (!requireShopAdmin(req, reply)) return;
    const body = productSchema.safeParse(req.body);
    if (!body.success) return badRequest(reply, "Invalid body", body.error.flatten());
    try {
      assertProductRules(body.data);
      return { product: upsertShopProduct(db(app), body.data) };
    } catch (e) {
      return badRequest(reply, e instanceof Error ? e.message : "Invalid product");
    }
  });

  app.delete<{ Params: { uuid: string } }>(
    "/api/v1/shop/admin/products/:uuid",
    async (req, reply) => {
      if (!requireShopAdmin(req, reply)) return;
      if (!deleteShopProduct(db(app), req.params.uuid)) {
        return notFound(reply, "Product not found");
      }
      return { ok: true };
    },
  );

  app.post("/api/v1/shop/admin/media", {
    bodyLimit: 4 * 1024 * 1024,
    handler: async (req, reply) => {
      if (!requireShopAdmin(req, reply)) return;
      const body = z
        .object({
          productUuid: z.string().uuid(),
          mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
          dataBase64: z.string().min(10),
          alt: z.string().max(160).optional(),
        })
        .safeParse(req.body);
      if (!body.success) return badRequest(reply, "Invalid body", body.error.flatten());
      const bytes = Buffer.from(body.data.dataBase64, "base64");
      if (bytes.length > 2 * 1024 * 1024) return badRequest(reply, "Image too large");
      fs.mkdirSync(IMAGE_DIR, { recursive: true });
      const ext =
        body.data.mimeType === "image/png"
          ? "png"
          : body.data.mimeType === "image/webp"
            ? "webp"
            : "jpg";
      const file = path.join(IMAGE_DIR, `${randomBytes(16).toString("hex")}.${ext}`);
      fs.writeFileSync(file, bytes);
      const image = attachShopImage(db(app), {
        productUuid: body.data.productUuid,
        storagePath: file,
        mimeType: body.data.mimeType,
        alt: body.data.alt,
      });
      if (!image) {
        fs.rmSync(file, { force: true });
        return notFound(reply, "Product not found");
      }
      return {
        image: {
          uuid: image.uuid,
          url: `/api/v1/shop/media/${image.uuid}`,
          alt: image.alt,
        },
      };
    },
  });

  app.delete<{ Params: { uuid: string } }>(
    "/api/v1/shop/admin/media/:uuid",
    async (req, reply) => {
      if (!requireShopAdmin(req, reply)) return;
      const image = deleteShopImage(db(app), req.params.uuid);
      if (!image) return notFound(reply, "Image not found");
      fs.rmSync(image.storagePath, { force: true });
      return { ok: true };
    },
  );

  app.get("/api/v1/shop/admin/orders", async (req, reply) => {
    if (!requireShopAdmin(req, reply)) return;
    return { orders: listShopOrders(db(app)) };
  });

  app.post("/api/v1/shop/checkout", {
    config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    handler: async (req, reply) => {
      const body = z
        .object({
          email: z.string().email(),
          shippingCountry: shippingCountrySchema,
          lines: z
            .array(
              z.object({
                productUuid: z.string().uuid(),
                quantity: z.number().int().min(1).max(99),
              }),
            )
            .min(1)
            .max(20),
        })
        .safeParse(req.body);
      if (!body.success) return badRequest(reply, "Invalid body", body.error.flatten());
      const stripe = stripeClient();
      if (!stripe) return badRequest(reply, "Stripe is not configured");
      let pending;
      try {
        pending = createPendingShopOrder(db(app), body.data);
      } catch (e) {
        return badRequest(reply, e instanceof Error ? e.message : "Invalid cart");
      }
      const base = publicBaseUrl();
      const successUrl = `${base}/shop/success?order=${encodeURIComponent(pending.order.uuid)}`;
      const cancelUrl = `${base}/shop/cart`;
      const shippingAmount = shippingRatesCents[body.data.shippingCountry];
      const shippingName =
        body.data.shippingCountry === "NL"
          ? "Shipping Netherlands (2-3 business days)"
          : "Shipping Belgium/Germany (2-3 business days)";
      const session = await stripe.checkout.sessions.create(
        {
          mode: "payment",
          line_items: pending.items.map((item) => ({
            quantity: item.quantity,
            price_data: {
              currency: pending.order.currency,
              unit_amount: item.unitAmountCents,
              product_data: { name: item.title },
            },
          })),
          customer_email: body.data.email,
          success_url: successUrl,
          cancel_url: cancelUrl,
          shipping_address_collection: {
            allowed_countries: [body.data.shippingCountry],
          },
          shipping_options: [
            {
              shipping_rate_data: {
                display_name: shippingName,
                type: "fixed_amount",
                fixed_amount: {
                  amount: shippingAmount,
                  currency: pending.order.currency,
                },
                delivery_estimate: {
                  minimum: { unit: "business_day", value: 2 },
                  maximum: { unit: "business_day", value: 3 },
                },
              },
            },
          ],
          metadata: {
            purchase_type: "shop_print",
            openfilament_order_uuid: pending.order.uuid,
            shipping_country: body.data.shippingCountry,
          },
          payment_intent_data: {
            metadata: {
              purchase_type: "shop_print",
              openfilament_order_uuid: pending.order.uuid,
              shipping_country: body.data.shippingCountry,
            },
          },
          ...( {
            integration_identifier: "openfilament_shop_abcdwxyz",
            managed_payments: { enabled: false },
          } as object ),
        },
        { idempotencyKey: pending.order.checkoutToken },
      );
      if (!session.url) return badRequest(reply, "Stripe Checkout Session missing URL");
      updateShopOrderCheckout(db(app), pending.order.id, session.id);
      return {
        checkoutUrl: session.url,
        orderUuid: pending.order.uuid,
        amountCents: pending.order.amountCents,
        currency: pending.order.currency,
      };
    },
  });

  app.get<{ Params: { uuid: string } }>(
    "/api/v1/shop/orders/:uuid",
    async (req, reply) => {
      const order = getShopOrderByUuid(db(app), req.params.uuid);
      if (!order) return notFound(reply, "Order not found");
      return {
        uuid: order.uuid,
        status: order.status,
        amountCents: order.amountCents,
        currency: order.currency,
        paidAt: order.paidAt,
        items: getShopOrderItems(db(app), order.id).map((i) => ({
          title: i.title,
          quantity: i.quantity,
          unitAmountCents: i.unitAmountCents,
        })),
      };
    },
  );

  app.post("/api/v1/shop/admin/cleanup", async (req, reply) => {
    if (!requireShopAdmin(req, reply)) return;
    return purgeExpiredShopOrders(db(app));
  });
}
