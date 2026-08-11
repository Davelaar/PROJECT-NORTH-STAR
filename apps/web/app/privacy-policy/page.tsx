import type { Metadata } from "next";
import Link from "next/link";
import { CookieSettingsButton } from "@/app/components/cookie-settings-button";
import { getLocaleMessages } from "@/lib/messages";
import { CONSENT_VERSION, getLegalConfig, legalHasPlaceholders } from "@/lib/legal/config";
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
    title: m.legalPages.privacyTitle,
    description: m.legalPages.privacyMetaDescription,
    path: "/privacy-policy",
    noIndex: false,
  });
}

export default async function PrivacyPolicyPage() {
  const { messages: m } = await getLocaleMessages();
  const legal = getLegalConfig();
  const placeholders = legalHasPlaceholders();

  return (
    <article className="prose legal-page">
      <h1>{m.legalPages.privacyTitle}</h1>
      {placeholders ? (
        <p className="legal-placeholder-warn" role="status">
          {m.legalPages.placeholderNotice}
        </p>
      ) : null}
      <p>
        {m.legalPages.effective}: {legal.effectiveDate}
      </p>

      <h2>{m.legalPages.operator}</h2>
      <p>
        {m.legalPages.operator}: <strong>{legal.ownerName}</strong>
        <br />
        {m.legalPages.privacyContact}:{" "}
        <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>
        <br />
        {m.legalPages.hosting}: {legal.hostingProvider} ({legal.hostingRegion})
      </p>

      <LegalSections sections={m.legalPages.sections.privacy} />

      <section>
        <h2>{m.legalPages.cookiesTitle}</h2>
        <p>
          {m.legalPages.cookieSettingsHint}{" "}
          <code>{CONSENT_VERSION}</code>
        </p>
        <LegalSections sections={m.legalPages.sections.cookies} />
        <p className="muted">
          <code>of_locale</code>, <code>of_consent</code>, <code>of_session</code>,{" "}
          <code>of_csrf</code>, IndexedDB (<code>openfilament-spools</code>), Cache
          Storage / service worker, optional <code>_ga</code> after analytics consent.
        </p>
        <p>
          <CookieSettingsButton label={m.footer.cookieSettings} />
        </p>
        <p>
          <Link href="/cookies">{m.legalPages.cookiesTitle}</Link>
          {" · "}
          <Link href="/support">{m.footer.support}</Link>
        </p>
      </section>
    </article>
  );
}
