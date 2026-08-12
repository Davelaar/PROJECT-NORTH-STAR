import Link from "next/link";
import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SubmitProfileForm } from "./submit-form";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.submitProfile.heading,
    description: m.submitProfile.lead,
    path: "/submit",
  });
}

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ variantUuid?: string }>;
}) {
  const { messages: m } = await getLocaleMessages();
  const s = m.submitProfile;
  const sp = await searchParams;

  return (
    <div className="stack">
      <h1>{s.heading}</h1>
      <p className="home-lead">{s.lead}</p>
      <SubmitProfileForm initialVariantUuid={sp.variantUuid ?? ""} />
      <p>
        <Link href="/contribute">{m.nav.contribute}</Link>
        {" · "}
        <Link href="/">{m.common.backHome}</Link>
      </p>
    </div>
  );
}
