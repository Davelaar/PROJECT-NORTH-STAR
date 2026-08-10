/**
 * Browser: same-origin (empty) so Next rewrites proxy to the API.
 * Server (RSC): talk to the API process directly.
 */
export function getApiBase(): string {
  if (typeof window === "undefined") {
    const internal =
      process.env.API_INTERNAL_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      "http://127.0.0.1:8787";
    return internal.replace(/\/$/, "");
  }
  const pub = process.env.NEXT_PUBLIC_API_URL;
  if (pub && pub.length > 0) return pub.replace(/\/$/, "");
  return "";
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    next: { revalidate: 0 },
    cache: "no-store",
    headers: token ? { authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  token?: string,
): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}
