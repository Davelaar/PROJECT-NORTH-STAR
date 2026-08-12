import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { fetchShopProducts } from "../data";
import { CartClient } from "./cart-client";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.shop.cartTitle,
    description: m.shop.cartLead,
    path: "/shop/cart",
    noIndex: true,
  });
}

export default async function ShopCartPage() {
  const { messages: m } = await getLocaleMessages();
  const products = await fetchShopProducts("prints");
  return (
    <div className="stack">
      <h1>{m.shop.cartTitle}</h1>
      <p className="home-lead">{m.shop.cartLead}</p>
      <CartClient products={products} messages={m.shop} />
    </div>
  );
}
