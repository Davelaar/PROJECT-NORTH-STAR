import Link from "next/link";
import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { InstallProfileButton } from "../../components/install-profile-button";
import { ProfileVoteButtons } from "../../components/profile-vote-buttons";

type Profile = {
  uuid: string;
  title: string;
  isSyntheticFixture: boolean;
  voteScore?: number;
  communityVerified?: boolean;
  variantUuid: string;
  printerUuid: string;
  currentRevision: {
    uuid: string;
    status: string;
    nozzleTempFirstLayerC: number | null;
    nozzleTempOtherLayersC: number | null;
    bedTempFirstLayerC: number | null;
    bedTempOtherLayersC: number | null;
    flowRatio: number | null;
    pressureAdvance: number | null;
    maxVolumetricFlowMm3s: number | null;
    fanMinPercent: number | null;
    fanMaxPercent: number | null;
    shrinkagePercentXy: number | null;
    shrinkagePercentZ: number | null;
    retractionDistanceMm: number | null;
    notes: string | null;
  } | null;
  openFilamentProfile: unknown;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  const { uuid } = await params;
  try {
    const profile = await apiGet<Profile>(`/api/v1/profiles/${uuid}`);
    return buildPageMetadata({
      title: profile.title || "Calibration profile",
      description:
        profile.currentRevision?.notes?.trim() ||
        "Measured filament calibration profile on OpenFilament",
      path: `/profiles/${uuid}`,
      noIndex: profile.isSyntheticFixture,
    });
  } catch {
    return buildPageMetadata({
      title: "Calibration profile",
      description: "OpenFilament calibration profile",
      path: `/profiles/${uuid}`,
      noIndex: true,
    });
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { messages } = await getLocaleMessages();
  const sp = messages.specs;
  const pr = messages.profile;
  const { uuid } = await params;
  const profile = await apiGet<Profile>(`/api/v1/profiles/${uuid}`);
  const rev = profile.currentRevision;

  return (
    <div>
      <h1>{profile.title}</h1>
      {profile.communityVerified ? (
        <p className="badge badge-verified">{pr.verifiedBadge}</p>
      ) : null}
      {profile.isSyntheticFixture ? (
        <div className="banner-warn">{messages.variant.syntheticBanner}</div>
      ) : null}
      {rev ? (
        <div className="panel">
          <h3>
            {pr.currentRevision} ({rev.status})
          </h3>
          <dl className="kv">
            <dt>{sp.nozzleTemp}</dt>
            <dd>
              {rev.nozzleTempFirstLayerC ?? "—"} /{" "}
              {rev.nozzleTempOtherLayersC ?? "—"}
            </dd>
            <dt>{sp.bedTemp}</dt>
            <dd>
              {rev.bedTempFirstLayerC ?? "—"} /{" "}
              {rev.bedTempOtherLayersC ?? "—"}
            </dd>
            <dt>{sp.flow}</dt>
            <dd>{rev.flowRatio ?? "—"}</dd>
            <dt>{sp.pressureAdvance}</dt>
            <dd>{rev.pressureAdvance ?? "—"}</dd>
            <dt>{sp.maxVolumetric}</dt>
            <dd>{rev.maxVolumetricFlowMm3s ?? "—"}</dd>
            <dt>{sp.shrinkageXy}</dt>
            <dd>{rev.shrinkagePercentXy ?? "—"}</dd>
            <dt>{sp.shrinkageZ}</dt>
            <dd>{rev.shrinkagePercentZ ?? "—"}</dd>
          </dl>
          {rev.notes ? <p className="muted">{rev.notes}</p> : null}
        </div>
      ) : null}
      <div className="panel">
        <h2>{messages.export.downloadForSlicer}</h2>
        <p>
          <Link
            className="button"
            href={`/export?profileUuid=${profile.uuid}`}
          >
            {messages.export.downloadForSlicer}
          </Link>
        </p>
        <InstallProfileButton profileUuid={profile.uuid} />
        <p className="muted">
          <Link href="/docs/slicers">{messages.export.supportedSlicersLink}</Link>
          {" · "}
          {pr.identifySpool}{" "}
          <Link href={`/label/${profile.variantUuid}`}>
            {messages.variant.printQr}
          </Link>
          {" · "}
          <Link href={`/scan`}>{messages.variant.scanQr}</Link>
          {" · "}
          <Link href={`/rfid`}>{messages.nav.rfid}</Link>
        </p>
      </div>
      <ProfileVoteButtons profileUuid={profile.uuid} />
      <p>
        <Link href={`/variants/${profile.variantUuid}`}>
          {messages.fields.variant}
        </Link>
        {" · "}
        <Link href={`/printers/${profile.printerUuid}`}>
          {messages.nav.hardware}
        </Link>
        {" · "}
        <Link href="/hardware">{messages.printers.addHeading}</Link>
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
