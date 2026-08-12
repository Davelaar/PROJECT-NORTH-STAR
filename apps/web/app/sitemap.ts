import type { MetadataRoute } from "next";
import { absoluteUrl, languageAlternates } from "@/lib/seo/metadata";
import { apiGet } from "@/lib/api";

type UuidRow = { uuid: string; updatedAt?: string };

const STATIC_PATHS = [
  "/",
  "/search",
  "/identify",
  "/contribute",
  "/hardware",
  "/docs/slicers",
  "/docs/slicers/creality-print",
  "/docs/slicers/orcaslicer",
  "/docs/slicers/prusaslicer",
  "/docs/slicers/bambu-studio",
  "/docs/usage-tracking",
  "/docs/usage-tracking/orcaslicer",
  "/docs/usage-tracking/bambu-studio",
  "/docs/usage-tracking/creality-print",
  "/docs/usage-tracking/prusaslicer",
  "/docs/usage-tracking/moonraker-klipper",
  "/docs/usage-tracking/octoprint",
  "/compatibility",
  "/docs/api",
  "/privacy-policy",
  "/support",
  "/cookies",
  "/terms-of-service",
  "/security",
  "/trust",
  "/label",
  "/scan",
  "/rfid",
  "/submit",
  "/shop",
  "/shop/filament",
  "/shop/hardware",
  "/shop/prints",
];

function entry(
  path: string,
  opts: {
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
    lastModified?: Date;
  } = {},
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(path),
    changeFrequency: opts.changeFrequency ?? "weekly",
    priority: opts.priority ?? 0.6,
    lastModified: opts.lastModified,
    alternates: {
      languages: languageAlternates(path),
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) =>
    entry(path, {
      changeFrequency: path === "/" || path === "/contribute" ? "daily" : "weekly",
      priority:
        path === "/"
          ? 1
          : path === "/contribute" || path === "/search"
            ? 0.9
            : path === "/submit"
              ? 0.8
              : 0.6,
    }),
  );

  try {
    const manufacturers = await apiGet<UuidRow[]>("/api/v1/manufacturers");
    for (const m of manufacturers.slice(0, 5000)) {
      entries.push(
        entry(`/manufacturers/${m.uuid}`, {
          lastModified: m.updatedAt ? new Date(m.updatedAt) : undefined,
          priority: 0.5,
        }),
      );
    }
  } catch {
    // sitemap remains useful with static routes
  }

  try {
    const filaments = await apiGet<UuidRow[]>("/api/v1/filaments");
    for (const f of filaments.slice(0, 40_000)) {
      entries.push(
        entry(`/filaments/${f.uuid}`, {
          lastModified: f.updatedAt ? new Date(f.updatedAt) : undefined,
          priority: 0.7,
        }),
      );
    }
  } catch {
    // optional catalog expansion
  }

  try {
    const variants = await apiGet<UuidRow[]>("/api/v1/variants");
    for (const v of variants.slice(0, 50_000)) {
      entries.push(
        entry(`/variants/${v.uuid}`, {
          lastModified: v.updatedAt ? new Date(v.updatedAt) : undefined,
          priority: 0.75,
        }),
      );
    }
  } catch {
    // optional
  }

  try {
    const materials = await apiGet<UuidRow[]>("/api/v1/materials");
    for (const m of materials.slice(0, 2000)) {
      entries.push(
        entry(`/materials/${m.uuid}`, {
          lastModified: m.updatedAt ? new Date(m.updatedAt) : undefined,
          priority: 0.45,
        }),
      );
    }
  } catch {
    // optional
  }

  try {
    const printers = await apiGet<UuidRow[]>("/api/v1/printers");
    for (const p of printers.slice(0, 10_000)) {
      entries.push(
        entry(`/printers/${p.uuid}`, {
          lastModified: p.updatedAt ? new Date(p.updatedAt) : undefined,
          priority: 0.45,
        }),
      );
    }
  } catch {
    // optional
  }

  return entries;
}
