import Link from "next/link";
import { getLocaleMessages } from "@/lib/messages";
import { SubmitProfileForm } from "./submit-form";

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
