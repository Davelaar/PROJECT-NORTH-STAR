import type { Metadata } from "next";
import Link from "next/link";
import { getLocaleMessages } from "@/lib/messages";
import { getLegalConfig } from "@/lib/legal/config";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.support.title,
    description: m.support.metaDescription,
    path: "/support",
  });
}

export default async function SupportPage() {
  const { messages: m } = await getLocaleMessages();
  const legal = getLegalConfig();
  const s = m.support;

  return (
    <article className="prose support-page">
      <h1>{s.title}</h1>
      <p>{s.lead}</p>

      <section aria-labelledby="support-product">
        <h2 id="support-product">{s.productHeading}</h2>
        <p>{s.productBody}</p>
        <ul>
          {s.productItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="support-myspools">
        <h2 id="support-myspools">{s.mySpoolsHeading}</h2>
        <h3>{s.mySpoolsLocalTitle}</h3>
        <p>{s.mySpoolsLocalBody}</p>
        <h3>{s.mySpoolsCloudTitle}</h3>
        <p>{s.mySpoolsCloudBody}</p>
        <ul>
          {s.mySpoolsDiffItems.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p className="banner-warn" role="note">
          {s.betaNote}
        </p>
        <p>
          <Link href="/my-spools">{m.footer.mySpools}</Link>
          {" · "}
          <Link href="/my-spools/cloud">{m.cloud.navLink}</Link>
        </p>
      </section>

      <section aria-labelledby="support-contact">
        <h2 id="support-contact">{s.contactHeading}</h2>
        <p>{s.contactBody}</p>
        <p>
          <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>
          {" · "}
        <Link href="/privacy-policy">{m.footer.privacy}</Link>
        {" · "}
        <Link href="/terms-of-service">{m.footer.terms}</Link>
        {" · "}
        <Link href="/register">{m.account.register}</Link>
        </p>
      </section>
    </article>
  );
}
