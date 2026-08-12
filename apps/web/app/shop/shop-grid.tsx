"use client";

import Link from "next/link";
import type { ShopMessages, ShopProduct } from "./types";
import { formatShopPrice } from "./types";

const CART_KEY = "of_shop_cart_v1";
const CART_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type Cart = {
  expiresAt: number;
  lines: { productUuid: string; quantity: number }[];
};

function readCart(): Cart {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) ?? "null") as Cart | null;
    if (!parsed || parsed.expiresAt < Date.now()) {
      localStorage.removeItem(CART_KEY);
      return { expiresAt: Date.now() + CART_TTL_MS, lines: [] };
    }
    return parsed;
  } catch {
    return { expiresAt: Date.now() + CART_TTL_MS, lines: [] };
  }
}

export function addShopCartLine(productUuid: string) {
  const cart = readCart();
  const hit = cart.lines.find((l) => l.productUuid === productUuid);
  if (hit) hit.quantity += 1;
  else cart.lines.push({ productUuid, quantity: 1 });
  cart.expiresAt = Date.now() + CART_TTL_MS;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("of-shop-cart"));
}

export function ShopGrid({
  products,
  messages,
  mode,
}: {
  products: ShopProduct[];
  messages: ShopMessages;
  mode: "referral" | "prints";
}) {
  if (products.length === 0) return <p className="muted">{messages.empty}</p>;
  return (
    <div className="shop-grid">
      {products.map((product) => {
        const image = product.images[0];
        const soldOut = mode === "prints" && product.stock !== null && product.stock === 0;
        return (
          <article className="shop-product" key={product.uuid}>
            {image ? (
              <img src={image.url} alt={image.alt || product.title} loading="lazy" />
            ) : (
              <div className="shop-product-image-placeholder" aria-hidden="true" />
            )}
            <div className="shop-product-body">
              <p className="muted">{mode === "referral" ? messages.partnerLink : "OpenFilament"}</p>
              <h2>{product.title}</h2>
              <p>{product.description}</p>
              <strong>{formatShopPrice(product.priceCents, product.currency)}</strong>
              {mode === "referral" ? (
                <a
                  className="button"
                  href={product.referralUrl ?? "#"}
                  rel="nofollow sponsored noopener"
                  target="_blank"
                >
                  {messages.buyExternal}
                </a>
              ) : soldOut ? (
                <span className="button button-muted" aria-disabled="true">
                  {messages.soldOut}
                </span>
              ) : (
                <button
                  className="button"
                  type="button"
                  onClick={() => addShopCartLine(product.uuid)}
                >
                  {messages.addToCart}
                </button>
              )}
            </div>
          </article>
        );
      })}
      {mode === "prints" ? (
        <p className="shop-cart-link">
          <Link href="/shop/cart">{messages.cartTitle}</Link>
        </p>
      ) : null}
    </div>
  );
}

export { CART_KEY, CART_TTL_MS };
