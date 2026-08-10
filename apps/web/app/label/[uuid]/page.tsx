import { QrLabelPanel } from "../../components/qr-label-panel";
import Link from "next/link";
import { getLocaleMessages } from "@/lib/messages";

export default async function LabelPage({
  params,
}: {
  params: Promise<{ uuid: string }>;
}) {
  const { uuid } = await params;
  const { messages } = await getLocaleMessages();
  const l = messages.label;
  return (
    <div className="stack">
      <h1>{l.heading}</h1>
      <p className="muted">
        {l.lead}{" "}
        <Link href={`/variants/${uuid}`}>{l.backToVariant}</Link>
        {" · "}
        <Link href="/scan">{l.scanLink}</Link>
      </p>
      <QrLabelPanel variantUuid={uuid} />
    </div>
  );
}
