import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { getLegalConfig, legalHasPlaceholders } from "@/lib/legal/config";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.legalPages.privacyTitle,
    description: "How OpenFilament processes personal data.",
    path: "/privacy",
    noIndex: false,
  });
}

export default async function PrivacyPage() {
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

      <h2>Who operates OpenFilament</h2>
      <p>
        Operator: <strong>{legal.ownerName}</strong>
        <br />
        Privacy contact: <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>
        <br />
        Hosting: {legal.hostingProvider} ({legal.hostingRegion})
      </p>

      <h2>What we process</h2>
      <ul>
        <li>Account data (email, username, display name, password hash) when you register.</li>
        <li>Authentication sessions (hashed API tokens).</li>
        <li>Cloud My Spools and related private notes when you sync.</li>
        <li>Local My Spools stored only in your browser IndexedDB until you sync.</li>
        <li>Public community contributions (profiles/calibrations) you choose to publish.</li>
        <li>QR / RFID identifiers you attach to spools.</li>
        <li>Consent preferences (categories, version, timestamp, locale).</li>
        <li>Server and security logs (see retention policy).</li>
        <li>Optional Google Analytics 4 after analytics consent only.</li>
      </ul>

      <h2>Legal bases</h2>
      <ul>
        <li>Contract / requested service — accounts, cloud My Spools, exports.</li>
        <li>Legitimate interests — security, abuse prevention, service integrity.</li>
        <li>Consent — analytics cookies/storage; withdraw anytime via Cookie settings.</li>
        <li>Legal obligation — where applicable for security incident records.</li>
      </ul>

      <h2>Local-only My Spools</h2>
      <p>
        Local My Spools stay on your device. Clearing site data, losing the device, or
        switching browsers can remove them. We do not upload local spools when you merely
        sign in.
      </p>

      <h2>Cloud My Spools</h2>
      <p>
        Optional sync requires an account and an explicit confirmation step. Ownership
        checks apply to every read and write. Private notes, storage locations and
        identities are not exposed via public QR resolution.
      </p>

      <h2>Your rights</h2>
      <p>
        You may request access, correction, deletion, restriction, portability and
        objection, and withdraw consent. Use Account → Export / Delete, Cookie settings,
        or email {legal.privacyEmail}. You may complain to {legal.supervisoryAuthority}
        ({legal.supervisoryAuthorityUrl}).
      </p>

      <h2>International transfers</h2>
      <p>
        If analytics is enabled, Google may process data outside the EEA under its own
        terms and safeguards. Hosting region: {legal.hostingRegion}. Exact processor
        agreements must be confirmed by the operator — see docs/SUBPROCESSORS.md.
      </p>

      <h2>Retention</h2>
      <p>
        See docs/DATA_RETENTION.md. Soft-deleted spools are purged on a schedule.
        Backups may retain deleted data until backup expiry — not instantaneous.
      </p>

      <h2>Policy changes</h2>
      <p>
        Material changes update the consent version and may re-prompt for consent.
      </p>
    </article>
  );
}
