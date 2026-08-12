import Link from "next/link";
import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { getLocaleMessages } from "@/lib/messages";
import {
  absoluteUrl,
  buildPageMetadata,
  jsonLdScript,
} from "@/lib/seo/metadata";

type Manufacturer = {
  uuid: string;
  name: string;
  website: string | null;
  country: string | null;
  description: string | null;
  isSyntheticFixture: boolean;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  const { uuid } = await params;
  try {
    const mfr = await apiGet<Manufacturer>(`/api/v1/manufacturers/${uuid}`);
    return buildPageMetadata({
      title: mfr.name,
      description: (
        mfr.description?.trim() ||
        `${mfr.name} filament brand on OpenFilament`
      ).slice(0, 160),
      path: `/manufacturers/${uuid}`,
      noIndex: mfr.isSyntheticFixture,
    });
  } catch {
    return buildPageMetadata({
      title: "Manufacturer",
      description: "OpenFilament brand page",
      path: `/manufacturers/${uuid}`,
      noIndex: true,
    });
  }
}

export default async function ManufacturerPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { messages } = await getLocaleMessages();
  const sp = messages.specs;
  const { uuid } = await params;
  const mfr = await apiGet<Manufacturer>(`/api/v1/manufacturers/${uuid}`);
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: mfr.name,
    url: absoluteUrl(`/manufacturers/${uuid}`),
    ...(mfr.website ? { sameAs: [mfr.website] } : {}),
  };
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={jsonLdScript(orgLd)}
      />
      <h1>{mfr.name}</h1>
      {mfr.isSyntheticFixture ? (
        <div className="banner-warn">{messages.variant.syntheticBanner}</div>
      ) : null}
      <dl className="kv">
        <dt>{sp.country}</dt>
        <dd>{mfr.country ?? "—"}</dd>
        <dt>{sp.website}</dt>
        <dd>
          {mfr.website ? (
            <a href={mfr.website} rel="noreferrer" target="_blank">
              {mfr.website}
            </a>
          ) : (
            "—"
          )}
        </dd>
      </dl>
      {mfr.description ? <p>{mfr.description}</p> : null}
      <p>
        <Link href="/">{messages.common.backHome}</Link>
      </p>
    </div>
  );
}
