/**
 * Public URLs must not bake a configured deploy domain into QR codes or labels.
 * Prefer the browser's current origin; fall back to a relative path.
 */

export function getBrowserOrigin(): string {
  if (typeof window === "undefined") return "";
  return window.location.origin.replace(/\/$/, "");
}

/** Absolute URL for the current site, or a path-only fallback on the server. */
export function publicAbsoluteUrl(path: string, origin = getBrowserOrigin()): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (!origin) return normalized;
  return `${origin}${normalized}`;
}

/** Domain-independent identity URI (works regardless of where the site is hosted). */
export function variantIdentityUri(variantUuid: string): string {
  return `openfilament://variant/${variantUuid}`;
}

export function variantShortPath(variantUuid: string): string {
  return `/f/${variantUuid}`;
}
