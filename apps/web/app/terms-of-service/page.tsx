import type { Metadata } from "next";
import Link from "next/link";
import { getLocaleMessages } from "@/lib/messages";
import { getLegalConfig, legalHasPlaceholders } from "@/lib/legal/config";
import { buildPageMetadata } from "@/lib/seo/metadata";

function LegalSections({
  sections,
}: {
  sections: Array<{ heading: string; paragraphs?: string[]; items?: string[] }>;
}) {
  return sections.map((section) => (
    <section key={section.heading}>
      <h2>{section.heading}</h2>
      {section.paragraphs?.map((p) => (
        <p key={p}>{p}</p>
      ))}
      {section.items ? (
        <ul>
          {section.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </section>
  ));
}

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.legalPages.termsTitle,
    description: m.legalPages.termsMetaDescription,
    path: "/terms-of-service",
  });
}

export default async function TermsOfServicePage() {
  const { messages: m } = await getLocaleMessages();
  const legal = getLegalConfig();

  return (
    <article className="prose legal-page">
      <h1>{m.legalPages.termsTitle}</h1>
      {legalHasPlaceholders() ? (
        <p className="legal-placeholder-warn" role="status">
          {m.legalPages.placeholderNotice}
        </p>
      ) : null}
      <p>
        {m.legalPages.effective}: {legal.effectiveDate}
      </p>
      <p>
        {m.legalPages.operator}: <strong>{legal.ownerName}</strong>
        <br />
        {m.legalPages.contact}:{" "}
        <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>
      </p>

      <LegalSections sections={m.legalPages.sections.terms} />

      <p>
        <Link href="/privacy-policy">{m.footer.privacy}</Link>
        {" · "}
        <Link href="/support">{m.footer.support}</Link>
        {" · "}
        <Link href="/my-spools/cloud">{m.cloud.navLink}</Link>
      </p>
    </article>
  );
}
