import { cookies, headers } from "next/headers";
import type { Locale, Messages } from "./types";
import { LOCALES, LOCALE_COOKIE } from "./types";
import { getMessages } from "./catalog";
import { isLocale, LOCALE_HEADER } from "@/lib/i18n/routing";

export type { Locale, Messages } from "./types";
export { LOCALES, LOCALE_LABELS, LOCALE_COOKIE } from "./types";
export { getMessages } from "./catalog";
export { isLocale } from "@/lib/i18n/routing";

/**
 * Resolve locale: URL prefix (middleware header) wins, then cookie, else English.
 */
export async function getLocale(): Promise<Locale> {
  const h = await headers();
  const fromPath = h.get(LOCALE_HEADER);
  if (isLocale(fromPath)) return fromPath;
  const jar = await cookies();
  const raw = jar.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : "en";
}

export async function getLocaleMessages(): Promise<{
  locale: Locale;
  messages: Messages;
}> {
  const locale = await getLocale();
  return { locale, messages: getMessages(locale) };
}
