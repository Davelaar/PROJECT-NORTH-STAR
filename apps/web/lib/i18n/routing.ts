import type { Locale } from "@/lib/messages/types";
import { LOCALES } from "@/lib/messages/types";

/** Set by middleware from the URL prefix; read in `getLocale()`. */
export const LOCALE_HEADER = "x-of-locale";

/** Locales that appear as a URL prefix (`/nl/...`). English stays unprefixed. */
export const PREFIXED_LOCALES = LOCALES.filter((l): l is Exclude<Locale, "en"> => l !== "en");

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}

export function isPrefixedLocale(
  value: string | undefined | null,
): value is Exclude<Locale, "en"> {
  return !!value && (PREFIXED_LOCALES as string[]).includes(value);
}

/** Strip a leading locale prefix from a pathname (`/nl/search` → `/search`). */
export function stripLocalePrefix(pathname: string): string {
  const parts = pathname.split("/");
  if (parts.length >= 2 && isPrefixedLocale(parts[1])) {
    const rest = `/${parts.slice(2).join("/")}`;
    return rest === "/" ? "/" : rest.replace(/\/+$/, "") || "/";
  }
  return pathname || "/";
}

/** Build a locale-aware path. English is unprefixed (`/search`); others `/nl/search`. */
export function localizedPath(locale: Locale, path: string): string {
  const normalized = !path || path === "/" ? "/" : path.startsWith("/") ? path : `/${path}`;
  if (locale === "en") return normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

export function preferredLocaleFromAcceptLanguage(header: string | null): Locale {
  if (!header) return "en";

  const matches = header
    .split(",")
    .map((entry, index) => {
      const [rawTag, ...params] = entry.trim().split(";");
      const qParam = params.find((p) => p.trim().startsWith("q="));
      const q = qParam ? Number(qParam.trim().slice(2)) : 1;
      const primary = rawTag.toLowerCase().split("-")[0];
      return {
        index,
        locale: primary === "zh" ? "zh" : primary,
        q: Number.isFinite(q) ? q : 0,
      };
    })
    .filter((m): m is { index: number; locale: Locale; q: number } => isLocale(m.locale) && m.q > 0)
    .sort((a, b) => b.q - a.q || a.index - b.index);

  return matches[0]?.locale ?? "en";
}

/** BCP 47 / hreflang code (zh → zh-Hans). */
export function hreflangCode(locale: Locale): string {
  return locale === "zh" ? "zh-Hans" : locale;
}

/** HTML `lang` attribute value. */
export function htmlLang(locale: Locale): string {
  return hreflangCode(locale);
}

/** Open Graph locale tags. */
export function ogLocale(locale: Locale): string {
  const map: Record<Locale, string> = {
    en: "en_US",
    nl: "nl_NL",
    de: "de_DE",
    fr: "fr_FR",
    es: "es_ES",
    pt: "pt_PT",
    ru: "ru_RU",
    uk: "uk_UA",
    zh: "zh_CN",
  };
  return map[locale];
}

export function contentLanguage(locale: Locale): string {
  return hreflangCode(locale);
}

/** Paths that must never be locale-prefixed or rewritten. */
export function isLocaleExemptPath(pathname: string): boolean {
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/of-metrics/") ||
    pathname === "/openapi.json" ||
    pathname === "/sitemap.xml" ||
    pathname === "/robots.txt" ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/images/") ||
    pathname.startsWith("/icons/")
  ) {
    return true;
  }
  // Static files with extensions
  if (/\.[a-zA-Z0-9]{2,8}$/.test(pathname)) return true;
  return false;
}

const BOT_UA =
  /googlebot|bingbot|duckduckbot|baiduspider|yandexbot|applebot|facebookexternalhit|twitterbot|linkedinbot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot/i;

export function isLikelyBot(userAgent: string | null): boolean {
  if (!userAgent) return false;
  return BOT_UA.test(userAgent);
}
