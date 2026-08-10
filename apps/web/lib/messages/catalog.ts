import type { Locale, Messages } from "./types";
import { messages as en } from "./en";
import { messages as nl } from "./nl";
import { messages as fr } from "./fr";
import { messages as de } from "./de";
import { messages as es } from "./es";
import { messages as pt } from "./pt";
import { messages as ru } from "./ru";
import { messages as uk } from "./uk";
import { messages as zh } from "./zh";

const byLocale: Record<Locale, Messages> = {
  en,
  nl,
  fr,
  de,
  es,
  pt,
  ru,
  uk,
  zh,
};

export function getMessages(locale: Locale = "en"): Messages {
  return byLocale[locale] ?? en;
}
