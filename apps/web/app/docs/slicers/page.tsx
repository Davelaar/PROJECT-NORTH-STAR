import Link from "next/link";
import {
  SLICER_REGISTRY,
  listInterchangeFormats,
  listSlicerPresets,
} from "@open-filament/domain";
import { getLocaleMessages } from "@/lib/messages";
import { getSlicerGuides } from "@/lib/slicer-guides";

export default async function SlicersOverviewPage() {
  const { locale, messages } = await getLocaleMessages();
  const g = await getSlicerGuides(locale);
  const slicers = listSlicerPresets();
  const interchange = listInterchangeFormats();

  return (
    <div className="stack docs-slicers">
      <h1>{g.overview.heading}</h1>
      <p>{g.overview.lead}</p>

      <section className="panel" aria-labelledby="identity-heading">
        <h2 id="identity-heading">{g.overview.identityHeading}</h2>
        <p>{g.overview.identityBody}</p>
      </section>

      <section className="panel" aria-labelledby="load-profiles-heading">
        <h2 id="load-profiles-heading">{messages.export.loadProfilesTitle}</h2>
        <p>{messages.export.loadProfilesIntro}</p>
        <ol>
          <li>
            {messages.export.readyStepOpen.replace(
              "{name}",
              "Creality Print / OrcaSlicer / PrusaSlicer / Bambu Studio",
            )}
          </li>
          <li>{messages.export.readyStepImport}</li>
          <li>{messages.export.readyStepPrinter}</li>
          <li>{messages.export.readyStepSelect}</li>
          <li>{messages.export.readyStepMap}</li>
        </ol>
      </section>

      <div className="slicer-cards">
        {slicers.map((s) => (
          <article key={s.id} className="slicer-card panel">
            <h2>{s.name}</h2>
            <p>
              <span className={`badge badge-status-${s.status}`}>
                {g.status[s.status]}
              </span>{" "}
              <span className="muted">{s.supportedVersions.join(", ")}</span>
            </p>
            <p>
              {s.exportFormat} · <code>{s.extension}</code>
            </p>
            <p className="home-cta-links">
              {s.docsPath ? (
                <Link className="button" href={s.docsPath}>
                  {g.overview.viewInstructions} — {s.name}
                </Link>
              ) : null}
              {s.officialUrl ? (
                <a
                  className="button secondary"
                  href={s.officialUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {g.overview.officialSite}
                </a>
              ) : null}
            </p>
          </article>
        ))}
        {interchange.map((s) => (
          <article key={s.id} className="slicer-card panel">
            <h2>{g.overview.interchangeTitle}</h2>
            <p>
              <span className={`badge badge-status-${s.status}`}>
                {g.status[s.status]}
              </span>
            </p>
            <p>{g.overview.interchangeBody}</p>
            <p>
              <code>{s.extension}</code> · {s.exportFormat}
            </p>
          </article>
        ))}
      </div>

      <h2>{g.overview.tableCaption}</h2>
      <div className="table-scroll" role="region" aria-label={g.overview.tableCaption}>
        <table className="compat-table">
          <thead>
            <tr>
              <th scope="col">{g.overview.colSlicer}</th>
              <th scope="col">{g.overview.colStatus}</th>
              <th scope="col">{g.overview.colFilament}</th>
              <th scope="col">{g.overview.colPrinter}</th>
              <th scope="col">{g.overview.colProcess}</th>
              <th scope="col">{g.overview.colInstructions}</th>
            </tr>
          </thead>
          <tbody>
            {SLICER_REGISTRY.filter((e) => e.group === "slicer").map((s) => (
              <tr key={s.id}>
                <th scope="row">{s.name}</th>
                <td>{g.status[s.status]}</td>
                <td>{s.includes.filament ? g.overview.yes : g.overview.no}</td>
                <td>{s.includes.printer ? g.overview.yes : g.overview.no}</td>
                <td>{s.includes.process ? g.overview.yes : g.overview.no}</td>
                <td>
                  {s.docsPath ? (
                    <Link href={s.docsPath}>
                      {g.overview.viewInstructions} — {s.name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted">
        <Link href="/export">{messages.export.heading}</Link>
        {" · "}
        <Link href="/docs/api">API</Link>
      </p>
    </div>
  );
}
