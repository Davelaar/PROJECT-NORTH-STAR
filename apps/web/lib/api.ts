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

function cookieValue(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${name}=`;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof Error && /\bAPI 401\b/.test(err.message);
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    next: { revalidate: 0 },
    cache: "no-store",
    credentials: "include",
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
  const csrf = cookieValue("of_csrf");
  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "content-type": "application/json",
      ...(csrf ? { "x-csrf-token": decodeURIComponent(csrf) } : {}),
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
