import {
  clearAnalyticsCookies,
  CONSENT_COOKIE_NAME,
  CONSENT_STORAGE_KEY,
  DEFAULT_DENIED,
  parseConsent,
  type ConsentCategories,
  type ConsentRecord,
} from "./types";
import { CONSENT_VERSION } from "../legal/config";

export function readConsent(): ConsentRecord | null {
  if (typeof window === "undefined") return null;
  const fromLs = parseConsent(window.localStorage.getItem(CONSENT_STORAGE_KEY));
  if (fromLs) return fromLs;
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${CONSENT_COOKIE_NAME}=`));
  if (!match) return null;
  try {
    return parseConsent(decodeURIComponent(match.split("=").slice(1).join("=")));
  } catch {
    return null;
  }
}

export function writeConsent(
  categories: Omit<ConsentCategories, "necessary"> & { necessary?: true },
  locale: string,
): ConsentRecord {
  const record: ConsentRecord = {
    version: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    locale,
    categories: {
      necessary: true,
      preferences: Boolean(categories.preferences),
      analytics: Boolean(categories.analytics),
      marketing: Boolean(categories.marketing),
    },
  };
  const serialized = JSON.stringify(record);
  window.localStorage.setItem(CONSENT_STORAGE_KEY, serialized);
  // Preference cookie — necessary to remember the choice itself (13 months).
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(serialized)};path=/;max-age=${60 * 60 * 24 * 395};SameSite=Lax`;
  if (!record.categories.analytics) {
    clearAnalyticsCookies();
  }
  window.dispatchEvent(new CustomEvent("of:consent", { detail: record }));
  return record;
}

export function acceptAll(locale: string) {
  return writeConsent(
    { preferences: true, analytics: true, marketing: false },
    locale,
  );
}

export function rejectNonEssential(locale: string) {
  return writeConsent({ ...DEFAULT_DENIED }, locale);
}

/**
 * Opt-out: analytics is on until the visitor explicitly refuses
 * (or saves preferences with analytics off). No stored choice → allowed.
 */
export function analyticsAllowed(record: ConsentRecord | null): boolean {
  if (!record) return true;
  return Boolean(record.categories.analytics);
}
