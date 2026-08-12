"use client";

import {
  LOCALE_COOKIE,
  LOCALE_LABELS,
  LOCALES,
  type Locale,
} from "@/lib/messages/types";
import { localizedPath, stripLocalePrefix } from "@/lib/i18n/routing";
import { useLocale, useMessages } from "./messages-provider";

export function LanguageSwitcher() {
  const locale = useLocale();
  const messages = useMessages();

  function onChange(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
    const bare = stripLocalePrefix(window.location.pathname);
    const target = localizedPath(next, bare);
    const nextUrl = `${target}${window.location.search}${window.location.hash}`;
    if (nextUrl === `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      window.location.reload();
      return;
    }
    window.location.assign(nextUrl);
  }

  return (
    <label className="language-switcher">
      <span className="visually-hidden">{messages.nav.language}</span>
      <select
        value={locale}
        onChange={(e) => onChange(e.target.value as Locale)}
        aria-label={messages.nav.language}
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
