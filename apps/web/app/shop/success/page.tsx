import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ShopSuccessClient } from "./success-client";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.shop.successTitle,
    description: m.shop.successPending,
    path: "/shop/success",
    noIndex: true,
  });
}

export default async function ShopSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { messages: m } = await getLocaleMessages();
  const { order } = await searchParams;
  return (
    <div className="stack">
      <h1>{m.shop.successTitle}</h1>
      {order ? (
        <ShopSuccessClient orderUuid={order} messages={m.shop} />
      ) : (
        <p className="banner-warn">{m.shop.successFailed}</p>
      )}
    </div>
  );
}
