import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getLocaleMessages } from "@/lib/messages";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { QrScanPanel } from "../components/qr-scan-panel";

export async function generateMetadata(): Promise<Metadata> {
  const { messages: m } = await getLocaleMessages();
  return buildPageMetadata({
    title: m.scan.heading,
    description: m.scan.lead,
    path: "/scan",
  });
}

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
