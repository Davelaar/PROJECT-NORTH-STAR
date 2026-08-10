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

  const rows = [
    {
      name: "of_locale",
      provider: "OpenFilament",
      purpose: "Language preference",
      category: "Necessary",
      retention: "1 year",
      party: "First-party",
      consent: "No",
    },
    {
      name: "of_consent",
      provider: "OpenFilament",
      purpose: "Remember cookie choices",
      category: "Necessary",
      retention: "13 months",
      party: "First-party",
      consent: "No",
    },
    {
      name: "of_consent_v1 (localStorage)",
      provider: "OpenFilament",
      purpose: "Consent record mirror",
      category: "Necessary",
      retention: "Until cleared",
      party: "First-party",
      consent: "No",
    },
    {
      name: "of_auth (localStorage)",
      provider: "OpenFilament",
      purpose: "Authenticated session token for requested account features",
      category: "Necessary",
      retention: "Until sign-out / revoke",
      party: "First-party",
      consent: "No (functional)",
    },
    {
      name: "IndexedDB openfilament-spools",
      provider: "OpenFilament",
      purpose: "Local My Spools inventory",
      category: "Necessary",
      retention: "Until user clears",
      party: "First-party",
      consent: "No (explicit feature use)",
    },
    {
      name: "Cache Storage (service worker)",
      provider: "OpenFilament",
      purpose: "Offline shell / PWA",
      category: "Necessary",
      retention: "Until update / clear",
      party: "First-party",
      consent: "No",
    },
    {
      name: "_ga / _ga_*",
      provider: "Google Analytics",
      purpose: "Analytics after consent",
      category: "Analytics",
      retention: "Up to 14 months (GA config)",
      party: "Third-party",
      consent: "Yes",
    },
  ];

  return (
    <article className="prose legal-page">
      <h1>{m.legalPages.cookiesTitle}</h1>
      {legalHasPlaceholders() ? (
        <p className="legal-placeholder-warn">{m.legalPages.placeholderNotice}</p>
      ) : null}
      <p>
        Consent model version: <code>{CONSENT_VERSION}</code>. IndexedDB and localStorage
        are browser storage technologies (not classic cookies) listed for transparency.
      </p>
      <p>
        Operator: {legal.ownerName}. Contact:{" "}
        <a href={`mailto:${legal.privacyEmail}`}>{legal.privacyEmail}</a>
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Provider</th>
              <th>Purpose</th>
              <th>Category</th>
              <th>Retention</th>
              <th>Party</th>
              <th>Consent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name}>
                <td>
                  <code>{r.name}</code>
                </td>
                <td>{r.provider}</td>
                <td>{r.purpose}</td>
                <td>{r.category}</td>
                <td>{r.retention}</td>
                <td>{r.party}</td>
                <td>{r.consent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Marketing storage is not used. Rejecting analytics does not disable search, My
        Spools, accounts, QR, RFID or downloads.
      </p>
    </article>
  );
}
