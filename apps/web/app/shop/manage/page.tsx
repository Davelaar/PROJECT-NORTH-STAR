import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { ManageClient } from "./manage-client";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.shop.adminTitle,
    description: m.shop.adminTitle,
    path: "/shop/manage",
    noIndex: true,
  });
}

export default async function ShopManagePage() {
  const { messages: m } = await getLocaleMessages();
  return (
    <div className="stack">
      <h1>{m.shop.adminTitle}</h1>
      <ManageClient messages={m.shop} />
    </div>
  );
}
