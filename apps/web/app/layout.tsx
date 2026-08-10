import type { Metadata } from "next";
import Link from "next/link";
import { messages } from "@/lib/messages/en";
import "./globals.css";

export const metadata: Metadata = {
  title: messages.brand,
  description: messages.tagline,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const m = messages;
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="site-header">
            <Link href="/" className="brand">
              {m.brand}
            </Link>
            <nav className="nav" aria-label="Primary">
              <Link href="/">{m.nav.home}</Link>
              <Link href="/search">{m.nav.search}</Link>
              <Link href="/submit">Submit</Link>
              <Link href="/import">Import</Link>
              <Link href="/export">{m.nav.export}</Link>
              <Link href="/rfid">{m.nav.rfid}</Link>
              <Link href="/docs/api">{m.nav.docsApi}</Link>
              <Link href="/me">Me</Link>
              <Link href="/login">{m.nav.login}</Link>
            </nav>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
