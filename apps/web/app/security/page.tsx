import type { Metadata } from "next";
import Link from "next/link";
import { getLocaleMessages } from "@/lib/messages";
import { getLegalConfig, legalHasPlaceholders } from "@/lib/legal/config";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { GITHUB_REPO_URL } from "@/lib/github";

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
      <h2>What we protect</h2>
      <ul>
        <li>Account credentials (scrypt password hashes; never plaintext).</li>
        <li>Session tokens hashed at rest.</li>
        <li>Private My Spools with server-side ownership checks.</li>
        <li>Public QR projections that omit notes, locations and account identifiers.</li>
      </ul>
      <h2>Responsible disclosure</h2>
      <p>
        Report vulnerabilities privately to{" "}
        <a href={`mailto:${legal.securityEmail}`}>{legal.securityEmail}</a>. Do not publicly
        disclose secrets, exploits against live users, or production credentials. Allow a
        reasonable time for remediation before public discussion.
      </p>
      <h2>Open source</h2>
      <p>
        Source: <a href={GITHUB_REPO_URL}>{GITHUB_REPO_URL}</a>
      </p>
      <p>
        <Link href="/trust">Trust center</Link> · <Link href="/privacy">Privacy</Link>
      </p>
    </article>
  );
}
