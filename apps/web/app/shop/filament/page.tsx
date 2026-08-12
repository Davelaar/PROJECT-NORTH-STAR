import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { fetchShopProducts } from "../data";
import { ShopGrid } from "../shop-grid";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.shop.filamentTitle,
    description: m.shop.filamentLead,
    path: "/shop/filament",
  });
}

export default async function ShopFilamentPage() {
  const { messages: m } = await getLocaleMessages();
  const products = await fetchShopProducts("filament");
  return (
    <div className="stack">
      <h1>{m.shop.filamentTitle}</h1>
      <p className="home-lead">{m.shop.filamentLead}</p>
      <ShopGrid products={products} messages={m.shop} mode="referral" />
    </div>
  );
}
