import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { fetchShopProducts } from "../data";
import { ShopGrid } from "../shop-grid";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.shop.hardwareTitle,
    description: m.shop.hardwareLead,
    path: "/shop/hardware",
  });
}

export default async function ShopHardwarePage() {
  const { messages: m } = await getLocaleMessages();
  const products = await fetchShopProducts("hardware");
  return (
    <div className="stack">
      <h1>{m.shop.hardwareTitle}</h1>
      <p className="home-lead">{m.shop.hardwareLead}</p>
      <ShopGrid products={products} messages={m.shop} mode="referral" />
    </div>
  );
}
