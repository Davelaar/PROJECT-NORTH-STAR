"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { useMessages } from "./messages-provider";
import { LanguageSwitcher } from "./language-switcher";

type NavItem = { href: string; label: string };

export function SiteHeader() {
  const m = useMessages();
  const pathname = usePathname();
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
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="site-header">
      <div className="site-header-bar">
        <Link href="/" className="brand">
          {m.brand}
        </Link>
        <nav className="nav-desktop" aria-label={m.nav.primaryAria}>
          {primary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "nav-active" : undefined}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
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
            <Link
              key={item.href}
              href={item.href}
              className={isActive(item.href) ? "nav-active" : undefined}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
          <div className="nav-mobile-secondary">
            <Link href="/docs/slicers">{m.export.supportedSlicersLink}</Link>
            <Link href="/scan">{m.nav.scan}</Link>
            <Link href="/rfid">{m.nav.rfid}</Link>
            <Link href="/export">{m.export.downloadForSlicer}</Link>
            <Link href="/hardware">{m.nav.hardware}</Link>
            <Link href="/account">{m.nav.me}</Link>
            <Link href="/docs/api">{m.nav.docsApi}</Link>
          </div>
          <LanguageSwitcher />
        </nav>
      ) : null}
    </header>
  );
}
