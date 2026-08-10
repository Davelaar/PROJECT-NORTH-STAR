import { apiGet } from "@/lib/api";
import { getLocaleMessages } from "@/lib/messages";

type Printer = {
  uuid: string;
  manufacturerName: string;
  model: string;
  revision: string | null;
  maxNozzleTempC: number | null;
  maxBedTempC: number | null;
  chamberCapable: boolean;
  isSyntheticFixture: boolean;
  toolheads: Array<{
    uuid: string;
    hotendName: string;
    nozzleDiameterMm: number;
    nozzleMaterial: string | null;
  }>;
};

export default async function PrinterPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { messages } = await getLocaleMessages();
  const sp = messages.specs;
  const c = messages.common;
  const { uuid } = await params;
  const printer = await apiGet<Printer>(`/api/v1/printers/${uuid}`);
  return (
    <div>
      <h1>
        {printer.manufacturerName} {printer.model}
      </h1>
      {printer.isSyntheticFixture ? (
        <div className="banner-warn">{messages.variant.syntheticBanner}</div>
      ) : null}
      <dl className="kv">
        <dt>{sp.revision}</dt>
        <dd>{printer.revision ?? "—"}</dd>
        <dt>{sp.maxNozzle}</dt>
        <dd>{printer.maxNozzleTempC ?? "—"} °C</dd>
        <dt>{sp.maxBed}</dt>
        <dd>{printer.maxBedTempC ?? "—"} °C</dd>
        <dt>{sp.chamber}</dt>
        <dd>{printer.chamberCapable ? c.yes : c.no}</dd>
      </dl>
      <h2>{sp.toolheads}</h2>
      <ul className="list">
        {printer.toolheads.map((t) => (
          <li key={t.uuid}>
            {t.hotendName} — {t.nozzleDiameterMm} mm
            {t.nozzleMaterial ? ` (${t.nozzleMaterial})` : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
