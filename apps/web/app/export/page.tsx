import Link from "next/link";
import { ExportForm } from "./export-form";
import { getLocaleMessages } from "@/lib/messages";

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
