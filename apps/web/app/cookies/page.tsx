import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { CONSENT_VERSION, getLegalConfig, legalHasPlaceholders } from "@/lib/legal/config";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.legalPages.cookiesTitle,
    description: "Cookies and browser storage used by OpenFilament.",
    path: "/cookies",
  });
}

export default async function CookiesPage() {
  const { messages: m } = await getLocaleMessages();
  const legal = getLegalConfig();

  return (
    <article className="prose legal-page">
      <h1>{m.legalPages.cookiesTitle}</h1>
      {legalHasPlaceholders() ? (
        <p className="legal-placeholder-warn">{m.legalPages.placeholderNotice}</p>
      ) : null}
      <p>
        <code>{CONSENT_VERSION}</code>
      </p>
      <p>
        {m.legalPages.operator}: {legal.ownerName}. {m.legalPages.contact}:{" "}
        <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>
      </p>
      {m.legalPages.sections.cookies.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((p) => <p key={p}>{p}</p>)}
        </section>
      ))}
      <p>
        <code>of_locale</code>, <code>of_consent</code>, <code>of_session</code>,{" "}
        <code>of_csrf</code>, <code>openfilament-spools</code>,{" "}
        <code>Cache Storage</code>, <code>_ga</code>
      </p>
    </article>
  );
}
