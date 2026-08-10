import { redirect } from "next/navigation";

export default async function ShortVariantPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  redirect(`/variants/${uuid}`);
}
