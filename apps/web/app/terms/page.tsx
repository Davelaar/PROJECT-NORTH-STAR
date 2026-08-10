import type { Metadata } from "next";
import Link from "next/link";
import { getLocaleMessages } from "@/lib/messages";
import { getLegalConfig, legalHasPlaceholders } from "@/lib/legal/config";
import { buildPageMetadata } from "@/lib/seo/metadata";

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
        Operator: {legal.ownerName}. Effective: {legal.effectiveDate}.
      </p>
      <h2>Community platform</h2>
      <p>
        OpenFilament provides an open catalog, identification tools and community
        calibrations. Profiles are community or catalog-derived; they are not a print-safety
        guarantee. You remain responsible for validating settings on your printer.
      </p>
      <h2>Accounts and My Spools</h2>
      <p>
        Accounts are optional for browsing and downloads. Cloud My Spools require an
        account. Abuse, scraping that harms the service, or attempts to access other users’
        private data are prohibited.
      </p>
      <h2>Contributions</h2>
      <p>
        By submitting calibrations you accept the contribution terms shown at submit time
        and license the contribution for public display under the project’s open terms.
        Contributor emails stay private.
      </p>
      <h2>Availability and liability</h2>
      <p>
        The service is provided as-is without warranty of uninterrupted availability.
        To the extent permitted by law, liability is limited for free community tooling.
      </p>
      <h2>Contact</h2>
      <p>
        <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a> ·{" "}
        <Link href="/privacy">Privacy</Link> · <Link href="/security">Security</Link>
      </p>
    </article>
  );
}
