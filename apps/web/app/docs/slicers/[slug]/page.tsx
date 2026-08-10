import Link from "next/link";
import { notFound } from "next/navigation";
import { getSlicerEntry } from "@open-filament/domain";
import { getLocaleMessages } from "@/lib/messages";
import { getSlicerGuides, type GuideBlock } from "@/lib/slicer-guides";

const SLUGS = [
  "creality-print",
  "orcaslicer",
  "prusaslicer",
  "bambu-studio",
] as const;

type Slug = (typeof SLUGS)[number];

function renderBlocks(blocks: GuideBlock[]) {
  return blocks.map((b, i) => {
    if (b.type === "p") return <p key={i}>{b.text}</p>;
    if (b.type === "note")
      return (
        <p key={i} className="banner-warn">
          {b.text}
        </p>
      );
    if (b.type === "code")
      return (
        <pre key={i} className="wrap-pre">
          {b.text}
        </pre>
      );
    if (b.type === "ol")
      return (
        <ol key={i}>
          {b.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
      );
    return (
      <ul key={i}>
        {b.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  });
}

export function generateStaticParams() {
  return SLUGS.map((slug) => ({ slug }));
}

export default async function SlicerGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!SLUGS.includes(slug as Slug)) notFound();
  const entry = getSlicerEntry(slug);
  if (!entry || !entry.docsPath) notFound();

  const { locale, messages } = await getLocaleMessages();
  const bundle = await getSlicerGuides(locale);
  const guide = bundle.guides[slug as Slug];

  return (
    <div className="stack docs-slicer-guide">
      <p className="muted">
        <Link href="/docs/slicers">{bundle.overview.heading}</Link>
      </p>
      <h1>{guide.title}</h1>
      <p>{guide.lead}</p>
      <p>
        <span className={`badge badge-status-${entry.status}`}>
          {bundle.status[entry.status]}
        </span>{" "}
        <span className="muted">{entry.supportedVersions.join(", ")}</span>
        {" · "}
        <code className="wrap-code">{entry.extension}</code>
      </p>
      <p>
        <Link className="button" href={`/export?format=${entry.id}`}>
          {messages.export.downloadForSlicer} — {entry.name}
        </Link>
      </p>

      {guide.sections.map((section) => (
        <section key={section.id} className="home-section" id={section.id}>
          <h2>{section.heading}</h2>
          {renderBlocks(section.blocks)}
        </section>
      ))}

      <p className="muted">
        {entry.officialDocsUrl ? (
          <>
            <a href={entry.officialDocsUrl} target="_blank" rel="noreferrer">
              {bundle.overview.officialSite}
            </a>
            {" · "}
          </>
        ) : null}
        <Link href="/docs/slicers">{bundle.overview.heading}</Link>
      </p>
    </div>
  );
}
