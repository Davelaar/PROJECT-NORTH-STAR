import Link from "next/link";
import { apiGet } from "@/lib/api";
import { getLocaleMessages } from "@/lib/messages";
import { SearchAutocomplete } from "../components/search-autocomplete";
import { buildPageMetadata } from "@/lib/seo/metadata";
import type { Metadata } from "next";

type CatalogProduct = {
  uuid: string;
  manufacturerName: string;
  productName: string;
  materialCode: string;
  provenance: string;
  variantCount: number;
  profileCount: number;
  measuredProfileCount: number;
  nozzleTempMinC: number | null;
  nozzleTempMaxC: number | null;
  bedTempMinC: number | null;
  bedTempMaxC: number | null;
  sampleVariants: Array<{ uuid: string; name: string; hex: string | null }>;
};

type CatalogResponse = {
  query: string;
  page: number;
  pageSize: number;
  total: number;
  results: CatalogProduct[];
};

type ColorHit = {
  entityUuid: string;
  title: string;
  hex?: string | null;
  materialCode?: string;
  distance?: number;
};

type ColorResponse = {
  mode: "color";
  color: { hex: string; label: string };
  page: number;
  pageSize: number;
  total: number;
  materialFacets: Array<{ code: string; count: number }>;
  results: ColorHit[];
};

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; brand?: string; material?: string }>;
}): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  const sp = await searchParams;
  const hasQuery = Boolean(sp.q || sp.brand || sp.material);
  return buildPageMetadata({
    title: m.search.heading,
    description: m.search.empty,
    path: "/search",
    noIndex: hasQuery,
  });
}

type Manufacturer = { uuid: string; name: string };
type Material = { code: string; name: string };

function tempRange(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null && min !== max) {
    return `${Math.round(min)}–${Math.round(max)} °C`;
  }
  const v = min ?? max;
  return v != null ? `${Math.round(v)} °C` : null;
}

function groupByMaterial(hits: ColorHit[]): Array<{
  material: string;
  items: ColorHit[];
}> {
  const order: string[] = [];
  const map = new Map<string, ColorHit[]>();
  for (const hit of hits) {
    const key = hit.materialCode || "?";
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(hit);
  }
  return order.map((material) => ({
    material,
    items: map.get(material)!,
  }));
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    brand?: string;
    material?: string;
    page?: string;
  }>;
}) {
  const sp = await searchParams;
  const q = sp.q ?? "";
  const brand = sp.brand ?? "";
  const material = sp.material ?? "";
  const page = Math.max(1, Number(sp.page ?? "1") || 1);
  const { messages: m } = await getLocaleMessages();

  let catalog: CatalogResponse | null = null;
  let color: ColorResponse | null = null;
  let manufacturers: Manufacturer[] = [];
  let materials: Material[] = [];
  let warning: string | null = null;

  try {
    const health = await apiGet<{ catalog?: { fixtureOnly?: boolean } }>(
      "/api/v1/health",
    );
    if (health.catalog?.fixtureOnly) warning = m.search.catalogEmpty;
    [manufacturers, materials] = await Promise.all([
      apiGet<Manufacturer[]>("/api/v1/manufacturers"),
      apiGet<Material[]>("/api/v1/materials"),
    ]);
  } catch {
    warning = m.search.apiDown;
  }

  if (q.trim() || brand || material) {
    try {
      // Colour mode when query parses as colour (material filter still applies)
      if (q.trim() && !brand) {
        const qs = new URLSearchParams();
        qs.set("q", q.trim());
        qs.set("page", String(page));
        qs.set("pageSize", "24");
        if (material) qs.set("material", material);
        const probe = await apiGet<{
          mode?: string;
          color?: ColorResponse["color"];
          page?: number;
          pageSize?: number;
          total?: number;
          materialFacets?: ColorResponse["materialFacets"];
          results?: ColorHit[];
        }>(`/api/v1/search?${qs.toString()}`);
        if (probe.mode === "color" && probe.color) {
          color = {
            mode: "color",
            color: probe.color,
            page: probe.page ?? page,
            pageSize: probe.pageSize ?? 24,
            total: probe.total ?? (probe.results?.length ?? 0),
            materialFacets: probe.materialFacets ?? [],
            results: probe.results ?? [],
          };
        }
      }
      if (!color) {
        const qs = new URLSearchParams();
        if (q.trim()) qs.set("q", q.trim());
        if (brand) qs.set("brand", brand);
        if (material) qs.set("material", material);
        qs.set("page", String(page));
        qs.set("pageSize", "24");
        catalog = await apiGet<CatalogResponse>(
          `/api/v1/catalog/search?${qs.toString()}`,
        );
      }
    } catch {
      warning = m.search.apiDown;
    }
  }

  const provLabel = (key: string) =>
    (m.search.provenance as Record<string, string>)[key] ?? key;

  function pageHref(nextPage: number, materialOverride?: string) {
    const qs = new URLSearchParams();
    if (q.trim()) qs.set("q", q.trim());
    if (brand) qs.set("brand", brand);
    const mat = materialOverride === undefined ? material : materialOverride;
    if (mat) qs.set("material", mat);
    qs.set("page", String(nextPage));
    return `/search?${qs.toString()}`;
  }

  const totalPages = catalog
    ? Math.max(1, Math.ceil(catalog.total / catalog.pageSize))
    : color
      ? Math.max(1, Math.ceil(color.total / color.pageSize))
      : 1;

  const colorFrom =
    color && color.total > 0
      ? (color.page - 1) * color.pageSize + 1
      : 0;
  const colorTo = color
    ? Math.min(color.page * color.pageSize, color.total)
    : 0;
  const colorGroups = color ? groupByMaterial(color.results) : [];
  const facetTotal = color
    ? color.materialFacets.reduce((n, f) => n + f.count, 0)
    : 0;

  return (
    <div className="stack catalog-page">
      <h1>{m.search.heading}</h1>
      {warning ? (
        <div className="banner-warn" role="status">
          {warning}
        </div>
      ) : null}

      <form className="catalog-filters" action="/search" method="get">
        <label className="visually-hidden" htmlFor="catalog-q">
          {m.nav.search}
        </label>
        <div id="catalog-q">
          <SearchAutocomplete
            name="q"
            defaultValue={q}
            placeholder={m.home.searchPlaceholder}
            ariaLabel={m.nav.search}
          />
        </div>
        <label>
          <span className="visually-hidden">{m.search.filterBrand}</span>
          <select name="brand" defaultValue={brand} aria-label={m.search.filterBrand}>
            <option value="">{m.search.allBrands}</option>
            {[...manufacturers]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((x) => (
                <option key={x.uuid} value={x.name}>
                  {x.name}
                </option>
              ))}
          </select>
        </label>
        <label>
          <span className="visually-hidden">{m.search.filterMaterial}</span>
          <select
            name="material"
            defaultValue={material}
            aria-label={m.search.filterMaterial}
          >
            <option value="">{m.search.allMaterials}</option>
            {[...materials]
              .sort((a, b) => a.code.localeCompare(b.code))
              .map((x) => (
                <option key={x.code} value={x.code}>
                  {x.code}
                </option>
              ))}
          </select>
        </label>
        <input type="hidden" name="page" value="1" />
        <button type="submit">{m.home.searchButton}</button>
      </form>

      {!q.trim() && !brand && !material ? (
        <p className="muted">{m.search.empty}</p>
      ) : color ? (
        <>
          <div className="color-search-meta panel">
            <span
              className="color-swatch color-swatch-lg"
              style={{ background: color.color.hex }}
              aria-hidden
            />
            <div>
              <strong>
                {m.search.colorMatch}: {color.color.label}
              </strong>
              <p className="muted" style={{ margin: "0.25rem 0 0" }}>
                {m.search.colorHint}
              </p>
            </div>
          </div>

          <p className="muted" role="status">
            {color.total === 0
              ? m.search.noResults
              : m.search.colorShowing
                  .replace("{from}", String(colorFrom))
                  .replace("{to}", String(colorTo))
                  .replace("{total}", String(color.total))}
            {color.total > 0
              ? ` · ${m.search.colorPageOf
                  .replace("{page}", String(color.page))
                  .replace("{pages}", String(totalPages))}`
              : ""}
          </p>

          {color.materialFacets.length > 0 ? (
            <nav
              className="material-facets"
              aria-label={m.search.colorFilterHint}
            >
              <Link
                href={pageHref(1, "")}
                className={`material-facet${!material ? " active" : ""}`}
                aria-current={!material ? "page" : undefined}
              >
                {m.search.colorMaterialCount
                  .replace("{material}", m.search.allMaterials)
                  .replace("{count}", String(facetTotal))}
              </Link>
              {color.materialFacets.map((f) => (
                <Link
                  key={f.code}
                  href={pageHref(1, f.code)}
                  className={`material-facet${material === f.code ? " active" : ""}`}
                  aria-current={material === f.code ? "page" : undefined}
                >
                  {m.search.colorMaterialCount
                    .replace("{material}", f.code)
                    .replace("{count}", String(f.count))}
                </Link>
              ))}
            </nav>
          ) : null}

          {color.results.length === 0 ? (
            <p className="muted" role="status">
              {m.search.noResults}
            </p>
          ) : (
            colorGroups.map((group) => (
              <section
                key={group.material}
                className="color-material-group"
                aria-labelledby={`mat-${group.material}`}
              >
                {!material ? (
                  <h2
                    id={`mat-${group.material}`}
                    className="color-material-heading"
                  >
                    {group.material}
                    <span className="muted">
                      {" "}
                      · {group.items.length}
                    </span>
                  </h2>
                ) : null}
                <ul className="result-cards">
                  {group.items.map((r) => (
                    <li key={r.entityUuid} className="result-card">
                      {r.hex ? (
                        <span
                          className="color-swatch"
                          style={{ background: r.hex }}
                          aria-hidden
                        />
                      ) : null}
                      <div className="result-card-main">
                        <Link
                          href={`/variants/${r.entityUuid}`}
                          className="result-title"
                        >
                          {r.title}
                        </Link>
                        <p className="muted">
                          {r.materialCode}
                          {typeof r.distance === "number"
                            ? ` · ${m.search.distance} ${r.distance}`
                            : ""}
                        </p>
                      </div>
                      <Link
                        className="button secondary"
                        href={`/variants/${r.entityUuid}`}
                      >
                        {m.search.viewVariant}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))
          )}

          {totalPages > 1 ? (
            <nav className="pager" aria-label="Pagination">
              {color.page > 1 ? (
                <Link href={pageHref(color.page - 1)}>{m.search.previous}</Link>
              ) : (
                <span className="muted">{m.search.previous}</span>
              )}
              <span className="muted">
                {m.search.colorPageOf
                  .replace("{page}", String(color.page))
                  .replace("{pages}", String(totalPages))}
              </span>
              {color.page < totalPages ? (
                <Link href={pageHref(color.page + 1)}>{m.search.next}</Link>
              ) : (
                <span className="muted">{m.search.next}</span>
              )}
            </nav>
          ) : color.total > 0 ? (
            <p className="muted" role="status">
              {m.search.colorTotal.replace("{total}", String(color.total))}
            </p>
          ) : null}
        </>
      ) : !catalog || catalog.results.length === 0 ? (
        <p className="muted" role="status">
          {m.search.noResults}
        </p>
      ) : (
        <>
          <p className="muted" role="status">
            {m.search.resultsCount.replace("{count}", String(catalog.total))}
            {totalPages > 1
              ? ` · ${m.search.colorPageOf
                  .replace("{page}", String(catalog.page))
                  .replace("{pages}", String(totalPages))}`
              : ""}
          </p>
          <ul className="result-cards">
            {catalog.results.map((p) => {
              const nozzle = tempRange(p.nozzleTempMinC, p.nozzleTempMaxC);
              const bed = tempRange(p.bedTempMinC, p.bedTempMaxC);
              return (
                <li key={p.uuid} className="result-card result-card-product">
                  <div className="result-card-main">
                    <Link href={`/filaments/${p.uuid}`} className="result-title">
                      {p.manufacturerName} {p.productName}
                    </Link>
                    <p className="result-meta">
                      <span className={`badge badge-${p.provenance}`}>
                        {provLabel(p.provenance)}
                      </span>
                      <span>
                        {p.materialCode} · {p.variantCount} {m.search.colours}
                        {p.profileCount
                          ? ` · ${p.profileCount} ${m.search.nozzleProfiles}`
                          : ""}
                        {p.measuredProfileCount
                          ? ` · ${p.measuredProfileCount} ${m.search.measuredProfiles}`
                          : ""}
                      </span>
                    </p>
                    {(nozzle || bed) && (
                      <p className="muted">
                        {nozzle ? `Nozzle ${nozzle}` : ""}
                        {nozzle && bed ? " · " : ""}
                        {bed ? `Bed ${bed}` : ""}
                      </p>
                    )}
                    {p.sampleVariants.length > 0 ? (
                      <ul className="variant-chips">
                        {p.sampleVariants.map((v) => (
                          <li key={v.uuid}>
                            <Link href={`/variants/${v.uuid}`}>
                              {v.hex ? (
                                <span
                                  className="color-swatch color-swatch-sm"
                                  style={{ background: v.hex }}
                                  aria-hidden
                                />
                              ) : null}
                              {v.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <Link className="button secondary" href={`/filaments/${p.uuid}`}>
                    {m.search.viewProduct}
                  </Link>
                </li>
              );
            })}
          </ul>
          {totalPages > 1 ? (
            <nav className="pager" aria-label="Pagination">
              {page > 1 ? (
                <Link href={pageHref(page - 1)}>{m.search.previous}</Link>
              ) : (
                <span className="muted">{m.search.previous}</span>
              )}
              <span className="muted">
                {page} / {totalPages}
              </span>
              {page < totalPages ? (
                <Link href={pageHref(page + 1)}>{m.search.next}</Link>
              ) : (
                <span className="muted">{m.search.next}</span>
              )}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
