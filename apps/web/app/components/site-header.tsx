"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { stripLocalePrefix } from "@/lib/i18n/routing";
import { useMessages } from "./messages-provider";
import { LanguageSwitcher } from "./language-switcher";
import { LocaleLink } from "./locale-link";

type NavItem = { href: string; label: string };

export function SiteHeader() {
  const m = useMessages();
  const pathname = usePathname();
  const barePath = stripLocalePrefix(pathname);
  const [open, setOpen] = useState(false);
  const menuId = useId();

  const primary: NavItem[] = [
    { href: "/search", label: m.nav.filaments },
    { href: "/identify", label: m.nav.identify },
    { href: "/my-spools", label: m.nav.mySpools },
    { href: "/submit", label: m.nav.submit },
    { href: "/contribute", label: m.nav.contribute },
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  function isActive(href: string) {
    if (href === "/") return barePath === "/";
    return barePath === href || barePath.startsWith(`${href}/`);
  }

  return (
    <header className="site-header">
      <div className="site-header-bar">
        <LocaleLink href="/" className="brand">
          {m.brand}
        </LocaleLink>
        <nav className="nav-desktop" aria-label={m.nav.primaryAria}>
          {primary.map((item) => (
            <LocaleLink
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "nav-active" : undefined}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </LocaleLink>
          ))}
          <LanguageSwitcher />
        </nav>
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? m.nav.closeMenu : m.nav.openMenu}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="nav-toggle-bars" aria-hidden="true" />
        </button>
      </div>
      {open ? (
        <nav id={menuId} className="nav-mobile" aria-label={m.nav.primaryAria}>
          {primary.map((item) => (
            <LocaleLink
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "nav-active" : undefined}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </LocaleLink>
          ))}
          <div className="nav-mobile-secondary">
            <LocaleLink href="/docs/slicers">{m.export.supportedSlicersLink}</LocaleLink>
            <LocaleLink href="/docs/usage-tracking">{m.nav.usageTracking}</LocaleLink>
            <LocaleLink href="/compatibility">{m.nav.compatibility}</LocaleLink>
            <LocaleLink href="/scan">{m.nav.scan}</LocaleLink>
            <LocaleLink href="/rfid">{m.nav.rfid}</LocaleLink>
            <LocaleLink href="/export">{m.export.downloadForSlicer}</LocaleLink>
            <LocaleLink href="/hardware">{m.nav.hardware}</LocaleLink>
            <LocaleLink href="/account">{m.nav.me}</LocaleLink>
            <LocaleLink href="/docs/api">{m.nav.docsApi}</LocaleLink>
          </div>
          <LanguageSwitcher />
        </nav>
      ) : null}
    </header>
  );
}
