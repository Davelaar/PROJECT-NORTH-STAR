import Link from "next/link";
import { apiGet } from "@/lib/api";
import { messages } from "@/lib/messages/en";

type Manufacturer = {
  uuid: string;
  name: string;
  website: string | null;
  country: string | null;
  description: string | null;
  isSyntheticFixture: boolean;
};

export default async function ManufacturerPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const mfr = await apiGet<Manufacturer>(`/api/v1/manufacturers/${uuid}`);
  return (
    <div>
      <h1>{mfr.name}</h1>
      {mfr.isSyntheticFixture ? (
        <div className="banner-warn">{messages.variant.syntheticBanner}</div>
      ) : null}
      <dl className="kv">
        <dt>Country</dt>
        <dd>{mfr.country ?? "—"}</dd>
        <dt>Website</dt>
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
