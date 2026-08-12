import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ uuid: string }>;
}): Promise<Metadata> {
  const { uuid } = await params;
  return buildPageMetadata({
    title: "Filament",
    description: "OpenFilament short link",
    path: `/f/${uuid}`,
    noIndex: true,
  });
}

export default async function ShortVariantPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  redirect(`/variants/${uuid}`);
}
