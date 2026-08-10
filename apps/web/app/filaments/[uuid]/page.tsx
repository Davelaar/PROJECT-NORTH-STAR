import Link from "next/link";
import { apiGet } from "@/lib/api";
import { messages } from "@/lib/messages/en";

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
  isSyntheticFixture: boolean;
};

export default async function FilamentPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const product = await apiGet<Filament>(`/api/v1/filaments/${uuid}`);
  const variants = await apiGet<Variant[]>(`/api/v1/filaments/${uuid}/variants`);

  return (
    <div>
      <h1>
        {product.manufacturerName} {product.productName}
      </h1>
      <p className="muted">{product.materialCode}</p>
      {product.isSyntheticFixture ? (
        <div className="banner-warn">{messages.variant.syntheticBanner}</div>
      ) : null}
      {product.description ? <p>{product.description}</p> : null}

      <div className="panel">
        <h3>{messages.variant.manufacturerSpecs}</h3>
        <dl className="kv">
          <dt>Nozzle °C</dt>
          <dd>
            {product.mfrNozzleTempMinC ?? "—"} – {product.mfrNozzleTempMaxC ?? "—"}
          </dd>
          <dt>Bed °C</dt>
          <dd>
            {product.mfrBedTempMinC ?? "—"} – {product.mfrBedTempMaxC ?? "—"}
          </dd>
        </dl>
      </div>

      <h2>Variants</h2>
      <ul className="list">
        {variants.map((v) => (
          <li key={v.uuid}>
            <Link href={`/variants/${v.uuid}`}>{v.variantName}</Link>
            {v.colorName ? (
              <span className="muted"> — {v.colorName}</span>
            ) : null}
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
