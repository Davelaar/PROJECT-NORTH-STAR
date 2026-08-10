import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getLocaleMessages } from "@/lib/messages";

type Filament = {
  uuid: string;
  productName: string;
  manufacturerName: string;
  manufacturerUuid: string;
  materialCode: string;
  description: string | null;
  mfrNozzleTempMinC: number | null;
  mfrNozzleTempMaxC: number | null;
  mfrBedTempMinC: number | null;
  mfrBedTempMaxC: number | null;
  isSyntheticFixture: boolean;
};

type Variant = {
  uuid: string;
  variantName: string;
  colorName: string | null;
  primaryColorHex?: string | null;
  isSyntheticFixture: boolean;
};

function roundTemp(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return String(Math.round(v));
}

export default async function FilamentPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { messages } = await getLocaleMessages();
  const sp = messages.specs;
  const m = messages.variant;
  const { uuid } = await params;
  const product = await apiGet<Filament>(`/api/v1/filaments/${uuid}`);
  const variants = await apiGet<Variant[]>(`/api/v1/filaments/${uuid}/variants`);
  const firstVariant = variants[0];

  return (
    <div className="filament-page">
      <h1>
        {product.manufacturerName} {product.productName}
      </h1>
      <p className="muted">{product.materialCode}</p>
      {product.isSyntheticFixture ? (
        <div className="banner-warn">{m.syntheticBanner}</div>
      ) : null}
      {product.description ? <p>{product.description}</p> : null}

      <section className="variant-actions panel" aria-labelledby="filament-actions">
        <h2 id="filament-actions">{m.actionsHeading}</h2>
        <div className="home-cta-links">
          <Link className="button" href="#variants">
            {m.choosePrinterNozzle}
          </Link>
          {firstVariant ? (
            <>
              <Link
                className="button secondary"
                href={`/label/${firstVariant.uuid}`}
              >
                {m.printQr}
              </Link>
              <Link className="button secondary" href="/rfid">
                {m.writeRfid}
              </Link>
            </>
          ) : null}
          <Link className="button secondary" href="/submit">
            {m.contribute}
          </Link>
        </div>
        <p className="muted">{m.defaultNozzleNote}</p>
      </section>

      <div className="panel">
        <h2>{m.manufacturerSpecs}</h2>
        <dl className="kv">
          <dt>{sp.nozzleTemp}</dt>
          <dd>
            {roundTemp(product.mfrNozzleTempMinC)} –{" "}
            {roundTemp(product.mfrNozzleTempMaxC)} °C
          </dd>
          <dt>{sp.bedTemp}</dt>
          <dd>
            {roundTemp(product.mfrBedTempMinC)} –{" "}
            {roundTemp(product.mfrBedTempMaxC)} °C
          </dd>
        </dl>
      </div>

      <h2 id="variants">{sp.variants}</h2>
      <ul className="result-cards">
        {variants.map((v) => (
          <li key={v.uuid} className="result-card">
            {v.primaryColorHex ? (
              <span
                className="color-swatch"
                style={{ background: v.primaryColorHex }}
                aria-hidden
              />
            ) : null}
            <div className="result-card-main">
              <Link href={`/variants/${v.uuid}`} className="result-title">
                {v.variantName}
              </Link>
              {v.colorName ? <p className="muted">{v.colorName}</p> : null}
            </div>
            <Link className="button secondary" href={`/variants/${v.uuid}`}>
              {messages.search.viewVariant}
            </Link>
          </li>
        ))}
      </ul>
      <p>
        <Link href={`/manufacturers/${product.manufacturerUuid}`}>
          {product.manufacturerName}
        </Link>
      </p>
    </div>
  );
}
