import type { Metadata } from "next";
import Link from "next/link";
import { getLocaleMessages } from "@/lib/messages";
import { getLegalConfig, legalHasPlaceholders } from "@/lib/legal/config";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { GITHUB_REPO_URL } from "@/lib/github";

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
    title: m.legalPages.securityTitle,
    description: "Security practices and responsible disclosure for OpenFilament.",
    path: "/security",
  });
}

export default async function SecurityPage() {
  const { messages: m } = await getLocaleMessages();
  const legal = getLegalConfig();
  return (
    <article className="prose legal-page">
      <h1>{m.legalPages.securityTitle}</h1>
      {legalHasPlaceholders() ? (
        <p className="legal-placeholder-warn">{m.legalPages.placeholderNotice}</p>
      ) : null}
      <LegalSections sections={m.legalPages.sections.security} />
      <p>
        <a href={`mailto:${legal.securityEmail}`}>{legal.securityEmail}</a>
      </p>
      <h2>{m.legalPages.openSourceRepository}</h2>
      <p>
        Source: <a href={GITHUB_REPO_URL}>{GITHUB_REPO_URL}</a>
      </p>
      <p>
        <Link href="/trust">Trust center</Link> · <Link href="/privacy-policy">Privacy</Link>
      </p>
    </article>
  );
}
