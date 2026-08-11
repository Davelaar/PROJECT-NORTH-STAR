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

/** Read of_csrf for X-CSRF-Token (cookie may already be decoded by the browser). */
export function readCsrfToken(): string | undefined {
  const raw = cookieValue("of_csrf");
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function csrfHeaders(): Record<string, string> {
  const token = readCsrfToken();
  return token ? { "x-csrf-token": token } : {};
}

export function isUnauthorizedError(err: unknown): boolean {
  return err instanceof Error && /\bAPI 401\b/.test(err.message);
}

export function isCsrfError(err: unknown): boolean {
  return (
    err instanceof Error &&
    (/csrf_required/i.test(err.message) ||
      /CSRF token is required/i.test(err.message))
  );
}

/** Ensure of_csrf exists for cookie sessions (mint via API if missing). */
export async function ensureCsrf(): Promise<string | undefined> {
  const existing = readCsrfToken();
  if (existing) return existing;
  if (typeof window === "undefined") return undefined;
  try {
    const res = await fetch(`${getApiBase()}/api/v1/auth/csrf`, {
      credentials: "include",
      cache: "no-store",
    });
    if (!res.ok) return undefined;
    const data = (await res.json()) as { csrf?: string };
    return data.csrf ?? readCsrfToken();
  } catch {
    return undefined;
  }
}

/** Same-origin fetch with credentials + CSRF on mutating methods. */
export async function apiFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  const method = (init.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD" && method !== "OPTIONS") {
    const token = (await ensureCsrf()) ?? readCsrfToken();
    if (token && !headers.has("x-csrf-token")) {
      headers.set("x-csrf-token", token);
    }
  }
  return fetch(`${getApiBase()}${path}`, {
    ...init,
    credentials: init.credentials ?? "include",
    headers,
  });
}

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await apiFetch(path, {
    method: "GET",
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
  const res = await apiFetch(path, {
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
