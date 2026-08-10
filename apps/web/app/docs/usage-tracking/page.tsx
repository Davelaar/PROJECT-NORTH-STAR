import Link from "next/link";
import { USAGE_COMPATIBILITY_REGISTRY } from "@open-filament/domain";
import { getLocaleMessages } from "@/lib/messages";
import { getUsageTrackingCopy } from "@/lib/usage-tracking-copy";

export default async function UsageTrackingDocsPage() {
  const { locale } = await getLocaleMessages();
  const t = getUsageTrackingCopy(locale);

  return (
    <div className="stack docs-slicers">
      <h1>{t.title}</h1>
      <p>{t.lead}</p>
      <p className="banner-warn">{t.centralRule}</p>

      <section className="panel">
        <h2>{t.beforePrint}</h2>
        <p>{t.afterSuccess}</p>
        <p>{t.afterFailure}</p>
        <p>{t.manualWorkflow}</p>
      </section>

      <section className="panel">
        <h2>{t.cloudDisclosureTitle}</h2>
        <ul>
          {t.cloudDisclosures.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          <Link className="button" href="/compatibility">
            {t.checkSetup}
          </Link>
        </p>
      </section>

      <h2>{t.compareTitle}</h2>
      <div className="table-scroll" role="region" aria-label={t.compareTitle}>
        <table className="compat-table">
          <thead>
            <tr>
              <th scope="col">{t.product}</th>
              <th scope="col">{t.estimate}</th>
              <th scope="col">{t.completion}</th>
              <th scope="col">{t.failure}</th>
              <th scope="col">{t.multiMaterial}</th>
              <th scope="col">{t.docsTitle}</th>
            </tr>
          </thead>
          <tbody>
            {USAGE_COMPATIBILITY_REGISTRY.map((entry) => (
              <tr key={entry.id}>
                <th scope="row">{entry.product}</th>
                <td>{t.statusLabels[entry.estimateSupport]}</td>
                <td>{t.statusLabels[entry.completionStatusSupport]}</td>
                <td>{t.statusLabels[entry.partialFailureSupport]}</td>
                <td>{t.statusLabels[entry.multiMaterialSupport]}</td>
                <td>
                  <Link href={`/docs/usage-tracking/${entry.id}`}>
                    {entry.product}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
