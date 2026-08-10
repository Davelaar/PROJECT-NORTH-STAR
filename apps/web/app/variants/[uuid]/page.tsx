import Link from "next/link";
import { Suspense } from "react";
import { WhereToBuySection } from "@/app/components/where-to-buy-section";
import { apiGet } from "@/lib/api";
import { getLocaleMessages } from "@/lib/messages";
import { isPlaceholderId } from "@/lib/identifiers";
import { ProfileFilter } from "./profile-filter";

type Variant = {
  uuid: string;
  variantName: string;
  productName: string;
  productUuid: string;
  manufacturerName: string;
  materialCode: string;
  primaryColorHex: string | null;
  diameterMm?: number | null;
  densityGCm3?: number | null;
  abrasive?: boolean;
  datasheetUrl?: string | null;
  safetySheetUrl?: string | null;
  defaultNozzleDiameterMm?: number;
  isSyntheticFixture: boolean;
  sourceType?: string | null;
  identifiers?: {
    sku: string | null;
    ean: string | null;
    upc: string | null;
    gtin: string | null;
  };
  purchaseLinks?: Array<{ storeName: string; url: string; storeSlug?: string }>;
  preview?: {
    imageUrl: string | null;
    colorHex: string | null;
    swatchPath: string;
  };
  catalogMinimums?: {
    material: boolean;
    nozzleTemp: boolean;
    bedTemp: boolean;
    color: boolean;
    defaultNozzleSizeMm: number;
    complete: boolean;
  };
  catalogLinks?: {
    openFilamentDatabase: string;
    openFilamentDatabaseApi: string;
    openPrintTagSpec: string;
  };
  manufacturerSpecs: {
    nozzleTempMinC: number | null;
    nozzleTempMaxC: number | null;
    bedTempMinC: number | null;
    bedTempMaxC: number | null;
    chamberTempC?: number | null;
    chamberTempMinC?: number | null;
    chamberTempMaxC?: number | null;
    preheatTempC?: number | null;
    dryingTempC: number | null;
    dryingDurationHours: number | null;
    shrinkagePercentXy?: number | null;
    shrinkagePercentZ?: number | null;
    shoreHardnessA?: number | null;
    shoreHardnessD?: number | null;
    minNozzleDiameterMm?: number | null;
    note: string;
  };
};

type FieldAgg = {
  recommended: number | null;
  confidence: string;
  sampleCount?: number;
  keptCount?: number;
  excludedOutlierCount?: number;
  observedMin?: number | null;
  observedMax?: number | null;
};

type Recommendation = {
  warning: string | null;
  sampleProfileCount: number;
  recommendation: {
    algorithmVersion: string;
    nozzleTempOtherLayersC: FieldAgg;
    bedTempOtherLayersC: FieldAgg;
    flowRatio: FieldAgg;
    pressureAdvance: FieldAgg;
    maxVolumetricFlowMm3s: FieldAgg;
  };
};

type ProfileRow = {
  uuid: string;
  title: string;
  isSyntheticFixture: boolean;
  printerUuid: string;
  printerName: string;
  nozzleDiameterMm: number;
  provenance: string;
  voteScore?: number;
  communityVerified?: boolean;
  updatedAt?: string | null;
  status?: string | null;
};

type PrinterModel = {
  uuid: string;
  manufacturerName: string;
  model: string;
};

function roundTemp(v: number | null | undefined): string {
  if (v == null || !Number.isFinite(v)) return "—";
  return String(Math.round(v));
}

function fmt(v: number | null | undefined): string {
  return v == null ? "—" : String(v);
}

function displayId(value: string | null | undefined, na: string): string | null {
  if (isPlaceholderId(value)) return null;
  return value ?? null;
}

export default async function VariantPage({
  params,
  searchParams,
}: {
  params: Promise<{ uuid: string }>;
  searchParams: Promise<{ printer?: string; nozzle?: string }>;
}) {
  const { uuid } = await params;
  const spParams = await searchParams;
  const variant = await apiGet<Variant>(`/api/v1/variants/${uuid}`);
  const recommendation = await apiGet<Recommendation>(
    `/api/v1/variants/${uuid}/recommendation`,
  );
  const profiles = await apiGet<ProfileRow[]>(
    `/api/v1/variants/${uuid}/profiles`,
  );
  let printers: PrinterModel[] = [];
  try {
    printers = await apiGet<PrinterModel[]>("/api/v1/printers");
  } catch {
    printers = [];
  }

  const { messages } = await getLocaleMessages();
  const m = messages.variant;
  const sp = messages.specs;
  const c = messages.common;
  const specs = variant.manufacturerSpecs;
  const mins = variant.catalogMinimums;
  const ids = variant.identifiers;
  const previewSrc =
    variant.preview?.imageUrl ||
    variant.preview?.swatchPath ||
    `/api/v1/variants/${variant.uuid}/swatch.svg`;
  const buyLinks = variant.purchaseLinks ?? [];

  const nozzleOptions = Array.from(
    new Set([
      0.2,
      0.4,
      0.6,
      0.8,
      ...profiles.map((p) => p.nozzleDiameterMm),
      variant.defaultNozzleDiameterMm ?? 0.4,
    ]),
  ).sort((a, b) => a - b);

  const selectedPrinter = spParams.printer ?? "";
  const selectedNozzleRaw = spParams.nozzle;
  const nozzleExplicit = selectedNozzleRaw != null && selectedNozzleRaw !== "";
  const selectedNozzle = nozzleExplicit
    ? Number(selectedNozzleRaw)
    : (variant.defaultNozzleDiameterMm ?? 0.4);

  const printerOptions = [...printers]
    .map((p) => ({
      uuid: p.uuid,
      label: `${p.manufacturerName} ${p.model}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const measured = profiles.filter(
    (p) => p.provenance === "measured" || p.provenance === "community",
  );
  const starter = profiles.filter((p) => p.provenance === "starter");
  const catalogish = profiles.filter(
    (p) =>
      p.provenance !== "measured" &&
      p.provenance !== "community" &&
      p.provenance !== "starter",
  );

  const exact = measured.filter((p) => {
    const nozzleOk = Math.abs(p.nozzleDiameterMm - selectedNozzle) < 0.001;
    const printerOk = !selectedPrinter || p.printerUuid === selectedPrinter;
    return nozzleOk && printerOk;
  });

  const sameNozzleAlternatives = measured.filter((p) => {
    const nozzleOk = Math.abs(p.nozzleDiameterMm - selectedNozzle) < 0.001;
    return nozzleOk && !exact.includes(p);
  });
  const alternatives = measured.filter(
    (p) => !exact.includes(p) && !sameNozzleAlternatives.includes(p),
  );
  const bestMatch = exact[0] ?? null;

  const firstExportUuid =
    bestMatch?.uuid ??
    sameNozzleAlternatives[0]?.uuid ??
    measured[0]?.uuid ??
    profiles[0]?.uuid ??
    null;
  const starterExportParams = new URLSearchParams({
    nozzleDiameterMm: String(selectedNozzle),
  });
  if (selectedPrinter) starterExportParams.set("printerUuid", selectedPrinter);
  const starterExportHref = `/api/v1/variants/${variant.uuid}/exports/creality-starter?${starterExportParams.toString()}`;

  function yesNo(v: boolean | undefined): string {
    if (v == null) return "—";
    return v ? c.yes : c.no;
  }

  function confidenceLabel(level: string): string {
    if (level === "high") return m.highConfidence;
    if (level === "medium") return m.mediumConfidence;
    if (level === "low") return m.lowConfidence;
    return level;
  }

  function provLabel(key: string): string {
    return (
      (messages.search.provenance as Record<string, string>)[key] ?? key
    );
  }

  const sku = displayId(ids?.sku, m.notAvailable);
  const ean = displayId(ids?.ean, m.notAvailable);
  const upc = displayId(ids?.upc, m.notAvailable);
  const gtin = displayId(ids?.gtin, m.notAvailable);
  const hasIds = Boolean(sku || ean || upc || gtin);

  function renderProfileGroup(title: string, rows: ProfileRow[]) {
    if (rows.length === 0) return null;
    return (
      <section className="profile-group">
        <h3>{title}</h3>
        <ul className="profile-cards">
          {rows.map((p) => (
            <li key={p.uuid} className="profile-card">
              <div>
                <Link href={`/profiles/${p.uuid}`} className="result-title">
                  {p.title}
                </Link>
                <p className="muted">
                  {p.printerName} · {p.nozzleDiameterMm} mm ·{" "}
                  <span className={`badge badge-${p.provenance}`}>
                    {provLabel(p.provenance)}
                  </span>
                  {p.communityVerified ? (
                    <>
                      {" · "}
                      <span className="badge badge-verified">
                        {messages.profile.verifiedBadge}
                      </span>
                    </>
                  ) : null}
                  {typeof p.voteScore === "number" ? (
                    <>
                      {" · "}
                      {messages.profile.voteNet.replace(
                        "{score}",
                        String(p.voteScore),
                      )}
                    </>
                  ) : null}
                </p>
              </div>
              <div className="profile-card-actions">
                <Link className="button" href={`/export?profileUuid=${p.uuid}`}>
                  {messages.export.downloadForSlicer}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  const nozzleAgg = recommendation.recommendation.nozzleTempOtherLayersC;
  const bedAgg = recommendation.recommendation.bedTempOtherLayersC;

  return (
    <div className="variant-page">
      <div className="variant-hero">
        <div className="variant-preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={`${variant.variantName} preview`}
            width={220}
            height={220}
          />
        </div>
        <div>
          <h1>
            {variant.manufacturerName} {variant.productName}{" "}
            {variant.variantName}
          </h1>
          <p className="muted">{variant.materialCode}</p>
          {hasIds ? (
            <dl className="kv compact">
              {sku ? (
                <>
                  <dt>SKU</dt>
                  <dd>
                    <code>{sku}</code>
                  </dd>
                </>
              ) : null}
              {ean ? (
                <>
                  <dt>EAN</dt>
                  <dd>
                    <code>{ean}</code>
                  </dd>
                </>
              ) : null}
              {upc ? (
                <>
                  <dt>UPC</dt>
                  <dd>
                    <code>{upc}</code>
                  </dd>
                </>
              ) : null}
              {gtin && gtin !== ean && gtin !== upc ? (
                <>
                  <dt>GTIN</dt>
                  <dd>
                    <code>{gtin}</code>
                  </dd>
                </>
              ) : null}
            </dl>
          ) : (
            <p className="muted">{m.noIdentifiers}</p>
          )}
          <WhereToBuySection
            variantUuid={variant.uuid}
            initialLinks={buyLinks}
          />
        </div>
      </div>

      <section className="variant-actions panel" aria-labelledby="variant-actions">
        <h2 id="variant-actions">{m.actionsHeading}</h2>
        <div className="home-cta-links">
          <a className="button" href="#profile-filter">
            {m.choosePrinterNozzle}
          </a>
          {firstExportUuid ? (
            <Link
              className="button secondary"
              href={`/export?profileUuid=${firstExportUuid}`}
            >
              {messages.export.downloadForSlicer}
            </Link>
          ) : (
            <a className="button secondary" href={starterExportHref}>
              {m.downloadStarterProfile}
            </a>
          )}
          <Link className="button secondary" href={`/label/${uuid}`}>
            {m.printQr}
          </Link>
          <Link className="button secondary" href="/rfid">
            {m.writeRfid}
          </Link>
          <Link className="button secondary" href="/identify">
            {messages.nav.identify}
          </Link>
          <Link className="button secondary" href="/submit">
            {m.contribute}
          </Link>
        </div>
      </section>

      <div id="profile-filter">
        <Suspense fallback={null}>
          <ProfileFilter
            printers={printerOptions}
            nozzles={nozzleOptions}
            selectedPrinter={selectedPrinter}
            selectedNozzle={String(selectedNozzle)}
            labels={{
              choose: m.choosePrinterNozzle,
              printer: messages.search.entityTypes.printer,
              nozzle: m.nozzleLabel,
              allPrinters: m.allPrinters,
              defaultNote: nozzleExplicit ? "" : m.defaultNozzleNote,
            }}
          />
        </Suspense>
      </div>

      {variant.isSyntheticFixture ? (
        <div className="banner-warn">{m.syntheticBanner}</div>
      ) : null}
      {mins ? (
        <p className={mins.complete ? "muted" : "banner-warn"}>
          {m.catalogMinimums}: {messages.fields.material} {yesNo(mins.material)},{" "}
          {sp.nozzleTemp} {yesNo(mins.nozzleTemp)}, {sp.bedTemp}{" "}
          {yesNo(mins.bedTemp)}, {sp.color} {yesNo(mins.color)}.{" "}
          {m.defaultNozzle}: {mins.defaultNozzleSizeMm} mm.
        </p>
      ) : null}

      <div className="split">
        <section className="panel">
          <h2>{m.manufacturerSpecs}</h2>
          <p className="muted">{specs.note}</p>
          <dl className="kv">
            <dt>{sp.nozzleTemp}</dt>
            <dd>
              {roundTemp(specs.nozzleTempMinC)} – {roundTemp(specs.nozzleTempMaxC)} °C
            </dd>
            <dt>{sp.bedTemp}</dt>
            <dd>
              {roundTemp(specs.bedTempMinC)} – {roundTemp(specs.bedTempMaxC)} °C
            </dd>
            <dt>{sp.chamberTemp}</dt>
            <dd>
              {roundTemp(specs.chamberTempMinC ?? specs.chamberTempC)} –{" "}
              {roundTemp(specs.chamberTempMaxC ?? specs.chamberTempC)} °C
            </dd>
            <dt>{sp.preheatTemp}</dt>
            <dd>{roundTemp(specs.preheatTempC)} °C</dd>
            <dt>{sp.drying}</dt>
            <dd>
              {roundTemp(specs.dryingTempC)} °C / {fmt(specs.dryingDurationHours)} h
            </dd>
            <dt>
              {sp.shrinkageXy} / {sp.shrinkageZ}
            </dt>
            <dd>
              {fmt(specs.shrinkagePercentXy)} / {fmt(specs.shrinkagePercentZ)}
            </dd>
            <dt>{sp.diameter}</dt>
            <dd>{fmt(variant.diameterMm)} mm</dd>
            <dt>{sp.density}</dt>
            <dd>{fmt(variant.densityGCm3)} g/cm³</dd>
            <dt>{sp.minNozzle}</dt>
            <dd>{fmt(specs.minNozzleDiameterMm)} mm</dd>
            <dt>
              {sp.shoreA} / {sp.shoreD}
            </dt>
            <dd>
              {fmt(specs.shoreHardnessA)} / {fmt(specs.shoreHardnessD)}
            </dd>
            <dt>{sp.abrasive}</dt>
            <dd>{yesNo(variant.abrasive)}</dd>
            <dt>{sp.color}</dt>
            <dd>{variant.primaryColorHex ?? "—"}</dd>
          </dl>
        </section>

        <section className="panel">
          <h2>{m.communityRecommendation}</h2>
          {recommendation.warning ? (
            <div className="banner-warn">{recommendation.warning}</div>
          ) : null}
          <p className="muted">
            {m.sampleCount.replace(
              "{count}",
              String(recommendation.sampleProfileCount),
            )}
          </p>
          <dl className="kv">
            <dt>{sp.nozzleTemp}</dt>
            <dd>
              {roundTemp(nozzleAgg.recommended)} °C{" "}
              <span className="muted">
                ({confidenceLabel(nozzleAgg.confidence)})
              </span>
            </dd>
            <dt>{sp.bedTemp}</dt>
            <dd>
              {roundTemp(bedAgg.recommended)} °C{" "}
              <span className="muted">
                ({confidenceLabel(bedAgg.confidence)})
              </span>
            </dd>
            <dt>{sp.flow}</dt>
            <dd>
              {fmt(recommendation.recommendation.flowRatio.recommended)}{" "}
              <span className="muted">
                (
                {confidenceLabel(
                  recommendation.recommendation.flowRatio.confidence,
                )}
                )
              </span>
            </dd>
            <dt>{sp.pressureAdvance}</dt>
            <dd>
              {fmt(recommendation.recommendation.pressureAdvance.recommended)}{" "}
              <span className="muted">
                (
                {confidenceLabel(
                  recommendation.recommendation.pressureAdvance.confidence,
                )}
                )
              </span>
            </dd>
            <dt>{sp.maxVolumetric}</dt>
            <dd>
              {fmt(
                recommendation.recommendation.maxVolumetricFlowMm3s.recommended,
              )}{" "}
              mm³/s
            </dd>
          </dl>
          <details className="how-calculated">
            <summary>{m.howCalculated}</summary>
            <ul>
              <li>
                {m.sampleCount.replace(
                  "{count}",
                  String(recommendation.sampleProfileCount),
                )}
              </li>
              <li>{m.howCalculatedBody}</li>
              <li>
                Kept / outliers: {nozzleAgg.keptCount ?? "—"} /{" "}
                {nozzleAgg.excludedOutlierCount ?? "—"}
              </li>
            </ul>
          </details>
        </section>
      </div>

      <h2>{m.profiles}</h2>
      {!bestMatch && (selectedPrinter || nozzleExplicit) ? (
        <p className="muted" role="status">
          {m.noExactMatch}
        </p>
      ) : null}
      {!bestMatch && sameNozzleAlternatives.length > 0 ? (
        <p className="banner-warn" role="status">
          {m.comparableNozzleAvailable}
        </p>
      ) : null}
      {renderProfileGroup(m.bestMatch, bestMatch ? [bestMatch] : [])}
      {renderProfileGroup(m.comparablePrinterProfiles, sameNozzleAlternatives)}
      {renderProfileGroup(
        m.measuredProfiles,
        exact.filter((p) => p.uuid !== bestMatch?.uuid),
      )}
      {renderProfileGroup(m.compatibleAlternatives, alternatives)}
      {renderProfileGroup(m.catalogProfiles, catalogish)}
      {renderProfileGroup(m.starterProfiles, starter)}
      {!firstExportUuid ? (
        <section className="profile-group panel">
          <h3>{m.generatedStarterProfile}</h3>
          <p className="banner-warn">{m.generatedStarterProfileBody}</p>
          <p>
            <a className="button" href={starterExportHref}>
              {m.downloadStarterProfile}
            </a>
          </p>
        </section>
      ) : null}

      {variant.sourceType === "open_filament_database" && variant.catalogLinks ? (
        <p className="muted">
          {m.ofdAttribution}{" "}
          <a
            href={variant.catalogLinks.openFilamentDatabase}
            target="_blank"
            rel="noreferrer"
          >
            openfilamentdatabase.org
          </a>
        </p>
      ) : null}

      <p>
        <Link href={`/filaments/${variant.productUuid}`}>
          {variant.productName}
        </Link>
        {" · "}
        <Link href="/scan">{m.scanQr}</Link>
      </p>
    </div>
  );
}
