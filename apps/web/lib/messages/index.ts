import { cookies } from "next/headers";
import type { Locale, Messages } from "./types";
import { LOCALES, LOCALE_COOKIE } from "./types";
import { getMessages } from "./catalog";

export type { Locale, Messages } from "./types";
export { LOCALES, LOCALE_LABELS, LOCALE_COOKIE } from "./types";
export { getMessages } from "./catalog";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}

/** Resolve locale from the `of_locale` cookie (server components). */
export async function getLocale(): Promise<Locale> {
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
