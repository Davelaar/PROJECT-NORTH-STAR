import Link from "next/link";
import type { Metadata } from "next";
import {
  GITHUB_ISSUES_URL,
  GITHUB_NEW_ISSUE_URL,
  GITHUB_REPO_URL,
} from "@/lib/github";
import { CONTACT_EMAIL, samplesMailto } from "@/lib/contact";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.contribute.heading,
    description: m.contribute.lead,
    path: "/contribute",
  });
}

export default async function ContributePage() {
  const { messages: m } = await getLocaleMessages();
  const c = m.contribute;

  return (
    <div className="stack">
      <h1>{c.heading}</h1>
      <p className="home-lead">{c.lead}</p>
      <p>{c.openSource}</p>
      <p className="muted">{c.noAccount}</p>

      <div className="home-cta-links">
        <a className="button" href={GITHUB_REPO_URL} target="_blank" rel="noreferrer">
          {c.repoButton}
        </a>
        <a
          className="button secondary"
          href={GITHUB_NEW_ISSUE_URL}
          target="_blank"
          rel="noreferrer"
        >
          {c.issuesButton}
        </a>
        <a
          className="button secondary"
          href={`${GITHUB_REPO_URL}/blob/main/docs/CONTRIBUTING.md`}
          target="_blank"
          rel="noreferrer"
        >
          {c.docsButton}
        </a>
        <Link className="button secondary" href="/submit">
          {m.nav.submit}
        </Link>
      </div>

      <section className="panel stack">
        <h2>{c.brandsHeading}</h2>
        <p>{c.brandsLead}</p>

        <h3>{c.labPrintersHeading}</h3>
        <p>{c.labPrintersIntro}</p>
        <ul className="home-steps">
          <li>{c.labPrinterK2}</li>
          <li>{c.labPrinterEnder3}</li>
          <li>{c.labPrinterAd5x}</li>
        </ul>
        <p>
          <strong>{c.filamentCompatibility}</strong>
        </p>

        <h3>{c.filamentHeading}</h3>
        <p>{c.filamentBody}</p>

        <h3>{c.printerHeading}</h3>
        <p>{c.printerBody}</p>
        <p>
          <strong>{c.returnPolicy}</strong>
        </p>

        <p className="muted">{c.youtubeNote}</p>
        <p className="muted">{c.shippingNote}</p>

        <div className="home-cta-links">
          <a className="button" href={samplesMailto(c.contactSubject)}>
            {c.contactCta}
          </a>
        </div>
        <p className="muted">
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      </section>

      <section className="panel stack">
        <h2>{c.howHeading}</h2>
        <ol className="home-steps">
          <li>{c.howFork}</li>
          <li>{c.howChange}</li>
          <li>{c.howPr}</li>
          <li>{c.howIssue}</li>
        </ol>
        <p className="muted">
          <a href={GITHUB_ISSUES_URL} target="_blank" rel="noreferrer">
            {GITHUB_ISSUES_URL}
          </a>
        </p>
      </section>

      <p>
        <Link href="/">{m.common.backHome}</Link>
      </p>
    </div>
  );
}
