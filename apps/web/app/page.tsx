import Link from "next/link";
import { apiGet } from "@/lib/api";
import { messages } from "@/lib/messages/en";

type Filament = {
  uuid: string;
  productName: string;
  manufacturerName: string;
  materialCode: string;
  isSyntheticFixture: boolean;
};

export default async function HomePage() {
  const m = messages;
  let filaments: Filament[] = [];
  try {
    filaments = await apiGet<Filament[]>("/api/v1/filaments");
  } catch {
    filaments = [];
  }

  return (
    <div>
      <h1>{m.brand}</h1>
      <p className="muted">{m.tagline}</p>
      <p>{m.home.body}</p>
      <div className="banner-warn">{m.home.fixtureNote}</div>

      <form className="search-row" action="/search" method="get">
        <input
          name="q"
          placeholder={m.home.searchPlaceholder}
          aria-label={m.nav.search}
        />
        <button type="submit">{m.home.searchButton}</button>
      </form>

      <h2>Catalog</h2>
      {filaments.length === 0 ? (
        <p className="muted">
          API unavailable. Start the API on {process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8787"}.
        </p>
      ) : (
        <ul className="list">
          {filaments.map((f) => (
            <li key={f.uuid}>
              <Link href={`/filaments/${f.uuid}`}>
                {f.manufacturerName} {f.productName}
              </Link>{" "}
              <span className="muted">({f.materialCode})</span>
              {f.isSyntheticFixture ? (
                <span className="muted"> — seed catalog</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
