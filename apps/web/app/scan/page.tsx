import Link from "next/link";
import { Suspense } from "react";
import { getLocaleMessages } from "@/lib/messages";
import { QrScanPanel } from "../components/qr-scan-panel";

export default async function ScanPage() {
  const { messages: m } = await getLocaleMessages();
  return (
    <div className="stack">
      <h1>{m.scan.heading}</h1>
      <p className="muted">
        {m.scan.lead}{" "}
        <Link href="/search">{m.scan.searchInstead}</Link>
      </p>
      <Suspense fallback={<p className="muted">{m.common.loading}</p>}>
        <QrScanPanel />
      </Suspense>
    </div>
  );
}
