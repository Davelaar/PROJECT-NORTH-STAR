import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getLocaleMessages } from "@/lib/messages";

type Profile = {
  uuid: string;
  title: string;
  currentRevision: {
    nozzleTempOtherLayersC: number | null;
    bedTempOtherLayersC: number | null;
    flowRatio: number | null;
    pressureAdvance: number | null;
    maxVolumetricFlowMm3s: number | null;
  } | null;
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { messages } = await getLocaleMessages();
  const sp = messages.specs;
  const { ids = "" } = await searchParams;
  const list = ids.split(",").map((s) => s.trim()).filter(Boolean);
  if (list.length < 2) {
    return (
      <div>
        <h1>{messages.compare.heading}</h1>
        <p className="muted">{messages.compare.needIds}</p>
      </div>
    );
  }

  const profiles = await Promise.all(
    list.slice(0, 4).map((id) => apiGet<Profile>(`/api/v1/profiles/${id}`)),
  );

  return (
    <div>
      <h1>{messages.compare.heading}</h1>
      <div className="split">
        {profiles.map((p) => (
          <section key={p.uuid} className="panel">
            <h3>
              <Link href={`/profiles/${p.uuid}`}>{p.title}</Link>
            </h3>
            <dl className="kv">
              <dt>{sp.nozzleTemp}</dt>
              <dd>{p.currentRevision?.nozzleTempOtherLayersC ?? "—"}</dd>
              <dt>{sp.bedTemp}</dt>
              <dd>{p.currentRevision?.bedTempOtherLayersC ?? "—"}</dd>
              <dt>{sp.flow}</dt>
              <dd>{p.currentRevision?.flowRatio ?? "—"}</dd>
              <dt>{sp.pressureAdvance}</dt>
              <dd>{p.currentRevision?.pressureAdvance ?? "—"}</dd>
              <dt>{sp.maxVolumetric}</dt>
              <dd>{p.currentRevision?.maxVolumetricFlowMm3s ?? "—"}</dd>
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
