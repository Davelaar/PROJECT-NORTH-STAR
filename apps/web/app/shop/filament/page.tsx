import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { fetchShopProducts } from "../data";
import { ShopGrid } from "../shop-grid";

const joybuyInviteUrl =
  "https://www.joybuy.nl/?utm_source=invite&utm_medium=share_gift&ext_activityId=98dd043e6e0146b88eb99b676ef28246&ext_inviterPin=hr1uwlcg9pykonlcvdo20&siteId=1300&siteCode=NL-Site&inviteCode=KYSQ81&ext_inviteCode=KYSQ81";
const joybuySearchUrl =
  "https://www.joybuy.nl/s?k=3D-printen&l1=1891&l2=null&l3=4326&fromTrending=true";

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
      <section className="shop-deal-callout">
        <p className="muted">{m.shop.partnerLink}</p>
        <h2>{m.shop.joybuyTitle}</h2>
        <p>{m.shop.joybuyBody}</p>
        <div className="home-cta-links">
          <a
            className="button"
            href={joybuyInviteUrl}
            rel="nofollow sponsored noopener"
            target="_blank"
          >
            {m.shop.joybuyInviteCta}
          </a>
          <a
            className="button secondary"
            href={joybuySearchUrl}
            rel="nofollow sponsored noopener"
            target="_blank"
          >
            {m.shop.joybuySearchCta}
          </a>
        </div>
      </section>
      <ShopGrid products={products} messages={m.shop} mode="referral" />
    </div>
  );
}
