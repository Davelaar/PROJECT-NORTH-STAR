"use client";

import {
  LOCALE_COOKIE,
  LOCALE_LABELS,
  LOCALES,
  type Locale,
} from "@/lib/messages/types";
import { useLocale, useMessages } from "./messages-provider";

export function LanguageSwitcher() {
  const locale = useLocale();
  const messages = useMessages();

  function onChange(next: Locale) {
    document.cookie = `${LOCALE_COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
    window.location.reload();
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
