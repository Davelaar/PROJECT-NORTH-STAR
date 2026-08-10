import { ExportForm } from "./export-form";
import { messages } from "@/lib/messages/en";

export default async function ExportPage({
  searchParams,
}: {
  searchParams: Promise<{ profileUuid?: string }>;
}) {
  const { profileUuid = "" } = await searchParams;
  return (
    <div>
      <h1>{messages.export.heading}</h1>
      <p>{messages.export.body}</p>
      <ExportForm initialProfileUuid={profileUuid} />
    </div>
  );
}
