import Link from "next/link";
import { apiGet } from "@/lib/api";
import { messages } from "@/lib/messages/en";

type Material = { uuid: string; code: string; name: string; category: string | null };

export default async function MaterialPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
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
          Search filaments
        </Link>
      </p>
    </div>
  );
}
