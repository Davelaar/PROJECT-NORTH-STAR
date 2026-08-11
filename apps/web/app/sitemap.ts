import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/metadata";
import { apiGet } from "@/lib/api";

type Manufacturer = { uuid: string; updatedAt?: string };
type Material = { uuid: string; updatedAt?: string };

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
  "/privacy",
  "/support",
  "/cookies",
  "/terms",
  "/security",
  "/trust",
  "/label",
  "/scan",
  "/rfid",
  "/submit",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.6,
  }));

  try {
    const manufacturers = await apiGet<Manufacturer[]>("/api/v1/manufacturers");
    for (const m of manufacturers.slice(0, 5000)) {
      entries.push({
        url: absoluteUrl(`/manufacturers/${m.uuid}`),
        lastModified: m.updatedAt ? new Date(m.updatedAt) : undefined,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  } catch {
    // sitemap remains useful with static routes
  }

  try {
    // Materials endpoint may not exist — ignore failures
    const materials = await apiGet<Material[]>("/api/v1/materials");
    for (const m of materials.slice(0, 500)) {
      entries.push({
        url: absoluteUrl(`/materials/${m.uuid}`),
        lastModified: m.updatedAt ? new Date(m.updatedAt) : undefined,
        changeFrequency: "weekly",
        priority: 0.5,
      });
    }
  } catch {
    // optional
  }

  return entries;
}
