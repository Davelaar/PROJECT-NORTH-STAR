import Link from "next/link";
import { apiGet } from "@/lib/api";
import { messages } from "@/lib/messages/en";

type Variant = {
  uuid: string;
  variantName: string;
  productName: string;
  productUuid: string;
  manufacturerName: string;
  materialCode: string;
  primaryColorHex: string | null;
  isSyntheticFixture: boolean;
  manufacturerSpecs: {
    nozzleTempMinC: number | null;
    nozzleTempMaxC: number | null;
    bedTempMinC: number | null;
    bedTempMaxC: number | null;
    dryingTempC: number | null;
    dryingDurationHours: number | null;
    note: string;
  };
};

type Recommendation = {
  warning: string | null;
  sampleProfileCount: number;
  recommendation: {
    algorithmVersion: string;
    nozzleTempOtherLayersC: { recommended: number | null; confidence: string };
    bedTempOtherLayersC: { recommended: number | null; confidence: string };
    flowRatio: { recommended: number | null; confidence: string };
    pressureAdvance: { recommended: number | null; confidence: string };
    maxVolumetricFlowMm3s: { recommended: number | null; confidence: string };
  };
};

type ProfileRow = {
  uuid: string;
  title: string;
  isSyntheticFixture: boolean;
  printerName: string;
  nozzleDiameterMm: number;
};

function fmt(v: number | null | undefined): string {
  return v == null ? "—" : String(v);
}

export default async function VariantPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const variant = await apiGet<Variant>(`/api/v1/variants/${uuid}`);
  const recommendation = await apiGet<Recommendation>(
    `/api/v1/variants/${uuid}/recommendation`,
  );
  const profiles = await apiGet<ProfileRow[]>(
    `/api/v1/variants/${uuid}/profiles`,
  );
  const m = messages.variant;

  return (
    <div>
      <h1>
        {variant.manufacturerName} {variant.productName} {variant.variantName}
      </h1>
      <p className="muted">{variant.materialCode}</p>
      {variant.isSyntheticFixture ? (
        <div className="banner-warn">{m.syntheticBanner}</div>
      ) : null}

      <div className="split">
        <section className="panel">
          <h3>{m.manufacturerSpecs}</h3>
          <p className="muted">{variant.manufacturerSpecs.note}</p>
          <dl className="kv">
            <dt>Nozzle °C</dt>
            <dd>
              {fmt(variant.manufacturerSpecs.nozzleTempMinC)} –{" "}
              {fmt(variant.manufacturerSpecs.nozzleTempMaxC)}
            </dd>
            <dt>Bed °C</dt>
            <dd>
              {fmt(variant.manufacturerSpecs.bedTempMinC)} –{" "}
              {fmt(variant.manufacturerSpecs.bedTempMaxC)}
            </dd>
            <dt>Drying</dt>
            <dd>
              {fmt(variant.manufacturerSpecs.dryingTempC)} °C /{" "}
              {fmt(variant.manufacturerSpecs.dryingDurationHours)} h
            </dd>
            <dt>Color</dt>
            <dd>{variant.primaryColorHex ?? "—"}</dd>
          </dl>
        </section>

        <section className="panel">
          <h3>{m.communityRecommendation}</h3>
          {recommendation.warning ? (
            <div className="banner-warn">{recommendation.warning}</div>
          ) : null}
          <p className="muted">
            {recommendation.sampleProfileCount} published samples ·{" "}
            {recommendation.recommendation.algorithmVersion}
          </p>
          <dl className="kv">
            <dt>Nozzle °C</dt>
            <dd>
              {fmt(recommendation.recommendation.nozzleTempOtherLayersC.recommended)}{" "}
              <span className="muted">
                ({recommendation.recommendation.nozzleTempOtherLayersC.confidence})
              </span>
            </dd>
            <dt>Bed °C</dt>
            <dd>
              {fmt(recommendation.recommendation.bedTempOtherLayersC.recommended)}{" "}
              <span className="muted">
                ({recommendation.recommendation.bedTempOtherLayersC.confidence})
              </span>
            </dd>
            <dt>Flow</dt>
            <dd>
              {fmt(recommendation.recommendation.flowRatio.recommended)}{" "}
              <span className="muted">
                ({recommendation.recommendation.flowRatio.confidence})
              </span>
            </dd>
            <dt>PA</dt>
            <dd>
              {fmt(recommendation.recommendation.pressureAdvance.recommended)}{" "}
              <span className="muted">
                ({recommendation.recommendation.pressureAdvance.confidence})
              </span>
            </dd>
            <dt>Max VF</dt>
            <dd>
              {fmt(recommendation.recommendation.maxVolumetricFlowMm3s.recommended)}{" "}
              mm³/s
            </dd>
          </dl>
        </section>
      </div>

      <h2>{m.profiles}</h2>
      <ul className="list">
        {profiles.map((p) => (
          <li key={p.uuid}>
            <Link href={`/profiles/${p.uuid}`}>{p.title}</Link>
            <span className="muted">
              {" "}
              — {p.printerName}, {p.nozzleDiameterMm} mm
            </span>
          </li>
        ))}
      </ul>
      <p>
        <Link href={`/filaments/${variant.productUuid}`}>{variant.productName}</Link>
      </p>
    </div>
  );
}
