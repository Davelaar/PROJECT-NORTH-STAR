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
      {section.paragraphs?.map((p) => <p key={p}>{p}</p>)}
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
    description: "Terms of use for the OpenFilament community platform.",
    path: "/terms",
  });
}

export default async function TermsPage() {
  const { messages: m } = await getLocaleMessages();
  const legal = getLegalConfig();
  return (
    <article className="prose legal-page">
      <h1>{m.legalPages.termsTitle}</h1>
      {legalHasPlaceholders() ? (
        <p className="legal-placeholder-warn">{m.legalPages.placeholderNotice}</p>
      ) : null}
      <p>
        {m.legalPages.operator}: {legal.ownerName}. {m.legalPages.effective}:{" "}
        {legal.effectiveDate}.
      </p>
      <LegalSections sections={m.legalPages.sections.terms} />
      <h2>{m.legalPages.contact}</h2>
      <p>
        <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a> ·{" "}
        <Link href="/privacy">Privacy</Link> · <Link href="/security">Security</Link>
      </p>
    </article>
  );
}
