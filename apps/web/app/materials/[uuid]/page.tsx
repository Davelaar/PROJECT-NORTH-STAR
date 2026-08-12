import Link from "next/link";
import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Material = { uuid: string; code: string; name: string; category: string | null };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  const { uuid } = await params;
  try {
    const material = await apiGet<Material>(`/api/v1/materials/${uuid}`);
    return buildPageMetadata({
      title: `${material.name} (${material.code})`,
      description: `${material.name} filament material family on OpenFilament`,
      path: `/materials/${uuid}`,
    });
  } catch {
    return buildPageMetadata({
      title: "Material",
      description: "OpenFilament material",
      path: `/materials/${uuid}`,
      noIndex: true,
    });
  }
}

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { messages } = await getLocaleMessages();
  const { uuid } = await params;
  let material: Material | null = null;
  try {
    material = await apiGet<Material>(`/api/v1/materials/${uuid}`);
  } catch {
    material = null;
  }
  if (!material) {
    return (
      <div>
        <p>{messages.common.error}</p>
        <Link href="/">{messages.common.backHome}</Link>
      </div>
    );
  }
  return (
    <div>
      <h1>{material.name}</h1>
      <p className="muted">{material.code}{material.category ? ` · ${material.category}` : ""}</p>
      <p>
        <Link href={`/search?q=${encodeURIComponent(material.name)}`}>
          {messages.nav.search}
        </Link>
      </p>
    </div>
  );
}
