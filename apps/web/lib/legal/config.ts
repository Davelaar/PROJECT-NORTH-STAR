/**
 * Legal / privacy configuration.
 * Owner-supplied fields use explicit placeholders until env is set.
 * Production builds warn when placeholders remain (see docs/PRODUCTION_LAUNCH_CHECKLIST.md).
 */

export const CONSENT_VERSION = process.env.NEXT_PUBLIC_CONSENT_VERSION ?? "2026-08-10";
export const CONTRIBUTION_TERMS_VERSION =
  process.env.NEXT_PUBLIC_CONTRIBUTION_TERMS_VERSION ?? "2026-08-10";

const PLACEHOLDER = (key: string) => `[OWNER MUST PROVIDE ${key}]`;

export type LegalConfig = {
  ownerName: string;
  privacyEmail: string;
  securityEmail: string;
  hostingRegion: string;
  hostingProvider: string;
  supervisoryAuthority: string;
  supervisoryAuthorityUrl: string;
  publicBaseUrl: string;
  effectiveDate: string;
  placeholdersRemaining: string[];
};

export function getLegalConfig(): LegalConfig {
  const ownerName =
    process.env.NEXT_PUBLIC_LEGAL_OWNER_NAME || PLACEHOLDER("LEGAL NAME");
  const privacyEmail =
    process.env.NEXT_PUBLIC_LEGAL_PRIVACY_EMAIL ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    PLACEHOLDER("PRIVACY CONTACT EMAIL");
  const securityEmail =
    process.env.NEXT_PUBLIC_LEGAL_SECURITY_EMAIL || privacyEmail;
  const hostingRegion =
    process.env.NEXT_PUBLIC_LEGAL_HOSTING_REGION ||
    PLACEHOLDER("HOSTING REGION");
  const hostingProvider =
    process.env.NEXT_PUBLIC_LEGAL_HOSTING_PROVIDER ||
    PLACEHOLDER("HOSTING PROVIDER");
  const supervisoryAuthority =
    process.env.NEXT_PUBLIC_LEGAL_SUPERVISORY_AUTHORITY ||
    "Autoriteit Persoonsgegevens (NL)";
  const supervisoryAuthorityUrl =
    process.env.NEXT_PUBLIC_LEGAL_SUPERVISORY_URL ||
    "https://www.autoriteitpersoonsgegevens.nl/";
  const publicBaseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://openfilament.nl";
  const effectiveDate =
    process.env.NEXT_PUBLIC_LEGAL_EFFECTIVE_DATE || "2026-08-10";

  const placeholdersRemaining: string[] = [];
  for (const [key, value] of Object.entries({
    LEGAL_OWNER_NAME: ownerName,
    LEGAL_PRIVACY_EMAIL: privacyEmail,
    LEGAL_HOSTING_REGION: hostingRegion,
    LEGAL_HOSTING_PROVIDER: hostingProvider,
  })) {
    if (value.startsWith("[OWNER MUST PROVIDE")) {
      placeholdersRemaining.push(key);
    }
  }

  return {
    ownerName,
    privacyEmail,
    securityEmail,
    hostingRegion,
    hostingProvider,
    supervisoryAuthority,
    supervisoryAuthorityUrl,
    publicBaseUrl,
    effectiveDate,
    placeholdersRemaining,
  };
}

export function legalHasPlaceholders(): boolean {
  return getLegalConfig().placeholdersRemaining.length > 0;
}
