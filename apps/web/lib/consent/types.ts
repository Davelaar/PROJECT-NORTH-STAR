export const CONSENT_STORAGE_KEY = "of_consent_v1";
export const CONSENT_COOKIE_NAME = "of_consent";

export type ConsentCategories = {
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  marketing: boolean;
};

export type ConsentRecord = {
  version: string;
  categories: ConsentCategories;
  timestamp: string;
  locale: string;
};

export const DEFAULT_DENIED: ConsentCategories = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

export function parseConsent(raw: string | null | undefined): ConsentRecord | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (!parsed?.version || !parsed?.categories || !parsed?.timestamp) return null;
    return {
      version: parsed.version,
      timestamp: parsed.timestamp,
      locale: parsed.locale || "en",
      categories: {
        necessary: true,
        preferences: Boolean(parsed.categories.preferences),
        analytics: Boolean(parsed.categories.analytics),
        marketing: Boolean(parsed.categories.marketing),
      },
    };
  } catch {
    return null;
  }
}

export function isConsentCurrent(
  record: ConsentRecord | null,
  version: string,
): boolean {
  return Boolean(record && record.version === version);
}

/** Clear first-party GA cookies after withdrawal. */
export function clearAnalyticsCookies(): void {
  if (typeof document === "undefined") return;
  const cookies = document.cookie.split(";");
  for (const part of cookies) {
    const name = part.split("=")[0]?.trim() ?? "";
    if (name === "_ga" || name.startsWith("_ga_") || name === "_gid" || name === "_gat") {
      document.cookie = `${name}=;path=/;max-age=0;SameSite=Lax`;
      document.cookie = `${name}=;path=/;domain=${location.hostname};max-age=0;SameSite=Lax`;
      const parts = location.hostname.split(".");
      if (parts.length > 1) {
        const root = `.${parts.slice(-2).join(".")}`;
        document.cookie = `${name}=;path=/;domain=${root};max-age=0;SameSite=Lax`;
      }
    }
  }
}
