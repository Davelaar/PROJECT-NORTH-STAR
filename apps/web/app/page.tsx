import Image from "next/image";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getLocaleMessages } from "@/lib/messages";
import { getUsageTrackingCopy } from "@/lib/usage-tracking-copy";
import { SearchAutocomplete } from "./components/search-autocomplete";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.brand,
    description: m.home.lead,
    path: "/",
  });
}
type PreviewSection = {
  id: string;
  items: Array<{
    uuid: string;
    manufacturerName: string;
    productName: string;
    materialCode: string;
    provenance: string;
    variantCount: number;
  }>;
};

const HOME_PREVIEW_MAX = 12;

export default async function HomePage() {
  const { locale, messages: m } = await getLocaleMessages();
  const usage = getUsageTrackingCopy(locale);
  let sections: PreviewSection[] = [];
  let catalogWarning: string | null = null;
  let previewCount = 0;

  try {
    const health = await apiGet<{
      catalog?: { fixtureOnly?: boolean };
    }>("/api/v1/health");
    if (health.catalog?.fixtureOnly) {
      catalogWarning = m.home.catalogEmpty;
    }
    const preview = await apiGet<{
      sections: PreviewSection[];
      totalLimit: number;
    }>("/api/v1/catalog/preview");
    sections = preview.sections ?? [];
    previewCount = sections.reduce((n, s) => n + s.items.length, 0);
    if (previewCount > HOME_PREVIEW_MAX) {
      // Defensive: never render an unbounded dump even if API misbehaves
      sections = sections.map((s) => ({
        ...s,
        items: s.items.slice(0, Math.max(0, HOME_PREVIEW_MAX)),
      }));
      let kept = 0;
      sections = sections
        .map((s) => {
          const room = HOME_PREVIEW_MAX - kept;
          const items = s.items.slice(0, room);
          kept += items.length;
          return { ...s, items };
        })
        .filter((s) => s.items.length > 0);
      previewCount = kept;
    }
  } catch {
    catalogWarning = m.home.apiDown;
  }

  const sectionTitle = (id: string) => {
    if (id === "featuredMaterials") return m.home.featuredMaterials;
    if (id === "recentlyAdded") return m.home.recentlyAdded;
    if (id === "mostComplete") return m.home.mostComplete;
    return id;
  };

  return (
    <div className="home">
      {catalogWarning ? (
        <div className="banner-warn" role="status">
          {catalogWarning}
        </div>
      ) : null}

      <section className="home-hero" aria-label={m.brand}>
        <div className="home-hero-media-wrap" aria-hidden="true">
          <Image
            className="home-hero-media"
            src="/images/hero-filament.png"
            alt=""
            fill
            priority
            sizes="(max-width: 768px) 100vw, 1280px"
          />
        </div>
        <div className="home-hero-scrim" aria-hidden="true" />
        <div className="home-hero-inner">
          <div className="home-hero-copy">
            <h1 className="home-headline">{m.home.heading}</h1>
            <p className="home-lead">{m.home.lead}</p>
            <div className="home-cta">
              <form className="search-row home-search" action="/search" method="get">
                <SearchAutocomplete
                  name="q"
                  placeholder={m.home.searchPlaceholder}
                  ariaLabel={m.nav.search}
                />
                <button type="submit">{m.home.searchButton}</button>
              </form>
              <div className="home-cta-links">
                <Link className="button secondary" href="/search">
                  {m.home.browse}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <article className="home-body">
        <section className="home-section">
          <h2>{m.home.howItWorks}</h2>
          <ol className="home-steps">
            <li>{m.home.stepFind}</li>
            <li>{m.home.stepChoose}</li>
            <li>{m.home.stepIdentify}</li>
            <li>{m.home.stepPrint}</li>
          </ol>
        </section>

        <section className="home-section">
          <h2>{m.home.identifyTitle}</h2>
          <p>{m.home.identifyBody}</p>
          <div className="identify-cards home-identify-cards">
            <Link className="identify-card" href="/search">
              <h3>{m.identify.manualTitle}</h3>
              <p>{m.identify.manualBody}</p>
            </Link>
            <Link className="identify-card" href="/scan">
              <h3>{m.identify.qrTitle}</h3>
              <p>{m.identify.qrBody}</p>
            </Link>
            <Link className="identify-card" href="/rfid">
              <h3>{m.identify.rfidTitle}</h3>
              <p>{m.identify.rfidBody}</p>
            </Link>
          </div>
        </section>

        <section className="home-section">
          <h2>{m.home.profilesTitle}</h2>
          <p>{m.home.profilesBody}</p>
          <p className="muted">{m.home.nozzlesNote}</p>
        </section>

        <section className="home-section">
          <h2>My Spools Cloud</h2>
          <p>{usage.cloudDisclosures[0]}</p>
          <p className="banner-warn">{usage.centralRule}</p>
          <p className="home-cta-links">
            <Link className="button" href="/my-spools/cloud">
              My Spools Cloud
            </Link>
            <Link className="button secondary" href="/compatibility">
              {usage.checkSetup}
            </Link>
          </p>
        </section>

        <section className="home-section home-catalog-preview" id="catalog">
          <h2>{m.home.catalogTitle}</h2>
          <p>{m.home.catalogBody}</p>
          {sections.length === 0 ? (
            <p className="muted">{m.home.apiDown}</p>
          ) : (
            sections.map((section) => (
              <div key={section.id} className="preview-section">
                <h3>{sectionTitle(section.id)}</h3>
                <ul className="preview-list">
                  {section.items.map((item) => (
                    <li key={item.uuid}>
                      <Link href={`/filaments/${item.uuid}`}>
                        {item.manufacturerName} {item.productName}
                      </Link>
                      <span className="muted">
                        {" "}
                        · {item.materialCode}
                        {item.variantCount
                          ? ` · ${item.variantCount} ${m.specs.variants.toLowerCase()}`
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
          <p>
            <Link className="button" href="/search">
              {m.home.browseFullCatalog}
            </Link>
          </p>
          <p className="visually-hidden" data-testid="home-preview-count">
            {previewCount}
          </p>
        </section>

        <section className="home-section">
          <h2>{m.home.communityTitle}</h2>
          <p>{m.home.communityBody}</p>
          <div className="home-cta-links">
            <Link className="button" href="/submit">
              {m.nav.submit}
            </Link>
            <Link className="button secondary" href="/contribute">
              {m.nav.contribute}
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
