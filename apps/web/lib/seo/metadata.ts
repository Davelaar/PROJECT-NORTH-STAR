import type { Metadata } from "next";
import { getLegalConfig } from "@/lib/legal/config";
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

export function buildPageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  imagePath?: string;
  locale?: string;
}): Metadata {
  const url = absoluteUrl(opts.path);
  const image = absoluteUrl(opts.imagePath ?? FALLBACK_OG);
  const title = brandedTitle(opts.title);
  const description = opts.description.trim().slice(0, 160);
  const languages: Record<string, string> = {
    en: url,
    nl: url,
    fr: url,
    de: url,
    es: url,
    pt: url,
    ru: url,
    uk: url,
    "zh-Hans": url,
    "x-default": url,
  };

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
  };
}

export function jsonLdScript(data: Record<string, unknown> | Record<string, unknown>[]) {
  return {
    __html: JSON.stringify(data).replace(/</g, "\\u003c"),
  };
}
