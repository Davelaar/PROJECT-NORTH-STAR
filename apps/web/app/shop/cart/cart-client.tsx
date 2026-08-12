"use client";

import { useEffect, useMemo, useState } from "react";
import { apiPost } from "@/lib/api";
import type { ShopMessages, ShopProduct } from "../types";
import { formatShopPrice } from "../types";
import { CART_KEY, CART_TTL_MS } from "../shop-grid";

type CartLine = { productUuid: string; quantity: number };
type Cart = { expiresAt: number; lines: CartLine[] };

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

function writeCart(cart: Cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event("of-shop-cart"));
}

export function CartClient({
  products,
  messages,
}: {
  products: ShopProduct[];
  messages: ShopMessages;
}) {
  const [cart, setCart] = useState<Cart>({ expiresAt: Date.now() + CART_TTL_MS, lines: [] });
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCart(readCart());
  }, []);

  function update(lines: CartLine[]) {
    const next = { expiresAt: Date.now() + CART_TTL_MS, lines };
    setCart(next);
    writeCart(next);
  }

  const rows = cart.lines
    .map((line) => ({
      line,
      product: products.find((p) => p.uuid === line.productUuid),
    }))
    .filter((r): r is { line: CartLine; product: ShopProduct } => Boolean(r.product));
  const total = useMemo(
    () => rows.reduce((sum, r) => sum + r.product.priceCents * r.line.quantity, 0),
    [rows],
  );

  async function checkout() {
    setError("");
    setLoading(true);
    try {
      const res = await apiPost<{ checkoutUrl: string }>("/api/v1/shop/checkout", {
        email,
        lines: rows.map((r) => r.line),
      });
      window.location.href = res.checkoutUrl;
    } catch {
      setError(messages.checkoutError);
      setLoading(false);
    }
  }

  return (
    <div className="stack">
      <p className="banner-warn">{messages.retentionNotice}</p>
      {rows.length === 0 ? (
        <p className="muted">{messages.cartEmpty}</p>
      ) : (
        <div className="shop-cart">
          {rows.map(({ line, product }) => (
            <div className="shop-cart-row" key={product.uuid}>
              <div>
                <strong>{product.title}</strong>
                <p className="muted">{formatShopPrice(product.priceCents, product.currency)}</p>
              </div>
              <label>
                {messages.quantity}
                <input
                  min={1}
                  max={99}
                  type="number"
                  value={line.quantity}
                  onChange={(e) => {
                    const quantity = Math.max(1, Number(e.target.value) || 1);
                    update(
                      cart.lines.map((l) =>
                        l.productUuid === product.uuid ? { ...l, quantity } : l,
                      ),
                    );
                  }}
                />
              </label>
              <button
                className="linkish"
                type="button"
                onClick={() =>
                  update(cart.lines.filter((l) => l.productUuid !== product.uuid))
                }
              >
                {messages.remove}
              </button>
            </div>
          ))}
          <p className="shop-total">
            {messages.total}: <strong>{formatShopPrice(total)}</strong>
          </p>
          <label>
            {messages.email}
            <input
              value={email}
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          {error ? <p className="banner-warn">{error}</p> : null}
          <button className="button" disabled={loading || !email} onClick={checkout} type="button">
            {loading ? "…" : messages.checkout}
          </button>
        </div>
      )}
    </div>
  );
}
