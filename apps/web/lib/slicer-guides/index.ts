import type { Locale } from "@/lib/messages/types";
import { guidesEn, type GuidesBundle } from "./en";

const cache: Partial<Record<Locale, GuidesBundle>> = { en: guidesEn };

export async function getSlicerGuides(locale: Locale): Promise<GuidesBundle> {
  if (cache[locale]) return cache[locale]!;
  try {
    const mod = await import(`./${locale}.ts`);
    const bundle = (mod.guides ?? mod.guidesEn ?? mod.default) as GuidesBundle;
    cache[locale] = bundle;
    return bundle;
  } catch {
    // Locales without a full guide pack still need complete pages — fall back
    // only when the locale module is missing during rollout.
    return guidesEn;
  }
}

export type { GuidesBundle, SlicerGuide, GuideBlock, GuideSection } from "./en";
