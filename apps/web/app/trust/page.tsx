import type { Metadata } from "next";
import Link from "next/link";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { GITHUB_REPO_URL } from "@/lib/github";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.legalPages.trustTitle,
    description: "Privacy, security and transparency links for OpenFilament.",
    path: "/trust",
  });
}

export default async function TrustPage() {
  const { messages: m } = await getLocaleMessages();
  const links = [
    { href: "/privacy", label: m.footer.privacy },
    { href: "/cookies", label: m.footer.cookies },
    { href: "/terms", label: m.footer.terms },
    { href: "/security", label: m.footer.security },
    { href: "/account", label: m.account.exportData },
    { href: "/account", label: m.account.deleteAccount },
    { href: "/docs/slicers", label: m.export.supportedSlicersLink },
    { href: "/docs/api", label: m.nav.docsApi },
    { href: GITHUB_REPO_URL, label: m.legalPages.openSourceRepository, external: true },
  ];
  return (
    <article className="prose">
      <h1>{m.legalPages.trustTitle}</h1>
      <ul>
        {links.map((l) => (
          <li key={l.href + l.label}>
            {l.external ? (
              <a href={l.href} rel="noopener noreferrer">
                {l.label}
              </a>
            ) : (
              <Link href={l.href}>{l.label}</Link>
            )}
          </li>
        ))}
      </ul>
      <p>
        <button type="button" className="btn btn-secondary" disabled>
          {m.footer.cookieSettings} ({m.legalPages.cookieSettingsHint})
        </button>
      </p>
    </article>
  );
}
