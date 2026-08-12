/**
 * First-party GA4 collect proxy.
 * Safari / ITP often blocks third-party google-analytics.com; same-origin
 * /of-metrics/g/collect keeps measurement on openfilament.nl.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UPSTREAM = "https://www.google-analytics.com/g/collect";

async function proxyCollect(req: Request): Promise<Response> {
  const incoming = new URL(req.url);
  const target = new URL(UPSTREAM);
  target.search = incoming.search;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const userAgent = req.headers.get("user-agent");
  if (userAgent) headers.set("user-agent", userAgent);
  // GA uses client IP from the connecting peer when possible; forward hints.
  const forwarded = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  if (forwarded) headers.set("x-forwarded-for", forwarded);

  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
    cache: "no-store",
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = Buffer.from(await req.arrayBuffer());
  }

  try {
    const upstream = await fetch(target, init);
    const out = new Headers();
    const upstreamType = upstream.headers.get("content-type");
    if (upstreamType) out.set("content-type", upstreamType);
    out.set("cache-control", "no-store");
    return new Response(upstream.body, {
      status: upstream.status,
      headers: out,
    });
  } catch {
    // Prefer a soft success so beacons are not retried forever client-side.
    return new Response(null, { status: 204, headers: { "cache-control": "no-store" } });
  }
}

export async function GET(req: Request) {
  return proxyCollect(req);
}

export async function POST(req: Request) {
  return proxyCollect(req);
}
