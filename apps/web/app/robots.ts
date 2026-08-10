import type { MetadataRoute } from "next";
import { siteBaseUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  const base = siteBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/me",
          "/account",
          "/login",
          "/admin",
          "/my-spools",
          "/api/",
          "/export",
          "/import",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
