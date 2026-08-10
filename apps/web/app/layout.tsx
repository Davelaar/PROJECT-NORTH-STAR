import { SiteHeader } from "./components/site-header";
import { MessagesProvider } from "./components/messages-provider";
import { ServiceWorkerRegister } from "./components/sw-register";
import { getLocaleMessages } from "@/lib/messages";
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Open Filament",
  description:
    "Find a tested filament profile for your printer—and identify every spool with QR or RFID.",
  applicationName: "OpenFilament",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "OpenFilament",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d6b56",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, messages: m } = await getLocaleMessages();
  return (
    <html lang={locale}>
      <body>
        <MessagesProvider locale={locale} messages={m}>
          <ServiceWorkerRegister />
          <div className="shell">
            <SiteHeader />
            <main>{children}</main>
          </div>
        </MessagesProvider>
      </body>
    </html>
  );
}
