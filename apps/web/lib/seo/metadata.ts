import type { Metadata } from "next";
import { getLegalConfig } from "@/lib/legal/config";
import type { Locale } from "@/lib/messages/types";
import { LOCALES } from "@/lib/messages/types";
import { getLocale } from "@/lib/messages";
import {
  hreflangCode,
  localizedPath,
  ogLocale,
} from "@/lib/i18n/routing";
import { brandedTitle, SEO_BRAND } from "./titles";

export { brandedTitle, clipForTitle } from "./titles";

const FALLBACK_OG = "/images/og-default.jpg";

export function siteBaseUrl(): string {
  return getLegalConfig().publicBaseUrl.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const base = siteBaseUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

/** hreflang map for a logical (unprefixed) path. */
export function languageAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    languages[hreflangCode(locale)] = absoluteUrl(localizedPath(locale, path));
  }
  languages["x-default"] = absoluteUrl(localizedPath("en", path));
  return languages;
}

export async function buildPageMetadata(opts: {
  title: string;
  description: string;
  /** Logical path without locale prefix, e.g. `/identify`. */
  path: string;
  noIndex?: boolean;
  imagePath?: string;
  locale?: Locale;
}): Promise<Metadata> {
  const locale = opts.locale ?? (await getLocale());
  const localized = localizedPath(locale, opts.path);
  const url = absoluteUrl(localized);
  const image = absoluteUrl(opts.imagePath ?? FALLBACK_OG);
  const title = brandedTitle(opts.title);
  const description = opts.description.trim().slice(0, 160);
  const languages = languageAlternates(opts.path);
  const alternateLocale = LOCALES.filter((l) => l !== locale).map(ogLocale);

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SEO_BRAND,
      locale: ogLocale(locale),
      alternateLocale,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: SEO_BRAND }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    other: {
      language: hreflangCode(locale),
    },
  };
}

export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}
