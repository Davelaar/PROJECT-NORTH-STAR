import { SiteHeader } from "./components/site-header";
import { SiteFooter } from "./components/site-footer";
import { MessagesProvider } from "./components/messages-provider";
import { ServiceWorkerRegister } from "./components/sw-register";
import { ConsentManager } from "./components/consent-manager";
import { getLocaleMessages } from "@/lib/messages";
import { jsonLdScript, absoluteUrl } from "@/lib/seo/metadata";
import { htmlLang, localizedPath } from "@/lib/i18n/routing";
import { gaHeadBootstrapInline, getMeasurementId } from "@/lib/analytics/ga";
import { legalHasPlaceholders, legalMissingSummary } from "@/lib/legal/config";
import type { Viewport } from "next";
import "./globals.css";

export async function generateMetadata() {
  const { messages: m } = await getLocaleMessages();
  return {
    title: {
      default: m.brand,
      template: `%s · ${m.brand}`,
    },
    description: m.tagline,
    applicationName: "OpenFilament",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
      capable: true,
      title: "OpenFilament",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0d6b56",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, messages: m } = await getLocaleMessages();
  const showBuildWarn =
    process.env.NODE_ENV === "production" && legalHasPlaceholders();
  const gaId = getMeasurementId();

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OpenFilament",
    url: absoluteUrl(localizedPath(locale, "/")),
    inLanguage: htmlLang(locale),
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl(localizedPath(locale, "/search"))}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const appLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "OpenFilament",
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Web",
    url: absoluteUrl(localizedPath(locale, "/")),
    inLanguage: htmlLang(locale),
    offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
  };

  return (
    <html lang={htmlLang(locale)}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript([websiteLd, appLd])}
        />
        {gaId ? (
          <script
            dangerouslySetInnerHTML={{ __html: gaHeadBootstrapInline(gaId) }}
          />
        ) : null}
      </head>
      <body>
        <MessagesProvider locale={locale} messages={m}>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <ServiceWorkerRegister />
          <ConsentManager />
          <div className="shell">
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
          </div>
          {showBuildWarn ? (
            <div className="legal-placeholder-warn legal-banner" role="status">
              {legalMissingSummary()} See docs/PRODUCTION_LAUNCH_CHECKLIST.md
            </div>
          ) : null}
        </MessagesProvider>
      </body>
    </html>
  );
}
