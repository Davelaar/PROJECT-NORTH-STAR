import Link from "next/link";
import { apiGet } from "@/lib/api";
import { messages } from "@/lib/messages/en";
import { InstallProfileButton } from "../../components/install-profile-button";
import { ConfirmFailButtons } from "../../components/confirm-fail-buttons";

type Profile = {
  uuid: string;
  title: string;
  isSyntheticFixture: boolean;
  variantUuid: string;
  printerUuid: string;
  currentRevision: {
    uuid: string;
    status: string;
    nozzleTempOtherLayersC: number | null;
    bedTempOtherLayersC: number | null;
    flowRatio: number | null;
    pressureAdvance: number | null;
    maxVolumetricFlowMm3s: number | null;
    notes: string | null;
  } | null;
  openFilamentProfile: unknown;
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const profile = await apiGet<Profile>(`/api/v1/profiles/${uuid}`);
  const rev = profile.currentRevision;

  return (
    <div>
      <h1>{profile.title}</h1>
      {profile.isSyntheticFixture ? (
        <div className="banner-warn">{messages.variant.syntheticBanner}</div>
      ) : null}
      {rev ? (
        <div className="panel">
          <h3>Current revision ({rev.status})</h3>
          <dl className="kv">
            <dt>Nozzle °C</dt>
            <dd>{rev.nozzleTempOtherLayersC ?? "—"}</dd>
            <dt>Bed °C</dt>
            <dd>{rev.bedTempOtherLayersC ?? "—"}</dd>
            <dt>Flow</dt>
            <dd>{rev.flowRatio ?? "—"}</dd>
            <dt>PA</dt>
            <dd>{rev.pressureAdvance ?? "—"}</dd>
            <dt>Max VF</dt>
            <dd>{rev.maxVolumetricFlowMm3s ?? "—"}</dd>
          </dl>
          {rev.notes ? <p className="muted">{rev.notes}</p> : null}
        </div>
      ) : null}
      <div className="panel">
        <h3>Install</h3>
        <InstallProfileButton profileUuid={profile.uuid} />
        <p className="muted">
          Also: <Link href={`/export?profileUuid=${profile.uuid}`}>Export page</Link>
          {" · "}
          <Link href={`/rfid`}>Write CFS RFID</Link>
        </p>
      </div>
      <ConfirmFailButtons profileUuid={profile.uuid} />
      <p>
        <Link href={`/variants/${profile.variantUuid}`}>Variant</Link>
        {" · "}
        <Link href={`/printers/${profile.printerUuid}`}>Printer</Link>
      </p>
      {profile.openFilamentProfile ? (
        <>
          <h2>OpenFilamentProfile</h2>
          <pre>{JSON.stringify(profile.openFilamentProfile, null, 2)}</pre>
        </>
      ) : null}
    </div>
  );
}
