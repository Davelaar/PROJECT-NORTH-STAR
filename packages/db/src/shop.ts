import { and, asc, eq, inArray, lt, sql } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { schema, type AppDb } from "./client.js";

export type ShopPage = "filament" | "hardware" | "prints";
export type ShopProductInput = {
  page: ShopPage;
  title: string;
  description?: string;
  priceCents?: number;
  currency?: string;
  referralUrl?: string | null;
  stock?: number | null;
  active?: boolean;
  sortOrder?: number;
};
export type ShopOrderLineInput = { productUuid: string; quantity: number };

export function listShopProducts(db: AppDb, page?: ShopPage, admin = false) {
  const rows = db
    .select()
    .from(schema.shopProducts)
    .orderBy(asc(schema.shopProducts.sortOrder), asc(schema.shopProducts.title))
    .all()
    .filter((p) => (!page || p.page === page) && (admin || p.active));
  const ids = rows.map((r) => r.id);
  const images =
    ids.length === 0
      ? []
      : db
          .select()
          .from(schema.shopProductImages)
          .where(inArray(schema.shopProductImages.productId, ids))
          .orderBy(
            asc(schema.shopProductImages.sortOrder),
            asc(schema.shopProductImages.id),
          )
          .all();
  return rows.map((product) => ({
    ...product,
    images: images
      .filter((img) => img.productId === product.id)
      .map((img) => ({
        uuid: img.uuid,
        url: `/api/v1/shop/media/${img.uuid}`,
        alt: img.alt,
        sortOrder: img.sortOrder,
      })),
  }));
}

export function getShopProductByUuid(db: AppDb, productUuid: string) {
  return db
    .select()
    .from(schema.shopProducts)
    .where(eq(schema.shopProducts.uuid, productUuid))
    .get();
}

export function upsertShopProduct(
  db: AppDb,
  input: ShopProductInput & { uuid?: string },
) {
  const now = new Date().toISOString();
  const values = {
    page: input.page,
    title: input.title.trim(),
    description: input.description?.trim() ?? "",
    priceCents: Math.max(0, Math.round(input.priceCents ?? 0)),
    currency: (input.currency ?? "eur").toLowerCase(),
    referralUrl: input.referralUrl?.trim() || null,
    stock: input.stock ?? null,
    active: input.active ?? true,
    sortOrder: input.sortOrder ?? 0,
    updatedAt: now,
  };
  if (input.uuid) {
    db.update(schema.shopProducts)
      .set(values)
      .where(eq(schema.shopProducts.uuid, input.uuid))
      .run();
    return getShopProductByUuid(db, input.uuid)!;
  }
  const id = uuid();
  db.insert(schema.shopProducts)
    .values({ uuid: id, ...values, createdAt: now })
    .run();
  return getShopProductByUuid(db, id)!;
}

export function deleteShopProduct(db: AppDb, productUuid: string) {
  const row = getShopProductByUuid(db, productUuid);
  if (!row) return false;
  db.delete(schema.shopProducts).where(eq(schema.shopProducts.id, row.id)).run();
  return true;
}

export function attachShopImage(
  db: AppDb,
  input: {
    productUuid: string;
    storagePath: string;
    mimeType: string;
    alt?: string;
    sortOrder?: number;
  },
) {
  const product = getShopProductByUuid(db, input.productUuid);
  if (!product) return null;
  const id = uuid();
  db.insert(schema.shopProductImages)
    .values({
      uuid: id,
      productId: product.id,
      storagePath: input.storagePath,
      mimeType: input.mimeType,
      alt: input.alt ?? product.title,
      sortOrder: input.sortOrder ?? 0,
    })
    .run();
  return db
    .select()
    .from(schema.shopProductImages)
    .where(eq(schema.shopProductImages.uuid, id))
    .get()!;
}

export function getShopImage(db: AppDb, imageUuid: string) {
  return db
    .select()
    .from(schema.shopProductImages)
    .where(eq(schema.shopProductImages.uuid, imageUuid))
    .get();
}

export function deleteShopImage(db: AppDb, imageUuid: string) {
  const row = getShopImage(db, imageUuid);
  if (!row) return null;
  db.delete(schema.shopProductImages)
    .where(eq(schema.shopProductImages.id, row.id))
    .run();
  return row;
}

export function createPendingShopOrder(
  db: AppDb,
  input: { email: string; lines: ShopOrderLineInput[] },
) {
  const products = input.lines
    .map((line) => ({
      line,
      product: getShopProductByUuid(db, line.productUuid),
    }))
    .filter((x): x is { line: ShopOrderLineInput; product: NonNullable<ReturnType<typeof getShopProductByUuid>> } =>
      Boolean(x.product && x.product.active && x.product.page === "prints"),
    );
  if (products.length === 0) {
    throw new Error("No available print products in cart");
  }
  for (const { line, product } of products) {
    if (line.quantity < 1 || line.quantity > 99) throw new Error("Invalid quantity");
    if (product.stock !== null && product.stock < line.quantity) {
      throw new Error(`${product.title} is out of stock`);
    }
  }
  const amountCents = products.reduce(
    (sum, { line, product }) => sum + product.priceCents * line.quantity,
    0,
  );
  if (amountCents <= 0) throw new Error("Order total must be positive");
  const now = new Date();
  const orderUuid = uuid();
  const token = uuid();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  db.insert(schema.shopOrders)
    .values({
      uuid: orderUuid,
      email: input.email.trim().toLowerCase(),
      amountCents,
      currency: "eur",
      checkoutToken: token,
      expiresAt,
      rawProviderStatus: "created",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
    .run();
  const order = db
    .select()
    .from(schema.shopOrders)
    .where(eq(schema.shopOrders.uuid, orderUuid))
    .get()!;
  for (const { line, product } of products) {
    db.insert(schema.shopOrderItems)
      .values({
        orderId: order.id,
        productUuid: product.uuid,
        title: product.title,
        unitAmountCents: product.priceCents,
        quantity: line.quantity,
      })
      .run();
  }
  return { order, items: getShopOrderItems(db, order.id) };
}

export function getShopOrderItems(db: AppDb, orderId: number) {
  return db
    .select()
    .from(schema.shopOrderItems)
    .where(eq(schema.shopOrderItems.orderId, orderId))
    .all();
}

export function getShopOrderByUuid(db: AppDb, orderUuid: string) {
  return db
    .select()
    .from(schema.shopOrders)
    .where(eq(schema.shopOrders.uuid, orderUuid))
    .get();
}

export function getShopOrderByCheckout(db: AppDb, checkoutId: string) {
  return db
    .select()
    .from(schema.shopOrders)
    .where(eq(schema.shopOrders.providerCheckoutId, checkoutId))
    .get();
}

export function updateShopOrderCheckout(
  db: AppDb,
  orderId: number,
  checkoutId: string,
) {
  db.update(schema.shopOrders)
    .set({
      providerCheckoutId: checkoutId,
      rawProviderStatus: "checkout_created",
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.shopOrders.id, orderId))
    .run();
}

export function markShopOrderPaid(
  db: AppDb,
  input: {
    orderUuid: string;
    checkoutId: string;
    paymentIntentId: string;
    customerId?: string | null;
    receiptUrl?: string | null;
    amountCents: number;
    currency: string;
    paidAt: string;
    shippingJson?: string | null;
  },
) {
  const order = getShopOrderByUuid(db, input.orderUuid);
  if (!order) throw new Error("shop_order_missing");
  if (order.amountCents !== input.amountCents || order.currency !== input.currency) {
    throw new Error("shop_order_amount_mismatch");
  }
  db.transaction(() => {
    db.update(schema.shopOrders)
      .set({
        status: "paid",
        providerCheckoutId: input.checkoutId,
        providerPaymentId: input.paymentIntentId,
        providerCustomerId: input.customerId ?? null,
        providerReceiptUrl: input.receiptUrl ?? null,
        paidAt: input.paidAt,
        shippingJson: input.shippingJson ?? order.shippingJson,
        rawProviderStatus: "paid",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.shopOrders.id, order.id))
      .run();
    for (const item of getShopOrderItems(db, order.id)) {
      const product = getShopProductByUuid(db, item.productUuid);
      if (product && product.stock !== null) {
        db.update(schema.shopProducts)
          .set({
            stock: Math.max(0, product.stock - item.quantity),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(schema.shopProducts.id, product.id))
          .run();
      }
    }
  });
}

export function markShopOrderCheckoutStatus(
  db: AppDb,
  checkoutId: string,
  status: "expired" | "cancelled",
) {
  const order = getShopOrderByCheckout(db, checkoutId);
  if (!order || order.status !== "pending") return false;
  db.update(schema.shopOrders)
    .set({
      status,
      rawProviderStatus: status,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(schema.shopOrders.id, order.id))
    .run();
  return true;
}

export function purgeExpiredShopOrders(db: AppDb, now = new Date()) {
  const cutoff = now.toISOString();
  const rows = db
    .select({ id: schema.shopOrders.id })
    .from(schema.shopOrders)
    .where(
      and(
        inArray(schema.shopOrders.status, ["pending", "expired", "cancelled"]),
        lt(schema.shopOrders.expiresAt, cutoff),
      ),
    )
    .all();
  if (rows.length === 0) return { purgedOrders: 0 };
  db.delete(schema.shopOrders)
    .where(inArray(schema.shopOrders.id, rows.map((r) => r.id)))
    .run();
  return { purgedOrders: rows.length };
}

export function listShopOrders(db: AppDb) {
  return db
    .select()
    .from(schema.shopOrders)
    .orderBy(sql`${schema.shopOrders.createdAt} desc`)
    .all()
    .slice(0, 200)
    .map((order) => ({ ...order, items: getShopOrderItems(db, order.id) }));
}
