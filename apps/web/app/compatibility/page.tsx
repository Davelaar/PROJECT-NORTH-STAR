import Link from "next/link";
import { USAGE_COMPATIBILITY_REGISTRY } from "@open-filament/domain";
import { getLocaleMessages } from "@/lib/messages";
import { getUsageTrackingCopy } from "@/lib/usage-tracking-copy";
import { CompatibilityChecker } from "./compatibility-checker";

export default async function CompatibilityPage() {
  const { locale } = await getLocaleMessages();
  const t = getUsageTrackingCopy(locale);

  return (
    <div className="stack docs-slicers">
      <h1>{t.checker.title}</h1>
      <p>{t.checker.lead}</p>
      <p className="banner-warn">{t.centralRule}</p>
      <CompatibilityChecker
        entries={[...USAGE_COMPATIBILITY_REGISTRY]}
        copy={t}
      />
      <h2>{t.compareTitle}</h2>
      <div className="table-scroll" role="region" aria-label={t.compareTitle}>
        <table className="compat-table">
          <thead>
            <tr>
              <th scope="col">{t.product}</th>
              <th scope="col">{t.estimate}</th>
              <th scope="col">{t.completion}</th>
              <th scope="col">{t.failure}</th>
              <th scope="col">{t.status}</th>
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
                <td>{t.statusLabels[entry.status]}</td>
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
