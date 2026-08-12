"use client";

import { openCookieSettings } from "./consent-manager";
import { useMessages } from "./messages-provider";
import { LocaleLink } from "./locale-link";
import { legalHasPlaceholders } from "@/lib/legal/config";

export function SiteFooter() {
  const m = useMessages();
  const showLegalWarn =
    process.env.NODE_ENV !== "production" && legalHasPlaceholders();

  return (
    <footer className="site-footer">
      <nav aria-label={m.footer.navAria} className="footer-nav">
        <LocaleLink href="/privacy-policy">{m.footer.privacy}</LocaleLink>
        <LocaleLink href="/support">{m.footer.support}</LocaleLink>
        <LocaleLink href="/terms-of-service">{m.footer.terms}</LocaleLink>
        <LocaleLink href="/cookies">{m.footer.cookies}</LocaleLink>
        <button type="button" className="linkish" onClick={() => openCookieSettings()}>
          {m.footer.cookieSettings}
        </button>
        <LocaleLink href="/security">{m.footer.security}</LocaleLink>
        <LocaleLink href="/trust">{m.footer.trust}</LocaleLink>
        <LocaleLink href="/my-spools">{m.footer.mySpools}</LocaleLink>
        <LocaleLink href="/docs/slicers">{m.export.supportedSlicersLink}</LocaleLink>
        <LocaleLink href="/docs/usage-tracking">{m.nav.usageTracking}</LocaleLink>
        <LocaleLink href="/compatibility">{m.nav.compatibility}</LocaleLink>
        <LocaleLink href="/docs/api">{m.nav.docsApi}</LocaleLink>
        <LocaleLink href="/contribute">{m.nav.contribute}</LocaleLink>
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
