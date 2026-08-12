import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { fetchShopProducts } from "../data";
import { ShopGrid } from "../shop-grid";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.shop.printsTitle,
    description: m.shop.printsLead,
    path: "/shop/prints",
  });
}

export default async function ShopPrintsPage() {
  const { messages: m } = await getLocaleMessages();
  const products = await fetchShopProducts("prints");
  return (
    <div className="stack">
      <h1>{m.shop.printsTitle}</h1>
      <p className="home-lead">{m.shop.printsLead}</p>
      <p className="banner-warn">{m.shop.shippingNotice}</p>
      <ShopGrid products={products} messages={m.shop} mode="prints" />
    </div>
  );
}
