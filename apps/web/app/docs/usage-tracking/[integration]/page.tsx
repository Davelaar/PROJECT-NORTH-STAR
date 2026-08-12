import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  USAGE_COMPATIBILITY_REGISTRY,
  usageCompatibilityById,
} from "@open-filament/domain";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { getUsageTrackingCopy } from "@/lib/usage-tracking-copy";

export function generateStaticParams() {
  return USAGE_COMPATIBILITY_REGISTRY.map((entry) => ({ integration: entry.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ integration: string }>;
}): Promise<Metadata> {
  const { integration } = await params;
  const entry = usageCompatibilityById(integration);
  const { locale } = await getLocaleMessages();
  const t = getUsageTrackingCopy(locale);
  if (!entry) {
    return buildPageMetadata({
      title: t.title,
      description: t.lead,
      path: `/docs/usage-tracking/${integration}`,
      noIndex: true,
    });
  }
  return buildPageMetadata({
    title: `${t.title}: ${entry.product}`,
    description: t.centralRule,
    path: `/docs/usage-tracking/${integration}`,
  });
}

export default async function UsageTrackingIntegrationPage({
  params,
}: {
  params: Promise<{ integration: string }>;
}) {
  const { integration } = await params;
  const entry = usageCompatibilityById(integration);
  if (!entry) notFound();
  const { locale } = await getLocaleMessages();
  const t = getUsageTrackingCopy(locale);

  return (
    <div className="stack docs-slicer-guide">
      <p className="muted">
        <Link href="/docs/usage-tracking">{t.title}</Link>
      </p>
      <h1>
        {t.title}: {entry.product}
      </h1>
      <p className="banner-warn">{t.centralRule}</p>

      <section className="home-section">
        <h2>{t.compareTitle}</h2>
        <dl>
          <dt>{t.estimate}</dt>
          <dd>{t.statusLabels[entry.estimateSupport]}</dd>
          <dt>{t.completion}</dt>
          <dd>{t.statusLabels[entry.completionStatusSupport]}</dd>
          <dt>{t.failure}</dt>
          <dd>{t.statusLabels[entry.partialFailureSupport]}</dd>
          <dt>{t.multiMaterial}</dt>
          <dd>{t.statusLabels[entry.multiMaterialSupport]}</dd>
          <dt>{t.method}</dt>
          <dd>{entry.integrationMethod}</dd>
          <dt>{t.hardware}</dt>
          <dd>{entry.hardwareTested ? t.yes : t.no}</dd>
        </dl>
      </section>

      <section className="home-section">
        <h2>{t.limitations}</h2>
        <ul>
          {entry.limitations.map((limitation) => (
            <li key={limitation}>{limitation}</li>
          ))}
        </ul>
      </section>

      <section className="home-section">
        <h2>{t.evidence}</h2>
        <ul>
          {entry.evidence.map((url) => (
            <li key={url}>
              <a href={url} target="_blank" rel="noreferrer">
                {url}
              </a>
            </li>
          ))}
        </ul>
        <p className="muted">Access date: {entry.lastVerified}</p>
      </section>
    </div>
  );
}
