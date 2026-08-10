import type { Metadata } from "next";
import { getLegalConfig } from "@/lib/legal/config";

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
    title: opts.title,
    description: opts.description,
    alternates: {
      canonical: url,
      languages,
    },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "OpenFilament",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: "OpenFilament" }],
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
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
