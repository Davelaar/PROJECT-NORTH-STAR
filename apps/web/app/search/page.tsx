import Link from "next/link";
import { apiGet } from "@/lib/api";
import { messages } from "@/lib/messages/en";

type SearchResult = {
  entityType: string;
  entityUuid: string;
  title: string;
  score: number;
};

function hrefFor(entityType: string, uuid: string): string {
  switch (entityType) {
    case "manufacturer":
      return `/manufacturers/${uuid}`;
    case "filament_product":
      return `/filaments/${uuid}`;
    case "filament_variant":
      return `/variants/${uuid}`;
    case "printer":
      return `/printers/${uuid}`;
    default:
      return `/search?q=${uuid}`;
  }
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const m = messages;
  let results: SearchResult[] = [];
  if (q.trim()) {
    try {
      const data = await apiGet<{ results: SearchResult[] }>(
        `/api/v1/search?q=${encodeURIComponent(q)}`,
      );
      results = data.results;
    } catch {
      results = [];
    }
  }

  return (
    <div>
      <h1>{m.search.heading}</h1>
      <form className="search-row" action="/search" method="get">
        <input name="q" defaultValue={q} aria-label={m.nav.search} />
        <button type="submit">{m.home.searchButton}</button>
      </form>
      {!q.trim() ? (
        <p className="muted">{m.search.empty}</p>
      ) : results.length === 0 ? (
        <p className="muted">{m.search.noResults}</p>
      ) : (
        <ul className="list">
          {results.map((r) => (
            <li key={`${r.entityType}:${r.entityUuid}`}>
              <Link href={hrefFor(r.entityType, r.entityUuid)}>{r.title}</Link>
              <span className="muted"> — {r.entityType}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
