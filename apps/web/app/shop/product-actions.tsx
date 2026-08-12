"use client";

import { useState } from "react";
import { LocaleLink } from "../components/locale-link";
import type { ShopMessages, ShopProduct } from "./types";
import { addShopCartLine } from "./shop-grid";

export function ProductActions({
  messages,
  product,
}: {
  messages: ShopMessages;
  product: ShopProduct;
}) {
  const [added, setAdded] = useState(false);

  function add() {
    addShopCartLine(product.uuid);
    setAdded(true);
  }

  if (product.page === "prints") {
    return (
      <div className="home-cta-links">
        <button className="button" type="button" onClick={add}>
          {added ? messages.addedToCart : messages.addToCart}
        </button>
        {added ? (
          <LocaleLink className="button secondary" href="/shop/cart">
            {messages.viewCart}
          </LocaleLink>
        ) : null}
      </div>
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
