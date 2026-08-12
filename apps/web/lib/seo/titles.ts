const BRAND = "OpenFilament";

/** Clip page title for SERP/tab length before branding. */
export function clipForTitle(text: string, max = 52): string {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (trimmed.length <= max) return trimmed;
  const cut = trimmed.slice(0, max);
  const sp = cut.lastIndexOf(" ");
  const minKeep = Math.min(28, Math.floor(max * 0.55));
  return `${(sp > minKeep ? cut.slice(0, sp) : cut).trim()}…`;
}

/** Browser / SERP title: always unique + branded (no double brand). */
export function brandedTitle(pageTitle: string): string {
  const trimmed = clipForTitle(pageTitle.trim());
  if (!trimmed || trimmed === BRAND) return BRAND;
  if (trimmed.endsWith(` · ${BRAND}`) || trimmed.endsWith(` | ${BRAND}`)) {
    return trimmed;
  }
  if (trimmed.includes(BRAND) && trimmed.length <= 65) return trimmed;
  return `${trimmed} · ${BRAND}`;
}

export { BRAND as SEO_BRAND };
