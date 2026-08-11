"use client";

import Link from "next/link";
import { openCookieSettings } from "./consent-manager";
import { useMessages } from "./messages-provider";
import { legalHasPlaceholders } from "@/lib/legal/config";

export function SiteFooter() {
  const m = useMessages();
  const showLegalWarn =
    process.env.NODE_ENV !== "production" && legalHasPlaceholders();

  return (
    <footer className="site-footer">
      <nav aria-label={m.footer.navAria} className="footer-nav">
        <Link href="/privacy-policy">{m.footer.privacy}</Link>
        <Link href="/support">{m.footer.support}</Link>
        <Link href="/cookies">{m.footer.cookies}</Link>
        <button type="button" className="linkish" onClick={() => openCookieSettings()}>
          {m.footer.cookieSettings}
        </button>
        <Link href="/terms">{m.footer.terms}</Link>
        <Link href="/security">{m.footer.security}</Link>
        <Link href="/trust">{m.footer.trust}</Link>
        <Link href="/my-spools">{m.footer.mySpools}</Link>
        <Link href="/docs/slicers">{m.export.supportedSlicersLink}</Link>
        <Link href="/docs/usage-tracking">{m.nav.usageTracking}</Link>
        <Link href="/compatibility">{m.nav.compatibility}</Link>
        <Link href="/docs/api">{m.nav.docsApi}</Link>
        <Link href="/contribute">{m.nav.contribute}</Link>
      </nav>
      {showLegalWarn ? (
        <p className="legal-placeholder-warn" role="status">
          {m.footer.legalPlaceholderWarn}
        </p>
      ) : null}
      <p className="muted footer-copy">{m.footer.tagline}</p>
    </footer>
  );
}
