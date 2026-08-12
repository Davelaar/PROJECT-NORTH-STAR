import Link from "next/link";
import type { Metadata } from "next";
import { ExportForm } from "./export-form";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getLocaleMessages();
  return buildPageMetadata({
    title: messages.export.heading,
    description: messages.export.body,
    path: "/export",
    noIndex: true,
  });
}

export default async function ExportPage({
  searchParams,
}: {
  searchParams: Promise<{
    profileUuid?: string;
    format?: string;
    printer?: string;
    nozzle?: string;
  }>;
}) {
  const { messages } = await getLocaleMessages();
  const sp = await searchParams;
  return (
    <div>
      <h1>{messages.export.heading}</h1>
      <p>{messages.export.body}</p>
      <section className="panel" aria-labelledby="load-profiles-heading">
        <h2 id="load-profiles-heading">{messages.export.loadProfilesTitle}</h2>
        <p>{messages.export.loadProfilesIntro}</p>
        <ol>
          <li>{messages.export.readyStepOpen.replace("{name}", "Creality Print / OrcaSlicer / PrusaSlicer / Bambu Studio")}</li>
          <li>{messages.export.readyStepImport}</li>
          <li>{messages.export.readyStepPrinter}</li>
          <li>{messages.export.readyStepSelect}</li>
          <li>{messages.export.readyStepMap}</li>
        </ol>
      </section>
      <p>
        <Link href="/docs/slicers">{messages.export.supportedSlicersLink}</Link>
      </p>
      <ExportForm
        initialProfileUuid={sp.profileUuid ?? ""}
        initialFormat={sp.format}
      />
    </div>
  );
}
