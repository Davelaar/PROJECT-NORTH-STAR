"use client";

import type { ShopMessages, ShopProduct } from "./types";
import { addShopCartLine } from "./shop-grid";

export function ProductActions({
  messages,
  product,
}: {
  messages: ShopMessages;
  product: ShopProduct;
}) {
  if (product.page === "prints") {
    return (
      <button
        className="button"
        type="button"
        onClick={() => addShopCartLine(product.uuid)}
      >
        {messages.addToCart}
      </button>
    );
  }

  return (
    <a
      className="button"
      href={product.referralUrl ?? "#"}
      rel="nofollow sponsored noopener"
      target="_blank"
    >
      {messages.buyExternal}
    </a>
  );
}
