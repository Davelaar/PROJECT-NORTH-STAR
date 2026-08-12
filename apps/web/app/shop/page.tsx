import Link from "next/link";
import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { localizedPath } from "@/lib/i18n/routing";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.shop.hubTitle,
    description: m.shop.hubLead,
    path: "/shop",
  });
}

export default async function ShopPage() {
  const { locale, messages: m } = await getLocaleMessages();
  const cards = [
    {
      href: "/shop/filament",
      title: m.shop.filamentTitle,
      body: m.shop.filamentLead,
    },
    {
      href: "/shop/hardware",
      title: m.shop.hardwareTitle,
      body: m.shop.hardwareLead,
    },
    {
      href: "/shop/prints",
      title: m.shop.printsTitle,
      body: m.shop.printsLead,
    },
  ];
  return (
    <div className="stack">
      <section className="shop-hero">
        <p className="muted">OpenFilament</p>
        <h1>{m.shop.hubTitle}</h1>
        <p className="home-lead">{m.shop.hubLead}</p>
      </section>
      <div className="shop-hub-grid">
        {cards.map((card) => (
          <Link className="shop-hub-card" href={localizedPath(locale, card.href)} key={card.href}>
            <span>{card.title}</span>
            <p>{card.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
